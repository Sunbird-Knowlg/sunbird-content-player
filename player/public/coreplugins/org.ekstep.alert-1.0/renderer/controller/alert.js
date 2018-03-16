/**
 * User switcher controller
 * @author Gourav More <gourav_m@tekditechnologies.com>
 */

app.compileProvider.directive('alert', function($rootScope, $compile) {
    return {
        restrict: 'E',
        template: "<div ng-include='getAlertPluginInstance()' ></div>",
        link: function(scope, element, attrs, controller) {
            scope.upIcon = EkstepRendererAPI.resolvePluginResource("org.ekstep.alert", "1.0", "/assets/up.png");
            scope.downIcon = EkstepRendererAPI.resolvePluginResource("org.ekstep.alert", "1.0", "/assets/down.png");
            scope.title = "";
            scope.text = "";
            scope.type = null;
            scope.showCancelButton = true;
            scope.detailBtnText = "Details";
            scope.okBtnText = "Exit";
            scope.detailstopMargin = "";
            scope.copyAnswer = 'Copy';
            scope.showDetailsPopUp = false;
            scope.rendererVersion = EkstepRendererAPI.getGlobalConfig().canvasVersion;
            scope.detailsIcon = scope.downIcon;
            scope.imageBasePath = globalConfig.assetbase;
            scope.init = function() {
                /**
                 * renderer:alert:show event to show the alerts.
                 * @event renderer:alert:show
                 * @listens renderer:alert:show
                 * @memberof EkstepRendererEvents
                 */
                EkstepRendererAPI.addEventListener("renderer:alert:show", scope.showAlert);

                /**
                 * renderer:alert:hide event to hide alert popup.
                 * @event renderer:alert:hide
                 * @listens renderer:alert:hide
                 * @memberof EkstepRendererEvents
                 */

                EkstepRendererAPI.addEventListener("renderer:alert:hide", scope.hideAlert);
            };
            scope.showAlert = function(event, data) {
                scope.text = data.text;
                scope.details = data.data;
                scope.showPopup = true;
                scope.safeApply();
            }
            scope.hideAlert = function() {
            }
            scope.hidePopup = function(){
              scope.showPopup = false;
              scope.safeApply();
            }
            scope.showDetails = function(){
              if(scope.showDetailsPopUp){
                scope.showDetailsPopUp = false;
                scope.detailstopMargin = "";
                scope.copyAnswer = "Copy";
                scope.detailsIcon = scope.downIcon;
              }else{
                scope.showDetailsPopUp = true;
                scope.detailstopMargin = "detailstopMargin";
                scope.detailsIcon = scope.upIcon;
              }
              scope.safeApply();
            }
            scope.hideDetails = function(){
              scope.detailstopMargin = "";
              scope.showDetailsPopUp = false;
              scope.safeApply();
            }
            /**
             *   function to copy content preview link
             *   @memberof collaborator
             */
            scope.getUrlLink = function() {
                $("#copyTarget").select();

                try {
                    var successful = document.execCommand('copy');
                    successful ? scope.copyAnswer = 'Copied' : scope.copyAnswer = 'Unable to copy!';
                } catch (err) {
                    scope.copyAnswer = 'Unsupported Browser!';
                }
            }
            scope.getAlertPluginInstance = function() {
                var alertPluginInstance = EkstepRendererAPI.getPluginObjs("org.ekstep.alert");
                return alertPluginInstance._templatePath;
            }
        }
    }
});

//# sourceMappingURL=alert.js.ctrl