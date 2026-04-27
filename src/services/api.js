import { getAuthHeaders } from "./auth";

const API_URL = import.meta.env.VITE_API_URL;

export async function register(data) {
  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      console.error("Register failed:", res.status, res.statusText);
    }

    return res.json();
  } catch (error) {
    console.error("Register error:", error);
    return { error: error.message };
  }
}

export async function login(data) {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      console.error("Login failed:", res.status, res.statusText);
    }

    return res.json();
  } catch (error) {
    console.error("Login error:", error);
    return { error: error.message };
  }
}

export async function resetPassword(data) {
  try {
    const res = await fetch(`${API_URL}/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      console.error("Reset password failed:", res.status, res.statusText);
    }

    return res.json();
  } catch (error) {
    console.error("Reset password error:", error);
    return { error: error.message };
  }
}