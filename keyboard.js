// SWIPE-TO-TEXT VIRTUAL KEYBOARD
// Enhanced with WPM, Efficiency & Analytics

// Keyboard Layouts
const keyboardLetterLayouts = {
    en: [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
    ],
    es: [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
        ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
    ],
    so: [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'B'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['SHIFT', 'X', 'C', 'V', 'M', 'N', 'SH', 'DH', 'BACK']
    ]
};

const keyboardLayouts = {
    numbers: [
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'],
        ['#+=', '.', ',', '?', '!', "'", 'BACK']
    ],
    symbols: [
        ['[', ']', '{', '}', '#', '%', '^', '*', '+', '='],
        ['_', '\\', '|', '~', '<', '>', '€', '£', '¥', '•'],
        ['123', '.', ',', '?', '!', "'", 'BACK']
    ],
    emoji: [
        ['😀', '😂', '😍', '🥰', '😎', '🤔', '😴', '🤗', '😇', '🥳'],
        ['👍', '👏', '🙏', '💪', '✌️', '🤝', '👋', '🤙', '💯', '🔥'],
        ['❤️', '💕', '💖', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍'],
        ['⭐', '✨', '🌟', '💫', '🎉', '🎊', '🎈', '🎁', '🏆', '🎯']
    ]
};

const DEFAULT_ACCENT_START = '#667eea';
const DEFAULT_ACCENT_END = '#764ba2';
const DEFAULT_ACCENT_SOLID = '#667eea';

const STORAGE_KEYS = {
    keySize: 'swipeKeyboardKeySize',
    keyGapX: 'swipeKeyboardKeyGapX',
    keyGapY: 'swipeKeyboardKeyGapY',
    language: 'swipeKeyboardLanguage',
    theme: 'swipeKeyboardTheme',
    statsVisible: 'swipeKeyboardStatsVisible',
    introSeen: 'swipeKeyboardIntroSeen',
    accentStart: 'swipeKeyboardAccentStart',
    accentEnd: 'swipeKeyboardAccentEnd',
    accentMode: 'swipeKeyboardAccentMode',
    accentSolid: 'swipeKeyboardAccentSolid',
    savedTrials: 'swipeKeyboardTrials'
};

const DEFAULT_LANGUAGE = navigator.language || 'en-US';
const HOLD_TO_GESTURE_DELAY = 3000;
const SWIPE_CLICK_SUPPRESS_DELAY = 1000;

const TRIAL_SENTENCES = [
    'She packed twelve blue pens in her small bag.',
    'Every bird sang sweet songs in the quiet dawn.',
    'They watched clouds drift across the golden sky.',
    'A clever mouse slipped past the sleepy cat.',
    'Green leaves danced gently in the warm breeze.',
    'He quickly wrote notes before the test began.',
    'The tall man wore boots made of soft leather.',
    'Old clocks ticked loudly in the silent room.',
    'She smiled while sipping tea on the front porch.',
    'We found a hidden path behind the old barn.',
    'Sunlight streamed through cracks in the ceiling.',
    'Dogs barked at shadows moving through the yard.',
    'Rain tapped softly against the window glass.',
    'Bright stars twinkled above the quiet valley.',
    'He tied the package with ribbon and string.',
    'A sudden breeze blew papers off the desk.',
    'The curious child opened every single drawer.',
    'Fresh apples fell from the heavy tree limbs.',
    'The artist painted scenes from her memory.',
    'They danced all night under the glowing moon.'
];

let currentLayout = 'letters';
let isShiftActive = false;

// State management
let isSwipeActive = false;
let swipePath = [];
let lastKeyElement = null;
let swipeJustEnded = false;
let swipeSuppressionTimer = null;
let swipeMoved = false;

// Analytics tracking
let sessionStartTime = null;
let totalCharacters = 0;
let totalWords = 0;
let totalSwipes = 0;
let totalTaps = 0;
let totalBackspaces = 0;
let totalErrors = 0;
let keystrokeLog = [];

// Performance metrics
let currentWPM = 0;
let peakWPM = 0;
let avgSwipeLength = 0;
let efficiency = 100;

// Accessibility & input enhancements
let recognition = null;
let isVoiceActive = false;
let languagePreference = safeGetStorage(STORAGE_KEYS.language) || 'auto';
let voiceLanguage = resolveLanguagePreference(languagePreference);
let currentTheme = safeGetStorage(STORAGE_KEYS.theme) || 'light';
if (currentTheme !== 'dark') {
    currentTheme = 'light';
}
let statsVisible = safeGetStorage(STORAGE_KEYS.statsVisible) !== 'false';
let keyboardLanguage = 'en';
let keyboardAreaElement = null;
let gestureTrailLayer = null;
let gestureTrailDots = [];
let holdGestureTimer = null;
let holdGestureActive = false;
let introOverlayElement = null;
let introHideCheckbox = null;
let accentStartColor = safeGetStorage(STORAGE_KEYS.accentStart) || DEFAULT_ACCENT_START;
let accentEndColor = safeGetStorage(STORAGE_KEYS.accentEnd) || DEFAULT_ACCENT_END;
let accentSolidColor = safeGetStorage(STORAGE_KEYS.accentSolid) || DEFAULT_ACCENT_SOLID;
let accentMode = safeGetStorage(STORAGE_KEYS.accentMode) === 'solid' ? 'solid' : 'gradient';
// Callback for logging keystrokes (for future WPM/MSD testing)
let onKeystrokeCallback = null;
const trialState = {
    active: false,
    targetIndex: 0,
    targetText: '',
    startTime: null,
    keystrokes: [],
    results: null
};

// INITIALIZATION

function initialize() {
    const keyboardContainer = document.getElementById('keyboard-container');
    const textarea = document.getElementById('typed');
    
    if (!keyboardContainer || !textarea) {
        console.error('Required elements not found');
        return;
    }
    
    keyboardAreaElement = document.querySelector('.keyboard-area');
    gestureTrailLayer = document.getElementById('gesture-trail');
    introOverlayElement = document.getElementById('intro-overlay');
    introHideCheckbox = document.getElementById('intro-hide-checkbox');
    const introCloseButton = document.getElementById('intro-close-btn');
    const helpButton = document.getElementById('help-button');
    
    // Start session timer
    sessionStartTime = Date.now();
    
    applyAccentColors();
    
    // Render the keyboard
    renderKeyboard(keyboardContainer);
    
    // Setup event listeners for swipe tracking
    setupSwipeListeners();
    
    // Setup textarea listeners for analytics
    setupTextareaListeners(textarea);
    setupSettingsPanel();
    setupKeySizeControls();
    setupKeySpacingControls();
    setupThemeToggle();
    setupAccentColorControls();
    setupStatsToggle();
    setupVoiceInput();
    setupTrialControls();
    setupTrialHistoryPanel();
    setupIntroModal(introCloseButton, helpButton);
    
    // Update metrics periodically
    setInterval(() => {
        updateMetrics();
        updateTrialTimerDisplay();
    }, 1000);
    
    }

// KEYBOARD RENDERING

function renderKeyboard(container) {
    container.innerHTML = '';
    
    let layout;
    if (currentLayout === 'letters') {
        layout = keyboardLetterLayouts[keyboardLanguage] || keyboardLetterLayouts.en;
    } else {
        layout = keyboardLayouts[currentLayout];
    }
    
    // Render all rows from current layout
    layout.forEach((row, rowIndex) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';
        
        row.forEach(char => {
            // Determine key type based on character
            let keyType = 'letter';
            if (['SHIFT', 'BACK', 'CLEAR', '#+=', '123'].includes(char)) {
                keyType = 'special';
            }
            
            const keyButton = createKey(char, keyType);
            rowDiv.appendChild(keyButton);
        });
        
        container.appendChild(rowDiv);
    });
    
    // Render bottom control row: 123/ABC, emoji, space, return
    const bottomRow = document.createElement('div');
    bottomRow.className = 'keyboard-row bottom-row';
    
    // Layout switcher
    const layoutBtn = createKey(currentLayout === 'letters' ? '123' : 'ABC', 'layout-switch');
    bottomRow.appendChild(layoutBtn);
    
    // Emoji button
    const emojiBtn = createKey('😊', 'emoji-switch');
    bottomRow.appendChild(emojiBtn);
    
    // Space bar
    const spaceBtn = createKey('SPACE', 'space');
    spaceBtn.classList.add('space');
    bottomRow.appendChild(spaceBtn);
    
    // Return/Enter
    const returnBtn = createKey('RETURN', 'return');
    bottomRow.appendChild(returnBtn);
    
    container.appendChild(bottomRow);

}

