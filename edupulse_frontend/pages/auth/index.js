import { useContext, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import HeaderDiffer from "../../components/HeaderDiffer";
import { AuthContext } from "../../context/AuthContext";

const API_URL = "http://localhost:3001/api/Register";

export default function AuthPage() {
  const router = useRouter();
  const { login } = useContext(AuthContext);
  const [isSignUp, setIsSignUp] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [signIn, setSignIn] = useState({ email: "", password: "" });
  const [signUp, setSignUp] = useState({
    Name: "",
    studentID: "",
    PhoneNumber: "",
    Email: "",
    Password: "",
    confirmPassword: "",
  });

  const toggleAuth = () => {
    setForgot(false);
    setIsSignUp((p) => !p);
  };

  const postReminder = async (to, type) => {
    if (!to || typeof to !== 'string') {
      console.error('Email is undefined or invalid for reminder');
      return;
    }
    try {
      await axios.post("/api/auth/reminder", { to, type });
    } catch (error) {
      console.error("Reminder error:", error);
    }
  };

  const validateSignUp = () => {
    const { Name, studentID, PhoneNumber, Email, Password, confirmPassword } = signUp;
    if (!Name || !studentID || !PhoneNumber || !Email || !Password || !confirmPassword) {
      return "All fields are required";
    }
    if (!/^[A-Za-z ]+$/.test(Name)) return "Name must contain letters only";
    if (!/^07\d{8}$/.test(PhoneNumber)) return "Invalid Phone Number";
    if (!Email || !Email.endsWith("@gmail.com")) return "Invalid Email";
    const validPrefixes = ["IT", "EN", "BS", "TC", "AR", "LE"];
    const prefix = String(studentID || "").substring(0, 2).toUpperCase();
    const digits = String(studentID || "").substring(2);
    if (studentID.length !== 10 || !validPrefixes.includes(prefix) || !/^\d{8}$/.test(digits)) {
      return "Invalid Student ID";
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d@$!%*?&]).{6,}$/.test(Password)) {
      return "Password must be 6+ chars with uppercase, lowercase, number and special char";
    }
    if (Password !== confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (
        signIn.email.toLowerCase() === "admin@gmail.com" &&
        signIn.password === "Abc123"
      ) {
        const admin = { Name: "Admin", Email: "admin@gmail.com", role: "admin" };
        login(admin, "admin-token"); // Use a mock token for admin
        await postReminder(admin.Email, "signin");
        window.open("/admin", "_blank");
        alert("Admin Login Successful");
        return;
      }

      const res = await axios.post(`${API_URL}/login`, {
        Email: signIn.email,
        Password: signIn.password,
      });
      const token = res.data?.token || res.data?.data?.token;
      login(res.data?.data, token);
      await postReminder(signIn.email, "signin");
      alert("Login Successful");
      router.push("/");
    } catch (error) {
      alert(error.response?.data?.message || "Error during login");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const validation = validateSignUp();
    if (validation) {
      alert(validation);
      return;
    }

    setLoading(true);
    try {
      const payload = { ...signUp };
      delete payload.confirmPassword;
      await axios.post(API_URL, payload);
      await postReminder(signUp.Email, "signup");
      alert("Registration Successful");
      setIsSignUp(false);
    } catch (error) {
      alert(error?.response?.data?.message || "Error during registration");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes("@")) {
      alert("Enter a valid email");
      return;
    }
    setLoading(true);
    try {
      await postReminder(forgotEmail, "forgot");
      alert("Password reset reminder sent to your email.");
      setForgot(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <HeaderDiffer />
      <div className="auth-container">
        <div className={`auth-card ${isSignUp ? "sign-up-mode" : ""}`}>
          <div className="form-container sign-in-container">
            {!forgot ? (
              <form className="form" onSubmit={handleSignIn}>
                <h1>Sign In</h1>
                <input
                  type="email"
                  placeholder="Email"
                  value={signIn.email}
                  onChange={(e) => setSignIn({ ...signIn, email: e.target.value })}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={signIn.password}
                  onChange={(e) => setSignIn({ ...signIn, password: e.target.value })}
                  required
                />
                <button type="submit" disabled={loading}>
                  {loading ? "Please wait..." : "Sign In"}
                </button>
                <p>
                  Don&apos;t have an account? <span onClick={toggleAuth}>Sign Up</span>
                </p>
                <p>
                  Forgot password? <span onClick={() => setForgot(true)}>Reset Here</span>
                </p>
              </form>
            ) : (
              <form className="form" onSubmit={handleForgotPassword}>
                <h1>Forgot Password</h1>
                <input
                  type="email"
                  placeholder="Registered email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
                <button type="submit" disabled={loading}>
                  Send Reminder
                </button>
                <p>
                  Back to Sign In? <span onClick={() => setForgot(false)}>Click here</span>
                </p>
              </form>
            )}
          </div>

          <div className="form-container sign-up-container">
            <form className="form" onSubmit={handleSignUp}>
              <h1>Create Account</h1>
              <input type="text" placeholder="Full Name" onChange={(e) => setSignUp({ ...signUp, Name: e.target.value })} required />
              <input type="text" placeholder="Student ID (IT12345678)" onChange={(e) => setSignUp({ ...signUp, studentID: e.target.value })} required />
              <input type="text" placeholder="Phone Number (07xxxxxxxx)" onChange={(e) => setSignUp({ ...signUp, PhoneNumber: e.target.value })} required />
              <input type="email" placeholder="Email (@gmail.com)" onChange={(e) => setSignUp({ ...signUp, Email: e.target.value })} required />
              <input type="password" placeholder="Password" onChange={(e) => setSignUp({ ...signUp, Password: e.target.value })} required />
              <input type="password" placeholder="Confirm Password" onChange={(e) => setSignUp({ ...signUp, confirmPassword: e.target.value })} required />
              <button type="submit" disabled={loading}>
                {loading ? "Please wait..." : "Sign Up"}
              </button>
              <p>
                Already have an account? <span onClick={toggleAuth}>Sign In</span>
              </p>
            </form>
          </div>

          <div className="overlay-container">
            <div className="overlay">
              <div className="overlay-panel overlay-left">
                <img src="/logo.png" alt="Logo" className="big-logo-content" />
                <h1>Welcome Back!</h1>
                <p>To stay connected, login with your personal info.</p>
                <button className="ghost-btn" onClick={toggleAuth}>
                  Sign In
                </button>
              </div>
              <div className="overlay-panel overlay-right">
                <img src="/logo.png" alt="Logo" className="big-logo-content" />
                <h1>Hello, Friend!</h1>
                <p>Enter your details and start your learning journey.</p>
                <button className="ghost-btn" onClick={toggleAuth}>
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
