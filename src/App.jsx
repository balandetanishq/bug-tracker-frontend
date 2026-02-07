import { useState, useEffect, useCallback } from "react";

const API = "https://bug-tracker-backend-2-24nh.onrender.com";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [bugs, setBugs] = useState([]);
  const [filter, setFilter] = useState("All");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  // ================= AUTH =================

  const login = async () => {
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
  };

  const register = async () => {
    await fetch(API + "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    alert("Registered. Now login.");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  // ================= BUGS =================

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
        desc,
        status: "Open",
        priority: "Medium",
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Create failed:", err);
      return;
    }

    setTitle("");
    setDesc("");

    await fetchBugs(); // wait properly

  } catch (err) {
    console.error("Create error:", err);
  }
};

const fetchBugs = useCallback(async () => {
  try {
    const res = await fetch(API + "/api/bugs", {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });

    if (!res.ok) return;

    const data = await res.json();
    setBugs(data);
  } catch (err) {
    console.error(err);
  }
}, [token]);


const delBug = async (id) => {
  try {
    await fetch(API + "/api/bugs/" + id, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });

    fetchBugs(); // reload list
  } catch (err) {
    console.error("Delete failed", err);
  }
};

useEffect(() => {
  if (token) fetchBugs();
}, [token, fetchBugs]);

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

    fetchBugs(); // reload list
  } catch (err) {
    console.error("Update failed", err);
  }
};

  // ================= UI =================

  if (!token) {
    return (
      <div className="app">
        <h2>Bug Tracker</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button onClick={login}>Login</button>
        <button onClick={register}>
          Register
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <h2 className ="text-xl font-bold mb-4"> Dashboard</h2>
      <select
  value={filter}
  onChange={(e) => setFilter(e.target.value)}
  className="mb-4 bg-slate-700 text-white rounded px-2 py-1"
>
  <option>All</option>
  <option>Open</option>
  <option>In Progress</option>
  <option>Closed</option>
</select>

      <button onClick={logout}>
        Logout
      </button>

      <input
        placeholder="Bug title"
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
        className="w-full p-2 rounded bg-white text-black outline-none border border-gray-300 focus:ring-2 focus:ring-cyan-400"
      />

      <input
        placeholder="Description"
        value={desc}
        onChange={(e) =>
          setDesc(e.target.value)
        }
        className="w-full p-2 rounded bg-white text-black outline-none border border-gray-300 focus:ring-2 focus:ring-cyan-400"
      />

      <button
  onClick={createBug}
  className="w-full bg-cyan-500 text-white py-2 rounded hover:bg-cyan-600"
>
  Add Bug
</button>

      <ul>
        <div className="mt-6 w-full max-w-md space-y-3">
  {/* No Bugs Message */}
{Array.isArray(bugs) && bugs.length === 0 && (
  <p className="text-gray-300 text-center mt-4">
    No bugs found
  </p>
)}

{/* Bug List */}
{Array.isArray(bugs) &&
  bugs
    .filter(
      (bug) => filter === "All" || bug.status === filter
    )
    .map((bug) => (
       <div
    key={bug._id}
    className="bg-gray-800 p-4 rounded shadow"
  >
    <h4 className="text-xl font-semibold">
      {bug.title}
    </h4>

    <p className="text-gray-400">
      {bug.description}
    </p>

    <p>Status: {bug.status}</p>

    <select
      value={bug.status}
      onChange={(e) =>
        updateStatus(bug._id, e.target.value)
      }
      className="bg-gray-700 p-1 rounded"
    >
      <option>Open</option>
      <option>In Progress</option>
      <option>Closed</option>
    </select>

    <button
      onClick={() => delBug(bug._id)}
      className="mt-2 bg-red-600 px-3 py-1 rounded hover:bg-red-700"
    >
      Delete
    </button>
  </div>
    ))}
</div>
      </ul>
    </div>
  );
}