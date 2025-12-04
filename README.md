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

- **Layout & Input**
  - Tunable key size plus separate horizontal/vertical spacing sliders for swipe comfort.
  - QWERTY layout with emoji/symbol toggles, swipe typing, and gesture trails.
  - Voice dictation (Web Speech API) with start/stop controls.
- **Appearance**
  - Toggle light/dark themes.
  - Customize keyboard gradient colors (start + end) in the settings panel.
- **Input Enhancements**
  - Gesture trails for long-press swiping.
  - Camera-based finger tracking (MediaPipe) for hands-free typing.
- **Analytics**
- **Analytics**
  - Tracks WPM, efficiency, character/word counts, swipe/tap totals, etc.
  - Stats panel can be hidden via ⚙️ → Tools & Analytics.
- **Testing Mode**
  - Run formal text-entry trials with 20 provided sentences, log keystrokes, and automatically compute adjusted WPM + MSD.

## Settings Overview (⚙️)

- **Layout & Input**: key size slider, horizontal/vertical spacing sliders, voice dictation controls.
- **Appearance**: theme selector, gradient/solid color pickers.
- **Tools & Testing**: stats panel toggle plus the trial sentence selector, randomizer, and start/complete/cancel controls with live MSD/WPM readouts.

## Testing Mode

Use the **Testing Mode** accordion inside ⚙️ Settings to prepare demo-ready trials:

1. Pick one of the 20 required target sentences (or hit “Random Sentence”).
2. Press **Start Trial** to reset the text box, show the target, and begin logging keystrokes with timestamps.
3. Type the sentence using any pointing modality; the panel tracks elapsed time in real time.
4. Hit **Complete Trial** to automatically compute adjusted WPM and Minimum String Distance (MSD) versus the target string and capture the keystroke stream for analysis.

The live dashboard mirrors these metrics so you can screenshot or export them when reporting speed, accuracy, and learning curve outcomes.

## Finger Tracking

1. Scroll below the keyboard and click “👆 Start Finger Tracking”.
2. Grant camera permissions.
3. Hover your finger over keys; holding for 0.7s selects the key automatically.

## Development Notes

- Styles live in `style.css`; scripting lives in `keyboard.js`.
- MediaPipe Hands is loaded via CDN in `index.html`.
- No build step is required—open the HTML file directly.
- Settings persist using `localStorage`.
