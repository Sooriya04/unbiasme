import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import api from '../api/axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');

    const fetchDashboard = async () => {
        try {
            const res = await api.get('/dashboard');
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashboard(); }, []);

    const handleGenerateAnalysis = async () => {
        setGenerating(true);
        try {
            await api.post('/dashboard/generate-analysis');
            await fetchDashboard();
        } catch (err) {
            setError('Failed to generate analysis. Retrying...');
            setTimeout(handleGenerateAnalysis, 3000);
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return <div className="page-loader"><div className="spinner"></div><p>Loading dashboard...</p></div>;
    if (error && !data) return <div className="page-loader"><p className="text-error">{error}</p></div>;
    if (!data) return null;

    const { username, user, geminiData, traitScores, missingTraitScores, analysisPending, quizHistory, hasTodayQuiz } = data;

    // Trait chart data
    const traitLabels = Object.keys(traitScores || {});
    const traitValues = Object.values(traitScores || {});
    const traitChartData = {
        labels: traitLabels,
        datasets: [{ label: 'Trait Score (%)', data: traitValues, backgroundColor: ['#6c5ce7', '#00b894', '#fdcb6e', '#e17055', '#d63031'], borderRadius: 6 }],
    };
    const traitChartOptions = {
        responsive: true, maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' } } },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.parsed.y + '%' } } },
    };

    // Quiz history chart data
    const quizLabels = (quizHistory || []).map(e => new Date(e.date).toLocaleDateString());
    const quizScores = (quizHistory || []).map(e => e.totalScore);
    const quizChartData = {
        labels: quizLabels,
        datasets: [{
            label: 'Score', data: quizScores, borderColor: '#6c5ce7', backgroundColor: 'rgba(108,92,231,0.15)',
            tension: 0.3, fill: true, pointRadius: 5, pointBackgroundColor: '#6c5ce7', borderWidth: 3,
        }],
    };
    const quizChartOptions = {
        responsive: true, maintainAspectRatio: false,
        scales: {
            y: { beginAtZero: true, suggestedMax: 15, title: { display: true, text: 'Score (out of 15)' } },
            x: { title: { display: true, text: 'Date' } },
        },
    };

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="dashboard-header">
                    <h2>Welcome, {username} 👋</h2>
                    <p className="text-muted">Here's your personal growth overview.</p>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-main">
                        {/* Analysis pending */}
                        {!missingTraitScores && analysisPending && (
                            <div className="card mb-4">
                                {generating ? (
                                    <div className="text-center"><div className="spinner"></div><p>Generating your analysis...</p></div>
                                ) : (
                                    <div className="text-center">
                                        <p>✨ Your analysis is ready to generate.</p>
                                        <button className="btn btn-primary" onClick={handleGenerateAnalysis}>Generate Analysis</button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Gemini Analysis Results */}
                        {geminiData && geminiData.summary && (
                            <>
                                <div className="card mb-4">
                                    <h3>🧠 Personality Summary</h3>
                                    <p className="summary-text">{geminiData.summary}</p>
                                </div>

                                {geminiData.workplace && (
                                    <div className="card mb-4">
                                        <h3>💼 Workplace Insights</h3>
                                        <p><strong>🏢 Ideal Environment:</strong> {geminiData.workplace.environment}</p>
                                        <p><strong>🌟 Strengths:</strong> {geminiData.workplace.strengths}</p>
                                        <p><strong>⚠️ Challenges:</strong> {geminiData.workplace.challenges}</p>
                                    </div>
                                )}

                                {geminiData.biases && geminiData.biases.length > 0 && (
                                    <div className="card mb-4">
                                        <h3>🎯 Cognitive Biases to Watch</h3>
                                        {geminiData.biases.map((bias, i) => (
                                            <div key={i} className="bias-item">
                                                <h4>{i + 1}. <strong>{bias.name}</strong></h4>
                                                <p>{bias.description}</p>
                                                <p className="text-sm"><strong>Tip:</strong> {bias.prevention}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Quiz History Chart */}
                        {quizHistory && quizHistory.length > 0 && (
                            <div className="card">
                                <h3>Daily Quiz History</h3>
                                <div className="chart-container"><Line data={quizChartData} options={quizChartOptions} /></div>
                            </div>
                        )}
                    </div>

                    <div className="dashboard-sidebar">

                        <div className="card mb-4">
                            <h3>Actions</h3>
                            <Link to="/profile" className="btn btn-secondary btn-full mb-2">Manage Profile</Link>
                        </div>

                        {/* Trait Chart */}
                        {traitLabels.length > 0 && (
                            <div className="card mb-4">
                                <h3>📊 Traits</h3>
                                <div className="chart-container-sm"><Bar data={traitChartData} options={traitChartOptions} /></div>
                            </div>
                        )}

                        {/* Alerts */}
                        {user && (!user.age || !user.dob || !user.gender) && (
                            <div className="alert alert-warning mb-4">
                                ⚠️ Complete your profile for better insights.
                            </div>
                        )}

                        {!hasTodayQuiz && (
                            <div className="alert alert-info">
                                📝 <Link to="/daily-mcq">Take today's quiz</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
