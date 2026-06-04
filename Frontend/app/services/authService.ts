const API_URL = "https://weehenapos360.cloud/api/auth";

export const getUser = async (username: string, password: string) => {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) throw new Error("Login failed");

    const token = await res.text();
    localStorage.setItem("username", username);
    localStorage.setItem("token", token);
    return token;
  } catch (err) {
    alert("Invalid login credentials");
    console.error("Login error:", err);
  }
};
