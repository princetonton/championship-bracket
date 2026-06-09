const STORAGE_PREFIX = 'wc2026_';

export function loadProfile(profileId) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + profileId);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profileId, data) {
  try {
    localStorage.setItem(STORAGE_PREFIX + profileId, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save profile:', e);
  }
}
