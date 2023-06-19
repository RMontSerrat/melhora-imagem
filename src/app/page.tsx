'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactCompareImage from 'react-compare-image';
import NextImage from 'next/image';
import axios from 'axios';
import { MdDownload } from 'react-icons/md';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';

async function resizeImage(file: File, maxSizeInBytes: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (event: ProgressEvent<FileReader>) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxWidth = 800;
        const maxHeight = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(function (blob) {
          if (blob) {
            if (blob.size <= maxSizeInBytes) {
              resolve(blob);
            } else {
              reject(new Error('Image exceeds the maximum size.'));
            }
          } else {
            reject(new Error('Failed to resize image.'));
          }
        }, 'image/jpeg', 0.7); // 0.7 is the image quality (0.0 - 1.0)
      };
      if (event.target) {
        img.src = event.target.result as string;
      }
    };
    reader.onerror = function (event: ProgressEvent<FileReader>) {
      reject(new Error('Failed to read image file.'));
    };
    reader.readAsDataURL(file);
  });
}

const ImageImprovement = () => {
  const [imageUpload, setImageUpload] = useState<File | Blob | null>(null);
  const [imagePrediction, setImagePrediction] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback(async () => {
    if (imageUpload) {
      setIsLoading(true);

      try {
        const formData = new FormData();
        formData.append('image', imageUpload);

        const response = await axios.post('/api/predictions', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.status !== 200 || Object.keys(response.data).length <= 0) {
          setError('erro');
          setIsLoading(false);
          setIsModalOpen(false);
          return;
        }

        const prediction = response.data;
        setImagePrediction(prediction);
      } catch (error: any) {
        setError(error?.message || 'Erro');
        setIsModalOpen(false);
        console.error('Ocorreu um erro ao enviar a imagem para a API:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [imageUpload]);

  useEffect(() => {
    if (imageUpload) {
      handleImageUpload();
      setIsModalOpen(true);
    }
  }, [handleImageUpload, imageUpload]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file: File | null = event.target.files ? event.target.files[0] : null;
    setError(null);
    if (!file) return;
    const maxSize = 500 * 1024; // 300KB
    try {
      const resizedImage = await resizeImage(file, maxSize);
      setImageUpload(resizedImage);
    } catch (error) {
      setImageUpload(file);
    }
  };

  const handleButtonClick = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setImageUpload(null);
    setImagePrediction(null);
  };

  const handleDownload = () => {
    if (imagePrediction) {
      const link = document.createElement('a');
      link.href = imagePrediction;
      link.download = 'imagem_replicada.jpg';
      link.target = '_blank';
      link.click();
    }
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col justify-center text-center items-center py-2 px-4">
      <h1 className="text-4xl font-bold mb-4 font-montserrat">Melhore suas imagens</h1>
      <h2 className="text-2xl mb-8 font-montserrat">Transforme fotos comuns em obras de arte</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-4"
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      <button
        className="font-montserrat bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-lg w-full md:w-auto"
        onClick={handleButtonClick}
        disabled={isLoading}
      >
        Fazer Upload da Imagem
      </button>
      {error}
      {imageUpload && (
        <Modal open={isModalOpen} onClose={handleModalClose} center>
          <div className="bg-white rounded-lg pt-7.5 md:p-6 flex flex-col items-center md:items-center">
            <div className="mb-4 md:mb-0 md:mr-4" style={{ width: '100%', maxWidth: '600px', height: '75vh', position: 'relative' }}>
              {imagePrediction ? (
                <ReactCompareImage
                  leftImage={imageUpload ? URL.createObjectURL(imageUpload) : ''}
                  rightImage={imagePrediction}
                  leftImageLabel="Antes"
                  rightImageLabel="Depois"
                  sliderLineWidth={3}
                  sliderLineColor="white"
                />
              ) : (
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.5 }}>
                    <NextImage alt="image loaded" src={URL.createObjectURL(imageUpload)} fill style={{ objectFit: 'cover' }} />
                  </div>
                  <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                    <div>
                      <div style={{ marginBottom: '10px' }}>
                        <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#ffffff" strokeWidth="4" />
                          <path
                            className="opacity-75"
                            fill="#ffffff"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647zM12 20c-3.042 0-5.824-1.135-7.938-3l3-4.899a8.035 8.035 0 0012.878 0l3 4.899A7.962 7.962 0 0112 20zm8-7.709A7.962 7.962 0 0116 12h-4v7.938A7.963 7.963 0 0012 24c4.418 0 8-3.582 8-8h-4v-3.709z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="w-full" style={{ marginTop: '20px' }}>
              <button
                disabled={!imagePrediction}
                className="font-montserrat flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full shadow-lg w-full"
                onClick={handleDownload}
              >
                <MdDownload className="mr-2" />
                Download
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ImageImprovement;
