# lessons/tts_kokoro.py
import io
import numpy as np
import soundfile as sf
from kokoro import KPipeline

PIPELINE = KPipeline(lang_code="a")  # American English

# ✅ ONLY REAL VOICES (must exist on HF)
VALID_VOICES = {
    # 🇺🇸 American English — Female
    "af_heart",
    "af_alloy",
    "af_aoede",
    "af_bella",
    "af_jessica",
    "af_kore",
    "af_nicole",
    "af_nova",
    "af_river",
    "af_sarah",
    "af_sky",

    # 🇺🇸 American English — Male
    "am_adam",
    "am_echo",
    "am_eric",
    "am_fenrir",
    "am_liam",
    "am_michael",
    "am_onyx",
    "am_puck",
    "am_santa",

    # 🇬🇧 British English — Female
    "bf_alice",
    "bf_emma",
    "bf_isabella",
    "bf_lily",

    # 🇬🇧 British English — Male
    "bm_daniel",
    "bm_fable",
    "bm_george",
    "bm_lewis",
}

def synthesize_wav_bytes(
    text: str,
    voice: str = "af_heart",
    speed: float = 1.0
) -> bytes:
    if not text or not text.strip():
        raise ValueError("Text is required")

    if voice not in VALID_VOICES:
        voice = "af_heart"  # 🔒 safety fallback

    chunks = []
    generator = PIPELINE(
        text,
        voice=voice,
        speed=speed,
        split_pattern=r"\n+"
    )

    for _, _, audio in generator:
        chunks.append(audio)

    if not chunks:
        raise RuntimeError("Kokoro returned no audio")

    audio = np.concatenate(chunks, axis=0)

    buf = io.BytesIO()
    sf.write(buf, audio, 24000, format="WAV")
    buf.seek(0)
    return buf.read()
