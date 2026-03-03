"use client";

import { useState, useRef } from "react";

export default function SoundToggle() {
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleSound = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
    if (v === 0 && !isMuted) {
      audioRef.current?.pause();
      setIsMuted(true);
    } else if (v > 0 && isMuted) {
      audioRef.current?.play();
      setIsMuted(false);
    }
  };

  return (
    <>
      <audio ref={audioRef} loop preload="none">
        <source src="/audio/ambient-loop.m4a" type="audio/mp4" />
      </audio>

      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {!isMuted && (
          <div
            style={{
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 999,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="volume-slider"
              aria-label="Volume"
              style={{
                background: `linear-gradient(to right, #C9A962 0%, #C9A962 ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`,
              }}
            />
            <span
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 11,
                fontFamily: "monospace",
                minWidth: 24,
                textAlign: "right",
              }}
            >
              {Math.round(volume * 100)}
            </span>
          </div>
        )}
        <button
          onClick={toggleSound}
          className="w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover:border-gold transition-colors"
          aria-label={isMuted ? "Turn sound on" : "Turn sound off"}
        >
          {isMuted ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>
      </div>
    </>
  );
}
