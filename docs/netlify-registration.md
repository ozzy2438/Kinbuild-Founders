# Netlify registration handoff

Prepared locally on 2 October 2026. **No deployment, Netlify account change or real submission has been made.**

## What is ready

- `netlify.toml` builds with Node 24.19.0 and publishes `dist/`. Its production context now enables Netlify registration with the approved temporary contact `osmanorka@gmail.com`.
- The built `index.html` contains a hidden `startbeside-interest` form so Netlify can discover the client-rendered form and its fields. Its `bot-field` is a honeypot.
- In live mode, the React form sends URL-encoded name, email, sector and skill to the same site's `/` endpoint. It waits for a successful HTTP response before showing receipt, disables repeated submissions while waiting, and retains the entered values on failure. Requests time out after 15 seconds. No personal data is written to browser storage.
- Receipt is shown on the page. An automatic confirmation email is **not** configured or promised. Pilot invitations are separate, and interest is not a guaranteed place.
- The privacy disclosure names Netlify as the form storage provider and shows the organiser's approved contact address in live mode.
- The normal build loads the separate 20-second HD film only on request. Publish `dist/`, not the large standalone demonstration file.

## Build modes

| Setting | Effect |
| --- | --- |
| Missing `VITE_REGISTRATION_MODE`, or `preview` | Honest preview; no form request is sent. This is the current default. |
| `VITE_REGISTRATION_MODE=netlify` plus a valid `VITE_CONTACT_EMAIL` | Enables Netlify submission and live registration/privacy copy. |
| `netlify` without a valid contact email | Build/start fails with an explicit configuration error. |
| `npm run build:standalone` | Always produces a preview, even if the surrounding environment specifies live mode. |
| `npm run build:netlify` | Builds `artifacts/netlify-site` with live registration and the approved public email from the Vite environment. |

These settings are public, compiled into the website, and require rebuilding after changes. They are not secrets. Copy `.env.example` to `.env.local` for local settings; do not use a test email for public registration. Netlify deploy previews and branch deploys explicitly stay in preview mode.

## Still needed before collecting registrations

1. Public contact is configured as `osmanorka@gmail.com`; the user confirmed continuing after correction of the earlier `gmai.com` typo. Change it later when the project mailbox is ready.
2. The organiser reports having switched the existing Netlify account to Free after previous charges. No account has been linked or inspected here. Use the intended Free team; do not enable paid upgrades, add-ons or automatic credit purchases.
3. Enable Netlify form detection for the site. Production settings are already in `netlify.toml`; the pre-built ZIP already contains live-mode files. Keep preview contexts in preview mode.
4. The user has asked to continue with the next steps. Publish to the intended Free account once connected and confirm that `startbeside-interest` appears under the site's Forms tab. Do not purchase anything or switch plans.
5. Before a LinkedIn announcement, make one authorised test submission on the hosted site. Verify the exact entry under Forms (and check spam), the on-page receipt, the privacy contact, and a phone submission. Remove the test record afterwards. A browser test with mocked responses does not establish persistence in Netlify.
6. Configure organiser notifications in Netlify if wanted. An email receipt to applicants would require a separate integration; none is included here.

The organiser has chosen a project-focused site: no personal name, portrait or biography is required. The About section explains StartBeside’s purpose and planned pilot. A LinkedIn link is optional. The public contact email can be a project address; a custom domain is not required. Dates, venue, time commitment, group size and cost remain unconfirmed and are described that way on the page.

## New form fields

The form now also sends `looking_for` (Build, Design, Grow or Open, comma-separated), `working_style`, `weekly_hours` and `availability` (optional, comma-separated). All are declared in the hidden detection form in `index.html`. Netlify only learns new fields at the next deploy with form detection on, so redeploy once after this change and check that the new columns appear.

## Optional: anonymous community totals

`netlify/functions/community-pulse.mjs` reads the form's submissions with the Netlify API and returns only counts per strength (Build, Design, Grow), one per email address. It returns nothing until at least `PULSE_MIN_TOTAL` people (default 12) have registered, and the site hides the block on any error. It is off by default. To turn it on:

1. Create a Netlify personal access token and add it to the site's environment variables as `NETLIFY_FORMS_TOKEN` (functions scope). Optionally set `PULSE_MIN_TOTAL`.
2. Set `VITE_COMMUNITY_PULSE=on` for the production context (for example in `netlify.toml`) and deploy through a Git-connected or CLI build. Netlify Drop uploads static files only, so the function is not deployed that way.

Functions count towards the plan's usage. Responses are cached at the CDN for 15 minutes, so a busy day still triggers only a handful of invocations, but leave it off if the account must stay strictly within free static hosting.

## Cost and manual publishing notes

The current credit-based Free plan has 300 monthly credits and a hard usage limit, with no automatic recharge option. Production deployments consume 15 credits, bandwidth 20 credits per GB, and requests 2 credits per 10,000 requests. Forms are free and unlimited on credit-based plans; older legacy accounts have different terms. These are published plan terms, not a verified view of the organiser’s billing account. The site uses no Netlify AI features. The only function is the optional community-totals endpoint above, which stays unused unless enabled. Use the included `netlify.app` address for now.

This workspace has no authenticated Netlify connection. A pre-built production folder can be uploaded from the intended account using [Netlify Drop](https://app.netlify.com/drop), without a build running on Netlify. Enable **Forms → Enable form detection** and redeploy after enabling it; form detection applies from the next deploy. Confirm `startbeside-interest` appears before announcing registration. For later updates, upload to the existing project’s Deploys page. If the project is private by default, change its visibility to public when publishing.

## Current service documentation

Checked on 2 October 2026:

- [Forms setup](https://docs.netlify.com/manage/forms/setup/): client-rendered forms need a discoverable static HTML form; AJAX submissions use URL-encoded fields and `form-name`.
- [Forms usage and billing](https://docs.netlify.com/manage/forms/usage-and-billing/): Netlify currently describes Forms as free and unlimited on credit-based plans. Legacy plans have separate limits. This does not mean hosting, bandwidth or builds are unlimited; confirm the selected account's current allowances before publication.
- [Form submissions](https://docs.netlify.com/manage/forms/submissions/): submissions can be reviewed and managed in the site's Forms tab; disabling form detection prevents processing new or changed forms.
- [Credit-based plans](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/) and [create deploys](https://docs.netlify.com/deploy/create-deploys/): checked again after the organiser reported prior subscription charges and a move to Free.

## Local verification

`npm test` runs the existing preview suite and a separate registration suite. The latter uses a local server with `pilot@example.test`; every POST is intercepted in the browser. It covers delayed acceptance, duplicate-send protection, 429/503 responses and retries, network failure, validation, privacy copy, and accessibility in failure and success states. No tests contact Netlify or submit a real registration.
