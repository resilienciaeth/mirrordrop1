import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Password } from './pages/Password';

function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(1);
  const [contentUnlocked, setContentUnlocked] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(true);
  const [framesLoaded, setFramesLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState([]);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const ticking = useRef(false);
  const lastScrollY = useRef(0);
  const lastFrameUpdate = useRef(0);
  const requestRef = useRef(null);
  const animationFrameId = useRef(null);
  const isMobile = window.innerWidth <= 768;
  const totalFrames = 59; // Total frames for art animation

  // Preload frames for art animation with improved loading strategy
  useEffect(() => {
    const cachedImages = [];
    let loadedCount = 0;

    const updateLoadingProgress = () => {
      loadedCount++;
      if (loadedCount === totalFrames) {
        setFramesLoaded(true);
        setPreloadedImages(cachedImages);
        console.log('All frames loaded');
      }
    };

    // Load images with high priority for the first few frames
    const loadImage = (index) => {
      const img = new Image();
      const frameNum = String(index).padStart(3, '0');
      img.src = `/assets/frames/frame-${frameNum}.jpg`;
      img.decoding = index <= 10 ? 'sync' : 'async'; // Prioritize first frames
      img.onload = updateLoadingProgress;
      img.onerror = updateLoadingProgress;
      cachedImages[index - 1] = img;
    };

    // Load first 10 frames immediately, then load the rest
    for (let i = 1; i <= Math.min(10, totalFrames); i++) {
      loadImage(i);
    }

    // Delay loading the rest slightly to prioritize initial frames
    setTimeout(() => {
      for (let i = 11; i <= totalFrames; i++) {
        loadImage(i);
      }
    }, 200);

    return () => {
      // Clear any in-flight image loads if component unmounts
      cachedImages.forEach(img => {
        if (img) {
          img.onload = null;
          img.onerror = null;
        }
      });
    };
  }, [totalFrames]);

  // Fade in effect on mount with longer delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Handle audio play/pause
  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(err => {
        console.error('Error playing audio:', err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  // Update isPlaying state when audio ends
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleAudioEnd = () => {
        setIsPlaying(false);
      };

      audio.addEventListener('ended', handleAudioEnd);
      return () => {
        audio.removeEventListener('ended', handleAudioEnd);
      };
    }
  }, []);

  // Handle video end
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleVideoEnd = () => {
        setContentUnlocked(true);
        document.body.style.overflow = 'auto'; // Re-enable main scroll
      };

      // Ensure this runs after the video element is fully set up
      video.addEventListener('ended', handleVideoEnd);

      return () => {
        video.removeEventListener('ended', handleVideoEnd);
      };
    }
  }, []);

  // Handle video playback and completion
  const handleVideoPlay = () => {
    const video = videoRef.current;
    if (video) {
      setShowPlayButton(false);

      // Make sure video has proper event listeners before playing
      video.addEventListener('ended', () => {
        setContentUnlocked(true);
        document.body.style.overflow = 'auto';
      }, { once: true });

      // Play the video
      video.play().catch(err => {
        console.error('Error playing video:', err);
        // If autoplay is blocked, show a message
        alert('Please click the video to play it manually.');
      });
    }
  };

  // Prevent main scroll until content is unlocked
  useEffect(() => {
    document.body.style.overflow = contentUnlocked ? 'auto' : 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [contentUnlocked]);

  // Optimized scroll animation
  const animateScroll = useCallback(() => {
    const position = window.scrollY;

    // Don't update state unnecessarily
    if (Math.abs(position - lastScrollY.current) < 5) {
      // Schedule next frame if we're still scrolling
      animationFrameId.current = requestAnimationFrame(animateScroll);
      return;
    }

    const now = Date.now();
    lastScrollY.current = position;

    // Add a time-based throttle to prevent too many updates
    if (now - lastFrameUpdate.current < 16) { // ~60fps (1000ms/60 ≈ 16ms)
      animationFrameId.current = requestAnimationFrame(animateScroll);
      return;
    }

    lastFrameUpdate.current = now;
    setScrollPosition(position);

    // Calculate which frame to show based on scroll position
    const viewingSpace = isMobile ? 1000 : 1500;
    const animationSpace = 1000;
    const progress = Math.min(Math.max((position - viewingSpace) / animationSpace, 0), 1);

    // Use smooth easing function for more natural animation
    const easedProgress = easeOutCubic(progress);
    const frameNumber = Math.min(Math.ceil(easedProgress * totalFrames), totalFrames);

    if (frameNumber !== currentFrame) {
      setCurrentFrame(frameNumber);
    }

    // Continue animation loop if we're still scrolling
    animationFrameId.current = requestAnimationFrame(animateScroll);
  }, [currentFrame, isMobile, totalFrames]);

  // Improved scroll handler with debounce
  const handleScroll = useCallback(() => {
    if (!contentUnlocked) return;

    // Cancel any existing animation frame request
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }

    // Start the animation loop
    animationFrameId.current = requestAnimationFrame(animateScroll);

    // Set a timeout to stop the animation after scrolling stops
    clearTimeout(requestRef.current);
    requestRef.current = setTimeout(() => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    }, 100);
  }, [animateScroll, contentUnlocked]);

  // Cleanup animation frames on unmount
  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (requestRef.current) {
        clearTimeout(requestRef.current);
      }
    };
  }, []);

  // Handle scroll effect with optimized event listener
  useEffect(() => {
    if (contentUnlocked) {
      // Use the scroll event with passive flag for better performance
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
        if (requestRef.current) clearTimeout(requestRef.current);
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      };
    }
  }, [handleScroll, contentUnlocked]);

  // Smooth easing function for animation
  const easeOutCubic = (x) => {
    return 1 - Math.pow(1 - x, 3);
  };

  return (
    <>
      <div className={`min-h-[250vh] md:min-h-[300vh] bg-black will-change-scroll ${!contentUnlocked ? 'overflow-hidden' : ''}`}>
        {/* First Section - Video */}
        <div className="h-screen relative bg-black overflow-y-auto">
          <div className="absolute inset-0 flex items-start justify-center overflow-y-auto">
            {/* Video container */}
            <div className="relative w-ful max-w-2xl mx-auto text-center pt-8 md:pt-12 pb-16">
              <div className={`relative mt-14 z-10 max-w-2xl mx-auto text-center space-y-8 md:space-y-12 px-6 md:px-0 transform transition-all duration-[1500ms] ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <p className="text-lg md:text-2xl text-white italic leading-relaxed tracking-wide">
                  "Because true art is not a decoration.<br />
                  True art does not hang dead in silence—<br />
                  it stares back at you, unflinching and raw,<br />
                  revealing the depths of who you truly are.<br />
                  True art…<br />
                  is a mirror."
                </p>

                <p className="text-base md:text-xl text-white/90 italic leading-relaxed tracking-wider">
                  Your Letters to the Subconscious await,<br />
                  Seeker of Self.
                </p>

                <p className="text-white/90 italic text-lg md:text-xl tracking-wider">
                  I invite you to open the envelope
                </p>

                <div className="relative mt-4">
                  <video
                    ref={videoRef}
                    className="mx-auto w-auto h-auto max-w-full max-h-[50vh] cursor-pointer"
                    style={{
                      maxHeight: isMobile ? '65vh' : '50vh',
                      width: isMobile ? '100%' : 'auto'
                    }}
                    preload="auto"
                    playsInline
                    src="/assets/envelope-animation.mp4"
                    poster="/assets/envelope-frames/frame-001.jpg"
                    onClick={handleVideoPlay}
                  />
                </div>

                {/* Audio Controls - Only visible after video ends */}
                <div className={`transition-opacity duration-1000 ${contentUnlocked ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  <audio ref={audioRef} src="/assets/audio.wav" preload="auto" />

                  <div className="flex items-center justify-center mt-6 mb-2">
                    <button
                      onClick={toggleAudio}
                      className="flex items-center justify-center focus:outline-none transform hover:scale-105 active:scale-95 transition-transform duration-100"
                    >
                      <img
                        src={isPlaying ? "/assets/pause.png" : "/assets/play.png"}
                        alt={isPlaying ? "Pause" : "Play"}
                        className="w-14 h-14 md:w-16 md:h-16 object-contain filter drop-shadow-lg"
                      />
                    </button>
                    <p className="ml-4 text-white/80 italic text-sm md:text-base">
                      Listen to the letter
                    </p>
                  </div>
                </div>

                <div className={`mt-12 md:mt-16 transition-opacity duration-1000 ${contentUnlocked ? 'opacity-100' : 'opacity-0'}`}>
                  <p className="text-base md:text-xl text-white/90 italic leading-relaxed tracking-wider">
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
          </div>
        </div>

        {/* The rest of the content is only visible after the video completes */}
        <div className={`transition-opacity duration-1000 ${contentUnlocked ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {/* Transition Text Section */}
          <div className="pt-8 md:pt-0 flex items-center justify-center relative bg-black">
            <div className="relative z-10 max-w-2xl mx-auto text-center space-y-2 md:space-y-12 px-6 md:px-0">
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

                <div className="pt-4 md:pt-12 pb-4 md:pb-12">
                  <p className="text-base md:text-xl text-white/80 italic leading-relaxed tracking-wider">
                    I present to you, your<br />
                    <span className="text-lg md:text-2xl text-white tracking-widest">Letters To The Subconscious</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Art Section with frames */}
          <div className="min-h-[200vh] md:min-h-[250vh]">
            <div className="h-screen sticky top-0 flex items-center justify-center overflow-hidden">
              {/* Frame Animation with optimized performance */}
              <div
                className="absolute z-20 w-full h-full flex items-center justify-center transform-gpu will-change-transform"
                style={{
                  top: '0%'
                }}
              >
                {framesLoaded ? (
                  <img
                    src={`/assets/frames/frame-${String(currentFrame).padStart(3, '0')}.jpg`}
                    alt="Animation Frame"
                    className="w-full h-full object-contain will-change-contents"
                    style={{
                      maxHeight: isMobile ? '85vh' : '90vh',
                      maxWidth: isMobile ? '100%' : '90%',
                      transform: 'translateZ(0)',
                      backfaceVisibility: 'hidden',
                      perspective: 1000,
                      WebkitBackfaceVisibility: 'hidden',
                      WebkitPerspective: 1000
                    }}
                    loading="eager"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-pulse bg-gray-800 w-full h-full" />
                  </div>
                )}
              </div>
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
          onClick={() => window.open('https://checkout.viulet.com/letters-mirror', '_blank')}
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
