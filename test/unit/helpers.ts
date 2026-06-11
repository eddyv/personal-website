/**
 * Middleware handlers are typed to return `Promise<void | Response>`.
 * Narrow to a concrete Response so assertions typecheck.
 */
export function expectResponse(value: unknown): Response {
  if (!(value instanceof Response)) {
    throw new Error("Expected middleware to return a Response");
  }
  return value;
}
