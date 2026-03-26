"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getSavedLang, saveLang, type Lang } from "@/lib/lang";

// =============================================================================
// KoeCodec — JavaScript implementation
// =============================================================================

const FRAME_SIZE = 320;
const HOP_SIZE = 160;
const N_BANDS = 20;

// MDCT basis + window (computed once)
function createMDCT() {
  const N2 = FRAME_SIZE;
  const N = HOP_SIZE;
  const window = new Float32Array(N2);
  for (let n = 0; n < N2; n++) {
    window[n] = Math.sin(Math.PI * (n + 0.5) / N2);
  }
  // basis[n * N + k]
  const basis = new Float32Array(N2 * N);
  for (let n = 0; n < N2; n++) {
    for (let k = 0; k < N; k++) {
      basis[n * N + k] = Math.cos(
        (Math.PI / N) * (n + 0.5 + N / 2) * (k + 0.5)
      );
    }
  }
  return { window, basis, N, N2 };
}

function mdctAnalyze(
  signal: Float32Array,
  mdct: ReturnType<typeof createMDCT>
): Float32Array[] {
  const { window, basis, N, N2 } = mdct;
  const padLen = (HOP_SIZE - (signal.length % HOP_SIZE)) % HOP_SIZE;
  const padded = new Float32Array(signal.length + padLen + N2);
  padded.set(signal);
  const nFrames = Math.floor((padded.length - N2) / HOP_SIZE) + 1;
  const frames: Float32Array[] = [];
  for (let i = 0; i < nFrames; i++) {
    const start = i * HOP_SIZE;
    const coeffs = new Float32Array(N);
    for (let k = 0; k < N; k++) {
      let sum = 0;
      for (let n = 0; n < N2; n++) {
        sum += padded[start + n] * window[n] * basis[n * N + k];
      }
      coeffs[k] = sum;
    }
    frames.push(coeffs);
  }
  return frames;
}

function mdctSynthesize(
  frames: Float32Array[],
  mdct: ReturnType<typeof createMDCT>
): Float32Array {
  const { window, basis, N, N2 } = mdct;
  const nFrames = frames.length;
  const outLen = (nFrames - 1) * HOP_SIZE + N2;
  const output = new Float32Array(outLen);
  const scale = 2.0 / N;
  for (let i = 0; i < nFrames; i++) {
    const start = i * HOP_SIZE;
    const coeffs = frames[i];
    for (let n = 0; n < N2; n++) {
      let sum = 0;
      for (let k = 0; k < N; k++) {
        sum += coeffs[k] * basis[n * N + k];
      }
      output[start + n] += sum * scale * window[n];
    }
  }
  return output;
}

// Gain-Shape Product VQ
interface Codebook {
  nStages: number;
  nSub: number;
  cbSize: number;
  subDim: number;
  gainBits: number;
  // codebooks[stage][sub] = Float32Array(cbSize * subDim)
  codebooks: Float32Array[][];
}

