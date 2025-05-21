// MoodCapture.jsx
import React, { useRef, useEffect } from "react";
import * as faceapi from "face-api.js";

export default function Mood({ onMoodDetected }) {
  const videoRef = useRef();
  const intervalRef = useRef(null);

  useEffect(() => {
    const MODEL_URL = "/models";

    const loadModels = async () => {
      try {
        console.log("🔄 Loading models...");
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        console.log("✅ Models loaded successfully");
      } catch (err) {
        console.error("❌ Failed to load models:", err);
      }
    };

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play(); // Explicit play call
          console.log("🎥 Video stream started");
        }
      } catch (err) {
        console.error("❌ Failed to access webcam:", err);
      }
    };

    const init = async () => {
      await loadModels();
      await startVideo();
    };

    init();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleVideoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current) return;

      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections.length > 0) {
        const expressions = detections[0].expressions;
        const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
        const topExpression = sorted[0][0];
        console.log("🧠 Detected mood:", topExpression);
        if (typeof onMoodDetected === "function") {
  onMoodDetected(topExpression);
}
      }
    }, 1000);
  };

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        muted
        width="320"
        height="240"
        onPlay={handleVideoPlay}
        style={{ backgroundColor: "#000", display: "block" }}
      />
    </div>
  );
}
