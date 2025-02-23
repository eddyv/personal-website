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
