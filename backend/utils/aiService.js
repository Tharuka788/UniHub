const { pipeline } = require('@xenova/transformers');
const fs = require('fs');

// We cache the pipeline so we don't load the model into memory on every upload
let extractorPipeline = null;

const getExtractor = async () => {
  if (!extractorPipeline) {
    console.log('Loading local AI model (Xenova/clip-vit-base-patch32) for the first time...');
    console.log('This might take a minute on the very first run as it downloads ~150MB of weights.');
    
    // We use image-feature-extraction for CLIP models to get the image vector
    extractorPipeline = await pipeline('image-feature-extraction', 'Xenova/clip-vit-base-patch32');
  }
  return extractorPipeline;
};

/**
 * Generates an embedding for an image using a local Transformers.js model.
 * Uses a CLIP model to generate a feature vector entirely on the CPU - no API keys needed!
 */
const generateImageEmbedding = async (imagePath) => {
  try {
    console.log('Generating AI vector embedding locally...');
    
    // Prevent crashes if file is missing
    if (!fs.existsSync(imagePath)) {
       console.error('Image file not found:', imagePath);
       return null;
    }
    
    const extractor = await getExtractor();
    
    // The extractor takes the absolute file path, reads it, and transforms it
    const output = await extractor(imagePath);
    
    // output.data contains the Float32Array embedding
    if (output && output.data) {
      return Array.from(output.data);
    }
    
    return null;
  } catch (error) {
    console.error('Error generating local image embedding:', error.message);
    return null;
  }
};

/**
 * Calculates Cosine Similarity between two arrays (vectors).
 * Returns a value between -1 and 1.
 */
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

module.exports = {
  generateImageEmbedding,
  cosineSimilarity,
};
