package org.ekstep.geniecanvas;

import android.text.TextUtils;
import android.util.Log;

import org.apache.cordova.CallbackContext;
import org.ekstep.genieservices.commons.IResponseHandler;
import org.ekstep.genieservices.commons.bean.GenieResponse;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class GenieServicesResponse implements IResponseHandler {
    private CallbackContext callbackContext;

    public GenieServicesResponse(CallbackContext callbackContext) {
        this.callbackContext = callbackContext;
    }

    public void onSuccess(GenieResponse response) {
        Object responseObj = response.getResult();
        if (responseObj instanceof Map) {
            callbackContext.success(new JSONObject((Map) responseObj));
        } else if (responseObj instanceof Collection) {
            callbackContext.success(new JSONArray((Collection) responseObj));
        } else {
            Log.d("CANVAS_WARN", String.valueOf(response.getResult()));
            Map<String, String> map = new HashMap<String, String>();
            map.put("status", "success");
            callbackContext.success(new JSONObject(map));
        }
    }

    public void onError(GenieResponse response) {
        List<String> errors = response.getErrorMessages();
        String error = response.getError();
        String errorString = TextUtils.join(",", errors);
        Map<String, String> map = new HashMap<String, String>();
        map.put("status", String.valueOf(response.getStatus()));
        map.put("error", error);
        map.put("errors", errorString);
        callbackContext.error(new JSONObject(map));
    }
}
