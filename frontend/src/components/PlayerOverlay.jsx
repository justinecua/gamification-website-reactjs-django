import { useState, useEffect, useRef } from "react";

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

  // split description into words
  const words = topic.description?.split(" ") ?? [];

  // FineVoice voice states
  const [voices, setVoices] = useState([]);
  const [voicesLoading, setVoicesLoading] = useState(false);
  const [voicesError, setVoicesError] = useState(null);
  const [voiceSearch, setVoiceSearch] = useState("");

  // selected voice ID
  const [selectedVoiceName, setSelectedVoiceName] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  /* ------------------------------
     LOAD FINEVOICE VOICES
  ------------------------------ */
  useEffect(() => {
    if (mediaType !== "narrated") return;

    async function loadVoices() {
      try {
        setVoicesLoading(true);
        setVoicesError(null);

        const res = await fetch(`${API_URL}/tts/finevoice/voices/`);
        if (!res.ok) throw new Error("Failed to load voices");

        const data = await res.json();
        const list = data?.voices || [];

        setVoices(list);

        if (!selectedVoiceName && list.length > 0) {
          setSelectedVoiceName(list[0].name);
        }
      } catch (err) {
        console.error("Voice load error", err);
        setVoicesError(err.message);
      } finally {
        setVoicesLoading(false);
      }
    }

    loadVoices();
  }, [API_URL, mediaType]);

  const filteredVoices = voices.filter((v) => {
    const q = voiceSearch.toLowerCase();
    return (
      v.displayName?.toLowerCase().includes(q) ||
      v.name?.toLowerCase().includes(q)
    );
  });

  const getVoiceLabel = (voice) =>
    voice.displayName ? voice.displayName : voice.name;

  /* ------------------------------
     FETCH FINEVOICE AUDIO
  ------------------------------ */
  async function fetchFineVoiceTTS(text, voiceName) {
    const res = await fetch(`${API_URL}/tts/finevoice/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice: voiceName, emotion: "friendly" }),
    });

    if (!res.ok) throw new Error("FineVoice TTS error");

    const blob = await res.blob();
    return new Audio(URL.createObjectURL(blob));
  }

  /* ------------------------------
     GENERATE OR USE CACHED AUDIO
  ------------------------------ */
  const generateAudio = async () => {
    if (!topic.description || !selectedVoiceName) return;

    const text = topic.description;
    const voice = selectedVoiceName;

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
      const audio = await fetchFineVoiceTTS(text, voice);

      cachedAudioRef.current = {
        text,
        voice,
        url: audio.src,
      };

      audioRef.current = audio;
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  /* ------------------------------
     AUDIO CONTROL FUNCTIONS
  ------------------------------ */
  const playDescription = () => {
    if (!audioRef.current) return;
    audioRef.current.play();
    setIsPlaying(true);
    startWordSync();
  };

  const pauseDescription = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const stopDescription = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setHighlightIndex(-1);
    setIsPlaying(false);
    clearInterval(syncIntervalRef.current);
  };

  const restartDescription = async () => {
    if (!cachedAudioRef.current) await generateAudio();
    else audioRef.current = new Audio(cachedAudioRef.current.url);

    setHighlightIndex(0);
    playDescription();
  };

  /* ------------------------------
     WORD HIGHLIGHT ENGINE
  ------------------------------ */
  const startWordSync = () => {
    clearInterval(syncIntervalRef.current);

    syncIntervalRef.current = setInterval(() => {
      const audio = audioRef.current;
      if (!audio || !audio.duration) return;

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
    if (mediaType === "narrated" && selectedVoiceName) {
      generateAudio();
    }
  }, [selectedVoiceName, mediaType]);

  /* ------------------------------
     CLEANUP ON UNMOUNT
  ------------------------------ */
  useEffect(() => {
    return () => {
      stopDescription();
      clearInterval(syncIntervalRef.current);
    };
  }, []);

  /* ------------------------------
     YOUTUBE EMBED
  ------------------------------ */
  const getYouTubeEmbedUrl = (url, autoplay = true) => {
    if (!url) return null;
    const m = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return m
      ? `https://www.youtube.com/embed/${m[1]}?autoplay=${
          autoplay ? 1 : 0
        }&mute=0&controls=1`
      : null;
  };

  /* ------------------------------
     UI
  ------------------------------ */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-yellow-300">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex-1 text-center truncate">
              {topic.title}
            </h2>

            <button
              onClick={() => {
                stopDescription();
                onClose();
              }}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 p-8 overflow-y-auto relative">
          {/* LOADING */}
          {mediaType === "narrated" && (isLoading || voicesLoading) && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-sm">
              <div className="text-center">
                <div className="animate-bounce mb-4 text-4xl">🎵</div>
                <p className="text-purple-700 font-bold">
                  {isLoading ? "Preparing narration…" : "Loading voices…"}
                </p>
              </div>
            </div>
          )}

          {/* Video or Text */}
          {hasMedia ? (
            mediaType === "youtube" && getYouTubeEmbedUrl(mediaUrl) ? (
              <iframe
                className="w-full h-full rounded-xl"
                src={getYouTubeEmbedUrl(mediaUrl)}
              />
            ) : mediaType === "mp4" ? (
              <video
                className="w-full h-full rounded-xl"
                src={mediaUrl}
                controls
              />
            ) : (
              <p className="text-center">Unsupported media type.</p>
            )
          ) : (
            <>
              {/* STORY TEXT WITH HIGHLIGHT */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-200 mb-6">
                <p className="text-lg text-gray-800 leading-relaxed text-center">
                  {words.map((word, i) => (
                    <span
                      key={i}
                      className={
                        i === highlightIndex
                          ? "bg-yellow-300 text-black px-1 rounded"
                          : ""
                      }
                    >
                      {word + " "}
                    </span>
                  ))}
                </p>
              </div>

              {/* VOICE SELECTOR */}
              <div className="mb-6">
                <p className="text-purple-700 font-bold text-lg text-center mb-2">
                  Choose Narrator 🎤
                </p>

                <div className="flex justify-center mb-4">
                  <input
                    type="text"
                    value={voiceSearch}
                    onChange={(e) => setVoiceSearch(e.target.value)}
                    placeholder="Search voices…"
                    className="w-full max-w-md px-4 py-2 rounded-2xl border border-purple-300 shadow-sm"
                  />
                </div>

                {voicesError && (
                  <p className="text-center text-red-500">{voicesError}</p>
                )}

                <div className="flex justify-center gap-3 flex-wrap max-h-60 overflow-y-auto">
                  {filteredVoices.map((voice) => (
                    <button
                      key={voice.name}
                      onClick={() => setSelectedVoiceName(voice.name)}
                      className={`px-4 py-2 rounded-2xl font-bold text-sm ${
                        selectedVoiceName === voice.name
                          ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg"
                          : "bg-white text-gray-700 shadow"
                      }`}
                    >
                      {getVoiceLabel(voice)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* AUDIO CONTROLS */}
        {mediaType === "narrated" && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-t-4 border-green-200">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button
                onClick={() =>
                  isPlaying ? pauseDescription() : playDescription()
                }
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl font-bold"
              >
                {isPlaying ? "⏸ Pause" : "▶ Play"}
              </button>

              <button
                onClick={restartDescription}
                className="px-5 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-2xl font-bold"
              >
                🔄 Restart
              </button>

              <button
                onClick={stopDescription}
                className="px-5 py-3 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-2xl font-bold"
              >
                ⏹ Stop
              </button>
            </div>
          </div>
        )}

        {/* FINISH */}
        <div className="px-6 py-4 border-t-4 border-green-200 text-center">
          <button
            onClick={() => {
              stopDescription();
              onFinished?.();
            }}
            className="px-8 py-3 bg-green-400 text-white rounded-2xl font-bold"
          >
            Finish Topic
          </button>
        </div>
      </div>
    </div>
  );
}
