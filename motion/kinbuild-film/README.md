# Current campaign: StartBeside

`StartBeside.tsrct` and `StartBeside-film.mp4` are the current editable and shareable versions. Original Kinbuild files below remain historical references.

The StartBeside revision changes the two native brand labels and regenerates only complete narration thoughts 2 and 4 with the same locally installed Kokoro `af_heart` voice at speed 0.90. Original processed thoughts 1 and 3, 1080p footage, all six music source assets, effects and picture timing are retained. No speech time stretching is used. The final music duck lasts until the new last phrase ends at 18.826 seconds. Website transcript and four caption cues use the new name.

Native export uses pinned Tesseract 0.3.1. Its schema requires `playback` on media layers: the original 0–20000 ms ranges were migrated to identity linear mappings; text timelines and stable IDs remain unchanged. Export is ProRes 4444 at 1080p/24 fps, finished as H.264 CRF 17 with two-pass loudness mastering. See `mastering-startbeside.json`, `narration-cues-startbeside.json` and `Previews/filmstrip-startbeside.png` for measured results. Voice waveforms were reviewed for phrase boundaries; pronunciation and the subjective mix have not been auditioned by the assistant.

# Kinbuild — the pieces become a team (revision 4, native 1080p)

The approved 20-second film has been rerendered directly at 1920 × 1080 for sharper faces, keyboard details and toy edges. The previous version enlarged a 960 × 540 source and applied a smoothing filter; this revision uses native full-HD frames with no post-denoising or spatial upscaling. The film follows an original 3D construction-toy studio: one brick, a table, three founder figures, laptops and a shared prototype, then the familiar Kinbuild gateway assembling behind them. Native closing typography makes the purpose explicit: “Build a startup. Together.” The user's approved v2 narration and musical theme are retained, with an added rhythmic layer and sparse tactile assembly accents.

## Delivery and editable sources

- `Kinbuild-film.mp4`: final 1920 × 1080, 24 fps H.264/AAC film. The website uses the same bytes in `../../public/media/kinbuild-film.mp4`.
- `Kinbuild.tsrct`: portable native edit, 18 layers and 12 property animations. Includes the original rendered 3D footage, nine editable text layers, narration, six music stems and a separate effects track. Required footage, fonts and sounds are packaged.
- `../kinbuild-toykit/Kinbuild-toykit-HD.blend`: editable 3D geometry, materials, lighting, camera and object animations. `build_scene.py` reproduces the original geometry; `render_hd.py` applies the current HD lighting/render configuration and generates the source frames.
- `author_toykit.py`: original native composition and gain-envelope recipe. `author_hd.py` scales typography and positions to 1920 × 1080, replaces the picture source and preserves all audio layers and envelopes.
- `finalize_hd.py`: checks all 240 PNGs are 1920 × 1080, imports high-quality footage, exports native ProRes 4444 and encodes the final H.264 at CRF 17. The approved v3 AAC audio is copied, not reencoded. Packet hashes and stream timing must match before delivery. The previous v3 pipeline remains in `finalize_toykit.py`.
- `Kinbuild-score.mid`, `compose_music.py`: editable melodic sketch and complete original instrument/arrangement recipe.
- `add_momentum.py`: original added shaker, clap/kick pickup and tactile accents.
- `Previews/filmstrip-v4-HD.png`, `mix-waveform-v3.png`, `momentum-waveform-v3.png`: native visual and audio review evidence.
- `quality-v4.json`, `audio-map-v3.json`, `narration-cues.json`, `mastering-v3.json`: cue mapping, unchanged phrase timings and exact final mastering measurements.

## Approved narration

The user explicitly approved revision 2's voice and music. The narration source and timings are unchanged: Kokoro v1.0 `af_heart`, English (US), speed 0.90. No new synthesis, internal speech edits or time stretching were applied.

> Great ideas don’t grow alone. They grow with people who see things differently. At Kinbuild, find your people, and turn that first idea into a real startup. Start small, build together, and see how far you can go. Kinbuild. Don’t build alone.

The model and voice files were obtained from the official `thewh1teagle/kokoro-onnx` model-files-v1.0 GitHub release. This is synthetic narration. Runtime/model files remain outside the repository. Original preparation was a 70 Hz high-pass, centered equal-power stereo, gentle compression, +5.67 dB gain and a −3 dBFS limiter with latency compensation. The four complete thoughts and four caption cues remain intact.

## Music and sound

“A Shared Beginning” remains an original 116.36 BPM instrumental: Dm(add9) → Bbmaj7 → F(add9) → C(add9) → Fmaj9. The five approved keys, pad, pulse, bass and drums source files are reused without rewriting their melody, harmony or tempo. Sixteenth-note shakers and light percussion add momentum. The pulse layer's gain is increased by a factor of 1.16. Newly generated percussion receives a 2.2 kHz presence dip and +10.5 dB preparation gain; the original stems keep their earlier preparation.

All six music tracks use native volume envelopes, ducking to 0.62 under the sustained narration and returning to the foreground in the pauses and final hold. A separate quiet track supplies selected toy-connection clicks. All music and effects are original procedural synthesis, without downloaded recordings or samples. Authored cue times are recorded as authored timing, not claimed to be listening-confirmed transients.

## Picture and export

Blender 4.3.2 renders the original 3D scene through EEVEE directly at 1920 × 1080. The 12 distinct poses per second and 24 fps final timing are unchanged. Depth of field and motion blur are disabled. The camera filter is reduced to 0.8 pixels; the key light supplies contact shadows, fill/rim lights supply even illumination, and the large matte paper floor uses a diffuse shader. Six sampling passes are used. There is no spatial upscale or blanket denoising step.

The source footage is packaged as H.264 CRF 12. Tesseract CLI 0.3.0 exports the 1920 × 1080 native composition through ProRes 4444 (12-bit 4:4:4 with alpha), avoiding another low-bitrate H.264 intermediate. Final delivery is H.264 CRF 17, 24 fps, yuv420p and faststart for browser compatibility. Typography is rendered at the full delivery resolution.

The v3 AAC soundtrack is copied unchanged. Its verified −15.21 LUFS integrated / −1.52 dBTP measurements and exact mastering recipe remain in `mastering-v3.json`. `quality-v4.json` records matching audio packet hashes, unchanged audio timeline metadata and measured final video dimensions. No new voice synthesis, remix, loudness processing or audio encoding is performed. The editable native project retains the original premaster audio layers.
Manrope and Inter remain packaged with their OFL notices in `licenses/`. The original website stone logo remains unchanged. The toy scene uses original geometry, with no LEGO logo or third-party models. Neither Runway nor InVideo exposed callable tools in the session; this film was created locally with Blender and Tesseract.

## Review scope

Native filmstrip, final-size before/after detail comparison and full-size ending inspection cover the opening, assembly, camera cuts and final typography. Initial 3D reviews caught and corrected figure orientation and future pieces appearing before their assembly windows. The final waveform and encoded loudness are inspected separately from browser audio/video decoding.

The v2 voice and music were approved by the user. This environment cannot audition audio; the added rhythm and final v3 balance have technical checks, without a claim of a new listening review. Browser checks cover decoding, seeking, captions, volume/mute, replay, mobile fullscreen, error handling and close behavior. The standalone HTML is checked over HTTP without external asset requests; direct file-URL automation is restricted in this environment.
