import React, { useRef, useState } from 'react';
import VideoPlayer from './components/VideoPlayer';
import FilterMenu, { FilterOptions } from './components/FilterMenu';
import { videoUrl } from './consts';

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
  const [filters, setFilters] = useState<FilterOptions>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: false,
    sepia: false
  });

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    if (videoRef.current) {
      const filterString = [
        `brightness(${newFilters.brightness}%)`,
        `contrast(${newFilters.contrast}%)`,
        `saturate(${newFilters.saturation}%)`,
        `blur(${newFilters.blur}px)`,
        newFilters.grayscale ? 'grayscale(100%)' : '',
        newFilters.sepia ? 'sepia(100%)' : ''
      ].filter(Boolean).join(' ');
      
      videoRef.current.style.filter = filterString;
    }
  }

  return (
    <div className="app-container">
      <div className="main-layout">
        <div className="video-section">
          <div className="video-container">
            <VideoPlayer
              ref={videoRef}
              src={videoUrl}
              onLoadedMetadata={() => console.log('Video loaded')}
            />
          </div>
        </div>
        
        <div className="filter-section">
          <FilterMenu onApplyFilters={handleApplyFilters} />
        </div>
      </div>
    </div>
  );
};

export default App; 