function trainCodebooks(
  data: Float32Array[],
  nStages: number,
  nSub: number,
  cbSize: number,
  nIters: number,
  onProgress?: (msg: string) => void
): Codebook {
  const dim = HOP_SIZE;
  const subDim = dim / nSub;
  const gainBits = 6;

  // Split into sub-vectors and compute gains
  function split(vecs: Float32Array[]): Float32Array[][] {
    return Array.from({ length: nSub }, (_, m) =>
      vecs.map((v) => v.slice(m * subDim, (m + 1) * subDim))
    );
  }

  function computeGain(sub: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < sub.length; i++) sum += sub[i] * sub[i];
    return Math.sqrt(sum / sub.length + 1e-10);
  }

  function normalize(sub: Float32Array, gain: number): Float32Array {
    const out = new Float32Array(sub.length);
    for (let i = 0; i < sub.length; i++) out[i] = sub[i] / gain;
    return out;
  }

  // Normalize all data
  const subs = split(data);
  const gains = subs.map((subArr) => subArr.map(computeGain));
  const normalized = subs.map((subArr, m) =>
    subArr.map((s, i) => normalize(s, gains[m][i]))
  );
  // Reconstruct as flat vectors
  const normVecs = data.map((_, i) => {
    const v = new Float32Array(dim);
    for (let m = 0; m < nSub; m++) {
      v.set(normalized[m][i], m * subDim);
    }
    return v;
  });

  // K-means on sub-vectors
  function kmeans(
    vecs: Float32Array[],
    k: number,
    iters: number
  ): Float32Array {
    const d = vecs[0].length;
    const centroids = new Float32Array(k * d);
    // Random init
    const used = new Set<number>();
    for (let i = 0; i < k; i++) {
      let idx: number;
      do {
        idx = Math.floor(Math.random() * vecs.length);
      } while (used.has(idx) && used.size < vecs.length);
      used.add(idx);
      centroids.set(vecs[idx], i * d);
    }

    const assignments = new Int32Array(vecs.length);

    for (let it = 0; it < iters; it++) {
      // Assign
      for (let i = 0; i < vecs.length; i++) {
        let bestDist = Infinity;
        let bestK = 0;
        for (let c = 0; c < k; c++) {
          let dist = 0;
          for (let j = 0; j < d; j++) {
            const diff = vecs[i][j] - centroids[c * d + j];
            dist += diff * diff;
          }
          if (dist < bestDist) {
            bestDist = dist;
            bestK = c;
          }
        }
        assignments[i] = bestK;
      }
      // Update
      const counts = new Int32Array(k);
      const sums = new Float32Array(k * d);
      for (let i = 0; i < vecs.length; i++) {
        const c = assignments[i];
        counts[c]++;
        for (let j = 0; j < d; j++) {
          sums[c * d + j] += vecs[i][j];
        }
      }
      for (let c = 0; c < k; c++) {
        if (counts[c] > 0) {
          for (let j = 0; j < d; j++) {
            centroids[c * d + j] = sums[c * d + j] / counts[c];
          }
        }
      }
    }
    return centroids;
  }

  // Train residual stages
  const codebooks: Float32Array[][] = [];
  let residualVecs = normVecs.map((v) => v.slice());
  const cumulative = normVecs.map(() => new Float32Array(dim));

  for (let stage = 0; stage < nStages; stage++) {
    onProgress?.(`Training stage ${stage + 1}/${nStages}...`);
    const stageCbs: Float32Array[] = [];
    const resSubs = split(residualVecs);

    const stageRecon = normVecs.map(() => new Float32Array(dim));
    for (let m = 0; m < nSub; m++) {
      const cb = kmeans(resSubs[m], cbSize, nIters);
      stageCbs.push(cb);
      // Quantize and accumulate
      for (let i = 0; i < resSubs[m].length; i++) {
        let bestDist = Infinity,
          bestK = 0;
        for (let c = 0; c < cbSize; c++) {
          let dist = 0;
          for (let j = 0; j < subDim; j++) {
            const diff = resSubs[m][i][j] - cb[c * subDim + j];
            dist += diff * diff;
          }
          if (dist < bestDist) {
            bestDist = dist;
            bestK = c;
          }
        }
        for (let j = 0; j < subDim; j++) {
          stageRecon[i][m * subDim + j] = cb[bestK * subDim + j];
        }
      }
    }
    codebooks.push(stageCbs);
    for (let i = 0; i < normVecs.length; i++) {
      for (let j = 0; j < dim; j++) {
        cumulative[i][j] += stageRecon[i][j];
        residualVecs[i][j] = normVecs[i][j] - cumulative[i][j];
      }
    }
  }

  return { nStages, nSub, cbSize, subDim, gainBits, codebooks };
}