function rerenderKeyboard() {
    const keyboardContainer = document.getElementById('keyboard-container');
    if (keyboardContainer) {
        renderKeyboard(keyboardContainer);
    }
}

function setupKeySizeControls() {
    const slider = document.getElementById('key-size-slider');
    const valueLabel = document.getElementById('key-size-value');
    
    if (!slider) return;
    
    const savedSize = safeGetStorage(STORAGE_KEYS.keySize);
    if (savedSize) {
        slider.value = savedSize;
    }
    
    const applySize = (sizeValue) => {
        const numericSize = Number(sizeValue) || 50;
        document.documentElement.style.setProperty('--key-size', `${numericSize}px`);
        document.documentElement.style.setProperty('--key-font-size', `${Math.max(14, Math.round(numericSize * 0.36))}px`);
        if (valueLabel) valueLabel.textContent = `${numericSize}px`;
    };
    
    slider.addEventListener('input', () => {
        applySize(slider.value);
        safeSetStorage(STORAGE_KEYS.keySize, slider.value);
    });
    
    applySize(slider.value || 50);
}

function setupKeySpacingControls() {
    configureSpacingSlider({
        sliderId: 'key-gap-x-slider',
        valueId: 'key-gap-x-value',
        cssVar: '--key-gap-x',
        storageKey: STORAGE_KEYS.keyGapX,
        defaultValue: 32,
        legacyKey: 'swipeKeyboardKeyGap'
    });
    
    configureSpacingSlider({
        sliderId: 'key-gap-y-slider',
        valueId: 'key-gap-y-value',
        cssVar: '--key-gap-y',
        storageKey: STORAGE_KEYS.keyGapY,
        defaultValue: 32
    });
}

function configureSpacingSlider({ sliderId, valueId, cssVar, storageKey, defaultValue, legacyKey = null }) {
    const slider = document.getElementById(sliderId);
    if (!slider) return;
    const valueLabel = document.getElementById(valueId);
    
    const savedValue = safeGetStorage(storageKey) ?? (legacyKey ? safeGetStorage(legacyKey) : null);
    if (savedValue) {
        slider.value = savedValue;
    }
    
    const applyValue = (rawValue) => {
        const numeric = Math.max(0, Math.min(32, Number(rawValue) || defaultValue));
        document.documentElement.style.setProperty(cssVar, `${numeric}px`);
        if (valueLabel) valueLabel.textContent = `${numeric}px`;
    };
    
    slider.addEventListener('input', () => {
        applyValue(slider.value);
        safeSetStorage(storageKey, slider.value);
    });
    
    applyValue(slider.value || defaultValue);
}

function setupSettingsPanel() {
    const settingsBtn = document.getElementById('settings-button');
    const panel = document.getElementById('settings-panel');
    const closeBtn = document.getElementById('close-settings');
    const overlay = document.getElementById('settings-overlay');
    
    if (!settingsBtn || !panel) return;
    
    const togglePanel = (open) => {
        panel.classList.toggle('open', open);
        settingsBtn.setAttribute('aria-expanded', open);
        if (overlay) {
            overlay.classList.toggle('visible', open);
        }
    };
    
    settingsBtn.addEventListener('click', () => {
        const isOpen = panel.classList.contains('open');
        togglePanel(!isOpen);
    });
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => togglePanel(false));
    }
    
    if (overlay) {
        overlay.addEventListener('click', () => togglePanel(false));
    }
    
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && panel.classList.contains('open')) {
            togglePanel(false);
        }
    });
}

function setupThemeToggle() {
    const select = document.getElementById('theme-select');
    if (!select) return;
    
    const savedTheme = safeGetStorage(STORAGE_KEYS.theme);
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
        select.value = savedTheme;
        currentTheme = savedTheme;
    }
    
    const applyTheme = (theme) => {
        currentTheme = theme === 'dark' ? 'dark' : 'light';
        document.body.classList.toggle('theme-dark', currentTheme === 'dark');
        safeSetStorage(STORAGE_KEYS.theme, currentTheme);
    };
    
    select.addEventListener('change', () => {
        applyTheme(select.value);
    });
    
    applyTheme(select.value || currentTheme);
}

