import React, { useRef, useState, useEffect, useLayoutEffect } from 'react'
import { Play, Pause } from 'lucide-react'
import { Rnd } from 'react-rnd'
import { FilterType } from '../types/filter'
import { TimelineItem } from '../types/timeline'

interface TimelineProps {
  videoElement: HTMLVideoElement | null
  items: TimelineItem[]
  setItems: React.Dispatch<React.SetStateAction<TimelineItem[]>>
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`
}

const Timeline: React.FC<TimelineProps> = ({ videoElement, items, setItems }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSeeking, setIsSeeking] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  const disabled = !videoElement

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedItemId) {
        setItems(prev => prev.filter(item => item.id !== selectedItemId))
        setSelectedItemId(null)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedItemId, setItems])

  useLayoutEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.getBoundingClientRect().width)
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    if (!videoElement) return
    const vid = videoElement
    const onLoaded = () => {
      setDuration(vid.duration * 1000)
      setIsPlaying(!vid.paused)
    }
    const onTimeUpdate = () => {
      if (!isSeeking) setCurrentTime(vid.currentTime * 1000)
    }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)

    vid.addEventListener('loadedmetadata', onLoaded)
    vid.addEventListener('timeupdate', onTimeUpdate)
    vid.addEventListener('play', onPlay)
    vid.addEventListener('pause', onPause)
    if (vid.readyState >= 1) onLoaded()

    return () => {
      vid.removeEventListener('loadedmetadata', onLoaded)
      vid.removeEventListener('timeupdate', onTimeUpdate)
      vid.removeEventListener('play', onPlay)
      vid.removeEventListener('pause', onPause)
    }
  }, [videoElement, isSeeking])

  const togglePlay = () => {
    if (!videoElement) return
    isPlaying ? videoElement.pause() : videoElement.play()
  }

  const onHandleMouseDown = (e: React.MouseEvent) => {
    if (!videoElement || !containerRef.current) return
    e.preventDefault()
    setIsSeeking(true)
    const rect = containerRef.current.getBoundingClientRect()

    const onMouseMove = (moveEvent: MouseEvent) => {
      let x = moveEvent.clientX - rect.left
      x = Math.max(0, Math.min(x, rect.width))
      setCurrentTime((x / rect.width) * duration)
    }
    const onMouseUp = (upEvent: MouseEvent) => {
      let x = upEvent.clientX - rect.left
      x = Math.max(0, Math.min(x, rect.width))
      videoElement.currentTime = ((x / rect.width) * duration) / 1000
      setIsSeeking(false)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault()
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const filterType = e.dataTransfer.getData('filter') as FilterType
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const startTime = (x / rect.width) * duration
    const defaultDuration = 1000
    const newItem: TimelineItem = {
      id: Date.now().toString(),
      filterType,
      startTime,
      endTime: Math.min(duration, startTime + defaultDuration),
    }
    setItems(prev => [...prev, newItem])
  }

  const handleDragStop = (id: string, x: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const newStart = (x / rect.width) * duration
    const item = items.find(it => it.id === id)!
    const length = item.endTime - item.startTime
    setItems(prev =>
      prev.map(it =>
        it.id === id ? { ...it, startTime: newStart, endTime: newStart + length } : it
      )
    )
  }

  const handleResizeStop = (
    id: string,
    _e: any,
    _dir: any,
    refEl: HTMLElement,
    _delta: any,
    position: { x: number; y: number }
  ) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const widthPx = refEl.getBoundingClientRect().width
    const newStart = (position.x / rect.width) * duration
    const newEnd = ((position.x + widthPx) / rect.width) * duration
    setItems(prev =>
      prev.map(it => (it.id === id ? { ...it, startTime: newStart, endTime: newEnd } : it))
    )
  }

  const scrubberX = duration > 0 ? (currentTime / duration) * containerWidth : 0

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-2 px-1">
        {videoElement && <span className="text-xs text-gray-700">0</span>}
        <button
          onClick={togglePlay}
          disabled={disabled}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="p-1 rounded hover:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
        {videoElement && <span className="text-xs text-gray-700">{formatTime(duration)}</span>}
      </div>

      <div className="relative flex-1">
        <div
          className="absolute top-0 left-0 right-0 h-6 pointer-events-none z-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to right, #999 0px, #999 1px, transparent 1px, transparent 50px)',
          }}
        />

        {duration > 0 && (
          <div
            onMouseDown={disabled ? undefined : onHandleMouseDown}
            className="absolute z-50"
            style={{
              left: scrubberX,
              top: -8,
              cursor: disabled ? 'not-allowed' : 'ew-resize',
            }}
          >
            <div className="w-4 h-4 bg-black rounded-sm transform -translate-x-1/2" />
          </div>
        )}

        {duration > 0 && (
          <div
            className="absolute bg-black pointer-events-none z-40"
            style={{
              left: scrubberX,
              top: 6,
              bottom: 0,
              width: 1,
            }}
          />
        )}

        <div
          ref={containerRef}
          onClick={() => setSelectedItemId(null)}
          className={`absolute top-6 left-0 right-0 bottom-0 rounded-lg border-2 border-dashed ${
            disabled
              ? 'bg-gray-100 border-gray-300 pointer-events-none'
              : 'bg-gray-200 border-gray-300 transition-colors hover:border-blue-400 hover:bg-gray-100'
          }`}
          onDragOver={disabled ? undefined : handleDragOver}
          onDrop={disabled ? undefined : handleDrop}
        >
          {items.map(item => {
            if (!containerRef.current) return null
            const rect = containerRef.current.getBoundingClientRect()
            const trackH = rect.height
            const elH = trackH * 0.8
            const yOff = (trackH - elH) / 2
            const xPx = (item.startTime / duration) * rect.width
            const wPx = ((item.endTime - item.startTime) / duration) * rect.width
            const isSelected = selectedItemId === item.id

            return (
              <Rnd
                key={item.id}
                dragAxis="x"
                disableDragging={disabled}
                enableResizing={disabled ? false : { left: true, right: true }}
                bounds="parent"
                size={{ width: wPx, height: elH }}
                position={{ x: xPx, y: yOff }}
                onDragStop={disabled ? undefined : (_e, d) => handleDragStop(item.id, d.x)}
                onResizeStop={
                  disabled
                    ? undefined
                    : (e, dir, refEl, delta, pos) =>
                        handleResizeStop(item.id, e, dir, refEl, delta, {
                          x: pos.x,
                          y: pos.y,
                        })
                }
              >
                <div
                  onClick={e => {
                    e.stopPropagation()
                    setSelectedItemId(item.id)
                  }}
                  className={`w-full h-full flex items-center justify-center text-xs text-white bg-blue-500 bg-opacity-80 rounded border shadow-sm hover:bg-opacity-90 transition-all ${
                    isSelected ? 'ring-2 ring-yellow-400' : ''
                  }`}
                >
                  <span className="font-medium truncate px-1">{item.filterType}</span>
                </div>
              </Rnd>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Timeline
