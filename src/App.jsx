import { useState, useEffect } from "react";

const API = "https://bug-tracker-backend-2-24h.onrender.com";

export default function App() {
  const [bugs, setBugs] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  /* ---------------- LOGIN ---------------- */

  const login = async () => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log("LOGIN RESPONSE:", data);

    if (data.token) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
      fetchBugs(data.token);
    } else {
      alert("Login failed");
    }
  };

  /* ---------------- FETCH BUGS ---------------- */

  const fetchBugs = async (authToken = token) => {
    const res = await fetch(`${API}/api/bugs`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await res.json();
    setBugs(data);
  };

  /* ---------------- CREATE BUG ---------------- */

  const createBug = async () => {
    await fetch(`${API}/api/bugs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        description,
        status: "Open",
        priority: "Medium",
      }),
    });

    setTitle("");
    setDescription("");
    fetchBugs();
  };

  /* ---------------- UPDATE STATUS ---------------- */

  const updateStatus = async (id, status) => {
    await fetch(`${API}/api/bugs/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    fetchBugs();
  };

  /* ---------------- LOGOUT ---------------- */

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setBugs([]);
  };

  /* ---------------- AUTO LOAD ---------------- */

  useEffect(() => {
    if (token) {
      fetchBugs();
    }
  }, [token]);

  /* ---------------- FILTER ---------------- */

  const filteredBugs = bugs.filter((bug) => {
    const matchSearch = bug.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchFilter =
      filter === "All" ? true : bug.status === filter;

    return matchSearch && matchFilter;
  });

  /* ---------------- UI ---------------- */

  if (!token) {
    return (
      <div style={{ padding: "40px", color: "white" }}>
        <h2>Login First</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br />
        <br />

        <button onClick={login}>Login</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "30px", color: "white" }}>
      <h1>Bug Tracker</h1>

      <button onClick={logout}>Logout</button>

      <hr />

      {/* Create Bug */}

      <h3>Create Bug</h3>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <br />

      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <br />

      <button onClick={createBug}>Add Bug</button>

      <hr />

      {/* Filters */}

      <input
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      >
        <option>All</option>
        <option>Open</option>
        <option>In Progress</option>
        <option>Closed</option>
      </select>

      <hr />

      {/* Bugs */}

      {filteredBugs.map((bug) => (
        <div
          key={bug._id}
          style={{
            border: "1px solid white",
            margin: "10px",
            padding: "10px",
          }}
        >
          <h4>{bug.title}</h4>
          <p>{bug.description}</p>
          <p>Status: {bug.status}</p>

          <select
            value={bug.status}
            onChange={(e) =>
              updateStatus(bug._id, e.target.value)
            }
          >
            <option>Open</option>
            <option>In Progress</option>
            <option>Closed</option>
          </select>
        </div>
      ))}
    </div>
  );
}