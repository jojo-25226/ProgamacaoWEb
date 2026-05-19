import React, { useState } from 'react';

export default function RegisterAndLogin() {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Choose endpoint based on mode
        const endpoint = isLogin ? '/login' : '/register';
        const payload = isLogin ? { email, password } : { username, email, password };

        try {
            const response = await fetch(`http://localhost:5000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                if (isLogin) {
                    // Store the JWT token securely in the browser
                    localStorage.setItem('token', data.token);
                    alert(`Welcome back, ${data.user.username}! Token saved.`);
                } else {
                    alert('Registration successful! You can log in now.');
                    setIsLogin(true);
                }
            } else {
                alert(data.message || 'Something went wrong');
            }
        } catch (error) {
            console.error('Error connecting to backend:', error);
            alert('Could not reach the server.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc' }}>
            <h2>{isLogin ? 'Login to Facebook Clone' : 'Create Account'}</h2>
            <form onSubmit={handleSubmit}>
                {!isLogin && (
                    <div style={{ marginBottom: '10px' }}>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px' }}
                        />
                    </div>
                )}
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: '#fff', border: 'none' }}>
                    {isLogin ? 'Log In' : 'Sign Up'}
                </button>
            </form>
            <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: '#007bff', marginTop: '15px', cursor: 'pointer' }}>
                {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
            </button>
        </div>
    );
}