# Kinbuild design QA

final result: passed

## Current revision — pilot clarity and Netlify form preparation, 2026-10-02

Resumed the existing `/workspace/Kinbuild-Founders` checkout after verifying read access and a real create/delete write check. The starting branch was `work` at `7b0208b`; the existing website and media were already uncommitted. The previous chat reader was unavailable, so the user supplied the pending changes directly. No deployment, push, account configuration or real registration was performed.

### Implemented

- Replaced the hero lead with the agreed text: “Meet people in Melbourne. Test a startup idea together. See if you’re a team.”
- Extended the existing dark pilot section with “Pilot at a glance”: audience, Melbourne location, face-to-face meeting and mutual choice, small shared work trial, expected contribution and a decision about continuing. The format is labelled planned; dates, venue, group size, time commitment and any cost remain unconfirmed.
- Added interest → short conversation → separate invitation beside the form, explicitly saying that registration does not guarantee a place. The FAQ uses the same sequence.
- Prepared Netlify Forms detection, URL-encoded submission, a honeypot, a pending state, duplicate-send protection, a 15-second timeout, server-response checking, and retained inputs on errors. Receipt and privacy text switch with the explicit build mode. No automatic email receipt is claimed.
- Default local builds remain a labelled preview. Live mode requires a valid, public contact email. Standalone output always stays a preview, even when built from a live-mode environment. The approved contact is still needed; account configuration and hosted persistence are unverified.

### Validation and evidence

- The restored baseline passed production/type checking, standalone generation and all 11 original browser scenarios before editing.
- The updated suite passed **16/16 scenarios**: all 11 preview/media/accessibility checks plus five registration scenarios. Requests in registration tests are intercepted locally. Verified delayed success, duplicate-send prevention, HTTP 429/503 recovery, network failure, validation, privacy contact, and accessibility in error/success states.
- After adding assertions for the three requested content changes, the focused startup/navigation scenario passed again. Production/type checking, the separate live-mode production build and standalone generation passed. Invalid registration mode and missing contact configurations were confirmed to fail with explicit errors.
- Production screenshots were opened and inspected at 1440 × 1000, 768 × 1024 and 390 × 844. Files: `artifacts/pilot-update-{desktop,tablet,mobile}-{hero,pilot,register}.png`. Existing paper, ink, fonts, ruled sections and dark pilot styling are preserved. Five overview items use two columns on larger screens and one on mobile; the numbered next steps sit beside the form on desktop and above it on mobile. No clipped text or horizontal overflow was observed. The original seven-width overflow check also passes.
- `artifacts/pilot-update-browser-check.json` verifies the compiled live-mode build and the final standalone in a local browser. The hidden detection form and every submitted field are present in built HTML; the live build makes one intercepted POST and the standalone makes none. Both retain HD 1920 × 1080 playback, decoded audio, all four captions, pause-on-close and focus restoration. No page errors or external requests occurred in this check.
- Current downloadable handoff: `artifacts/Kinbuild-pilot.html` (about 13.25 MiB including the HD film). The normal production build still requests the video only when played. A diff against the resumed files is saved in `artifacts/pilot-update.patch`.

### Remaining launch work

Supply the organiser-approved public contact email, configure the intended Netlify account and form detection, then verify one authorised hosted submission before any LinkedIn announcement. The exact handoff and current official Forms documentation are in `docs/netlify-registration.md`. Founder profile details remain unprovided. Physical Safari/iOS testing and subjective audio listening were not performed. Nothing has been deployed.

final result: local implementation and checks passed; live registration not activated

---

## Current revision — opening animation and film discovery, 2026-10-01

The user requested an opening animation followed by a film window discovered on scroll. The approved warm editorial brand and HD film are the visual source; relocation and responsive pacing are intentional changes, rather than a literal recreation of the earlier page layout.

### Evidence

