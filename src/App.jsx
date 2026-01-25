import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddTask from "./pages/AddTask";
import History from "./pages/History";
import TaskView from "./pages/TaskView";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-task" element={<AddTask />} />
        <Route path="/history" element={<History />} />
        <Route path="/taskView" element={<TaskView />} />
      </Routes>
    </BrowserRouter>
  );
}
