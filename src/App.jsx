import { useState, useEffect, useCallback } from "react";

const API = "https://bug-tracker-backend-2-24nh.onrender.com";
export default function App() {
  // ================= AUTH =================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));

  // ================= BUGS =================

  const [bugs, setBugs] = useState([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [filter, setFilter] = useState("All");

  // ================= LOGIN =================

  const login = async () => {
    try {
      const res = await fetch(API + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) return alert(data.message || "Login failed");

      localStorage.setItem("token", data.token);
      setToken(data.token);
    } catch {
      alert("Login error");
    }
  };

  // ================= REGISTER =================

  const register = async () => {
    try {
      const res = await fetch(API + "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) return alert(data.message || "Register failed");

      alert("Registered. Now login.");
    } catch {
      alert("Register error");
    }
  };

  // ================= LOGOUT =================

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  // ================= FETCH BUGS =================

  const fetchBugs = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch(API + "/api/bugs", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await res.json();
      setBugs(Array.isArray(data) ? data : []);
    } catch {
      console.error("Fetch failed");
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchBugs();
  }, [token, fetchBugs]);

  // ================= ADD BUG =================

  const addBug = async () => {
    if (!title.trim()) return;

    try {
      const res = await fetch(API + "/api/bugs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ title, desc }),
      });

      if (!res.ok) throw new Error();

      setTitle("");
      setDesc("");

      await fetchBugs();
    } catch {
      alert("Add failed");
    }
  };

  // ================= DELETE BUG =================

  const delBug = async (id) => {
    try {
      await fetch(API + "/api/bugs/" + id, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      fetchBugs();
    } catch {
      alert("Delete failed");
    }
  };

  // ================= UPDATE STATUS =================

  const updateStatus = async (id, status) => {
    try {
      await fetch(API + "/api/bugs/" + id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ status }),
      });

      fetchBugs();
    } catch {
      alert("Update failed");
    }
  };

  // ================= FILTER =================

  const filteredBugs = bugs.filter(
    (b) => filter === "All" || b.status === filter
  );

  // ================= LOGIN UI =================

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-900">
        <div className="bg-blue-800 p-6 rounded w-80 space-y-3">
          <h2 className="text-white text-xl text-center">Login</h2>

          <input
            className="w-full p-2 rounded text-black"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full p-2 rounded text-black"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={login}
            className="w-full bg-cyan-500 py-2 rounded text-white"
          >
            Login
          </button>

          <button
            onClick={register}
            className="w-full bg-gray-600 py-2 rounded text-white"
          >
            Register
          </button>
        </div>
      </div>
    );
  }

  // ================= DASHBOARD =================

  return (
    <div className="min-h-screen bg-blue-900 flex justify-center pt-10">
      <div className="bg-blue-800 w-full max-w-md p-6 rounded space-y-4">

        <h2 className="text-white text-xl text-center">Dashboard</h2>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full p-2 rounded text-black"
        >
          <option>All</option>
          <option>Open</option>
          <option>Closed</option>
        </select>

        <button
          onClick={logout}
          className="w-full bg-red-500 py-2 rounded text-white"
        >
          Logout
        </button>

        <input
          className="w-full p-2 rounded text-black"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full p-2 rounded text-black"
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <button
          onClick={addBug}
          className="w-full bg-cyan-500 py-2 rounded text-white"
        >
          Add Bug
        </button>

        {filteredBugs.length === 0 && (
          <p className="text-gray-300 text-center">No bugs found</p>
        )}

        {filteredBugs.map((b) => (
          <div
            key={b._id}
            className="bg-blue-700 p-3 rounded text-white"
          >
            <h3 className="font-bold">{b.title}</h3>
            <p>{b.desc}</p>

            <div className="flex justify-between mt-2">

              <select
                value={b.status}
                onChange={(e) =>
                  updateStatus(b._id, e.target.value)
                }
                className="text-black p-1 rounded"
              >
                <option>Open</option>
                <option>Closed</option>
              </select>

              <button
                onClick={() => delBug(b._id)}
                className="bg-orange-500 px-3 rounded"
              >
                Delete
              </button>

            </div>
          </div>
        ))}

      </div>
    </div>
  );
}