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
    language: 'swipeKeyboardLanguage',
    theme: 'swipeKeyboardTheme',
    statsVisible: 'swipeKeyboardStatsVisible',
    introSeen: 'swipeKeyboardIntroSeen',
    accentStart: 'swipeKeyboardAccentStart',
    accentEnd: 'swipeKeyboardAccentEnd',
    keyboardLanguage: 'swipeKeyboardKeyboardLanguage',
    accentMode: 'swipeKeyboardAccentMode',
    accentSolid: 'swipeKeyboardAccentSolid'
};

const DEFAULT_LANGUAGE = navigator.language || 'en-US';
const HOLD_TO_GESTURE_DELAY = 3000;

const LANGUAGE_OPTIONS = [
    { value: 'auto', label: `Auto (${DEFAULT_LANGUAGE})` },
    { value: 'en-US', label: 'English (US)' },
    { value: 'en-GB', label: 'English (UK)' },
    { value: 'es-ES', label: 'Español (ES)' },
    { value: 'es-MX', label: 'Español (MX)' },
    { value: 'fr-FR', label: 'Français' },
    { value: 'de-DE', label: 'Deutsch' },
    { value: 'it-IT', label: 'Italiano' },
    { value: 'pt-BR', label: 'Português (BR)' },
    { value: 'so-SO', label: 'Af Soomaali' },
    { value: 'sw-KE', label: 'Kiswahili' },
    { value: 'ar-SA', label: 'Arabic' },
    { value: 'hi-IN', label: 'हिन्दी' },
    { value: 'zh-CN', label: '中文 (简体)' },
    { value: 'ja-JP', label: '日本語' },
    { value: 'ko-KR', label: '한국어' }
];

const KEYBOARD_LANGUAGES = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'so', label: 'Af Soomaali' }
];

const instructionTexts = {
    en: '<strong>Tap</strong> or <strong>Swipe</strong> letters, <strong>Hold+Drag</strong> to draw trails, and use <strong>Finger Tracking</strong> below for hands-free typing.',
    es: '<strong>Toca</strong> o <strong>desliza</strong> letras, <strong>mantén y arrastra</strong> para dibujar trazos y usa el <strong>seguimiento de dedos</strong> debajo para escribir sin manos.',
    so: '<strong>Taabo</strong> ama <strong>siib</strong> xarafka, <strong>hay oo jiid</strong> si aad raad u samayso, kuna isticmaal <strong>Raadinta Farta</strong> hoose si aad gacmo la’aan u qorto.'
};

let currentLayout = 'letters';
let isShiftActive = false;

// State management
let isSwipeActive = false;
let swipePath = [];
let lastKeyElement = null;
let swipeJustEnded = false;
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
const savedKeyboardLanguage = safeGetStorage(STORAGE_KEYS.keyboardLanguage);
let keyboardLanguage = keyboardLetterLayouts[savedKeyboardLanguage] ? savedKeyboardLanguage : 'en';
let keyboardAreaElement = null;
let gestureTrailLayer = null;
let gestureTrailDots = [];
let holdGestureTimer = null;
let holdGestureActive = false;
let grammarStatusTimer = null;
let introOverlayElement = null;
let introHideCheckbox = null;
let accentStartColor = safeGetStorage(STORAGE_KEYS.accentStart) || DEFAULT_ACCENT_START;
let accentEndColor = safeGetStorage(STORAGE_KEYS.accentEnd) || DEFAULT_ACCENT_END;
let accentSolidColor = safeGetStorage(STORAGE_KEYS.accentSolid) || DEFAULT_ACCENT_SOLID;
let accentMode = safeGetStorage(STORAGE_KEYS.accentMode) === 'solid' ? 'solid' : 'gradient';
// Callback for logging keystrokes (for future WPM/MSD testing)
let onKeystrokeCallback = null;

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
    setupLanguageSelect();
    setupKeyboardLanguageSelect();
    setupThemeToggle();
    setupAccentColorControls();
    setupStatsToggle();
    setupVoiceInput();
    setupGrammarFixer();
    updateInstructionsText();
    setupIntroModal(introCloseButton, helpButton);
    
    // Update metrics periodically
    setInterval(updateMetrics, 1000);
    
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

function setupLanguageSelect() {
    const select = document.getElementById('language-select');
    if (!select) return;
    
    populateLanguageSelect(select);
    
    if (![...select.options].some(option => option.value === languagePreference)) {
        languagePreference = 'auto';
    }
    
    select.value = languagePreference;
    applyLanguagePreference(languagePreference);
    
    select.addEventListener('change', () => {
        applyLanguagePreference(select.value);
    });
}

