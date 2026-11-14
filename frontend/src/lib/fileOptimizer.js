/**
 * Client-side file optimization and ultra-compression utility.
 * Compresses 10-20MB high-resolution camera photos down to 15-80KB
 * without noticeable loss of readability for IDs, Passports, and Visas.
 */

export const compressImageFile = (file, options = {}) => {
  const {
    maxWidth = 1000,
    maxHeight = 1000,
    targetMaxKb = 90,
    initialQuality = 0.72,
  } = options;

  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image.'));
    }

    const originalSizeKb = Math.round(file.size / 1024);
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image into memory.'));
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate aspect ratio scale
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context unavailable.'));

        // Fill white background in case of transparent PNG converted to JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        let quality = initialQuality;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        let sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);

        // Iteratively tune quality if still exceeds target
        let attempts = 0;
        while (sizeKb > targetMaxKb && quality > 0.35 && attempts < 4) {
          quality -= 0.12;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
          sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);
          attempts += 1;
        }

        const savedPercent = originalSizeKb > 0 
          ? Math.max(0, Math.round(((originalSizeKb - sizeKb) / originalSizeKb) * 100))
          : 0;

        resolve({
          name: file.name,
          dataUrl,
          sizeKb,
          originalSizeKb,
          savedPercent,
          type: 'image/jpeg',
          uploadedAt: new Date().toISOString(),
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export const processPdfFile = (file, maxKb = 700) => {
  return new Promise((resolve, reject) => {
    if (!file || file.type !== 'application/pdf') {
      return reject(new Error('Selected file is not a PDF.'));
    }

    const originalSizeKb = Math.round(file.size / 1024);
    if (originalSizeKb > maxKb) {
      return reject(
        new Error(`PDF file is ${originalSizeKb} KB (exceeds limit of ${maxKb} KB). Please upload a smaller PDF or take a screenshot/photo of the document for auto-compression.`)
      );
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read PDF file.'));
    reader.onload = (e) => {
      resolve({
        name: file.name,
        dataUrl: e.target.result,
        sizeKb: originalSizeKb,
        originalSizeKb,
        savedPercent: 0,
        type: 'application/pdf',
        uploadedAt: new Date().toISOString(),
      });
    };
    reader.readAsDataURL(file);
  });
};
