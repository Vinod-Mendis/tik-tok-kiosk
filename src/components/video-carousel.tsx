/** @format */

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MusicIcon } from "lucide-react";
import { IoIosShareAlt, IoMdHeart } from "react-icons/io";
import { FaCommentDots } from "react-icons/fa";

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
  const [blobUrls, setBlobUrls] = useState<Map<string, string>>(new Map());
  const [loadingVideos, setLoadingVideos] = useState<Set<string>>(new Set());
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const prevVideosLengthRef = useRef(videos.length);
  const [interactions, setInteractions] = useState<
    Map<string, { likes: number; comments: number }>
  >(new Map());

  const getRandomInteractions = (videoId: string) => {
    if (!interactions.has(videoId)) {
      return {
        likes: Math.floor(Math.random() * 10000) + 100,
        comments: Math.floor(Math.random() * 500) + 10,
      };
    }
    return interactions.get(videoId)!;
  };

  useEffect(() => {
    if (videos[currentIndex] && !interactions.has(videos[currentIndex]._id)) {
      const videoId = videos[currentIndex]._id;
      const newInteractions = {
        likes: Math.floor(Math.random() * 10000) + 100,
        comments: Math.floor(Math.random() * 500) + 10,
      };
      setInteractions((prev) => new Map(prev).set(videoId, newInteractions));
    }
  }, [currentIndex, videos, interactions]);

  // Function to fetch video as blob
  const fetchVideoAsBlob = async (videoUrl: string, videoId: string) => {
    if (blobUrls.has(videoId) || loadingVideos.has(videoId)) {
      return;
    }

    setLoadingVideos((prev) => new Set(prev).add(videoId));

    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      setBlobUrls((prev) => new Map(prev).set(videoId, blobUrl));
      setLoadingVideos((prev) => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
    } catch (error) {
      console.error(`Failed to fetch video ${videoId}:`, error);
      setLoadingVideos((prev) => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
    }
  };

  // Load current and next video as blobs
  useEffect(() => {
    if (videos.length === 0) return;

    const currentVideo = videos[currentIndex];
    const nextIndex = (currentIndex + 1) % videos.length;
    const nextVideo = videos[nextIndex];

    // Fetch current video
    if (currentVideo) {
      fetchVideoAsBlob(currentVideo.videoUrl, currentVideo._id);
    }

    // Preload next video
    if (nextVideo) {
      fetchVideoAsBlob(nextVideo.videoUrl, nextVideo._id);
    }
  }, [currentIndex, videos]);

  // Preload new videos when they're added to the list
  useEffect(() => {
    if (videos.length > prevVideosLengthRef.current) {
      // New videos were added
      const newVideos = videos.slice(prevVideosLengthRef.current);

      console.log(`Preloading ${newVideos.length} new videos in background`);

      // Preload new videos in the background without blocking
      newVideos.forEach((video) => {
        fetchVideoAsBlob(video.videoUrl, video._id);
      });
    }

    prevVideosLengthRef.current = videos.length;
  }, [videos.length]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      blobUrls.forEach((blobUrl) => {
        URL.revokeObjectURL(blobUrl);
      });
    };
  }, []);

  // Handle video end
  const handleVideoEnd = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  // Auto-play current video when blob is ready
  useEffect(() => {
    const currentVideo = videoRefs.current[currentIndex];
    const currentVideoId = videos[currentIndex]?._id;

    if (currentVideo && blobUrls.has(currentVideoId)) {
      currentVideo.play().catch((error) => {
        console.log("[v0] Video autoplay failed:", error);
      });
    }
  }, [currentIndex, blobUrls, videos]);

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

  if (videos.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        No videos available
      </div>
    );
  }

  const currentBlobUrl = blobUrls.get(videos[currentIndex]._id);
  const currentInteractions = getRandomInteractions(videos[currentIndex]._id);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {!currentBlobUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
          Loading video...
        </div>
      )}

      {currentBlobUrl && (
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
              src={currentBlobUrl}
              className="w-full h-full object-cover"
              playsInline
              muted
              onEnded={handleVideoEnd}
              preload="auto"
            />
            <div className="absolute bottom-0 w-full h-fit pb-10 px-10 flex justify-between items-end text-white bg-gradient-to-t from-black/70 to-transparent">
              <div className="flex flex-col">
                <img
                  src="/images/roaradx-logo.svg"
                  className="w-20 h-auto scale-90"
                  alt="Logo"
                />
                <p className="py-2">@roaradx</p>
                <p className="font-light">I was here at Tik Tok Accelerate</p>
                <p className="font-light">#roaradx #tiktok #fun</p>
                <div className="flex gap-2 items-center font-light">
                  <MusicIcon size={16} className="translate-y-0.5" />
                  <div className="w-44 overflow-hidden whitespace-nowrap relative">
                    <div className="animate-marquee inline-block">
                      original sound - roaradx &nbsp; original sound - roaradx
                      &nbsp; original sound - roaradx &nbsp; original sound -
                      roaradx
                    </div>
                    <div className="animate-marquee inline-block absolute left-full">
                      original sound - roaradx &nbsp; original sound - roaradx
                      &nbsp; original sound - roaradx &nbsp; original sound -
                      roaradx
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-6 font-light">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 flex justify-center items-center">
                    <IoMdHeart className="w-full h-auto" />
                  </div>
                  <p>
                    {currentInteractions.likes > 1000
                      ? `${(currentInteractions.likes / 1000).toFixed(1)}k`
                      : currentInteractions.likes}
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 flex justify-center items-center">
                    <FaCommentDots className="w-full h-auto" />
                  </div>
                  <p>{currentInteractions.comments}</p>
                </div>
                <div className="flex flex-col items-center mb-10">
                  <div className="w-10 h-10 flex justify-center items-center">
                    <IoIosShareAlt className="w-full h-auto" />
                  </div>
                  <p>share</p>
                </div>
                <div className="rounded-full h-12 w-12 bg-angular-gradient animate-spin-slow flex justify-center items-center">
                  <div className="rounded-full bg-white h-4 w-4"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Preload next video (hidden) */}
      {videos.map((video, index) => {
        if (index === currentIndex) return null;
        const videoBlobUrl = blobUrls.get(video._id);
        if (!videoBlobUrl) return null;

        return (
          <video
            key={video._id}
            ref={(el) => {
              videoRefs.current[index] = el;
            }}
            src={videoBlobUrl}
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
