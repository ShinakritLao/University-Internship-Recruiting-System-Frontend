const API_URL = "http://localhost:8080";

export async function register(data) {
  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
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
        "Content-Type": "application/json"
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