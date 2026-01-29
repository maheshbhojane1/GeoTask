import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";
// import logo from "../assets/logo.sv";
import icon from "../assets/icon.png";

export default function Login() {
  const navigate = useNavigate();
  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Login failed");
    }
  };
  return (
    <>
      <div className="container">
        <div className="loginlogo">
          <div className="logo-icon">
            <img style={{width:"34px"}} src={icon} alt="Logo" />
          </div>
          <h1>GeoTask</h1>
        </div>
        <div className="login-card">
          <h2 className="login-head">Welcome back</h2>
          <p className="subtitle">Sign in to continue to your dashboard</p>
          <button className="login-btn" onClick={handleLogin}>
            {" "}
            Sign in with Google{" "}
          </button>
        </div>
      </div>
    </>
  );
}
