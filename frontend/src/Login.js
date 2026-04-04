import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaSpinner } from "react-icons/fa";
import api from "./api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });

      // SAVE USER ID
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user?._id || res.data.userId);
      localStorage.setItem("userName", res.data.user?.name || res.data.name || "Admin User");

      // Show success message
      setIsLoading(false);
      
      // REDIRECT
      navigate("/dashboard");

    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div style={container}>
      <div style={glassBox}>
        {/* Header */}
        <div style={{
          textAlign: "center",
          marginBottom: "30px"
        }}>
          <h1 style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#2d3748",
            marginBottom: "8px"
          }}>
            🚀 Welcome Back
          </h1>
          <p style={{
            color: "#718096",
            fontSize: "14px"
          }}>
            Sign in to your Freelancer Dashboard
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: "#fee2e2",
            color: "#7f1d1d",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "14px",
            border: "1px solid #fecaca"
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form style={form} onSubmit={handleLogin}>
          {/* Email Input */}
          <div style={{ marginBottom: "18px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              color: "#2d3748",
              fontSize: "14px",
              fontWeight: "600"
            }}>
              Email Address
            </label>
            <div style={{
              position: "relative",
              display: "flex",
              alignItems: "center"
            }}>
              <FaEnvelope style={{
                position: "absolute",
                left: "12px",
                color: "#667eea",
                fontSize: "16px"
              }} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  ...input,
                  paddingLeft: "40px"
                }}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: "22px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              color: "#2d3748",
              fontSize: "14px",
              fontWeight: "600"
            }}>
              Password
            </label>
            <div style={{
              position: "relative",
              display: "flex",
              alignItems: "center"
            }}>
              <FaLock style={{
                position: "absolute",
                left: "12px",
                color: "#667eea",
                fontSize: "16px"
              }} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  ...input,
                  paddingLeft: "40px"
                }}
                required
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            style={{
              ...button,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? "not-allowed" : "pointer"
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FaSpinner style={{ marginRight: "8px", animation: "spin 1s linear infinite" }} />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          textAlign: "center",
          margin: "20px 0",
          color: "#cbd5e1",
          fontSize: "14px"
        }}>
          Don't have an account?
        </div>

        {/* Register Link */}
        <div style={{
          textAlign: "center"
        }}>
          <p style={{ color: "#64748b", fontSize: "14px" }}>
            <Link
              to="/register"
              style={{
                color: "#667eea",
                fontWeight: "600",
                textDecoration: "none",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => e.target.style.color = "#764ba2"}
              onMouseLeave={(e) => e.target.style.color = "#667eea"}
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Background Elements */}
      <div style={{
        position: "absolute",
        top: "-50px",
        right: "-50px",
        width: "200px",
        height: "200px",
        background: "rgba(102, 126, 234, 0.1)",
        borderRadius: "50%",
        filter: "blur(40px)"
      }}></div>
      <div style={{
        position: "absolute",
        bottom: "-50px",
        left: "-50px",
        width: "200px",
        height: "200px",
        background: "rgba(240, 147, 251, 0.1)",
        borderRadius: "50%",
        filter: "blur(40px)"
      }}></div>
    </div>
  );
}

const container = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  position: "relative",
  overflow: "hidden"
};

const glassBox = {
  background: "rgba(255, 255, 255, 0.95)",
  padding: "40px",
  borderRadius: "20px",
  width: "100%",
  maxWidth: "400px",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  position: "relative",
  zIndex: 10
};

const form = {
  width: "100%"
};

const input = {
  width: "100%",
  padding: "12px 16px",
  border: "2px solid #e2e8f0",
  borderRadius: "10px",
  fontSize: "14px",
  transition: "all 0.3s ease",
  fontFamily: "inherit"
};

const button = {
  width: "100%",
  padding: "12px 16px",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontWeight: "600",
  fontSize: "16px",
  cursor: "pointer",
  transition: "all 0.3s ease",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

export default Login;
