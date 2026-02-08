import { useState, useEffect, useCallback } from "react";

const API = "https://bug-tracker-backend-2-24nh.onrender.com";

export default function App() {

  /* ================= AUTH ================= */

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );


  /* ================= BUG STATE ================= */

  const [bugs, setBugs] = useState([]);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [project, setProject] = useState("");
  const [assigned, setAssigned] = useState("");


  /* ================= LOGIN ================= */

  const login = async () => {

    try {

      const res = await fetch(API + "/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
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


  const register = async () => {

    try {

      const res = await fetch(API + "/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      alert(data);

    } catch {
      alert("Register failed");
    }
  };


  const logout = () => {

    localStorage.removeItem("token");
    setToken(null);
  };


  /* ================= FETCH ================= */

  const fetchBugs = useCallback(async () => {

    if (!token) return;

    try {

      const res = await fetch(API + "/api/bugs", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await res.json();

      setBugs(data);

    } catch (err) {
      console.error(err);
    }

  }, [token]);


  useEffect(() => {

    if (token) fetchBugs();

  }, [token, fetchBugs]);


  /* ================= ADD BUG ================= */

  const createBug = async () => {

    if (!title.trim() || !desc.trim()) {
      alert("Fill title and description");
      return;
    }

    try {

      const res = await fetch(API + "/api/bugs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },

        // ✅ SEND ALL FIELDS
        body: JSON.stringify({
          title,
          description: desc,
          project,
          assignedTo: assigned,
        }),
      });

      if (!res.ok) {
        alert("Add failed");
        return;
      }

      const newBug = await res.json();

      setBugs((old) => [newBug, ...old]);

      // Clear form
      setTitle("");
      setDesc("");
      setProject("");
      setAssigned("");

    } catch {
      alert("Server error");
    }
  };


  /* ================= DELETE ================= */

  const delBug = async (id) => {

    await fetch(API + "/api/bugs/" + id, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    fetchBugs();
  };


  /* ================= UPDATE ================= */

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


  /* ================= LOGIN UI ================= */

  if (!token) {

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-900 text-white">

        <div className="bg-slate-800 p-8 rounded-xl w-96 shadow-xl space-y-4">

          <h2 className="text-3xl font-bold text-center">
            🐞 Bug Tracker
          </h2>

          <input
            placeholder="Email"
            className="w-full p-3 rounded text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={login}
            className="w-full bg-indigo-600 py-2 rounded"
          >
            Login
          </button>

          <button
            onClick={register}
            className="w-full bg-gray-600 py-2 rounded"
          >
            Register
          </button>

        </div>
      </div>
    );
  }


  /* ================= KANBAN ================= */

  const todo = bugs.filter((b) => b.status === "ToDo");
  const prog = bugs.filter((b) => b.status === "InProgress");
  const done = bugs.filter((b) => b.status === "Done");


  return (
    <div className="min-h-screen flex bg-slate-900 text-white">

      {/* SIDEBAR */}
      <div className="w-64 bg-slate-800 p-6 space-y-4">

        <h2 className="text-2xl font-bold">
          🐞 Bug Tracker
        </h2>

        <button
          onClick={logout}
          className="w-full bg-red-600 py-2 rounded"
        >
          Logout
        </button>

        <hr className="border-gray-600" />

        <h3 className="font-semibold">Create Bug</h3>

        <input
          placeholder="Title"
          className="w-full p-2 text-black rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Description"
          className="w-full p-2 text-black rounded"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <input
          placeholder="Project"
          className="w-full p-2 text-black rounded"
          value={project}
          onChange={(e) => setProject(e.target.value)}
        />

        <input
          placeholder="Assign To"
          className="w-full p-2 text-black rounded"
          value={assigned}
          onChange={(e) => setAssigned(e.target.value)}
        />

        <button
          onClick={createBug}
          className="w-full bg-cyan-500 py-2 rounded"
        >
          Add Bug
        </button>

      </div>


      {/* MAIN */}
      <div className="flex-1 p-6">

        <h1 className="text-3xl font-bold mb-6">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <Column title="To Do" color="bg-blue-700" data={todo} update={updateStatus} del={delBug} />
          <Column title="In Progress" color="bg-yellow-600" data={prog} update={updateStatus} del={delBug} />
          <Column title="Done" color="bg-green-700" data={done} update={updateStatus} del={delBug} />

        </div>

      </div>
    </div>
  );
}


/* ================= COLUMN ================= */

function Column({ title, color, data, update, del }) {

  return (
    <div className="bg-slate-800 rounded-xl p-4 space-y-3">

      <h2 className={`text-xl font-bold p-2 rounded ${color}`}>
        {title}
      </h2>

      {data.length === 0 && (
        <p className="text-gray-400 text-center">
          Empty
        </p>
      )}

      {data.map((bug) => (

        <div
          key={bug._id}
          className="bg-slate-700 p-3 rounded space-y-1"
        >

          <h3 className="font-semibold">
            {bug.title}
          </h3>

          <p className="text-sm text-gray-300">
            {bug.description}
          </p>

          <p className="text-xs">
            📁 {bug.project}
          </p>

          <p className="text-xs">
            👤 {bug.assignedTo}
          </p>

          <div className="flex gap-2 mt-2">

            <select
              className="text-black text-sm p-1 rounded flex-1"
              value={bug.status}
              onChange={(e) =>
                update(bug._id, e.target.value)
              }
            >
              <option>ToDo</option>
              <option>InProgress</option>
              <option>Done</option>
            </select>

            <button
              onClick={() => del(bug._id)}
              className="bg-orange-500 px-2 rounded text-sm"
            >
              ✕
            </button>

          </div>

        </div>
      ))}
    </div>
  );
}