"use client";

import { useState, useEffect, useRef } from "react";

export default function VideoBackground() {
  const [videoSrc, setVideoSrc] = useState("/videos/GOESTO_HAWAII_720.mp4");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    setVideoSrc(
      isMobile
        ? "/videos/goestohawaii_720_mobile.mp4"
        : "/videos/GOESTO_HAWAII_720.mp4"
    );
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="video-background"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      <div className="video-overlay" />
    </>
  );
}
