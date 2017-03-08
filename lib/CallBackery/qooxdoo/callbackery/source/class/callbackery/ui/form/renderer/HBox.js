/* ************************************************************************
   Copyright: 2009 OETIKER+PARTNER AG
   License:   GPLv3 or later
   Authors:   Tobi Oetiker <tobi@oetiker.ch>
   Utf8Check: äöü
************************************************************************ */

/**
 * A form renderer returning a result ready for integration into a
 * toolbar.
 */

qx.Class.define("callbackery.ui.form.renderer.HBox", {
    extend : qx.ui.form.renderer.AbstractRenderer,

    /**
     * @param form {Object} form handle
     */
    construct : function(form) {
        var layout = new qx.ui.layout.HBox(2);
        this._setLayout(layout);
        this.base(arguments, form);
    },

    members : {
        /**
         * Add items to the form
         *
         * @param items {Array} items
         * @param names {Array} names of items
         * @param title {String} not used
         * @return {void}
         */
        addItems : function(items,names,title,itemOptions,headerOptions){
            // add a 'header'
            if (title != null) {
                var header = new qx.ui.basic.Label(title).set({
                    alignY       : 'middle',
                    marginLeft  : 8,
                    marginRight : 4,
                    rich : true
                });
                if (headerOptions != null && headerOptions.note != null) {
                    header.setToolTipText(headerOptions.note)
                }
                this._add(header);
            }

            for (var i=0; i<items.length; i++) {
                var label = new qx.ui.basic.Label(names[i]).set({
                    alignY       : 'middle',
                    marginLeft  : 4,
                    marginRight : 2
                });

                this._add(label);
                var item = items[i];
                label.setBuddy(item);

                if (item instanceof qx.ui.form.RadioGroup) {
                    item = this._createWidgetForRadioGroup(item);
                }

                item.set({
                    alignY     : 'middle',
                    allowGrowY : false,
                    marginLeft : 2,
                    marginRight: 4
                });

                if (itemOptions != null && itemOptions[i] != null && itemOptions[i].note ){
                    item.setToolTipText(itemOptions[i].note);
                }
                this._add(item);
            }
        },


        /**
         * Public Methos for adding a button
         *
         * @param button {Widget} a button widget
         * @return {void}
         */
        addButton : function(button) {
            this._add(button);
        },


        /**
         * public Method for getting the layout.
         *
         * @return {Layout} the layout
         */
        getLayout : function() {
            return this._getLayout();
        }
    }
});
