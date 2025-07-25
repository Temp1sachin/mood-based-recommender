import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { motion, useMotionValue } from "framer-motion";
import { 
  FiSmile, FiFrown, FiZap, FiAlertTriangle, FiX, FiStar, FiMeh, FiCamera
} from "react-icons/fi";
import "./Carousel.css";
import MovieCard from "./MovieCard";

// Mood to Emotion map (used for backend compatibility)
const moodToEmotion = {
  joy: "joy",
  sadness: "sadness",
  anger: "anger",
  fear: "fear",
  disgust: "disgust",
  surprise: "surprise",
  anticipation: "anticipation",
};


const DEFAULT_ITEMS = [
  { title: "Mood Detection", description: "Detect your mood using your face or answer a questionnaire.", id: 0, icon: <FiCamera className="carousel-icon" />, mood: "detection" },
  { title: "Happy", description: "Feeling joyful, cheerful, and positive. Ready for uplifting content!", id: 1, icon: <FiSmile className="carousel-icon" />, mood: "joy" },
  { title: "Sad", description: "Feeling down, melancholic, or blue. Let's find some comfort.", id: 2, icon: <FiFrown className="carousel-icon" />, mood: "sadness" },
  { title: "Angry", description: "Feeling frustrated, irritated, or mad. Time for some calming content.", id: 3, icon: <FiZap className="carousel-icon" />, mood: "anger" },
  { title: "Fearful", description: "Feeling anxious, scared, or worried. Let's find some reassurance.", id: 4, icon: <FiAlertTriangle className="carousel-icon" />, mood: "fear" },
  { title: "Disgusted", description: "Feeling repulsed or turned off. Let's find something better.", id: 5, icon: <FiX className="carousel-icon" />, mood: "disgust" },
  { title: "Surprised", description: "Feeling shocked, amazed, or astonished. Ready for something unexpected!", id: 6, icon: <FiStar className="carousel-icon" />, mood: "surprise" },
  { title: "Neutral", description: "Feeling calm, balanced, or indifferent. Let's explore something new.", id: 7, icon: <FiMeh className="carousel-icon" />, mood: "anticipation" },
];

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS = { type: "spring", stiffness: 300, damping: 30 };

