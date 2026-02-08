import { useState, useEffect, useCallback } from "react";

const API = "https://bug-tracker-backend-2-24nh.onrender.com";

export default function App() {
  // ================= AUTH =================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data);
        return;
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
    } catch {
      alert("Login failed");
    }
  };

  // ================= REGISTER =================

  const register = async () => {
    try {
      const res = await fetch(API + "/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data);
        return;
      }

      alert("Registered. Now login.");
    } catch {
      alert("Register failed");
    }
  };

  // ================= LOGOUT =================

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setBugs([]);
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

      if (res.ok) {
        setBugs(data);
      }
    } catch {
      console.log("Fetch failed");
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchBugs();
  }, [token, fetchBugs]);

  // ================= ADD BUG =================

  const createBug = async () => {
    if (!title.trim()) return;

    try {
      const res = await fetch(API + "/api/bugs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          title,
          description: desc,
        }),
      });

      if (!res.ok) {
        alert("Add failed");
        return;
      }

      setTitle("");
      setDesc("");

      fetchBugs();
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
        <div className="bg-blue-800 p-8 rounded-xl w-80 space-y-4">

          <h2 className="text-2xl text-center font-bold">
            Bug Tracker
          </h2>

          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 rounded text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 rounded text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={login}
            className="w-full bg-green-500 py-2 rounded"
          >
            Login
          </button>

          <button
            onClick={register}
            className="w-full bg-yellow-500 py-2 rounded"
          >
            Register
          </button>

        </div>
      </div>
    );
  }

  // ================= DASHBOARD UI =================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 text-white flex justify-center p-6">

      <div className="bg-blue-800 p-6 rounded-xl w-full max-w-md space-y-4">

        <h2 className="text-xl font-bold text-center">
          Dashboard
        </h2>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full p-2 rounded text-black"
        >
          <option>All</option>
          <option>Open</option>
          <option>In Progress</option>
          <option>Closed</option>
        </select>

        <button
          onClick={logout}
          className="w-full bg-red-500 py-2 rounded"
        >
          Logout
        </button>

        <input
          placeholder="Title"
          className="w-full p-2 rounded text-black"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Description"
          className="w-full p-2 rounded text-black"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <button
          onClick={createBug}
          className="w-full bg-cyan-500 py-2 rounded"
        >
          Add Bug
        </button>

        {filteredBugs.length === 0 && (
          <p className="text-center text-gray-300">
            No bugs found
          </p>
        )}

        {filteredBugs.map((bug) => (
          <div
            key={bug._id}
            className="bg-blue-700 p-3 rounded space-y-2"
          >

            <h3 className="font-bold">{bug.title}</h3>

            <p className="text-sm">{bug.description}</p>

            <div className="flex gap-2">

              <select
                value={bug.status}
                onChange={(e) =>
                  updateStatus(bug._id, e.target.value)
                }
                className="p-1 rounded text-black flex-1"
              >
                <option>Open</option>
                <option>In Progress</option>
                <option>Closed</option>
              </select>

              <button
                onClick={() => delBug(bug._id)}
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