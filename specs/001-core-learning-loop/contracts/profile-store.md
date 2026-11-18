# Contract: Profile Store

**Feature**: 001-core-learning-loop  
**Transport**: Browser localStorage (v1)  
**Forward compatibility**: Same shapes MUST serialize to a future HTTP API without renaming required fields.

## Storage keys

| Key | Value |
|-----|-------|
| `riffle.accounts.v1` | JSON object map `profileId → Profile` |
| `riffle.session.v1` | string profileId or absent |

## Operations

### `listProfiles() → ProfilePublic[]`

Returns public fields only (no passwordHash) for account switcher UIs if present.

### `getProfile(id) → Profile | null`

Full profile including passwordHash for auth verification in local mode only. UI layers MUST NOT render passwordHash.

### `upsertProfile(profile) → Profile`

Validates required fields; sets `updatedAt`; writes to map. MUST preserve unknown keys (e.g. future fields) when merging.

### `deleteProfile(id) → void`

Removes profile; if session points to id, clears session.

### `getSession() → profileId | null` / `setSession(id | null)`

### `authenticate(email, password) → Profile | AuthError`

Hashes password with the app’s local scheme; returns profile on match.

### `createGuest() → Profile`

Creates `isGuest: true` profile with null email/passwordHash.

## Error codes

| Code | Meaning |
|------|---------|
| `EMAIL_TAKEN` | Signup conflict |
| `AUTH_FAILED` | Generic sign-in failure |
| `NOT_FOUND` | Missing profile id |
| `VALIDATION` | Enum/genre/shape violation |
| `STORAGE_CORRUPT` | JSON parse failure; callers may offer reset |

## Non-goals

- Server-side session cookies
- OAuth providers
- Encryption-at-rest beyond what the browser provides (document risk in security pass)
