/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";

const API_BASE = "https://bug-tracker-backend-2-24hn.onrender.com";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const [projects, setProjects] = useState([]);
  const [bugs, setBugs] = useState([]);

  const [projectName, setProjectName] = useState("");
  const [bugTitle, setBugTitle] = useState("");
  const [bugProject, setBugProject] = useState("");
  const [bugPriority, setBugPriority] = useState("Medium");

  /* =========================
     FETCH PROJECTS
  ========================= */
  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  /* =========================
     FETCH BUGS
  ========================= */
  const fetchBugs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/bugs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setBugs(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProjects();
      fetchBugs();
    }
  }, [token]);

  /* =========================
     CREATE PROJECT
  ========================= */
  const createProject = async () => {
    if (!projectName.trim()) return;

    await fetch(`${API_BASE}/api/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: projectName }),
    });

    setProjectName("");
    fetchProjects();
  };

  /* =========================
     CREATE BUG
  ========================= */
  const createBug = async () => {
    if (!bugTitle || !bugProject) return;

    await fetch(`${API_BASE}/api/bugs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: bugTitle,
        project: bugProject,
        priority: bugPriority,
        status: "Open",
      }),
    });

    setBugTitle("");
    setBugProject("");
    setBugPriority("Medium");
    fetchBugs();
  };

  /* =========================
     LOGOUT
  ========================= */
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  /* =========================
     NOT LOGGED IN
  ========================= */
  if (!token) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>Login first</h2>
        <p>You are not authenticated.</p>
      </div>
    );
  }

  /* =========================
     UI
  ========================= */
  return (
    <div style={{ padding: "30px", maxWidth: "1200px" }}>
      <h1>Bug Tracker</h1>
      <button onClick={logout}>Logout</button>

      <hr />

      {/* CREATE PROJECT */}
      <h2>Create Project</h2>
      <input
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        placeholder="Project name"
      />
      <button onClick={createProject}>Add</button>

      <hr />

      {/* CREATE BUG */}
      <h2>Create Bug</h2>
      <input
        value={bugTitle}
        onChange={(e) => setBugTitle(e.target.value)}
        placeholder="Bug title"
      />

      <select
        value={bugProject}
        onChange={(e) => setBugProject(e.target.value)}
      >
        <option value="">Select project</option>
        {projects.map((p) => (
          <option key={p._id} value={p._id}>
            {p.name}
          </option>
        ))}
      </select>

      <select
        value={bugPriority}
        onChange={(e) => setBugPriority(e.target.value)}
      >
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>

      <button onClick={createBug}>Add Bug</button>

      <hr />

      {/* STATUS BOARD */}
      <h2>Status Board</h2>

      <div style={{ display: "flex", gap: "40px" }}>
        <div style={{ flex: 1 }}>
          <h3>Open</h3>
          {bugs
            .filter((b) => b.status === "Open")
            .map((b) => (
              <BugItem key={b._id} bug={b} />
            ))}
        </div>

        <div style={{ flex: 1 }}>
          <h3>In Progress</h3>
          {bugs
            .filter((b) => b.status === "In Progress")
            .map((b) => (
              <BugItem key={b._id} bug={b} />
            ))}
        </div>

        <div style={{ flex: 1 }}>
          <h3>Closed</h3>
          {bugs
            .filter((b) => b.status === "Closed")
            .map((b) => (
              <BugItem key={b._id} bug={b} />
            ))}
        </div>
      </div>
    </div>
  );
}

/* =========================
   BUG ITEM
========================= */
function BugItem({ bug }) {
  return (
    <div
      style={{
        border: "1px solid #555",
        padding: "10px",
        marginBottom: "10px",
      }}
    >
      <strong>{bug.title}</strong>
      <br />
      Project: {bug.project?.name || "N/A"}
      <br />
      Priority: {bug.priority}
      <br />
      Status: {bug.status}
    </div>
  );
}