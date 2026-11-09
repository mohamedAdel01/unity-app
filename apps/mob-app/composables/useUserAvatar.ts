/**
 * Shared User Avatar Utility
 * - Shows real uploaded photos (base64 data URL or server /uploads/ path)
 * - Excludes old mock/preset unsplash placeholders
 * - Falls back to first letter of user name
 */
export function isUserUploadedPhoto(avatar?: string | null): boolean {
  if (!avatar || typeof avatar !== 'string') return false;
  const trimmed = avatar.trim();
  if (!trimmed) return false;

  // Filter out any unsplash stock photos or dummy placeholders
  if (
    trimmed.includes('unsplash.com') ||
    trimmed.includes('dummy') ||
    trimmed.includes('placeholder') ||
    trimmed.includes('default-avatar')
  ) {
    return false;
  }

  return true;
}

export function resolveAvatarUrl(avatar?: string | null): string {
  if (!avatar || typeof avatar !== 'string') return '';
  const trimmed = avatar.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:image/')) {
    return trimmed;
  }

  try {
    const config = useRuntimeConfig();
    const baseUrl = config?.public?.apiUrl || 'http://localhost:4000';
    return `${baseUrl}${trimmed}`;
  } catch {
    return trimmed;
  }
}

export function getUserInitial(name?: string | null): string {
  if (!name || typeof name !== 'string') return 'U';
  const clean = name.trim();
  if (!clean) return 'U';
  return clean.charAt(0).toUpperCase();
}

