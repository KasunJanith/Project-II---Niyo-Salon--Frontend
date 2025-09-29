import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import * as tf from '@tensorflow/tfjs';

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

interface HairstyleType {
  id: number;
  name: string;
  image: string;
  overlay: string;
  category: string;
  faceShapes: string[];
  ageRange: number[];
  difficulty: string;
  tags: string[];
}

const VirtualTryOnPage = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [attributes, setAttributes] = useState({
    faceShape: 'Detecting...',
    age: 'Detecting...',
    skinTone: 'Detecting...'
  });
  const [suggestedStyles, setSuggestedStyles] = useState<HairstyleType[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<HairstyleType | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [detectionDone, setDetectionDone] = useState(false);
  const [error, setError] = useState('');
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);  const [showHowItWorks, setShowHowItWorks] = useState(false);  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiGeneratedImage, setAiGeneratedImage] = useState<string | null>(null);
  const overlayImageRef = useRef<HTMLImageElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);  // Enhanced hairstyle positioning with improved accuracy
  const drawHairstyleOverlay = async () => {
    // Check if animation should continue
    if (!isAnimationActiveRef.current) {
      console.log('🛑 Animation loop stopped by state check');
      return;
    }

    if (!previewCanvasRef.current || !videoRef.current || !selectedStyle || !videoPlaying) {
      console.log('⚠️ Missing requirements for overlay, retrying...', {
        canvas: !!previewCanvasRef.current,
        video: !!videoRef.current,
        style: !!selectedStyle,
        playing: videoPlaying
      });
      
      // Continue animation loop even if conditions aren't met temporarily
      if (isAnimationActiveRef.current) {
        animationFrameRef.current = requestAnimationFrame(drawHairstyleOverlay);
      }
      return;
    }

    const ctx = previewCanvasRef.current.getContext('2d');
    if (!ctx) {
      console.log('⚠️ No canvas context, retrying...');
      if (isAnimationActiveRef.current) {
        animationFrameRef.current = requestAnimationFrame(drawHairstyleOverlay);
      }
      return;
    }

    // Clear canvas and draw video frame
    ctx.clearRect(0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);
    ctx.drawImage(videoRef.current, 0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);
    
    // Always show canvas activity indicator
    ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
    ctx.fillRect(5, 5, 10, 10);
    
    // Add debugging info
    console.log('🎨 Canvas update:', {
      canvasSize: `${previewCanvasRef.current.width}x${previewCanvasRef.current.height}`,
      videoSize: `${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`,
      overlayLoaded: overlayImageRef.current?.complete,
      overlaySize: overlayImageRef.current ? `${overlayImageRef.current.width}x${overlayImageRef.current.height}` : 'none'
    });

    // Draw hairstyle overlay if loaded
    if (overlayImageRef.current && overlayImageRef.current.complete) {
      try {
        const detections = await faceapi.detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks();

        if (detections) {
          const landmarks = detections.landmarks;
          const positions = landmarks.positions;
          
          // Enhanced landmark selection for better positioning
          const leftTemple = positions[0];     // Far left of face (jawline)
          const rightTemple = positions[16];   // Far right of face (jawline)
          const leftEye = positions[36];       // Left eye outer corner
          const rightEye = positions[45];      // Right eye outer corner
          const noseBridge = positions[27];    // Nose bridge
          const topHead = positions[24];       // Top of head area
          const chin = positions[8];           // Chin
          
          if (leftEye && rightEye && leftTemple && rightTemple && noseBridge && topHead) {
            const canvasWidth = previewCanvasRef.current.width;
            const canvasHeight = previewCanvasRef.current.height;
            
            // Calculate face dimensions with better accuracy
            const faceWidth = Math.abs(rightTemple.x - leftTemple.x) * canvasWidth;
            const eyeDistance = Math.abs(rightEye.x - leftEye.x) * canvasWidth;
            const faceHeight = Math.abs(chin.y - topHead.y) * canvasHeight;
            
            // Calculate head center using eyes for better accuracy
            const headCenterX = ((leftEye.x + rightEye.x) / 2) * canvasWidth;
            const eyeLineY = ((leftEye.y + rightEye.y) / 2) * canvasHeight;
            
            // Estimate forehead position more accurately
            const foreheadY = eyeLineY - (eyeDistance * 0.8); // Better ratio for forehead
            
            // Calculate hairstyle dimensions with improved proportions
            const hairstyleBaseWidth = faceWidth * 1.4; // Better coverage
            const aspectRatio = overlayImageRef.current.height / overlayImageRef.current.width;
            let hairstyleHeight = hairstyleBaseWidth * aspectRatio;
            
            // Ensure minimum height for proper coverage
            hairstyleHeight = Math.max(hairstyleHeight, eyeDistance * 1.6);
            
            // Position the hairstyle with better alignment
            const hairstyleX = headCenterX - (hairstyleBaseWidth / 2);
            const hairstyleY = foreheadY - (hairstyleHeight * 0.75); // Better top positioning
            
            // Apply head rotation for natural movement
            const eyeAngle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
            
            ctx.save();
            
            // Transform for rotation
            ctx.translate(headCenterX, eyeLineY);
            ctx.rotate(eyeAngle);
            ctx.translate(-headCenterX, -eyeLineY);
            
            // Enhanced blending for more natural look
            ctx.globalAlpha = 0.88;
            ctx.globalCompositeOperation = 'source-over';
              // Draw hairstyle with enhanced positioning
            ctx.drawImage(
              overlayImageRef.current, 
              hairstyleX, 
              hairstyleY, 
              hairstyleBaseWidth, 
              hairstyleHeight
            );
            
            ctx.restore();
            
            // DEBUG: Add visible test rectangle to verify drawing is working
            ctx.fillStyle = 'rgba(247, 191, 36, 0.3)';
            ctx.fillRect(10, 10, 100, 50);
            ctx.fillStyle = '#F7BF24';
            ctx.font = '16px Arial';
            ctx.fillText('OVERLAY ACTIVE', 15, 35);
            
            // Debug info (remove in production)
            console.log('Enhanced positioning:', {
              headCenter: { x: headCenterX, y: eyeLineY },
              hairstylePos: { x: hairstyleX, y: hairstyleY },
              dimensions: { width: hairstyleBaseWidth, height: hairstyleHeight },
              rotation: eyeAngle * (180 / Math.PI) + '°'
            });
          }        } else {
          // Improved fallback positioning
          const scale = 0.8; // Slightly larger scale
          const width = overlayImageRef.current.width * scale;
          const height = overlayImageRef.current.height * scale;
          const x = (previewCanvasRef.current.width - width) / 2;
          const y = previewCanvasRef.current.height * 0.08; // Better top positioning
          
          ctx.globalAlpha = 0.85;
          ctx.drawImage(overlayImageRef.current, x, y, width, height);
          
          // DEBUG: Add visible test rectangle
          ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
          ctx.fillRect(50, 50, 100, 30);
          ctx.fillStyle = '#FF0000';
          ctx.font = '14px Arial';
          ctx.fillText('FALLBACK MODE', 55, 70);
        }
      } catch (error) {
        console.error('Face detection for positioning failed:', error);
        // Emergency fallback with better positioning
        const scale = 0.8;
        const width = overlayImageRef.current.width * scale;
        const height = overlayImageRef.current.height * scale;
        const x = (previewCanvasRef.current.width - width) / 2;
        const y = previewCanvasRef.current.height * 0.08;
        
        ctx.globalAlpha = 0.85;
        ctx.drawImage(overlayImageRef.current, x, y, width, height);
      }
    }    // Continue the animation loop only if still active
    if (isAnimationActiveRef.current) {
      animationFrameRef.current = requestAnimationFrame(drawHairstyleOverlay);
    } else {
      console.log('🛑 Animation loop ended');
    }
  };
  // Load overlay image when selected style changes
  useEffect(() => {
    if (selectedStyle) {
      console.log('Loading overlay for:', selectedStyle.name);
      console.log('Overlay URL:', selectedStyle.overlay);
      console.log('Fallback URL:', selectedStyle.image);
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      // Try overlay first, fallback to regular image
      img.src = selectedStyle.overlay || selectedStyle.image;
      
      img.onload = () => {
        console.log('✅ Overlay image loaded successfully!', {
          src: img.src,
          dimensions: `${img.width}x${img.height}`,
          complete: img.complete
        });
        overlayImageRef.current = img;
        
        // Force a redraw if animation is running
        if (animationFrameRef.current) {
          console.log('🔄 Forcing preview update...');
        }
      };
      
      img.onerror = (err) => {
        console.error('❌ Failed to load overlay image:', selectedStyle.overlay, err);
        console.log('🔄 Trying fallback image:', selectedStyle.image);
        
        // Fallback to regular image
        const fallbackImg = new Image();
        fallbackImg.crossOrigin = 'anonymous';
        fallbackImg.src = selectedStyle.image;
        fallbackImg.onload = () => {
          console.log('✅ Fallback image loaded successfully!', {
            src: fallbackImg.src,
            dimensions: `${fallbackImg.width}x${fallbackImg.height}`
          });
          overlayImageRef.current = fallbackImg;
        };
        fallbackImg.onerror = () => {
          console.error('❌ Failed to load fallback image:', selectedStyle.image);
          setError('Could not load hairstyle image. Please try another style.');
        };
      };
    } else {
      // Clear overlay when no style selected
      overlayImageRef.current = null;
      console.log('🧹 Cleared overlay image reference');
    }
  }, [selectedStyle]);  // Canvas test effect
  useEffect(() => {
    if (!previewCanvasRef.current) return;
    
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Immediate canvas test
    console.log('🧪 Testing canvas drawing...');
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 100, 100);
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('CANVAS TEST', 10, 30);
    console.log('✅ Canvas test complete');
  }, [selectedStyle]);
  // Animation loop management with stable references
  const isAnimationActiveRef = useRef(false);
  
  // Start animation when conditions are met
  useEffect(() => {
    const shouldAnimate = cameraOn && selectedStyle && videoPlaying;
    
    console.log('🎬 Animation state check:', { 
      cameraOn, 
      hasStyle: !!selectedStyle, 
      videoPlaying, 
      currentlyAnimating: isAnimationActiveRef.current,
      shouldAnimate 
    });

    if (shouldAnimate && !isAnimationActiveRef.current) {
      console.log('✅ Starting animation loop...');
      
      // Set canvas dimensions to match video
      if (previewCanvasRef.current && videoRef.current) {
        const videoWidth = videoRef.current.videoWidth || 640;
        const videoHeight = videoRef.current.videoHeight || 480;
        
        previewCanvasRef.current.width = 640;
        previewCanvasRef.current.height = 480;
        
        console.log('📐 Canvas dimensions set:', { 
          canvasWidth: previewCanvasRef.current.width,
          canvasHeight: previewCanvasRef.current.height,
          videoWidth, 
          videoHeight 
        });
      }
      
      isAnimationActiveRef.current = true;
      animationFrameRef.current = requestAnimationFrame(drawHairstyleOverlay);
      console.log('🚀 Animation frame requested');
      
    } else if (!shouldAnimate && isAnimationActiveRef.current) {
      console.log('🛑 Stopping animation loop...');
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      isAnimationActiveRef.current = false;
      console.log('🛑 Animation stopped');
    }
  }, [cameraOn, videoPlaying, selectedStyle?.id]); // Use stable selectedStyle.id instead of entire object

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
        await tf.setBackend('webgl');
        console.log('TensorFlow.js backend set to:', tf.getBackend());
        
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
    };

    loadModels();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, frameRate: 30 }
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
    // Stop animation loop
    isAnimationActiveRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Stop camera stream
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setCameraOn(false);
    setVideoPlaying(false);
    setAnalyzing(false);
    setDetectionDone(false);
    setAttributes({ faceShape: 'Detecting...', age: 'Detecting...', skinTone: 'Detecting...' });
    setSuggestedStyles([]);
    setSelectedStyle(null);
    
    // Clear canvases
    if (previewCanvasRef.current) {
      const ctx = previewCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);
      }
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
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
  };  const handleTryOn = (style: HairstyleType) => {
    console.log('🎯 handleTryOn called:', style.name);
    setSelectedStyle(style);
    
    // Force immediate overlay test with better error handling
    setTimeout(() => {
      if (!previewCanvasRef.current) {
        console.error('❌ Preview canvas not found!');
        return;
      }
      
      if (!videoRef.current) {
        console.error('❌ Video element not found!');
        return;
      }
      
      const ctx = previewCanvasRef.current.getContext('2d');
      if (!ctx) {
        console.error('❌ Cannot get canvas context!');
        return;
      }
      
      // Test basic canvas drawing first
      console.log('🧪 Testing basic canvas drawing...');
      ctx.fillStyle = 'red';
      ctx.fillRect(10, 10, 100, 50);
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.fillText('TEST DRAW', 15, 35);
      console.log('✅ Basic canvas test completed');
      
      // Clear and draw video frame
      setTimeout(() => {
        if (!previewCanvasRef.current || !videoRef.current) return;
        
        ctx.clearRect(0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);
        
        try {
          ctx.drawImage(videoRef.current, 0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);
          console.log('✅ Video frame drawn to canvas');
          
          // Test overlay if available
          if (overlayImageRef.current && overlayImageRef.current.complete) {
            console.log('🧪 Drawing overlay test...');
            
            // Draw overlay without face detection (simple center position)
            const scale = 0.6;
            const width = overlayImageRef.current.width * scale;
            const height = overlayImageRef.current.height * scale;
            const x = (previewCanvasRef.current.width - width) / 2;
            const y = 30; // Top of head area
            
            ctx.save();
            ctx.globalAlpha = 0.9;
            ctx.drawImage(overlayImageRef.current, x, y, width, height);
            ctx.restore();
            
            // Add visible confirmation
            ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
            ctx.fillRect(10, 60, 150, 30);
            ctx.fillStyle = 'black';
            ctx.font = 'bold 14px Arial';
            ctx.fillText('OVERLAY VISIBLE!', 15, 80);
            
            console.log('✅ Overlay test completed!', {
              overlaySize: `${overlayImageRef.current.width}x${overlayImageRef.current.height}`,
              drawnAt: { x, y, width, height }
            });
          } else {
            console.log('⏳ Overlay image not ready yet');
            ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
            ctx.fillRect(10, 60, 150, 30);
            ctx.fillStyle = 'black';
            ctx.font = 'bold 14px Arial';
            ctx.fillText('LOADING OVERLAY...', 15, 80);
          }
        } catch (error) {
          console.error('❌ Error during canvas drawing:', error);
          ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
          ctx.fillRect(10, 100, 150, 30);
          ctx.fillStyle = 'white';
          ctx.font = 'bold 14px Arial';
          ctx.fillText('DRAW ERROR!', 15, 120);
        }
      }, 200);
    }, 100);
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

  // AI Photo Generation function (using free Hugging Face API)
  const generateAIPhoto = async () => {
    if (!videoRef.current || !selectedStyle) {
      alert('Please select a hairstyle and ensure camera is on.');
      return;
    }

    setGeneratingAI(true);
    setAiGeneratedImage(null);

    try {
      // Capture current frame from video
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob for API
      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('image', blob, 'face.jpg');
        formData.append('prompt', `professional ${selectedStyle.name.toLowerCase()} hairstyle, ${attributes.skinTone.toLowerCase()} skin, ${attributes.faceShape.toLowerCase()} face, salon quality, natural lighting, high detail`);
        formData.append('negative_prompt', 'blurry, low quality, distorted face, multiple faces, cartoon');
        
        try {
          // Using Hugging Face Inference API (free tier available)
          const response = await fetch('https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer YOUR_HUGGING_FACE_TOKEN', // You'll need to get this free token
            },
            body: formData
          });
          
          if (response.ok) {
            const imageBlob = await response.blob();
            const imageUrl = URL.createObjectURL(imageBlob);
            setAiGeneratedImage(imageUrl);
          } else {
            throw new Error('AI generation failed');
          }
        } catch (error) {
          console.error('AI generation error:', error);
          alert('AI generation failed. This feature requires API setup. Using enhanced overlay instead.');
        }
      }, 'image/jpeg', 0.8);
      
    } catch (error) {
      console.error('Error preparing image for AI generation:', error);
      alert('Failed to prepare image for AI generation.');
    } finally {
      setGeneratingAI(false);
    }
  };

  const downloadAIImage = () => {
    if (aiGeneratedImage) {
      const link = document.createElement('a');
      link.href = aiGeneratedImage;
      link.download = `ai_hairstyle_${selectedStyle?.name}_${new Date().getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
          )}          {selectedStyle && (
            <div className="mt-12 p-6 bg-[#232323] rounded-xl border border-gray-600">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Live Preview - {selectedStyle.name}</h3>
              <div className="flex flex-col items-center">                <canvas
                  ref={previewCanvasRef}
                  width={640}
                  height={480}
                  className="border border-gray-600 rounded-xl shadow-lg mb-6"
                  style={{ 
                    width: '100%', 
                    maxWidth: '640px', 
                    height: 'auto',
                    display: 'block',
                    imageRendering: 'auto',
                    backgroundColor: '#000',
                    zIndex: 10,
                    position: 'relative'
                  }}
                />
                <div className="text-sm text-gray-400 mb-4 text-center">
                  {!overlayImageRef.current?.complete ? 'Loading hairstyle overlay...' : 'Real-time preview active - Move your head to see the hairstyle follow!'}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <button
                    onClick={downloadSnap}
                    className="px-6 py-3 rounded-full font-inter text-sm font-semibold tracking-wide transition-all duration-300 bg-gradient-to-r from-[#F7BF24] to-[#F9D371] text-black hover:shadow-lg hover:shadow-[#F7BF24]/30 flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download Preview
                  </button>
                  
                  <button
                    onClick={generateAIPhoto}
                    disabled={generatingAI}
                    className="px-6 py-3 rounded-full font-inter text-sm font-semibold tracking-wide transition-all duration-300 border-2 border-[#F7BF24] text-[#F7BF24] hover:bg-[#F7BF24] hover:text-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {generatingAI ? (
                      <>
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        Generating AI Photo...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        Generate AI Photo
                      </>
                    )}
                  </button>
                </div>

                {aiGeneratedImage && (
                  <div className="mt-8 p-4 bg-[#2a2a2a] rounded-xl border border-[#F7BF24]/30">
                    <h4 className="text-[#F7BF24] font-semibold mb-4 text-center">AI Generated Result</h4>
                    <div className="flex flex-col items-center">
                      <img 
                        src={aiGeneratedImage} 
                        alt="AI Generated Hairstyle" 
                        className="max-w-full h-auto rounded-lg border border-gray-600 mb-4"
                        style={{ maxHeight: '400px' }}
                      />
                      <button
                        onClick={downloadAIImage}
                        className="px-6 py-2 rounded-full font-inter text-sm font-semibold tracking-wide transition-all duration-300 bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Download AI Photo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default VirtualTryOnPage;