function setupAccentColorControls() {
    const startInput = document.getElementById('accent-start-input');
    const endInput = document.getElementById('accent-end-input');
    const solidInput = document.getElementById('accent-solid-input');
    const modeSelect = document.getElementById('accent-mode-select');
    const resetBtn = document.getElementById('accent-reset-btn');
    
    if (startInput) {
        startInput.value = accentStartColor;
        startInput.addEventListener('input', () => {
            accentStartColor = startInput.value;
            safeSetStorage(STORAGE_KEYS.accentStart, accentStartColor);
            applyAccentColors();
        });
    }
    
    if (endInput) {
        endInput.value = accentEndColor;
        endInput.addEventListener('input', () => {
            accentEndColor = endInput.value;
            safeSetStorage(STORAGE_KEYS.accentEnd, accentEndColor);
            applyAccentColors();
        });
    }
    
    if (solidInput) {
        solidInput.value = accentSolidColor;
        solidInput.addEventListener('input', () => {
            accentSolidColor = solidInput.value;
            safeSetStorage(STORAGE_KEYS.accentSolid, accentSolidColor);
            applyAccentColors();
        });
    }
    
    if (modeSelect) {
        modeSelect.value = accentMode;
        modeSelect.addEventListener('change', () => {
            accentMode = modeSelect.value === 'solid' ? 'solid' : 'gradient';
            safeSetStorage(STORAGE_KEYS.accentMode, accentMode);
            applyAccentColors();
        });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            accentStartColor = DEFAULT_ACCENT_START;
            accentEndColor = DEFAULT_ACCENT_END;
            accentSolidColor = DEFAULT_ACCENT_SOLID;
            accentMode = 'gradient';
            if (startInput) startInput.value = accentStartColor;
            if (endInput) endInput.value = accentEndColor;
            if (solidInput) solidInput.value = accentSolidColor;
            if (modeSelect) modeSelect.value = accentMode;
            applyAccentColors();
            safeSetStorage(STORAGE_KEYS.accentStart, accentStartColor);
            safeSetStorage(STORAGE_KEYS.accentEnd, accentEndColor);
            safeSetStorage(STORAGE_KEYS.accentSolid, accentSolidColor);
            safeSetStorage(STORAGE_KEYS.accentMode, accentMode);
        });
    }
}

function applyAccentColors() {
    const root = document.documentElement;
    root.style.setProperty('--accent-start', accentStartColor);
    root.style.setProperty('--accent-end', accentEndColor);
    root.style.setProperty('--accent-shadow', colorWithAlpha(accentStartColor, 0.35));
    root.style.setProperty('--accent-solid', accentSolidColor);
    
    document.body.classList.toggle('accent-mode-solid', accentMode === 'solid');
    document.body.classList.toggle('accent-mode-gradient', accentMode !== 'solid');
}

function setupIntroModal(closeBtn, helpBtn) {
    if (!introOverlayElement) return;
    const introSeen = safeGetStorage(STORAGE_KEYS.introSeen) === 'true';
    
    if (!introSeen) {
        toggleIntroModal(true, false);
    }
    
    const handlers = [
        closeBtn && { target: closeBtn, type: 'click', handler: () => finalizeIntroModal() },
        { target: introOverlayElement, type: 'click', handler: (event) => {
            if (event.target === introOverlayElement) finalizeIntroModal();
        }},
        { target: document, type: 'keydown', handler: (event) => {
            if (event.key === 'Escape' && introOverlayElement.classList.contains('visible')) {
                finalizeIntroModal();
            }
        }},
        helpBtn && { target: helpBtn, type: 'click', handler: () => toggleIntroModal(true, true) }
    ].filter(Boolean);
    
    handlers.forEach(({ target, type, handler }) => target.addEventListener(type, handler));
}

function toggleIntroModal(open, forceCheckbox = false) {
    if (!introOverlayElement) return;
    if (open) {
        introOverlayElement.classList.add('visible');
        introOverlayElement.setAttribute('aria-hidden', 'false');
        if (!forceCheckbox && introHideCheckbox) {
            introHideCheckbox.checked = false;
        }
    } else {
        introOverlayElement.classList.remove('visible');
        introOverlayElement.setAttribute('aria-hidden', 'true');
    }
}

function finalizeIntroModal() {
    if (introHideCheckbox?.checked) {
        safeSetStorage(STORAGE_KEYS.introSeen, 'true');
    }
    toggleIntroModal(false);
}

