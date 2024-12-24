import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import products from './products.json';

// Load the MobileNet model
let model = null;
const loadModel = async () => {
  if (!model) {
    model = await mobilenet.load();
  }
};

// Calculate cosine similarity between two embeddings
const calculateSimilarity = (vec1, vec2) => {
  const dotProduct = vec1.reduce((sum, v, i) => sum + v * vec2[i], 0);
  const norm1 = Math.sqrt(vec1.reduce((sum, v) => sum + v * v, 0));
  const norm2 = Math.sqrt(vec2.reduce((sum, v) => sum + v * v, 0));
  return dotProduct / (norm1 * norm2);
};

// Preprocess the uploaded image
const preprocessImage = async file => {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = async e => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 224;
        canvas.height = 224;
        ctx.drawImage(img, 0, 0, 224, 224);

        const tensor = tf.browser
          .fromPixels(canvas)
          .toFloat()
          .div(255.0)
          .expandDims(); // Add batch dimension
        resolve(tensor);
      };
    };
    reader.readAsDataURL(file);
  });
};

// Perform image search
export const searchByImage = async uploadedFile => {
  await loadModel(); // Ensure the model is loaded

  const processedImage = await preprocessImage(uploadedFile);
  const uploadedEmbedding = Array.from(
    (await model.infer(processedImage, true)).dataSync()
  ); // Generate embedding

  // Compare uploaded embedding with stored embeddings
  const matches = products
    .map(product => ({
      ...product,
      similarity: calculateSimilarity(uploadedEmbedding, product.embedding)
    }))
    .sort((a, b) => b.similarity - a.similarity) // Sort by similarity
    .slice(0, 5); // Return top 5 matches

  return matches;
};
