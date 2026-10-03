# Kinbuild toy-kit film — native 1080p 3D source

An original miniature founder studio, modeled and animated in Blender 4.3.2. A single toy brick becomes a table, three seated founders, laptops and a shared prototype. A final burst of pieces builds the familiar Kinbuild gateway behind the team. Sage, clay and blue distinguish the three figures; the gateway keeps the original sand, ivory and charcoal palette.

The current film renders directly at **1920 × 1080**. The previous 960 × 540 footage was too soft after enlargement and denoising. The HD revision replaces every frame at the source resolution, with no spatial upscaling or blanket post-denoising. Story, camera animation, poses, timing and approved audio are retained.

This is a LEGO-inspired construction-toy treatment with original geometry, no LEGO logos or imported commercial models. Runway and InVideo tools were not exposed in the task session; neither service was used.

## Current editable sources

- `Kinbuild-toykit-HD.blend`: geometry, animation and current 1080p rendering/light configuration.
- `Kinbuild-toykit.blend`: original scene before the HD render configuration.
- `build_scene.py`: complete deterministic original scene authoring recipe.
- `render_hd.py`: current resumable HD renderer, including the 1080p configuration. It samples the 24 fps animation on odd frames for the approved 12-pose-per-second stop-motion cadence.
- `render_film.py`: legacy 540p renderer used for revision 3, retained for provenance.
- `../kinbuild-film/Kinbuild.tsrct`: current portable 1920 × 1080 edit with native text animations and eight separately editable audio layers.

## Rebuild the HD picture

From the repository root, with Blender 4.3.2 installed:

```sh
LP_NUM_THREADS=5 MESA_SHADER_CACHE_DIR=/tmp/kinbuild-mesa-cache blender -b motion/kinbuild-toykit/Kinbuild-toykit.blend --python motion/kinbuild-toykit/render_hd.py
```

Rendering uses EEVEE, six samples, 1920 × 1080 at 100%, a 0.8-pixel camera filter, no motion blur and no depth of field. The key light supplies contact shadows while fill/rim lighting is even. The matte paper floor uses a diffuse shader. Toy materials and geometry remain editable. Each source pose is held for two frames in the 24 fps delivery.

Output goes to the separate ignored `.tesseract-work/v4/renders/` directory. Remove or move that directory before rendering different settings: the resumable renderer intentionally retains completed PNGs. `progress.json` records completed frames and review coverage. All 240 PNG dimensions are checked before packaging.

`../kinbuild-film/finalize_hd.py` packages source footage at CRF 12, applies `author_hd.py`, exports the native composition through ProRes 4444 and creates the browser MP4 at CRF 17. It copies the approved v3 audio packets unchanged and verifies their hashes and timing. See the film README for source asset and CLI prerequisites.

## Timing and review

Camera edits follow the approved score at 4.125, 8.25, 12.375 and 16.5 seconds. The final gateway holds for the brand message. The initial brick asks a visual question: what can this become when the other pieces arrive?

Initial v3 reviews corrected inward-facing figure orientation and future parts appearing too early. The HD review checks the same action at full size, including faces and keyboard details. `Previews/hd-storyboard.png` samples the new 3D sequence; `../kinbuild-film/Previews/filmstrip-v4-HD.png` samples the final native composition. Output dimensions and the unchanged soundtrack are recorded in `../kinbuild-film/quality-v4.json`.
