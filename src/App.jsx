import { useEffect, useState } from "react";
import Login from "./pages/Login";

const API_BASE = "http://localhost:5000";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");

  const [bugs, setBugs] = useState([]);
  const [bugTitle, setBugTitle] = useState("");
  const [bugProject, setBugProject] = useState("");
  const [bugPriority, setBugPriority] = useState("Medium");

  // ---------- LOAD DATA ----------
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      const pRes = await fetch(`${API_BASE}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(await pRes.json());

      const bRes = await fetch(`${API_BASE}/api/bugs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBugs(await bRes.json());
    };

    fetchData();
  }, [token]);

  // ---------- CREATE PROJECT ----------
  const createProject = async () => {
    if (!projectName.trim()) return;

    await fetch(`${API_BASE}/api/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: projectName,
        description: "Auto project",
      }),
    });

    setProjectName("");
    const res = await fetch(`${API_BASE}/api/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setProjects(await res.json());
  };

  // ---------- CREATE BUG ----------
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
        status: "Open",
        priority: bugPriority,
        description: "Auto bug",
      }),
    });

    setBugTitle("");
    setBugProject("");
    setBugPriority("Medium");

    const res = await fetch(`${API_BASE}/api/bugs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setBugs(await res.json());
  };

  // ---------- UPDATE STATUS ----------
  const updateStatus = async (id, status) => {
    await fetch(`${API_BASE}/api/bugs/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    const res = await fetch(`${API_BASE}/api/bugs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setBugs(await res.json());
  };

  if (!token) {
    return (
      <Login
        onLogin={(jwt) => {
          localStorage.setItem("token", jwt);
          setToken(jwt);
        }}
      />
    );
  }

  const renderColumn = (status) =>
    bugs
      .filter((b) => b.status === status)
      .map((b) => (
        <div
          key={b._id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
            background: "#f9f9f9",
          }}
        >
          <strong>{b.title}</strong>
          <br />
          Priority: {b.priority}
          <br />
          <select
            value={b.status}
            onChange={(e) => updateStatus(b._id, e.target.value)}
          >
            <option>Open</option>
            <option>In Progress</option>
            <option>Closed</option>
          </select>
        </div>
      ));

  return (
    <div style={{ padding: "30px", maxWidth: "800px" }}>
      <h1>Bug Tracker</h1>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          setToken(null);
        }}
      >
        Logout
      </button>

      <hr />

      <h2>Create Project</h2>
      <input
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        placeholder="Project name"
      />
      <button onClick={createProject}>Add</button>

      <hr />

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

      <h2>Status Board</h2>

      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ width: "30%" }}>
          <h3>Open</h3>
          {renderColumn("Open")}
        </div>

        <div style={{ width: "30%" }}>
          <h3>In Progress</h3>
          {renderColumn("In Progress")}
        </div>

        <div style={{ width: "30%" }}>
          <h3>Closed</h3>
          {renderColumn("Closed")}
        </div>
      </div>
    </div>
  );
}