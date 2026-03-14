"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { CheckCircle2, ImageIcon, Upload as UploadIcon } from 'lucide-react';
import { PROGRESS_INTERVAL_MS, PROGRESS_STEP, REDIRECT_DELAY_MS } from '@/lib/constants';

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

interface UploadProps {
  onComplete?: (base64: string) => void;
  onError?: (message: string) => void;
}

const Upload = ({ onComplete, onError }: UploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);

  const { isSignedIn } = useUser();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      intervalRef.current = null;
      timeoutRef.current = null;
    };
  }, []);

  const processFile = (selectedFile: File) => {
    if (!isSignedIn) return;

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      onError?.(`"${selectedFile.name}" is not supported. Please upload a JPG or PNG image.`);
      return;
    }

    if (selectedFile.size > MAX_BYTES) {
      const sizeMB = (selectedFile.size / 1024 / 1024).toFixed(1);
      onError?.(`File is too large (${sizeMB} MB). Maximum allowed size is 10 MB.`);
      return;
    }

    setFile(selectedFile);
    setProgress(0);

    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;

      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          const next = prev + PROGRESS_STEP;
          if (next >= 100) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            timeoutRef.current = setTimeout(() => onComplete?.(base64), REDIRECT_DELAY_MS);
            return 100;
          }
          return next;
        });
      }, PROGRESS_INTERVAL_MS);
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) processFile(selected);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isSignedIn) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isSignedIn) return;
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) processFile(dropped);
  };

  return (
    <div className='upload'>
      {!file ? (
        <div
          className={`dropzone ${isDragging ? 'is-dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className='drop-input'
            accept=".jpg,.png"
            disabled={!isSignedIn}
            onChange={handleChange}
          />

          <div className="drop-content">
            <div className="drop-icon">
              <UploadIcon size={20} />
            </div>
            <p>{isSignedIn ? (
              "Click to upload or just drag and drop"
            ) : (
              "Sign in to upload your floor plan"
            )}</p>
            <p className="help">
              JPG, PNG only · Max 10 MB
            </p>
          </div>
        </div>
      ) : (
        <div className="upload-status">
          <div className="status-content">
            <div className="status-icon">
              {progress === 100 ? (
                <CheckCircle2 className="check" />
              ) : (
                <ImageIcon className="image" />
              )}
            </div>

            <h3>{file.name}</h3>

            <div className="progress">
              <div className="bar" style={{ width: `${progress}%` }} />
              <p className="status-text">
                {progress < 100 ? 'Analyzing Floor Plan...' : 'Redirecting...'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
