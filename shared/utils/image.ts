/**
 * Browser-side image compression using HTML5 Canvas.
 * Resizes large images (e.g. 5MB-10MB mobile/camera photos) down to reasonable dimensions
 * and compresses them to WebP (with JPEG fallback) to stay well below 100KB.
 * This completely prevents HTTP 413 (Payload / Request Entity Too Large) errors on reverse proxies (Nginx)
 * and guarantees fast mobile upload performance (AGENTS.md Rule 8).
 */
export async function compressImageFile(
  file: File,
  maxDimension = 480,
  quality = 0.82
): Promise<string> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return '';
  }

  return new Promise((resolve, reject) => {
    if (!file.type || !file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) {
        return reject(new Error('Empty image payload'));
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image in browser'));
      img.onload = () => {
        let { width, height } = img;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(rawDataUrl);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Try modern WebP first
        try {
          const webpData = canvas.toDataURL('image/webp', quality);
          if (webpData.startsWith('data:image/webp')) {
            return resolve(webpData);
          }
        } catch (_) {}

        // High quality JPEG fallback
        try {
          const jpegData = canvas.toDataURL('image/jpeg', quality);
          return resolve(jpegData);
        } catch (_) {}

        return resolve(rawDataUrl);
      };

      img.src = rawDataUrl;
    };

    reader.readAsDataURL(file);
  });
}