function encode(
  frames: Float32Array[],
  cb: Codebook
): { shapeIndices: Uint16Array[]; gainCodes: Uint8Array[] } {
  const { nStages, nSub, cbSize, subDim, gainBits } = cb;
  const dim = HOP_SIZE;
  const levels = 1 << gainBits;
  const logMin = -20,
    logMax = 10;

  const shapeIndices: Uint16Array[] = [];
  const gainCodes: Uint8Array[] = [];

  for (const frame of frames) {
    // Compute gains and normalize
    const gains = new Float32Array(nSub);
    const normalized = new Float32Array(dim);
    const gc = new Uint8Array(nSub);

    for (let m = 0; m < nSub; m++) {
      let sum = 0;
      for (let j = 0; j < subDim; j++) {
        const v = frame[m * subDim + j];
        sum += v * v;
      }
      gains[m] = Math.sqrt(sum / subDim + 1e-10);
      // Quantize gain
      const logG = Math.log2(gains[m] + 1e-10);
      gc[m] = Math.max(
        0,
        Math.min(
          levels - 1,
          Math.round(((logG - logMin) / (logMax - logMin)) * (levels - 1))
        )
      );
      for (let j = 0; j < subDim; j++) {
        normalized[m * subDim + j] = frame[m * subDim + j] / gains[m];
      }
    }
    gainCodes.push(gc);

    // Residual VQ on normalized shape
    const si = new Uint16Array(nStages * nSub);
    const residual = normalized.slice();

    for (let stage = 0; stage < nStages; stage++) {
      for (let m = 0; m < nSub; m++) {
        const codebook = cb.codebooks[stage][m];
        let bestDist = Infinity,
          bestK = 0;
        for (let c = 0; c < cbSize; c++) {
          let dist = 0;
          for (let j = 0; j < subDim; j++) {
            const diff = residual[m * subDim + j] - codebook[c * subDim + j];
            dist += diff * diff;
          }
          if (dist < bestDist) {
            bestDist = dist;
            bestK = c;
          }
        }
        si[stage * nSub + m] = bestK;
        for (let j = 0; j < subDim; j++) {
          residual[m * subDim + j] -= codebook[bestK * subDim + j];
        }
      }
    }
    shapeIndices.push(si);
  }

  return { shapeIndices, gainCodes };
}

function decode(
  shapeIndices: Uint16Array[],
  gainCodes: Uint8Array[],
  cb: Codebook
): Float32Array[] {
  const { nStages, nSub, cbSize, subDim, gainBits } = cb;
  const dim = HOP_SIZE;
  const levels = 1 << gainBits;
  const logMin = -20,
    logMax = 10;

  return shapeIndices.map((si, i) => {
    const result = new Float32Array(dim);
    // Reconstruct shape
    for (let stage = 0; stage < nStages; stage++) {
      for (let m = 0; m < nSub; m++) {
        const idx = si[stage * nSub + m];
        const codebook = cb.codebooks[stage][m];
        for (let j = 0; j < subDim; j++) {
          result[m * subDim + j] += codebook[idx * subDim + j];
        }
      }
    }
    // Apply gains
    const gc = gainCodes[i];
    for (let m = 0; m < nSub; m++) {
      const gain = Math.pow(
        2,
        (gc[m] / (levels - 1)) * (logMax - logMin) + logMin
      );
      for (let j = 0; j < subDim; j++) {
        result[m * subDim + j] *= gain;
      }
    }
    return result;
  });
}

function computeSNR(original: Float32Array, decoded: Float32Array): number {
  const n = Math.min(original.length, decoded.length);
  let sigPower = 0,
    errPower = 0;
  for (let i = 0; i < n; i++) {
    sigPower += original[i] * original[i];
    errPower += (original[i] - decoded[i]) * (original[i] - decoded[i]);
  }
  return 10 * Math.log10(sigPower / (errPower + 1e-10));
}

// =============================================================================
// React Page Component
// =============================================================================

const fade = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7 } };

interface CodecResult {
  originalBuffer: AudioBuffer;
  decodedBuffer: AudioBuffer;
  snr: number;
  bitrate: number;
  compressionRatio: number;
  nFrames: number;
  codebookKB: number;
  config: string;
}

