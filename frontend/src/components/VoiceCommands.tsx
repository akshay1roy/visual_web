import React, { useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

export function VoiceCommands() {
  const { isListening, setIsListening } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    let recognition: SpeechRecognition | null = null;

    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        const utterance = new SpeechSynthesisUtterance('Voice commands activated');
        window.speechSynthesis.speak(utterance);
      };

      recognition.onend = () => {
        if (isListening) {
          recognition?.start();
        }
      };

      recognition.onresult = (event) => {
        const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
        
        // Handle voice commands
        if (command.includes('go home') || command.includes('main menu')) {
          navigate('/');
          const utterance = new SpeechSynthesisUtterance('Navigating to home page');
          window.speechSynthesis.speak(utterance);
        } else if (command.includes('detect objects') || command.includes('what do you see')) {
          navigate('/detect');
          const utterance = new SpeechSynthesisUtterance('Starting object detection');
          window.speechSynthesis.speak(utterance);
        } else if (command.includes('read text') || command.includes('scan text')) {
          navigate('/ocr');
          const utterance = new SpeechSynthesisUtterance('Opening text recognition');
          window.speechSynthesis.speak(utterance);
        } else if (command.includes('recognize faces') || command.includes('who is there')) {
          navigate('/faces');
          const utterance = new SpeechSynthesisUtterance('Starting face recognition');
          window.speechSynthesis.speak(utterance);
        } else if (command.includes('start navigation') || command.includes('help me navigate')) {
          navigate('/navigate');
          const utterance = new SpeechSynthesisUtterance('Opening navigation assistant');
          window.speechSynthesis.speak(utterance);
        } else if (command.includes('help') || command.includes('what can you do')) {
          const helpText = 'Available commands: go home, detect objects, read text, recognize faces, start navigation, and help';
          const utterance = new SpeechSynthesisUtterance(helpText);
          window.speechSynthesis.speak(utterance);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        const utterance = new SpeechSynthesisUtterance('Voice command error. Please try again.');
        window.speechSynthesis.speak(utterance);
      };
    }

    if (isListening && recognition) {
      recognition.start();
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isListening, setIsListening, navigate]);

  return (
    <button
      onClick={() => setIsListening(!isListening)}
      className={`fixed bottom-4 right-4 p-4 rounded-full ${
        isListening ? 'bg-red-500' : 'bg-blue-500'
      } text-white shadow-lg transition-colors`}
      aria-label={isListening ? 'Stop listening' : 'Start listening'}
    >
      {isListening ? <MicOff size={24} /> : <Mic size={24} />}
    </button>
  );
}