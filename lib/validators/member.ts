export function validateMemberPayload(payload: Record<string, unknown>) {
  const required = ["names", "birthDate", "phone", "address", "gender"];

  for (const field of required) {
    if (!payload[field]) return `${field} irakenewe`;
  }

  return null;
}
