import React, { useState } from 'react';
import Button from '../../Common/Button';
import './styles.css';

const GEMINI_API_KEY = 'AIzaSyC1D5-MKD0Et9tRDx1INRyGJ22XBfRLZw8'; // Replace with your actual API key
const API_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const ImageWithGenerate = ({ imageUrl, altText }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateFashionArticle = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Write a short 4-5 sentence for product description. Include key features in **bold**. Describe: ${altText}`
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText =
        data.candidates[0]?.content?.parts[0]?.text ||
        'Unable to generate description';
      setGeneratedArticle(generatedText);
    } catch (error) {
      console.error('Error:', error);
      setGeneratedArticle('Failed to generate description');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='image-generator-container'>
      <div
        className='image-container'
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img src={imageUrl} alt={altText} className='product-image' />
        {isHovered && (
          <div className='hover-overlay'>
            <Button
              text={isLoading ? 'Generating...' : 'Generate Description'}
              onClick={generateFashionArticle}
              disabled={isLoading}
            />
          </div>
        )}
      </div>
      {generatedArticle && (
        <div className='generated-article'>
          <h5>Product Description:</h5>
          <div
            dangerouslySetInnerHTML={{
              __html: generatedArticle.replace(
                /\*\*(.*?)\*\*/g,
                '<strong>$1</strong>'
              )
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageWithGenerate;
