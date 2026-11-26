import assert from "node:assert/strict";
import test from "node:test";
import { clearSession, getAuthorizationHeader, getLandingPath, readStoredSession, saveSession } from "./session.js";

function makeStorage(value = null) {
  let stored = value;
  return {
    getItem: () => stored,
    setItem: (_key, value) => { stored = value; },
    removeItem: () => { stored = null; },
    value: () => stored,
  };
}

const user = { id: 1, fullName: "Test User", email: "test@example.test", role: "ADMIN" };
const expiresAt = new Date(Date.now() + 60_000).toISOString();
const response = { ...user, accessToken: "signed-token", expiresAt };

test("stores a bearer session and restores only unexpired records", () => {
  const storage = makeStorage();
  assert.deepEqual(saveSession(response, storage), user);
  assert.deepEqual(readStoredSession(storage)?.user, user);
  assert.equal(readStoredSession(storage)?.accessToken, "signed-token");
  assert.equal(getAuthorizationHeader(storage), "Bearer signed-token");
  assert.equal(getAuthorizationHeader(storage, Date.parse(expiresAt)), null);
  assert.equal(readStoredSession(storage, Date.parse(expiresAt)), null);
  assert.equal(storage.value(), null);
});

test("rejects role-only profiles, malformed data, and password fields", () => {
  for (const raw of ["{broken", JSON.stringify({ user }),
    JSON.stringify({ ...response, user: { ...user, role: "OTHER" } }),
    JSON.stringify({ user: { ...user, password: "hidden" }, accessToken: "x", expiresAt })]) {
    const storage = makeStorage(raw);
    assert.equal(readStoredSession(storage), null);
    assert.equal(storage.value(), null);
  }
});

test("logout removes the session and roles map to expected pages", () => {
  const storage = makeStorage();
  saveSession(response, storage);
  clearSession(storage);
  assert.equal(readStoredSession(storage), null);
  assert.equal(getLandingPath("ADMIN"), "/admin/dashboard");
  assert.equal(getLandingPath("DELIVERY"), "/delivery/dashboard");
  assert.equal(getLandingPath("CUSTOMER"), "/menu");
});
