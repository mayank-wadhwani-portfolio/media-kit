# Mayank Wadhwani — Stand-up Comedy Website

A responsive, static website that can be hosted for free on Netlify through GitHub. No build step or framework is required.

## Files
- `index.html` — page content and sections
- `styles.css` — styling, responsive layout, transitions and fire cursor
- `script.js` — mobile menu, gallery filters/lightbox, WhatsApp enquiry form and cursor effects
- `assets/images/` — image assets and replaceable gallery placeholders
- `assets/videos/` — add performance videos here

## Before publishing: add Mayank's real media
The gallery currently uses clearly labelled SVG placeholders; they are not real photos. Replace them with actual photos from Mayank's media kit.

### Replace gallery photos
1. Copy the real photos into `assets/images/`, for example `mayank-stage-01.jpg`.
2. In `index.html`, find each `gallery-card` and change both the `<img src="...">` and `data-image="..."` to the new filename.
3. Update each image's `alt` and `data-caption` text.
4. You can duplicate a `gallery-card` block to add more photos. Use `data-category="stage"`, `"behind"`, or `"events"` to make the filters work.

### Add the main performance video
1. Copy an MP4 file into `assets/videos/`, for example `mayank-showreel.mp4`.
2. In `index.html`, find the `<video>` element and update the `<source src="...">` to `assets/videos/mayank-showreel.mp4`.
3. Optional: replace `assets/images/video-poster.svg` with a real poster image by changing the `poster` path.
4. Large video files can make a static site slow. For large clips, consider hosting video on a service that supports embedding and use its supported embed/player.

## Contact details already configured
- Business email: `business.mayankwadhwani@gmail.com`
- WhatsApp manager contact: `+91 80790 28032`
- The contact form prepares a message in WhatsApp. The visitor must press Send in WhatsApp to submit it.
- Manager WhatsApp is configured as `+91 80790 28032` in `script.js` and `index.html`. Instagram and YouTube links are included in the header/footer.

## Test locally
Open `index.html` in a browser. For a more accurate local preview, use VS Code's Live Server extension.

## Publish with GitHub + Netlify
1. Create/sign in to GitHub and create a new repository, e.g. `mayank-wadhwani-website`.
2. Upload the contents of this folder to the repository root. Ensure `index.html`, `styles.css`, and `script.js` are at the root, not inside another nested folder.
3. Sign in to Netlify and choose **Add new site → Import an existing project**.
4. Connect GitHub, select your repository, and configure:
   - Build command: leave blank
   - Publish directory: `.`
5. Deploy. Netlify will provide a temporary `*.netlify.app` URL.
6. Every time you push updates to the connected GitHub repository, Netlify will redeploy automatically.

## Notes
- No backend or secrets are required for this version.
- The Google Fonts stylesheet needs an internet connection; fallback fonts are included.
- The fire cursor is automatically disabled on touch devices and when reduced motion is enabled.
- Review all text and media against the official media kit before publishing.
