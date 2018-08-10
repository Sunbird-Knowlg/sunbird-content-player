package org.ekstep.geniecanvas;

import android.util.Log;
import org.apache.cordova.CordovaActivity;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CordovaInterface;

import java.io.FileNotFoundException;
import java.io.IOException;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Map;
import java.util.HashMap;

import com.sensibol.ekstep.speechengine.sdk.InvalidOrCorruptMedatada;
import com.sensibol.ekstep.speechengine.sdk.InvalidStateException;
import com.sensibol.ekstep.speechengine.sdk.LineIndexOutOfBoundException;
import com.sensibol.ekstep.speechengine.sdk.OnAudioRecordingCompleteListener;
import com.sensibol.ekstep.speechengine.sdk.SEException;
import com.sensibol.ekstep.speechengine.sdk.SpeechEngine;
import com.sensibol.ekstep.speechengine.sdk.SpeechEngineFactory;

public class SensibolPlugin extends CordovaPlugin {

    public static final String TAG = "SensibolPlugin";
    private static final String WORK_DIR_PATH = "/storage/emulated/0/Genie/SdkWorkDir";
    private SpeechEngine speechEngine;
    private boolean initialized = false;

    public SensibolPlugin() {
        System.out.println("SensibolPlugin Constructor..........");
    }

    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        speechEngine = SpeechEngineFactory.INSTANCE.getSpeechEngine();
        try {
            speechEngine.init(this.cordova.getActivity().getApplicationContext(), WORK_DIR_PATH);
            super.initialize(cordova, webView);
            initialized = true;
        } catch (Exception e) {
            e.printStackTrace();
        }
        
    }

    public void onDestroy() {
        super.onDestroy();
    }

    public boolean execute(final String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        CordovaActivity activity = (CordovaActivity) this.cordova.getActivity();
        System.out.println("SensibolPlugin action: " + action);
        if( initialized == false) {
            callbackContext.error(getErrorJSONObject("INIT_FAILED", null));
            return false;
        }
        if(action.equals("initLesson")) {
            if (args.length() != 1) {
                callbackContext.error(getErrorJSONObject("INVALID_ACTION", null));
                return false;
            }
            String lessonMetadataFile = args.getString(0);
            initLesson(lessonMetadataFile, callbackContext);
        } else if(action.equals("startRecording")) {
            if (args.length() != 1) {
                callbackContext.error(getErrorJSONObject("INVALID_ACTION", null));
                return false;
            }
            String recordingFile = args.getString(0);
            startRecording(recordingFile, callbackContext);
        } else if(action.equals("stopRecording")) {
            stopRecording(callbackContext);
        } else if(action.equals("processRecording")) {
            if (args.length() != 2) {
                callbackContext.error(getErrorJSONObject("INVALID_ACTION", null));
                return false;
            }
            String recordingFile = args.getString(0);
            int lineIndex = args.getInt(1);
            processRecording(recordingFile, lineIndex, callbackContext);
        }
        return true;
    }

    private void initLesson(String lessonMetadataFile, CallbackContext callbackContext) {
        Map<String, String> map = new HashMap<String, String>();
        if (null != lessonMetadataFile) {
            try {
                speechEngine.initLesson(lessonMetadataFile);
                map.put("status", "success");
            } catch (Exception e) {
                // e.printStackTrace();
                map.put("status", "error");
                map.put("errorMessage", e.getMessage());
            }
        } else {
            map.put("status", "error");
            map.put("errorMessage", "metadata file path is empty.");
        }
        callbackContext.success(new JSONObject(map));
    }

    private void startRecording(String recordingFile, CallbackContext callbackContext) {
        Map<String, String> map = new HashMap<String, String>();
        if(null != recordingFile) {
            try {
                speechEngine.startRecording(recordingFile);
                System.out.println("Recording Stopped.");
                map.put("status", "success");
            } catch (Exception e) {
                // e.printStackTrace();
                map.put("status", "error");
                map.put("errorMessage", e.getMessage());
            }
        } else {
            map.put("status", "error");
            map.put("errorMessage", "recording file path is empty.");
        }
        callbackContext.success(new JSONObject(map));
    }

    private void stopRecording(final CallbackContext callbackContext) {
        try {
            speechEngine.stopRecording(new OnAudioRecordingCompleteListener() {
                @Override
                public void onAudioRecordingComplete() {
                    System.out.println("Recording Stopped.");
                    Map<String, String> map = new HashMap<String, String>();
                    map.put("status", "success");
                    callbackContext.success(new JSONObject(map));
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> map = new HashMap<String, String>();
            map.put("status", "error");
            map.put("errorMessage", e.getMessage());
            callbackContext.success(new JSONObject(map));
        }
    }

    private void processRecording(String recordingFile, int lineIndex, CallbackContext callbackContext) {
        Map<String, Object> map = new HashMap<String, Object>();
        String error = null;
        try {
            System.out.println("*** Processing file:" + recordingFile + " :: Line:" + lineIndex);
            JSONObject result = speechEngine.processRecording(recordingFile, lineIndex);
            System.out.println("ProcessRecording result= " + result.toString());
            map.put("status", "success");
            map.put("result", result);
        } catch (Exception e) {
            e.printStackTrace();
            map.put("status", "error");
            map.put("errorMessage", e.getMessage());
        }
        callbackContext.success(new JSONObject(map));
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