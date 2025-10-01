/** @format */

"use client";

import { VideoCarousel } from "@/components/video-carousel";
import { useEffect, useState } from "react";

interface Video {
  _id: string;
  videoUrl: string;
  createdAt: string;
  views: number;
  downloads: number;
}

export default function MyComponent() {
  const [data, setData] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/videos")
      .then((res) => res.json())
      .then((result) => {
        console.log("Response:", result);
        if (Array.isArray(result)) {
          setData(result);
        } else {
          setError("Invalid response format");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-background overflow-hidden relative bg-black">
      <div className="w-full h-full absolute">
        <img
          src="/images/background.png"
          alt="Background"
          className="w-full h-full object-contain"
        />
      </div>

      {/* 9:16 aspect ratio container centered on screen */}
      <div className="relative translate-y-[118px] aspect-[9/16] w-[190px] rounded-lg overflow-hidden shadow-2xl">
        <VideoCarousel videos={data} />
      </div>
    </main>
  );
}
