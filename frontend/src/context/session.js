const STORAGE_KEY = "foodUser";
const ROLES = new Set(["ADMIN", "CUSTOMER", "DELIVERY"]);

export function getLandingPath(role) {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "DELIVERY") return "/delivery/dashboard";
  return "/menu";
}

export function readStoredUser(storage) {
  try {
    const source = storage ?? window.localStorage;
    const savedUser = source.getItem(STORAGE_KEY);
    if (!savedUser) return null;

    const user = JSON.parse(savedUser);
    if (
      !user ||
      typeof user !== "object" ||
      !Number.isSafeInteger(user.id) ||
      user.id <= 0 ||
      typeof user.fullName !== "string" ||
      !user.fullName.trim() ||
      typeof user.email !== "string" ||
      !user.email.trim() ||
      !ROLES.has(user.role) ||
      "password" in user
    ) {
      source.removeItem(STORAGE_KEY);
      return null;
    }

    return user;
  } catch {
    try {
      (storage ?? window.localStorage).removeItem(STORAGE_KEY);
    } catch {
      // Storage can be unavailable in private or restricted browsing modes.
    }
    return null;
  }
}
