import React, { useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import { useStore } from '../store/useStore';

export function ObjectDetection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { setDetectedObjects } = useStore();

  useEffect(() => {
    let animationFrameId: number;
    let model: cocossd.ObjectDetection;

    const initCamera = async () => {
      if (!videoRef.current) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        videoRef.current.srcObject = stream;
        
        // Load the COCO-SSD model
        model = await cocossd.load();
        
        const detectFrame = async () => {
          if (!videoRef.current || !model) return;
          
          const predictions = await model.detect(videoRef.current);
          setDetectedObjects(predictions);
          
          // Speak the detected objects
          predictions.forEach(prediction => {
            const utterance = new SpeechSynthesisUtterance(
              `Detected ${prediction.class} with ${Math.round(prediction.score * 100)}% confidence`
            );
            window.speechSynthesis.speak(utterance);
          });
          
          animationFrameId = requestAnimationFrame(detectFrame);
        };
        
        detectFrame();
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };

    initCamera();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [setDetectedObjects]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full rounded-lg shadow-lg"
      />
      <div className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded">
        Point camera at objects to detect
      </div>
    </div>
  );
}