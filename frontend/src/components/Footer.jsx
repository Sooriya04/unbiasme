import { Link, useLocation } from 'react-router-dom';

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const location = useLocation();

    if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/quiz') {
        return null; // Simplified footer or hidden on auth/quiz pages if desired
    }

    return (
        <footer className="footer">
            <div className="footer-inner">
                <Link to="/" className="footer-logo">UnbiasMe</Link>

                <div className="footer-links">
                    <Link to="/">Home</Link>
                    <Link to="/about">About Us</Link>
                    <Link to="/contact">Contact</Link>
                    <Link to="/privacy">Privacy Policy</Link>
                    <Link to="/terms">Terms</Link>
                </div>

                <div className="footer-copy">
                    © {currentYear} UnbiasMe, Inc. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
