import assert from "node:assert/strict";
import test from "node:test";
import { getLandingPath, readStoredUser } from "./session.js";

function makeStorage(value) {
  let stored = value;
  return {
    getItem: () => stored,
    removeItem: () => { stored = null; },
    value: () => stored,
  };
}

const admin = {
  id: 1,
  fullName: "Admin User",
  email: "admin@example.test",
  role: "ADMIN",
};

test("restores a valid Admin on the first read without changing storage", () => {
  const storage = makeStorage(JSON.stringify(admin));
  assert.deepEqual(readStoredUser(storage), admin);
  assert.equal(storage.value(), JSON.stringify(admin));
});

test("accepts customer and delivery sessions and maps each role to its route", () => {
  for (const role of ["CUSTOMER", "DELIVERY"]) {
    assert.equal(readStoredUser(makeStorage(JSON.stringify({ ...admin, role }))).role, role);
  }
  assert.equal(getLandingPath("ADMIN"), "/admin/dashboard");
  assert.equal(getLandingPath("DELIVERY"), "/delivery/dashboard");
  assert.equal(getLandingPath("CUSTOMER"), "/menu");
});

test("clears malformed, incomplete, and unauthorized stored records", () => {
  for (const value of [
    "{broken",
    JSON.stringify({ role: "ADMIN" }),
    JSON.stringify({ ...admin, role: "OTHER" }),
    JSON.stringify({ ...admin, password: "should-not-be-stored" }),
  ]) {
    const storage = makeStorage(value);
    assert.equal(readStoredUser(storage), null);
    assert.equal(storage.value(), null);
  }
});

test("handles missing or unavailable browser storage", () => {
  assert.equal(readStoredUser(makeStorage(null)), null);
  assert.equal(readStoredUser({ getItem: () => { throw new Error("blocked"); } }), null);
});
