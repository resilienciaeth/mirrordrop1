import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Password } from './pages/Password';

function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [contentUnlocked, setContentUnlocked] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const contentRef = useRef(null); // Reference for the content section to scroll to
  const envelopeContainerRef = useRef(null); // Reference for the envelope container
  const isMobile = window.innerWidth <= 768;

  // Fade in effect on mount with longer delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Control scrolling to allow seeing the full envelope animation
  useEffect(() => {
    if (contentUnlocked) return; // Don't limit scrolling after video completes

    const handleScroll = () => {
      if (!contentUnlocked && envelopeContainerRef.current) {
        const rect = envelopeContainerRef.current.getBoundingClientRect();
        const envelopeBottom = rect.bottom;
        const viewportHeight = window.innerHeight;

        // If user tries to scroll past the envelope, limit it
        if (envelopeBottom < viewportHeight - 20) {
          window.scrollTo({
            top: window.scrollY - (viewportHeight - envelopeBottom - 20),
            behavior: 'auto'
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [contentUnlocked]);

  // Handle scroll locking during video playback
  useEffect(() => {
    // Allow limited scrolling to view the envelope, but lock during playback
    document.body.style.overflow = (showPlayButton === false && !contentUnlocked) ? 'hidden' : 'auto';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [contentUnlocked, showPlayButton]);

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

        // Add a slight delay before scrolling to ensure content is rendered
        setTimeout(() => {
          if (contentRef.current) {
            contentRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }, 500);
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

      // Lock scrolling when the video starts playing
      document.body.style.overflow = 'hidden';

      // Make sure video has proper event listeners before playing
      video.addEventListener('ended', () => {
        setContentUnlocked(true);
        document.body.style.overflow = 'auto';

        // Add a slight delay before scrolling to ensure content is rendered
        setTimeout(() => {
          if (contentRef.current) {
            contentRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }, 500);
      }, { once: true });

      // Play the video
      video.play().catch(err => {
        console.error('Error playing video:', err);
        // If autoplay is blocked, show a message and restore scrolling
        alert('Please click the video to play it manually.');
        document.body.style.overflow = 'auto';
        setShowPlayButton(true);
      });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-black" style={{ fontFamily: 'Garamond, serif' }}>
        <div className="relative bg-black min-h-screen">
          <div className="flex flex-col items-center justify-start px-6 md:px-0 pt-8 md:pt-12 pb-20 md:pb-32">
            <div className={`relative max-w-2xl mx-auto text-center space-y-8 md:space-y-12 transform transition-all duration-[1500ms] ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <p className="text-lg md:text-2xl text-white leading-relaxed tracking-wide">
                "Because true art is not a decoration.<br />
                True art does not hang dead in silence—<br />
                it stares back at you, unflinching and raw,<br />
                revealing the depths of who you truly are.<br />
                True art…<br />
                is a Mirror."
              </p>

              <p className="text-base md:text-xl text-white/90 leading-relaxed tracking-wider">
                Your Letters to the Subconscious await,<br />
                Seeker of Self.
              </p>

              <p className="text-white/90 text-lg md:text-xl tracking-wider">
                Click to open the Seal
              </p>

              <div className="relative mt-4" ref={envelopeContainerRef}>
                <video
                  ref={videoRef}
                  className={`mx-auto w-auto h-auto max-w-full max-h-[50vh] cursor-pointer transition-all duration-300 ${showPlayButton && !contentUnlocked ? 'hover:scale-[1.03] hover:brightness-125 hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.25)]' : ''}`}
                  style={{
                    maxHeight: isMobile ? '65vh' : '50vh',
                    width: isMobile ? '100%' : 'auto'
                  }}
                  preload="auto"
                  playsInline
                  src="/assets/animation-envelope.mp4"
                  poster="/assets/envelope-frames/frame-001.jpg"
                  onClick={handleVideoPlay}
                />
                {/* Envelope hover glow effect */}
                {showPlayButton && !contentUnlocked && (
                  <div
                    className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-white/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      borderRadius: '4px',
                      mixBlendMode: 'overlay'
                    }}
                  />
                )}
              </div>

              {/* Invisible scroll barrier before content is unlocked */}
              {!contentUnlocked && (
                <div className="absolute bottom-0 left-0 w-full h-20 bg-black" />
              )}

              {/* Content Only visible after video ends */}
              <div
                ref={contentRef}
                className={`transition-opacity duration-1000 ${contentUnlocked ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              >
                {/* Creation Video and Text */}
                <div className="mt-8 md:mt-12 mb-12 md:mb-16">
                  <p className="text-base md:text-xl text-white/90 leading-relaxed tracking-wider mb-8 md:mb-10">
                    Yet it is not time to read the Letter.<br />
                    For it is not only about the message within that envelope—<br />
                    It is about the writing itself.<br />
                    For tomorrow never arrives,<br />
                    and so the journey is all that truly exists.<br />
                    This was the process of creation,<br />
                    the beauty,<br />
                    the "Blooming"<br />
                    that gave birth to this Mirror.<br />
                    This Mirror of Remembering.
                  </p>

                  <div className="relative mx-auto max-w-md">
                    <video
                      className="w-full rounded-sm shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
                      playsInline
                      src="/assets/creation.mp4"
                      controls
                      controlsList="nodownload"
                      preload="metadata"
                    />
                  </div>

                  <div className="mt-8 md:mt-10">
                    <p className="text-base md:text-lg text-white/90 leading-relaxed tracking-wider">
                      But what does it all mean, within that "Mirror"?<br />
                      What is the cage?<br />
                      What are the letters that drift out of it?<br />
                      And the girl—why does she keep painting them?"<br />
                      I do not know.<br />
                      But I do know this:<br />
                      Every Mirror must whisper.<br />
                      And whispers… they often carry Truth.
                    </p>
                  </div>
                </div>

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
                  <p className="ml-4 text-white/80 text-sm md:text-base">
                    Hear the Mirror's Whisper
                  </p>
                </div>

                {/* Manuscript Image */}
                <div className="mt-8 md:mt-16 flex justify-center w-full">
                  <img
                    src="/assets/manuscript.png"
                    alt="Handwritten Manuscript"
                    className="w-full md:w-auto max-h-[400px] md:max-h-[600px] object-contain opacity-95 hover:opacity-100 transition-opacity duration-300 transform hover:scale-[1.01] transition-transform"
                    style={{
                      filter: 'drop-shadow(0 6px 15px rgba(0, 0, 0, 0.6))'
                    }}
                  />
                </div>

                {/* Final Quotes */}
                <div className="mt-12 md:mt-20 space-y-6 md:space-y-8">
                  <p className="text-lg md:text-2xl text-white leading-relaxed tracking-wide">
                    If the storm outside begins inside,<br />
                    then the calm must begin there too.
                  </p>

                  <p className="text-lg md:text-2xl text-white leading-relaxed tracking-wide">
                    You are the artist of your life<br />
                    Because the choice is yours. Always has been. Always will be.<br />
                    You already hold the brush.
                  </p>

                  <p className="text-lg md:text-2xl text-white leading-relaxed tracking-wide">
                    So paint away my friend.
                  </p>

                  <div className="pt-4 md:pt-12 pb-4 md:pb-12">
                    <p className="text-base md:text-xl text-white/80 leading-relaxed tracking-wider">
                      I present to you, your<br />
                      <span className="text-lg md:text-2xl text-white tracking-widest">Letters To The Subconscious</span>
                    </p>
                  </div>
                </div>

                {/* Art Image - Moved to the end */}
                <div className="mt-12 md:mt-20 mb-8 md:mb-12">
                  <div className="relative mx-auto">
                    <img
                      src="/assets/art.JPEG"
                      alt="Art"
                      className="w-full h-full object-contain opacity-95 hover:opacity-100 transition-opacity duration-300 transform hover:scale-[1.01] transition-transform"
                      style={{
                        maxHeight: isMobile ? '65vh' : '80vh',
                        filter: 'drop-shadow(0 6px 15px rgba(0, 0, 0, 0.6))'
                      }}
                      loading="eager"
                    />
                  </div>

                  {/* Text beneath the art */}
                  <div className="mt-10 md:mt-14 space-y-6 md:space-y-8 text-center mx-auto max-w-xl">
                    <p className="text-base md:text-xl text-white/90 leading-relaxed tracking-wider">
                      Only 100 Mirrors of Letters To The Subconscious will ever exist.<br />
                      If one is to find its way into your home,<br />
                      let it not be hanged as a decoration;<br />
                      But rather as a reminder.
                    </p>

                    <p className="text-base md:text-xl text-white/90 leading-relaxed tracking-wider">
                      That the calm you seek is not found.<br />
                      It is painted. Stroke by stroke, from within.<br />
                      Even the cage was your creation.<br />
                      Which means—you also hold the key.<br />
                      Old thoughts are not life sentences.<br />
                      You are allowed to rewrite the story.
                    </p>

                    <div className="mt-8 md:mt-12">
                      <a
                        href="https://checkout.viulet.com/letters-mirror"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-lg md:text-xl text-white tracking-wider border-b-2 border-white/40 pb-1 hover:border-white/80 transition-all duration-300 hover:text-white"
                      >
                        Acquire Yours
                      </a>
                    </div>

                    {/* Framed Image - Added at the end */}
                    <div className="mt-12 md:mt-16 flex justify-center w-full">
                      <video
                        src="/assets/talk.mp4"
                        className="w-full h-full object-contain opacity-95 hover:opacity-100 transition-opacity duration-300 transform hover:scale-[1.01] transition-transform"
                        controls
                        controlsList="nodownload"
                        playsInline
                        preload="metadata"
                        style={{
                          maxWidth: isMobile ? '90%' : '80%',
                          filter: 'drop-shadow(0 8px 20px rgba(0, 0, 0, 0.7))'
                        }}
                        loading="eager"
                      />
                    </div>

                    {/* Product Specifications */}
                    <div className="mt-10 md:mt-14 mx-auto max-w-xl text-center">
                      <div className="text-white/90 space-y-6">
                        <div>
                          <h3 className="text-xl md:text-2xl text-white tracking-wide mb-4">Format:</h3>
                          <p className="text-base md:text-lg tracking-wide">Limited Edition Acrylic Mirror Print</p>
                        </div>

                        <div>
                          <h3 className="text-xl md:text-2xl text-white tracking-wide mb-4">Dimensions:</h3>
                          <p className="text-base md:text-lg tracking-wide">20x20in (50 x 50 cm)</p>
                        </div>

                        <div>
                          <h3 className="text-xl md:text-2xl text-white tracking-wide mb-4">Material:</h3>
                          <p className="text-base md:text-lg tracking-wide">Premium Top-Grade Acrylic<br />UV-protected, high-definition detail<br />Ready-to-hang mount included — no framing required.</p>
                        </div>

                        <div>
                          <h3 className="text-xl md:text-2xl text-white tracking-wide mb-4">Edition Size:</h3>
                          <p className="text-base md:text-lg tracking-wide">Strictly limited to 100 units only<br />No reprints. Once gone, the Mirror is gone forever.</p>
                        </div>
                      </div>

                      <div className="mt-10 md:mt-14 text-white/90">
                        <h3 className="text-xl md:text-2xl text-white tracking-wide mb-6">Included:</h3>
                        <ul className="space-y-4 text-base md:text-lg tracking-wide">
                          <li>"Letters to the Subconscious" 20x20in Mirror Artwork</li>
                          <li>Hand-numbered & signed Manuscript (Certificate of Authenticity)</li>
                          <li>Your own digital Keeper's Key which will unlock future quests to come.</li>
                          <li>30 days of free access to Sanctuary,</li>
                          <li>beginning the moment the doors are opened.<br />
                            A sacred space, reserved for those who remember.</li>
                        </ul>
                      </div>

                      <div className="mt-10 md:mt-14">
                        <a
                          href="https://checkout.viulet.com/letters-mirror"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-lg md:text-xl text-white tracking-wider border-b-2 border-white/40 pb-1 hover:border-white/80 transition-all duration-300 hover:text-white"
                        >
                          Acquire Yours
                        </a>
                      </div>

                      {/* Visual image moved below the last text */}
                      <div className="mt-12 md:mt-16 flex justify-center w-full">
                        <img
                          src="/assets/visual.png"
                          alt="Visual Representation"
                          className="w-full h-full object-contain opacity-95 hover:opacity-100 transition-opacity duration-300 transform hover:scale-[1.01] transition-transform"
                          style={{
                            maxWidth: isMobile ? '90%' : '80%',
                            filter: 'drop-shadow(0 8px 20px rgba(0, 0, 0, 0.7))'
                          }}
                          loading="eager"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Button */}
      <div className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] md:w-auto">
        <button
          className="group relative w-full md:w-auto px-4 md:px-8 py-3 md:py-4 bg-black/80 backdrop-blur-md rounded-full border border-white/10 
                     text-white hover:bg-black/90 transition-all duration-300 cursor-pointer
                     flex items-center justify-center md:justify-start gap-2
                     shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-black/40"
          style={{
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)'
          }}
          onClick={() => window.open('https://checkout.viulet.com/letters-mirror', '_blank')}
        >
          <span className="relative z-10 text-sm md:text-base font-light tracking-wide">
            8/100 Mirrors <span className="underline underline-offset-4">Claimed</span>. Acquire <span className="underline underline-offset-4 font-medium">Yours</span>
          </span>
          <svg
            className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:translate-x-1"
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
