import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function DailyMCQ() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [current, setCurrent] = useState(0);
    const [responses, setResponses] = useState([]);
    const [selected, setSelected] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [alreadyDone, setAlreadyDone] = useState(false);
    const [existingSummary, setExistingSummary] = useState('');
    const [result, setResult] = useState(null);

    const scores = { A: 1, B: 2, C: 3, D: 4, E: 5 };

    useEffect(() => {
        api.get('/daily-mcq/questions')
            .then(res => {
                if (res.data.alreadySubmitted) {
                    setAlreadyDone(true);
                    setExistingSummary(res.data.summary);
                } else {
                    setQuestions(res.data.questions || []);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSubmitAnswer = () => {
        if (!selected) return alert('Select one option.');

        const q = questions[current];
        const newResponses = [...responses, {
            text: q.text,
            options: q.options,
            userAnswer: selected,
            userScore: scores[selected],
        }];
        setResponses(newResponses);
        setSelected('');

        if (current + 1 < questions.length) {
            setCurrent(prev => prev + 1);
        } else {
            // Submit to server
            setSubmitting(true);
            api.post('/daily-mcq/submit', { questions: newResponses })
                .then(res => {
                    if (res.data.alreadySubmitted) {
                        setAlreadyDone(true);
                        setExistingSummary(res.data.message);
                    } else {
                        setResult(res.data.summary);
                    }
                    setSubmitting(false);
                })
                .catch(() => setSubmitting(false));
        }
    };

    if (loading) return <div className="page-loader"><div className="spinner"></div><p>Generating your personalized questions...</p></div>;

    if (alreadyDone) return (
        <div className="page-loader">
            <h3>You already completed today's quiz!</h3>
            <p>{existingSummary}</p>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
        </div>
    );

    if (submitting) return (
        <div className="page-loader"><div className="spinner"></div><p>Analyzing your answers and generating a summary...</p></div>
    );

    if (result) return (
        <div className="daily-mcq-result">
            <h2>Thanks, {user?.name}!</h2>
            <p className="summary-text">{result}</p>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
        </div>
    );

    if (questions.length === 0) return <div className="page-loader"><p>No questions available.</p></div>;

    const q = questions[current];

    return (
        <div className="daily-mcq-page">
            <div className="mcq-box">
                <h4>Q{current + 1}: {q.text}</h4>
                <div className="mcq-options">
                    {['A', 'B', 'C', 'D', 'E'].map(opt => (
                        <label key={opt} className={`mcq-option ${selected === opt ? 'selected' : ''}`}>
                            <input type="radio" name="option" value={opt} checked={selected === opt}
                                onChange={() => setSelected(opt)} />
                            <span>{q.options[opt]}</span>
                        </label>
                    ))}
                </div>
                <button className="btn btn-primary" onClick={handleSubmitAnswer}>Next</button>
            </div>
        </div>
    );
}
