/** Profile store contract — localStorage adapter (browser) or injected Map-like storage (tests). */

export const STORAGE_ACCOUNTS = 'riffle.accounts.v1';
export const STORAGE_SESSION = 'riffle.session.v1';
const LEGACY_ACCOUNTS = 'riffle.accounts';
const LEGACY_SESSION = 'riffle.session';

const ALLOWED_SKILLS = new Set(['beginner', 'intermediate', 'advanced']);
const ALLOWED_GENRES = new Set([
  'acoustic-folk',
  'rock-alt',
  'jazz-blues',
  'metal',
  'classical'
]);

function defaultStorage() {
  if (typeof localStorage !== 'undefined') return localStorage;
  const mem = new Map();
  return {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => mem.set(k, String(v)),
    removeItem: (k) => mem.delete(k)
  };
}

/**
 * @param {Storage | ReturnType<typeof defaultStorage>} [storage]
 */
export function createProfileStore(storage = defaultStorage()) {
  function migrateLegacy() {
    const legacy = storage.getItem(LEGACY_ACCOUNTS);
    if (legacy && !storage.getItem(STORAGE_ACCOUNTS)) {
      storage.setItem(STORAGE_ACCOUNTS, legacy);
    }
    const legacySession = storage.getItem(LEGACY_SESSION);
    if (legacySession && !storage.getItem(STORAGE_SESSION)) {
      storage.setItem(STORAGE_SESSION, legacySession);
    }
  }

  function loadAccounts() {
    migrateLegacy();
    try {
      return JSON.parse(storage.getItem(STORAGE_ACCOUNTS) || '{}');
    } catch {
      const err = new Error('Profile storage is corrupt');
      err.code = 'STORAGE_CORRUPT';
      throw err;
    }
  }

  function saveAccounts(accounts) {
    storage.setItem(STORAGE_ACCOUNTS, JSON.stringify(accounts));
  }

  function uid() {
    return 'u_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  async function hashPassword(password) {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const data = new TextEncoder().encode('riffle:' + password);
      const digest = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
    // Node test fallback (not for production auth)
    const { createHash } = await import('node:crypto');
    return createHash('sha256').update('riffle:' + password).digest('hex');
  }

  function createProfile({ displayName, email, passwordHash, isGuest }) {
    return {
      id: uid(),
      displayName,
      email: email || null,
      passwordHash: passwordHash || null,
      isGuest: !!isGuest,
      skillLevel: null,
      genres: [],
      skillCheckDone: false,
      preferences: {
        continuousAiAdaptation: true,
        cloudSync: false
      },
      practiceHistory: [],
      learningPrompt: '',
      roadmap: null,
      chordBank: [],
      library: [],
      dayCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  function validateProfile(profile) {
    if (!profile?.id || !profile.displayName) {
      const err = new Error('Invalid profile');
      err.code = 'VALIDATION';
      throw err;
    }
    if (profile.skillLevel != null && !ALLOWED_SKILLS.has(profile.skillLevel)) {
      const err = new Error('Invalid skill level');
      err.code = 'VALIDATION';
      throw err;
    }
    if (profile.genres?.some((g) => !ALLOWED_GENRES.has(g))) {
      const err = new Error('Invalid genre');
      err.code = 'VALIDATION';
      throw err;
    }
  }

  function toPublic(profile) {
    if (!profile) return null;
    const { passwordHash, ...rest } = profile;
    return rest;
  }

  return {
    STORAGE_ACCOUNTS,
    STORAGE_SESSION,
    hashPassword,
    createProfile,

    listProfiles() {
      const accounts = loadAccounts();
      return Object.values(accounts).map(toPublic);
    },

    getProfile(id) {
      const accounts = loadAccounts();
      return accounts[id] || null;
    },

    upsertProfile(profile) {
      validateProfile(profile);
      const accounts = loadAccounts();
      const existing = accounts[profile.id] || {};
      const merged = {
        ...existing,
        ...profile,
        preferences: { ...existing.preferences, ...profile.preferences },
        chordBank: profile.chordBank ?? existing.chordBank ?? [],
        library: profile.library ?? existing.library ?? [],
        updatedAt: new Date().toISOString()
      };
      accounts[merged.id] = merged;
      saveAccounts(accounts);
      return merged;
    },

    deleteProfile(id) {
      const accounts = loadAccounts();
      delete accounts[id];
      saveAccounts(accounts);
      if (this.getSession() === id) this.setSession(null);
    },

    getSession() {
      migrateLegacy();
      return storage.getItem(STORAGE_SESSION);
    },

    setSession(id) {
      if (id) storage.setItem(STORAGE_SESSION, id);
      else storage.removeItem(STORAGE_SESSION);
    },

    async authenticate(email, password) {
      const normalized = String(email || '').trim().toLowerCase();
      const passwordHash = await hashPassword(password);
      const accounts = loadAccounts();
      const match = Object.values(accounts).find(
        (a) => a.email === normalized && a.passwordHash === passwordHash
      );
      if (!match) {
        const err = new Error('Email or password is incorrect.');
        err.code = 'AUTH_FAILED';
        throw err;
      }
      return match;
    },

    async signup({ displayName, email, password }) {
      const normalized = String(email || '').trim().toLowerCase();
      if (!normalized || !password) {
        const err = new Error('Email and password are required.');
        err.code = 'VALIDATION';
        throw err;
      }
      const accounts = loadAccounts();
      if (Object.values(accounts).some((a) => a.email === normalized)) {
        const err = new Error('A profile with that email already exists.');
        err.code = 'EMAIL_TAKEN';
        throw err;
      }
      const passwordHash = await hashPassword(password);
      const profile = createProfile({
        displayName: (displayName || '').trim() || normalized.split('@')[0],
        email: normalized,
        passwordHash,
        isGuest: false
      });
      return this.upsertProfile(profile);
    },

    createGuest() {
      const profile = createProfile({
        displayName: 'Guest Player',
        email: null,
        passwordHash: null,
        isGuest: true
      });
      return this.upsertProfile(profile);
    }
  };
}
