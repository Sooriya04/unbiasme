import { useState } from 'react';
import api from '../api/axios';

export default function Contact() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus('');
        try {
            const res = await api.post('/contact', form);
            setStatus(res.data.message || 'Message sent successfully!');
            setForm({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            setStatus(err.response?.data?.message || 'Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ maxWidth: 640 }}>
                <h2>Get in Touch with Us</h2>
                <p className="auth-subtitle">
                    We’re here to help. Whether you have a question, suggestion, or just
                    want to say hello, feel free to reach out!
                </p>

                <div className="text-center mb-4" style={{ backgroundColor: 'var(--bg-input)', padding: '16px', borderRadius: '8px' }}>
                    <p style={{ marginBottom: '8px' }}>
                        📩 Email us directly at <strong>support@unbiasme.com</strong>
                    </p>
                    <p style={{ margin: 0 }}>
                        ⏱️ We usually respond within 24–48 business hours.
                    </p>
                    <small className="text-muted d-block mt-2">Need something urgent? Mention "URGENT" in your subject line.</small>
                </div>

                {status && <div className="alert alert-success">{status}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Subject</label>
                        <input
                            type="text"
                            value={form.subject}
                            onChange={e => setForm({ ...form, subject: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Your Message</label>
                        <textarea
                            rows={4}
                            value={form.message}
                            onChange={e => setForm({ ...form, message: e.target.value })}
                            required
                        ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? 'Sending Message...' : 'Send Message'}
                    </button>
                </form>
            </div>
        </div>
    );
}
