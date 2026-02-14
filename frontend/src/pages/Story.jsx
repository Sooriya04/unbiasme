import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Story() {
    const [story, setStory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/story/today')
            .then(res => {
                if (res.data.ready) setStory(res.data.story);
                else setError('Story could not be generated. Try again later.');
                setLoading(false);
            })
            .catch(() => { setError('Error loading story.'); setLoading(false); });
    }, []);

    if (loading) return <div className="page-loader"><div className="spinner"></div><p>🌀 Generating story... please wait.</p></div>;
    if (error) return <div className="page-loader"><p className="text-error">{error}</p></div>;
    if (!story) return null;

    return (
        <div className="story-page">
            <div className="container">
                <h1>📚 Today's Cognitive Bias Story</h1>
                <div className="story-card">
                    <h2 className="story-title">{story.title}</h2>
                    <div className="story-content">{story.content}</div>

                    <div className="analysis-section">
                        <div className="analysis-item">
                            <div className="analysis-label">🧠 Bias Name:</div>
                            <p>{story.biasName}</p>
                        </div>
                        <div className="analysis-item">
                            <div className="analysis-label">📘 Definition:</div>
                            <p>{story.biasDefinition}</p>
                        </div>
                        <div className="analysis-item">
                            <div className="analysis-label">❗ What Went Wrong:</div>
                            <p>{story.whatWentWrong}</p>
                        </div>
                        <div className="analysis-item">
                            <div className="analysis-label">✅ How It Was Minimized:</div>
                            <p>{story.howMinimized}</p>
                        </div>
                        <div className="analysis-item">
                            <div className="analysis-label">🌱 How This Helps:</div>
                            <p>{story.howHelps}</p>
                        </div>
                    </div>
                </div>
                <Link to="/" className="btn btn-secondary">← Back to Home</Link>
            </div>
        </div>
    );
}
