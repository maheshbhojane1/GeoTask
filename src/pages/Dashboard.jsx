import { useState, useEffect, useRef } from "react";
import { calculateDistance } from "../utils/calculateDistance";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { useNavigate, Link } from "react-router-dom";
import { doc, getDoc, deleteDoc, collection, addDoc } from "firebase/firestore";
import { toast } from "react-toastify";

export default function Dashboard() {
  const [task, setTask] = useState(null);
  const [currentDistance, setCurrentDistance] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const hasTriggered = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/", { replace: true });
        button;
      }
    });
    return () => unsub();
  }, [navigate]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const loadTask = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const snap = await getDoc(doc(db, "tasks", user.uid));
      if (snap.exists()) {
        setTask(snap.data());
      }
    };

    loadTask();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/", { replace: true });
  };

  const showNotification = (title, body) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    }
  };

  const moveTaskToHistory = async (completedTask) => {
    const user = auth.currentUser;
    if (!user) return;

    await addDoc(collection(db, "taskHistory"), {
      ...completedTask,
      userId: user.uid,
      completedAt: new Date(),
    });

    await deleteDoc(doc(db, "tasks", user.uid));

    setTask(null);
    setCurrentDistance(null);
    hasTriggered.current = false;
  };

  useEffect(() => {
    if (!task) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (hasTriggered.current) return;

        const distance = calculateDistance(
          task.location.lat,
          task.location.lng,
          pos.coords.latitude,
          pos.coords.longitude,
        );

        setCurrentDistance(distance);

        if (distance >= task.distance) {
          hasTriggered.current = true;

          showNotification(
            "GeoTask Reminder 🔔",
            `Don't forget: ${task.title}`,
          );
          const confirmComplete = window.confirm(
            `Mark "${task.title}" as completed?`,
          );

          setInterval(() => {
            window.location.reload();
          }, 5000);

          if (confirmComplete) {
            moveTaskToHistory(task);
            toast("Task marked as completed");
          } else {
            hasTriggered.current = false;
          }

          navigator.geolocation.clearWatch(watchId);
        }
      },
      () => toast("Location permission denied"),
      { enableHighAccuracy: true },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [task]);

  return (
    <>
      <header className="navbar">
        <div className="logo">GeoTask</div>

        <div className="user-menu">
          <Link className="btn" to="/history">
            History
          </Link>
          <img
            src={auth.currentUser?.photoURL || "/user.png"}
            alt="User"
            className="avatar"
            onClick={() => setShowMenu(!showMenu)}
          />
          {showMenu && (
            <div className="dropdown">
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </header>
      <main className="dash-container">
        <section className="page-header">
          <h2>Current Active Task</h2>
          <Link className="add-btn" to="/add-task">
            Add Task
          </Link>
        </section>

        {task ? (
          <section className="task-card">
            <div className="task-top">
              <div>
                <span className="badge">TRACKING ACTIVE</span>
                <h3>{task.title}</h3>
              </div>
              <span className="status">Active Monitoring</span>
            </div>
            <br />
            <div className="distance-box">
              <div>
                <p>Trigger Distance</p>
                <h3>
                  {task.distance} <span>meters</span>
                </h3>
              </div>

              {currentDistance !== null && (
                <div>
                  <p>Current Distance</p>
                  <h3 className="blue">
                    {currentDistance.toFixed(2)} <span>meters</span>
                  </h3>
                </div>
              )}
            </div>

            <br />

            <div className="actions">
              <button
                className="mark-btn btn"
                onClick={() => {
                  moveTaskToHistory(task);
                  toast("Mark as Completed");
                }}
              >
                Mark as Completed
              </button>

              <button className="view-btn btn" onClick={() => {
                navigate("/taskView")
              }}>
                {""}
                View Task
              </button>
            </div>
          </section>
        ) : (
          <p>No active task</p>
        )}
      </main>
    </>
  );
}
