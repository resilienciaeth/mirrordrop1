import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Password } from './pages/Password';

function Home() {
  const [currentEnvelope, setCurrentEnvelope] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const artRef = useRef(null);
  const videoRef = useRef(null);
  const ticking = useRef(false);
  const isMobile = window.innerWidth <= 768;

  const handleEnvelopeClick = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentEnvelope(1);
    }
  };

  useEffect(() => {
    if (isAnimating && currentEnvelope < 4) {
      const timer = setTimeout(() => {
        setCurrentEnvelope(prev => prev + 1);
      }, 200);

      return () => clearTimeout(timer);
    } else if (currentEnvelope === 4) {
      setIsAnimating(false);
    }
  }, [currentEnvelope, isAnimating]);

  // Fade in effect on mount with longer delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Throttled scroll handler with video control for mobile
  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      window.requestAnimationFrame(() => {
        const position = window.scrollY;
        setScrollPosition(position);

        // Control video playback on mobile
        if (isMobile && videoRef.current) {
          const viewingSpace = 1000;
          const animationSpace = 1000;
          const progress = Math.min(Math.max((position - viewingSpace) / animationSpace, 0), 1);

          // Calculate video time based on scroll progress
          const videoDuration = videoRef.current.duration || 1;
          videoRef.current.currentTime = progress * videoDuration;
        }

        ticking.current = false;
      });
      ticking.current = true;
    }
  }, [isMobile]);

  // Handle scroll effect with passive listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Calculate art transform (now only for desktop)
  const calculateArtTransform = useCallback(() => {
    if (isMobile) {
      return {
        opacity: 0 // Hide the transform-based art on mobile
      };
    }

    const viewingSpace = 1000;
    const animationSpace = 1000;

    if (scrollPosition <= viewingSpace) {
      return {
        transform: `translate3d(0, 0, 0) scale(1)`,
        opacity: 1,
        willChange: 'transform'
      };
    }

    const rawProgress = (scrollPosition - viewingSpace) / animationSpace;
    const progress = Math.min(Math.max(rawProgress, 0), 1);
    const scale = 1 - (progress * 0.55);
    const yOffset = progress * 10.5;

    return {
      transform: `translate3d(0, ${yOffset}vh, 0) scale(${scale})`,
      opacity: 1,
      willChange: 'transform'
    };
  }, [scrollPosition, isMobile]);

  // Smooth easing function
  const easeOutCubic = (x) => {
    return 1 - Math.pow(1 - x, 3);
  };

  return (
    <>
      <div className="min-h-[200vh] md:min-h-[300vh] bg-black will-change-scroll">
        {/* First Section - Envelope */}
        <div
          className={`min-h-screen flex items-center justify-center relative transition-all duration-[1500ms] ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'
            }`}
          style={{
            backgroundImage: 'url("/assets/bg-main-desktop.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Overlay to ensure content is readable */}
          <div className="absolute inset-0 bg-black/40" />

          <div className={`relative z-10 max-w-2xl mx-auto text-center space-y-12 md:space-y-16 py-24 md:py-32 transform transition-all duration-[1500ms] ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
            <p className="text-lg md:text-2xl text-white italic leading-relaxed tracking-wide px-6 md:px-0">
              "Because true art is not a decoration.<br />
              True art does not hang dead in silence—<br />
              it stares back at you, unflinching and raw,<br />
              revealing the depths of who you truly are.<br />
              True art…<br />
              is a mirror."
            </p>

            <p className="text-base md:text-xl text-white/90 italic leading-relaxed tracking-wider px-6 md:px-0">
              Your Letters to the Subconscious await,<br />
              Seeker of Self.
            </p>

            <div className="mt-8 px-6 md:px-0">
              <img
                src={`/assets/envelope-${currentEnvelope}.png`}
                alt="Envelope"
                className={`mx-auto w-auto h-auto max-w-full transition-all duration-200 ${!isAnimating && currentEnvelope === 0 ? 'hover:scale-105 cursor-pointer' : ''
                  }`}
                onClick={handleEnvelopeClick}
              />
            </div>
          </div>
        </div>

        {/* Art Section with video for mobile */}
        <div className="min-h-[200vh]">
          <div className="h-screen sticky top-0 flex items-start justify-center overflow-hidden">
            {/* Frame Image */}
            <div
              className="absolute z-10 w-full max-w-3xl md:max-w-3xl flex items-center justify-center opacity-0 transition-opacity duration-500 transform-gpu"
              style={{
                opacity: scrollPosition > 1500 ? 1 : 0,
                top: '50%',
                transform: 'translateY(-50%)',
                willChange: 'opacity'
              }}>
              <img
                src="/assets/frame-2.png"
                alt="Art Frame"
                className="w-full h-auto"
                loading="eager"
              />
            </div>

            {/* Mobile Video Animation */}
            {isMobile && (
              <div className="absolute z-20 w-full h-full">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  src="/assets/video.mov"
                  playsInline
                  muted
                  preload="auto"
                  style={{
                    objectFit: 'contain'
                  }}
                />
              </div>
            )}

            {/* Desktop Transform Animation */}
            <div
              ref={artRef}
              className="absolute z-20 w-full max-w-[90vh] md:max-w-[90vh] transition-all duration-100 transform-gpu"
              style={calculateArtTransform()}
            >
              <img
                src="/assets/art.JPEG"
                alt="Artwork"
                className="w-full h-auto object-cover"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Button */}
      <div className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] md:w-auto">
        <button
          className="group relative w-full md:w-auto px-4 md:px-8 py-3 md:py-4 bg-black/80 backdrop-blur-md rounded-full border border-white/10 
                     text-white hover:bg-black/90 transition-all duration-300
                     flex items-center justify-center md:justify-start gap-2"
        >
          <span className="relative z-10 text-xs md:text-sm font-light tracking-wide">
            1/100 Mirrors <span className="underline underline-offset-4">Claimed</span>. Acquire <span className="underline underline-offset-4">Yours</span>
          </span>
          <svg
            className="w-3 h-3 md:w-4 md:h-4 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>

          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>
    </>
  );
}

// Wrapper for the password route that redirects to home if already authenticated
function PasswordWrapper() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Password />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Password protection page */}
          <Route path="/password" element={<PasswordWrapper />} />

          {/* Protected home route */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Catch all other routes and redirect to password page */}
          <Route path="*" element={<Navigate to="/password" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
