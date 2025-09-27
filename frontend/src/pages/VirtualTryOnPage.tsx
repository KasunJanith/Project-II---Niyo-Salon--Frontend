import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import * as tf from '@tensorflow/tfjs';
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import axios from 'axios';
import tryOnBg from '../assets/Gallery/bg-gallery.jpg';

const hairstyles = [
  { name: 'Crew Cut', image: '/overlays/crew.png', faceShapes: ['Oval', 'Square'], gender: 'Men', ageMin: 18, ageMax: 50, tones: ['All'] },
  { name: 'Pompadour', image: '/overlays/pompadour.png', faceShapes: ['Round', 'Oval'], gender: 'Men', ageMin: 20, ageMax: 40, tones: ['All'] },
  { name: 'Undercut', image: '/overlays/undercut.png', faceShapes: ['Square', 'Oval'], gender: 'Men', ageMin: 18, ageMax: 45, tones: ['All'] },
  { name: 'Fade', image: '/overlays/fade.png', faceShapes: ['All'], gender: 'Men', ageMin: 16, ageMax: 60, tones: ['All'] },
  { name: 'Quiff', image: '/overlays/quiff.png', faceShapes: ['Oval', 'Round'], gender: 'Men', ageMin: 20, ageMax: 45, tones: ['All'] },
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
  const previewCanvasRef = useRef(null);
  const [attributes, setAttributes] = useState({ faceShape: 'Detecting...', age: 'Detecting...', skinTone: 'Detecting...' });
  const [suggestedStyles, setSuggestedStyles] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [detectionDone, setDetectionDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [videoPlaying, setVideoPlaying] = useState(false);
  const selfieSegmentation = useRef(null);

  // STEP 1: Load AI Models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await tf.ready();
        await tf.setBackend('webgl'); // Use GPU acceleration
        // Load face detection models
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.ageGenderNet.loadFromUri('/models');
        setLoading(false);
      } catch (err) {
        setError('Failed to load models: ' + err.message);
      }

      // Load selfie segmentation for background removal
      selfieSegmentation.current = new SelfieSegmentation({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
      });
      selfieSegmentation.current.setOptions({ modelSelection: 1 });
      selfieSegmentation.current.onResults(onSegmentationResults);
    };
    loadModels();
  }, []);

  // STEP 2: Handle real-time overlay when camera is on
  useEffect(() => {
    if (cameraOn && selectedStyle && previewCanvasRef.current) {
      const overlayInterval = setInterval(async () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 640; tempCanvas.height = 480;
        if (videoRef.current && videoPlaying) {
          tempCanvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
          await selfieSegmentation.current?.send({ image: tempCanvas });
        }
      }, 100);
      return () => clearInterval(overlayInterval);
    }
  }, [cameraOn, selectedStyle, previewCanvasRef, videoPlaying]);

  // STEP 3: Start Camera Function
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready to play
        videoRef.current.onloadedmetadata = () => {
          const playPromise = videoRef.current.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setVideoPlaying(true);
                setCameraOn(true);
                setError('');
              })
              .catch(err => {
                console.error('Video play failed:', err);
                setError('Camera access denied: ' + err.message);
                stopCamera();
              });
          }
        };
      }
    } catch (err) {
      setError('Camera access denied: ' + err.message);
    }
  };

  // STEP 4: Stop Camera Function
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
    setVideoPlaying(false);
    setAnalyzing(false);
    setDetectionDone(false);
    setAttributes({ faceShape: 'Detecting...', age: 'Detecting...', skinTone: 'Detecting...' });
    setSuggestedStyles([]);
    setSelectedStyle(null);
    if (previewCanvasRef.current) previewCanvasRef.current.getContext('2d').clearRect(0, 0, 640, 480);
    if (canvasRef.current) canvasRef.current.getContext('2d').clearRect(0, 0, 640, 480);
  };

  // STEP 5: Main Face Analysis Function
  const analyzeFace = async () => {
    setAnalyzing(true);
    setError('');
    if (!videoRef.current || !cameraOn || !videoPlaying) {
      setError('Camera not ready');
      setAnalyzing(false);
      return;
    }
    try {
      // STEP 5a: Detect face using AI
      const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks() // Get 68 facial landmarks
        .withAgeAndGender(); // Get age and gender estimation

      if (detections) {
        // STEP 5b: Analyze face shape using landmarks
        const faceShape = detectFaceShape(detections.landmarks);
        
        // STEP 5c: Get age (rounded to nearest integer)
        const age = Math.round(detections.age);
        
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx && videoRef.current) {
          ctx.drawImage(videoRef.current, 0, 0, 640, 480);
          const box = detections.detection.box;
          
          // STEP 5d: Extract face region for skin tone analysis
          const imgData = ctx.getImageData(box.x, box.y, box.width, box.height);
          
          // STEP 5e: Calculate skin tone
          const skinTone = getSkinTone(imgData);
          
          setAttributes({ faceShape, age, skinTone });

          // STEP 5f: Get hairstyle recommendations
          try {
            const response = await axios.get(`http://localhost:8080/api/styles/recommend?shape=${faceShape}&age=${age}&tone=${skinTone}&gender=Men`, {
              validateStatus: status => status < 500,
            });
            if (response.status === 200) {
              setSuggestedStyles(response.data || []);
            } else {
              throw new Error('Unexpected response status: ' + response.status);
            }
          } catch (apiError) {
            // Fallback to local filtering if API fails
            console.log("API not available, using local hairstyles");
            setSuggestedStyles(hairstyles.filter(h =>
              (h.tones.includes('All') || h.tones.includes(skinTone)) &&
              (h.faceShapes.includes('All') || h.faceShapes.includes(faceShape)) &&
              age >= h.ageMin && age <= h.ageMax
            ));
          }
        }
        
        // Initialize preview canvas after analysis
        if (previewCanvasRef.current) {
          previewCanvasRef.current.width = 640;
          previewCanvasRef.current.height = 480;
        }
        setDetectionDone(true);
      } else {
        setError('No face detected. Please look straight at the camera.');
      }
    } catch (error) {
      setError('Failed to analyze: ' + error.message);
      // Fallback to showing all men's hairstyles
      setSuggestedStyles(hairstyles);
    } finally {
      setAnalyzing(false);
    }
  };

  // STEP 6: Face Shape Detection Logic
  const detectFaceShape = (landmarks) => {
    const positions = landmarks.positions;
    
    // Get key facial measurements using landmark points:
    // - Points 0 and 16: Jaw corners
    // - Points 1 and 15: Cheek points  
    // - Points 18 and 25: Forehead points
    // - Points 8 and 27: Chin and nose bridge (for length)
    
    const jawWidth = Math.abs(positions[16].x - positions[0].x);
    const cheekWidth = Math.abs(positions[15].x - positions[1].x);
    const foreheadWidth = Math.abs(positions[25].x - positions[18].x);
    const faceLength = Math.abs(positions[8].y - positions[27].y);

    // Calculate face ratio (length vs width)
    const ratio = faceLength / jawWidth;
    
    // Face Shape Classification Logic:
    if (ratio > 1.5 && foreheadWidth > cheekWidth && foreheadWidth > jawWidth) return 'Heart';
    if (ratio > 1.5 && cheekWidth > foreheadWidth && cheekWidth > jawWidth) return 'Diamond';
    if (ratio > 1.5 && Math.abs(foreheadWidth - cheekWidth) < 15 && Math.abs(cheekWidth - jawWidth) < 15) return 'Oval';
    if (Math.abs(faceLength - jawWidth) < 25) return 'Round';
    if (jawWidth >= cheekWidth && jawWidth >= foreheadWidth) return 'Square';
    return 'Oval'; // Default fallback
  };

  // STEP 7: Skin Tone Detection Logic
  const getSkinTone = (imgData) => {
    let r = 0, g = 0, b = 0, count = 0;
    
    // Calculate average RGB values of the face region
    for (let i = 0; i < imgData.data.length; i += 4) {
      r += imgData.data[i];     // Red channel
      g += imgData.data[i + 1]; // Green channel  
      b += imgData.data[i + 2]; // Blue channel
      count++;
    }
    
    // Calculate brightness (average of RGB)
    const brightness = (r + g + b) / (3 * count);
    
    // Classify based on brightness thresholds:
    return brightness > 180 ? 'Fair' : brightness > 120 ? 'Medium' : 'Dark';
  };

  // STEP 8: Hairstyle Overlay Function
  const onSegmentationResults = (results) => {
    if (!previewCanvasRef.current || !videoRef.current || !selectedStyle || !videoPlaying) return;
    
    const ctx = previewCanvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, 640, 480);
    ctx.drawImage(results.image, 0, 0, 640, 480);

    const style = suggestedStyles.find(h => h.name === selectedStyle.name) || selectedStyle;
    if (style) {
      const img = new Image();
      img.src = style.imageUrl || style.image;
      img.onload = () => {
        // Use segmentation mask to blend hairstyle naturally
        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(results.segmentationMask, 0, 0, 640, 480);
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(img, 80, 20, 480, 360);
      };
    }
  };

  const handleTryOn = (style) => {
    setSelectedStyle(style);
  };

  const downloadSnap = () => {
    if (previewCanvasRef.current) {
      const dataURL = previewCanvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `tryon_${selectedStyle?.name}_${new Date().toISOString()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('No image to download. Please select a hairstyle and ensure camera is on.');
    }
  };

  return (
    <div className="w-full bg-[#212121] min-h-screen">
      <section
        className="bg-cover bg-center text-white text-center py-20 relative"
        style={{ backgroundImage: `url(${tryOnBg})` }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10">
          <div className="flex justify-center items-center gap-8 mb-8">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#F7BF24]"></div>
            <div className="w-3 h-3 bg-[#F7BF24] rotate-45"></div>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#F7BF24]"></div>
          </div>
          <p className="font-inter text-[#F7BF24] text-lg tracking-[3px] mb-4 uppercase">
            Experience Innovation
          </p>
          <h1 className="text-white text-center font-abril text-6xl md:text-7xl font-bold leading-none tracking-[4px] mb-8">
            VIRTUAL TRY-ON
          </h1>
          <p className="text-white/80 text-xl max-w-2xl mx-auto mb-8">
            Try on hairstyles in real-time and find your perfect look
          </p>
          <div className="flex justify-center items-center gap-8">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#F7BF24]"></div>
            <div className="text-[#F7BF24] text-2xl">✦</div>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#F7BF24]"></div>
          </div>
        </div>
      </section>

      <section className="bg-[#181818] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-8">
            {cameraOn ? (
              <button
                onClick={stopCamera}
                className="px-6 py-3 rounded-full font-inter text-sm font-semibold tracking-wide transition-all duration-300 border-2 bg-transparent text-[#F7BF24] border-[#F7BF24] hover:bg-[#F7BF24] hover:text-black flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
                Turn Off Camera
              </button>
            ) : (
              <button
                onClick={startCamera}
                className="px-6 py-3 rounded-full font-inter text-sm font-semibold tracking-wide transition-all duration-300 border-2 bg-transparent text-[#F7BF24] border-[#F7BF24] hover:bg-[#F7BF24] hover:text-black flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                Start Virtual Try-On
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="relative">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="w-full h-auto border border-gray-600 rounded-xl shadow-lg" 
                style={{ maxWidth: '640px', maxHeight: '480px' }} 
              />
              <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full opacity-0" />
              
              {!videoPlaying && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-xl">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2a2a2a] flex items-center justify-center border border-[#F7BF24]/30">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#F7BF24]" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                    </div>
                    <p className="text-white font-medium">Camera is {cameraOn ? 'loading' : 'off'}</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {cameraOn ? 'Please allow camera access' : 'Start camera to begin'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-white mb-6">Face Analysis</h3>
              
              {analyzing && (
                <div className="mb-6 p-4 bg-[#232323] rounded-lg border border-[#F7BF24]/30">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-[#F7BF24] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[#F7BF24]">Analyzing facial features...</p>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">Look straight at the camera for accurate analysis</p>
                </div>
              )}

              {!detectionDone ? (
                <button
                  onClick={analyzeFace}
                  className="px-8 py-4 rounded-xl font-inter text-base font-semibold tracking-wide transition-all duration-300 bg-gradient-to-r from-[#F7BF24] to-[#F9D371] text-black hover:shadow-lg hover:shadow-[#F7BF24]/30 disabled:opacity-50 disabled:cursor-not-allowed mb-6 flex items-center justify-center gap-2"
                  disabled={analyzing || !videoPlaying}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  Analyze Face
                </button>
              ) : (
                <div className="mb-6">
                  <p className="text-[#F7BF24] font-semibold mb-4">Analysis Complete!</p>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-[#232323] border border-gray-600 rounded-lg">
                      <p className="text-sm text-[#F7BF24] mb-1">Face Shape</p>
                      <p className="text-white text-lg font-medium">{attributes.faceShape}</p>
                      <p className="text-gray-400 text-xs">Determined by facial proportions and landmarks</p>
                    </div>
                    <div className="p-4 bg-[#232323] border border-gray-600 rounded-lg">
                      <p className="text-sm text-[#F7BF24] mb-1">Approximate Age</p>
                      <p className="text-white text-lg font-medium">{attributes.age} years</p>
                      <p className="text-gray-400 text-xs">AI-powered age estimation</p>
                    </div>
                    <div className="p-4 bg-[#232323] border border-gray-600 rounded-lg">
                      <p className="text-sm text-[#F7BF24] mb-1">Skin Tone</p>
                      <p className="text-white text-lg font-medium">{attributes.skinTone}</p>
                      <p className="text-gray-400 text-xs">Based on facial brightness analysis</p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg">
                  <p className="text-red-400">{error}</p>
                </div>
              )}
            </div>
          </div>

          {detectionDone && (
            <>
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Recommended Hairstyles For You</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {suggestedStyles.map((style) => (
                  <div
                    key={style.name}
                    className={`group relative overflow-hidden rounded-xl bg-[#232323] border transition-all duration-500 hover:shadow-xl transform hover:scale-105 ${
                      selectedStyle?.name === style.name 
                        ? 'border-[#F7BF24] shadow-[#F7BF24]/20' 
                        : 'border-gray-600 hover:border-[#F7BF24] hover:shadow-[#F7BF24]/20'
                    }`}
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={style.imageUrl || style.image}
                        alt={style.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-bold text-lg mb-2">{style.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-300">
                        <span className="bg-[#F7BF24]/20 text-[#F7BF24] px-2 py-1 rounded">
                          Best for {style.faceShapes.join(', ')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleTryOn(style)}
                      className="w-full mt-2 px-4 py-2 rounded-full font-inter text-sm font-semibold tracking-wide transition-all duration-300 bg-gradient-to-r from-[#F7BF24] to-[#F9D371] text-black hover:shadow-lg hover:shadow-[#F7BF24]/30"
                    >
                      Try This Style
                    </button>
                  </div>
                ))}
              </div>
              {suggestedStyles.length === 0 && (
                <div className="text-center py-8 bg-[#232323] rounded-xl border border-gray-600">
                  <p className="text-red-400">No suggestions found. Try adjusting your position or lighting.</p>
                </div>
              )}
            </>
          )}

          {selectedStyle && (
            <div className="mt-12 p-6 bg-[#232323] rounded-xl border border-gray-600">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Live Preview - {selectedStyle.name}</h3>
              <div className="flex flex-col items-center">
                <canvas 
                  ref={previewCanvasRef} 
                  className="w-full h-auto border border-gray-600 rounded-xl shadow-lg mb-6" 
                  style={{ maxWidth: '640px', maxHeight: '480px' }} 
                />
                <button
                  onClick={downloadSnap}
                  className="px-8 py-3 rounded-full font-inter text-base font-semibold tracking-wide transition-all duration-300 bg-gradient-to-r from-[#F7BF24] to-[#F9D371] text-black hover:shadow-lg hover:shadow-[#F7BF24]/30 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download Your Look
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#232323] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-white mb-8">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-6 bg-[#2a2a2a] rounded-lg">
              <div className="text-4xl font-bold text-[#F7BF24] mb-4">1</div>
              <div className="text-white font-semibold text-lg mb-2">Face Detection</div>
              <div className="text-gray-400">AI detects your face and 68 facial landmarks</div>
            </div>
            <div className="group p-6 bg-[#2a2a2a] rounded-lg">
              <div className="text-4xl font-bold text-[#F7BF24] mb-4">2</div>
              <div className="text-white font-semibold text-lg mb-2">Feature Analysis</div>
              <div className="text-gray-400">Analyzes face shape, age, and skin tone</div>
            </div>
            <div className="group p-6 bg-[#2a2a2a] rounded-lg">
              <div className="text-4xl font-bold text-[#F7BF24] mb-4">3</div>
              <div className="text-white font-semibold text-lg mb-2">Virtual Try-On</div>
              <div className="text-gray-400">Real-time hairstyle overlay using AR technology</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VirtualTryOnPage;