import React, { useState } from 'react';
import Button from '../../components/Common/Button';

const TryOnButton = ({ product }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultPath, setResultPath] = useState(null);
  const [personImage, setPersonImage] = useState(null);

  const handleFileChange = e => {
    const file = e.target.files[0];
    setPersonImage(file);
  };

  const handleTryOn = async () => {
    if (!personImage) {
      setError('Please upload an image of yourself.');
      return;
    }

    setLoading(true);
    setError('');
    setResultPath(null);

    const formData = new FormData();
    formData.append('person_img', personImage); // User uploaded image
    formData.append('garment_img', product.imageUrl); // Product image URL

    try {
      const response = await fetch('http://localhost:5000/process', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Try-on failed. Please try again.');
      }

      if (data.result_path) {
        const resultUrl = `http://localhost:5000/serve/${encodeURIComponent(
          data.result_path
        )}`;
        window.open(resultUrl, '_blank');
      } else {
        alert('Error in processing');
      }
    } catch (err) {
      setError(err.message);
      console.error('Try-on error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='try-on-section'>
      <input
        type='file'
        accept='image/*'
        onChange={handleFileChange}
        className='file-input'
      />
      <Button
        variant='secondary'
        text={loading ? 'Processing...' : 'Try On'}
        className='try-on-btn'
        onClick={handleTryOn}
        disabled={loading}
      />
      {error && <p className='error-text'>{error}</p>}
      {resultPath && (
        <div className='tryon-result'>
          <h4>Result</h4>
          <img src={`http://localhost:5000${resultPath}`} alt='Try-on result' />
        </div>
      )}
    </div>
  );
};

export default TryOnButton;
