"use client";
import React, { useState, useEffect, useRef } from 'react';
import { words as initialWords } from '../data/words';
import StartScreen from './StartScreen';
import WordDisplay from './WordDisplay';
import Hints from './Hints';
import AdminPanel from './AdminPanel';
import { Word } from '../types';

export default function Game() {
    // Game Data State
    const [allWords, setAllWords] = useState<Word[]>(initialWords);
    const [gameWords, setGameWords] = useState<Word[]>([]);

    // Game Play State
    const [gameState, setGameState] = useState<'start' | 'playing' | 'win' | 'lose'>('start');
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [difficulty, setDifficulty] = useState('easy');

    // Input State
    const [guess, setGuess] = useState('');
    const [revealedLetters, setRevealedLetters] = useState<{ [key: number]: string }>({}); // Map index to letter
    const [feedback, setFeedback] = useState({ text: '', type: '' });
    const [showImage, setShowImage] = useState(false);
    const [showExample, setShowExample] = useState(false);

    // Admin State
    const [showAdmin, setShowAdmin] = useState(false);

    // Timer Ref
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Initialization (Load LocalStorage)
    useEffect(() => {
        const customWords = JSON.parse(localStorage.getItem('customWords') || '[]');
        if (customWords.length > 0) {
            setAllWords(prev => [...prev, ...customWords]);
        }
    }, []);

    // Timer Logic
    useEffect(() => {
        if (gameState === 'playing') {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleTimeOut();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [gameState, currentWordIndex]); // Re-run when word changes to ensure timer doesn't get weird

    const handleTimeOut = () => {
        setFeedback({ text: "Time's Up! ⏰", type: 'error' });
        setCombo(0);
        // Reveal word
        const currentWord = gameWords[currentWordIndex].word;
        const newRevealed: { [key: number]: string } = {};
        currentWord.split('').forEach((l, i) => newRevealed[i] = l);
        setRevealedLetters(newRevealed);

        // Wait a bit then next word? Or just let user click next.
        // In original logic: disable input, show next button.
        // We'll handle this by state in render.
    };

    const startGame = (category: string, diff: string) => {
        let selectedWords = [...allWords];
        if (category !== 'all') {
            selectedWords = selectedWords.filter(w => w.category === category);
        }

        if (selectedWords.length === 0) {
            alert("No words in this category!");
            return;
        }

        // Shuffle
        selectedWords.sort(() => Math.random() - 0.5);

        // Limit
        const maxQuestions = diff === 'easy' ? 5 : 10;
        selectedWords = selectedWords.slice(0, maxQuestions);

        setGameWords(selectedWords);
        setDifficulty(diff);
        setScore(diff === 'easy' ? 20 : 50);
        setCombo(0);
        setCurrentWordIndex(0);
        setGameState('playing');
        resetWordState();
    };

    const resetWordState = () => {
        setGuess('');
        setRevealedLetters({});
        setFeedback({ text: '', type: '' });
        setShowImage(false);
        setShowExample(false);
        setTimeLeft(30);
    };

    const handleGuessInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setGuess(val);

        // Mirroring logic
        const currentWord = gameWords[currentWordIndex].word;
        const newRevealed: { [key: number]: string } = {};
        val.split('').forEach((char, i) => {
            if (i < currentWord.length) {
                newRevealed[i] = char.toUpperCase();
            }
        });
        setRevealedLetters(newRevealed);
    };

    const checkAnswer = () => {
        const currentWordData = gameWords[currentWordIndex];
        const correctWord = currentWordData.word.toLowerCase();
        const userGuess = guess.trim().toLowerCase();

        if (!userGuess) return;

        if (userGuess === correctWord) {
            handleCorrectAnswer(currentWordData);
        } else {
            handleIncorrectAnswer();
        }
    };

    const handleCorrectAnswer = (wordData: Word) => {
        if (timerRef.current) clearInterval(timerRef.current);

        // Reveal all green
        const newRevealed: { [key: number]: string } = {};
        wordData.word.split('').forEach((l, i) => newRevealed[i] = l);
        setRevealedLetters(newRevealed);

        setFeedback({ text: "Correct! Great Job! 🎉", type: 'success pop' });
        setShowImage(true);
        if (wordData.example) setShowExample(true);

        const newCombo = combo + 1;
        setCombo(newCombo);
        const points = 10 * (1 + (newCombo * 0.1));
        setScore(prev => prev + Math.floor(points));

        speak(wordData.word);
    };

    const handleIncorrectAnswer = () => {
        setCombo(0);
        const penalty = difficulty === 'easy' ? 2 : 5;
        setScore(prev => Math.max(0, prev - penalty));

        if (score - penalty <= 0) {
            setGameState('lose');
            return;
        }

        setFeedback({ text: `Try again! - ${penalty} points ❌`, type: 'error shake' });
        setTimeout(() => setFeedback(prev => ({ ...prev, type: 'error' })), 500);
        setGuess('');
    };

    const nextWord = () => {
        if (currentWordIndex >= gameWords.length - 1) {
            setGameState('win');
        } else {
            setCurrentWordIndex(prev => prev + 1);
            resetWordState();
        }
    };

    const speak = (text: string | string[]) => {
        if (!window.speechSynthesis) return;
        // Cancel current speech
        window.speechSynthesis.cancel();

        // Handle array of hints or single string
        if (Array.isArray(text)) {
            text.forEach(t => {
                const utterance = new SpeechSynthesisUtterance(t);
                utterance.lang = 'en-US';
                window.speechSynthesis.speak(utterance);
            });
        } else {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        }
    };

    // Admin Handlers
    const handleAddWord = (newWord: Word) => {
        setAllWords(prev => [...prev, newWord]);
        const customWords = JSON.parse(localStorage.getItem('customWords') || '[]');
        customWords.push(newWord);
        localStorage.setItem('customWords', JSON.stringify(customWords));
    };

    const handleResetCustomWords = () => {
        if (confirm("Are you sure you want to delete all custom words?")) {
            localStorage.removeItem('customWords');
            setAllWords(initialWords); // Reset to initial only
            alert("Custom words deleted.");
        }
    };

    // Renders
    if (gameState === 'start') {
        return (
            <>
                <StartScreen
                    categories={[...new Set(allWords.map(w => w.category))]}
                    onStart={startGame}
                />
                <button className="admin-toggle" onClick={() => setShowAdmin(true)}>Teacher Mode</button>
                {showAdmin && (
                    <AdminPanel
                        onClose={() => setShowAdmin(false)}
                        onAddWord={handleAddWord}
                        onReset={handleResetCustomWords}
                    />
                )}
            </>
        );
    }

    if (gameState === 'win' || gameState === 'lose') {
        return (
            <div className="card" style={{ borderColor: gameState === 'win' ? '#2ECC71' : '#E74C3C' }}>
                <h2 style={{ color: gameState === 'win' ? '#2ECC71' : '#E74C3C' }}>
                    {gameState === 'win' ? "Congratulations! 🎉" : "Game Over 😢"}
                </h2>
                <p>{gameState === 'win' ? "You completed all the words!" : "You ran out of points!"}</p>
                <p style={{ fontSize: '1.5rem', margin: '20px 0' }}>Final Score: {score}</p>
                <button id="submit-btn" onClick={() => setGameState('start')}>Play Again</button>
            </div>
        );
    }

    // Playing State
    const currentWordData = gameWords[currentWordIndex];
    const isRoundOver = showImage || timeLeft === 0;

    return (
        <>
            <div className="game-header-controls">
                <button id="exit-btn" className="icon-btn" title="Exit Game" onClick={() => setGameState('start')}>🚪 Exit</button>
            </div>
            <div className="game-info">
                <div className="timer-container">
                    <span className="timer-icon">⏱️</span>
                    <span id="timer" style={{ color: timeLeft <= 10 ? '#E74C3C' : 'var(--primary-color)' }}>{timeLeft}</span>s
                </div>
                <div className="score-board">
                    <span>Score: <span id="score">{score}</span></span>
                    {combo > 1 && (
                        <span id="combo-display">🔥 Combo x<span id="combo-count">{combo}</span></span>
                    )}
                </div>
            </div>

            <div className="card" style={{ borderColor: showImage ? '#2ECC71' : 'var(--secondary-color)' }}>
                <WordDisplay
                    word={currentWordData.word}
                    revealedLetters={revealedLetters}
                    difficulty={difficulty}
                />

                <Hints
                    hints={difficulty === 'easy' ? currentWordData.hints : currentWordData.hints.slice(0, 2)}
                    onSpeak={speak}
                />

                <div className="input-section">
                    <input
                        type="text"
                        id="guess-input"
                        placeholder="Type your guess here..."
                        autoComplete="off"
                        value={guess}
                        onChange={handleGuessInput}
                        onKeyPress={(e) => e.key === 'Enter' && !isRoundOver && checkAnswer()}
                        disabled={isRoundOver}
                        autoFocus
                    />
                    <button
                        id="submit-btn"
                        onClick={checkAnswer}
                        disabled={isRoundOver}
                    >
                        Guess!
                    </button>
                </div>

                <div className={`feedback ${feedback.type}`}>{feedback.text}</div>

                {showImage && (
                    <div id="result-image-container" style={{ marginTop: '15px', textAlign: 'center' }}>
                        <img
                            id="result-image"
                            src={currentWordData.image || `https://loremflickr.com/600/400/${currentWordData.word}`}
                            alt="Word Image"
                            style={{ maxWidth: '100%', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
                        />
                    </div>
                )}

                {showExample && (
                    <div id="example-display" className="example">
                        Example: "{currentWordData.example}"
                    </div>
                )}
            </div>

            {isRoundOver && (
                <button id="next-btn" onClick={nextWord}>Next Word</button>
            )}
        </>
    );
}
