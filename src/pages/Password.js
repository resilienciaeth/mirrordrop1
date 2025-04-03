import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Password() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isFading, setIsFading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = login(password);

        if (success) {
            setIsFading(true);
            // Wait for longer fade out animation
            await new Promise(resolve => setTimeout(resolve, 1500));
            navigate(from, { replace: true });
        } else {
            setError('Incorrect key');
            setPassword('');
        }
    };

    return (
        <div
            className={`h-screen w-screen flex items-center justify-center bg-black relative transition-all duration-[1500ms] ease-in-out ${isFading ? 'opacity-0' : 'opacity-100'}`}
        >
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat w-full h-full md:hidden"
                style={{
                    backgroundImage: 'url("/assets/bg-main-mobile.png")'
                }}
            />
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden md:block"
                style={{
                    backgroundImage: 'url("/assets/bg-desktop.png")'
                }}
            />

            {/* Overlay to ensure text is readable */}
            <div className="absolute inset-0 bg-black bg-opacity-40" />

            <div className={`relative z-10 w-full max-w-md px-6 md:px-8 transform transition-all duration-[1500ms] ease-in-out ${isFading ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`}>
                <div className="mb-8 text-center">
                    <p className="text-xl text-white italic leading-relaxed">
                        "Essence calls, Seeker of Self, and forgotten truths await.<br />
                        Enter the key, and step into the Mirror of Remembering."
                    </p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                            placeholder="Enter your key"
                            autoFocus
                        />
                        {error && (
                            <p className="text-red-400 text-sm text-center italic">{error}</p>
                        )}
                        <button
                            type="submit"
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm text-white font-medium rounded-lg border border-white/20 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 