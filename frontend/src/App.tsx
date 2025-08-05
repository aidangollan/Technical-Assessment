import React, { useState, useEffect, useRef } from 'react'
import VideoPlayer from './components/VideoPlayer'
import FilterMenu from './components/FilterMenu'
import { useVideo } from './hooks/useVideo'
import Timeline from './components/TimeLine'
import { TimelineItem } from './types/timeline'

const App: React.FC = () => {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null)
  const { loading, requestVideo } = useVideo()
  const [originalVideoUrl, setOriginalVideoUrl] = useState<string | null>(null)
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([])
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleRequestVideo = async () => {
    setError(null)
    if (timelineItems.length === 0 || !originalVideoUrl) return;
    const { data, error } = await requestVideo(timelineItems, originalVideoUrl)
    if (error) {
      setError(error)
    } else if (data) {
      setCurrentVideoUrl(data.output_url)
    }
  }

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      handleRequestVideo()
    }, 2000)
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [timelineItems])

  const handleResetVideo = () => {
    setCurrentVideoUrl(null)
    setOriginalVideoUrl(null)
    setError(null)
    setTimelineItems([])
  }

  const handleChangeVideo = (src: string) => {
    setOriginalVideoUrl(src)
    setCurrentVideoUrl(src)
    setError(null)
  }

  return (
    <div className="w-full h-screen overflow-hidden bg-gray-50">
      <div className="flex gap-6 h-full p-6">
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <div className="flex-none flex items-center justify-center mb-4">
            <div className="relative w-full h-full max-w-5xl max-h-full rounded-xl overflow-hidden shadow-2xl bg-white">
              <VideoPlayer
                videoElementRef={setVideoElement}
                src={currentVideoUrl}
                loading={loading}
                onLoadedMetadata={() => console.log('Video loaded')}
                onSrcChange={handleChangeVideo}
              />
              {currentVideoUrl !== originalVideoUrl && (
                <button
                  onClick={handleResetVideo}
                  className="absolute top-3 right-3 bg-gray-800 bg-opacity-90 hover:bg-opacity-100 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg backdrop-blur-sm z-10"
                >
                  Reset to Original
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <Timeline
              videoElement={videoElement}
              items={timelineItems}
              setItems={setTimelineItems}
            />
          </div>
        </div>
        <div className="w-80 flex-shrink-0 h-full">
          <FilterMenu
            loading={loading}
            handleRequestVideo={handleRequestVideo}
            error={error}
          />
        </div>
      </div>
    </div>
  )
}

export default App
