'use client';
import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import '@tensorflow/tfjs';

const FaceEmotionDetector = () => {
  const videoRef = useRef(null);
  const [expression, setExpression] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [detecting, setDetecting] = useState(true);

  useEffect(() => {
    const loadModelsAndStart = async () => {
      try {
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          detectExpression(); // start detection after video is playing
        }
      } catch (err) {
        console.error('Setup error:', err);
      }
    };

    const detectExpression = async () => {
      const interval = setInterval(async () => {
        if (!videoRef.current) return;

        const result = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();

        if (result?.expressions) {
          const expressions = result.expressions;
          const topExpression = Object.entries(expressions).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
          setExpression(topExpression);
          setDetecting(false);
          clearInterval(interval);
          if (videoRef.current?.srcObject) {
  videoRef.current.srcObject.getTracks().forEach(track => track.stop());
}

          getRecommendations(topExpression);
        }
      }, 1000);
    };

    loadModelsAndStart();
  }, []);

  const getRecommendations = async (faceEmotion) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emotion: faceEmotion }),
      });

      const data = await res.json();
      setRecommendedMovies(data.movies || []);
    } catch (err) {
      console.error('Recommendation fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-8 min-h-screen bg-gradient-to-br from-black via-purple-900 to-pink-700">
      <div className="w-full max-w-4xl bg-black bg-opacity-80 rounded-2xl shadow-2xl p-8 border-2 border-purple-700 flex flex-col items-center">
        {detecting && (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            width="400"
            height="300"
            className="rounded-2xl shadow-lg mb-6 border-4 border-pink-400 bg-black"
          />
        )}

        {detecting && <p className="mb-6 text-xl font-semibold text-pink-200 animate-pulse">Detecting your mood...</p>}

        {!detecting && expression && (
          <div className="text-2xl font-extrabold mb-8 text-center flex flex-col items-center">
            <span>
              You seem <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-700">{expression}</span>
            </span>
            <span className="mt-2 text-[3rem] animate-bounce drop-shadow-lg bg-gradient-to-r from-pink-400 via-purple-400 to-pink-600 bg-clip-text text-transparent select-none">😊</span>
          </div>
        )}

        {loading && <p className="text-pink-400 text-lg font-medium">Fetching recommendations...</p>}

        {!loading && recommendedMovies.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
            {recommendedMovies.map((movie, index) => (
              <div key={index} className="bg-gradient-to-br from-purple-800 via-black to-pink-800 p-5 rounded-2xl shadow-xl w-72 border-2 border-purple-700 flex flex-col items-center">
                {movie.poster && (
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="rounded-xl w-full h-80 object-cover mb-4 border-2 border-pink-400 bg-black"
                  />
                )}
                <h3 className="font-bold text-lg text-pink-200 mb-1 text-center">{movie.title}</h3>
                {movie.genres && (
                  <p className="text-xs text-purple-300 mb-2 text-center">
                    Genres: {movie.genres.join(', ')}
                  </p>
                )}
                {movie.description && (
                  <p className="text-purple-100 text-sm text-center">{movie.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceEmotionDetector;
