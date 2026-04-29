const TOKEN_KEY = "token";
const ROLE_KEY = "role";
const EMAIL_KEY = "email";
const FIRSTNAME_KEY = "firstName";

export function saveAuth({ token, role, email, firstName }) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (role) localStorage.setItem(ROLE_KEY, role);
  if (email) localStorage.setItem(EMAIL_KEY, email);
  if (firstName) localStorage.setItem(FIRSTNAME_KEY, firstName);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(FIRSTNAME_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY);
}

export function getEmail() {
  return localStorage.getItem(EMAIL_KEY);
}

export function getFirstName() {
  return localStorage.getItem(FIRSTNAME_KEY);
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function getRedirectPath() {
  const role = getRole();

  if (!isLoggedIn()) {
    return null;
  }

  if (role === "company") {
    return "/company-dashboard";
  }
  if (role === "staff") {
    return "/staff-dashboard";
  }
  return "/student-dashboard";
}

export function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
