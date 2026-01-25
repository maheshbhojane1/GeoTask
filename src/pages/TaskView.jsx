import React from "react";

function TaskView() {
  return (
    <>
      <header className="navbar">
        <div className="logo">GeoTask</div>

        <div className="user-menu">
          <Link className="btn" to="/dashboard">
            Dashboard
          </Link>
          <Link className="btn" to="/history">
            History
          </Link>
        </div>
      </header>
    </>
  );
}

export default TaskView;
