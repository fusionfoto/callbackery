/* ************************************************************************
   Copyright: 2013 OETIKER+PARTNER AG
   License:   GPLv3 or later
   Authors:   Tobi Oetiker <tobi@oetiker.ch>, Fritz Zaucker <fritz.zaucker@oetiker.ch>
   Utf8Check: äöü
************************************************************************ */

/**
 * Abstract visualization widget.
 */
qx.Class.define("callbackery.ui.Screen", {
    extend : qx.ui.container.Composite,
    /**
     * Create a page for the View Tab with the given title
     *
     * @param vizWidget {Widget} visualization widget to embed
     */
    construct : function(cfg,getParentFormDataCallBack,extraAction) {
        this.base(arguments,new qx.ui.layout.Grow());
        this.__cfg = cfg;
        this.__getParentFormDataCallBack =  getParentFormDataCallBack;
        this.__extraAction = extraAction;
        switch (cfg.instanciationMode) {
            case 'onStartup':
                this.instanciatePlugin();
                break;
            case 'onTabSelection':
                this.addListenerOnce('appear',this.instanciatePlugin,this);
                break;
            default:
                console.log('ERROR unknown instanciationMode '+cfg.instanciationMode)
        });
    },

    events: {
        actionResponse: 'qx.event.type.Data'
    },
    members: {
        __extraAction: null,
        __getParentFormDataCallBack: null,
        __cfg: null,
        instanciatePlugin: function(){
            var rpc = callbackery.data.Server.getInstance();
            var pluginMap = callbackery.ui.Plugins.getInstance().getPlugins();
            var that = this;
            var cfg = this.__cfg;
            var getParentFormDataCallBack = this.__getParentFormDataCallBack;
            var extraAction = this.__extraAction;
            rpc.callAsyncSmart(function(pluginConfig){
                if (extraAction && pluginConfig.action){
                    pluginConfig.action.push(extraAction);
                }
                pluginConfig['name'] = cfg.name;
                var type = pluginConfig.type;
                if (type in pluginMap) {
                    var content = pluginMap[type](pluginConfig,getParentFormDataCallBack);
                    content.addListener('actionResponse',function(e){
                        that.fireDataEvent('actionResponse',e.getData());
                    });
                    // track visibility changes in the screen widget
                    content.addListener('changeVisiblity',function(){
                        this.setVisibility(content.getVisibility());
                    },that);
                    that.add(content);
                }
                else {
                    that.debug('Invalid plugin type:"' + type + '"');
                }
            },'getPluginConfig',cfg.name,getParentFormDataCallBack ? getParentFormDataCallBack() : null);
        }
    }

});
