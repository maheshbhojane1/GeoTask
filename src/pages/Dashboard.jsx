import { useState, useEffect, useRef } from "react";
import { calculateDistance } from "../utils/calculateDistance";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { useNavigate, Link } from "react-router-dom";
import { doc, getDoc, deleteDoc, collection, addDoc } from "firebase/firestore";

export default function Dashboard() {
  const [task, setTask] = useState(null);
  const [currentDistance, setCurrentDistance] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const hasTriggered = useRef(false);
  const navigate = useNavigate();

  /* 🔐 AUTH PROTECTION */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/", { replace: true }); // ⛔ block back button
      }
    });
    return () => unsub();
  }, [navigate]);

  /* 🔔 REQUEST NOTIFICATION PERMISSION */
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  /* 📦 LOAD ACTIVE TASK FROM FIRESTORE */
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

  /* 🔓 LOGOUT HANDLER */
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/", { replace: true }); // ⛔ prevents back navigation
  };

  /* 🔔 SHOW NOTIFICATION */
  const showNotification = (title, body) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    }
  };

  /* 📤 MOVE TASK TO HISTORY */
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

  /* 📍 LOCATION TRACKING */
  useEffect(() => {
    if (!task) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (hasTriggered.current) return;

        const distance = calculateDistance(
          task.location.lat,
          task.location.lng,
          pos.coords.latitude,
          pos.coords.longitude
        );

        setCurrentDistance(distance);

        if (distance >= task.distance) {
          hasTriggered.current = true;

          showNotification(
            "GeoTask Reminder 🔔",
            `Don't forget: ${task.title}`
          );

          const confirmComplete = window.confirm(
            `Mark "${task.title}" as completed?`
          );

          if (confirmComplete) {
            moveTaskToHistory(task);
          } else {
            hasTriggered.current = false;
          }

          navigator.geolocation.clearWatch(watchId);
        }
      },
      () => alert("Location permission denied"),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [task]);

  return (
    <>
      <header class="navbar">
        <div class="logo">GeoTask</div>

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

      <div className="container">
        <div className="card">
          <section class="page-header">
            <h1>Current Active Task</h1>
            <button class="primary-btn btn"><Link className="btn" to="/add-task">
              Add New Task
            </Link></button>
          </section>

          {/* <section class="header">
            <h1>Current Active Task</h1>
            <button class="primary-btn btn"><Link className="btn" to="/add-task">
              Add Task
            </Link></button>
            
          </section> */}

          <div className="task-card">
            <div class="task-top">
              <div>
                <span class="badge">TRACKING ACTIVE</span>
                <h2>Buy Groceries</h2>
                <p class="location">Whole Foods Market, Downtown</p>
              </div>
            </div>
          </div>

          <br />

          {task ? (
            <>
              <p>
                <strong>Task:</strong> {task.title}
              </p>
              <p>
                <strong>Trigger Distance:</strong> {task.distance} m
              </p>

              {currentDistance !== null && (
                <p>
                  <strong>Current Distance:</strong>{" "}
                  {currentDistance.toFixed(2)} m
                </p>
              )}

              <br />

              <button className="btn" onClick={() => moveTaskToHistory(task)}>
                Mark as Completed
              </button>
            </>
          ) : (
            <p>No active task</p>
          )}
        </div>
      </div>
    </>
  );
}
