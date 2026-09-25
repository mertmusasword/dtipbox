import { api } from '../api/client';

export type UploadFolder = 'menu' | 'avatars' | 'logos' | 'general';

/**
 * Upload an image (Base64 data URI or HTTP URL) to Cloudflare R2 / Object Storage.
 * Returns the permanent CDN / storage URL.
 * If upload fails or if dataUri is already a remote URL, gracefully returns the input.
 */
export async function uploadImageToServer(
  dataUri: string,
  folder: UploadFolder = 'general'
): Promise<string> {
  if (!dataUri || typeof dataUri !== 'string') return '';

  // Already a remote CDN or relative static URL
  if (dataUri.startsWith('http://') || dataUri.startsWith('https://') || dataUri.startsWith('/uploads/')) {
    return dataUri;
  }

  // Only upload valid data URIs
  if (!dataUri.startsWith('data:image/')) {
    return dataUri;
  }

  try {
    const res = await api.post('/upload/image', {
      image: dataUri,
      folder,
    });

    if (res.data?.success && res.data?.url) {
      return res.data.url;
    }
  } catch (err: any) {
    console.warn('[Upload] Image cloud upload failed, using fallback data URI:', err?.message || err);
  }

  return dataUri;
}
