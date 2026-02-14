import { useSearchParams, Link } from 'react-router-dom';

export default function Verified() {
    const [params] = useSearchParams();
    const status = params.get('status');
    const message = params.get('message');

    const isSuccess = status === 'success';

    return (
        <div className="auth-page">
            <div className="auth-card text-center">
                <div style={{ fontSize: 64 }}>{isSuccess ? '✅' : '❌'}</div>
                <h2>{isSuccess ? 'Email Verified!' : 'Verification Failed'}</h2>
                <p>{isSuccess ? 'Your email has been verified. You can now log in.' : message || 'Something went wrong.'}</p>
                <Link to="/login" className="btn btn-primary btn-full">Go to Login</Link>
            </div>
        </div>
    );
}
