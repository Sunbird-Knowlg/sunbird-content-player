/**
 * Plugin to create repo instance and to register repo instance
 * @extends EkstepRenderer.Plugin
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */
//ref: http://www.jqueryscript.net/other/Highly-Customizable-jQuery-Toast-Message-Plugin-Toastr.html
Plugin.extend({
    initialize: function() {
        console.info('Toaster init is done');

        /**
         * renderer:toast:show Event to show the toast message with custom object.
         * @event renderer:toast:show
         * @listen renderer:toast:show
         * @memberOf EkstepRendererEvents
         */
        EkstepRendererAPI.addEventListener('renderer:toast:show', this.customize, this);
    },
    customize: function(event, obj) {
        try {
            var defaultCustom = {
                positionClass: "toast-top-right",
                preventDuplicates: true,
                tapToDismiss: true,
                hideDuration: "1000",
                timeOut: "4000",
            };
            if (!obj.custom) {
                obj.custom = {};
            }
            toastr.options = _.extend(defaultCustom, obj.custom);
            if (obj.type) {
                if (obj.type.toUpperCase() === 'WARNING') {
                    toastr.warning(obj.message);
                }
                if (obj.type.toUpperCase() === 'ERROR') {
                    toastr.error(obj.message);
                    if (obj.errorInfo) {
                        EkstepRendererAPI.logErrorEvent(obj.errorInfo.errorStack, obj.errorInfo.data);
                    }

                }
                if (obj.type.toUpperCase() === 'INFO') {
                    toastr.info(obj.message);
                }
            } else {
                console.warn('Toast Type is Needed')
            }

        } catch (e) {
            console.warn('Unable customize your TOAST', e);
        }
    }

});