/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
 */

package org.ekstep.geniecanvas;

import android.os.Bundle;
import android.os.Build.VERSION;
import android.content.Context;
import java.lang.reflect.Constructor;

import org.apache.cordova.*;
import org.apache.cordova.engine.SystemWebViewEngine;


public class MainActivity extends CordovaActivity
{
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        super.init();
        // Set by <content src="index.html" /> in config.xml
        loadUrl(launchUrl);
    }


    protected CordovaWebViewEngine makeWebViewEngine() {
        if(VERSION.SDK_INT >= 21) {
          return createSystemWebViewEngine(this, this.preferences);
        } else {
          return CordovaWebViewImpl.createEngine(this, this.preferences);
        }

    }


    private CordovaWebViewEngine createSystemWebViewEngine(Context context, CordovaPreferences preferences) {
        String className = SystemWebViewEngine.class.getCanonicalName();

        try {
            Class e = Class.forName(className);
            Constructor constructor = e.getConstructor(new Class[]{Context.class, CordovaPreferences.class});
            return (CordovaWebViewEngine)constructor.newInstance(new Object[]{context, preferences});
        } catch (Exception var5) {
            throw new RuntimeException("Failed to create webview. ", var5);
        }
    }

}
