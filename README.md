# Swipe-to-Text Virtual Keyboard

A browser-based keyboard that supports tap, swipe, gesture trails, voice dictation, finger tracking (MediaPipe Hands), real-time analytics, and accessibility options.

## Getting Started

1. Open `index.html` in a modern browser (Chrome recommended for voice + MediaPipe).
2. Allow camera access if you want finger tracking.
3. Tap, swipe, or long-press keys:
   - **Tap** to type individual letters.
   - **Swipe** across letters to compose a word.
   - **Hold** a letter for ~3 seconds to enter gesture-trail mode, then drag across keys.

## Key Features

- **Layouts & Languages**
  - Switch between English, Spanish, and Somali keyboard layouts via ⚙️ → “Layout & Input”.
  - Voice dictation supports multiple locales (uses Web Speech API).
- **Appearance**
  - Toggle light/dark themes.
  - Customize keyboard gradient colors (start + end) in the settings panel.
- **Input Enhancements**
  - Gesture trails for long-press swiping.
  - Camera-based finger tracking (MediaPipe) for hands-free typing.
  - Voice dictation with start/stop controls.
  - Inline grammar fixer (manual button in tools section).
- **Analytics**
  - Tracks WPM, efficiency, character/word counts, swipe/tap totals, etc.
  - Stats panel can be hidden via ⚙️ → Tools & Analytics.

## Settings Overview (⚙️)

- **Layout & Input**: key size slider, keyboard language, dictation language, voice controls.
- **Appearance**: theme selector, gradient color pickers.
- **Tools & Analytics**: stats panel toggle, “Fix Grammar” button.

## Finger Tracking

1. Scroll below the keyboard and click “👆 Start Finger Tracking”.
2. Grant camera permissions.
3. Hover your finger over keys; holding for 0.7s selects the key automatically.

## Development Notes

- Styles live in `style.css`; scripting lives in `keyboard.js`.
- MediaPipe Hands is loaded via CDN in `index.html`.
- No build step is required—open the HTML file directly.
- Settings persist using `localStorage`.