- Source visual truth: the approved current site captured before changes in `artifacts/before-story-desktop.png` and `artifacts/before-story-mobile.png`; the original concept remains `docs/design-reference.png`. The approved film scene is extracted at 7.4167 seconds into `public/media/kinbuild-team.webp` (1920 × 1080).
- Final implementation: `artifacts/story-layout-desktop-hero.png`, `story-layout-mobile-hero.png`, `story-layout-desktop-section.png`, `story-layout-mobile-section.png`, `story-layout-tablet-film.png` and `story-layout-mobile-playing.png` (all under `artifacts/`).
- Matched full-viewport comparison inputs: `artifacts/story-comparison-desktop.png` (1440 × 1000 per panel) and `artifacts/story-comparison-mobile.png` (390 × 844 per panel), previous site left and revised site right. Both were opened and visually inspected together. Device scale factor is 1; CSS and capture pixels match, with no density normalization.
- Focused asset comparison: `artifacts/story-comparison-poster.png` places the approved 1920 × 1080 frame, normalized to the browser image's dimensions, beside the actual rendered poster. The only deliberate overlay is the play control. Faces, materials, framing and colors remain intact; the video is not cropped or rescaled to fabricate detail.
- Full journey: `artifacts/story-layout-desktop-full.png`, `story-layout-mobile-full.png`, and `Kinbuild-story-preview.png`. Full-page captures start at scroll position zero after the reveal has run. The skip link is clipped until focused, preventing it painting into a full-page capture; keyboard Tab/Enter behavior was checked on desktop and mobile after this final CSS adjustment.
- State: fonts loaded; entrance complete; film preview at rest or hover as captured. Separate playback screenshots show the actual paused HD video with captions and controls. Tablet viewport is 768 × 1024; desktop 1440 × 1000; mobile 390 × 844.

### Findings and comparison history

1. **P2, resolved — weak film discovery.** The old small hero control under the stone logo gave the approved film little presence. A separate editorial chapter now sits directly after the hero, with a full-width poster and an explicit route into the process section. The first implementation is recorded in `story-layout-desktop-section-v1.png`.
2. **P2, resolved — play control too low on desktop.** In the first implementation the bottom-left control could sit below the viewport as the film section arrived. It is now centered on desktop/tablet. The mobile control stays bottom-left, where the entire shorter poster fits. Final section and tablet captures confirm visibility.
3. **P2, resolved — mobile opening priorities.** The first mobile revision put the primary action below the artwork. The action now follows the short headline copy, with the stone assembly immediately below it. Final mobile comparison shows both in the first 844px viewport, without sacrificing the original headline or hiding the startup description.
4. **P1, resolved — transient contrast in reveal.** Initial opacity reduced the contrast of the entire offscreen window, detected by axe. The reveal now uses transform alone; labels keep full contrast throughout. The unchanged accessibility assertions pass in desktop, mobile, validation and film states. Reduced motion renders the window immediately without movement.
5. Relaxed the new headline's tracking for clearer word separation. Final poster, section, hero and playback evidence were recaptured and inspected after these fixes. No actionable P0/P1/P2 issue remains.

### Required fidelity surfaces

- **Typography:** existing locally hosted Manrope/Inter retained. The desktop opening is slightly more compact to accommodate the discovery cue. Film headline hierarchy, two-line desktop/mobile wrapping, small labels and caption legibility were inspected.
- **Spacing/layout:** original split hero, warm page and ruled process retained. Film sits between introduction and process. Responsive section spacing, window radius, restrained shadow and reading order were inspected at desktop, tablet and mobile sizes; seven breakpoints have no horizontal overflow.
- **Colors/tokens:** original paper, ink, stone and muted text reused. Dark window chrome echoes the existing primary button and pilot section. No added gradients or visual blur. Contrast remains intact during arrival.
- **Image quality:** original stone logo retained as a raster asset. New poster is a 1920 × 1080 WebP extracted from the approved film; no substitute illustration. The approved HD video and soundtrack are unchanged. Rendered poster was compared with the source in one combined image.
- **Copy/content:** the new chapter explicitly connects complementary people with building a startup. Existing working-style matching, pilot caveats and investor-readiness language are preserved. No new claims of funding, members, mentors or live registration.

