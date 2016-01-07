import android.text.TextUtils;

import org.apache.cordova.CallbackContext;

import org.ekstep.genieservices.sdks.response.GenieListResponse;
import org.ekstep.genieservices.sdks.response.IListResponseHandler;

import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONArray;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

public class GenieServicesListResponse implements IListResponseHandler {
    private CallbackContext callbackContext;

    public GenieServicesListResponse(CallbackContext callbackContext) {
        this.callbackContext = callbackContext;
    }

	@Override
    public void onSuccess(GenieListResponse response) {
        System.out.println("GenieServicesResponse success: " + response.getResults());
        JSONObject obj = new JSONObject();
        try {
            JSONArray results = new JSONArray(response.getResults());
        	obj.put("list", results);
        } catch(Exception e) {}
        callbackContext.success(obj);
    }

    @Override
    public void onFailure(GenieListResponse response) {
    	System.out.println("GenieServicesResponse error: " + " -- " + response.getError());
        List<String> errors = response.getErrorMessages();
        String error = response.getError();
        String errorString = TextUtils.join(",", errors);
        Map<String, String> map = new HashMap<String, String>();
        map.put("status", response.getStatus());
        map.put("error", error);
        map.put("errors", errorString);
        callbackContext.error(new JSONObject(map));
    }
}