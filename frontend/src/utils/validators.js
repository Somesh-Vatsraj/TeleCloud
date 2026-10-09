export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validEmail(email) {
  return emailRegex.test(String(email || '').trim());
}

export function validUsername(u) {
  if (!u) return true; // optional
  return /^@?[a-zA-Z0-9_]{4,32}$/.test(String(u).trim());
}

export function strongEnough(pw) {
  return typeof pw === 'string' && pw.length >= 6;
}

export function validName(n) {
  return typeof n === 'string' && n.trim().length >= 2;
}
