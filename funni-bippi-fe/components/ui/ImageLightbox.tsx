'use client';

import { useEffect } from 'react';
import { IcClose } from './icons';

interface ImageLightboxProps {
  src: string;
  onClose: () => void;
}

export function ImageLightbox({ src, onClose }: ImageLightboxProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className='image-lightbox-scrim'
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).classList.contains('image-lightbox-scrim')) onClose();
      }}
    >
      <button type='button' className='image-lightbox-close icon-btn round' onClick={onClose}>
        <IcClose size={22} />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt='' className='image-lightbox-img' />
    </div>
  );
}
