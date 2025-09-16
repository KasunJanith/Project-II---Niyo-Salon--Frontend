import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import * as tf from '@tensorflow/tfjs';
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import axios from 'axios';

const hairstyles = [
  { name: 'Bob Cut', image: '/overlays/bob.png', faceShapes: ['Oval', 'Round'], gender: 'Women', ageMin: 20, ageMax: 40, tones: ['Fair', 'Medium'] },
  { name: 'Pixie Cut', image: '/overlays/pixie.png', faceShapes: ['Square', 'Heart'], gender: 'Women', ageMin: 25, ageMax: 45, tones: ['Dark'] },
  { name: 'Crew Cut', image: '/overlays/crew.png', faceShapes: ['Oval', 'Square'], gender: 'Men', ageMin: 18, ageMax: 50, tones: ['All'] },
  { name: 'Pompadour', image: '/overlays/pompadour.png', faceShapes: ['Round', 'Oval'], gender: 'Men', ageMin: 20, ageMax: 40, tones: ['All'] },
  // Add more styles as needed
];

function getSkinTone(imgData) {
  let r = 0, g = 0, b = 0, count = 0;
  for (let i = 0; i < imgData.data.length; i += 4) {
    r += imgData.data[i]; g += imgData.data[i + 1]; b += imgData.data[i + 2]; count++;
  }
  const brightness = (r + g + b) / (3 * count);
  return brightness > 180 ? 'Fair' : brightness > 120 ? 'Medium' : 'Dark';
}

const VirtualTryOnPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [step, setStep] = useState(1); // 1: Gender select, 2: Camera prompt, 3: Attributes & Suggestions, 4: Try-On
  const [gender, setGender] = useState('');
  const [cameraOn, setCameraOn] = useState(false);
  const [stream, setStream] = useState(null);
  const [attributes, setAttributes] = useState({ faceShape: '', age: 0, skinTone: '' });
  const [suggestedStyles, setSuggestedStyles] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const selfieSegmentation = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      await tf.ready();
      await tf.setBackend('webgl');
      await faceapi.nets.tinyFaceDetector.loadFromUri('./models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('./models');
      await faceapi.nets.ageGenderNet.loadFromUri('./models');

      selfieSegmentation.current = new SelfieSegmentation({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
      });
      selfieSegmentation.current.setOptions({ modelSelection: 1 });
      selfieSegmentation.current.onResults(onSegmentationResults);
    };
    loadModels().catch(console.error);
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      setCameraOn(true);
      setStep(3); // Move to detection
      detectAttributes(); // Auto-detect after camera on
    } catch (err) {
      console.error('Camera error:', err);
      alert('Camera access denied. Check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraOn(false);
      setStep(2); // Back to camera prompt
    }
  };

  const detectAttributes = async () => {
    if (!videoRef.current) return;
    const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withAgeAndGender();

    if (detections) {
      const faceShape = detectFaceShape(detections.landmarks);
      const age = Math.round(detections.age);
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx && videoRef.current) {
        ctx.drawImage(videoRef.current, 0, 0, 640, 480);
        const box = detections.detection.box;
        const imgData = ctx.getImageData(box.x, box.y, box.width, box.height);
        const skinTone = getSkinTone(imgData);
        setAttributes({ faceShape, age, skinTone });

        // Fetch suggestions
        try {
          const response = await axios.get(`http://localhost:8080/api/styles/recommend?shape=${faceShape}&age=${age}&tone=${skinTone}&gender=${gender}`);
          setSuggestedStyles(response.data || hairstyles);
        } catch (error) {
          console.error('API error:', error.message);
          setSuggestedStyles(hairstyles.filter(h =>
            h.faceShapes.includes(faceShape) &&
            age >= h.ageMin && age <= h.ageMax &&
            (h.tones.includes(skinTone) || h.tones.includes('All')) &&
            h.gender === gender
          ));
        }
      }
    } else {
      alert('No face detected. Adjust your position.');
    }
  };

  const detectFaceShape = (landmarks) => {
    const positions = landmarks.positions;
    const jawWidth = Math.abs(positions[16].x - positions[0].x);
    const cheekWidth = Math.abs(positions[15].x - positions[1].x);
    const foreheadWidth = Math.abs(positions[25].x - positions[18].x);
    const faceLength = Math.abs(positions[8].y - positions[27].y);

    const ratio = faceLength / jawWidth;
    if (ratio > 1.5 && foreheadWidth > cheekWidth && foreheadWidth > jawWidth) return 'Heart';
    if (ratio > 1.5 && cheekWidth > foreheadWidth && cheekWidth > jawWidth) return 'Diamond';
    if (ratio > 1.5 && Math.abs(foreheadWidth - cheekWidth) < 15 && Math.abs(cheekWidth - jawWidth) < 15) return 'Oval';
    if (Math.abs(faceLength - jawWidth) < 25) return 'Round';
    if (jawWidth >= cheekWidth && jawWidth >= foreheadWidth) return 'Square';
    return 'Oval';
  };

  const onSegmentationResults = (results) => {
    if (!canvasRef.current || !videoRef.current || !selectedStyle) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, 640, 480);
    ctx.drawImage(results.image, 0, 0, 640, 480);

    const style = suggestedStyles.find(h => h.name === selectedStyle.name);
    if (style) {
      const img = new Image();
      img.src = style.image;
      img.onload = () => {
        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(results.segmentationMask, 0, 0, 640, 480);
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(img, 80, 20, 480, 360); // Adjusted for larger video size
      };
    }
  };

  useEffect(() => {
    if (cameraOn && selectedStyle) {
      const interval = setInterval(async () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 640; tempCanvas.height = 480;
        tempCanvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
        await selfieSegmentation.current?.send({ image: tempCanvas });
      }, 100); // Real-time update every 100ms
      return () => clearInterval(interval);
    }
  }, [cameraOn, selectedStyle]);

  const handleGenderSelect = (selectedGender) => {
    setGender(selectedGender);
    setStep(2); // Move to camera prompt
  };

  const handleTryOn = (style) => {
    setSelectedStyle(style);
    setStep(4); // Move to try-on view
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-6 text-purple-700">Virtual Try-On - Niyo Salon</h2>

      {step === 1 && (
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
          <h3 className="text-xl font-semibold mb-4">Select Your Gender</h3>
          <div className="flex justify-around">
            <button
              onClick={() => handleGenderSelect('Men')}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
            >
              Men
            </button>
            <button
              onClick={() => handleGenderSelect('Women')}
              className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600"
            >
              Women
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
          <h3 className="text-xl font-semibold mb-4">Turn On Camera for Detection</h3>
          <button
            onClick={startCamera}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
          >
            Turn On Camera
          </button>
          <button
            onClick={() => setStep(1)}
            className="ml-4 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
          >
            Back
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h3 className="text-xl font-semibold mb-4 text-center">Your Detected Attributes</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-100 rounded-lg text-center">
              <p className="font-bold">Face Shape</p>
              <p className="text-lg">{attributes.faceShape || 'Detecting...'}</p>
            </div>
            <div className="p-4 bg-green-100 rounded-lg text-center">
              <p className="font-bold">Age</p>
              <p className="text-lg">{attributes.age || 'Detecting...'}</p>
            </div>
            <div className="p-4 bg-purple-100 rounded-lg text-center">
              <p className="font-bold">Skin Tone</p>
              <p className="text-lg">{attributes.skinTone || 'Detecting...'}</p>
            </div>
            <div className="p-4 bg-yellow-100 rounded-lg text-center">
              <p className="font-bold">Gender</p>
              <p className="text-lg">{gender}</p>
            </div>
          </div>
          <h3 className="text-xl font-semibold mt-6 mb-4 text-center">Suggested Hairstyles</h3>
          <div className="grid grid-cols-2 gap-4">
            {suggestedStyles.map(style => (
              <div key={style.name} className="p-4 bg-gray-50 rounded-lg text-center cursor-pointer hover:shadow-md" onClick={() => handleTryOn(style)}>
                <img src={style.image} alt={style.name} className="w-full h-32 object-cover mb-2 rounded" />
                <p className="font-bold">{style.name}</p>
              </div>
            ))}
          </div>
          {suggestedStyles.length === 0 && <p className="text-center text-red-500 mt-4">No suggestions found. Try adjusting your position.</p>}
          <button
            onClick={stopCamera}
            className="mt-6 bg-red-500 text-white px-6 py-3 rounded-lg w-full hover:bg-red-600"
          >
            Turn Off Camera
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl text-center">
          <h3 className="text-xl font-semibold mb-4">Trying On: {selectedStyle.name}</h3>
          <div className="relative">
            <video ref={videoRef} autoPlay className="w-full h-auto border mb-4 rounded" />
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
          </div>
          <button
            onClick={() => setStep(3)}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
          >
            Back to Suggestions
          </button>
          <button
            onClick={stopCamera}
            className="ml-4 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600"
          >
            Turn Off Camera
          </button>
        </div>
      )}
    </div>
  );
};

export default VirtualTryOnPage;