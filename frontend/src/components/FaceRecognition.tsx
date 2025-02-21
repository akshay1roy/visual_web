import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Camera } from 'lucide-react';
import { useStore } from '../store/useStore';

export function FaceRecognition() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);
        setIsInitialized(true);
        const utterance = new SpeechSynthesisUtterance('Face recognition is ready');
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Error loading face-api models:', error);
        const utterance = new SpeechSynthesisUtterance('Error initializing face recognition');
        window.speechSynthesis.speak(utterance);
      }
    };

    loadModels();
  }, []);

  useEffect(() => {
    let animationFrame: number;
    
    const startVideo = async () => {
      if (!videoRef.current || !isInitialized) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (error) {
        console.error('Error accessing camera:', error);
        const utterance = new SpeechSynthesisUtterance('Error accessing camera');
        window.speechSynthesis.speak(utterance);
      }
    };

    const detectFaces = async () => {
      if (!videoRef.current || !canvasRef.current || !isInitialized || isProcessing) return;

      setIsProcessing(true);
      
      try {
        const detections = await faceapi.detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceExpressions();

        const canvas = canvasRef.current;
        const displaySize = { 
          width: videoRef.current.videoWidth, 
          height: videoRef.current.videoHeight 
        };
        
        faceapi.matchDimensions(canvas, displaySize);
        
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        
        canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

        // Provide audio feedback about detected faces
        if (detections.length > 0) {
          const feedback = `Detected ${detections.length} ${
            detections.length === 1 ? 'person' : 'people'
          }. ${detections.map((detection, index) => {
            const expression = Object.entries(detection.expressions)
              .reduce((a, b) => (a[1] > b[1] ? a : b))[0];
            return `Person ${index + 1} appears ${expression}`;
          }).join('. ')}`;

          const utterance = new SpeechSynthesisUtterance(feedback);
          window.speechSynthesis.speak(utterance);
        }
      } catch (error) {
        console.error('Face detection error:', error);
      }

      setIsProcessing(false);
      animationFrame = requestAnimationFrame(detectFaces);
    };

    if (isInitialized) {
      startVideo();
      detectFaces();
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isInitialized, isProcessing]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Face Recognition</h2>
        
        <div className="relative">
          {!isInitialized && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading face recognition models...</p>
              </div>
            </div>
          )}
          
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg"
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>

          <div className="mt-4 text-center">
            <p className="text-gray-600">
              <Camera className="inline-block mr-2" size={20} />
              Point camera at faces to detect and analyze expressions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}