package org.ekstep.geniecanvas;

import android.text.TextUtils;
import android.util.Log;

import org.apache.cordova.CallbackContext;
import org.ekstep.genieservices.commons.IResponseHandler;
import org.ekstep.genieservices.commons.bean.GenieResponse;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

public class UserProfileResponse implements IResponseHandler<Map> {
    private CallbackContext callbackContext;

    public UserProfileResponse(CallbackContext callbackContext) {
        this.callbackContext = callbackContext;
    }

    public void onSuccess(GenieResponse<Map> response) {
        System.out.println("UserProfileResponse result: " + response.getResult());
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("status", "success");
        JSONObject result = new JSONObject(response.getResult());
        map.put("data", result);
        callbackContext.success(new JSONObject(map));
    }

    public void onError(GenieResponse response) {
        System.out.println("UserProfileResponse error: " + response.getStatus() + " -- " + response.getError());
        String errors = "";
        List<String> errorList = response.getErrorMessages();
        if (null != errorList)
            errors = TextUtils.join(",", errorList);
        String error = response.getError();
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("status", response.getStatus());
        map.put("error", error);
        map.put("errors", errors);
        callbackContext.error(new JSONObject(map));
    }
}
