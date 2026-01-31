import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../services/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "taskHistory"),
        where("userId", "==", user.uid),
      );

      const snapshot = await getDocs(q);
      const tasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setHistory(tasks);
      setLoading(false);
    };

    fetchHistory();
  }, []);

  const deleteHistoryItem = async (id) => {
    if (!window.confirm("Delete this history item?")) return;

    await deleteDoc(doc(db, "taskHistory", id));
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <>
      <header className="navbar">
        <div className="logo">GeoTask</div>
        <div className="dash-user-menu">
          <Link className="nav-btn" to="/add-task">
            Add Task
          </Link>
        </div>
      </header>
      <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <div className="history-container">
          <div className="history-header">
            <h1>Task History</h1>

            <Link className="container-btn" to="/dashboard">
              Back
            </Link>
          </div>

          <br />
          <br />

          {loading ? (
            <p style={{ textAlign: "center" }}>Loading...</p>
          ) : history.length === 0 ? (
            <p>No completed tasks yet</p>
          ) : (
            <section className="history-card">
              {history.map((task) => (
                <div className="history-item" key={task.id}>
                  <div>
                    <h3>{task.title}</h3>
                    <p>
                      Completed on {task.completedAt.toDate().toLocaleString()}
                    </p>
                  </div>

                  <span
                    className="delete"
                    onClick={() => deleteHistoryItem(task.id)}
                  >
                    Delete
                  </span>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </>
  );
}
