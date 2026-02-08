import { useState, useEffect, useCallback } from "react";

const API = "https://bug-tracker-backend-2-24nh.onrender.com"; // your backend

export default function App() {
  // ================= AUTH =================
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [token, setToken] = useState(
    localStorage.getItem("token") || null
  );

  // ================= BUG STATES =================
  const [bugs, setBugs] = useState([]);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [project, setProject] = useState("");
  const [assigned, setAssigned] = useState("");

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

      if (data.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
      } else {
        alert(data);
      }
    } catch {
      alert("Login failed");
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
      alert(data);
    } catch {
      alert("Register failed");
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

      if (res.ok) setBugs(data);
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
          project,
          assignedTo: assigned,
        }),
      });

      if (res.ok) {
        setTitle("");
        setDesc("");
        setProject("");
        setAssigned("");
        fetchBugs();
      } else {
        alert("Add failed");
      }
    } catch {
      alert("Add failed");
    }
  };

  // ================= DELETE =================
  const delBug = async (id) => {
    await fetch(API + "/api/bugs/" + id, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    fetchBugs();
  };

  // ================= UPDATE =================
  const updateStatus = async (id, status) => {
    await fetch(API + "/api/bugs/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ status }),
    });

    fetchBugs();
  };

  // ================= FILTER =================
  const filtered =
    filter === "All"
      ? bugs
      : bugs.filter((b) => b.status === filter);

  // ================= LOGIN UI =================
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-900">
        <div className="bg-white p-6 rounded w-80 space-y-3">
          <h2 className="text-xl text-center font-bold">
            Bug Tracker Login
          </h2>

          <input
            placeholder="Email"
            className="w-full border p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={login}
            className="w-full bg-blue-600 text-white py-2"
          >
            Login
          </button>

          <button
            onClick={register}
            className="w-full bg-gray-600 text-white py-2"
          >
            Register
          </button>
        </div>
      </div>
    );
  }

  // ================= DASHBOARD =================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 to-blue-600 p-4 text-white">
      <div className="max-w-md mx-auto bg-blue-900 p-5 rounded-xl space-y-4">

        <h1 className="text-center text-2xl font-bold">
          Bug Tracker Dashboard
        </h1>

        {/* FILTER */}
        <select
          className="w-full p-2 text-black"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option>All</option>
          <option>ToDo</option>
          <option>InProgress</option>
          <option>Done</option>
        </select>

        <button
          onClick={logout}
          className="w-full bg-red-500 py-2 rounded"
        >
          Logout
        </button>

        {/* INPUTS */}
        <input
          placeholder="Bug Title"
          className="w-full p-2 text-black"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Description"
          className="w-full p-2 text-black"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <input
          placeholder="Project Name"
          className="w-full p-2 text-black"
          value={project}
          onChange={(e) => setProject(e.target.value)}
        />

        <input
          placeholder="Assign To"
          className="w-full p-2 text-black"
          value={assigned}
          onChange={(e) => setAssigned(e.target.value)}
        />

        <button
          onClick={createBug}
          className="w-full bg-cyan-500 py-2 rounded"
        >
          Add Bug
        </button>

        {/* BUG LIST */}
        {filtered.length === 0 && (
          <p className="text-center text-gray-300">
            No bugs found
          </p>
        )}

        {filtered.map((bug) => (
          <div
            key={bug._id}
            className="bg-blue-700 p-3 rounded space-y-1"
          >
            <h3 className="font-bold">{bug.title}</h3>

            <p className="text-sm">{bug.description}</p>

            <p className="text-sm">
              📁 {bug.project || "General"}
            </p>

            <p className="text-sm">
              👤 {bug.assignedTo || "Unassigned"}
            </p>

            <div className="flex gap-2 mt-2">
              <select
                className="text-black p-1"
                value={bug.status}
                onChange={(e) =>
                  updateStatus(bug._id, e.target.value)
                }
              >
                <option>ToDo</option>
                <option>InProgress</option>
                <option>Done</option>
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