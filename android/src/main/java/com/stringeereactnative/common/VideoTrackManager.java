package com.stringeereactnative.common;

import com.stringee.video.StringeeVideoTrack;
import com.stringee.video.StringeeVideoTrack.Listener;
import com.stringee.video.StringeeVideoTrack.MediaState;
import com.stringeereactnative.wrapper.conference.StringeeVideoRoomWrapper;

public class VideoTrackManager implements Listener {
    private StringeeVideoRoomWrapper roomWrapper;
    private String localId;
    private String publisher;
    private StringeeVideoTrack videoTrack;

    public static VideoTrackManager create(StringeeVideoTrack videoTrack) {
        VideoTrackManager videoTrackManager = new VideoTrackManager();
        videoTrackManager.setVideoTrack(videoTrack);
        return videoTrackManager;
    }

    public static VideoTrackManager create(StringeeVideoTrack videoTrack, String localId, String publisher) {
        VideoTrackManager videoTrackManager = new VideoTrackManager();
        videoTrackManager.setVideoTrack(videoTrack);
        videoTrackManager.setLocalId(localId);
        videoTrackManager.setPublisher(publisher);
        return videoTrackManager;
    }

    public StringeeVideoTrack getVideoTrack() {
        return videoTrack;
    }

    public void setVideoTrack(StringeeVideoTrack videoTrack) {
        this.videoTrack = videoTrack;
        this.videoTrack.setListener(this);
    }

    public String getLocalId() {
        return Utils.isStringEmpty(localId) ? videoTrack != null ? videoTrack.getId() : "" : localId;
    }

    public void setLocalId(String localId) {
        this.localId = localId;
    }

    public String getServerId() {
        return videoTrack != null ? videoTrack.getId() : "";
    }

    public String getPublisher() {
        return Utils.isStringEmpty(publisher) ? videoTrack != null ? videoTrack.getUserId() : "" : publisher;
    }

    public void setPublisher(String publisher) {
        this.publisher = publisher;
    }

    public boolean isLocal() {
        return videoTrack != null && videoTrack.isLocal();
    }

    public boolean audioEnabled() {
        return videoTrack != null && videoTrack.audioEnabled();
    }

    public boolean videoEnabled() {
        return videoTrack != null && videoTrack.videoEnabled();
    }

    public boolean isScreenCapture() {
        return videoTrack != null && videoTrack.isScreenCapture();
    }

    public StringeeVideoTrack.TrackType getTrackType() {
        return videoTrack != null ? videoTrack.getTrackType() : StringeeVideoTrack.TrackType.PLAYER;
    }

    public void setRoomWrapper(StringeeVideoRoomWrapper roomWrapper) {
        this.roomWrapper = roomWrapper;
    }

    @Override
    public void onMediaAvailable() {
        if (roomWrapper != null) {
            roomWrapper.sendTrackReadyToPlayEvent(this);
        }
    }

    @Override
    public void onMediaStateChange(MediaState mediaState) {

    }
}
