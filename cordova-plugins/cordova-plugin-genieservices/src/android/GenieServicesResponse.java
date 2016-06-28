package org.ekstep.geniecanvas;

import android.text.TextUtils;

import org.apache.cordova.CallbackContext;

import org.ekstep.genieservices.sdks.response.GenieResponse;
import org.ekstep.genieservices.sdks.response.IResponseHandler;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

public class GenieServicesResponse implements IResponseHandler {
    private CallbackContext callbackContext;

    public GenieServicesResponse(CallbackContext callbackContext) {
        this.callbackContext = callbackContext;
    }

    public void onSuccess(GenieResponse response) {
        System.out.println("GenieServicesResponse success: " + response.getResult());
        callbackContext.success(new JSONObject(response.getResult()));
    }

    public void onFailure(GenieResponse response) {
        // GenieResponse response = (GenieResponse) o;
        System.out.println("GenieServicesResponse error: " + response.getResult() + " -- " + response.getError());
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
