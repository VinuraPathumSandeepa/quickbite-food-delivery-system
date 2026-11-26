const STORAGE_KEY = "quickbiteSession";
const ROLES = new Set(["ADMIN", "CUSTOMER", "DELIVERY"]);

export function getLandingPath(role) {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "DELIVERY") return "/delivery/dashboard";
  return "/menu";
}

export function isValidUser(user) {
  return user && typeof user === "object" &&
    Number.isSafeInteger(user.id) && user.id > 0 &&
    typeof user.fullName === "string" && Boolean(user.fullName.trim()) &&
    typeof user.email === "string" && Boolean(user.email.trim()) &&
    ROLES.has(user.role) && !("password" in user);
}

export function readStoredSession(storage, now = Date.now()) {
  try {
    const source = storage ?? window.sessionStorage;
    const raw = source.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!isValidUser(session?.user) || typeof session.accessToken !== "string" ||
        !session.accessToken || !Number.isFinite(Date.parse(session.expiresAt)) ||
        Date.parse(session.expiresAt) <= now) {
      source.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    try { (storage ?? window.sessionStorage).removeItem(STORAGE_KEY); } catch { /* Storage is unavailable. */ }
    return null;
  }
}

export function saveSession(authResponse, storage) {
  const source = storage ?? window.sessionStorage;
  const { accessToken, expiresAt, ...user } = authResponse;
  if (!isValidUser(user) || typeof accessToken !== "string" || !accessToken ||
      !Number.isFinite(Date.parse(expiresAt)) || Date.parse(expiresAt) <= Date.now()) {
    throw new Error("The server returned an invalid session.");
  }
  source.setItem(STORAGE_KEY, JSON.stringify({ user, accessToken, expiresAt }));
  return user;
}

export function clearSession(storage) {
  try { (storage ?? window.sessionStorage).removeItem(STORAGE_KEY); } catch { /* Storage is unavailable. */ }
}

export function getAuthorizationHeader(storage, now) {
  const token = readStoredSession(storage, now)?.accessToken;
  return token ? `Bearer ${token}` : null;
}