function colorWithAlpha(hex, alpha) {
    const sanitized = hex?.replace('#', '');
    if (!sanitized || sanitized.length !== 6) {
        return `rgba(0,0,0,${alpha})`;
    }
    const r = parseInt(sanitized.substring(0, 2), 16);
    const g = parseInt(sanitized.substring(2, 4), 16);
    const b = parseInt(sanitized.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function setupStatsToggle() {
    const checkbox = document.getElementById('stats-toggle');
    const statsPanel = document.querySelector('.stats-dashboard');
    if (!checkbox || !statsPanel) return;
    
    checkbox.checked = statsVisible;
    applyStatsVisibility(statsPanel, statsVisible);
    
    checkbox.addEventListener('change', () => {
        statsVisible = checkbox.checked;
        applyStatsVisibility(statsPanel, statsVisible);
        safeSetStorage(STORAGE_KEYS.statsVisible, statsVisible ? 'true' : 'false');
    });
}

function applyStatsVisibility(panel, visible) {
    panel.classList.toggle('hidden', !visible);
}

function setupVoiceInput() {
    const startBtn = document.getElementById('start-voice');
    const stopBtn = document.getElementById('stop-voice');
    const statusSpan = document.getElementById('voice-status');
    
    if (!startBtn || !stopBtn || !statusSpan) return;
    
    statusSpan.textContent = 'Dictation idle';
    statusSpan.style.color = 'var(--muted-text)';
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        startBtn.disabled = true;
        startBtn.textContent = 'Dictation unsupported';
        statusSpan.textContent = 'Voice dictation not supported in this browser';
        statusSpan.style.color = '#f44336';
        return;
    }
    
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = voiceLanguage;
    
    recognition.addEventListener('result', (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal && result[0]?.transcript) {
                appendVoiceText(result[0].transcript);
            }
        }
    });
    
    recognition.addEventListener('end', () => {
        if (isVoiceActive) {
            recognition.start();
        } else {
            startBtn.style.display = 'inline-block';
            stopBtn.style.display = 'none';
            statusSpan.textContent = 'Dictation idle';
            statusSpan.style.color = 'var(--muted-text)';
        }
    });
    
    recognition.addEventListener('error', (event) => {
        console.error('Voice recognition error:', event.error);
        statusSpan.textContent = `Dictation error: ${event.error}`;
        statusSpan.style.color = '#f44336';
        isVoiceActive = false;
        recognition.stop();
        startBtn.style.display = 'inline-block';
        stopBtn.style.display = 'none';
    });
    
    startBtn.addEventListener('click', () => {
        if (isVoiceActive) return;
        try {
            recognition.start();
            isVoiceActive = true;
            startBtn.style.display = 'none';
            stopBtn.style.display = 'inline-block';
            statusSpan.textContent = `Listening (${getSelectedLanguageLabel()})`;
            statusSpan.style.color = '#4CAF50';
        } catch (error) {
            console.error('Unable to start dictation:', error);
            isVoiceActive = false;
            recognition.stop();
            startBtn.style.display = 'inline-block';
            stopBtn.style.display = 'none';
            statusSpan.textContent = 'Dictation unavailable';
            statusSpan.style.color = '#f44336';
        }
    });
    
    stopBtn.addEventListener('click', () => {
        if (!isVoiceActive) return;
        isVoiceActive = false;
        recognition.stop();
        statusSpan.textContent = 'Stopping...';
        statusSpan.style.color = '#ff9800';
    });
}

function appendVoiceText(text) {
    const textarea = document.getElementById('typed');
    if (!textarea) return;
    
    const trimmed = text.trim();
    if (!trimmed) return;
    
    const needsSpace = textarea.value && !textarea.value.endsWith(' ');
    const addition = `${needsSpace ? ' ' : ''}${trimmed}`;
    textarea.value += addition;
    
    totalCharacters += addition.length;
    countWords();
    logKeystroke('voice', trimmed);
    updateMetrics();
}

// TESTING MODE / TRIALS

