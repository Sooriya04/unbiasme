import { Link } from 'react-router-dom';

export default function PersonalityBiasLink() {
    return (
        <div className="content-page">
            <div className="container">
                <div className="dashboard-grid">
                    {/* Main Content */}
                    <div className="content-card">
                        <h1>🔗 How Are Personality and Bias Linked?</h1>
                        <p>
                            Have you ever wondered why two people can look at the same situation and come to completely different conclusions? The answer lies in the link between your personality and your thinking patterns — especially cognitive biases.
                        </p>
                        <hr />

                        <h2>🧠 What’s a Cognitive Bias Again?</h2>
                        <p>
                            A cognitive bias is a mental shortcut your brain takes to make decisions. Sometimes helpful, often irrational. Your personality affects which biases you’re more likely to fall into.
                        </p>

                        <h2 id="affects">🌱 Why Personality Affects Bias?</h2>
                        <p>
                            Each person has a unique personality profile. These traits influence how we handle information and emotions. Because biases often arise from how we process filters, your personality traits can either protect you from certain biases or make you more vulnerable to them.
                        </p>

                        <h2 id="Mapping">🔗 Personality and Cognitive Bias Mapping</h2>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                                <thead>
                                    <tr style={{ background: '#f8f9fa', color: 'var(--primary)', textAlign: 'left' }}>
                                        <th style={{ padding: '12px' }}>Trait</th>
                                        <th style={{ padding: '12px' }}>Bias Influenced</th>
                                        <th style={{ padding: '12px' }}>Connection</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '12px' }}>Low Openness</td>
                                        <td style={{ padding: '12px' }}>Confirmation Bias</td>
                                        <td style={{ padding: '12px' }}>Prefers familiar ideas → avoids contradictory info</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '12px' }}>High Neuroticism</td>
                                        <td style={{ padding: '12px' }}>Loss Aversion</td>
                                        <td style={{ padding: '12px' }}>Strong emotional reactions → sensitive to loss</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '12px' }}>Low Conscientiousness</td>
                                        <td style={{ padding: '12px' }}>Planning Fallacy</td>
                                        <td style={{ padding: '12px' }}>Poor time management → underestimates effort</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '12px' }}>High Extraversion</td>
                                        <td style={{ padding: '12px' }}>Overconfidence</td>
                                        <td style={{ padding: '12px' }}>Assertiveness → high self-confidence</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '12px' }}>High Agreeableness</td>
                                        <td style={{ padding: '12px' }}>Herding / Conformity</td>
                                        <td style={{ padding: '12px' }}>Values harmony → follows group opinion</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h2 id="matters">💡 Why This Matters?</h2>
                        <p>Understanding this link helps you:</p>
                        <ul>
                            <li>Catch yourself when you’re thinking irrationally</li>
                            <li>Avoid common decision-making traps</li>
                            <li>Improve your emotional self-awareness</li>
                        </ul>
                        <p>It gives you a psychological edge — because you're not just reacting to life, you're understanding your reactions.</p>

                        <Link to="/" className="btn btn-secondary mt-4">← Back to Homepage</Link>
                    </div>

                    {/* Sidebar */}
                    <div className="sidebar" style={{ position: 'sticky', top: '90px', height: 'fit-content' }}>
                        <div className="card mb-4">
                            <h4>Page Navigation</h4>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                <li><a href="#affects">Why Personality Affects Bias</a></li>
                                <li><a href="#Mapping">The Mapping Table</a></li>
                                <li><a href="#matters">Why This Matters</a></li>
                            </ul>
                        </div>
                        <div className="card">
                            <h4>📚 References</h4>
                            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
                                <li style={{ marginBottom: '8px' }}><a href="#" target="_blank">Rashidi et al. (2021)</a></li>
                                <li style={{ marginBottom: '8px' }}><a href="#" target="_blank">Stanovich & West (2000)</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
