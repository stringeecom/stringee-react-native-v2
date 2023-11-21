package com.stringeereactnative.view;

import android.content.Context;
import android.view.Choreographer;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;

import com.stringee.video.TextureViewRenderer;
import com.stringeereactnative.common.StringeeManager;
import com.stringeereactnative.common.Utils;
import com.stringeereactnative.wrapper.call.StringeeCall2Wrapper;
import com.stringeereactnative.wrapper.call.StringeeCallWrapper;

import org.webrtc.RendererCommon.ScalingType;

public class RNStringeeVideoView extends FrameLayout {
    private int width = 0;
    private int height = 0;
    private String uuid;
    private boolean isLocal = false;
    private ScalingType scalingType = ScalingType.SCALE_ASPECT_FILL;

    public RNStringeeVideoView(@NonNull Context context) {
        super(context);
    }

    public void setWidth(int width) {
        this.width = Utils.dpiToPx(getContext(), width);
    }

    public void setHeight(int height) {
        this.height = Utils.dpiToPx(getContext(), height);
    }

    public void setUUID(String uuid) {
        this.uuid = uuid;
    }

    public void setLocal(boolean local) {
        isLocal = local;
    }

    public void setScalingType(String scalingType) {
        switch (scalingType) {
            case "fit":
                this.scalingType = ScalingType.SCALE_ASPECT_FIT;
                break;
            case "fill":
            default:
                this.scalingType = ScalingType.SCALE_ASPECT_FILL;
                break;
        }
    }

    public void createView() {
        setupLayout(this);
        this.removeAllViews();
        LayoutParams layoutParams = new LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
        layoutParams.gravity = Gravity.CENTER;
        FrameLayout layout = new FrameLayout(getContext());
        if (!Utils.isStringEmpty(uuid)) {
            StringeeCallWrapper callWrapper = StringeeManager.getInstance().getCallMap().get(uuid);
            StringeeCall2Wrapper call2Wrapper = StringeeManager.getInstance().getCall2Map().get(uuid);

            if (callWrapper == null && call2Wrapper == null) {
                return;
            }

            if (isLocal) {
                TextureViewRenderer localView;
                if (callWrapper != null) {
                    localView = callWrapper.getLocalView();
                    if (localView != null) {
                        if (localView.getParent() != null) {
                            ((ViewGroup) localView.getParent()).removeView(localView);
                        }
                        layout.addView(localView, layoutParams);
                        callWrapper.renderLocalView(scalingType);
                    }
                } else {
                    localView = call2Wrapper.getLocalView();
                    if (localView != null) {
                        if (localView.getParent() != null) {
                            ((ViewGroup) localView.getParent()).removeView(localView);
                        }
                        layout.addView(localView, layoutParams);
                        call2Wrapper.renderLocalView(scalingType);
                    }
                }
            } else {
                TextureViewRenderer remoteView;
                if (callWrapper != null) {
                    remoteView = callWrapper.getRemoteView();
                    if (remoteView != null) {
                        if (remoteView.getParent() != null) {
                            ((ViewGroup) remoteView.getParent()).removeView(remoteView);
                        }
                        layout.addView(remoteView, layoutParams);
                        callWrapper.renderRemoteView(scalingType);
                    }
                } else {
                    remoteView = call2Wrapper.getRemoteView();
                    if (remoteView != null) {
                        if (remoteView.getParent() != null) {
                            ((ViewGroup) remoteView.getParent()).removeView(remoteView);
                        }
                        layout.addView(remoteView, layoutParams);
                        call2Wrapper.renderRemoteView(scalingType);
                    }
                }
            }
        }
        this.addView(layout);
    }

    public void setupLayout(View view) {
        Choreographer.getInstance().postFrameCallback(new Choreographer.FrameCallback() {
            @Override
            public void doFrame(long frameTimeNanos) {
                manuallyLayoutChildren(view);
                view.getViewTreeObserver().dispatchOnGlobalLayout();
                Choreographer.getInstance().postFrameCallback(this);
            }
        });
    }

    /**
     * Layout all children properly
     */
    public void manuallyLayoutChildren(View view) {
        view.measure(MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY), MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY));

        view.layout(0, 0, width, height);
    }
}
