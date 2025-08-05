import React, { useState, ChangeEvent } from 'react'

interface VideoPlayerProps {
  src: string | null
  onLoadedMetadata?: () => void
  loading?: boolean
  onSrcChange?: (newSrc: string) => void
  videoElementRef: (instance: HTMLVideoElement | null) => void
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  onLoadedMetadata,
  loading = false,
  onSrcChange = () => {},
  videoElementRef,
}) => {
  const [inputUrl, setInputUrl] = useState('')
  const [fileError, setFileError] = useState<string | null>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFileError(null)
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('video/')) {
      setFileError('Please select a valid video file.')
      return
    }
    const objectUrl = URL.createObjectURL(file)
    onSrcChange(objectUrl)
  }

  const handleUrlLoad = () => {
    if (!inputUrl) {
      setFileError('Please enter a URL.')
      return
    }
    onSrcChange(inputUrl.trim())
    setInputUrl('')
  }

  if (!src) {
    return (
      <div className="relative w-full h-[70vh] bg-black rounded-xl flex flex-col items-center justify-center p-4">
        <p className="text-white mb-4">No video loaded</p>
        <input type="file" accept="video/*" onChange={handleFileChange} className="mb-3" />
        <div className="flex mb-3 w-full">
          <input
            type="text"
            placeholder="Enter video URL"
            value={inputUrl}
            onChange={e => setInputUrl(e.target.value)}
            className="flex-1 px-3 py-2 rounded-l-lg border border-gray-300 focus:outline-none"
          />
          <button onClick={handleUrlLoad} className="px-4 py-2 bg-blue-600 text-white rounded-r-lg">
            Load
          </button>
        </div>
        {fileError && <p className="text-red-500">{fileError}</p>}
      </div>
    )
  }

  return (
    <div className="relative w-full h-[70vh] flex items-center justify-center bg-black rounded-xl overflow-hidden">
      <video
        ref={videoElementRef}
        src={src}
        className="w-full h-full object-contain transition-all duration-300 ease-in-out"
        onLoadedMetadata={onLoadedMetadata}
        crossOrigin="anonymous"
      />
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm z-10">
          <div className="flex flex-col items-center gap-4 text-white p-4">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="text-sm font-medium">Processing video...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoPlayer