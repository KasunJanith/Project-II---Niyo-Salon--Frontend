import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import * as tf from '@tensorflow/tfjs';
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';

const hairstyles = [
  {
    id: 1,
    name: "Classic Crew Cut",
    image: "/hairstyles/crew-cut.png",
    overlay: "/hairstyles/overlays/crew-cut-overlay.png",
    category: "short",
    faceShapes: ["oval", "square", "round"],
    ageRange: [18, 60],
    difficulty: "low",
    tags: ["professional", "low-maintenance"]
  },
  {
    id: 2,
    name: "Modern Pompadour",
    image: "/hairstyles/pompadour.png",
    overlay: "/hairstyles/overlays/pompadour-overlay.png",
    category: "medium",
    faceShapes: ["oval", "heart"],
    ageRange: [20, 45],
    difficulty: "medium",
    tags: ["stylish", "formal"]
  },
  {
    id: 3,
    name: "Textured Crop",
    image: "/hairstyles/crop.png",
    overlay: "/hairstyles/overlays/crop-overlay.png",
    category: "short",
    faceShapes: ["oval", "square", "diamond"],
    ageRange: [18, 50],
    difficulty: "low",
    tags: ["modern", "youthful"]
  },
  {
    id: 4,
    name: "Side Part",
    image: "/hairstyles/side-part.png",
    overlay: "/hairstyles/overlays/side-part-overlay.png",
    category: "medium",
    faceShapes: ["oval", "round", "square"],
    ageRange: [25, 60],
    difficulty: "medium",
    tags: ["classic", "professional"]
  },
  {
    id: 5,
    name: "Undercut",
    image: "/hairstyles/undercut.png",
    overlay: "/hairstyles/overlays/undercut-overlay.png",
    category: "short",
    faceShapes: ["oval", "square"],
    ageRange: [18, 45],
    difficulty: "high",
    tags: ["edgy", "modern"]
  },
  {
    id: 6,
    name: "Quiff",
    image: "/hairstyles/quiff.png",
    overlay: "/hairstyles/overlays/quiff-overlay.png",
    category: "medium",
    faceShapes: ["oval", "heart"],
    ageRange: [20, 50],
    difficulty: "medium",
    tags: ["voluminous", "stylish"]
  }
];

const rgbToLab = (r, g, b) => {
  r = r / 255;
  g = g / 255;
  b = b / 255;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  r *= 100;
  g *= 100;
  b *= 100;

  const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const z = r * 0.0193 + g * 0.1192 + b * 0.9505;

  const xn = 95.047, yn = 100.000, zn = 108.883;
  const xRatio = x / xn;
  const yRatio = y / yn;
  const zRatio = z / zn;

  const fx = xRatio > 0.008856 ? Math.pow(xRatio, 1/3) : (7.787 * xRatio) + (16/116);
  const fy = yRatio > 0.008856 ? Math.pow(yRatio, 1/3) : (7.787 * yRatio) + (16/116);
  const fz = zRatio > 0.008856 ? Math.pow(zRatio, 1/3) : (7.787 * zRatio) + (16/116);

  const l = (116 * fy) - 16;
  const a = 500 * (fx - fy);
  const bLab = 200 * (fy - fz);

  return { l, a, b: bLab };
};

const VirtualTryOnPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const [attributes, setAttributes] = useState({
    faceShape: 'Detecting...',
    age: 'Detecting...',
    skinTone: 'Detecting...'
  });
  const [suggestedStyles, setSuggestedStyles] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [detectionDone, setDetectionDone] = useState(false);
  const [error, setError] = useState('');
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const selfieSegmentation = useRef(null);
  const overlayImageRef = useRef(null);
  const faceLandmarksRef = useRef(null);

  const onSegmentationResults = (results) => {
    if (!previewCanvasRef.current || !videoRef.current || !selectedStyle || !videoPlaying) return;

    const ctx = previewCanvasRef.current.getContext('2d');
    if (!ctx) {
      console.error('Canvas context not available');
      return;
    }
    ctx.clearRect(0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);

    // Draw the camera feed as background
    ctx.drawImage(videoRef.current, 0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);

    // Apply segmentation mask to isolate the person
    ctx.globalCompositeOperation = 'source-in';
    ctx.drawImage(results.segmentationMask, 0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);

    // Reset composite operation for drawing the overlay
    ctx.globalCompositeOperation = 'source-over';

    // Draw the hairstyle overlay using facial landmarks if available
    if (overlayImageRef.current && overlayImageRef.current.complete && faceLandmarksRef.current) {
      const landmarks = faceLandmarksRef.current;
      const nose = landmarks.getNose();
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();

      console.log('Landmarks detected:', { nose, leftEye, rightEye });
      if (!nose || !leftEye || !rightEye) {
        console.warn('Incomplete facial landmarks');
        return;
      }

      const headWidth = Math.abs(rightEye.x - leftEye.x) * previewCanvasRef.current.width;
      const headHeight = headWidth * 1.2;
      const x = (nose.x * previewCanvasRef.current.width) - (headWidth / 2);
      const y = (nose.y * previewCanvasRef.current.height) - (headHeight / 2);

      ctx.drawImage(overlayImageRef.current, x, y, headWidth, headHeight);
    } else {
      console.warn('Overlay image or landmarks not ready:', {
        overlayLoaded: overlayImageRef.current?.complete,
        landmarksAvailable: !!faceLandmarksRef.current,
      });
    }
  };

  const analyzeSkinTone = (faceImage) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = faceImage.width;
      canvas.height = faceImage.height;
      ctx.drawImage(faceImage, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let totalL = 0, skinPixels = 0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (r > 95 && g > 40 && b > 20 &&
            Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
            Math.abs(r - g) > 15 && r > g && r > b) {
          const lab = rgbToLab(r, g, b);
          totalL += lab.l;
          skinPixels++;
        }
      }

      if (skinPixels === 0) return 'Medium';

      const avgL = totalL / skinPixels;

      if (avgL > 65) return 'Fair';
      if (avgL > 50) return 'Medium';
      if (avgL > 35) return 'Tan';
      return 'Dark';
    } catch (error) {
      console.error('Skin tone analysis failed:', error);
      return 'Medium';
    }
  };

  const detectFaceShapeGeometric = (landmarks) => {
    const positions = landmarks.positions;

    const jawWidth = Math.abs(positions[16].x - positions[0].x);
    const cheekWidth = Math.abs(positions[13].x - positions[3].x);
    const foreheadWidth = Math.abs(positions[21].x - positions[22].x);
    const faceLength = Math.abs(positions[8].y - positions[27].y);

    const ratios = {
      lengthToJaw: faceLength / jawWidth,
      cheekToJaw: cheekWidth / jawWidth,
      foreheadToJaw: foreheadWidth / jawWidth
    };

    if (ratios.lengthToJaw > 1.5) {
      if (ratios.foreheadToJaw > 1.1) return 'Oval';
      if (ratios.cheekToJaw > 1.05) return 'Diamond';
      return 'Oblong';
    }

    if (ratios.lengthToJaw < 1.3) {
      if (Math.abs(jawWidth - cheekWidth) < jawWidth * 0.1) return 'Round';
      return 'Square';
    }

    if (ratios.foreheadToJaw > 1.05) return 'Heart';

    return 'Oval';
  };

  useEffect(() => {
    const loadModels = async () => {
      try {
        await tf.ready();
        await tf.setBackend('webgl'); // Ensure WebGL backend is set
        const MODEL_URL = '/models';
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);

        console.log('All models loaded successfully');
        setModelsLoaded(true);
      } catch (err) {
        console.error('Failed to load face detection models:', err);
        setError('Some features may not work properly. Please refresh the page.');
        setModelsLoaded(true);
      }

      try {
        selfieSegmentation.current = new SelfieSegmentation({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
        });

        selfieSegmentation.current.setOptions({
          modelSelection: 1,
          selfieMode: true,
          minDetectionConfidence: 0.5, // Lower confidence to avoid missing detections
        });

        selfieSegmentation.current.onResults(onSegmentationResults);
      } catch (err) {
        console.error('Failed to initialize selfie segmentation:', err);
        setError('Segmentation initialization failed. Please check your browser settings.');
      }
    };

    loadModels();
  }, []);

  useEffect(() => {
    if (cameraOn && selectedStyle && previewCanvasRef.current && videoPlaying) {
      const overlayInterval = setInterval(async () => {
        if (videoRef.current && selfieSegmentation.current) {
          try {
            const videoWidth = videoRef.current.videoWidth;
            const videoHeight = videoRef.current.videoHeight;
            if (videoWidth && videoHeight) {
              previewCanvasRef.current.width = videoWidth;
              previewCanvasRef.current.height = videoHeight;
              // Debug WebGL context
              const gl = document.createElement('canvas').getContext('webgl2');
              console.log('WebGL2 supported:', !!gl);
              await selfieSegmentation.current.send({ image: videoRef.current });
              const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
              if (detections) {
                faceLandmarksRef.current = detections.landmarks;
                console.log('Face landmarks updated:', detections.landmarks);
              } else {
                console.warn('No face detected in current frame');
              }
            } else {
              console.warn('Video dimensions not available yet');
            }
          } catch (err) {
            console.error('Segmentation or landmark detection error:', err);
            setError('Error processing video feed. Check console for details. Try restarting the camera.');
          }
        }
      }, 100);

      return () => clearInterval(overlayInterval);
    }
  }, [cameraOn, selectedStyle, videoPlaying]);

  useEffect(() => {
    if (selectedStyle) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = selectedStyle.overlay || selectedStyle.image;
      img.onload = () => {
        overlayImageRef.current = img;
        console.log('Overlay image loaded:', selectedStyle.overlay);
      };
      img.onerror = () => {
        console.error('Failed to load overlay image:', selectedStyle.overlay);
        setError('Could not load hairstyle overlay. Check image paths or server configuration.');
        const fallbackImg = new Image();
        fallbackImg.src = selectedStyle.image;
        fallbackImg.onload = () => {
          overlayImageRef.current = fallbackImg;
          console.log('Fallback image loaded:', selectedStyle.image);
        };
        fallbackImg.onerror = () => {
          console.error('Failed to load fallback image:', selectedStyle.image);
        };
      };
    }
  }, [selectedStyle]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setVideoPlaying(true);
                setCameraOn(true);
                setError('');
                console.log('Camera started successfully');
              })
              .catch((err) => {
                console.error('Video play failed:', err);
                setError('Camera access issue: ' + err.message);
                stopCamera();
              });
          }
        };
      }
    } catch (err) {
      setError('Camera access denied: ' + err.message);
      console.error('Camera error:', err);
    }
  };

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
    if (previewCanvasRef.current) {
      previewCanvasRef.current.getContext('2d').clearRect(0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);
    }
    if (canvasRef.current) {
      canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const analyzeFace = async () => {
    if (!modelsLoaded) {
      setError('Models are still loading. Please wait...');
      return;
    }

    setAnalyzing(true);
    setError('');

    if (!videoRef.current || !cameraOn || !videoPlaying) {
      setError('Camera not ready');
      setAnalyzing(false);
      return;
    }

    try {
      const detections = await faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks().withAgeAndGender();

      if (detections) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, 640, 480);

        const box = detections.detection.box;

        const faceCanvas = document.createElement('canvas');
        faceCanvas.width = box.width;
        faceCanvas.height = box.height;
        const faceCtx = faceCanvas.getContext('2d');
        faceCtx.drawImage(
          canvasRef.current,
          box.x, box.y, box.width, box.height,
          0, 0, box.width, box.height
        );

        const faceShape = detectFaceShapeGeometric(detections.landmarks);

        const rawAge = detections.age;
        let calibratedAge = Math.round(rawAge);

        if (rawAge < 25) {
          calibratedAge = Math.max(18, Math.round(rawAge * 0.8));
        } else if (rawAge < 40) {
          calibratedAge = Math.round(rawAge * 0.85);
        } else {
          calibratedAge = Math.round(rawAge * 0.9);
        }

        const skinTone = analyzeSkinTone(faceCanvas);

        setAttributes({ faceShape, age: calibratedAge, skinTone });

        const recommendations = getHairstyleRecommendations(faceShape, calibratedAge, skinTone);
        setSuggestedStyles(recommendations);

        if (previewCanvasRef.current) {
          previewCanvasRef.current.width = 640;
          previewCanvasRef.current.height = 480;
        }

        setDetectionDone(true);
      } else {
        setError('No face detected. Please ensure good lighting and look straight at the camera.');
      }
    } catch (error) {
      console.error('Face analysis error:', error);
      setError('Analysis failed. Please try again.');
      setSuggestedStyles(hairstyles.slice(0, 6));
    } finally {
      setAnalyzing(false);
    }
  };

  const getHairstyleRecommendations = (faceShape, age, skinTone) => {
    return hairstyles
      .filter(style => {
        const shapeMatch = style.faceShapes.includes(faceShape.toLowerCase()) ||
                          style.faceShapes.includes('all');
        const ageMatch = age >= style.ageRange[0] && age <= style.ageRange[1];
        return shapeMatch && ageMatch;
      })
      .slice(0, 6);
  };

  const handleTryOn = (style) => {
    setSelectedStyle(style);
  };

  const downloadSnap = () => {
    if (previewCanvasRef.current) {
      const dataURL = previewCanvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `hairstyle_tryon_${selectedStyle?.name}_${new Date().getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('No image to download. Please select a hairstyle and ensure camera is on.');
    }
  };

  return (
    <div className="w-full bg-[#212121] min-h-screen">
      <section className="bg-cover bg-center text-white text-center py-20 relative bg-gradient-to-r from-gray-900 to-black">
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

      <section className="bg-[#232323] py-12">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => setShowHowItWorks(!showHowItWorks)}
            className="w-full bg-[#2a2a2a] hover:bg-[#333] text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-between"
          >
            <span className="text-lg">How It Works</span>
            <svg
              className={`w-6 h-6 transform transition-transform duration-300 ${
                showHowItWorks ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showHowItWorks && (
            <div className="mt-6 bg-[#2a2a2a] rounded-lg p-6 border border-[#F7BF24]/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-[#F7BF24] rounded-full flex items-center justify-center text-black font-bold text-xl">
                    1
                  </div>
                  <h3 className="text-white font-bold mb-2">Start Camera</h3>
                  <p className="text-gray-400 text-sm">
                    Click "Start Virtual Try-On" to activate your camera. Make sure you're in a well-lit area.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-[#F7BF24] rounded-full flex items-center justify-center text-black font-bold text-xl">
                    2
                  </div>
                  <h3 className="text-white font-bold mb-2">Analyze Face</h3>
                  <p className="text-gray-400 text-sm">
                    Click "Analyze Face" to detect your face shape, age, and skin tone for personalized recommendations.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-[#F7BF24] rounded-full flex items-center justify-center text-black font-bold text-xl">
                    3
                  </div>
                  <h3 className="text-white font-bold mb-2">Try & Download</h3>
                  <p className="text-gray-400 text-sm">
                    Choose a hairstyle and see it on yourself in real-time. Download your favorite looks!
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-[#333] rounded-lg">
                <h4 className="text-[#F7BF24] font-semibold mb-2">Tips for Best Results:</h4>
                <ul className="text-gray-400 text-sm list-disc list-inside space-y-1">
                  <li>Ensure good lighting on your face</li>
                  <li>Look straight at the camera</li>
                  <li>Remove hats or accessories that cover your hair</li>
                  <li>Stay still during analysis for accurate results</li>
                </ul>
              </div>
            </div>
          )}
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
                  disabled={analyzing || !videoPlaying || !modelsLoaded}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  {!modelsLoaded ? 'Loading Models...' : 'Analyze Face'}
                </button>
              ) : (
                <div className="mb-6">
                  <p className="text-[#F7BF24] font-semibold mb-4">Analysis Complete!</p>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-[#232323] border border-gray-600 rounded-lg">
                      <p className="text-sm text-[#F7BF24] mb-1">Face Shape</p>
                      <p className="text-white text-lg font-medium">{attributes.faceShape}</p>
                    </div>
                    <div className="p-4 bg-[#232323] border border-gray-600 rounded-lg">
                      <p className="text-sm text-[#F7BF24] mb-1">Approximate Age</p>
                      <p className="text-white text-lg font-medium">{attributes.age} years</p>
                    </div>
                    <div className="p-4 bg-[#232323] border border-gray-600 rounded-lg">
                      <p className="text-sm text-[#F7BF24] mb-1">Skin Tone</p>
                      <p className="text-white text-lg font-medium">{attributes.skinTone}</p>
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
                    key={style.id}
                    className={`group relative overflow-hidden rounded-xl bg-[#232323] border transition-all duration-500 hover:shadow-xl transform hover:scale-105 ${
                      selectedStyle?.id === style.id
                        ? 'border-[#F7BF24] shadow-[#F7BF24]/20'
                        : 'border-gray-600 hover:border-[#F7BF24] hover:shadow-[#F7BF24]/20'
                    }`}
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={style.image}
                        alt={style.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-bold text-lg mb-2">{style.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-300">
                        <span className="bg-[#F7BF24]/20 text-[#F7BF24] px-2 py-1 rounded">
                          {style.category}
                        </span>
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                          {style.difficulty}
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
    </div>
  );
};

export default VirtualTryOnPage;