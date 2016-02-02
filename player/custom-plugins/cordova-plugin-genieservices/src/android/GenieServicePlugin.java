import android.util.Log;
import org.apache.cordova.CordovaActivity;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CordovaInterface;

import org.ekstep.genieservices.sdks.Telemetry;
import org.ekstep.genieservices.sdks.UserProfile;
import org.ekstep.genieservices.sdks.Content;
import org.ekstep.genieservices.sdks.GenieServices;
import org.ekstep.genieservices.sdks.response.IResponseHandler;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Map;
import java.util.HashMap;
import java.util.*;

public class GenieServicePlugin extends CordovaPlugin {

	public static final String TAG = "Genie Service Plugin";

	private Telemetry telemetry;
    private UserProfile userProfile;
    private GenieServices genieServices;
    private Content content;

	public GenieServicePlugin() {
		System.out.println("Genie Service Constructor..........");
    }

    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);
        
    }

    public void onDestroy() {
        if(null != userProfile) {
            userProfile.finish();
        }
        super.onDestroy();
    }

    public boolean execute(final String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        CordovaActivity activity = (CordovaActivity) this.cordova.getActivity();
        if (null == telemetry) {
            if (null != activity) {
                telemetry = new Telemetry(activity);
            }
        }
        if(null == userProfile) {
            if (null != activity) {
                userProfile = new UserProfile(activity);    
            }
        }
        if(null == genieServices) {
            if (null != activity) {
                genieServices = new GenieServices(activity);    
            }
        }
        if(null == content) {
            if(null != activity) {
                content = new Content(activity);
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
            userProfile.getCurrentUser(new UserProfileResponse(callbackContext));
        } else if(action.equals("getMetaData")) {
            genieServices.getMetaData(new GenieServicesResponse(callbackContext));
        } else if(action.equals("getContent")) {
            String contentId = args.getString(0);
            content.get(contentId, new GenieServicesResponse(callbackContext));
        } else if(action.equals("getContentList")) {
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
            content.getList(filter, new GenieServicesListResponse(callbackContext));
        }
        return true;
    }

    private void sendTelemetry(String data, CallbackContext callbackContext) {
    	if (null != data) {
    		telemetry.send(data, new TelemetryResponse(callbackContext));
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