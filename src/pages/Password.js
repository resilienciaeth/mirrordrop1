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
            {/* Removing the background images and just keeping a solid black background */}
            {/* Overlay to ensure text is readable - changed to full black */}
            <div className="absolute inset-0 bg-black" />

            <div className={`relative z-10 w-full max-w-lg px-6 md:px-8 transform transition-all duration-[1500ms] ease-in-out ${isFading ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`}>
                <div className="mb-8 text-center">
                    <p className="text-xl text-white italic leading-relaxed">
                        "Essence calls, Seeker of Self, and forgotten truths await.<br />
                        Enter the key, and step into the Mirror of Remembering."
                    </p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-2 py-2 
                                        bg-transparent
                                        border-b-2 border-gray-500
                                        text-gray-300 placeholder-gray-500
                                        focus:outline-none focus:border-white
                                        transition-all duration-200"
                                placeholder="Enter your key"
                                autoFocus
                            />
                        </div>

                        {error && (
                            <p className="text-red-400 text-sm text-center italic">{error}</p>
                        )}

                        <div className="relative mt-8">
                            <button
                                type="submit"
                                className="w-full py-2 font-serif tracking-widest text-lg uppercase 
                                           bg-transparent 
                                           border-b-2 border-gray-500
                                           text-white
                                           hover:border-white
                                           transition-all duration-200"
                            >
                                UNLOCK
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
} 