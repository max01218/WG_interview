// Game State
let currentWordIndex = 0;
let score = 0;
let combo = 0;
let isGameActive = false;
let gameWords = [];
let timerInterval;
let timeLeft = 30;
let currentDifficulty = 'easy'; // 'easy' or 'hard'

// DOM Elements
const startScreen = document.getElementById('start-screen');
const gameArea = document.getElementById('game-area');
const categorySelect = document.getElementById('category-select');
const diffBtns = document.querySelectorAll('.diff-btn');
const startGameBtn = document.getElementById('start-game-btn');

const hintsList = document.getElementById('hints-list');
const wordDisplay = document.getElementById('word-display');
const guessInput = document.getElementById('guess-input');
const submitBtn = document.getElementById('submit-btn');
const feedbackMessage = document.getElementById('feedback-message');
const exampleDisplay = document.getElementById('example-display');
const scoreDisplay = document.getElementById('score');
const comboDisplay = document.getElementById('combo-display');
const comboCount = document.getElementById('combo-count');
const timerDisplay = document.getElementById('timer');
const nextBtn = document.getElementById('next-btn');
const ttsBtn = document.getElementById('tts-btn');
const exitBtn = document.getElementById('exit-btn');
const card = document.querySelector('.card');

// Admin Elements
const adminToggle = document.getElementById('admin-toggle');
const adminPanel = document.getElementById('admin-panel');
const closeAdminBtn = document.getElementById('close-admin');
const addWordBtn = document.getElementById('add-word-btn');
const downloadBtn = document.getElementById('download-btn');
const adminMsg = document.getElementById('admin-msg');
const categoryList = document.getElementById('category-list');

// Initialization
function init() {
    // Check data
    if (typeof words === 'undefined' || words.length === 0) {
        alert("Error: No words found! Please check data.js");
        return;
    }

    populateCategories();
    setupEventListeners();
}

function populateCategories() {
    const categories = [...new Set(words.map(w => w.category || 'Uncategorized'))];

    // Populate Start Screen Select
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });

    // Populate Admin Datalist
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        categoryList.appendChild(option);
    });
}

function setupEventListeners() {
    // Start Screen
    diffBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            diffBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            currentDifficulty = btn.dataset.diff;
        });
    });

    startGameBtn.addEventListener('click', startGame);

    // Game
    submitBtn.addEventListener('click', checkAnswer);
    guessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer();
    });
    nextBtn.addEventListener('click', nextWord);
    ttsBtn.addEventListener('click', speakHints);
    if (exitBtn) exitBtn.addEventListener('click', exitGame);

    // Admin
    adminToggle.addEventListener('click', () => adminPanel.classList.remove('hidden'));
    closeAdminBtn.addEventListener('click', () => adminPanel.classList.add('hidden'));
    addWordBtn.addEventListener('click', addNewWord);
    downloadBtn.addEventListener('click', downloadDatabase);
}

// Game Logic
function exitGame() {
    isGameActive = false;
    stopTimer();

    // Reset UI
    gameArea.classList.add('hidden');
    startScreen.classList.remove('hidden');

    score = 0;
    combo = 0;
}

function startGame() {
    const selectedCategory = categorySelect.value;

    if (selectedCategory === 'all') {
        gameWords = [...words];
    } else {
        gameWords = words.filter(w => w.category === selectedCategory);
    }

    if (gameWords.length === 0) {
        alert("No words in this category!");
        return;
    }

    // Shuffle words
    gameWords.sort(() => Math.random() - 0.5);

    // Apply Game Rules
    const maxQuestions = currentDifficulty === 'easy' ? 5 : 10;
    gameWords = gameWords.slice(0, maxQuestions);

    currentWordIndex = 0;
    score = currentDifficulty === 'easy' ? 20 : 50; // Initial Score
    combo = 0;
    updateScore();

    startScreen.classList.add('hidden');
    gameArea.classList.remove('hidden');

    loadWord(currentWordIndex);
}

