import type { APIContext } from "astro";
import { defineMiddleware } from "astro:middleware";

const getAllowedOrigin = (
  request: Request,
  context: APIContext<Record<string, any>>,
) => {
  const origin = request.headers.get("Origin");
  const siteOrigin = context.site?.origin || "";

  // Local development
  if (import.meta.env.DEV) {
    return origin || "";
  }

  // Production
  return siteOrigin;
};

/**
 * Middleware function to handle Cross-Origin Resource Sharing (CORS) for HTTP requests.
 *
 * @param context - The middleware context containing the request information
 * @param next - The next middleware function in the chain
 * @returns A Response object with appropriate CORS headers
 *
 * This middleware:
 * - Handles preflight OPTIONS requests by returning appropriate CORS headers
 * - Adds CORS headers to responses from other HTTP methods
 * - Supports configurable origin through getAllowedOrigin helper
 * - Allows GET, HEAD, OPTIONS, POST, PUT methods
 * - Permits standard headers: Origin, X-Requested-With, Content-Type, Accept
 */
export const corsMiddleware = defineMiddleware(async (context, next) => {
  const { request } = context;
  const allowedOrigin = getAllowedOrigin(context.request, context);

  if (request.method === "OPTIONS") {
    let headers = new Headers();
    headers.append("Access-Control-Allow-Origin", allowedOrigin);
    headers.append("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    headers.append(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept",
    );
    return new Response(null, { headers });
  }

  const response = await next();

  const headers = new Headers(response.headers);
  headers.append("Access-Control-Allow-Origin", allowedOrigin);
  headers.append("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  headers.append(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );

  return new Response(response.body, {
    ...response,
    headers: headers,
  });
});
