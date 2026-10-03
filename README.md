# StartBeside

A responsive, interactive website for the first Melbourne founder pilot. Built from the selected warm-white, editorial design with React, TypeScript and Vite.

## Run locally

Use Node 24 (`.nvmrc` pins the verified version).

```sh
npm ci
npm run dev -- --host 0.0.0.0 --port 4173 --strictPort
```

In the managed cloud workspace, use `npm ci --cache /tmp/kinbuild-npm-cache` if the default home cache is not writable. The existing checkout is `/workspace/Kinbuild-Founders`; each cloud task is isolated, so no additional worktree is needed.

```sh
npm run build       # TypeScript check and production build to dist/
npm run build:netlify # Pre-built live registration site to artifacts/netlify-site/
npm run preview     # Serve the production build
npm run build:standalone # One HTML file, including fonts, film, audio and captions
npm test            # Chromium interaction and accessibility checks
```

Tests use `/usr/bin/chromium` when available. Else install Playwright's browser with `npx playwright install chromium`, or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to an existing Chromium executable.

## Included

- Responsive single-page navigation, keyboard-accessible mobile menu and FAQ.
- Original generated stone-gateway imagery, pointer-driven 3D perspective, and a short assembly on entry.
- A dedicated film chapter after the opening: a scroll invitation, an HD still of the toy founders, a clearly labelled play control and a bridge into Meet → Match → Build → Decide. The window rises gently into view once; reduced-motion preferences disable decorative movement. On mobile, the primary action and gateway animation both appear early. Logo assembly starts when its artwork enters the viewport.
- An optional 20-second film in a window, rendered directly at 1920 × 1080: original 3D toy founders assemble around a table, then build the familiar stone gateway. The approved voice style and original score are retained; the two complete phrases naming the campaign now say StartBeside, with rhythmic percussion, speech ducking, captions, seek, volume, mute, replay, fullscreen, transcript and a registration call to action. The StartBeside revision preserves the HD footage and music stems; it replaces only the two branded narration phrases and adjusts the final music duck to their duration. Media is only requested after opening the film. Closing pauses playback and restores focus; autoplay refusal has an explicit play button. The page’s decorative motion respects reduced-motion preferences.
- Startup/SaaS language, skill/sector/working-style matching, Meet → Match → Build → Decide and an honest longer-term route towards investors.
- The agreed Melbourne introduction, a “Pilot at a glance” overview marked as a planned format, and interest → short conversation → separate invitation steps beside the form. Registering interest explicitly does not guarantee a place.
- Name, email, sector and primary-skill form with validation, completion and reset states.
- A prepared Netlify Forms submission mode with pending, receipt and retry states, honeypot protection and a public privacy contact. Local and standalone previews do not send form data.
- Self-hosted Manrope and Inter fonts, Phosphor icons, and local images; no analytics or third-party font requests.

## Registration and launch status

**Local and standalone previews remain clearly labelled previews.** They do not send form requests or store personal information in browser storage. The temporary public contact is `osmanorka@gmail.com`. `npm run build:netlify` produces a live-mode package, and `netlify.toml` configures future Netlify production builds with that contact; branch and deploy previews stay in preview mode. The site has not yet been deployed or verified against a real Netlify account. Enable form detection and verify one hosted submission before announcing registrations. See [Netlify registration handoff](docs/netlify-registration.md) and [Turkish publishing guide](docs/yayin-adimlari.md).

The site tells StartBeside’s story and purpose. The organiser has chosen not to feature their name, portrait or personal biography; a LinkedIn link is optional and is not a launch requirement. The approved temporary contact handles registration and privacy enquiries until a project address is ready. No people, affiliations, investor access, dates, places, participant counts or testimonials have been invented.

The generated source design is `docs/design-reference.png`. The implementation and validation record is in `design-qa.md`; browser screenshots remain in the local, ignored `artifacts/` directory.

## Editing

- `src/App.tsx`: page structure, copy, navigation and FAQ.
- `src/styles.css`: design tokens, responsive layouts, perspective and motion.
- `src/components/Artwork.tsx`: real image layers and pointer interaction.
- `src/components/FilmFeature.tsx`, `src/film-feature.css` and `src/hooks/useEntrance.ts`: film discovery, poster, responsive presentation and one-time arrival motion.
- `src/components/StoryDialog.tsx` and `src/film.css`: film window and accessible media controls.
- `motion/kinbuild-film/`: portable Tesseract source, rendered film, provenance and verification notes.
- `motion/kinbuild-toykit/`: editable Blender scene, original toy models, assembly animation and rendering scripts.
- `src/components/InterestForm.tsx`: form validation and honest preview state.
- `src/registration.ts`, `index.html` and `netlify.toml`: explicit registration mode, Netlify form discovery and build configuration. `.env.example` lists the two public settings.
- `tests/site.spec.ts`: end-to-end and automated accessibility coverage.
- `tests/registration.spec.ts`: live-mode submission behavior with intercepted local requests; no real registrations.

The production site builds into `dist/` for a static host. This task does not publish or deploy the site.

The self-contained download is generated as `artifacts/StartBeside.html` by `npm run build:standalone`. It embeds the video, audio, poster, captions, imagery and fonts. The normal production build keeps the film separate so it is loaded only when requested.

The earlier pilot-copy handoff is also saved as `artifacts/Kinbuild-pilot.html`. The `pilot-update-*.png` screenshots in `artifacts/` show the updated desktop, tablet and mobile views. Earlier `Kinbuild-story.html` and `Kinbuild-HD.html` handoffs remain available for comparison.

## StartBeside revision

StartBeside is the selected campaign name. Visible copy, page metadata, privacy copy, film text/narration/captions and Netlify form identifier (`startbeside-interest`) now use it. The existing workspace and historical motion directories retain their names for continuity. This change does not purchase a domain or establish trademark availability.

Current editable film: `motion/kinbuild-film/StartBeside.tsrct`. Current shareable film: `motion/kinbuild-film/StartBeside-film.mp4`. Current self-contained preview: `artifacts/StartBeside.html`. Netlify publication archive: `artifacts/StartBeside-Netlify.zip`. Original Kinbuild sources and prior handoffs are retained. The publication package enables registration; hosted persistence remains unverified until account connection, form detection and deployment. Nothing has been deployed.

Draft LinkedIn launch copy, the registration follow-up reply and introductory conversation prompts are in `docs/launch-copy.md`. No social post or email has been sent.
