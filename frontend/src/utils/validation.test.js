import assert from "node:assert/strict";
import test from "node:test";
import { getBackendFieldErrors, safeCustomerMessage } from "./validation.js";

test("customer messages retain useful validation feedback", () => {
  const error = { response: { status: 400, data: { message: "Address is required." } } };
  assert.equal(safeCustomerMessage(error, "Try again."), "Address is required.");
});

test("customer messages hide server internals and credentials", () => {
  const fallback = "Please try again.";
  for (const message of [
    "Table 'food_delivery_db.co1_0' doesn't exist; SQL SELECT * FROM customer_orders",
    "Table 'food_delivery_db.co1_0' doesn't exist",
    "JDBC exception while executing statement",
    "Bearer eyJhbGciOiJIUzI1NiJ9.secret.signature",
    "Error\nat com.example.Service.execute(Service.java:42)",
  ]) {
    assert.equal(safeCustomerMessage({ response: { status: 400, data: { message } } }, fallback), fallback);
  }
  assert.equal(safeCustomerMessage({ response: { status: 500, data: { message: "Internal failure" } } }, fallback), fallback);
});

test("field errors exclude unsafe backend diagnostics", () => {
  const error = { response: { status: 400, data: { fieldErrors: { deliveryAddress: "Enter an address.", notes: "Hibernate SQL exception" } } } };
  assert.deepEqual(getBackendFieldErrors(error), { deliveryAddress: "Enter an address." });
  assert.deepEqual(getBackendFieldErrors({ response: { status: 500, data: { fieldErrors: { notes: "Internal" } } } }), {});
});
