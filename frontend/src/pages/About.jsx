export default function About() {
    return (
        <div className="content-page">
            <div className="container text-center">
                <h2 className="section-title mb-4">Meet the Creators</h2>
                <p className="hero-subtitle" style={{ maxWidth: '720px', margin: '0 auto 48px' }}>
                    UnbiasMe is a blend of technical expertise and cognitive research.
                    Here are the minds behind it:
                </p>

                <div className="features-grid" style={{ maxWidth: '800px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                    {/* Sooriya Card */}
                    <div className="card text-center">
                        <h3>Sooriya</h3>
                        <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '16px', fontWeight: '600' }}>
                            Full-Stack Developer & Platform Engineer
                        </p>
                        <p>
                            Sooriya built the entire technical ecosystem of UnbiasMe — APIs,
                            database, frontend, and AI. His dedication ensures the app runs
                            fast, secure, and beautifully. Every click you make is backed by
                            his logic.
                        </p>
                        <div className="mt-4">
                            <a href="https://sooriya04.github.io/sooriya/" target="_blank" className="feature-link" rel="noreferrer">
                                Visit Sooriya's Portfolio →
                            </a>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '20px' }}>
                            <a href="https://github.com/Sooriya04" target="_blank" style={{ fontSize: '1.5rem', color: '#333' }} rel="noreferrer">
                                <i className="bi bi-github"></i> 🐙
                            </a>
                            <a href="https://www.linkedin.com/in/sooriyab/" target="_blank" style={{ fontSize: '1.5rem', color: '#0077b5' }} rel="noreferrer">
                                <i className="bi bi-linkedin"></i> 💼
                            </a>
                            <a href="https://www.instagram.com/ucdshso/" target="_blank" style={{ fontSize: '1.5rem', color: '#E1306C' }} rel="noreferrer">
                                <i className="bi bi-instagram"></i> 📸
                            </a>
                        </div>
                    </div>

                    {/* Lathika Card */}
                    <div className="card text-center">
                        <h3>Lathika</h3>
                        <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '16px', fontWeight: '600' }}>
                            Research Strategist & Content Architect
                        </p>
                        <p>
                            Lathika is the soul of UnbiasMe. With a deep understanding of
                            psychology, she shaped the idea, designed the bias logic, and
                            crafted the questions. Her insights make the learning journey
                            accurate and meaningful.
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '48px' }}>
                            <a href="https://github.com/Lathika2508" target="_blank" style={{ fontSize: '1.5rem', color: '#333' }} rel="noreferrer">
                                <i className="bi bi-github"></i> 🐙
                            </a>
                            <a href="https://www.linkedin.com/in/lathika-m-a78781303/" target="_blank" style={{ fontSize: '1.5rem', color: '#0077b5' }} rel="noreferrer">
                                <i className="bi bi-linkedin"></i> 💼
                            </a>
                            <a href="https://www.instagram.com/_.lathx_/" target="_blank" style={{ fontSize: '1.5rem', color: '#E1306C' }} rel="noreferrer">
                                <i className="bi bi-instagram"></i> 📸
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
