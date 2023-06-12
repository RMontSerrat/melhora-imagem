"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import { MdDownload } from 'react-icons/md';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import Image from 'next/image';

const ImageImprovement = () => {
  const [imageUpload, setImageUpload] = useState<File | null>(null);
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
        console.log(response, 'response')
        if (response.status !== 200) {
          setError('erro');
          setIsLoading(false);
          return;
        }
  
        const prediction = response.data;
        setImagePrediction(prediction);
        setIsLoading(false);
        setIsModalOpen(true);
      } catch (error: any) {
        setError(error?.message || 'Erro');
        setIsLoading(false);
        console.error('Ocorreu um erro ao enviar a imagem para a API:', error);
      }
    }
  }, [imageUpload]);
  
  useEffect(() => {
    if (imageUpload) {
      handleImageUpload();
    }
  }, [handleImageUpload, imageUpload]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file: File | null = event.target.files ? event.target.files[0] : null;
    setError(null);
    setImageUpload(file);
  };
  
  const handleButtonClick = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
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
        {isLoading ? 'Carregando...' : 'Fazer Upload da Imagem'}
      </button>
      {error}
      {imagePrediction && (
        <Modal open={isModalOpen} onClose={handleModalClose} center>
          <div className="bg-white rounded-lg p-8 flex flex-col items-center md:flex-row md:items-center">
            <div className="mb-4 md:mb-0 md:mr-4">
              <Image className="h-auto desktop:h-500px" src={imagePrediction} alt="Imagem replicada" width={500} height={500} style={{ objectFit: 'contain' }} />
            </div>
            <div className="w-full md:w-auto">
              <button
                className="font-montserrat flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full shadow-lg w-full md:w-auto"
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
