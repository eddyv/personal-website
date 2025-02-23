export const generateClientId = (): string => {
  const existingId = localStorage.getItem("clientId");
  if (existingId) return existingId;

  const newId = crypto.randomUUID();
  localStorage.setItem("clientId", newId);
  return newId;
};
