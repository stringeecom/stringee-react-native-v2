package com.stringeereactnative;

import androidx.annotation.NonNull;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.stringeereactnative.module.RNStringeeCall2Module;
import com.stringeereactnative.module.RNStringeeCallModule;
import com.stringeereactnative.module.RNStringeeClientModule;
import com.stringeereactnative.module.RNStringeeVideoModule;
import com.stringeereactnative.module.RNStringeeVideoRoomModule;
import com.stringeereactnative.module.RNStringeeVideoTrackModule;
import com.stringeereactnative.view.RNStringeeVideoViewManager;

import java.util.ArrayList;
import java.util.List;

public class RNStringeeReactPackage implements ReactPackage {

    @NonNull
    @Override
    public List<NativeModule> createNativeModules(@NonNull ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();

        modules.add(new RNStringeeClientModule(reactContext));
        modules.add(new RNStringeeCallModule(reactContext));
        modules.add(new RNStringeeCall2Module(reactContext));
        modules.add(new RNStringeeVideoModule(reactContext));
        modules.add(new RNStringeeVideoRoomModule(reactContext));
        modules.add(new RNStringeeVideoTrackModule(reactContext));

        return modules;
    }

    @NonNull
    @Override
    public List<ViewManager> createViewManagers(@NonNull ReactApplicationContext reactContext) {
        return List.of(
                new RNStringeeVideoViewManager(reactContext)
        );
    }
}
