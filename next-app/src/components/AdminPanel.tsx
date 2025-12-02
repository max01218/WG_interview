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
        hint4: '',
        image: '',
        example: ''
    });
    const [msg, setMsg] = useState({ text: '', type: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        const { word, hint1, hint2, hint3, hint4, image, example } = formData;
        const hints = [hint1, hint2, hint3, hint4].filter(h => h.trim() !== "");

        if (!word || hints.length < 1) {
            setMsg({ text: "Please fill in Word and at least 1 Hint.", type: "error" });
            return;
        }

        const newWord: Word = {
            word: word.trim(),
            category: "Custom", // Default category
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
            hint4: '',
            image: '',
            example: ''
        });
    };

    const handleDownload = () => {
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
                    {/* Category field removed */}
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
                        <label>Hint 4:</label>
                        <input type="text" id="hint4" value={formData.hint4} onChange={handleChange} placeholder="e.g., Grows on trees" />
                    </div>
                    <div className="form-group">
                        <label>Image URL (or Upload):</label>
                        <input type="text" id="image" value={formData.image} onChange={handleChange} placeholder="e.g., https://example.com/apple.jpg" style={{ marginBottom: '10px' }} />
                        <input type="file" accept="image/*" onChange={handleFileChange} />
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
