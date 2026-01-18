import { useState, useEffect, useRef } from "react";

const FALLBACK_KOKORO_VOICES = [
  // 🇺🇸 US Female
  { id: "af_heart", label: "Heart (US Female)" },
  { id: "af_alloy", label: "Alloy (US Female)" },
  { id: "af_aoede", label: "Aoede (US Female)" },
  { id: "af_bella", label: "Bella (US Female)" },
  { id: "af_jessica", label: "Jessica (US Female)" },
  { id: "af_kore", label: "Kore (US Female)" },
  { id: "af_nicole", label: "Nicole (US Female)" },
  { id: "af_nova", label: "Nova (US Female)" },
  { id: "af_river", label: "River (US Female)" },
  { id: "af_sarah", label: "Sarah (US Female)" },
  { id: "af_sky", label: "Sky (US Female)" },

  // 🇺🇸 US Male
  { id: "am_adam", label: "Adam (US Male)" },
  { id: "am_echo", label: "Echo (US Male)" },
  { id: "am_eric", label: "Eric (US Male)" },
  { id: "am_fenrir", label: "Fenrir (US Male)" },
  { id: "am_liam", label: "Liam (US Male)" },
  { id: "am_michael", label: "Michael (US Male)" },
  { id: "am_onyx", label: "Onyx (US Male)" },
  { id: "am_puck", label: "Puck (US Male)" },
  { id: "am_santa", label: "Santa (US Male)" },

  // 🇬🇧 UK Female
  { id: "bf_alice", label: "Alice (UK Female)" },
  { id: "bf_emma", label: "Emma (UK Female)" },
  { id: "bf_isabella", label: "Isabella (UK Female)" },
  { id: "bf_lily", label: "Lily (UK Female)" },

  // 🇬🇧 UK Male
  { id: "bm_daniel", label: "Daniel (UK Male)" },
  { id: "bm_fable", label: "Fable (UK Male)" },
  { id: "bm_george", label: "George (UK Male)" },
  { id: "bm_lewis", label: "Lewis (UK Male)" },
];

