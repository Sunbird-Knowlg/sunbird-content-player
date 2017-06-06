package org.ekstep.geniecanvas;

import android.text.TextUtils;

import org.apache.cordova.CallbackContext;

import org.ekstep.genieservices.commons.GenieResponse;
import org.ekstep.genieservices.commons.IResponseHandler;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

public class UserProfileResponse implements IResponseHandler {
    private CallbackContext callbackContext;

    public UserProfileResponse(CallbackContext callbackContext) {
        this.callbackContext = callbackContext;
    }

    public void onSuccess(GenieResponse response) {
        System.out.println("UserProfileResponse success: " + response.getStatus());
        System.out.println("UserProfileResponse result: " + response.getResult());
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("status", "success");
        Map<String, Object> resultObj = (Map<String, Object>) response.getResult();
        JSONObject result = new JSONObject(resultObj);
        map.put("data", result);
        callbackContext.success(new JSONObject(map));
    }

    public void onFailure(GenieResponse response) {
        System.out.println("TelemetryResponse error: " + response.getStatus() + " -- " + response.getError());
        String errors = "";
        List<String> errorList = response.getErrorMessages();
        if (null != errorList) 
        errors = TextUtils.join(",", errorList);
        String error = response.getError();
        Map<String, String> map = new HashMap<String, String>();
        map.put("status", response.getStatus());
        map.put("error", error);
        map.put("errors", errors);
        callbackContext.error(new JSONObject(map));
    }
}
