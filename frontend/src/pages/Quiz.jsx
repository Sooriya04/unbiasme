import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Quiz() {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/quiz/questions')
            .then(res => {
                setQuestions(res.data.questions || []);
                setLoading(false);
            })
            .catch(err => {
                setError(err.response?.data?.message || 'Failed to load questions');
                setLoading(false);
            });
    }, []);

    const handleAnswer = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async () => {
        // Calculate trait scores from answers
        const traitScores = {};
        questions.forEach(q => {
            const trait = q.trait || q.category;
            if (!traitScores[trait]) traitScores[trait] = { total: 0, count: 0 };
            traitScores[trait].total += (answers[q._id] || 0);
            traitScores[trait].count += 1;
        });

        const normalizedScores = {};
        Object.entries(traitScores).forEach(([trait, { total, count }]) => {
            normalizedScores[trait] = Math.round((total / (count * 5)) * 100);
        });

        setSubmitting(true);
        try {
            await api.post('/quiz/submit-scores', { traitScores: normalizedScores });
            await api.post('/quiz/analyze-gemini', { traitScores: normalizedScores });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit');
            setSubmitting(false);
        }
    };

    if (loading) return <div className="page-loader"><div className="spinner"></div><p>Loading quiz...</p></div>;
    if (error) return <div className="page-loader"><p className="text-error">{error}</p></div>;
    if (questions.length === 0) return <div className="page-loader"><p>No questions available.</p></div>;

    const q = questions[currentIndex];
    const isLast = currentIndex === questions.length - 1;
    const allAnswered = Object.keys(answers).length === questions.length;

    return (
        <div className="quiz-page">
            <div className="quiz-container">
                <div className="quiz-progress">
                    <div className="progress-bar" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
                </div>
                <p className="quiz-counter">Question {currentIndex + 1} of {questions.length}</p>
                <h3 className="quiz-question">{q.question || q.text}</h3>

                <div className="quiz-options">
                    {[1, 2, 3, 4, 5].map(val => (
                        <label key={val} className={`quiz-option ${answers[q._id] === val ? 'selected' : ''}`}>
                            <input type="radio" name={`q-${q._id}`} value={val}
                                checked={answers[q._id] === val}
                                onChange={() => handleAnswer(q._id, val)} />
                            <span className="option-label">
                                {val === 1 ? 'Strongly Disagree' : val === 2 ? 'Disagree' : val === 3 ? 'Neutral' : val === 4 ? 'Agree' : 'Strongly Agree'}
                            </span>
                        </label>
                    ))}
                </div>

                <div className="quiz-nav">
                    {currentIndex > 0 && (
                        <button className="btn btn-secondary" onClick={() => setCurrentIndex(prev => prev - 1)}>Previous</button>
                    )}
                    {!isLast ? (
                        <button className="btn btn-primary" onClick={() => setCurrentIndex(prev => prev + 1)} disabled={!answers[q._id]}>Next</button>
                    ) : (
                        <button className="btn btn-primary" onClick={handleSubmit} disabled={!allAnswered || submitting}>
                            {submitting ? 'Submitting...' : 'Submit Quiz'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
