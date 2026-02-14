import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Discover Your <span className="highlight">Hidden Biases</span>
                    </h1>
                    <p className="hero-subtitle">
                        UnbiasMe helps you discover how your personality influences your
                        decisions by identifying the cognitive biases you may unknowingly rely
                        on. Through a research-based quiz and personalized insights, we help
                        you build self-awareness and make better choices.
                    </p>
                    <div className="hero-buttons">
                        <Link to="/quiz" className="btn btn-primary btn-lg">Begin a Quiz</Link>
                    </div>
                </div>
            </section>

            {/* Info Cards Section */}
            <section className="features-section">
                <div className="container">
                    <div className="features-grid">
                        <div className="feature-card">
                            <h3>What Are Cognitive Biases?</h3>
                            <p>
                                Cognitive biases are mental shortcuts our brain takes to help us
                                make decisions quickly. But sometimes, these shortcuts lead us to
                                think in ways that are not logical or fair. They can affect how we
                                judge people, remember things, or make choices — often without us
                                even realizing it.
                            </p>
                        </div>

                        <div className="feature-card">
                            <h3>What Are Personality Traits?</h3>
                            <p>
                                Personality traits are the patterns in how we think, feel, and
                                behave. They shape who we are — how we interact with others, handle
                                stress, solve problems, and express emotions. These traits make each
                                of us unique and influence how we see the world and make decisions.
                            </p>
                        </div>

                        <div className="feature-card">
                            <h3>How Are Personality and Bias Linked?</h3>
                            <p>
                                Your personality influences how you think — and that includes how
                                you form biases. For example, someone who avoids conflict may
                                overlook unfair behavior, while someone who seeks control might
                                judge quickly. Personality traits can shape the way we see people,
                                situations, and choices.
                            </p>
                        </div>

                        <div className="feature-card">
                            <h3>How the UnbiasMe Quiz Works?</h3>
                            <p>
                                The UnbiasMe quiz is made using ideas from real psychology research
                                to understand how your personality and thinking patterns are
                                connected. You'll answer simple multiple-choice questions based on
                                your thoughts and behavior. After the quiz, you'll get a summary of
                                your personality and any possible biases.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Daily Insights Section */}
            <section className="daily-insights">
                <div className="daily-content">
                    <h2 className="section-title" style={{ marginBottom: '16px' }}>Daily Insights to Think Better</h2>
                    <p className="hero-subtitle">
                        Start your day with a quick story that reveals how a common cognitive
                        bias can subtly influence your decisions — and learn what that bias is
                        and how to avoid it. Boost your self-awareness and make smarter
                        choices through bite-sized psychology.
                    </p>
                    <div className="hero-buttons">
                        <Link to="/story" className="btn btn-primary">📖 Read Story</Link>
                        <Link to="/bias-of-the-day" className="btn btn-secondary">🎯 Explore Bias</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
