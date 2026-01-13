import { useState, useEffect, useRef } from "react";
import { calculateDistance } from "../utils/calculateDistance";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { useNavigate, Link } from "react-router-dom";
import {
  doc,
  getDoc,
  deleteDoc,
  collection,
  addDoc,
} from "firebase/firestore";

export default function Dashboard() {
  const [task, setTask] = useState(null);
  const [currentDistance, setCurrentDistance] = useState(null);
  const hasTriggered = useRef(false);
  const navigate = useNavigate();

  /* 🔐 AUTH PROTECTION */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/");
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

  /* 🔔 SHOW NOTIFICATION */
  const showNotification = (title, body) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    }
  };

  /* 📤 MOVE TASK TO HISTORY (FIRESTORE) */
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

    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

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
    <div className="container">
      <div className="card">
        <h1>GeoTask Dashboard</h1>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link className="btn" to="/add-task">
            + Add Task
          </Link>
          <Link className="btn" to="/history">
            View History
          </Link>
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

            <button
              className="btn"
              onClick={() => moveTaskToHistory(task)}
            >
              Mark as Completed
            </button>
          </>
        ) : (
          <p>No active task</p>
        )}
      </div>
    </div>
  );
}
