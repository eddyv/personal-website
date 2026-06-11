// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vitest";
import { generateClientId } from "../../src/utils/generate-client-id";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe("generateClientId", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns an existing client id from localStorage", () => {
    localStorage.setItem("clientId", "existing-id");
    expect(generateClientId()).toBe("existing-id");
  });

  it("generates and persists a UUID when none exists", () => {
    const id = generateClientId();
    expect(id).toMatch(UUID_PATTERN);
    expect(localStorage.getItem("clientId")).toBe(id);
  });

  it("returns the same id on subsequent calls", () => {
    const first = generateClientId();
    const second = generateClientId();
    expect(second).toBe(first);
  });
});
