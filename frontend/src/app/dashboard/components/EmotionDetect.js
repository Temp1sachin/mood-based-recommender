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
    <div className="flex flex-col items-center p-6">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        width="400"
        height="300"
        className="rounded shadow mb-4"
      />

      {detecting && <p className="mb-4 text-lg font-medium">Detecting your mood...</p>}

      {!detecting && expression && (
        <div className="text-xl font-semibold mb-6">
          You seem <span className="text-blue-500">{expression}</span> 😊
        </div>
      )}

      {loading && <p className="text-black-600">Fetching recommendations...</p>}

      {!loading && recommendedMovies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedMovies.map((movie, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-lg w-72">
              {movie.poster && (
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="rounded w-full h-96 object-cover mb-3"
                />
              )}
              <h3 className="font-bold text-black">{movie.title}</h3>
              {movie.genres && (
                <p className="text-sm text-gray-500 mb-1">
                  Genres: {movie.genres.join(', ')}
                </p>
              )}
              {movie.description && (
                <p className="text-gray-700 text-sm">{movie.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FaceEmotionDetector;
