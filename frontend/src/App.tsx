import React, { useRef, useState } from 'react';
import VideoPlayer from './components/VideoPlayer';
import FilterMenu from './components/FilterMenu';
import { FilterType } from './types/filter';
import { videoUrl } from './consts';
import { useVideo } from './hooks/useVideo';
import { VideoProcessingResponse } from './types/api';

export interface FaceDetection {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  label?: string;
}

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { loading, requestVideo } = useVideo();
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>(videoUrl);
  const [error, setError] = useState<string | null>(null);

  const handleRequestVideo = async (filter: FilterType) => {
    setError(null);
    const { data, error } = await requestVideo(filter, videoUrl);
    if (error) {
      setError(error);
    } else if (data) {
      setCurrentVideoUrl(data.output_url);
    }
  };

  const handleResetVideo = () => {
    setCurrentVideoUrl(videoUrl);
    setError(null);
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-gray-50">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full p-4 lg:p-6">
        <div className="flex-1 lg:w-3/5 flex items-center justify-center min-w-0 min-h-0">
          <div className="relative w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl bg-white">
            <VideoPlayer
              ref={videoRef}
              src={currentVideoUrl}
              loading={loading}
              onLoadedMetadata={() => console.log('Video loaded')}
            />
            {currentVideoUrl !== videoUrl && (
              <button
                onClick={handleResetVideo}
                className="absolute top-3 right-3 bg-gray-800 bg-opacity-90 hover:bg-opacity-100 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg backdrop-blur-sm"
              >
                Reset to Original
              </button>
            )}
          </div>
        </div>
        
        <div className="w-full lg:w-2/5 flex min-w-0 min-h-0">
          <FilterMenu
            loading={loading}
            handleRequestVideo={handleRequestVideo}
            error={error}
          />
        </div>
      </div>
    </div>
  );
};

export default App;