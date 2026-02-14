import { Link } from 'react-router-dom';

export default function HowQuizWorks() {
    return (
        <div className="content-page">
            <div className="container">
                <div className="dashboard-grid">
                    {/* Main Content */}
                    <div className="content-card">
                        <h1>🧠 How the UnbiasMe Quiz Works</h1>
                        <p>
                            Welcome to UnbiasMe! Our quiz is designed to help you explore your personality traits and understand how they might influence the way you think, feel, and even the biases you may unknowingly carry.
                        </p>
                        <hr />

                        <h2 id="understanding">Understanding the Big Five Personality Traits</h2>
                        <p>Our quiz is based on the Big Five Personality Model, a widely accepted framework in psychology. It includes five major personality traits:</p>
                        <ol>
                            <li><strong>Openness to Experience</strong> – Your curiosity, imagination, and love for new ideas.</li>
                            <li><strong>Conscientiousness</strong> – Your organization, discipline, and goal-oriented behavior.</li>
                            <li><strong>Extraversion</strong> – Your sociability, energy, and assertiveness.</li>
                            <li><strong>Agreeableness</strong> – Your kindness, empathy, and cooperation with others.</li>
                            <li><strong>Neuroticism</strong> – Your tendency to experience stress, anxiety, or emotional ups and downs.</li>
                        </ol>

                        <h2 id="Scenario-Based">Scenario-Based Questions</h2>
                        <p>You won’t find generic personality test questions here. Instead, we use real-life scenarios that reflect how you might react in everyday situations:</p>
                        <ul>
                            <li>Each scenario gives you six statements (e.g., how you might think or feel in that situation).</li>
                            <li>You rate how well each one describes you on a scale from 1 (Not Like Me) to 5 (Very Much Like Me).</li>
                            <li>Each statement corresponds to one of the Big Five traits.</li>
                        </ul>

                        <h2 id="Scoring">Scoring and Trait Analysis</h2>
                        <p>Once you complete all the scenarios:</p>
                        <ul>
                            <li>Your responses are grouped by trait.</li>
                            <li>We calculate a score for each trait based on how you responded to all related questions.</li>
                            <li>These scores tell us how high or low you fall on each of the Big Five traits.</li>
                        </ul>

                        <h2 id="Interpretation">Personalized Interpretation</h2>
                        <p>Using your trait scores, we generate a custom personality report that explains what each trait means in your life and how your specific combination of traits makes you unique.</p>

                        <h2 id="Linking">Linking Personality with Bias</h2>
                        <p>
                            Your personality traits influence how you interpret the world, and that affects the cognitive biases you're more likely to have.
                        </p>
                        <ul>
                            <li>High Openness might make you prone to confirmation bias.</li>
                            <li>Low Conscientiousness might relate to planning fallacy.</li>
                        </ul>
                        <p>We help you understand which of the 12 most common cognitive biases your personality may be linked to.</p>

                        <Link to="/" className="btn btn-secondary mt-4">← Back to Homepage</Link>
                    </div>

                    {/* Sidebar */}
                    <div className="sidebar" style={{ position: 'sticky', top: '90px', height: 'fit-content' }}>
                        <div className="card mb-4 bg-light">
                            <h4>About UnbiasMe</h4>
                            <p className="text-muted small">
                                UnbiasMe is a self-awareness tool that helps you understand how your personality influences the way you think and make decisions. Using science-backed assessments, we aim to make thinking clearer for everyone.
                            </p>
                        </div>

                        <div className="card">
                            <h4>Page Navigation</h4>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                <li><a href="#understanding">Big Five Traits</a></li>
                                <li><a href="#Scenario-Based">Scenario Questions</a></li>
                                <li><a href="#Scoring">Scoring</a></li>
                                <li><a href="#Interpretation">Interpretation</a></li>
                                <li><a href="#Linking">Bias Linking</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
