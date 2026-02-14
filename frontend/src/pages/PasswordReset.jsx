import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function PasswordReset() {
    const { userId, resetString } = useParams();
    const isResetForm = userId && resetString;

    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRequest = async (e) => {
        e.preventDefault();
        setMsg(''); setError(''); setLoading(true);
        try {
            const res = await api.post('/auth/password-reset', { email });
            setMsg(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setMsg(''); setError(''); setLoading(true);
        try {
            const res = await api.post(`/auth/reset-password/${userId}/${resetString}`, { newPassword, confirmPassword });
            setMsg(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>{isResetForm ? 'Set New Password' : 'Reset Password'}</h2>
                {msg && <div className="alert alert-success">{msg}</div>}
                {error && <div className="alert alert-error">{error}</div>}

                {isResetForm ? (
                    <form onSubmit={handleReset}>
                        <div className="form-group">
                            <label>New Password</label>
                            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={8} required />
                        </div>
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength={8} required />
                        </div>
                        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRequest}>
                        <p className="auth-subtitle">Enter your email and we'll send you a reset link.</p>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                )}
                <Link to="/login" className="forgot-link mt-1">← Back to Login</Link>
            </div>
        </div>
    );
}
