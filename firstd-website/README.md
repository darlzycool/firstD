# FirstD

FirstD is a dependency-free, static prototype for an original adult-oriented video discovery experience. It uses fictional listings and abstract, non-explicit CSS artwork only; it does not scrape, host, or stream content.

## Run locally

Open `index.html` in a modern browser. No install or build step is required. The install prompt and offline service worker require a secure context (HTTPS, or localhost); GitHub Pages provides HTTPS.

## Demo login

The login dialog is a UI prototype only. Any syntactically valid email and non-empty password starts a browser-tab demo session; there is no account database, password check, server request, or authentication token. The email is held in session storage for the current tab session. The password is cleared from the form and never persisted or transmitted. Do not use real credentials. Production authentication requires a trusted backend or identity provider.

## Install and offline use

The web app manifest and service worker make the static site installable in supported browsers and cache its app shell for repeat/offline visits. Use the browser's Install app option or Add to Home Screen. The first visit needs a network connection to populate the cache.

## Prototype scope and limitations

- Search, category filters, sorting, fictional listing details, and the 18+ entry confirmation are interactive.
- The age confirmation is stored in the current browser only; it is not identity or legal age verification.
- Uploads are disabled. Report forms are demo-only and are not transmitted to a moderation service.
- A real user-upload service would require robust age and consent verification, rights controls, active moderation, and responsive reporting/takedown workflows before launch.
