import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import { db } from "../services/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function AddTask() {
  const [title, setTitle] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user || !location) return;

    await setDoc(doc(db, "tasks", user.uid), {
      title,
      distance,
      location,
      createdAt: new Date(),
    });

    navigate("/dashboard");
  };

  return (

  
    // <div className="container">
    //   <div className="card">
    //     <h2>Add Task</h2>

    //     <input
    //       placeholder="Task title"
    //       value={title}
    //       onChange={(e) => setTitle(e.target.value)}
    //     />

    //     <input
    //       type="number"
    //       value={distance}
    //       onChange={(e) => setDistance(e.target.value)}
    //     />

    //     <button className="btn" onClick={getLocation}>
    //       Capture Location
    //     </button>

    //     <button className="btn" onClick={handleSubmit}>
    //       Save Task
    //     </button>
    //   </div>
    // </div>

    <>
    
    <header class="topbar">
    <h2>GeoTask</h2>
    <img src="https://i.pravatar.cc/40" alt="profile" />
  </header>

  <main class="page">
    <div class="card">
      <h1>New Reminder</h1>
      <p class="subtitle">Set a location trigger for your task</p>

      <form>
        <label>Task Title</label>
        <input placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)} />

        <label>Trigger Distance</label>
        <div class="input-group">
          <input type="number" value="200" />
          <span>meters</span>
        </div>

        <div class="location-row">
          <label>Location</label>
          <a  onClick={getLocation}>Recapture Location</a>
        </div>

        
        <div class="actions">
          <button type="button" class="btn cancel">Cancel</button>
          <button className="btn primary" onClick={handleSubmit} >Save Task</button>
        </div>
      </form>
    </div>
  </main>
    </>
  );
}
