import { useState, useEffect, useCallback } from "react";

const API_URL = "https://bug-tracker-backend-2-24nh.onrender.com";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [token, setToken] = useState(
    localStorage.getItem("token") || ""
  );

  const [bugs, setBugs] = useState([]);

  // ================= LOGIN =================

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed");
    }
  };

  // ================= FETCH BUGS =================

  const fetchBugs = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/bugs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !Array.isArray(data)) {
        console.error("Invalid bugs response:", data);
        setBugs([]);
        return;
      }

      setBugs(data);
    } catch (err) {
      console.error("Fetch bugs failed:", err);
      setBugs([]);
    }
  }, [token]);

  // ================= LOAD AFTER LOGIN =================

useEffect(() => {
  if (!token) return;

  const loadBugs = async () => {
    await fetchBugs();
  };

  loadBugs();
}, [token, fetchBugs]);

  // ================= LOGOUT =================

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setBugs([]);
  };

  // ================= UI =================

  if (!token) {
    return (
      <div style={{ padding: "50px", fontFamily: "Arial" }}>
        <h2>Login</h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <br />
          <br />

          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <br />
          <br />

          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: "50px", fontFamily: "Arial" }}>
      <h2>Bug Tracker Dashboard</h2>

      <button onClick={logout}>Logout</button>

      <h3>Bugs</h3>

      {bugs.length === 0 && <p>No bugs found</p>}

      <ul>
        {bugs.map((bug) => (
          <li key={bug._id}>
            <b>{bug.title}</b> - {bug.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;