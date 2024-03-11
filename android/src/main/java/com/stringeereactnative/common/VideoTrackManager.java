package com.stringeereactnative.common;

import android.util.Log;

import com.stringee.video.StringeeVideoTrack;
import com.stringee.video.StringeeVideoTrack.Listener;
import com.stringee.video.StringeeVideoTrack.MediaState;
import com.stringeereactnative.wrapper.conference.StringeeVideoRoomWrapper;

public class VideoTrackManager implements Listener {
    private StringeeVideoRoomWrapper roomWrapper;
    private final String localId;
    private final StringeeVideoTrack videoTrack;
    private boolean mediaAvailable = false;
    private final boolean forCall;
    private Listener listener;

    public VideoTrackManager(StringeeVideoTrack videoTrack, boolean forCall) {
        this.videoTrack = videoTrack;
        this.localId = videoTrack.getLocalId();
        this.forCall = forCall;
        videoTrack.setListener(this);
        if (forCall) {
            mediaAvailable = true;
        }
    }

    public VideoTrackManager(StringeeVideoTrack videoTrack, String localId, boolean forCall) {
        this.videoTrack = videoTrack;
        this.localId = localId;
        this.forCall = forCall;
        videoTrack.setListener(this);
        if (forCall) {
            mediaAvailable = true;
        }
    }

    public void setListener(StringeeVideoRoomWrapper roomWrapper, Listener listener) {
        this.listener = listener;
        this.roomWrapper = roomWrapper;
        if (mediaAvailable) {
            if (listener != null) {
                listener.onMediaAvailable();
            }
        }
    }

    public boolean isForCall() {
        return forCall;
    }

    public StringeeVideoTrack getVideoTrack() {
        return videoTrack;
    }

    public String getLocalId() {
        return localId;
    }

    public VideoTrackManager getThis() {
        return this;
    }

    @Override
    public void onMediaAvailable() {
        mediaAvailable = true;
        if (listener != null) {
            listener.onMediaAvailable();
        }

        Log.d("Stringee", "trackReadyToPlay: " + (videoTrack.isLocal() ? localId : videoTrack.getId()));
        if (!forCall && roomWrapper != null) {
            roomWrapper.sendTrackReadyToPlayEvent(this);
        }
    }

    @Override
    public void onMediaStateChange(MediaState mediaState) {

    }
}
