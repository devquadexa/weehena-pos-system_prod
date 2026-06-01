const API_URL = "http://localhost:8080/api/auth/login";

export const getUser = async (username: string, password: string) => {
  try {
    const res = await fetch(API_URL, {
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
