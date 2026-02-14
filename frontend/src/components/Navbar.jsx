import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="navbar">
            <nav className="navbar-inner">
                <Link to="/" className="navbar-logo">UnbiasMe</Link>
                <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
                    <span></span><span></span><span></span>
                </button>
                <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
                    <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
                    <Link to="/about" onClick={() => setMenuOpen(false)}>About Us</Link>
                    <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact Us</Link>
                    {user ? (
                        <>
                            <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                            <button className="nav-logout-btn" onClick={() => { handleLogout(); setMenuOpen(false); }}>Logout</button>
                        </>
                    ) : (
                        <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
                    )}
                </div>
            </nav>
        </header>
    );
}
