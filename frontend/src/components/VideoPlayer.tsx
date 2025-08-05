import React, { forwardRef } from 'react';

interface VideoPlayerProps {
  src: string;
  onLoadedMetadata?: () => void;
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ src, onLoadedMetadata }, ref) => {
    return (
      <video
        ref={ref}
        src={src}
        className="w-full max-w-full h-auto block transition-all duration-300 ease-in-out"
        controls
        onLoadedMetadata={onLoadedMetadata}
        crossOrigin="anonymous"
      />
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;