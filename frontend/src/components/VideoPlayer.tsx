import React, { forwardRef } from 'react';

interface VideoPlayerProps {
  src: string;
  onLoadedMetadata?: () => void;
  loading?: boolean;
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ src, onLoadedMetadata, loading = false }, ref) => {
    return (
      <div className="relative w-full">
        <video
          ref={ref}
          src={src}
          className="w-full max-w-full h-auto block transition-all duration-300 ease-in-out"
          controls
          onLoadedMetadata={onLoadedMetadata}
          crossOrigin="anonymous"
        />
        
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 text-white">
              <div className="text-center">
                <div className="text-lg font-semibold mb-1">Processing Video</div>
                <div className="text-sm text-gray-300">Applying filter effects...</div>
              </div>
              
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;