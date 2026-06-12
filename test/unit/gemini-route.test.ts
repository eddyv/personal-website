import type { APIRoute } from "astro";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("astro:env/server", () => ({
  GOOGLE_API_KEY: "test-key",
  GOOGLE_AI_MODEL_ID: "test-model",
  RESUME_URL: "https://example.com/cv.pdf",
  RESUME_CACHE_DURATION: 60_000,
}));

const generateContent = vi.fn();
vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = { generateContent };
  },
}));

const importGeminiRoute = async () => {
  vi.resetModules();
  return await import("../../src/pages/api/llm/gemini");
};

const makeRequest = (body: unknown, contentType = "application/json") =>
  new Request("https://example.com/api/llm/gemini", {
    method: "POST",
    headers: { "Content-Type": contentType },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

describe("POST /api/llm/gemini", () => {
  beforeEach(() => {
    generateContent.mockReset();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(new ArrayBuffer(8)))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns 400 for a non-JSON body and does not call generateContent", async () => {
    const { POST } = await importGeminiRoute();
    const response = await (POST as APIRoute)({
      request: new Request("https://example.com/api/llm/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not-json",
      }),
    } as unknown as Parameters<APIRoute>[0]);

    expect(response.status).toBe(400);
    const body = (await response.json()) as { error?: string };
    expect(body.error).toBe("Invalid request body");
    expect(generateContent).not.toHaveBeenCalled();
  });

  it("returns 400 when message is a non-string (number) and does not call generateContent", async () => {
    const { POST } = await importGeminiRoute();
    const response = await (POST as APIRoute)({
      request: makeRequest({ message: 42 }),
    } as unknown as Parameters<APIRoute>[0]);

    expect(response.status).toBe(400);
    const body = (await response.json()) as { error?: string };
    expect(body.error).toBe("Invalid request body");
    expect(generateContent).not.toHaveBeenCalled();
  });

  it("returns 400 when message is whitespace-only", async () => {
    const { POST } = await importGeminiRoute();
    const response = await (POST as APIRoute)({
      request: makeRequest({ message: "   " }),
    } as unknown as Parameters<APIRoute>[0]);

    expect(response.status).toBe(400);
    const body = (await response.json()) as { error?: string };
    expect(body.error).toBe("Message must not be empty");
    expect(generateContent).not.toHaveBeenCalled();
  });

  it("returns 400 when message exceeds 2000 characters", async () => {
    const { POST } = await importGeminiRoute();
    const tooLong = "a".repeat(2001);
    const response = await (POST as APIRoute)({
      request: makeRequest({ message: tooLong }),
    } as unknown as Parameters<APIRoute>[0]);

    expect(response.status).toBe(400);
    const body = (await response.json()) as { error?: string };
    expect(body.error).toBe("Message must be at most 2000 characters");
    expect(generateContent).not.toHaveBeenCalled();
  });

  it("accepts a message of exactly 2000 characters", async () => {
    const { POST } = await importGeminiRoute();
    const exactLength = "a".repeat(2000);
    generateContent.mockResolvedValueOnce({ text: "ok" });

    const response = await (POST as APIRoute)({
      request: makeRequest({ message: exactLength }),
    } as unknown as Parameters<APIRoute>[0]);

    expect(response.status).toBe(200);
    const body = (await response.json()) as { response?: string };
    expect(body.response).toBe("ok");
  });

  it("returns 200 with response text for a valid message", async () => {
    const { POST } = await importGeminiRoute();
    generateContent.mockResolvedValueOnce({ text: "hi" });

    const response = await (POST as APIRoute)({
      request: makeRequest({ message: "Tell me about Edward" }),
    } as unknown as Parameters<APIRoute>[0]);

    expect(response.status).toBe(200);
    const body = (await response.json()) as { response?: string };
    expect(body.response).toBe("hi");
  });

  it("returns 500 without internal details when generateContent rejects", async () => {
    const { POST } = await importGeminiRoute();
    generateContent.mockRejectedValueOnce(new Error("internal quota detail"));

    const response = await (POST as APIRoute)({
      request: makeRequest({ message: "Tell me about Edward" }),
    } as unknown as Parameters<APIRoute>[0]);

    expect(response.status).toBe(500);
    const body = (await response.json()) as { error?: string };
    expect(body.error).not.toContain("internal quota detail");
    expect(body.error).toBe(
      "Sorry, something went wrong while generating a response."
    );
  });
});
