import { Link } from 'react-router-dom';

export default function WhatAreCognitiveBiases() {
    return (
        <div className="content-page">
            <div className="container">
                <div className="dashboard-grid">
                    {/* Main Content */}
                    <div className="content-card">
                        <h1>🧠 What Are Cognitive Biases?</h1>
                        <p className="lead text-muted">
                            Cognitive biases are predictable mental shortcuts or errors in thinking that influence how individuals perceive and judge information. Rather than making purely rational decisions, people often rely on these mental shortcuts—shaped by emotion, memory, personality traits, and context—which can lead to systematic errors in reasoning and behavior.
                        </p>
                        <hr />

                        <h4>For example:</h4>
                        <ul>
                            <li>Individuals high in Neuroticism tend to exhibit loss aversion and the availability heuristic, as they are more emotionally reactive and sensitive to negative outcomes.</li>
                            <li>Those with low Openness are more prone to confirmation bias, preferring familiar information and avoiding contradiction.</li>
                            <li>Highly Extraverted and Agreeable individuals are more susceptible to groupthink and social conformity, valuing group harmony over independent judgment.</li>
                        </ul>

                        <blockquote style={{ borderLeft: '4px solid var(--primary)', paddingLeft: '16px', fontStyle: 'italic', margin: '24px 0', color: 'var(--text-muted)' }}>
                            🔬 According to Rashidi et al. (2021) and models developed by Stanovich, certain people are more vulnerable to specific biases based on their trait scores. These associations enable personalized interventions to improve reasoning and reduce bias susceptibility.
                        </blockquote>

                        <h2 id="example-real">🧪 Real-Life Examples of Cognitive Biases</h2>
                        <ol>
                            <li><strong>Anchoring Bias:</strong><br />
                                When buying a car, you see the original price is ₹10,00,000. Even if the seller offers ₹8,50,000, you think it's a good deal—because your brain is "anchored" to the original number.</li>

                            <li><strong>Loss Aversion:</strong><br />
                                You decide not to invest in a startup because you’re more afraid of losing money than excited about potential profits.</li>

                            <li><strong>Confirmation Bias:</strong><br />
                                If you believe that exercise is better than dieting for weight loss, you’re more likely to read articles that support your view and ignore others.</li>

                            <li><strong>Planning Fallacy:</strong><br />
                                You believe you can finish a school project in 2 days, even though similar tasks previously took a week.</li>

                            <li><strong>Groupthink:</strong><br />
                                In a team meeting, everyone agrees to a flawed plan because nobody wants to be the one to disagree and disrupt group harmony.</li>
                        </ol>

                        <h2 id="types-bias">Types of Cognitive Biases (Common Types)</h2>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                                <thead>
                                    <tr style={{ background: '#f8f9fa', color: 'var(--primary)', textAlign: 'left' }}>
                                        <th style={{ padding: '12px' }}>Bias Name</th>
                                        <th style={{ padding: '12px' }}>What It Is</th>
                                        <th style={{ padding: '12px' }}>Simple Example</th>
                                        <th style={{ padding: '12px' }}>Why It Happens</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '12px' }}>Anchoring Bias</td>
                                        <td style={{ padding: '12px' }}>Relying too much on the first piece of info.</td>
                                        <td style={{ padding: '12px' }}>Buying a "sale" item because original price was high.</td>
                                        <td style={{ padding: '12px' }}>Brain uses first number as reference point.</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '12px' }}>Confirmation Bias</td>
                                        <td style={{ padding: '12px' }}>Seeking info that confirms beliefs.</td>
                                        <td style={{ padding: '12px' }}>Only reading news that agrees with you.</td>
                                        <td style={{ padding: '12px' }}>Brain avoids discomfort of being wrong.</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '12px' }}>Overconfidence Bias</td>
                                        <td style={{ padding: '12px' }}>Overestimating one's abilities.</td>
                                        <td style={{ padding: '12px' }}>Thinking you'll ace a test without studying.</td>
                                        <td style={{ padding: '12px' }}>People overestimate what they know.</td>
                                    </tr>
                                    {/* Reduced table for brevity, but captured main ones */}
                                </tbody>
                            </table>
                        </div>

                        <h2 id="matters">🎯 Why It Matters</h2>
                        <p>Understanding cognitive biases helps improve:</p>
                        <ul>
                            <li><strong>Self-awareness:</strong> Know your own blind spots.</li>
                            <li><strong>Decision-making:</strong> Avoid costly mental errors in work, finance, and relations.</li>
                            <li><strong>System design:</strong> Apps can adapt to your bias profile.</li>
                            <li><strong>Mental health:</strong> Reduce overthinking and emotional reactivity.</li>
                        </ul>

                        <Link to="/" className="btn btn-secondary mt-4">← Back to Homepage</Link>
                    </div>

                    {/* Sidebar */}
                    <div className="sidebar" style={{ position: 'sticky', top: '90px', height: 'fit-content' }}>
                        <div className="card mb-4">
                            <h4>Page Navigation</h4>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                <li><a href="#example-real">Real-Life Examples</a></li>
                                <li><a href="#types-bias">Types of Biases</a></li>
                                <li><a href="#matters">Why It Matters</a></li>
                            </ul>
                        </div>

                        <div className="card">
                            <h4>📚 References</h4>
                            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
                                <li style={{ marginBottom: '8px' }}><a href="#" target="_blank">Stanovich & West (2000)</a></li>
                                <li style={{ marginBottom: '8px' }}><a href="#" target="_blank">Tversky & Kahneman (1974)</a></li>
                                <li style={{ marginBottom: '8px' }}><a href="#" target="_blank">Rashidi et al. (2021)</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
