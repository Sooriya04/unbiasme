import { Link } from 'react-router-dom';

export default function WhatArePersonalityTraits() {
    return (
        <div className="content-page">
            <div className="container">
                <div className="dashboard-grid">
                    {/* Main Content */}
                    <div className="content-card">
                        <h1>🧬 What Are Personality Traits?</h1>
                        <p>
                            Personality traits are the basic building blocks that make you you. They describe the general ways you tend to think, feel, and behave over time and across different situations.
                        </p>
                        <hr />
                        <p>
                            Have you ever wondered why some people love meeting new people while others prefer quiet alone time? Or why some people are naturally organized while others are more spontaneous? These consistent patterns in behavior are what psychologists call personality traits.
                        </p>

                        <h2 id="why-matters">🌍 Why Do Personality Traits Matter?</h2>
                        <p>Personality traits help us:</p>
                        <ul>
                            <li>Understand ourselves better</li>
                            <li>Predict how we might behave in different situations</li>
                            <li>Improve how we relate to others—at school, work, or in relationships</li>
                        </ul>
                        <p>
                            Psychologists have studied personality for decades and found that most people can be described using five major traits. This idea is called the Big Five Personality Traits, or the OCEAN model.
                        </p>

                        <h2 id="table">🌟 The Big Five Personality Traits</h2>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                                <thead>
                                    <tr style={{ background: '#f8f9fa', color: 'var(--primary)', textAlign: 'left' }}>
                                        <th style={{ padding: '12px' }}>Trait</th>
                                        <th style={{ padding: '12px' }}>What It Means</th>
                                        <th style={{ padding: '12px' }}>High Trait Example</th>
                                        <th style={{ padding: '12px' }}>Low Trait Example</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '12px' }}>Openness</td>
                                        <td style={{ padding: '12px' }}>Curiosity, creativity</td>
                                        <td style={{ padding: '12px' }}>Loves trying new things</td>
                                        <td style={{ padding: '12px' }}>Prefers routine</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '12px' }}>Conscientiousness</td>
                                        <td style={{ padding: '12px' }}>Organization, discipline</td>
                                        <td style={{ padding: '12px' }}>Always on time</td>
                                        <td style={{ padding: '12px' }}>Often forgets tasks</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '12px' }}>Extraversion</td>
                                        <td style={{ padding: '12px' }}>Energy, sociability</td>
                                        <td style={{ padding: '12px' }}>Loves crowds</td>
                                        <td style={{ padding: '12px' }}>Prefers quiet</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '12px' }}>Agreeableness</td>
                                        <td style={{ padding: '12px' }}>Compassion, cooperation</td>
                                        <td style={{ padding: '12px' }}>Avoids conflict</td>
                                        <td style={{ padding: '12px' }}>Skeptical of others</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '12px' }}>Neuroticism</td>
                                        <td style={{ padding: '12px' }}>Emotional sensitivity</td>
                                        <td style={{ padding: '12px' }}>Gets anxious easily</td>
                                        <td style={{ padding: '12px' }}>Stays calm under stress</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h2 id="where">🔬 Where Do These Traits Come From?</h2>
                        <p>These traits are not random. They come from a mix of:</p>
                        <ul>
                            <li>Genetics (traits you’re born with)</li>
                            <li>Life experiences (how you’re raised, what happens to you)</li>
                            <li>Culture (what your society teaches you to value)</li>
                        </ul>

                        <h2 id="how-traits">🧪 How Are These Traits Measured?</h2>
                        <p>Psychologists use short questionnaires like BFI-10 (Big Five Inventory) or TIPI. These are reliable, research-backed tools.</p>

                        <h2 id="why">✨ Why Learn About Your Personality?</h2>
                        <p>Knowing your traits helps you make better decisions and grow into the person you want to become. Whether you’re naturally introverted or highly organized, there's no “good” or “bad” trait. It’s all about understanding yourself.</p>

                        <Link to="/" className="btn btn-secondary mt-4">← Back to Homepage</Link>
                    </div>

                    {/* Sidebar */}
                    <div className="sidebar" style={{ position: 'sticky', top: '90px', height: 'fit-content' }}>
                        <div className="card mb-4">
                            <h4>Page Navigation</h4>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                <li><a href="#why-matters">Why Traits Matter</a></li>
                                <li><a href="#table">The Big Five Table</a></li>
                                <li><a href="#where">Origins of Traits</a></li>
                                <li><a href="#how-traits">Measurement</a></li>
                            </ul>
                        </div>

                        <div className="card">
                            <h4>📚 References</h4>
                            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
                                <li style={{ marginBottom: '8px' }}><a href="#" target="_blank">Goldberg (1993)</a></li>
                                <li style={{ marginBottom: '8px' }}><a href="#" target="_blank">McCrae & Allik (2002)</a></li>
                                <li style={{ marginBottom: '8px' }}><a href="#" target="_blank">Rammstedt & John (2007)</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
