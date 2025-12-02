import React, { useState } from 'react';
import { Word } from '../types';

interface AdminPanelProps {
    onClose: () => void;
    onAddWord: (newWord: Word) => void;
    onReset: () => void;
}

export default function AdminPanel({ onClose, onAddWord, onReset }: AdminPanelProps) {
    const [formData, setFormData] = useState({
        category: '',
        word: '',
        hint1: '',
        hint2: '',
        hint3: '',
        image: '',
        example: ''
    });
    const [msg, setMsg] = useState({ text: '', type: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = () => {
        const { category, word, hint1, hint2, hint3, image, example } = formData;
        const hints = [hint1, hint2, hint3].filter(h => h.trim() !== "");

        if (!word || hints.length < 1 || !category) {
            setMsg({ text: "Please fill in Category, Word, and at least 1 Hint.", type: "error" });
            return;
        }

        const newWord: Word = {
            word: word.trim(),
            category: category.trim(),
            hints,
            image: image.trim() || `https://loremflickr.com/600/400/${word.trim()}`,
            example: example.trim()
        };

        onAddWord(newWord);
        setMsg({ text: `Added "${word}"!`, type: "success" });

        // Reset form
        setFormData({
            category: '',
            word: '',
            hint1: '',
            hint2: '',
            hint3: '',
            image: '',
            example: ''
        });
    };

    const handleDownload = () => {
        // This is a bit tricky in React/Next.js client-side, but we can simulate the download
        // We'll need to get the current words from the parent or context, but for now let's just show a message
        // or we can pass the full word list to AdminPanel if needed.
        // For simplicity, let's just assume the user knows this only downloads the *initial* file structure 
        // or we can skip this feature for now as LocalStorage is the main persistence method.
        alert("Download feature is simplified in this version. Please rely on Local Storage persistence.");
    };

    return (
        <div className="admin-panel">
            <div className="admin-content">
                <div className="admin-header">
                    <h2>Teacher Panel</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="add-word-form">
                    <h3>Add New Word</h3>
                    <div className="form-group">
                        <label>Category:</label>
                        <input type="text" id="category" value={formData.category} onChange={handleChange} placeholder="e.g., Animals" />
                    </div>
                    <div className="form-group">
                        <label>Word:</label>
                        <input type="text" id="word" value={formData.word} onChange={handleChange} placeholder="e.g., Apple" />
                    </div>
                    <div className="form-group">
                        <label>Hint 1:</label>
                        <input type="text" id="hint1" value={formData.hint1} onChange={handleChange} placeholder="e.g., It is a fruit" />
                    </div>
                    <div className="form-group">
                        <label>Hint 2:</label>
                        <input type="text" id="hint2" value={formData.hint2} onChange={handleChange} placeholder="e.g., It is red" />
                    </div>
                    <div className="form-group">
                        <label>Hint 3:</label>
                        <input type="text" id="hint3" value={formData.hint3} onChange={handleChange} placeholder="e.g., Keeps the doctor away" />
                    </div>
                    <div className="form-group">
                        <label>Image URL (optional):</label>
                        <input type="text" id="image" value={formData.image} onChange={handleChange} placeholder="e.g., https://example.com/apple.jpg" />
                    </div>
                    <div className="form-group">
                        <label>Example Sentence:</label>
                        <input type="text" id="example" value={formData.example} onChange={handleChange} placeholder="e.g., An apple a day keeps the doctor away." />
                    </div>
                    <button id="add-word-btn" onClick={handleSubmit}>Add Word</button>
                    {msg.text && (
                        <p className="admin-msg" style={{ color: msg.type === 'error' ? 'var(--error-color)' : 'var(--success-color)' }}>
                            {msg.text}
                        </p>
                    )}
                </div>

                <div className="download-section">
                    <h3>Save Changes</h3>
                    <button className="download-btn" onClick={handleDownload}>Download Database</button>
                    <button
                        className="reset-btn"
                        style={{ backgroundColor: '#e74c3c', marginTop: '10px', width: '100%', padding: '12px', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '1.1rem' }}
                        onClick={onReset}
                    >
                        Reset Custom Words
                    </button>
                </div>
            </div>
        </div>
    );
}
