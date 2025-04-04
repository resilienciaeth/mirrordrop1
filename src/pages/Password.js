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
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-6 py-4 
                                        bg-gradient-to-b from-gray-800 to-gray-900
                                        border-2 border-gray-600 rounded-full
                                        text-gray-300 placeholder-gray-500
                                        shadow-inner
                                        focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500
                                        transition-all duration-200"
                                placeholder="Enter your key"
                                autoFocus
                            />
                            <div className="absolute inset-0 rounded-full pointer-events-none overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50"></div>
                            </div>
                        </div>

                        {error && (
                            <p className="text-red-400 text-sm text-center italic">{error}</p>
                        )}

                        <div className="relative">
                            <button
                                type="submit"
                                className="w-full py-4 font-serif tracking-widest text-lg uppercase 
                                           bg-gradient-to-b from-gray-700 to-gray-900 
                                           border-2 border-gray-600 rounded-full
                                           shadow-[0_4px_0_rgba(0,0,0,0.3)] 
                                           text-transparent bg-clip-text 
                                           relative transform translate-y-[-1px]
                                           hover:translate-y-[0px] 
                                           hover:shadow-[0_3px_0_rgba(0,0,0,0.3)]
                                           active:translate-y-[2px]
                                           active:shadow-[0_0px_0_rgba(0,0,0,0.3)]
                                           transition-all duration-100"
                            >
                                <span className="text-transparent bg-clip-text bg-gradient-to-b from-gray-200 to-gray-400 font-semibold">
                                    UNLOCK
                                </span>
                            </button>
                            <div className="absolute inset-0 rounded-full border border-gray-800 pointer-events-none overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-white/10 opacity-30"></div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
} 