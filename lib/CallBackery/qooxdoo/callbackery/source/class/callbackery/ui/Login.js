/* ************************************************************************

   Copyrigtht: OETIKER+PARTNER AG
   License:    GPLv3 or Later
   Authors:    Tobias Oetiker
   Utf8Check:  äöü

************************************************************************ */

/**
 * @asset(qx/icon/${qx.icontheme}/16/actions/dialog-ok.png)
 * @asset(qx/icon/${qx.icontheme}/64/status/dialog-password.png)
 */

/**
 * Login Popup that performs authentication.
 */
qx.Class.define("callbackery.ui.Login", {
    extend : qx.ui.window.Window,
    type : 'singleton',

    construct : function() {
        this.base(arguments, this.tr("Login"));
        // some browsers will be so nice to save the
        // content of the form elements if they appear inside a form AND
        // the form has a name (firefox comes to mind).
        var el = this.getContentElement();
        var form = new qx.html.Element('form',null,{name: 'cbLoginform', autocomplete: 'on'});
        form.insertBefore(el);
        el.insertInto(form);

        this.set({
            modal                : true,
            showMinimize         : false,
            showMaximize         : false,
            showClose            : false,
            resizable            : false,
            contentPaddingLeft   : 30,
            contentPaddingRight  : 30,
            contentPaddingTop    : 20,
            contentPaddingBottom : 20
        });
        this.getChildControl('captionbar').exclude();
        this.getChildControl('pane').set({
            decorator : new qx.ui.decoration.Decorator().set({
                style: 'solid',
                width: 1
            }),
            backgroundColor: '#fff'
        });
        var cfg = callbackery.data.Config.getInstance().getBaseConfig();
        var grid = new qx.ui.layout.Grid(10, 10);
        this.setLayout(grid);
        grid.setColumnAlign(1, 'right', 'middle');
        grid.setColumnWidth(0, 200);
        grid.setColumnWidth(2, 200);

        if (cfg.logo){
            this.add(new qx.ui.basic.Image(cfg.logo).set({
                alignX : 'left'
            }), {
                row     : 0,
                column  : 0,
                colSpan : 3
            });
        }

	if (! cfg.hide_password) {
            this.add(new qx.ui.basic.Image("icon/64/status/dialog-password.png").set({
		alignY : 'top',
		alignX : 'right'
            }),
            {
		row     : 2,
		column  : 0,
		rowSpan : 2
            });
	}

        this.add(new qx.ui.basic.Label(this.tr("User")), {
            row    : 2,
            column : 1
        });

        var username = new qx.ui.form.TextField();
        username.getContentElement().setAttribute("name", "cbUsername");
        username.getContentElement().setAttribute("autocomplete", "on");

        this.add(username, {
            row    : 2,
            column : 2
        });

	var login;
	if (! cfg.hide_password) {
            this.add(new qx.ui.basic.Label(this.tr("Password")), {
                row    : 3,
		column : 1
            });

            var password = new qx.ui.form.PasswordField();
            password.getContentElement().setAttribute("name", "cbPassword");
            password.getContentElement().setAttribute("autocomplete", "on");

            this.add(password, {
                row    : 3,
		column : 2
            });
            login = new qx.ui.form.Button(this.tr("Login"), "icon/16/actions/dialog-ok.png");
	}
	else {
            login = new qx.ui.form.Button(this.tr("OK"), "icon/16/actions/dialog-ok.png");
	}

        login.set({
            marginTop  : 6,
            allowGrowX : false,
            alignX     : 'right'
        });

        this.add(login, {
            row     : 4,
            column  : 0,
            colSpan : 3
        });

        if ( cfg.company_name && !cfg.hide_company){
	    var who = '';
            if (cfg.company_url){
                who += '<a href="' + cfg.company_url + '" style="color: #444;" target="_blank">' + cfg.company_name + '</a>';
            }
            else {
                who += cfg.company_name;
            }
        }
	if (! cfg.hide_release) {
            this.add(new qx.ui.basic.Label(this.tr('release %1, %2 by %3','#VERSION#','#DATE#',who)).set({
                textColor : '#444',
		rich : true
            }), {
		row    : 5,
		column : 0,
		colSpan: 3
            });
	}

        this.addListener('keyup', function(e) {
            if (e.getKeyIdentifier() == 'Enter') {
                login.press();
                login.execute();
                login.release();
            }
        });
        var rpc = callbackery.data.Server.getInstance();

        login.addListener("execute", function(e) {
            this.setEnabled(false);
            var id = this.__getIframe();
            // save the username and password to our hidden iframe form
            id.getElementById("cbUsername").value = username.getValue();
	    var passwordValue;
	    if (! cfg.hide_password) {
		passwordValue = password.getValue();
		id.getElementById("cbPassword").value = passwordValue;
	    }
            rpc.callAsync(qx.lang.Function.bind(this.__loginHandler, this), 'login',
                username.getValue(),
                passwordValue
            );
        },
        this);

        this.addListener('appear', function() {
	    if (! cfg.hide_password) {
		password.setValue('');
	    }
            this.setEnabled(true);
            if (username.getValue()){
                username.set({
                    enabled: false,
                    readOnly: true,
                    focusable: false
                });
		if (! cfg.hide_password) {
                    password.focus();
                    password.activate();
		}
            }
            else {
                username.focus();
                username.activate();
            }
            this.center();
        },this);
        this.getApplicationRoot().addListener('resize',function(){
            this.center();
        },this);
    },

    events : { 'login' : 'qx.event.type.Event' },

    members : {
        /**
         * Handler for the login events
         *
         * @param ret {Boolean} true if the login is ok and false if it is not ok.
         * @param exc {Exception} any error found during the login process.
         * @return {void}
         */
        __getIframe: function(){
            var iframe = document.getElementById("cbLoginIframe");
            return iframe.contentWindow ? iframe.contentWindow.document : iframe.contentDocument;
        },
        __loginHandler : function(ret, exc) {
            if (exc == null) {
                if (qx.lang.Type.isObject(ret) && ret.sessionCookie) {
                    // submit the iframe form to trigger the browser to save the password
                    this.__getIframe().getElementById('cbLoginForm').submit();
                    this.fireDataEvent('login', ret);
                    this.close();
                }
                else {
                    var element = this.getContentElement().getDomElement();
                    var tada = {duration: 1000, keyFrames : {
                        0 :  {scale: 1, rotate: "0deg"},
                        10 : {scale: 0.9, rotate: "-3deg"},
                        20 : {scale: 0.9, rotate: "-3deg"},
                        30 : {scale: 1.1, rotate: "3deg"},
                        40 : {scale: 1.1, rotate: "-3deg"},
                        50 : {scale: 1.1, rotate: "3deg"},
                        60 : {scale: 1.1, rotate: "-3deg"},
                        70 : {scale: 1.1, rotate: "3deg"},
                        80 : {scale: 1.1, rotate: "-3deg"},
                        90 : {scale: 1.1, rotate: "3deg"},
                        100 : {scale: 1, rotate: "0deg"}
                    }};
                    qx.bom.element.Animation.animate(element,tada);
                    this.setEnabled(true);
                }
            }
            else {
                callbackery.ui.MsgBox.getInstance().exc(exc);
                this.setEnabled(true);
            }
        }
    }
});