### Validation

- Production build, TypeScript check and standalone build passed. The self-contained `artifacts/Kinbuild-story.html` includes the new poster and existing film, captions, audio, artwork and fonts.
- All **11 interaction/accessibility scenarios** passed across the final complete run (10 passes; one timing timeout) and the focused rerun (1 pass). The seven-width test exceeded its original 30-second total while repeatedly loading pages and waiting a fixed duration. It now awaits actual font/animation completion and has a 45-second budget for seven viewports; all original overflow and navigation assertions remain, and it passed in 24.1 seconds.
- New scenario confirms that the film is below the initial viewport on desktop/mobile, scroll discovery works, no video element or MP4 request exists before play, keyboard activation plays it, and Escape returns focus to the visible preview.
- Existing coverage verifies decoded 1920 × 1080 video/audio, seek, pause, replay, captions, volume, fullscreen, failure/retry, browser autoplay refusal, reduced motion, menu, form preview and FAQ/privacy.
- Standalone browser verification: `artifacts/story-layout-standalone-check.json`. Poster loads at 1920 × 1080; HD video/audio decode; four caption cues load; closing pauses and restores focus; mobile has no overflow. Zero console/page errors or external requests (only the document and local caption blob).
- Browser verification used local Chromium/Playwright. This is a local implementation and downloadable prototype; public deployment and physical Safari/iOS testing are outside this revision. The interest form remains a labelled preview.

### Implementation checklist

- Completed: opening assembly and mobile action placement.
- Completed: film chapter, scroll reveal, play interaction and bridge to the process.
- Completed: matched visual comparisons and all P1/P2 repairs.
- Completed: functional/accessibility verification, builds and standalone media check.

No blocking open questions or remaining P3 recommendations for this revision.

final result: passed

---

The entries below record earlier design and media revisions.

## Evidence and comparison state

- Selected direction: first displayed Kinbuild concept, refined with the user's requested startup language and cinematic interaction.
- Source visual truth: `docs/design-reference.png`, copied from `/workspace/generated_images/exec-38e769b4-dfeb-465e-8b64-83a94f781a9b.png` (1003 × 1568 pixels).
- First implementation capture: `artifacts/desktop-reference-v1.png`, CSS viewport 1003 × 1568, deviceScaleFactor 1. No density rescaling.
- Full-view comparison: `artifacts/comparison-v1.png` places source on the left and implementation on the right at identical dimensions.
- Additional rendered evidence: `artifacts/desktop-full-v1.png`, `artifacts/mobile-full-v1.png`, `artifacts/mobile-hero-v1.png`.
- State: home page at rest, fonts loaded, entrance animation complete.

## Findings, first comparison (resolved)

- **P2 — Hero overflow at 1440px.** The right-side art extended beyond the viewport by a few pixels. Rebalanced the image's width and margin. All seven tested widths pass, and pointer tilt separately retained a 1440px scroll width in a 1440px viewport.
- **P2 — Excess vertical space and tightly tracked process headline.** The first process rule was 16px below the reference; the charcoal panel started about 60px too low. Reduced the eyebrow and headline-to-copy gaps, adjusted the process heading size/line height, and relaxed tracking for readable word spaces. Final source and implementation section transitions now align to within a few pixels at the comparison viewport.
- **P2 — Missing browser icon request.** The first browser visit produced a favicon 404. Added the generated WebP as the icon. Final console and page-error checks pass.

## Fidelity surfaces

- Fonts: local Manrope Variable and Inter Variable, deliberate two-line hero. Process typography needed the changes above.
- Spacing/layout: split hero, four-column ruled sequence, full-width dark pilot retained; mobile uses content before the art and vertical process rows. Desktop overflow is resolved. Forms, FAQ, eligibility, origin note and footer are new sections beyond the source viewport, designed consistently with the written brief.
- Colors: source warm white, ink, stone and subtle rules mapped to CSS tokens; no added accent colors.
- Images: custom generated transparent stone gateway, actual raster asset, not CSS/SVG artwork. Its camera angle differs slightly from the full-page reference while retaining material, pieces and composition. This is an acceptable asset-generation difference; the user-requested perspective and entrance animation operate on that raster image.
- Copy: startup idea/product, SaaS, work preferences and later investor readiness are explicit. Investor/mentor access, dates, founder identity and statistics are not fabricated.

