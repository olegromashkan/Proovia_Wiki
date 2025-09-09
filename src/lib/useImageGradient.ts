'use client';

import { useEffect, useState } from 'react';

// Computes a simple two-color gradient based on the left and right halves of an image
export function useImageGradient(src?: string) {
  const [gradient, setGradient] = useState<string>();

  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 20; // small sample for performance
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        const left = [0, 0, 0];
        const right = [0, 0, 0];
        let cl = 0;
        let cr = 0;
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            const i = (y * size + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            if (x < size / 2) {
              left[0] += r;
              left[1] += g;
              left[2] += b;
              cl++;
            } else {
              right[0] += r;
              right[1] += g;
              right[2] += b;
              cr++;
            }
          }
        }
        const c1 = `rgb(${Math.round(left[0] / cl)}, ${Math.round(left[1] / cl)}, ${Math.round(left[2] / cl)})`;
        const c2 = `rgb(${Math.round(right[0] / cr)}, ${Math.round(right[1] / cr)}, ${Math.round(right[2] / cr)})`;
        setGradient(`linear-gradient(135deg, ${c1}, ${c2})`);
      } catch {
        // ignore errors
      }
    };
  }, [src]);

  return gradient;
}

