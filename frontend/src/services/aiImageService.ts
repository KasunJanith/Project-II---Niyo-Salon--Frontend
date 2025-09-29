// AI Image Generation Service
// This service provides multiple options for AI image generation

export interface AIGenerationOptions {
  faceImage: Blob;
  hairstyleName: string;
  faceShape: string;
  skinTone: string;
  age: string;
}

export interface AIServiceResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

// Option 1: Free Hugging Face API (requires free token)
export const generateWithHuggingFace = async (options: AIGenerationOptions): Promise<AIServiceResponse> => {
  const { faceImage, hairstyleName, faceShape, skinTone } = options;
  
  try {
    const formData = new FormData();
    formData.append('inputs', `professional ${hairstyleName.toLowerCase()} hairstyle on a person with ${skinTone.toLowerCase()} skin and ${faceShape.toLowerCase()} face shape, salon quality, natural lighting, photorealistic`);
    
    const response = await fetch('https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5', {
      method: 'POST',
      headers: {
        'Authorization': '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', // Get free token from huggingface.co
      },
      body: formData
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      return { success: true, imageUrl };
    } else {
      throw new Error(`API Error: ${response.status}`);
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Option 2: Replicate API (pay-per-use, very affordable ~$0.01 per image)
export const generateWithReplicate = async (options: AIGenerationOptions): Promise<AIServiceResponse> => {
  const { hairstyleName, faceShape, skinTone } = options;
  
  try {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': 'Token your_replicate_token_here',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4", // Stable Diffusion model
        input: {
          prompt: `professional ${hairstyleName.toLowerCase()} hairstyle, ${skinTone.toLowerCase()} skin, ${faceShape.toLowerCase()} face, salon quality, natural lighting, high detail, photorealistic`,
          negative_prompt: "blurry, low quality, distorted face, multiple faces, cartoon, anime",
          width: 512,
          height: 512,
          guidance_scale: 7.5,
          num_inference_steps: 20
        }
      })
    });
    
    const prediction = await response.json();
    
    // Poll for completion
    const pollForResult = async (predictionId: string): Promise<string> => {
      const checkResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: { 'Authorization': 'Token your_replicate_token_here' }
      });
      const result = await checkResponse.json();
      
      if (result.status === 'succeeded') {
        return result.output[0];
      } else if (result.status === 'failed') {
        throw new Error('Generation failed');
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return pollForResult(predictionId);
      }
    };
    
    const imageUrl = await pollForResult(prediction.id);
    return { success: true, imageUrl };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Option 3: Fallback to enhanced overlay (always works)
export const generateEnhancedOverlay = async (options: AIGenerationOptions): Promise<AIServiceResponse> => {
  // This would create a more sophisticated overlay using multiple techniques
  // For now, return success to indicate fallback to existing overlay system
  return { 
    success: true, 
    imageUrl: 'use_existing_overlay' // Special flag for enhanced overlay
  };
};

// Main generation function with fallback options
export const generateHairstyleImage = async (options: AIGenerationOptions): Promise<AIServiceResponse> => {
  // Try Hugging Face first (free)
  console.log('Attempting AI generation with Hugging Face...');
  const hfResult = await generateWithHuggingFace(options);
  if (hfResult.success) return hfResult;
  
  // Try Replicate (paid but very cheap)
  console.log('Hugging Face failed, trying Replicate...');
  const replicateResult = await generateWithReplicate(options);
  if (replicateResult.success) return replicateResult;
  
  // Fallback to enhanced overlay
  console.log('AI services unavailable, using enhanced overlay...');
  return generateEnhancedOverlay(options);
};

// Setup instructions for users
export const getSetupInstructions = () => {
  return {
    huggingFace: {
      title: "Free Option: Hugging Face",
      steps: [
        "1. Go to https://huggingface.co and create a free account",
        "2. Go to Settings > Access Tokens",
        "3. Create a new token with 'Read' permissions",
        "4. Replace 'hf_your_token_here' in the code with your token",
        "5. Free tier allows ~1000 requests per month"
      ],
      cost: "Free (limited usage)"
    },
    replicate: {
      title: "Paid Option: Replicate",
      steps: [
        "1. Go to https://replicate.com and create an account",
        "2. Add a payment method (they charge per usage)",
        "3. Go to Account > API tokens",
        "4. Copy your API token",
        "5. Replace 'your_replicate_token_here' in the code"
      ],
      cost: "~$0.01 per image generation"
    }
  };
};