function populateLanguageSelect(select) {
    select.innerHTML = '';
    const seen = new Set();
    
    const addOption = (value, label) => {
        if (seen.has(value)) return;
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        select.appendChild(option);
        seen.add(value);
    };
    
    LANGUAGE_OPTIONS.forEach(option => addOption(option.value, option.label));
    
    const browserLanguages = Array.isArray(navigator.languages) ? navigator.languages : [];
    browserLanguages.forEach(lang => addOption(lang, `${lang} (browser)`));
}

function applyLanguagePreference(value) {
    languagePreference = value || 'auto';
    voiceLanguage = resolveLanguagePreference(languagePreference);
    safeSetStorage(STORAGE_KEYS.language, languagePreference);
    if (recognition) {
        recognition.lang = voiceLanguage;
        if (isVoiceActive) {
            recognition.stop();
        }
    }
}

function setupKeyboardLanguageSelect() {
    const select = document.getElementById('keyboard-language-select');
    if (!select) return;
    
    select.innerHTML = '';
    KEYBOARD_LANGUAGES.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.textContent = option.label;
        select.appendChild(opt);
    });
    
    select.value = keyboardLanguage;
    
    select.addEventListener('change', () => {
        const value = select.value;
        if (!keyboardLetterLayouts[value]) return;
        keyboardLanguage = value;
        safeSetStorage(STORAGE_KEYS.keyboardLanguage, keyboardLanguage);
        rerenderKeyboard();
        updateInstructionsText();
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

function updateInstructionsText() {
    const instructionsEl = document.getElementById('instructions-text');
    if (!instructionsEl) return;
    const html = instructionTexts[keyboardLanguage] || instructionTexts.en;
    instructionsEl.innerHTML = html;
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

function setupGrammarFixer() {
    const button = document.getElementById('grammar-fix-btn');
    const statusSpan = document.getElementById('grammar-status');
    if (!button || !statusSpan) return;
    
    const showStatus = (message, color = 'var(--muted-text)') => {
        clearTimeout(grammarStatusTimer);
        statusSpan.textContent = message;
        statusSpan.style.color = color;
        grammarStatusTimer = setTimeout(() => {
            statusSpan.textContent = '';
        }, 2500);
    };
    
    button.addEventListener('click', () => {
        const textarea = document.getElementById('typed');
        if (!textarea) return;
        const original = textarea.value;
        if (!original.trim()) {
            showStatus('Nothing to fix');
            return;
        }
        
        const fixed = applyGrammarRules(original);
        if (fixed === original.trim()) {
            showStatus('Looks great!');
            return;
        }
        
        textarea.value = fixed;
        totalCharacters = textarea.value.length;
        countWords();
        updateMetrics();
        logKeystroke('grammar', 'fix');
        showStatus('Grammar updated', '#4CAF50');
    });
}

function applyGrammarRules(text) {
    let cleaned = text.replace(/\r\n/g, '\n');
    cleaned = cleaned.replace(/\s+/g, ' ');
    cleaned = cleaned.replace(/\s+([,.!?;:])/g, '$1');
    cleaned = cleaned.replace(/([,.!?;:])(?!\s|$)/g, '$1 ');
    cleaned = cleaned.replace(/\b(i)\b/g, 'I');
    cleaned = cleaned.replace(/(^|[.!?]\s+)([a-z])/g, (match, prefix, letter) => prefix + letter.toUpperCase());
    cleaned = cleaned.replace(/^([a-z])/, match => match.toUpperCase());
    cleaned = cleaned.trim();
    if (cleaned && !/[.!?]$/.test(cleaned)) {
        cleaned += '.';
    }
    return cleaned;
}


function getSelectedLanguageLabel() {
    const select = document.getElementById('language-select');
    if (select && select.selectedOptions && select.selectedOptions.length > 0) {
        return select.selectedOptions[0].textContent;
    }
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
        setTimeout(() => {
            swipeJustEnded = false;
        }, 100);
    }
    
    document.querySelectorAll('.key.active').forEach(key => key.classList.remove('active'));
    
    if (performedSwipe) {
        const word = swipePath.join('').toLowerCase();
        const textarea = document.getElementById('typed');
        
        // Add the swiped word
        if (textarea.value && !textarea.value.endsWith(' ')) {
            textarea.value += ' ';
            totalCharacters++;
        }
        textarea.value += word;
        
        // Update analytics
        totalCharacters += word.length;
        totalSwipes++;
        countWords();
        
        // Log the swipe
        logKeystroke('swipe', word, swipePath.length);
        
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
    
    // Call external callback if registered
    if (typeof onKeystrokeCallback === 'function') {
        onKeystrokeCallback(logEntry);
    }
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
                
                if (type === 'letter') {
                    handleTap(character, type);
                } else if (type === 'special') {
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
    } else {
        // Not hovering over any key
        if (lastHoveredKey) {
            lastHoveredKey.style.opacity = '1';
            lastHoveredKey = null;
            dwellStartTime = null;
        }
    }
}

// Initialize hand tracking controls when ready
setTimeout(setupHandTracking, 1000);

// Log capabilities on load
