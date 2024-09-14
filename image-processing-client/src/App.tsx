import React, { useState } from 'react';
import axios from 'axios';

const App: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [brightness, setBrightness] = useState<number>(1);
  const [contrast, setContrast] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedImage = e.target.files[0];
      setImage(selectedImage);

      // Create a preview URL for the uploaded image
      const imageURL = URL.createObjectURL(selectedImage);
      setPreview(imageURL);
    }
  };

  const uploadImage = async () => {
    if (!image) return; // Ensure there's an image before uploading

    const formData = new FormData();
    formData.append('image', image);
  
    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      console.log('Image uploaded successfully:', response.data);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const processImage = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append('image', image);
    formData.append('brightness', brightness.toString());
    formData.append('contrast', contrast.toString());
    formData.append('rotate', rotation.toString());

    try {
      const response = await axios.post('http://localhost:5000/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob', // Expecting an image blob response
      });

      const processedURL = URL.createObjectURL(response.data);
      setPreview(processedURL);
    } catch (err) {
      console.error('Error processing image:', err);
    }
  };

  return (
    <div>
      <h1>Image Processing App</h1>
      
      <input type="file" accept="image/png, image/jpeg" onChange={handleImageUpload} />
      <button onClick={uploadImage} disabled={!image}>Upload Image</button>

      {preview && <img src={preview} alt="Preview" width="300" />}

      <div>
        <label>Brightness</label>
        <input
          type="range"
          min="0.1"
          max="2"
          step="0.1"
          value={brightness}
          onChange={(e) => setBrightness(parseFloat(e.target.value))}
        />
      </div>

      <div>
        <label>Contrast</label>
        <input
          type="range"
          min="0.1"
          max="2"
          step="0.1"
          value={contrast}
          onChange={(e) => setContrast(parseFloat(e.target.value))}
        />
      </div>

      <div>
        <label>Rotation</label>
        <input
          type="range"
          min="0"
          max="360"
          step="1"
          value={rotation}
          onChange={(e) => setRotation(parseFloat(e.target.value))}
        />
      </div>

      <button onClick={processImage} disabled={!image}>Process Image</button>
      
      
    </div>
  );
};

export default App;
