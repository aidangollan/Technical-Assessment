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
  const [response, setResponse] = useState<VideoProcessingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRequestVideo = async (filter: FilterType) => {
    setResponse(null);
    setError(null);
    const { data, error } = await requestVideo(filter);
    if (error) {
      setError(error);
    } else if (data) {
      setResponse(data);
      setCurrentVideoUrl(data.output_url);
    }
  };

  const handleResetVideo = () => {
    setCurrentVideoUrl(videoUrl);
    setResponse(null);
    setError(null);
  };

  return (
    <div className="w-full h-screen overflow-hidden">
      <div className="flex gap-4 h-full p-5">
        <div className="w-3/5 flex items-center justify-center min-w-0">
          <div className="relative w-full max-w-2xl rounded-lg overflow-hidden shadow-lg">
            <VideoPlayer
              ref={videoRef}
              src={currentVideoUrl}
              onLoadedMetadata={() => console.log('Video loaded')}
            />
            {response && (
              <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
                Filter Applied: Success
              </div>
            )}
            {currentVideoUrl !== videoUrl && (
              <button
                onClick={handleResetVideo}
                className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Reset to Original
              </button>
            )}
          </div>
        </div>
        
        <div className="w-2/5 flex min-w-0">
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