## Final browser and interaction evidence

- Form errors, keyboard focus, completion preview, and reset passed. No POST requests or browser storage are used.
- FAQ and privacy disclosure passed.
- Story playback, pause, resume, replay, Escape and focus restoration passed.
- Reduced motion passed.
- Automated WCAG A/AA checks passed in desktop, mobile, error-form and paused-story states.
- Final suite: **7 passed**, Chromium, one worker. Viewports checked for overflow: 320, 390, 760, 768, 1003, 1440 and 1920 CSS pixels.
- Additional functional check: the story's final CTA closes the modal, scrolls to registration and focuses `#register-title`.
- Production build and TypeScript check passed.
- Film timing was adjusted to use actual elapsed time, keeping the 12-second CSS sequence and text/progress clock aligned under frame delays.

## Comparison history and final evidence

1. `artifacts/comparison-v1.png`: original implementation, issues recorded above.
2. `artifacts/comparison-v2.png`: overflow and tracking corrected; hero artwork sizing increased the section's total height. Focused regions: `comparison-hero-v2.png` and `comparison-process-v2.png`.
3. Reduced unnecessary vertical play-button padding and section padding; final screenshots recaptured at the identical 1003 × 1568 CSS/pixel viewport, density 1.
4. Final full-view evidence: `artifacts/comparison-full-final.png`. Focused same-region comparisons: `artifacts/comparison-hero-final.png` and `artifacts/comparison-process-final.png`. Each combines source left and rendered site right, with no density rescaling. All three were opened and inspected together; headline, action, texture, copy and process details are readable in the focused views.
5. Final implementation screenshots: `artifacts/desktop-reference-final.png`, `artifacts/desktop-hero-final.png` (1440 × 1000 CSS/pixels), `artifacts/desktop-full-final.png`, `artifacts/mobile-hero-final.png` (390 × 844 CSS/pixels), `artifacts/mobile-full-final.png`.
6. Interactive-state evidence: `artifacts/story-desktop.png`, `artifacts/story-mobile.png`, `artifacts/form-mobile-errors.png`. Story screenshots were taken during the CTA's brief fade; the completed state was also functionally verified. Mobile input labels, inline errors, navigation and modal controls were visually inspected.

No actionable P0/P1/P2 findings remain for this frontend prototype. Browser captures and comparison were performed through local Chromium/Playwright because no callable in-app browser automation surface was exposed. This is current-instance validation, not deployment or validation on real Safari/iOS hardware.

## Implementation checklist

1. Completed: recapture and compare corrected hero/process against source.
2. Completed: overflow checks, clean console and pointer tilt check.
3. Completed: mobile full page and focused form/story review.
4. Completed: production build, TypeScript check and complete seven-test suite.

## Open questions / launch prerequisites

- Real registration delivery, founder identity/photo and any approved guest mentors have not been supplied. The form explicitly previews the flow and does not imply a live waitlist.

## Follow-up polish

- P3: a generated stone asset has small perspective/lighting differences from the concept image. The real web typography also differs slightly from image-generated glyph shapes; the intended font families and hierarchy are preserved.
- Optional launch work: device-specific Safari/iOS testing after deployment. The site has not been published.


## Narrated film update — 2026-10-01

Replaced the silent 12-second browser story with a 20-second original narrated film inside a desktop-style window. The selected landing design and existing 3D pointer interaction are retained. Motion connects a startup idea, complementary strengths, the four steps, a first product, a shared venture and the longer-term investor-readiness ambition.

