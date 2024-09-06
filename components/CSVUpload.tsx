/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import React, { useState } from 'react';
import axios from 'axios';

const CSVUpload = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event: { target: { files: React.SetStateAction<null>[]; }; }) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    if (!file) {
      alert('Please select a file first!');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post('http://localhost:8000/upload-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-corporate-white rounded shadow">
      <input 
        type="file" 
        onChange={handleFileChange} 
        className="mb-4 p-2 border border-corporate-blue rounded"
      />
      <button 
        type="submit" 
        className="px-4 py-2 bg-corporate-blue text-corporate-white rounded hover:bg-corporate-lightblue"
      >
        Upload CSV
      </button>
    </form>
  );
};

export default CSVUpload;