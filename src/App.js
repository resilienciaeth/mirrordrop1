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
  const [currentFrame, setCurrentFrame] = useState(1);
  const [framesLoaded, setFramesLoaded] = useState(false);
  const artRef = useRef(null);
  const ticking = useRef(false);
  const isMobile = window.innerWidth <= 768;
  const totalFrames = 89; // Total frames extracted from the video

  // Preload frames
  useEffect(() => {
    if (isMobile) {
      const preloadImages = Array.from({ length: totalFrames }, (_, i) => {
        const img = new Image();
        img.src = `/assets/frames/frame-${String(i + 1).padStart(3, '0')}.jpg`;
        return img;
      });

      Promise.all(preloadImages.map(img => {
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve; // Handle any loading errors gracefully
        });
      })).then(() => {
        setFramesLoaded(true);
      });
    }
  }, [isMobile]);

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

  // Throttled scroll handler with frame control for mobile
  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      window.requestAnimationFrame(() => {
        const position = window.scrollY;
        setScrollPosition(position);

        // Control frame animation on mobile
        if (isMobile) {
          const viewingSpace = 1000;
          const animationSpace = 1000;
          const progress = Math.min(Math.max((position - viewingSpace) / animationSpace, 0), 1);

          // Calculate current frame based on scroll progress
          const frame = Math.min(Math.ceil(progress * totalFrames), totalFrames);
          setCurrentFrame(frame);
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

            <div className={`mt-12 md:mt-16 opacity-0 transition-opacity duration-1000 ${currentEnvelope === 4 ? 'opacity-100' : ''}`}>
              <p className="text-base md:text-xl text-white/90 italic leading-relaxed tracking-wider px-6 md:px-0">
                It is not only about the message within the letter—<br />
                it is about the writing itself.<br />
                For tomorrow never arrives,<br />
                and so the journey is all that truly exists.<br />
                This was the ritual,<br />
                the madness,<br />
                the beauty—<br />
                that gave birth to this mirror.<br />
                This Mirror of Remembering.
              </p>
            </div>
          </div>
        </div>

        {/* Transition Text Section */}
        <div className="min-h-screen flex items-center justify-center relative bg-black">
          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8 md:space-y-12 px-6 md:px-0">
            <div className="space-y-6 md:space-y-8">
              <p className="text-lg md:text-2xl text-white italic leading-relaxed tracking-wide">
                If the storm outside begins inside,<br />
                then the calm must begin there too.
              </p>

              <p className="text-lg md:text-2xl text-white italic leading-relaxed tracking-wide">
                You are the artist of your life<br />
                Because the choice is yours. Always has been. Always will be.<br />
                You already hold the brush.
              </p>

              <p className="text-lg md:text-2xl text-white italic leading-relaxed tracking-wide">
                So paint away my friend.
              </p>

              <div className="pt-8 md:pt-12">
                <p className="text-base md:text-xl text-white/80 italic leading-relaxed tracking-wider">
                  I present to you, your<br />
                  <span className="text-lg md:text-2xl text-white tracking-widest">Letters To The Subconscious</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Art Section with frames for mobile */}
        <div className="min-h-[200vh]">
          <div className="h-screen sticky top-0 flex items-center justify-center overflow-hidden">
            {/* Frame Image */}
            <div
              className="absolute z-10 w-full max-w-3xl md:max-w-3xl flex items-center justify-center opacity-0 transition-opacity duration-500 transform-gpu"
              style={{
                opacity: scrollPosition > 1500 ? 1 : 0,
                top: isMobile ? '35%' : '50%',
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

            {/* Mobile Frame Animation */}
            {isMobile && (
              <div
                className="absolute z-20 w-full h-full flex items-center justify-center"
                style={{
                  top: '-15%'
                }}
              >
                {framesLoaded ? (
                  <img
                    src={`/assets/frames/frame-${String(currentFrame).padStart(3, '0')}.jpg`}
                    alt="Animation Frame"
                    className="w-full h-full object-contain"
                    style={{
                      maxHeight: '80vh'
                    }}
                    loading="eager"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-pulse bg-gray-800 w-full h-full" />
                  </div>
                )}
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