export default function JazzCodecPage() {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => setLang(getSavedLang()), []);
  const ja = lang === "ja";
  const toggleLang = () => {
    const n = lang === "ja" ? "en" : "ja";
    setLang(n);
    saveLang(n);
  };

  const [status, setStatus] = useState("");
  const [result, setResult] = useState<CodecResult | null>(null);
  const [playing, setPlaying] = useState<"original" | "decoded" | null>(null);
  const [progress, setProgress] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const [nStages, setNStages] = useState(8);
  const [nSub, setNSub] = useState(8);
  const [cbSize, setCbSize] = useState(256);

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext({ sampleRate: 16000 });
    }
    return audioCtxRef.current;
  };

  const stopPlayback = () => {
    sourceRef.current?.stop();
    sourceRef.current = null;
    setPlaying(null);
  };

  const playBuffer = (buffer: AudioBuffer, which: "original" | "decoded") => {
    stopPlayback();
    const ctx = getAudioCtx();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => setPlaying(null);
    source.start();
    sourceRef.current = source;
    setPlaying(which);
  };

  const processFile = useCallback(
    async (file: File) => {
      stopPlayback();
      setResult(null);
      setStatus(ja ? "読み込み中..." : "Loading...");

      const ctx = getAudioCtx();
      const arrayBuf = await file.arrayBuffer();
      const audioBuf = await ctx.decodeAudioData(arrayBuf);

      // Resample to 16kHz mono
      const offlineCtx = new OfflineAudioContext(1, Math.ceil(audioBuf.duration * 16000), 16000);
      const src = offlineCtx.createBufferSource();
      src.buffer = audioBuf;
      src.connect(offlineCtx.destination);
      src.start();
      const resampled = await offlineCtx.startRendering();
      const pcm = resampled.getChannelData(0);

      // Use max 30s
      const maxSamples = 30 * 16000;
      const audio = pcm.length > maxSamples ? pcm.slice(0, maxSamples) : pcm;

      // Normalize
      let maxVal = 0;
      for (let i = 0; i < audio.length; i++) maxVal = Math.max(maxVal, Math.abs(audio[i]));
      if (maxVal > 0) for (let i = 0; i < audio.length; i++) audio[i] = (audio[i] / maxVal) * 0.95;

      setStatus(ja ? "MDCT変換中..." : "MDCT analysis...");
      await new Promise((r) => setTimeout(r, 10));

      const mdct = createMDCT();
      const frames = mdctAnalyze(audio, mdct);

      setStatus(ja ? `コードブック訓練中 (${nStages}×${nSub}×${cbSize})...` : `Training codebooks (${nStages}×${nSub}×${cbSize})...`);
      await new Promise((r) => setTimeout(r, 10));

      const cb = trainCodebooks(frames, nStages, nSub, cbSize, 15, (msg) => setStatus(msg));

      setStatus(ja ? "エンコード中..." : "Encoding...");
      await new Promise((r) => setTimeout(r, 10));
      const { shapeIndices, gainCodes } = encode(frames, cb);

      setStatus(ja ? "デコード中..." : "Decoding...");
      await new Promise((r) => setTimeout(r, 10));
      const decodedFrames = decode(shapeIndices, gainCodes, cb);
      const decodedPCM = mdctSynthesize(decodedFrames, mdct);

      const n = Math.min(audio.length, decodedPCM.length);
      const snr = computeSNR(audio.subarray(0, n), decodedPCM.subarray(0, n));

      // Compute bitrate
      const gainBitsPerFrame = nSub * 6;
      const shapeBitsPerFrame = nStages * nSub * Math.ceil(Math.log2(cbSize));
      const bitsPerFrame = gainBitsPerFrame + shapeBitsPerFrame;
      const bitrate = bitsPerFrame * 50; // 50 fps at 20ms frames
      const adpcmBitrate = 64000;
      const compressionRatio = adpcmBitrate / bitrate;
      const codebookKB = (nStages * nSub * cbSize * (HOP_SIZE / nSub) * 4) / 1024;

      // Create AudioBuffers
      const origBuf = ctx.createBuffer(1, n, 16000);
      origBuf.getChannelData(0).set(audio.subarray(0, n));
      const decBuf = ctx.createBuffer(1, n, 16000);
      decBuf.getChannelData(0).set(decodedPCM.subarray(0, n));

      setResult({
        originalBuffer: origBuf,
        decodedBuffer: decBuf,
        snr,
        bitrate,
        compressionRatio,
        nFrames: frames.length,
        codebookKB,
        config: `${nStages}×${nSub}×${cbSize}`,
      });
      setStatus("");
    },
    [ja, nStages, nSub, cbSize]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  return (
    <main style={{ background: "#080808", minHeight: "100vh", position: "relative" }}>
      <div className="atmo" />

      {/* Nav */}
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 24px",
          background: "rgba(8,8,8,0.85)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(201,169,98,0.1)",
        }}
      >
        <Link href="/" style={{ color: "var(--gold)", fontFamily: "Anton", fontSize: 20, textDecoration: "none", letterSpacing: 2 }}>
          SOLUNA
        </Link>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>KoeCodec</span>
          <button onClick={toggleLang} className="nav-pill" style={{ fontSize: 13, padding: "4px 12px", border: "1px solid rgba(201,169,98,0.3)", borderRadius: 20, background: "transparent", color: "var(--gold)", cursor: "pointer" }}>
            {lang === "ja" ? "EN" : "JA"}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "100px 24px 60px", position: "relative", zIndex: 1 }}>
        {/* Hero */}
        <motion.div {...fade} style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 className="font-display" style={{ fontSize: "clamp(32px, 6vw, 56px)", color: "var(--gold)", marginBottom: 12 }}>
            KoeCodec
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, maxWidth: 500, margin: "0 auto" }}>
            {ja
              ? "ESP32で動くオーディオコーデック。MDCT + Product VQ。ファイルをドロップして試してみてください。"
              : "Audio codec that runs on ESP32. MDCT + Product VQ. Drop a file to try it."}
          </p>
        </motion.div>

        {/* Config */}
        <motion.div {...fade} style={{
          background: "rgba(201,169,98,0.06)", border: "1px solid rgba(201,169,98,0.15)",
          borderRadius: 16, padding: 24, marginBottom: 24,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <div>
              <label style={{ color: "var(--gold)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>
                {ja ? "ステージ数" : "Stages"}
              </label>
              <select value={nStages} onChange={(e) => setNStages(Number(e.target.value))} style={{
                width: "100%", marginTop: 6, padding: "8px 12px", background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(201,169,98,0.2)", borderRadius: 8, color: "#fff", fontSize: 16,
              }}>
                {[2, 3, 4, 5, 6, 8].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: "var(--gold)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>
                {ja ? "サブベクトル" : "Sub-vectors"}
              </label>
              <select value={nSub} onChange={(e) => setNSub(Number(e.target.value))} style={{
                width: "100%", marginTop: 6, padding: "8px 12px", background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(201,169,98,0.2)", borderRadius: 8, color: "#fff", fontSize: 16,
              }}>
                {[4, 8].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: "var(--gold)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>
                {ja ? "コードブック" : "Codebook"}
              </label>
              <select value={cbSize} onChange={(e) => setCbSize(Number(e.target.value))} style={{
                width: "100%", marginTop: 6, padding: "8px 12px", background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(201,169,98,0.2)", borderRadius: 8, color: "#fff", fontSize: 16,
              }}>
                {[128, 256, 512].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 12, color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
            {ja ? "理論ビットレート" : "Theoretical bitrate"}:{" "}
            {((nStages * nSub * Math.ceil(Math.log2(cbSize)) + nSub * 6) * 50 / 1000).toFixed(1)} kbps
            {" / "}
            {ja ? "コードブック" : "Codebook"}:{" "}
            {((nStages * nSub * cbSize * (HOP_SIZE / nSub) * 4) / 1024).toFixed(0)} KB
          </div>
        </motion.div>

        {/* Drop zone */}
        <motion.div
          {...fade}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          style={{
            border: "2px dashed rgba(201,169,98,0.3)", borderRadius: 16,
            padding: "48px 24px", textAlign: "center", cursor: "pointer",
            background: "rgba(201,169,98,0.03)", marginBottom: 24,
            transition: "border-color 0.2s",
          }}
          onClick={() => document.getElementById("file-input")?.click()}
          whileHover={{ borderColor: "rgba(201,169,98,0.6)" }}
        >
          <input id="file-input" type="file" accept="audio/*" onChange={handleFileInput} style={{ display: "none" }} />
          <div style={{ fontSize: 40, marginBottom: 12 }}>
            {status ? "⏳" : "🎵"}
          </div>
          <p style={{ color: status ? "var(--gold)" : "rgba(255,255,255,0.5)", fontSize: 15 }}>
            {status || (ja ? "音声ファイルをドロップ（MP3, WAV, M4A）" : "Drop an audio file (MP3, WAV, M4A)")}
          </p>
        </motion.div>

        {/* Results */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Playback controls */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
            }}>
              <button
                onClick={() => playing === "original" ? stopPlayback() : playBuffer(result.originalBuffer, "original")}
                style={{
                  padding: "20px 16px", borderRadius: 12, cursor: "pointer",
                  border: playing === "original" ? "2px solid var(--gold)" : "2px solid rgba(255,255,255,0.15)",
                  background: playing === "original" ? "rgba(201,169,98,0.1)" : "rgba(255,255,255,0.03)",
                  color: "#fff", fontSize: 15, transition: "all 0.2s",
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 6 }}>{playing === "original" ? "⏸" : "▶"}</div>
                <div style={{ fontWeight: 600 }}>{ja ? "オリジナル" : "Original"}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 4 }}>16kHz PCM</div>
              </button>
              <button
                onClick={() => playing === "decoded" ? stopPlayback() : playBuffer(result.decodedBuffer, "decoded")}
                style={{
                  padding: "20px 16px", borderRadius: 12, cursor: "pointer",
                  border: playing === "decoded" ? "2px solid var(--gold)" : "2px solid rgba(255,255,255,0.15)",
                  background: playing === "decoded" ? "rgba(201,169,98,0.1)" : "rgba(255,255,255,0.03)",
                  color: "#fff", fontSize: 15, transition: "all 0.2s",
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 6 }}>{playing === "decoded" ? "⏸" : "▶"}</div>
                <div style={{ fontWeight: 600 }}>KoeCodec</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 4 }}>
                  {(result.bitrate / 1000).toFixed(1)} kbps
                </div>
              </button>
            </div>

            {/* Stats */}
            <div style={{
              background: "rgba(201,169,98,0.06)", border: "1px solid rgba(201,169,98,0.15)",
              borderRadius: 16, padding: 24,
            }}>
              <h3 className="font-display" style={{ color: "var(--gold)", fontSize: 18, marginBottom: 16, letterSpacing: 1 }}>
                {ja ? "結果" : "Results"}
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                {[
                  [ja ? "設定" : "Config", result.config],
                  ["SNR", `${result.snr.toFixed(1)} dB`],
                  [ja ? "ビットレート" : "Bitrate", `${(result.bitrate / 1000).toFixed(1)} kbps`],
                  [ja ? "圧縮率 vs ADPCM" : "vs ADPCM", `${result.compressionRatio.toFixed(1)}x ${ja ? "削減" : "smaller"}`],
                  [ja ? "フレーム数" : "Frames", `${result.nFrames}`],
                  [ja ? "コードブック" : "Codebook", `${result.codebookKB.toFixed(0)} KB`],
                ].map(([label, value]) => (
                  <div key={String(label)} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{label}</span>
                    <span style={{ color: "#fff", fontSize: 14, fontWeight: 500, fontFamily: "monospace" }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Comparison bar */}
              <div style={{ marginTop: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
                  <span>KoeCodec {(result.bitrate / 1000).toFixed(1)}k</span>
                  <span>IMA-ADPCM 64k</span>
                </div>
                <div style={{ height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 4,
                    width: `${Math.min(100, (result.bitrate / 64000) * 100)}%`,
                    background: "linear-gradient(90deg, var(--gold), rgba(201,169,98,0.5))",
                  }} />
                </div>
                <div style={{ textAlign: "center", marginTop: 8, color: "var(--gold)", fontSize: 13, fontWeight: 600 }}>
                  {result.compressionRatio.toFixed(1)}x {ja ? "帯域削減" : "bandwidth reduction"}
                </div>
              </div>
            </div>

            {/* Architecture */}
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16, padding: 24, fontFamily: "monospace", fontSize: 13,
              color: "rgba(255,255,255,0.5)", lineHeight: 1.8, whiteSpace: "pre",
            }}>
{`PCM 16kHz → MDCT (20ms) → Gain-Shape PVQ → Bitstream
                              ↕
                     ${result.config} codebook
                     ${result.codebookKB.toFixed(0)} KB (fits ESP32 PSRAM)`}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 48, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 24 }}>
          <p>KoeCodec — {ja ? "ESP32ネイティブ オーディオコーデック" : "ESP32-native audio codec"}</p>
          <p style={{ marginTop: 4 }}>MDCT + Gain-Shape Product VQ / {ja ? "ゼロ依存 JavaScript実装" : "Zero-dependency JS implementation"}</p>
        </div>
      </div>
    </main>
  );
}
