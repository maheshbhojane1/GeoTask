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

  /* 📦 LOAD HISTORY FROM FIRESTORE */
  useEffect(() => {
    const fetchHistory = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "taskHistory"),
        where("userId", "==", user.uid)
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

  /* ❌ DELETE SINGLE HISTORY ITEM */
  const deleteHistoryItem = async (id) => {
    if (!window.confirm("Delete this history item?")) return;

    await deleteDoc(doc(db, "taskHistory", id));
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Task History</h1>

        <Link className="btn" to="/dashboard">
          ← Back to Dashboard
        </Link>

        <br /><br />

        {loading ? (
          <p>Loading...</p>
        ) : history.length === 0 ? (
          <p>No completed tasks yet</p>
        ) : (
          <ul>
            {history.map((task) => (
              <li key={task.id} style={{ marginBottom: "15px" }}>
                <strong>{task.title}</strong>
                <br />
                <small>
                  Completed on:{" "}
                  {task.completedAt.toDate().toLocaleString()}
                </small>
                <br />
                <button
                  className="btn"
                  style={{ marginTop: "5px" }}
                  onClick={() => deleteHistoryItem(task.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
