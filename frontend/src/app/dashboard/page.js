'use client'
import FaceEmotionDetector from './components/EmotionDetect';
import PlaylistGallery from './components/Preview'
import Sidebar from './components/Sidebar';
export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
      <p className="text-lg text-gray-600">Welcome to your mood-based music dashboard 🎶</p>
      {/* <FaceEmotionDetector/> */}
      <Sidebar/>
      <PlaylistGallery/>
      
    </div>
  );
}