function loadWord(index) {
    if (index >= gameWords.length) {
        endGame('win');
        return;
    }

    const currentWordData = gameWords[index];
    const word = currentWordData.word;

    // Reset UI
    hintsList.innerHTML = '';
    wordDisplay.innerHTML = '';
    guessInput.value = '';
    guessInput.disabled = false;
    guessInput.focus();
    feedbackMessage.className = 'feedback hidden';
    exampleDisplay.className = 'example hidden';
    nextBtn.classList.add('hidden');
    submitBtn.disabled = false;
    isGameActive = true;

    // Timer
    resetTimer();

    // Display Underscores
    for (let i = 0; i < word.length; i++) {
        const span = document.createElement('span');
        span.className = 'letter-box';

        // Easy Mode: Show first letter
        if (currentDifficulty === 'easy' && i === 0) {
            span.textContent = word[0];
        } else {
            span.textContent = '';
        }
        wordDisplay.appendChild(span);
    }

    // Display Hints
    const hintsToShow = currentDifficulty === 'easy' ? currentWordData.hints : currentWordData.hints.slice(0, 2);

    console.log("Generating hints...", hintsToShow);
    hintsToShow.forEach((hint, i) => {
        setTimeout(() => {
            const li = document.createElement('li');
            li.className = 'hint-card';

            const inner = document.createElement('div');
            inner.className = 'hint-card-inner';

            const front = document.createElement('div');
            front.className = 'hint-card-front';
            front.textContent = `Hint ${i + 1}`;

            const back = document.createElement('div');
            back.className = 'hint-card-back';
            back.textContent = hint;

            inner.appendChild(front);
            inner.appendChild(back);
            li.appendChild(inner);

            li.addEventListener('click', () => {
                li.classList.toggle('flipped');
            });

            li.style.opacity = '0';
            li.style.transform = 'translateY(20px)';
            li.style.transition = 'all 0.5s ease';
            hintsList.appendChild(li);

            // Trigger reflow for animation
            li.offsetHeight;
            li.style.opacity = '1';
            li.style.transform = 'translateY(0)';
        }, i * 300);
    });
}

function checkAnswer() {
    if (!isGameActive) return;

    const userGuess = guessInput.value.trim().toLowerCase();
    const currentWordData = gameWords[currentWordIndex];
    const correctWord = currentWordData.word.toLowerCase();

    if (userGuess === '') return;

    if (userGuess === correctWord) {
        handleCorrectAnswer(currentWordData);
    } else {
        handleIncorrectAnswer();
    }
}

function handleCorrectAnswer(wordData) {
    isGameActive = false;
    stopTimer();

    // Reveal Word
    const letters = wordDisplay.children;
    for (let i = 0; i < letters.length; i++) {
        letters[i].textContent = wordData.word[i];
        letters[i].style.borderColor = '#2ECC71';
        letters[i].style.color = '#2ECC71';
    }

    feedbackMessage.textContent = "Correct! Great Job! 🎉";
    feedbackMessage.className = 'feedback success pop';

    // Show Example
    if (wordData.example) {
        exampleDisplay.textContent = `Example: "${wordData.example}"`;
        exampleDisplay.classList.remove('hidden');
    }

    // Score & Combo
    combo++;
    const points = 10 * (1 + (combo * 0.1)); // 10% bonus per combo
    score += Math.floor(points);
    updateScore();

    guessInput.disabled = true;
    submitBtn.disabled = true;
    nextBtn.classList.remove('hidden');

    // Celebration
    card.style.borderColor = '#2ECC71';
    setTimeout(() => card.style.borderColor = '#4ECDC4', 1000);
}

