import type { APIContext, MiddlewareNext } from "astro";
import { describe, expect, it, vi } from "vitest";
import { expectResponse } from "./helpers";

vi.mock("astro:middleware", () => ({
  defineMiddleware: (fn: unknown) => fn,
}));

const createContext = (method: string, headers?: Record<string, string>) =>
  ({
    request: new Request("https://edwardvaisman.ca/api/llm/gemini", {
      method,
      headers,
    }),
    site: new URL("https://edwardvaisman.ca"),
  }) as unknown as APIContext;

describe("corsMiddleware", () => {
  it("answers preflight OPTIONS requests without calling next", async () => {
    const { corsMiddleware } = await import("../../src/middleware/cors");
    const next = vi.fn() as unknown as MiddlewareNext;

    const response = expectResponse(
      await corsMiddleware(
        createContext("OPTIONS", { Origin: "https://edwardvaisman.ca" }),
        next
      )
    );

    expect(next).not.toHaveBeenCalled();
    expect(response.headers.get("Access-Control-Allow-Methods")).toBe(
      "GET,HEAD,OPTIONS,POST,PUT"
    );
    expect(response.headers.get("Access-Control-Allow-Headers")).toBe(
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    expect(response.body).toBeNull();
  });

  it("appends CORS headers and preserves downstream status", async () => {
    const { corsMiddleware } = await import("../../src/middleware/cors");
    const next = vi.fn(() =>
      Promise.resolve(
        new Response("payload", {
          status: 201,
          headers: { "X-Existing": "yes" },
        })
      )
    ) as unknown as MiddlewareNext;

    const response = expectResponse(
      await corsMiddleware(
        createContext("GET", { Origin: "https://edwardvaisman.ca" }),
        next
      )
    );

    expect(next).toHaveBeenCalledOnce();
    expect(response.status).toBe(201);
    expect(response.headers.get("X-Existing")).toBe("yes");
    expect(response.headers.get("Access-Control-Allow-Origin")).toBeTruthy();
    expect(await response.text()).toBe("payload");
  });

  it("echoes the request origin in dev mode", async () => {
    // Vitest runs with import.meta.env.DEV === true, exercising the dev branch.
    const { corsMiddleware } = await import("../../src/middleware/cors");

    const response = expectResponse(
      await corsMiddleware(
        createContext("OPTIONS", { Origin: "http://localhost:4321" }),
        vi.fn() as unknown as MiddlewareNext
      )
    );

    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "http://localhost:4321"
    );
  });
});
