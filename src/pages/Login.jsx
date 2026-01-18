import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"; 
import { auth } from "../services/firebase"; 
import { useNavigate } from "react-router-dom"; 
import "../assets/location-dot.svg"; 
export default function Login() 
{ const navigate = useNavigate(); 
  const handleLogin = async () => 
    { try { const provider = new GoogleAuthProvider(); 
      await signInWithPopup(auth, provider); 
      navigate("/dashboard"); 
    } catch (error) { console.error(error); 
      alert("Login failed"); 
    } }; 
    return ( 
    <> 
    <div className="container"> 
      <div className="logo"> 
        <div className="logo-icon"> 
          <img src="location-dot.svg" alt="" /> 
          </div> 
          <h1>GeoTask</h1> 
          </div> 
          <div className="card"> 
            <h2>Welcome back</h2> 
            <p className="subtitle">Sign in to continue to your dashboard</p> 
            <button className="btn" onClick={handleLogin}> Sign in with Google </button> 
            </div> 
            </div> 
            </> 
            ); }