- Final media: 1280 × 720 at 24 fps, H.264/AAC, about 2.7 MB. Synthetic British English narration, two subtle air transitions and one tactile accent; no soundtrack or third-party media requests.
- Window controls: actual media-event play/pause state, seek, mute, volume, captions, replay, fullscreen, transcript, close, Escape, focus restoration and a form link. Film loading begins only after the visitor opens it. A rejected browser play request leaves an explicit play button; load failure leaves retry, transcript and close controls.
- Passed: production build and typecheck; the original seven interaction/accessibility scenarios with the film scenario updated, plus mobile film/fullscreen, media failure and autoplay refusal (10 scenarios in total; targeted reruns after correcting close-button focus). Audio decoding, advancing video time, caption contents, volume/mute, seeking, replay, reopening and pause-on-close were verified.
- Desktop and mobile screenshots reviewed: `artifacts/film-window-desktop.png`, `artifacts/film-window-mobile.png`, `artifacts/film-home-desktop.png`. No clipped controls or horizontal overflow observed.
- Final standalone `artifacts/Kinbuild.html` verified over HTTP: one document request, zero external requests, zero page errors, 1280 × 720 media playback and all seven caption cues. It embeds video, audio, poster, fonts and imagery. Direct file-URL automation is blocked by the environment and was not bypassed.
- Final encoded audio: −15.02 LUFS integrated, −2.84 dBTP true peak. Waveform inspected, phrase gaps retained. This environment cannot audition audio; pronunciation and subjective voice/mix quality require human listening.
- Editable Tesseract source, final MP4, native filmstrip, waveform, provenance and audio measurements: `motion/kinbuild-film/`.

Result: visual, interaction and technical media checks passed; listening review remains explicitly outstanding. The registration form is still a labelled preview and no public deployment was made.


## Audio revision 2 — 2026-10-01

User feedback: the first narrator sounded robotic and there was no engaging background music. Replaced the narrator with af_heart, rewrote the script as four connected thoughts, reduced the synthesis speed to 0.90, and added an original 116.36 BPM score with keys, pad, pulse, bass and drums. The music builds through the process scene, resolves on the closing frame at 16.5 seconds and lifts in narration gaps. Six separate native audio tracks and their gain envelopes remain editable. No external music samples or recordings were used.

The native project was exported again; the picture still matches the selected film. Final encoded sound measures −15.19 LUFS integrated and −1.50 dBTP true peak. Source music, source speech and final mix waveforms were opened and inspected. Voice quality, pronunciation and subjective musical balance remain unverified by listening because this environment cannot audition sound.

Production/typecheck build passed. Five relevant browser scenarios passed: actual audio/video decoding with new caption content, mobile window/fullscreen, accessibility, failed loading, and autoplay refusal. The versioned standalone file `artifacts/Kinbuild-v2.html` includes the new film, narration, original music and four updated caption cues. `artifacts/Kinbuild-film-v2.mp4` is the direct listening copy. The existing registration preview and unconfirmed pilot/investor status are unchanged.

The user offered Runway and InVideo during this revision. All 44 callable tools and all 64 available cloud skills were checked; neither plugin exposed a callable capability in this session. No plugin invocation or external-service generation is claimed.

## Toy-kit film revision 3 — 2026-10-01

The user approved v2 narration/music and asked for a little more rhythmic energy and a changing toy-kit film. The 20-second picture is now an original Blender 3D assembly: one brick, a table, three seated founders, laptops and a prototype, then the Kinbuild gateway. Native closing copy reads “Build a startup. Together.” The website's original stone hero artwork is retained.

