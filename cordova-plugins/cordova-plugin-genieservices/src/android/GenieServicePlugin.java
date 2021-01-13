package org.ekstep.geniecanvas;

import android.content.Intent;
import android.net.Uri;
import android.util.Log;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaActivity;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.ekstep.genieresolvers.GenieSDK;
import org.ekstep.genieresolvers.content.ContentService;
import org.ekstep.genieresolvers.language.LanguageService;
import org.ekstep.genieresolvers.summarizer.SummarizerService;
import org.ekstep.genieresolvers.telemetry.TelemetryService;
import org.ekstep.genieresolvers.user.UserService;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

public class GenieServicePlugin extends CordovaPlugin {

    public static final String TAG = "Genie Service Plugin";

    private TelemetryService telemetryService;
    private UserService userService;
    private ContentService contentService;
    private SummarizerService summarizerService;
    private LanguageService languageService;
    private GenieSDK genieSdk;

    public GenieServicePlugin() {
        System.out.println("Genie Service Constructor..........");
    }

    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);

    }


    public boolean execute(final String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        CordovaActivity activity = (CordovaActivity) this.cordova.getActivity();

        if (action.equals("initializeSdk")) {
            String appQualifier = args.getString(0);
            genieSdk = GenieSDK.init(activity, appQualifier);
        }

        if (null == genieSdk){
            System.out.println("genie-sdk is not initialized:");
            return false;
        }

        if (null == telemetryService) {
            if (null != activity) {
                telemetryService = genieSdk.getTelemetryService();
            }
        }
        if(null == userService) {
            if (null != activity) {
                userService = genieSdk.getUserService();
            }
        }

        if(null == contentService) {
           if(null != activity) {
               contentService = genieSdk.getContentService();
           }
        }

        if(null == languageService) {
            if(null != activity) {
                languageService = genieSdk.getLanguageService();
            }
        }
        if(null == summarizerService) {
             if(null != activity) {
                 summarizerService = genieSdk.getSummarizerService();
             }
        }
        Log.v(TAG, "GenieServicePlugin received:" + action);
        System.out.println("Genie Service action: " + action);
        if(action.equals("sendTelemetry")) {
            if (args.length() != 1) {
                callbackContext.error(getErrorJSONObject("INVALID_ACTION", null));
                return false;
            }
            String data = args.getString(0);
            sendTelemetry(data, callbackContext);
        } else if(action.equals("getCurrentUser")) {
            userService.getCurrentUser(new GenieServicesResponse(callbackContext));
        } else if(action.equals("getAllUserProfile")) {
            String profileRequest = args.getString(0);
            userService.getAllUserProfile(profileRequest, new GenieServicesResponse(callbackContext));
        } else if(action.equals("setUser")) {
            String userId = args.getString(0);
            userService.setUser(userId, new GenieServicesResponse(callbackContext));
        } else if(action.equals("getContent")) {
            String contentId = args.getString(0);
            contentService.getContent(contentId, new GenieServicesResponse(callbackContext));
        } else if(action.equals("getRelevantContent")) {
            String request = args.getString(0);
            contentService.getRelevantContent(request, new GenieServicesResponse(callbackContext));
        } else if(action.equals("checkMaxLimit")) {
            String request = args.getString(0);
            contentService.checkMaxLimit(request, new GenieServicesResponse(callbackContext));
        } else if(action.equals("getRelatedContent")) {
            JSONObject contentExtras = null;
            if(!args.getString(0).equals("null")) {
                contentExtras = args.getJSONObject(0);
            }
            Map map = null;
            if (contentExtras != null) {
                map = new HashMap();
                Log.i(TAG, "java-getRelatedContent: new " + contentExtras);
                Iterator keys = contentExtras.keys();
                while (keys.hasNext()) {
                    String key = (String) keys.next();
                    map.put(key, contentExtras.get(key));
                }
            }
            String contentId = args.getString(1);
            String uid = args.getString(2);
            contentService.getRelatedContent(map, contentId, uid, new GenieServicesResponse(callbackContext));
        }
        else if(action.equals("sendFeedback")) {
            String evt = args.getString(0);
            contentService.sendFeedback(evt, new TelemetryResponse(callbackContext));
        } else if(action.equals("getLearnerAssessment")) {
            String uid = args.getString(0);
            String contentId = args.getString(1);
            JSONObject contentExtras = null;
            if(!args.getString(2).equals("null")) {
                contentExtras = args.getJSONObject(2);
            }
            Map map = null;
            if (contentExtras != null) {
                map = new HashMap();
                Log.i(TAG, "java-getLearnerAssessment: new " + contentExtras);
                Iterator keys = contentExtras.keys();
                while (keys.hasNext()) {
                    String key = (String) keys.next();
                    map.put(key, contentExtras.get(key));
                }
            } 
            summarizerService.getLearnerAssessment(uid, contentId, map, new GenieServicesResponse(callbackContext));
        } /*   else if(action.equals("getContentList")) {
            String[] filter = null;
            JSONArray jsonArray = args.getJSONArray(0);
            if(jsonArray != null && jsonArray.length() > 0) {
                filter = new String[jsonArray.length()];
                List<String> filterList = new ArrayList<String>();
                for(int i=0;i<jsonArray.length();i++)
                    filterList.add(jsonArray.getString(i));
                filterList.toArray(filter);
            } else {
                filter = new String[0];
            }
            if(filter.length == 0) {
                content.getList(new GenieServicesListResponse(callbackContext));
            } else {
                content.filter(filter, new GenieServicesListResponse(callbackContext));
            }
        }*/ else if(action.equals("languageSearch")) {
            String inputFilter = args.getString(0);
            languageService.getLanguageSearch(inputFilter, new GenieServicesResponse(callbackContext));
        }else if("endGenieCanvas".equals(action)) {
            System.out.println("*** Activity:" + activity);
            activity.finish();
        } else if("launchPortal".equals(action)) {
            String url = args.getString(0);
            Intent i = new Intent(Intent.ACTION_VIEW);
            i.setData(Uri.parse(url));
            activity.startActivity(i);
        }
        return true;
    }

    private void sendTelemetry(String data, CallbackContext callbackContext) {
        if (null != data) {
            telemetryService.saveTelemetryEvent(data, new TelemetryResponse(callbackContext));
        }
    }

    private JSONObject getErrorJSONObject(String errorCode, String errorParam) {
        Map<String, Object> error = new HashMap<String, Object>();
        error.put("status", "error");
        JSONObject obj = new JSONObject(error);
        try {
            if (null != errorCode)
                error.put("errorCode", errorCode);
            if (null != errorParam)
                error.put("errorParam", errorParam);
            obj = new JSONObject(error);
        } catch(Exception e) {
        }
        return obj;
    }

}
