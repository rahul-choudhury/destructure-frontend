"use client"

import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion, Variants } from "motion/react"
import { useRef, useState, VideoHTMLAttributes } from "react"

function extractVideoDimensions(src: string) {
  try {
    const url = new URL(src)
    const width = url.searchParams.get("width")
    const height = url.searchParams.get("height")
    return {
      width: width ? Number(width) : undefined,
      height: height ? Number(height) : undefined,
    }
  } catch {
    return {}
  }
}

const iconVariants: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.15 } },
  exit: { scale: 0.8, opacity: 0, transition: { duration: 0.15 } },
}

export function VideoPlayer({
  className,
  src,
  ...props
}: VideoHTMLAttributes<HTMLVideoElement>) {
  const [isPlaying, setIsPlaying] = useState(false)
  const ref = useRef<HTMLVideoElement>(null)
  const notDesktop = useMediaQuery("(max-width: 1023px)")
  const { width, height } =
    typeof src === "string" ? extractVideoDimensions(src) : {}

  const handleVideoPlayback = () => {
    const video = ref.current
    if (!video) return

    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault()
      handleVideoPlayback()
    }
  }

  return (
    <div className="group relative my-6 overflow-hidden rounded-lg">
      <video
        ref={ref}
        src={src}
        width={width}
        height={height}
        muted
        loop
        playsInline
        preload="auto"
        className={cn("mx-auto", className)}
        {...props}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <button
        aria-label={isPlaying ? "Pause Video" : "Play Video"}
        className="focus-visible:ring-ring absolute inset-0 cursor-pointer border-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        onClick={handleVideoPlayback}
        onKeyDown={handleKeyDown}
      >
        <div
          className={cn(
            "absolute top-1/2 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white/90 opacity-0 transition-opacity group-hover:opacity-100",
            !isPlaying && "opacity-100",
          )}
        >
          {notDesktop ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M7.65703 2.27884C6.49076 1.57201 5 2.41169 5 3.77543V20.2247C5 21.5884 6.49076 22.4281 7.65703 21.7213L21.2276 13.4966C22.3516 12.8155 22.3516 11.1846 21.2276 10.5035L7.65703 2.27884Z"
                fill="currentColor"
                strokeWidth="1"
              />
            </svg>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              {!isPlaying ? (
                <motion.svg
                  key="play"
                  variants={iconVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M7.65703 2.27884C6.49076 1.57201 5 2.41169 5 3.77543V20.2247C5 21.5884 6.49076 22.4281 7.65703 21.7213L21.2276 13.4966C22.3516 12.8155 22.3516 11.1846 21.2276 10.5035L7.65703 2.27884Z"
                    fill="currentColor"
                    strokeWidth="1"
                  />
                </motion.svg>
              ) : (
                <motion.svg
                  key="pause"
                  variants={iconVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M5.75 3C4.7835 3 4 3.7835 4 4.75V19.25C4 20.2165 4.7835 21 5.75 21H8.25C9.2165 21 10 20.2165 10 19.25V4.75C10 3.7835 9.2165 3 8.25 3H5.75Z"
                    fill="currentColor"
                  />
                  <path
                    d="M15.75 3C14.7835 3 14 3.7835 14 4.75V19.25C14 20.2165 14.7835 21 15.75 21H18.25C19.2165 21 20 20.2165 20 19.25V4.75C20 3.7835 19.2165 3 18.25 3H15.75Z"
                    fill="currentColor"
                  />
                </motion.svg>
              )}
            </AnimatePresence>
          )}
        </div>
      </button>
    </div>
  )
}
