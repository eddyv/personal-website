import { sequence } from "astro:middleware";
import { corsMiddleware } from "@middleware/cors";
import { rateLimiterMiddleware } from "@middleware/rate-limitter";
export const onRequest = sequence(corsMiddleware, rateLimiterMiddleware);
