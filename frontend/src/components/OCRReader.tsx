import React, { useRef, useState } from 'react';
import { createWorker } from 'tesseract.js';
import { Camera, Upload } from 'lucide-react';
import { useStore } from '../store/useStore';

export function OCRReader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUsingCamera, setIsUsingCamera] = useState(false);
  const { setRecognizedText } = useStore();

  const processImage = async (imageSource: string | Blob) => {
    setIsProcessing(true);
    try {
      const worker = await createWorker();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const { data: { text } } = await worker.recognize(imageSource);
      setRecognizedText(text);
      
      // Speak the recognized text
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
      
      await worker.terminate();
    } catch (error) {
      console.error('OCR Error:', error);
      const utterance = new SpeechSynthesisUtterance('Error processing text. Please try again.');
      window.speechSynthesis.speak(utterance);
    }
    setIsProcessing(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const toggleCamera = async () => {
    if (!isUsingCamera) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsUsingCamera(true);
        }
      } catch (error) {
        console.error('Camera Error:', error);
      }
    } else {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
      setIsUsingCamera(false);
    }
  };

  const captureImage = async () => {
    if (videoRef.current && isUsingCamera) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      await processImage(imageDataUrl);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Text Recognition</h2>
        
        <div className="space-y-4">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
              disabled={isProcessing}
            >
              <Upload size={20} />
              Upload Image
            </button>
            
            <button
              onClick={toggleCamera}
              className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
              disabled={isProcessing}
            >
              <Camera size={20} />
              {isUsingCamera ? 'Stop Camera' : 'Use Camera'}
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          {isUsingCamera && (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
              />
              <button
                onClick={captureImage}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
                disabled={isProcessing}
              >
                Capture & Read Text
              </button>
            </div>
          )}

          {isProcessing && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Processing text...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}