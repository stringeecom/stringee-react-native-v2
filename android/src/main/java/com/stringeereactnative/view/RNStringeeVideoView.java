package com.stringeereactnative.view;

import android.content.Context;
import android.view.Choreographer;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReadableMap;
import com.stringee.video.StringeeVideoTrack;
import com.stringee.video.TextureViewRenderer;
import com.stringeereactnative.common.StringeeManager;
import com.stringeereactnative.common.Utils;
import com.stringeereactnative.common.VideoTrackManager;
import com.stringeereactnative.wrapper.call.StringeeCallWrapper;

import org.webrtc.RendererCommon.ScalingType;

public class RNStringeeVideoView extends FrameLayout {
    private int propsWidth = 0;
    private int propsHeight = 0;
    private String uuid;
    private boolean isLocal = false;
    private ScalingType scalingType = ScalingType.SCALE_ASPECT_FILL;
    private ReadableMap videoTrackMap;

    public RNStringeeVideoView(@NonNull Context context) {
        super(context);
    }

    public void setPropsWidth(int propsWidth) {
        this.propsWidth = Utils.dpiToPx(getContext(), propsWidth);
    }

    public void setPropsHeight(int propsHeight) {
        this.propsHeight = Utils.dpiToPx(getContext(), propsHeight);
    }

    public void setUUID(String uuid) {
        this.uuid = uuid;
    }

    public void setLocal(boolean local) {
        isLocal = local;
    }

    public void setScalingType(@Nullable String scalingType) {
        if (Utils.isStringEmpty(scalingType)) {
            this.scalingType = ScalingType.SCALE_ASPECT_FILL;
        } else {
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
    }

    public void setVideoTrackMap(ReadableMap videoTrackMap) {
        this.videoTrackMap = videoTrackMap;
    }

    public void createView() {
        this.removeAllViews();
        LayoutParams layoutParams = new LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
        layoutParams.gravity = Gravity.CENTER;
        FrameLayout layout = new FrameLayout(getContext());
        layout.removeAllViews();
        layout.setLayoutParams(new LayoutParams(getWidth(), getHeight()));
        setupLayout(layout);

        if (!Utils.isMapEmpty(videoTrackMap)) {
            boolean isLocal = videoTrackMap.getBoolean("isLocal");
            String trackId = isLocal ? videoTrackMap.getString("localId") : videoTrackMap.getString("serverId");
            if (!Utils.isStringEmpty(trackId)) {
                VideoTrackManager trackManager = StringeeManager.getInstance().getTracksMap().get(trackId);
                if (trackManager != null) {
                    StringeeVideoTrack stringeeVideoTrack = trackManager.getVideoTrack();
                    if (stringeeVideoTrack != null) {
                        TextureViewRenderer videoView = stringeeVideoTrack.getView2(getContext());
                        if (videoView != null) {
                            if (videoView.getParent() != null) {
                                ((ViewGroup) videoView.getParent()).removeView(videoView);
                            }
                            layout.addView(videoView, layoutParams);
                            stringeeVideoTrack.renderView2(scalingType);
                        }
                    }
                }
            }
        }

        if (!Utils.isStringEmpty(uuid)) {
            StringeeCallWrapper callWrapper = StringeeManager.getInstance().getCallMap().get(uuid);
            if (callWrapper != null) {
                if (isLocal) {
                    TextureViewRenderer localView = callWrapper.getLocalView();
                    if (localView != null) {
                        if (localView.getParent() != null) {
                            ((ViewGroup) localView.getParent()).removeView(localView);
                        }
                        layout.addView(localView, layoutParams);
                        callWrapper.renderLocalView(scalingType);
                    }
                } else {
                    TextureViewRenderer remoteView = callWrapper.getRemoteView();
                    if (remoteView != null) {
                        if (remoteView.getParent() != null) {
                            ((ViewGroup) remoteView.getParent()).removeView(remoteView);
                        }
                        layout.addView(remoteView, layoutParams);
                        callWrapper.renderRemoteView(scalingType);
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
        int width = propsWidth == 0 ? getWidth() : propsWidth;
        int height = propsHeight == 0 ? getHeight() : propsHeight;
        view.measure(MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY), MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY));
        view.layout(0, 0, width, height);
    }
}
