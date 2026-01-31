import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function TaskView() {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/", { replace: true });
    });
    return () => unsub();
  }, [navigate]);

  useEffect(() => {
    const fetchTask = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const snap = await getDoc(doc(db, "tasks", user.uid));
      if (snap.exists()) {
        setTask(snap.data());
      }
      setLoading(false);
    };

    fetchTask();
  }, []);

  return (
    <>
      <header className="navbar">
        <div className="logo">GeoTask</div>

        <div className="dash-user-menu">
          <Link className="nav-btn" to="/dashboard">
            Dashboard
          </Link>
          <Link className="nav-btn" to="/add-task">
            Add Task
          </Link>
          <Link className="nav-btn" to="/history">
            History
          </Link>
        </div>
      </header>

      <main className="task-view-container">

        {loading ? (
          <p>Loading...</p>
        ) : !task ? (
          <p>No active task found</p>
        ) : (
          <div className="task-view-card">
            <div className="task-header">
              <div className="task-title-group">
                <h1 className="task-title">{task.title}</h1>
              </div>
            </div>
            <div className="task-section">
              <div className="section-label">
                <iconify-icon icon="lucide:list"></iconify-icon>
                Task Description / List
              </div>
              <div className="task-list">
                <div className="task-list-item">
                  <span>{task.item || "No description added"}</span>
                </div>
              </div>
            </div>

            <div class="task-section">
              <div class="section-label">
                <iconify-icon icon="lucide:map"></iconify-icon>
                Trigger Distance
              </div>

              <div class="trigger-info">
                <iconify-icon icon="lucide:radius"></iconify-icon>
                <div>
                  <div class="trigger-value">{task.distance} meters</div>
                </div>
              </div>
            </div>

            <div class="btn-group">
              <Link className="back-btn" to="/dashboard">
                Back to Dashboard
              </Link>

              <Link className="add-btn" to="/add-task">
                Add Task
              </Link>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
