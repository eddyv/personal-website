/**
 * Generates or retrieves a unique client identifier.
 * First checks localStorage for an existing clientId.
 * If not found, creates a new UUID and stores it in localStorage.
 *
 * @returns {string} The client identifier (either existing or newly generated)
 */
export const generateClientId = (): string => {
  const existingId = localStorage.getItem("clientId");
  if (existingId) {
    return existingId;
  }

  const newId = crypto.randomUUID();
  localStorage.setItem("clientId", newId);
  return newId;
};
