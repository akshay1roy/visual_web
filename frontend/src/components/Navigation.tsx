import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import { Map, Navigation2 } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = 'YOUR_API_KEY'; // Replace with actual API key

interface Location {
  lat: number;
  lng: number;
}

export function Navigation() {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [destination, setDestination] = useState<string>('');
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          const utterance = new SpeechSynthesisUtterance('Location found. You can now say "Navigate to" followed by your destination.');
          window.speechSynthesis.speak(utterance);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('Unable to get your location. Please enable location services.');
          const utterance = new SpeechSynthesisUtterance('Unable to get your location. Please enable location services.');
          window.speechSynthesis.speak(utterance);
        }
      );
    }

    // Set up speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
        if (command.includes('navigate to')) {
          const dest = command.replace('navigate to', '').trim();
          setDestination(dest);
          const utterance = new SpeechSynthesisUtterance(`Finding directions to ${dest}`);
          window.speechSynthesis.speak(utterance);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError('Speech recognition error. Please try again.');
      };

      if (isListening) {
        recognition.start();
      }

      return () => {
        recognition.stop();
      };
    }
  }, [isListening]);

  const directionsCallback = (
    result: google.maps.DirectionsResult | null,
    status: google.maps.DirectionsStatus
  ) => {
    if (status === 'OK' && result) {
      setDirections(result);
      
      // Speak the directions
      const route = result.routes[0];
      const steps = route.legs[0].steps;
      let directionsText = 'Here are your directions: ';
      steps.forEach((step, index) => {
        directionsText += `Step ${index + 1}: ${step.instructions.replace(/<[^>]*>/g, '')}. `;
      });
      
      const utterance = new SpeechSynthesisUtterance(directionsText);
      window.speechSynthesis.speak(utterance);
    } else {
      setError('Error finding directions. Please try again.');
      const utterance = new SpeechSynthesisUtterance('Error finding directions. Please try again.');
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Navigation Assistant</h2>

        <div className="mb-6">
          <button
            onClick={() => setIsListening(!isListening)}
            className={`w-full ${
              isListening ? 'bg-red-500' : 'bg-blue-500'
            } text-white p-4 rounded-lg flex items-center justify-center gap-2`}
          >
            <Navigation2 size={24} />
            {isListening ? 'Stop Listening' : 'Start Voice Navigation'}
          </button>
          <p className="text-center mt-2 text-gray-600">
            Say "Navigate to" followed by your destination
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {userLocation && (
          <div className="h-[500px] relative rounded-lg overflow-hidden">
            <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={userLocation}
                zoom={15}
              >
                {destination && userLocation && (
                  <DirectionsService
                    options={{
                      destination: destination,
                      origin: userLocation,
                      travelMode: google.maps.TravelMode.WALKING
                    }}
                    callback={directionsCallback}
                  />
                )}
                {directions && <DirectionsRenderer directions={directions} />}
              </GoogleMap>
            </LoadScript>
          </div>
        )}
      </div>
    </div>
  );
}