- Rendered 240 unique 960 × 540 frames in Blender 4.3.2 EEVEE; intentionally stepped 12 poses/sec, held in the 24 fps final film. Final composition is 1280 × 720, H.264/AAC, 20 seconds, approximately 1.9 MB.
- Reviewed the full sampled 3D sequence, then the saved native `Previews/filmstrip-v3.png` and full-size ending. Corrected inward figure orientation and premature visibility of future assembly pieces. The final brand composition keeps text clear of the team and gateway.
- Exact approved narration source SHA-256 preserved: `ba3120ed8df05cd1cac14ce02c3361895def04c9d7e6460de5a4a87849614a13`. Four speech timings/caption cues unchanged. Five original music stems are reused, with added sixteenth-note rhythm, a small pulse gain increase and sparse tactile clicks. All eight audio layers remain separately editable.
- Final encoded measurement: **−15.21 LUFS integrated, −1.52 dBTP**. New rhythm and final mix waveforms inspected. The user approved the original v2 voice/music; subjective v3 balance is not claimed as listening-reviewed because this environment cannot audition audio.
- Production/typecheck and standalone builds passed. Five relevant existing browser scenarios passed: media decoding/controls, mobile/fullscreen, automated accessibility, failed load and autoplay refusal (four in the first targeted run, one in the second).
- Versioned standalone `artifacts/Kinbuild-v3.html` verified over local HTTP: one document network request, a local Blob caption resource, no external requests, no page errors, four caption cues, 1280 × 720 media, actual audio/video decode, and pause on close. Direct file-URL automation remains restricted. The site has not been publicly deployed.
- Opened and inspected `artifacts/film-v3-desktop.png`, `film-v3-mobile.png` and `film-v3-ending.png`. Controls and captions fit the window; final typography and the startup message remain visible.
- Source: `motion/kinbuild-toykit/Kinbuild-toykit.blend` plus `motion/kinbuild-film/Kinbuild.tsrct`. Exact mastering recipe and cue map saved alongside them. Runway/InVideo tags were visible but neither exposed callable generation tools. Neither service was used.
- Updated the saved cloud `start_skill` to the current Watch the film flow, ten-test suite, standalone verification and optional local film tooling; the existing installation script and network settings were preserved.

## Picture clarity revision 4 — 2026-10-01

User feedback: the toy-kit film was liked, but looked blurry. The earlier picture enlarged 960 × 540 renders, applied blanket denoising and used a 720p compressed intermediate. Replaced all 240 source frames with direct **1920 × 1080** renders; no spatial upscaling or post-denoising. The camera filter is 0.8 pixels, depth of field/motion blur are off, and matte paper shading plus key-only contact shadows keep the render clean. Geometry, camera timing, 12-pose cadence, 24 fps delivery and the story are retained.

- Native Tesseract typography and positions scaled to a 1920 × 1080 composition. Final export uses a ProRes 4444 intermediate and H.264 CRF 17. Final picture: **1920 × 1080, 24 fps, 20 seconds**, about 8.3 MiB. All 240 PNG dimensions are validated before packaging.
- The complete approved v3 AAC stream is copied without reencoding. Packet hashes match (`7035432b8da4884d7ed33008df37c6c03fa68dd430f1a28efefb22d630a51743`), as do audio start time, duration and time base. No new voice generation, remix or loudness processing. Prior verified audio measurements remain applicable; no new listening claim is made.
- Inspected `motion/kinbuild-toykit/Previews/hd-storyboard.png`, the saved native `motion/kinbuild-film/Previews/filmstrip-v4-HD.png`, full-size native ending, and the actual encoded before/after detail crop `artifacts/Kinbuild-HD-karsilastirma.png`. Eyes, mouth, keyboard keys and toy edges are visibly clearer. The comparison puts the old and new delivered frames at the same display size.
- Production/typecheck and standalone builds passed. Five targeted browser scenarios passed: 1920 × 1080 media decoding and controls, mobile/fullscreen, automated accessibility, media failure, and autoplay refusal. The existing playback test now asserts both HD dimensions.
- Standalone `artifacts/Kinbuild-HD.html` checked over local HTTP: 1920 × 1080 media, 20 seconds, four captions, actual audio/video decoding, no page errors, no external requests, pause on close. Opened and inspected `artifacts/film-HD-desktop.png` and `film-HD-mobile.png`. Controls and captions fit. The complete embedded site is approximately 13.1 MiB.
- Updated editable sources: `motion/kinbuild-toykit/Kinbuild-toykit-HD.blend` and `motion/kinbuild-film/Kinbuild.tsrct`. Reproducible render/export scripts and exact output/audio verification are documented in the motion READMEs and `quality-v4.json`. The website's original hero, registration preview and other page behavior are unchanged. No public deployment was made.

