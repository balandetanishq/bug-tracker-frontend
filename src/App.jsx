import { useEffect, useState } from "react";

const API_BASE = "https://bug-tracker-backend-2-24nh.onrender.com";
export default function App() {
  // ---------------- PROJECT STATE ----------------
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");

  // ---------------- BUG STATE ----------------
  const [bugs, setBugs] = useState([]);
  const [bugTitle, setBugTitle] = useState("");
  const [bugProject, setBugProject] = useState("");
  const [bugStatus, setBugStatus] = useState("Open");
  const [bugPriority, setBugPriority] = useState("Medium");

  // ---------------- FETCH PROJECTS ----------------
  const fetchProjects = async () => {
    try {
      const res = await fetch("https://bug-tracker-backend-2-24nh.onrender.com/api/projects");
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- FETCH BUGS ----------------
  const fetchBugs = async () => {
    try {
      const res = await fetch("https://bug-tracker-backend-2-24nh.onrender.com/api/bugs");
      const data = await res.json();
      setBugs(data);
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- CREATE PROJECT ----------------
  const createProject = async () => {
    if (!projectName.trim()) return;

    await fetch("https://bug-tracker-backend-2-24nh.onrender.com/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: projectName,
        description: "Auto description",
      }),
    });

    setProjectName("");
    fetchProjects();
  };

  // ---------------- CREATE BUG ----------------
  const createBug = async () => {
    if (!bugTitle || !bugProject) return;

    await fetch("https://bug-tracker-backend-2-24nh.onrender.com/api/bugs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: bugTitle,
        project: bugProject,
        status: bugStatus,
        priority: bugPriority,
        description: "Auto created bug",
      }),
    });

    setBugTitle("");
    setBugProject("");
    setBugStatus("Open");
    setBugPriority("Medium");
    fetchBugs();
  };

  // ---------------- INITIAL LOAD ----------------
  useEffect(() => {
    (async () => {
      await fetchProjects();
      await fetchBugs();
    })();
  }, []);

  // ---------------- UI ----------------
  return (
    <div style={{ padding: "30px", maxWidth: "800px" }}>
      <h1>Bug Tracker</h1>

      {/* CREATE PROJECT */}
      <h2>Projects</h2>
      <input
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        placeholder="New project name"
      />
      <button onClick={createProject} style={{ marginLeft: "10px" }}>
        Add Project
      </button>

      <ul style={{ marginTop: "20px" }}>
        {projects.map((project) => (
          <li key={project._id}>{project.name}</li>
        ))}
      </ul>

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
        <option value="">Select Project</option>
        {projects.map((project) => (
          <option key={project._id} value={project._id}>
            {project.name}
          </option>
        ))}
      </select>

      <select
        value={bugStatus}
        onChange={(e) => setBugStatus(e.target.value)}
      >
        <option>Open</option>
        <option>In Progress</option>
        <option>Closed</option>
      </select>

      <select
        value={bugPriority}
        onChange={(e) => setBugPriority(e.target.value)}
      >
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>

      <button onClick={createBug} style={{ marginLeft: "10px" }}>
        Add Bug
      </button>

      <hr />

      {/* BUG LIST */}
      <h2>Bugs</h2>

      <ul>
        {bugs.map((bug) => (
          <li key={bug._id} style={{ marginBottom: "12px" }}>
            <strong>{bug.title}</strong>
            <br />
            Project: {bug.project?.name || "N/A"}
            <br />
            Status: {bug.status} | Priority: {bug.priority}
          </li>
        ))}
      </ul>
    </div>
  );
}