function setupTrialControls() {
    const select = document.getElementById('trial-sentence-select');
    const randomBtn = document.getElementById('trial-random-btn');
    const startBtn = document.getElementById('trial-start-btn');
    const completeBtn = document.getElementById('trial-complete-btn');
    const cancelBtn = document.getElementById('trial-cancel-btn');
    
    updateTrialPanel();
    updateTrialStatus('Select a target sentence and press "Start Trial" to begin.');
    
    if (!select) return;
    
    select.innerHTML = '';
    TRIAL_SENTENCES.forEach((sentence, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${index + 1}. ${sentence}`;
        select.appendChild(option);
    });
    trialState.targetText = TRIAL_SENTENCES[0];
    trialState.targetIndex = 0;
    updateTrialPanel();
    
    select.addEventListener('change', () => {
        trialState.targetIndex = Number(select.value);
        trialState.targetText = TRIAL_SENTENCES[trialState.targetIndex] || '';
        updateTrialPanel();
    });
    
    randomBtn?.addEventListener('click', () => {
        const randomIndex = Math.floor(Math.random() * TRIAL_SENTENCES.length);
        select.value = randomIndex;
        select.dispatchEvent(new Event('change'));
    });
    
    startBtn?.addEventListener('click', () => startTrial());
    completeBtn?.addEventListener('click', () => completeTrial());
    cancelBtn?.addEventListener('click', () => cancelTrial());
}

function setupTrialHistoryPanel() {
    const button = document.getElementById('trial-history-btn');
    const panel = document.getElementById('trial-history');
    if (!button || !panel) return;
    
    button.addEventListener('click', () => {
        panel.classList.toggle('hidden');
        if (!panel.classList.contains('hidden')) {
            renderTrialHistory();
        }
    });
    
    // Render immediately if panel starts visible
    if (!panel.classList.contains('hidden')) {
        renderTrialHistory();
    }
}

function startTrial() {
    const textarea = document.getElementById('typed');
    if (!textarea) return;
    
    if (!trialState.targetText) {
        updateTrialStatus('Please choose a target sentence first.', 'error');
        return;
    }
    
    resetSession();
    trialState.active = true;
    trialState.startTime = Date.now();
    trialState.keystrokes = [];
    trialState.results = null;
    
    updateTrialPanel();
    updateTrialStatus('Trial running. Type the target sentence.', 'active');
}

function completeTrial() {
    if (!trialState.active) {
        updateTrialStatus('No active trial to complete.', 'error');
        return;
    }
    
    const textarea = document.getElementById('typed');
    if (!textarea) return;
    
    const typedText = textarea.value.trim();
    const elapsed = Date.now() - (trialState.startTime || Date.now());
    const msd = computeMSD(typedText, trialState.targetText || '');
    const minutes = elapsed / 60000;
    const netChars = Math.max(0, typedText.length - msd);
    const adjustedWPM = minutes > 0 ? Number(((netChars / 5) / minutes).toFixed(2)) : 0;
    
    trialState.results = {
        typedText,
        elapsed,
        msd,
        adjustedWPM,
        keystrokes: [...trialState.keystrokes]
    };
    persistTrialResults(trialState.results);
    
    trialState.active = false;
    trialState.startTime = null;
    trialState.keystrokes = [];
    
    updateTrialPanel();
    updateTrialStatus('Trial complete! Metrics captured for reporting.', 'success');
}

function cancelTrial() {
    if (!trialState.active && !trialState.results) {
        updateTrialStatus('No trial to cancel.');
        return;
    }
    trialState.active = false;
    trialState.startTime = null;
    trialState.keystrokes = [];
    trialState.results = null;
    resetSession();
    updateTrialPanel();
    updateTrialStatus('Trial reset.', 'info');
}

function updateTrialPanel() {
    const panel = document.getElementById('trial-panel');
    if (!panel) return;
    
    const targetEl = document.getElementById('trial-target-text');
    const typedEl = document.getElementById('trial-typed-text');
    const wpmEl = document.getElementById('trial-wpm');
    const msdEl = document.getElementById('trial-msd');
    const keyEl = document.getElementById('trial-keystrokes');
    
    if (targetEl) {
        targetEl.textContent = trialState.targetText || 'Select a sentence to begin.';
    }
    
    if (typedEl) {
        const liveValue = document.getElementById('typed')?.value || '';
        if (trialState.results?.typedText) {
            typedEl.textContent = trialState.results.typedText || '—';
        } else if (trialState.active) {
            typedEl.textContent = liveValue || 'Trial in progress...';
        } else {
            typedEl.textContent = '—';
        }
    }
    
    if (wpmEl) {
        wpmEl.textContent = trialState.results ? trialState.results.adjustedWPM : (trialState.active ? '…' : '0');
    }
    
    if (msdEl) {
        msdEl.textContent = trialState.results ? trialState.results.msd : (trialState.active ? '…' : '0');
    }
    
    if (keyEl) {
        const activeCount = trialState.active ? trialState.keystrokes.length : (trialState.results?.keystrokes.length || 0);
        keyEl.textContent = activeCount;
    }
    
    updateTrialTimerDisplay();
}

function updateTrialStatus(message, type = 'info') {
    const statusEl = document.getElementById('trial-status');
    if (!statusEl) return;
    let color = 'var(--muted-text)';
    if (type === 'error') color = '#f44336';
    else if (type === 'success') color = '#4CAF50';
    else if (type === 'active') color = '#2f9e44';
    statusEl.textContent = message;
    statusEl.style.color = color;
}

function updateTrialTimerDisplay() {
    const elapsedEl = document.getElementById('trial-elapsed');
    if (!elapsedEl) return;
    if (trialState.active && trialState.startTime) {
        elapsedEl.textContent = formatDuration(Date.now() - trialState.startTime);
    } else if (trialState.results?.elapsed) {
        elapsedEl.textContent = formatDuration(trialState.results.elapsed);
    } else {
        elapsedEl.textContent = '00:00';
    }
}

function formatDuration(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
}

function computeMSD(input, target) {
    const a = input || '';
    const b = target || '';
    const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
    
    for (let i = 0; i <= a.length; i++) dp[i][0] = i;
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;
    
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + cost
            );
        }
    }
    return dp[a.length][b.length];
}

function persistTrialResults(results) {
    if (!results) return;
    const payload = {
        target: trialState.targetText,
        typed: results.typedText || '',
        msd: results.msd || 0,
        adjustedWPM: results.adjustedWPM || 0,
        keystrokes: results.keystrokes || [],
        elapsed: results.elapsed || 0,
        timestamp: Date.now()
    };
    try {
        const existing = getSavedTrials();
        existing.push(payload);
        localStorage.setItem(STORAGE_KEYS.savedTrials, JSON.stringify(existing));
        renderTrialHistory();
    } catch (error) {
        console.warn('Unable to persist trial results:', error);
    }
}

function getSavedTrials() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.savedTrials);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn('Unable to load saved trials:', error);
        return [];
    }
}

function renderTrialHistory() {
    const panel = document.getElementById('trial-history');
    if (!panel) return;
    const trials = getSavedTrials();
    if (!trials.length) {
        panel.innerHTML = '<p class="trial-history-empty">No trials saved yet.</p>';
        return;
    }
    const recent = trials.slice(-10).reverse();
    const rows = recent.map((trial, index) => {
        const date = new Date(trial.timestamp || Date.now()).toLocaleString();
        const target = trial.target || '';
        const typed = trial.typed || '';
        const msd = Number(trial.msd ?? 0);
        const wpm = Number(trial.adjustedWPM ?? 0);
        return `<tr>
            <td>${recent.length - index}</td>
            <td>${target}</td>
            <td>${typed}</td>
            <td>${wpm}</td>
            <td>${msd}</td>
            <td>${date}</td>
        </tr>`;
    }).join('');
    
    panel.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Target</th>
                    <th>Typed</th>
                    <th>Adj. WPM</th>
                    <th>MSD</th>
                    <th>Timestamp</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}

function getSelectedLanguageLabel() {
    return voiceLanguage;
}

function safeGetStorage(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.warn('Storage read failed:', error);
        return null;
    }
}

function safeSetStorage(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.warn('Storage write failed:', error);
    }
}

function resolveLanguagePreference(value) {
    if (!value || value === 'auto') {
        return DEFAULT_LANGUAGE;
    }
    return value;
}

function createKey(character, type) {
    const button = document.createElement('button');
    button.className = 'key';
    button.textContent = character;
    button.dataset.char = character;
    button.dataset.type = type;
    
    // Add special styling classes
    if (type === 'special') {
        button.classList.add('special');
        if (character === 'SPACE') {
            button.classList.add('space');
        }
    }
    
    // Add click handler for tapping
    button.addEventListener('click', (e) => {
        e.preventDefault();
        // Prevent click if swipe just ended
        if (swipeJustEnded) {
            swipeJustEnded = false;
            return;
        }
        handleTap(character, type);
    });
    
    return button;
}

// TAP FUNCTIONALITY

function handleTap(character, type) {
    const textarea = document.getElementById('typed');
    let handled = false;
    
    switch (type) {
        case 'letter':
            textarea.value += character.toLowerCase();
            totalCharacters++;
            totalTaps++;
            logKeystroke('tap', character);
            handled = true;
            break;
        case 'special':
            handleSpecialKey(character);
            handled = true;
            break;
        case 'layout-switch':
            if (currentLayout === 'letters') {
                currentLayout = 'numbers';
            } else {
                currentLayout = 'letters';
            }
            rerenderKeyboard();
            handled = true;
            break;
        case 'emoji-switch':
            currentLayout = currentLayout === 'emoji' ? 'letters' : 'emoji';
            rerenderKeyboard();
            handled = true;
            break;
        case 'space':
            handleSpecialKey('SPACE');
            handled = true;
            break;
        case 'return':
            handleSpecialKey('RETURN');
            handled = true;
            break;
    }
    
    if (!handled) return;
    
    // Visual feedback
    const key = document.querySelector(`[data-char="${character}"]`);
    if (key) {
        key.classList.add('active');
        setTimeout(() => key.classList.remove('active'), 150);
    }
    
    updateMetrics();
}

function handleSpecialKey(key) {
    const textarea = document.getElementById('typed');
    
    switch (key) {
        case 'SPACE':
            textarea.value += ' ';
            totalCharacters++;
            totalTaps++;
            countWords();
            logKeystroke('tap', 'SPACE');
            break;
        case 'BACK':
            if (textarea.value.length > 0) {
                textarea.value = textarea.value.slice(0, -1);
                totalBackspaces++;
                totalErrors++;
                totalCharacters = Math.max(0, totalCharacters - 1);
                countWords();
                logKeystroke('tap', 'BACK');
            }
            break;
        case 'CLEAR':
            textarea.value = '';
            logKeystroke('tap', 'CLEAR');
            break;
        case 'RETURN':
            textarea.value += '\n';
            totalCharacters++;
            totalTaps++;
            logKeystroke('tap', 'RETURN');
            break;
        case '#+=':
            currentLayout = 'symbols';
            rerenderKeyboard();
            logKeystroke('tap', '#+=');
            break;
        case '123':
            currentLayout = 'numbers';
            rerenderKeyboard();
            logKeystroke('tap', '123');
            break;
    }
    
    updateMetrics();
}

// SWIPE FUNCTIONALITY

function setupSwipeListeners() {
    const keyboardContainer = document.getElementById('keyboard-container');
    
    // Use pointer events for better cross-device support
    keyboardContainer.addEventListener('pointerdown', handleSwipeStart);
    keyboardContainer.addEventListener('pointermove', handleSwipeMove);
    keyboardContainer.addEventListener('pointerup', handleSwipeEnd);
    keyboardContainer.addEventListener('pointercancel', handleSwipeEnd);
}

function handleSwipeStart(e) {
    // Only start swipe on key elements
    const key = e.target.closest('.key');
    if (!key || key.dataset.type !== 'letter') return;
    
    // Prevent default for smoother swiping
    e.preventDefault();
    
    startHoldGestureTimer(key);
    
    isSwipeActive = true;
    swipeMoved = false;
    swipePath = [];
    lastKeyElement = null;
    
    // Add first key to path
    addKeyToPath(key);
}

function handleSwipeMove(e) {
    if (!isSwipeActive) return;
    
    // Prevent default for smoother swiping
    e.preventDefault();
    
    // Get element at pointer position
    const element = document.elementFromPoint(e.clientX, e.clientY);
    const key = element?.closest('.key');
    
    // Only process letter keys during swipe
    if (key && key.dataset.type === 'letter' && key !== lastKeyElement) {
        if (!holdGestureActive) {
            clearHoldGestureTimer();
        }
        if (swipePath.length > 0) {
            swipeMoved = true;
        }
        addKeyToPath(key);
    }
}

function handleSwipeEnd(e) {
    if (!isSwipeActive) return;
    
    clearHoldGestureTimer();
    isSwipeActive = false;
    const performedSwipe = swipeMoved && swipePath.length > 1;
    
    if (performedSwipe) {
        swipeJustEnded = true;
        if (swipeSuppressionTimer) {
            clearTimeout(swipeSuppressionTimer);
        }
        swipeSuppressionTimer = setTimeout(() => {
            swipeJustEnded = false;
            swipeSuppressionTimer = null;
        }, SWIPE_CLICK_SUPPRESS_DELAY);
    }
    
    document.querySelectorAll('.key.active').forEach(key => key.classList.remove('active'));
    
    if (performedSwipe) {
        commitSwipePath(swipePath);
    }
    
    // Reset state
    swipePath = [];
    lastKeyElement = null;
    swipeMoved = false;
    holdGestureActive = false;
    if (gestureTrailDots.length > 0) {
        clearGestureTrail();
    }
    
    updateMetrics();
}

function commitSwipePath(path) {
    if (!path || path.length <= 1) return false;
    const textarea = document.getElementById('typed');
    if (!textarea) return false;
    
    const word = path.join('').toLowerCase();
    if (textarea.value && !textarea.value.endsWith(' ')) {
        textarea.value += ' ';
        totalCharacters++;
    }
    textarea.value += word;
    totalCharacters += word.length;
    totalSwipes++;
    countWords();
    logKeystroke('swipe', word, path.length);
    return true;
}

function addKeyToPath(keyElement) {
    const character = keyElement.dataset.char;
    
    // Add to path if not already the last character (avoid duplicates from slow movement)
    if (swipePath.length === 0 || swipePath[swipePath.length - 1] !== character) {
        swipePath.push(character);
    }
    
    // Visual feedback - highlight the active key
    if (lastKeyElement) {
        lastKeyElement.classList.remove('active');
    }
    keyElement.classList.add('active');
    lastKeyElement = keyElement;
    
    if (holdGestureActive) {
        addGestureTrailPoint(keyElement);
    }
}

function startHoldGestureTimer(keyElement) {
    clearHoldGestureTimer();
    holdGestureActive = false;
    holdGestureTimer = setTimeout(() => {
        holdGestureActive = true;
        enableGestureTrail();
        addGestureTrailPoint(keyElement);
        holdGestureTimer = null;
    }, HOLD_TO_GESTURE_DELAY);
}

function clearHoldGestureTimer() {
    if (holdGestureTimer) {
        clearTimeout(holdGestureTimer);
        holdGestureTimer = null;
    }
}

function enableGestureTrail() {
    if (!keyboardAreaElement || !gestureTrailLayer) return;
    gestureTrailLayer.innerHTML = '';
    gestureTrailDots = [];
    keyboardAreaElement.classList.add('active-trail');
}

function addGestureTrailPoint(keyElement) {
    if (!holdGestureActive || !gestureTrailLayer || !keyboardAreaElement || !keyElement) return;
    const areaRect = keyboardAreaElement.getBoundingClientRect();
    const keyRect = keyElement.getBoundingClientRect();
    const dot = document.createElement('span');
    dot.className = 'trail-dot';
    const left = keyRect.left - areaRect.left + keyRect.width / 2;
    const top = keyRect.top - areaRect.top + keyRect.height / 2;
    dot.style.left = `${left}px`;
    dot.style.top = `${top}px`;
    
    if (gestureTrailDots.length > 0) {
        const prev = gestureTrailDots[gestureTrailDots.length - 1];
        const prevRect = prev.getBoundingClientRect();
        const prevX = parseFloat(prev.style.left);
        const prevY = parseFloat(prev.style.top);
        const dx = left - prevX;
        const dy = top - prevY;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
        const distance = Math.sqrt(dx * dx + dy * dy);
        dot.style.left = `${(left + prevX) / 2}px`;
        dot.style.top = `${(top + prevY) / 2}px`;
        dot.style.height = `${Math.max(30, distance)}px`;
        dot.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    }
    
    gestureTrailLayer.appendChild(dot);
    gestureTrailDots.push(dot);
}

function clearGestureTrail() {
    if (!gestureTrailLayer) return;
    gestureTrailDots.forEach(dot => {
        dot.classList.add('fade');
        setTimeout(() => dot.remove(), 400);
    });
    gestureTrailDots = [];
    if (keyboardAreaElement) {
        keyboardAreaElement.classList.remove('active-trail');
    }
}

// ANALYTICS & METRICS

function setupTextareaListeners(textarea) {
    textarea.addEventListener('input', () => {
        countWords();
        updateMetrics();
    });
    
    // Add physical keyboard support
    textarea.addEventListener('keydown', (e) => {
        handlePhysicalKeyboard(e);
    });
}

function handlePhysicalKeyboard(e) {
    // Track physical keyboard input
    const key = e.key;
    let virtualKey = null;
    
    // Check if it's a letter
    if (key.length === 1 && key.match(/[a-zA-Z]/)) {
        totalTaps++;
        totalCharacters++;
        virtualKey = key.toUpperCase();
        logKeystroke('physical-tap', virtualKey);
        highlightVirtualKey(virtualKey);
    } 
    // Check for space
    else if (key === ' ') {
        totalTaps++;
        totalCharacters++;
        virtualKey = 'SPACE';
        logKeystroke('physical-tap', 'SPACE');
        highlightVirtualKey('SPACE');
    }
    // Check for backspace
    else if (key === 'Backspace') {
        totalBackspaces++;
        totalErrors++;
        totalCharacters = Math.max(0, totalCharacters - 1);
        virtualKey = 'BACK';
        logKeystroke('physical-tap', 'BACK');
        highlightVirtualKey('BACK');
    }
    
    countWords();
    updateMetrics();
}

function highlightVirtualKey(character) {
    // Find and highlight the corresponding virtual key
    const keyElement = document.querySelector(`[data-char="${character}"]`);
    if (keyElement) {
        keyElement.classList.add('active');
        setTimeout(() => {
            keyElement.classList.remove('active');
        }, 200);
    }
}

function countWords() {
    const textarea = document.getElementById('typed');
    const text = textarea.value.trim();
    totalWords = text ? text.split(/\s+/).filter(word => word.length > 0).length : 0;
}

function calculateWPM() {
    if (!sessionStartTime) return 0;
    
    const elapsedMinutes = (Date.now() - sessionStartTime) / 60000;
    if (elapsedMinutes === 0) return 0;
    
    // Standard WPM calculation: (characters / 5) / minutes
    const wpm = Math.round((totalCharacters / 5) / elapsedMinutes);
    
    // Track peak WPM
    if (wpm > peakWPM) {
        peakWPM = wpm;
    }
    
    return wpm;
}

function calculateEfficiency() {
    if (totalCharacters === 0) return 100;
    
    // Efficiency = (correct chars / (correct chars + errors)) * 100
    const correctChars = totalCharacters;
    const totalAttempts = correctChars + totalBackspaces;
    
    if (totalAttempts === 0) return 100;
    
    return Math.round((correctChars / totalAttempts) * 100);
}

function calculateAvgSwipeLength() {
    if (totalSwipes === 0) return 0;
    
    const swipeLogs = keystrokeLog.filter(log => log.method === 'swipe');
    if (swipeLogs.length === 0) return 0;
    
    const totalLength = swipeLogs.reduce((sum, log) => sum + (log.swipeLength || 0), 0);
    return (totalLength / swipeLogs.length).toFixed(1);
}

function updateMetrics() {
    currentWPM = calculateWPM();
    efficiency = calculateEfficiency();
    avgSwipeLength = calculateAvgSwipeLength();
    
    // Update UI stats display
    const wpmDisplay = document.getElementById('wpm-display');
    const efficiencyDisplay = document.getElementById('efficiency-display');
    const charCount = document.getElementById('char-count');
    const wordCount = document.getElementById('word-count');
    const swipeCount = document.getElementById('swipe-count');
    
    if (wpmDisplay) wpmDisplay.textContent = currentWPM;
    if (efficiencyDisplay) efficiencyDisplay.textContent = efficiency + '%';
    if (charCount) charCount.textContent = totalCharacters;
    if (wordCount) wordCount.textContent = totalWords;
    if (swipeCount) swipeCount.textContent = totalSwipes;
    
}

// LOGGING & CALLBACKS

function logKeystroke(method, data, swipeLength = null) {
    const timestamp = Date.now();
    const logEntry = {
        timestamp,
        method, // 'tap' or 'swipe'
        data,
        swipeLength,
        textLength: document.getElementById('typed').value.length,
        sessionTime: ((timestamp - sessionStartTime) / 1000).toFixed(2),
        currentWPM,
        efficiency
    };
    
    keystrokeLog.push(logEntry);
    recordTrialKeystroke(logEntry);
    
    // Call external callback if registered
    if (typeof onKeystrokeCallback === 'function') {
        onKeystrokeCallback(logEntry);
    }
}

function recordTrialKeystroke(logEntry) {
    if (!trialState.active) return;
    trialState.keystrokes.push(logEntry);
    updateTrialPanel();
}

// Public API for registering callback
function setKeystrokeCallback(callback) {
    onKeystrokeCallback = callback;
}

// PUBLIC API & ANALYTICS EXPORT

function getDetailedStats() {
    return {
        session: {
            startTime: sessionStartTime,
            duration: Date.now() - sessionStartTime,
            currentWPM,
            peakWPM,
            efficiency,
            avgSwipeLength
        },
        totals: {
            characters: totalCharacters,
            words: totalWords,
            swipes: totalSwipes,
            taps: totalTaps,
            backspaces: totalBackspaces,
            errors: totalErrors
        },
        ratios: {
            swipeVsTap: totalSwipes / (totalSwipes + totalTaps || 1),
            errorRate: totalErrors / (totalCharacters || 1)
        },
        log: keystrokeLog
    };
}

function exportAnalytics() {
    const stats = getDetailedStats();
    const json = JSON.stringify(stats, null, 2);
    
    
    // Create downloadable file
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keyboard-analytics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    return stats;
}

function resetSession() {
    sessionStartTime = Date.now();
    totalCharacters = 0;
    totalWords = 0;
    totalSwipes = 0;
    totalTaps = 0;
    totalBackspaces = 0;
    totalErrors = 0;
    keystrokeLog = [];
    currentWPM = 0;
    peakWPM = 0;
    avgSwipeLength = 0;
    efficiency = 100;
    
    const textarea = document.getElementById('typed');
    if (textarea) textarea.value = '';
    
}

// Export functions for external use
window.SwipeKeyboard = {
    // Core functionality
    setKeystrokeCallback,
    getSwipePath: () => [...swipePath],
    isSwipeActive: () => isSwipeActive,
    
    // Analytics API
    getStats: getDetailedStats,
    exportAnalytics,
    resetSession,
    
    // Real-time metrics
    getCurrentWPM: () => currentWPM,
    getPeakWPM: () => peakWPM,
    getEfficiency: () => efficiency,
    getTotalWords: () => totalWords,
    getTotalCharacters: () => totalCharacters,
    getTotalSwipes: () => totalSwipes,
    getTotalTaps: () => totalTaps,
    getErrorRate: () => (totalErrors / (totalCharacters || 1) * 100).toFixed(2)
};

// START APPLICATION

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

// FINGER TRACKING INTEGRATION

let handTrackingActive = false;
let hands = null;
let camera = null;
let lastHoveredKey = null;
let dwellStartTime = null;
const DWELL_TIME = 700; // 700ms to select a key
let lastInteractiveElement = null;
let interactiveDwellStart = null;

function setupHandTracking() {
    const startBtn = document.getElementById('start-hand-tracking');
    const stopBtn = document.getElementById('stop-hand-tracking');
    const statusSpan = document.getElementById('hand-status');
    const fingerDot = document.getElementById('finger-dot');
    const video = document.getElementById('hand-video');
    
    if (!startBtn || !stopBtn || !statusSpan) return;
    
    startBtn.addEventListener('click', async () => {
        try {
            // Initialize MediaPipe Hands
            hands = new Hands({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
            });
            
            hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });
            
            hands.onResults(onHandResults);
            
            // Setup camera
            camera = new Camera(video, {
                onFrame: async () => {
                    if (handTrackingActive) {
                        await hands.send({ image: video });
                    }
                },
                width: 640,
                height: 480
            });
            
            await camera.start();
            
            handTrackingActive = true;
            startBtn.style.display = 'none';
            stopBtn.style.display = 'inline-block';
            statusSpan.textContent = '👆 Finger tracking active';
            statusSpan.style.color = '#4CAF50';
            fingerDot.style.display = 'block';
        } catch (error) {
            console.error('Error starting hand tracking:', error);
            statusSpan.textContent = 'Error: ' + error.message;
            statusSpan.style.color = '#f44336';
        }
    });
    
    stopBtn.addEventListener('click', () => {
        handTrackingActive = false;
        if (camera) camera.stop();
        fingerDot.style.display = 'none';
        stopBtn.style.display = 'none';
        startBtn.style.display = 'inline-block';
        statusSpan.textContent = 'Finger tracking inactive';
        statusSpan.style.color = '#666';
    });
}

function onHandResults(results) {
    if (!handTrackingActive || !results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
        resetInteractiveHover();
        return;
    }
    
    const fingerDot = document.getElementById('finger-dot');
    
    // Get index finger tip (landmark 8)
    const indexFingerTip = results.multiHandLandmarks[0][8];
    
    // Convert normalized coordinates to screen coordinates
    const x = window.innerWidth * (1 - indexFingerTip.x); // Mirror horizontally
    const y = window.innerHeight * indexFingerTip.y;
    
    // Update finger dot position
    fingerDot.style.left = x + 'px';
    fingerDot.style.top = y + 'px';
    
    // Check if finger is hovering over a key
    const element = document.elementFromPoint(x, y);
    const key = element?.closest('.key');
    
    if (key) {
        // Finger is hovering over a key
        if (key !== lastHoveredKey) {
            // New key - reset dwell timer
            lastHoveredKey = key;
            dwellStartTime = Date.now();
            key.style.opacity = '0.7';
        } else {
            // Same key - check dwell time
            const dwellDuration = Date.now() - dwellStartTime;
            
            if (dwellDuration >= DWELL_TIME) {
                // Dwell time reached - trigger key
                fingerDot.classList.add('selecting');
                const character = key.dataset.char;
                const type = key.dataset.type;
                
                if (character && type) {
                    handleTap(character, type);
                }
                
                // Reset dwell
                lastHoveredKey = null;
                dwellStartTime = null;
                key.style.opacity = '1';
                
                setTimeout(() => {
                    fingerDot.classList.remove('selecting');
                }, 300);
            }
        }
        resetInteractiveHover();
        return;
    } else {
        // Not hovering over any key
        if (lastHoveredKey) {
            lastHoveredKey.style.opacity = '1';
            lastHoveredKey = null;
            dwellStartTime = null;
        }
    }
    
    const interactive = element?.closest('.finger-target');
    if (interactive) {
        handleInteractiveHover(interactive);
    } else {
        resetInteractiveHover();
    }
}

function handleInteractiveHover(element) {
    if (element !== lastInteractiveElement) {
        resetInteractiveHover();
        lastInteractiveElement = element;
        interactiveDwellStart = Date.now();
        element.classList.add('finger-hover');
    } else if (Date.now() - interactiveDwellStart >= DWELL_TIME) {
        activateInteractiveElement(element);
    }
}

function activateInteractiveElement(element) {
    if (!element) return;
    if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
        element.focus();
    } else if (typeof element.click === 'function') {
        element.click();
    }
    resetInteractiveHover();
}

function resetInteractiveHover() {
    if (lastInteractiveElement) {
        lastInteractiveElement.classList.remove('finger-hover');
        lastInteractiveElement = null;
    }
    interactiveDwellStart = null;
}

// Initialize hand tracking controls when ready
setTimeout(setupHandTracking, 1000);

// Log capabilities on load
