import React from 'react';

interface StartScreenProps {
    categories: string[];
    onStart: (category: string, difficulty: string) => void;
}

export default function StartScreen({ categories, onStart }: StartScreenProps) {
    const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
    const [difficulty, setDifficulty] = React.useState<string>('easy');

    return (
        <div id="start-screen" className="card">
            <h2>Start Game</h2>
            <div className="form-group">
                <label>Choose Category:</label>
                <select
                    id="category-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label>Difficulty:</label>
                <div className="difficulty-options">
                    <button
                        className={`diff-btn ${difficulty === 'easy' ? 'selected' : ''}`}
                        onClick={() => setDifficulty('easy')}
                    >
                        Easy (3 Hints)
                    </button>
                    <button
                        className={`diff-btn ${difficulty === 'hard' ? 'selected' : ''}`}
                        onClick={() => setDifficulty('hard')}
                    >
                        Hard (2 Hints)
                    </button>
                </div>
            </div>
            <button
                id="start-game-btn"
                onClick={() => onStart(selectedCategory, difficulty)}
            >
                Play Now!
            </button>
        </div>
    );
}
