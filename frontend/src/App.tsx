import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ObjectDetection } from './components/ObjectDetection';
import { OCRReader } from './components/OCRReader';
import { FaceRecognition } from './components/FaceRecognition';
import { Navigation } from './components/Navigation';
import { VoiceCommands } from './components/VoiceCommands';
import { Eye, Camera, FileText, Users, Map } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-blue-600 text-white p-4 shadow-lg">
          <div className="container mx-auto flex items-center gap-2">
            <Eye size={32} />
            <h1 className="text-2xl font-bold">Visual Assist AI</h1>
          </div>
        </header>

        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={
              <div className="text-center py-8">
                <h2 className="text-3xl font-bold mb-4">Welcome to Visual Assist AI</h2>
                <p className="text-lg text-gray-600 mb-8">
                  Your intelligent assistant for visual navigation and object recognition
                </p>
                <div className="grid gap-4 max-w-md mx-auto">
                  <a
                    href="#/detect"
                    className="flex items-center justify-center gap-3 bg-blue-500 text-white p-4 rounded-lg shadow hover:bg-blue-600 transition"
                  >
                    <Camera size={24} />
                    Start Object Detection
                  </a>
                  <a
                    href="#/ocr"
                    className="flex items-center justify-center gap-3 bg-green-500 text-white p-4 rounded-lg shadow hover:bg-green-600 transition"
                  >
                    <FileText size={24} />
                    Read Text (OCR)
                  </a>
                  <a
                    href="#/faces"
                    className="flex items-center justify-center gap-3 bg-purple-500 text-white p-4 rounded-lg shadow hover:bg-purple-600 transition"
                  >
                    <Users size={24} />
                    Recognize Faces
                  </a>
                  <a
                    href="#/navigate"
                    className="flex items-center justify-center gap-3 bg-yellow-500 text-white p-4 rounded-lg shadow hover:bg-yellow-600 transition"
                  >
                    <Map size={24} />
                    Voice Navigation
                  </a>
                </div>
              </div>
            } />
            <Route path="/detect" element={<ObjectDetection />} />
            <Route path="/ocr" element={<OCRReader />} />
            <Route path="/faces" element={<FaceRecognition />} />
            <Route path="/navigate" element={<Navigation />} />
          </Routes>
        </main>

        <VoiceCommands />
      </div>
    </Router>
  );
}

export default App;