export default function Carousel({
  items = DEFAULT_ITEMS,
  baseWidth = 300,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  loop = false,
  round = false,
  setShowDetector,
  onMoodSelect,
}) {
  const containerPadding = 16;
  const itemWidth = baseWidth - containerPadding * 2;
  const trackItemOffset = itemWidth + GAP;

  const carouselItems = useMemo(() => loop ? [...items, items[0]] : items, [items, loop]);
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const containerRef = useRef(null);
  const [currentEmotion, setCurrentEmotion] = useState("");

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current;
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [pauseOnHover, handleMouseEnter, handleMouseLeave]);

  useEffect(() => {
    if (autoplay && (!pauseOnHover || !isHovered)) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev === items.length - 1 && loop) return prev + 1;
          if (prev === carouselItems.length - 1) return loop ? 0 : prev;
          return prev + 1;
        });
      }, autoplayDelay);
      return () => clearInterval(timer);
    }
  }, [autoplay, autoplayDelay, isHovered, loop, items.length, carouselItems.length, pauseOnHover]);

  const effectiveTransition = isResetting ? { duration: 0 } : SPRING_OPTIONS;

  const handleAnimationComplete = useCallback(() => {
    if (loop && currentIndex === carouselItems.length - 1) {
      setIsResetting(true);
      x.set(0);
      setCurrentIndex(0);
      setTimeout(() => setIsResetting(false), 50);
    }
  }, [loop, currentIndex, carouselItems.length, x]);

  const handleDragEnd = useCallback((_, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
      if (loop && currentIndex === items.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex((prev) => Math.min(prev + 1, carouselItems.length - 1));
      }
    } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
      if (loop && currentIndex === 0) {
        setCurrentIndex(items.length - 1);
      } else {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
    }
  }, [loop, currentIndex, items.length, carouselItems.length]);

  const dragProps = useMemo(() => loop ? {} : {
    dragConstraints: {
      left: -trackItemOffset * (carouselItems.length - 1),
      right: 0,
    }
  }, [loop, trackItemOffset, carouselItems.length]);

  const handleCameraClick = useCallback(() => {
    console.log("Camera button clicked");
    setShowDetector?.(true);
  }, [setShowDetector]);

 

  const handleMoodSelect = useCallback(async (mood) => {
    const emotionLabel = moodToEmotion[mood] || mood;
    setCurrentEmotion(emotionLabel);
    console.log("Mood selected:", emotionLabel);
    onMoodSelect?.(emotionLabel);

    try {
      const response = await fetch('http://localhost:8000/mood/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emotion: emotionLabel }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Recommended Movies:", data.movies);
      setMovies(data.movies || []);
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Failed to fetch recommendations.");
    }
  }, [onMoodSelect]);

  const renderItemContent = useCallback((item) => {
    if (item.mood === "detection") {
      return (
        <div className="mood-detection-buttons">
          <button onClick={handleCameraClick}>Detect via Camera</button>
          
        </div>
      );
    } else {
      return (
        <div className="mood-selection-content">
          <p className="carousel-item-description">{item.description}</p>
          <button className="mood-select-button" onClick={() => handleMoodSelect(item.mood)}>
            Select This Mood
          </button>
        </div>
      );
    }
  }, [handleCameraClick, handleMoodSelect]);

  return (
    <div
      ref={containerRef}
      className={`carousel-container ${round ? "round" : ""}`}
      style={{
        width: `${baseWidth}px`,
        ...(round && { height: `${baseWidth}px`, borderRadius: "50%" }),
      }}
    >
      <motion.div
        className="carousel-track"
        drag="x"
        {...dragProps}
        style={{ width: itemWidth, gap: `${GAP}px`, x }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(currentIndex * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationComplete={handleAnimationComplete}
      >
        {carouselItems.map((item, index) => (
          <motion.div
            key={`${item.id}-${index}`}
            className={`carousel-item ${round ? "round" : ""}`}
            style={{
              width: itemWidth,
              height: round ? itemWidth : "100%",
              ...(round && { borderRadius: "50%" }),
            }}
            transition={effectiveTransition}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`carousel-item-header ${round ? "round" : ""}`}>
              <span className="carousel-icon-container">{item.icon}</span>
            </div>
            <div className="carousel-item-content">
              <div className="carousel-item-title">{item.title}</div>
              {renderItemContent(item)}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className={`carousel-indicators-container ${round ? "round" : ""}`}>
        <div className="carousel-indicators">
          {items.map((_, index) => (
            <motion.div
              key={index}
              className={`carousel-indicator ${currentIndex % items.length === index ? "active" : "inactive"}`}
              animate={{ scale: currentIndex % items.length === index ? 1.2 : 1 }}
              onClick={() => setCurrentIndex(index)}
              transition={{ duration: 0.15 }}
              whileHover={{ scale: 1.1 }}
            />
          ))}
        </div>
      </div>

      {movies.length > 0 && (
        <div className="mt-12 mb-12 px-4 w-full flex justify-center relative">
          <div className="w-full max-w-5xl bg-zinc-900/80 rounded-2xl shadow-xl p-8 relative">
            <button
              className="absolute top-4 right-4 text-pink-200 hover:text-red-500 text-2xl z-10"
              onClick={() => setMovies([])}
              title="Close"
            >
              <FiX />
            </button>
            <h2 className="text-2xl font-bold text-pink-200 mb-6 text-center">
              To watch when feeling {currentEmotion ? currentEmotion.charAt(0).toUpperCase() + currentEmotion.slice(1) : "this emotion"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
              {movies.map((movie, index) => (
                <MovieCard key={index} movie={movie} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
