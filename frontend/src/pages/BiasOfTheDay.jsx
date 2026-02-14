import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function BiasOfTheDay() {
    const [bias, setBias] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/bias/today')
            .then(res => { setBias(res.data.bias); setLoading(false); })
            .catch(err => { setError(err.response?.data?.message || 'Failed to load'); setLoading(false); });
    }, []);

    if (loading) return <div className="page-loader"><div className="spinner"></div><p>Loading bias of the day...</p></div>;
    if (error) return <div className="page-loader"><p className="text-error">{error}</p></div>;
    if (!bias) return null;

    return (
        <div className="bias-page">
            <div className="container">
                <h1>🧠 Bias of the Day</h1>
                <div className="story-card">
                    <h2 className="story-title text-center">{bias.name}</h2>

                    <div className="analysis-section">
                        <div className="analysis-item">
                            <div className="analysis-label">📘 Definition:</div>
                            <p>{bias.definition}</p>
                        </div>
                        <div className="analysis-item">
                            <div className="analysis-label">💡 Example:</div>
                            <p>{bias.example}</p>
                        </div>
                        <div className="analysis-item">
                            <div className="analysis-label">🛡️ How to Avoid:</div>
                            <p>{bias.prevention}</p>
                        </div>
                    </div>
                </div>
                <div className="text-center">
                    <Link to="/" className="btn btn-secondary">← Back to Homepage</Link>
                </div>
            </div>
        </div>
    );
}
