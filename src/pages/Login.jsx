import { useState } from "react";
import axios from "axios";

const BACKEND_URL = "https://bug-tracker-backend-2-24nh.onrender.com";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/auth/login`,
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // save token
      localStorage.setItem("token", res.data.token);

      // notify App.jsx
      onLogin(res.data.token);
    } catch (err) {
      alert("Login failed");
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1e1e1e",
        color: "white",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: "300px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}