## StartBeside rebrand — 2026-10-02

The selected campaign name is StartBeside. Updated visible text, page metadata, navigation labels, form/privacy copy, transcript/captions, media URLs, standalone output name and the Netlify form identifier. Wordmark uses the selected mixed-case spelling with tighter tracking to fit the longer name. No deployment, purchase or live registration occurred.

- Production build and standalone build passed; 16 existing Playwright checks passed, including seven responsive widths, accessibility, full film controls and mocked registration success/error/retry behavior.
- Additional production browser inspection at 390, 768 and 1440 px found no header overlap or remaining visible old brand; initial MP4 request count was zero. Screenshots and findings are in `artifacts/startbeside-*`.
- New native `StartBeside.tsrct` preserves 18 layer IDs, original full-HD footage, six music source assets and effects. Two native brand text layers changed. Only complete narrated thoughts 2 and 4 were regenerated with the same local Kokoro voice/style; thoughts 1 and 3 retained their original processed samples. Last phrase ends at 18.826 seconds, within the original 20-second timeline. Music duck recovery shifted accordingly. Native 0.3.1 media playback fields use identity mappings for the original 0–20000 ms ranges.
- Opened and visually inspected native 12-frame filmstrip, final full-size end card and narration waveform. Final film: 1920×1080, 24 fps, 20 seconds, AAC 48 kHz stereo. Final encoded loudness: −15.15 LUFS, −1.51 dBTP. Pronunciation and subjective mix have not been listening-confirmed by the assistant.
- Current handoff: `artifacts/StartBeside.html` and `artifacts/StartBeside-film.mp4`. The self-contained HTML is about 13.3 MiB because it embeds media; production keeps the approximately 8.3 MiB film separate and loads it on demand. Previous public media were archived to `artifacts/kinbuild-media-before`; original native/film sources and previous HTML handoffs remain available.

## Project story and launch preferences — 2026-10-02

The organiser chose to feature StartBeside’s purpose rather than a personal founder profile. Removed the pending profile placeholder and the name/photo/biography launch requirement from current documentation. LinkedIn remains optional. Revised the About copy around shared work and the planned Melbourne pilot. Production and standalone builds passed; the updated section was checked at 390 and 1440 px without horizontal overflow.

The organiser has a Netlify account and reported prior unexpected subscription charges. No account changes or deployment have been made. Current plan and cost controls need verification before using that account. A personal Gmail address may be used temporarily as the public project contact, but the actual address has not yet been supplied.

## Contact and publication package — 2026-10-02

The user authorised continuing after correction of the temporary public contact to `osmanorka@gmail.com`. Configured that address for local previews, the self-contained download and Netlify production. `npm run build:netlify` now builds a separate live-mode directory in `artifacts/netlify-site`; ordinary local and standalone previews still do not collect registrations. Future Netlify production builds use the explicit production context in `netlify.toml`.

- `npm run build`, `npm run build:netlify`, `npm run build:standalone`, all 16 existing Playwright tests and whitespace checks passed.
- Checked the exact live-mode package in a mobile Chromium viewport: correct contact address, live registration label, matching `startbeside-interest` payload and successful local mocked receipt. No initial MP4 request, horizontal overflow or page error. Standalone contact matches and its form remains preview-only.
- `artifacts/StartBeside-Netlify.zip` contains 20 public files, with `index.html` at the root. ZIP integrity passed; size is 9.33 MiB. File hashes and release metadata are saved in `artifacts/startbeside-release.json`. The archive contains no environment files, secrets, tests, source files or internal documentation.
- `docs/launch-copy.md` supplies LinkedIn copy, a registration follow-up and short conversation prompts. `docs/yayin-adimlari.md` explains publication and the required hosted test. No message or social post was sent.
- Composio discovery found the hosted Netlify integration, with no active connection. Initiated the user authentication flow. No Netlify project, settings, billing change, deployment or real form submission has been made. Hosted persistence remains unverified until authentication and deployment.
