import { sequence } from "astro:middleware";
import { rateLimiterMiddleware } from "@middleware/ratelimitter";
import { corsMiddleware } from "@middleware/cors";
export const onRequest = sequence(corsMiddleware, rateLimiterMiddleware);
