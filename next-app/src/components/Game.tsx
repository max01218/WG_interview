"use client";
import React, { useState, useEffect } from 'react';
import { words as initialWords } from '../data/words';
import StartScreen from './StartScreen';
import WordDisplay from './WordDisplay';
import Hints from './Hints';
import { Word } from '../types';

export default function Game() {
    // Game Data State
    const [gameWords, setGameWords] = useState<Word[]>([]);

    // Game Play State
    const [gameState, setGameState] = useState<'start' | 'playing' | 'win'>('start');
    const [currentWordIndex, setCurrentWordIndex] = useState(0);

    // Input State
    const [guess, setGuess] = useState('');
    const [revealedLetters, setRevealedLetters] = useState<{ [key: number]: string }>({});
    const [feedback, setFeedback] = useState({ text: '', type: '' });
    const [isCorrect, setIsCorrect] = useState(false);

    const startGame = () => {
        // Pick one random word
        const randomWord = initialWords[Math.floor(Math.random() * initialWords.length)];
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
            setFeedback({ text: "Try again! ❌", type: 'error shake' });
            setTimeout(() => setFeedback(prev => ({ ...prev, type: 'error' })), 500);
        }
    };

    const handleCorrectAnswer = (wordData: Word) => {
        // Reveal all green
        const newRevealed: { [key: number]: string } = {};
        wordData.word.split('').forEach((l, i) => newRevealed[i] = l);
        setRevealedLetters(newRevealed);

        setFeedback({ text: "Correct! Great Job! 🎉", type: 'success pop' });
        setIsCorrect(true);
        speak(wordData.word);
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
    if (gameState === 'start') {
        return (
            <StartScreen
                categories={[]}
                onStart={startGame}
            />
        );
    }

    if (gameState === 'win') {
        return (
            <div className="card" style={{ borderColor: '#2ECC71' }}>
                <h2 style={{ color: '#2ECC71' }}>Congratulations! 🎉</h2>
                <p>You completed the Halloween Challenge!</p>
                <button id="submit-btn" onClick={() => setGameState('start')}>Play Again</button>
            </div>
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
                        <h2>Correct! Great Job! 🎉</h2>
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
