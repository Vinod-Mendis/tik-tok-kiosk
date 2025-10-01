/** @format */

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Video {
  _id: string;
  videoUrl: string;
  createdAt: string;
  views: number;
  downloads: number;
}

interface VideoCarouselProps {
  videos: Video[];
}

export function VideoCarousel({ videos }: VideoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Preload next video
  useEffect(() => {
    const nextIndex = (currentIndex + 1) % videos.length;
    const nextVideo = videoRefs.current[nextIndex];

    if (nextVideo) {
      nextVideo.load();
    }
  }, [currentIndex, videos.length]);

  // Handle video end
  const handleVideoEnd = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  // Auto-play current video
  useEffect(() => {
    const currentVideo = videoRefs.current[currentIndex];

    if (currentVideo) {
      currentVideo.play().catch((error) => {
        console.log("[v0] Video autoplay failed:", error);
      });
    }
  }, [currentIndex]);

  const variants = {
    enter: {
      y: "100%",
      opacity: 0,
    },
    center: {
      y: 0,
      opacity: 1,
    },
    exit: {
      y: "-100%",
      opacity: 0,
    },
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            y: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.7 },
          }}
          className="absolute inset-0">
          <video
            ref={(el) => {
              videoRefs.current[currentIndex] = el;
            }}
            src={videos[currentIndex].videoUrl}
            className="w-full h-full object-cover"
            playsInline
            muted
            onEnded={handleVideoEnd}
            preload="auto"
          />
        </motion.div>
      </AnimatePresence>

      {/* Preload next video (hidden) */}
      {videos.map((video, index) => {
        if (index === currentIndex) return null;
        return (
          <video
            key={video._id}
            ref={(el) => {
              videoRefs.current[index] = el;
            }}
            src={video.videoUrl}
            className="hidden"
            playsInline
            muted
            preload="auto"
          />
        );
      })}
    </div>
  );
}
