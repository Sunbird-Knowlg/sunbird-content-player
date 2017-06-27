package org.ekstep.geniecanvas;

import android.text.TextUtils;

import org.apache.cordova.CallbackContext;
import org.ekstep.genieservices.commons.IResponseHandler;
import org.ekstep.genieservices.commons.bean.GenieResponse;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class TelemetryResponse implements IResponseHandler<Map> {
    private CallbackContext callbackContext;

    public TelemetryResponse(CallbackContext callbackContext) {
        this.callbackContext = callbackContext;
    }
    @Override
    public void onSuccess(GenieResponse response) {
        // GenieResponse response = (GenieResponse) o;
        System.out.println("TelemetryResponse success: " + response.getStatus());
        Map<String, String> map = new HashMap<String, String>();
        map.put("status", "success");
        callbackContext.success(new JSONObject(map));
    }

    @Override
    public void onError(GenieResponse response) {
        // GenieResponse response = (GenieResponse) o;
        System.out.println("TelemetryResponse error: " + response.getStatus() + " -- " + response.getError());
        List<String> errors = response.getErrorMessages();
        String error = response.getError();
        String errorString = TextUtils.join(",", errors);
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("status", response.getStatus());
        map.put("error", error);
        map.put("errors", errorString);
        callbackContext.error(new JSONObject(map));
    }


}
