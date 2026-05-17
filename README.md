# Songbook

An offline-first, Progressive Web Application (PWA) built for musicians to manage and perform with chord sheets. 

## Features

- **Offline First**: Fully functional without an internet connection. Songs and setlists are mirrored to IndexedDB locally, allowing you to perform anywhere, anytime. PWA support ensures the app can be installed directly to your home screen.
- **Smart Chord Diagrams**: Click on any chord to see precise guitar shapes (via `react-guitar-chord`) and piano voicings (powered by `svg-piano` and `@tonaljs/tonal`).
- **Performance Mode**: A clean, distraction-free view designed for live performances. Includes options to adjust font size, transpose on the fly, auto-scroll, and navigate page-by-page.
- **Setlist Management**: Organize your songs into setlists, reorder them, add performance notes, and easily swipe through the entire set while on stage.
- **ChordPro Support**: A robust editor with live preview that supports standard ChordPro tags, allowing you to quickly write or import songs.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS & shadcn/ui
- **State Management**: Zustand
- **Local Storage**: Dexie (IndexedDB)
- **PWA Service Worker**: Serwist
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   *Note: PWA features (offline caching, install prompt) are disabled in development mode by Next.js/Turbopack.*

## Production & Offline Testing

To test the offline capabilities and see the "Install App" prompt, you must build and run the production server:

```bash
npm run start:pwa
```
This command runs `npm run build` followed by `npm start`.

## License

MIT
