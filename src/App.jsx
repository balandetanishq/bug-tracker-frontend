import { useState, useEffect } from "react";

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

  const fetchBugs = async () => {
    const res = await fetch(API + "/api/bugs", {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    const data = await res.json();
    setBugs(Array.isArray(data) ? data : []);
  };

  const addBug = async () => {
    await fetch(API + "/api/bugs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        title,
        description: desc,
        status: "Open",
      }),
    });

    setTitle("");
    setDesc("");
    fetchBugs();
  };

  const delBug = async (id) => {
    await fetch(API + "/api/bugs/" + id, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    fetchBugs();
  };

useEffect(() => {
  if (!token) return;

  const load = async () => {
    await fetchBugs();
  };

  load();
}, [token]);

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

      <button onClick={addBug}>
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
        className="bg-blue-800/40 p-4 rounded-lg mb-4 text-white"
      >
        {/* Title */}
        <h3 className="text-lg font-bold">
          {bug.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-200 mb-2">
          {bug.description}
        </p>

        {/* Status */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">Status:</span>

          <select
            value={bug.status}
            onChange={(e) =>
              updateStatus(bug._id, e.target.value)
            }
            className="bg-blue-900 text-white px-2 py-1 rounded"
          >
            <option>Open</option>
            <option>In Progress</option>
            <option>Closed</option>
          </select>
        </div>

        {/* Delete */}
        <button
          onClick={() => delBug(bug._id)}
          className="bg-orange-500 hover:bg-orange-600 px-4 py-1 rounded"
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