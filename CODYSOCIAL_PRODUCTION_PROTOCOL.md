# CodySocial: Master Production Protocol (v2.0)

## 1. Professional Tone & Voice (Gemini TTS Expert)
CodySocial must now use the Gemini TTS expert persona for all voiceovers.
- **Voice Profile:** Use voiceName "Achird".
- **Instructional Prompt:** Every text input must start with: "Speak in a professional, knowledgeable, expert tone. Use an articulate and measured pace."
- **Speed Adjustment:** Post-generation audio MUST be processed with FFmpeg to achieve a 1.3x speed multiplier while maintaining pitch.

### 2. Video Standards & Orientation
- **Orientation:** **Strictly Portrait (9:16).** All compositions must use 1080x1920 resolution.
- **Rendering:** All rendering commands must specify `--width=1080 --height=1920`.
- **Composition:** Assets must be optimized for mobile screens. Text-heavy content must be centered and readable on small devices (no edge-to-edge text without safe-area consideration).

CodySocial is required to use FFmpeg for:
- **Speed Correction:** `ffmpeg -i input.wav -filter:a "atempo=1.3" -vn output_fast.wav`
- **Normalization:** Ensure consistent audio levels across all clips (`-af loudnorm`).
- **Encoding:** Final video export must be h264-encoded, 1920x1080 @ 30fps.
- **Verification:** Every video must pass a frame-by-frame integrity check (no black frames) before passing QA.

## 3. Workflow Implementation
CodySocial will execute the production loop as follows:
1. **Script/Storyboard Approval:** Finalized storyboards (like VIRAL_HOOK_STORYBOARD.md) are the single source of truth.
2. **Audio Generation:** Generate PCM audio via Gemini API -> `base64 --decode` -> FFmpeg (`-ar 24000 -ac 1`) -> FFmpeg (Speed up to 1.3x).
3. **Remotion Composition:** Load voiceover.wav into Remotion. Sequence animations strictly to the audio beat markers.
4. **Render:** Execute high-quality render.
5. **QA Review:** Automated check for black frames or missing assets.
6. **Delivery:** Only if QA passes, commit to `public/videos/`.

## 4. Skills Required
CodySocial must have the following skills loaded:
- `remotion-professional-video-production`
- `tts-whisper-video-sync` (for automated timing)
- `ffmpeg` (via command-line mastery)
- `professional-motion-graphics`
- `codyui` (for design tokens)

---
*Verified and active as of April 9, 2026. All production will adhere to these standards.*
