import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Profile() {
    const { user, setUser } = useAuth();
    const [form, setForm] = useState({ name: '', gender: '', dob: '', age: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        api.get('/profile')
            .then(res => {
                const u = res.data.user;
                setForm({
                    name: u.name || '',
                    gender: u.gender || '',
                    dob: u.dob ? u.dob.slice(0, 10) : '',
                    age: u.age || '',
                });
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMsg('');
        try {
            const res = await api.put('/profile', form);
            setMsg('Profile updated successfully!');
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
        } catch (err) {
            setMsg(err.response?.data?.message || 'Error updating profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="page-loader"><div className="spinner"></div></div>;

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ maxWidth: 520 }}>
                <h2>Your Profile</h2>
                {msg && <div className="alert alert-success">{msg}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Gender</label>
                        <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Date of Birth</label>
                        <input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Age</label>
                        <input type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
                        {saving ? 'Saving...' : 'Update Profile'}
                    </button>
                </form>
                <Link to="/password-reset" className="forgot-link mt-1">Change Password →</Link>
            </div>
        </div>
    );
}
