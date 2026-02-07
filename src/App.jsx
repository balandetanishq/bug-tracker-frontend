import { useState, useEffect } from "react";

const API = "https://bug-tracker-backend-2-24nh.onrender.com/";

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
    setBugs(data);
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
  {bugs.length === 0 && (
    <p className="text-gray-300 text-center">No bugs found</p>
  )}

  {bugs
  .filter(
    (bug) => filter === "All" || bug.status === filter
  )
  .map((bug) => (
    <div
      key={bug._id}
      className="bg-slate-800 text-white p-3 rounded shadow flex justify-between items-center"
    >
      <div>
        <h3 className="font-semibold">{bug.title}</h3>
        <p className="text-sm text-gray-300">{bug.description}</p>
<p className="text-xs text-cyan-400 mt-1">
  Status: {bug.status}
</p>
      </div>

      <select
  value={bug.status}
  onChange={(e) =>
    updateStatus(bug._id, e.target.value)
  }
  className="bg-slate-700 text-white text-sm rounded px-1 mr-2"
>
  <option>Open</option>
  <option>In Progress</option>
  <option>Closed</option>
</select>

      <button
        onClick={() => delBug(bug._id)}
        className="bg-red-500 px-2 py-1 rounded text-sm hover:bg-red-600"
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