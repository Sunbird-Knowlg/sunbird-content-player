package org.ekstep.geniecanvas;

import android.text.TextUtils;

import org.apache.cordova.CallbackContext;
import org.ekstep.genieservices.commons.IResponseHandler;
import org.ekstep.genieservices.commons.bean.GenieResponse;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class GenieServicesResponse implements IResponseHandler<Map> {
    private CallbackContext callbackContext;

    public GenieServicesResponse(CallbackContext callbackContext) {
        this.callbackContext = callbackContext;
    }

    @Override
    public void onSuccess(GenieResponse<Map> response) {
        System.out.println("GenieServicesResponse success: " + response.getResult());
        callbackContext.success(new JSONObject(response.getResult()));
    }

    @Override
    public void onError(GenieResponse<Map> response) {
        // GenieResponse response = (GenieResponse) o;
        System.out.println("GenieServicesResponse error: " + response.getResult() + " -- " + response.getError());
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
