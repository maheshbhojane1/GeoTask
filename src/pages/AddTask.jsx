import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import { db } from "../services/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function AddTask() {
  const [title, setTitle] = useState("");
  const [item, setItems] = useState("");
  const [distance, setDistance] = useState(200);
  const [location, setLocation] = useState(null);
  const navigate = useNavigate();

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });
  };

  const distanceChange = (e) => {
    const val = e.target.value;
    if (val < 100) {
      setDistance(100);
    } else {
      setDistance(val);
    } 

  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user || !location) return;

    toast("Task Added Successfully");

    await setDoc(doc(db, "tasks", user.uid), {
      title,
      distance,
      location,
      item,
      createdAt: new Date(),
    });

    navigate("/dashboard");
  };

  return (
    <>
      <header className="navbar">
        <div className="logo">GeoTask</div>

        <div className="dash-user-menu">
          <Link className="nav-btn" to="/dashboard">
            Dashboard
          </Link>
          <Link className="nav-btn" to="/taskView">
            View Task
          </Link>
          <Link className="nav-btn" to="/history">
            History
          </Link>
        </div>
      </header>
      <div className="task-container">
        <div className="task-card">
          <h2>Add Task</h2>
          <p className="task-subtitle">Set a location trigger for your task</p>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", gap: "50px" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "20%",
                }}
              >
                <label>Task Title</label>
                <br />
                <input
                  placeholder="Buy groceries"
                  required
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "50%",
                }}
              >
                <label>Task </label>
                <br />
                <textarea
                  className="description-input"
                  placeholder="Task Description / List"
                  onChange={(e) => setItems(e.target.value)}
                />
              </div>
            </div>

            <label>Trigger Distance</label>
            <div class="input-group">
              <input
                type="number"
                onChange={distanceChange}
                placeholder="100"
                // value={distance}
                min={100}
                required
              />
              <span>meters</span>
            </div>

            <div class="actions">
              <button type="button" class="location" onClick={getLocation}>
                Location
              </button>
              <button type="submit" class="primary">
                Save Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