export default function PlayerOverlay({ topic, onClose, onFinished }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // highlight index for karaoke effect
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const audioRef = useRef(null);
  const cachedAudioRef = useRef(null);
  const syncIntervalRef = useRef(null);

  const hasMedia = topic.media && topic.media.length > 0;
  const mediaType = hasMedia ? topic.media[0].media_type : "narrated";
  const mediaUrl =
    hasMedia && mediaType === "mp4"
      ? topic.media[0].uploaded_file
      : hasMedia
        ? topic.media[0].media_url
        : null;

  const words = topic.description?.split(" ") ?? [];

  const API_URL = import.meta.env.VITE_API_URL;

  // Kokoro voices
  const [voices, setVoices] = useState(FALLBACK_KOKORO_VOICES);
  const [selectedVoiceId, setSelectedVoiceId] = useState("af_heart");

  /* ------------------------------
     LOAD KOKORO VOICES (OPTIONAL)
  ------------------------------ */
  useEffect(() => {
    if (mediaType !== "narrated") return;

    async function loadVoices() {
      try {
        const res = await fetch(`${API_URL}/tts/kokoro/voices/`);
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data?.voices) && data.voices.length > 0) {
          setVoices(data.voices);
          if (!data.voices.find((v) => v.id === selectedVoiceId)) {
            setSelectedVoiceId(data.voices[0].id);
          }
        }
      } catch {
        // Keep fallback list
      }
    }

    loadVoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_URL, mediaType]);

  /* ------------------------------
     FETCH KOKORO AUDIO
  ------------------------------ */
  async function fetchKokoroTTS(text, voiceId) {
    const res = await fetch(`${API_URL}/tts/kokoro/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice: voiceId, speed: 1.0 }),
    });

    if (!res.ok) {
      let msg = "Kokoro TTS failed";
      try {
        const data = await res.json();
        if (data?.error) msg = data.error;
      } catch {}
      throw new Error(msg);
    }

    const blob = await res.blob();
    return new Audio(URL.createObjectURL(blob));
  }

  /* ------------------------------
     GENERATE OR USE CACHED AUDIO
  ------------------------------ */
  const generateAudio = async () => {
    if (!topic.description || !selectedVoiceId) return;

    const text = topic.description;
    const voice = selectedVoiceId;

    // reuse cached audio if text & voice match
    if (
      cachedAudioRef.current &&
      cachedAudioRef.current.text === text &&
      cachedAudioRef.current.voice === voice
    ) {
      audioRef.current = new Audio(cachedAudioRef.current.url);
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      const audio = await fetchKokoroTTS(text, voice);

      cachedAudioRef.current = {
        text,
        voice,
        url: audio.src,
      };

      audioRef.current = audio;
    } catch (err) {
      console.error(err);
      // optionally show toast
    } finally {
      setIsLoading(false);
    }
  };

  const hardStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    clearInterval(syncIntervalRef.current);
    setIsPlaying(false);
  };

  /* ------------------------------
     AUDIO CONTROL FUNCTIONS
  ------------------------------ */
  const playDescription = () => {
    if (!audioRef.current) return;

    // 🔒 prevent overlap
    audioRef.current.pause();
    audioRef.current.currentTime = audioRef.current.currentTime || 0;

    audioRef.current.play();
    setIsPlaying(true);
    startWordSync();
  };

  const pauseDescription = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const stopDescription = () => {
    hardStopAudio();
    setHighlightIndex(-1);
  };

  const restartDescription = async () => {
    // 🔥 STOP EVERYTHING FIRST
    hardStopAudio();

    if (!cachedAudioRef.current) {
      await generateAudio();
    } else {
      audioRef.current = new Audio(cachedAudioRef.current.url);
    }

    setHighlightIndex(0);
    playDescription();
  };

  useEffect(() => {
    return () => {
      hardStopAudio();
    };
  }, []);

  /* ------------------------------
     WORD HIGHLIGHT ENGINE
  ------------------------------ */
  const startWordSync = () => {
    clearInterval(syncIntervalRef.current);

    syncIntervalRef.current = setInterval(() => {
      const audio = audioRef.current;
      if (!audio || !audio.duration || !words.length) return;

      const timePerWord = audio.duration / words.length;
      const index = Math.floor(audio.currentTime / timePerWord);

      if (index !== highlightIndex && index < words.length) {
        setHighlightIndex(index);
      }

      if (audio.currentTime >= audio.duration) {
        clearInterval(syncIntervalRef.current);
        setHighlightIndex(-1);
        setIsPlaying(false);
      }
    }, 100);
  };

  /* ------------------------------
     AUTO GENERATE AUDIO ON VOICE CHANGE
  ------------------------------ */
  useEffect(() => {
    if (mediaType === "narrated" && selectedVoiceId) {
      generateAudio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVoiceId, mediaType]);

  /* ------------------------------
     CLEANUP ON UNMOUNT
  ------------------------------ */
  useEffect(() => {
    return () => {
      stopDescription();
      clearInterval(syncIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------
     YOUTUBE EMBED
  ------------------------------ */
  const getYouTubeEmbedUrl = (url, autoplay = true) => {
    if (!url) return null;
    const m = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    );
    return m
      ? `https://www.youtube.com/embed/${m[1]}?autoplay=${
          autoplay ? 1 : 0
        }&mute=0&controls=1`
      : null;
  };

  /* ------------------------------
     UI - COLORFUL KIDDY VERSION
  ------------------------------ */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 rounded-2xl shadow-2xl overflow-hidden border-4 border-purple-400">
        {/* HEADER - Rainbow Theme */}
        <div className="bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 px-6 py-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📖</span>
              <h2 className="text-xl font-bold text-white drop-shadow-md">
                {topic.title}
              </h2>
            </div>

            <button
              onClick={() => {
                stopDescription();
                onClose();
              }}
              className="w-9 h-9 bg-gradient-to-br from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg hover:scale-110 transition-transform"
            >
              ✕
            </button>
          </div>
        </div>

        {/* CONTENT AREA - Colorful Background */}
        <div className="aspect-video bg-gradient-to-br from-blue-100 via-yellow-100 to-pink-100 p-6 overflow-y-auto relative">
          {/* Decorative dots */}
          <div className="absolute top-2 left-2 w-3 h-3 bg-red-400 rounded-full opacity-50"></div>
          <div className="absolute top-10 right-4 w-4 h-4 bg-blue-400 rounded-full opacity-50"></div>
          <div className="absolute bottom-8 left-8 w-2 h-2 bg-green-400 rounded-full opacity-50"></div>

          {/* LOADING */}
          {mediaType === "narrated" && isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-200/90 to-pink-200/90 backdrop-blur-sm z-10 rounded-lg">
              <div className="text-center p-6 bg-gradient-to-br from-yellow-100 to-pink-100 rounded-2xl border-2 border-purple-300 shadow-lg">
                <div className="flex gap-2 mb-4 justify-center">
                  {["🎵", "🎶", "🎵"].map((note, i) => (
                    <span
                      key={i}
                      className="text-3xl animate-bounce text-purple-600"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    >
                      {note}
                    </span>
                  ))}
                </div>
                <p className="text-purple-800 font-bold text-lg">
                  Making your story! 🎨
                </p>
              </div>
            </div>
          )}

          {/* Video or Text */}
          {hasMedia ? (
            mediaType === "youtube" && getYouTubeEmbedUrl(mediaUrl) ? (
              <div className="w-full h-full rounded-xl overflow-hidden border-4 border-yellow-400 shadow-lg">
                <iframe
                  className="w-full h-full"
                  src={getYouTubeEmbedUrl(mediaUrl)}
                  title="YouTube player"
                  allowFullScreen
                />
              </div>
            ) : mediaType === "mp4" ? (
              <div className="w-full h-full rounded-xl overflow-hidden border-4 border-green-400 shadow-lg">
                <video className="w-full h-full" src={mediaUrl} controls />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-purple-700 font-bold text-xl bg-gradient-to-r from-red-100 to-yellow-100 px-6 py-4 rounded-2xl border-2 border-purple-300">
                  Unsupported media type.
                </p>
              </div>
            )
          ) : (
            <>
              {/* STORY TEXT - Colorful Card */}
              <div className="bg-gradient-to-br from-blue-50 to-pink-50 rounded-xl p-6 shadow-lg border-4 border-purple-300 mb-6 relative">
                {/* Corner decorations */}
                <div className="absolute -top-2 -left-2 text-2xl text-purple-500">
                  ✨
                </div>
                <div className="absolute -top-2 -right-2 text-2xl text-pink-500">
                  🌟
                </div>

                <div className="max-h-64 overflow-y-auto p-3 bg-white/50 rounded-lg">
                  <p className="text-gray-800 leading-relaxed text-center text-lg">
                    {words.map((word, i) => (
                      <span
                        key={i}
                        className={
                          i === highlightIndex
                            ? "bg-gradient-to-r from-yellow-300 to-orange-300 text-black px-1.5 py-1 rounded font-bold"
                            : "hover:text-purple-700 transition-colors"
                        }
                      >
                        {word + " "}
                      </span>
                    ))}
                  </p>
                </div>
              </div>

              {/* VOICE SELECTOR - Rainbow Theme */}
              <div className="mb-6">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 text-white px-5 py-2 rounded-full text-sm font-bold shadow-md">
                    <span className="text-xl">🎤</span>
                    Pick Your Story Voice!
                    <span className="text-xl">🎭</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl p-4 border-3 border-yellow-400 shadow-inner">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-40 overflow-y-auto p-2">
                    {voices.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVoiceId(v.id)}
                        className={`
                          px-4 py-3 rounded-xl text-xs font-medium transition-all duration-200
                          flex flex-col items-center justify-center gap-1
                          ${
                            selectedVoiceId === v.id
                              ? "bg-gradient-to-br from-yellow-300 via-orange-300 to-red-300 text-black font-bold border-3 border-white shadow-lg transform scale-105"
                              : "bg-gradient-to-br from-white to-blue-100 text-gray-800 hover:bg-gradient-to-br hover:from-blue-200 hover:to-purple-200 border-2 border-purple-200 hover:border-purple-400 hover:scale-102"
                          }
                        `}
                      >
                        <span className="text-lg">
                          {v.label.includes("Female") ? "👩‍🦰" : "👨‍🦱"}
                        </span>
                        <span className="truncate font-semibold">
                          {v.label.split(" (")[0]}
                        </span>
                        <span className="text-xs opacity-80">
                          {v.label.includes("US") ? "🇺🇸" : "🇬🇧"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* AUDIO CONTROLS - Bright Buttons */}
        {mediaType === "narrated" && (
          <div className="bg-gradient-to-r from-blue-100 via-green-100 to-purple-100 px-6 py-5 border-t-4 border-yellow-400">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button
                onClick={() =>
                  isPlaying ? pauseDescription() : playDescription()
                }
                className="px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-3 border-2 border-white"
              >
                <span className="text-xl">{isPlaying ? "⏸️" : "▶️"}</span>
                <span>{isPlaying ? "Pause Story" : "Play Story"}</span>
              </button>

              <button
                onClick={restartDescription}
                className="px-5 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-3 border-2 border-white"
              >
                <span className="text-xl">🔄</span>
                <span>Restart</span>
              </button>

              <button
                onClick={stopDescription}
                className="px-5 py-3 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-3 border-2 border-white"
              >
                <span className="text-xl">⏹️</span>
                <span>Stop</span>
              </button>
            </div>
          </div>
        )}

        {/* FINISH - Celebration Button */}
        <div className="px-6 py-5 border-t-4 border-green-400 text-center bg-gradient-to-r from-green-100 to-emerald-100">
          <button
            onClick={() => {
              stopDescription();
              onFinished?.();
            }}
            className="px-8 py-3 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-3 mx-auto border-2 border-white"
          >
            <span className="text-xl">🎉</span>
            <span className="text-lg">Finish Story!</span>
            <span className="text-xl">✨</span>
          </button>
        </div>
      </div>
    </div>
  );
}
