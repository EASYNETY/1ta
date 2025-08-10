// Create this as a separate component: components/video/AwsS3VideoPlayer.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, AlertCircle } from "lucide-react"

interface AwsS3VideoPlayerProps {
    videoUrl: string
    poster?: string
    className?: string
    lesson?: {
        id: string
        title: string
        duration?: string
    }
}

export function AwsS3VideoPlayer({ videoUrl, poster, className = "", lesson }: AwsS3VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState("")
    const [loadAttempts, setLoadAttempts] = useState(0)
    const [actualDuration, setActualDuration] = useState<number | null>(null)
    const [currentTime, setCurrentTime] = useState(0)

    // Clean and validate the video URL
    const cleanVideoUrl = videoUrl?.trim()
    const isValidUrl = cleanVideoUrl && (cleanVideoUrl.startsWith('http') || cleanVideoUrl.startsWith('https'))

    // Format duration helper
    const formatTime = (seconds: number) => {
        if (isNaN(seconds) || seconds < 0) return "0:00"
        
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = Math.floor(seconds % 60)
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`
    }

    useEffect(() => {
        if (!isValidUrl) {
            setHasError(true)
            setIsLoading(false)
            setErrorMessage("Invalid or missing video URL")
            return
        }

        const video = videoRef.current
        if (!video) return

        // Reset states when URL changes
        setHasError(false)
        setIsLoading(true)
        setLoadAttempts(0)
        setActualDuration(null)
        setCurrentTime(0)

        const handleLoadStart = () => {
            console.log('Video load started for:', cleanVideoUrl)
            setIsLoading(true)
            setHasError(false)
        }

        const handleCanPlay = () => {
            console.log('Video can play')
            setIsLoading(false)
        }

        const handleLoadedData = () => {
            console.log('Video data loaded')
            setIsLoading(false)
        }

        const handleLoadedMetadata = () => {
            if (video.duration && !isNaN(video.duration)) {
                setActualDuration(video.duration)
                console.log('Video duration loaded:', video.duration, 'seconds')
                console.log('Formatted duration:', formatTime(video.duration))
                
                // Compare with lesson duration if provided
                if (lesson?.duration) {
                    console.log('Lesson duration from API:', lesson.duration)
                    console.log('Actual video duration:', formatTime(video.duration))
                }
            }
        }

        const handleTimeUpdate = () => {
            if (video.currentTime) {
                setCurrentTime(video.currentTime)
            }
        }

        const handleError = (e: Event) => {
            const target = e.target as HTMLVideoElement
            const error = target.error
            
            console.error('Video error:', error)
            console.error('Video URL:', cleanVideoUrl)
            console.error('Error code:', error?.code)
            console.error('Error message:', error?.message)
            
            setHasError(true)
            setIsLoading(false)
            
            let errorMsg = "Failed to load video"
            if (error) {
                switch (error.code) {
                    case MediaError.MEDIA_ERR_ABORTED:
                        errorMsg = "Video loading was aborted"
                        break
                    case MediaError.MEDIA_ERR_NETWORK:
                        errorMsg = "Network error occurred while loading video"
                        break
                    case MediaError.MEDIA_ERR_DECODE:
                        errorMsg = "Video format is not supported or corrupted"
                        break
                    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                        errorMsg = "Video format is not supported by your browser"
                        break
                    default:
                        errorMsg = error.message || "Unknown video error"
                }
            }
            setErrorMessage(errorMsg)
        }

        const handlePlay = () => setIsPlaying(true)
        const handlePause = () => setIsPlaying(false)

        video.addEventListener('loadstart', handleLoadStart)
        video.addEventListener('canplay', handleCanPlay)
        video.addEventListener('loadeddata', handleLoadedData)
        video.addEventListener('loadedmetadata', handleLoadedMetadata)
        video.addEventListener('timeupdate', handleTimeUpdate)
        video.addEventListener('error', handleError)
        video.addEventListener('play', handlePlay)
        video.addEventListener('pause', handlePause)

        // Force load the video
        video.load()

        return () => {
            video.removeEventListener('loadstart', handleLoadStart)
            video.removeEventListener('canplay', handleCanPlay)
            video.removeEventListener('loadeddata', handleLoadedData)
            video.removeEventListener('loadedmetadata', handleLoadedMetadata)
            video.removeEventListener('timeupdate', handleTimeUpdate)
            video.removeEventListener('error', handleError)
            video.removeEventListener('play', handlePlay)
            video.removeEventListener('pause', handlePause)
        }
    }, [cleanVideoUrl, isValidUrl])

    const togglePlay = () => {
        const video = videoRef.current
        if (!video) return

        if (video.paused) {
            video.play().catch(console.error)
        } else {
            video.pause()
        }
    }

    const retryLoad = () => {
        const video = videoRef.current
        if (!video) return

        setLoadAttempts(prev => prev + 1)
        setHasError(false)
        setIsLoading(true)
        
        // Try to reload the video
        video.load()
        
        console.log(`Retry attempt ${loadAttempts + 1} for video:`, cleanVideoUrl)
    }

    if (!isValidUrl) {
        return (
            <div className={`aspect-video w-full bg-red-50 border border-red-200 flex items-center justify-center ${className}`}>
                <div className="text-center p-6">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                    <h3 className="text-lg font-medium text-red-800 mb-2">Invalid Video URL</h3>
                    <p className="text-sm text-red-600 mb-2">The video URL is missing or invalid.</p>
                    <div className="text-xs text-red-500 font-mono bg-red-100 p-2 rounded">
                        URL: {videoUrl || 'null'}
                    </div>
                </div>
            </div>
        )
    }

    if (hasError) {
        return (
            <div className={`aspect-video w-full bg-red-50 border border-red-200 flex items-center justify-center ${className}`}>
                <div className="text-center p-6">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                    <h3 className="text-lg font-medium text-red-800 mb-2">Video Loading Error</h3>
                    <p className="text-sm text-red-600 mb-4">{errorMessage}</p>
                    
                    <div className="space-y-3">
                        <button
                            onClick={retryLoad}
                            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Retry ({loadAttempts}/3)
                        </button>
                        
                        <div className="text-xs text-red-500 space-y-1">
                            <div>Lesson: {lesson?.title}</div>
                            <div className="font-mono bg-red-100 p-2 rounded break-all">
                                URL: {cleanVideoUrl}
                            </div>
                        </div>
                        
                        {/* Test direct link */}
                        <a
                            href={cleanVideoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                            Test video URL directly
                        </a>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`relative aspect-video w-full bg-black ${className}`}>
            {isLoading && (
                <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-10">
                    <div className="text-center text-white">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent mx-auto mb-2"></div>
                        <p className="text-sm">Loading video...</p>
                        <p className="text-xs mt-1 opacity-75">{lesson?.title}</p>
                    </div>
                </div>
            )}

            <video
                ref={videoRef}
                className="w-full h-full"
                poster={poster}
                controls
                preload="metadata"
                controlsList="nodownload"
                playsInline
            >
                <source src={cleanVideoUrl} type="video/mp4" />
                <source src={cleanVideoUrl} type="video/webm" />
                <source src={cleanVideoUrl} type="video/ogg" />
                Your browser does not support the video tag.
            </video>

            {/* Duration info overlay - for debugging */}
            {process.env.NODE_ENV === 'development' && actualDuration && (
                <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
                    <div>API Duration: {lesson?.duration || 'N/A'}</div>
                    <div>Actual Duration: {formatTime(actualDuration)}</div>
                    <div>Current Time: {formatTime(currentTime)}</div>
                </div>
            )}
        </div>
    )
}
//                 <source src={cleanVideoUrl} type="video/mp4" />
//                 <source src={cleanVideoUrl} type="video/webm" />
//                 <source src={cleanVideoUrl} type="video/ogg" />
//                 Your browser does not support the video tag.
//             </video>

//             {/* Duration info overlay - for debugging */}
//             {process.env.NODE_ENV === 'development' && actualDuration && (
//                 <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
//                     <div>API Duration: {lesson?.duration || 'N/A'}</div>
//                     <div>Actual Duration: {formatTime(actualDuration)}</div>
//                     <div>Current Time: {formatTime(currentTime)}</div>
//                 </div>
//             )}
//         </div>
//     )
// }
//                 <source src={cleanVideoUrl} type="video/mp4" />
//                 <source src={cleanVideoUrl} type="video/webm" />
//                 <source src={cleanVideoUrl} type="video/ogg" />
//                 Your browser does not support the video tag.
//             </video>
//         </div>
//     )
// }