function handleIncorrectAnswer() {
    combo = 0; // Reset combo

    // Deduct points
    const penalty = currentDifficulty === 'easy' ? 2 : 5;
    score -= penalty;
    if (score < 0) score = 0;
    updateScore();

    if (score <= 0) {
        endGame('lose');
        return;
    }

    feedbackMessage.textContent = `Try again! -${penalty} points 📉`;
    feedbackMessage.className = 'feedback error shake';
    setTimeout(() => feedbackMessage.classList.remove('shake'), 500);

    guessInput.value = '';
    guessInput.focus();
}

function updateScore() {
    scoreDisplay.textContent = score;
    comboCount.textContent = combo;
    if (combo > 1) {
        comboDisplay.classList.remove('hidden');
    } else {
        comboDisplay.classList.add('hidden');
    }
}

// Timer Logic
function resetTimer() {
    stopTimer();
    timeLeft = 30;
    timerDisplay.textContent = timeLeft;
    timerDisplay.style.color = 'var(--primary-color)';

    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;

        if (timeLeft <= 10) {
            timerDisplay.style.color = '#E74C3C'; // Red warning
        }

        if (timeLeft <= 0) {
            stopTimer();
            handleTimeOut();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function handleTimeOut() {
    isGameActive = false;
    feedbackMessage.textContent = "Time's Up! ⏰";
    feedbackMessage.className = 'feedback error';

    // Reveal word
    const correctWord = gameWords[currentWordIndex].word;
    const letters = wordDisplay.children;
    for (let i = 0; i < letters.length; i++) {
        letters[i].textContent = correctWord[i];
        letters[i].style.color = '#E74C3C';
    }

    guessInput.disabled = true;
    submitBtn.disabled = true;
    nextBtn.classList.remove('hidden');
    combo = 0;
    updateScore();
}

function nextWord() {
    currentWordIndex++;
    loadWord(currentWordIndex);
}

function endGame(result) {
    stopTimer();
    let title, message, color;

    if (result === 'win') {
        title = "Congratulations! 🎉";
        message = "You completed all the words!";
        color = "#2ECC71";
    } else {
        title = "Game Over 😢";
        message = "You ran out of points!";
        color = "#E74C3C";
    }

    gameArea.innerHTML = `
        <div class="card" style="border-color: ${color}">
            <h2 style="color: ${color}">${title}</h2>
            <p>${message}</p>
            <p style="font-size: 1.5rem; margin: 20px 0;">Final Score: ${score}</p>
            <button onclick="location.reload()" id="submit-btn">Play Again</button>
        </div>
    `;
}

// TTS Logic
function speakHints() {
    if (!window.speechSynthesis) return;

    const currentWordData = gameWords[currentWordIndex];
    const hints = currentDifficulty === 'easy' ? currentWordData.hints : currentWordData.hints.slice(0, 2);

    // Cancel current speech
    window.speechSynthesis.cancel();

    hints.forEach(hint => {
        const utterance = new SpeechSynthesisUtterance(hint);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    });
}

// Admin Logic
function addNewWord() {
    const category = document.getElementById('new-category').value.trim();
    const word = document.getElementById('new-word').value.trim();
    const hints = [
        document.getElementById('new-hint-1').value.trim(),
        document.getElementById('new-hint-2').value.trim(),
        document.getElementById('new-hint-3').value.trim()
    ].filter(h => h !== "");
    const example = document.getElementById('new-example').value.trim();

    if (!word || hints.length < 1 || !category) {
        adminMsg.textContent = "Please fill in Category, Word, and at least 1 Hint.";
        adminMsg.style.color = "var(--error-color)";
        return;
    }

    words.push({ word, category, hints, example });

    // Clear inputs
    document.querySelectorAll('.add-word-form input').forEach(input => input.value = '');

    adminMsg.textContent = `Added "${word}"! Don't forget to download.`;
    adminMsg.style.color = "var(--success-color)";
}

function downloadDatabase() {
    const content = `// This file contains the words and hints for the game.
// You can add more words here following the same format.

const words = ${JSON.stringify(words, null, 4)};
`;

    const blob = new Blob([content], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Start
init();
