"use client";
import React, { useState, useEffect } from 'react';
import { words as initialWords } from '../data/words';
import StartScreen from './StartScreen';
import WordDisplay from './WordDisplay';
import Hints from './Hints';
import AdminPanel from './AdminPanel';
import { Word } from '../types';

export default function Game() {
    // Game Data State
    const [gameWords, setGameWords] = useState<Word[]>([]);
    const [customWords, setCustomWords] = useState<Word[]>([]);

    // Game Play State
    const [gameState, setGameState] = useState<'start' | 'playing' | 'win'>('start');
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [showAdmin, setShowAdmin] = useState(false);

    // Input State
    const [guess, setGuess] = useState('');
    const [revealedLetters, setRevealedLetters] = useState<{ [key: number]: string }>({});
    const [feedback, setFeedback] = useState({ text: '', type: '' });
    const [isCorrect, setIsCorrect] = useState(false);
    const [wrongGuesses, setWrongGuesses] = useState(0);

    // Load custom words on mount
    useEffect(() => {
        const savedWords = localStorage.getItem('customWords');
        if (savedWords) {
            try {
                setCustomWords(JSON.parse(savedWords));
            } catch (e) {
                console.error("Failed to parse custom words", e);
            }
        }
    }, []);

    const handleAddWord = (newWord: Word) => {
        const updatedWords = [...customWords, newWord];
        setCustomWords(updatedWords);
        localStorage.setItem('customWords', JSON.stringify(updatedWords));
    };

    const handleResetWords = () => {
        if (confirm("Are you sure you want to delete all custom words?")) {
            setCustomWords([]);
            localStorage.removeItem('customWords');
        }
    };

    const startGame = () => {
        // Combine initial words and custom words
        const allWords = [...initialWords, ...customWords];

        // Pick one random word
        const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
        setGameWords([randomWord]);
        setCurrentWordIndex(0);
        setGameState('playing');
        resetWordState();
    };

    const resetWordState = () => {
        setGuess('');
        setRevealedLetters({});
        setFeedback({ text: '', type: '' });
        setIsCorrect(false);
        setWrongGuesses(0);
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
            const newWrongGuesses = wrongGuesses + 1;
            setWrongGuesses(newWrongGuesses);

            if (newWrongGuesses >= 3) {
                // Reveal answer and end game (show popup)
                handleCorrectAnswer(currentWordData, true); // Pass true for 'forced reveal'
            } else {
                setFeedback({ text: `Wrong! (${newWrongGuesses}/3) ❌`, type: 'error shake' });
                setTimeout(() => setFeedback(prev => ({ ...prev, type: 'error' })), 500);
            }
        }
    };

    const handleCorrectAnswer = (wordData: Word, forced = false) => {
        // Reveal all green
        const newRevealed: { [key: number]: string } = {};
        wordData.word.split('').forEach((l, i) => newRevealed[i] = l);
        setRevealedLetters(newRevealed);

        if (forced) {
            setFeedback({ text: `Out of tries! The word was "${wordData.word}".`, type: 'error' });
        } else {
            setFeedback({ text: "Correct! Great Job! 🎉", type: 'success pop' });
        }
        setIsCorrect(true);
        speak(wordData.word);
    };

    const speak = (text: string | string[]) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();

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

    // Renders
    if (showAdmin) {
        return (
            <AdminPanel
                onClose={() => setShowAdmin(false)}
                onAddWord={handleAddWord}
                onReset={handleResetWords}
            />
        );
    }

    if (gameState === 'start') {
        return (
            <StartScreen
                categories={[]}
                onStart={startGame}
                onOpenAdmin={() => setShowAdmin(true)}
            />
        );
    }

    // Playing State
    const currentWordData = gameWords[currentWordIndex];

    return (
        <>
            <div className="game-header-controls">
                <button id="exit-btn" className="icon-btn" title="Exit Game" onClick={() => setGameState('start')}>🚪 Exit</button>
            </div>

            <div className="card" style={{ borderColor: isCorrect ? '#2ECC71' : 'var(--secondary-color)' }}>
                {/* Image Always Shown */}
                <div id="result-image-container" style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <img
                        id="result-image"
                        src={currentWordData.image}
                        alt="Word Image"
                        style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
                    />
                </div>

                <WordDisplay
                    word={currentWordData.word}
                    revealedLetters={revealedLetters}
                    difficulty={'hard'} // No first letter hint
                />

                <Hints
                    hints={currentWordData.hints}
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
                        onKeyPress={(e) => e.key === 'Enter' && !isCorrect && checkAnswer()}
                        disabled={isCorrect}
                        autoFocus
                    />
                    <button
                        id="submit-btn"
                        onClick={checkAnswer}
                        disabled={isCorrect}
                    >
                        Guess!
                    </button>
                </div>

                <div className={`feedback ${feedback.type}`}>
                    {feedback.type === 'error' || feedback.type === 'error shake' ? feedback.text : ''}
                </div>

            </div>

            {isCorrect && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h2>{wrongGuesses >= 3 ? "Out of tries! 😅" : "Correct! Great Job! 🎉"}</h2>
                        {wrongGuesses >= 3 && <p style={{ fontSize: '1.2rem', marginBottom: '15px' }}>The word was: <strong>{gameWords[currentWordIndex].word}</strong></p>}
                        <button
                            id="play-again-btn"
                            onClick={() => setGameState('start')}
                            style={{
                                backgroundColor: '#2ECC71',
                                color: 'white',
                                border: 'none',
                                padding: '15px 30px',
                                fontSize: '1.2rem',
                                borderRadius: '30px',
                                cursor: 'pointer',
                                marginTop: '20px'
                            }}
                        >
                            Play Again 🏠
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
