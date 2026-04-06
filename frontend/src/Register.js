import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaSpinner } from "react-icons/fa";
import api from "./api";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // handle input change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // register user
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await api.post("/auth/register", form);

      setIsLoading(false);

      // go back to login
      navigate("/");

    } catch (err) {
      setIsLoading(false);
      setError(err.message || "Registration failed. Please try again.");
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
            🎉 Create Account
          </h1>
          <p style={{
            color: "#718096",
            fontSize: "14px"
          }}>
            Join the Freelancer Management System
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
        <form style={formStyle} onSubmit={handleRegister}>
          {/* Name Input */}
          <div style={{ marginBottom: "18px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              color: "#2d3748",
              fontSize: "14px",
              fontWeight: "600"
            }}>
              Full Name
            </label>
            <div style={{
              position: "relative",
              display: "flex",
              alignItems: "center"
            }}>
              <FaUser style={{
                position: "absolute",
                left: "12px",
                color: "#667eea",
                fontSize: "16px"
              }} />
              <input
                name="name"
                placeholder="John Doe"
                onChange={handleChange}
                style={{
                  ...input,
                  paddingLeft: "40px"
                }}
                required
              />
            </div>
          </div>

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
                name="email"
                type="email"
                placeholder="you@example.com"
                onChange={handleChange}
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
                name="password"
                type="password"
                placeholder="••••••••"
                onChange={handleChange}
                style={{
                  ...input,
                  paddingLeft: "40px"
                }}
                required
              />
            </div>
          </div>

          {/* Register Button */}
          <button type="submit" style={{
            ...button,
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? "not-allowed" : "pointer"
          }} disabled={isLoading}>
            {isLoading ? (
              <>
                <FaSpinner style={{ marginRight: "8px", animation: "spin 1s linear infinite" }} />
                Creating Account...
              </>
            ) : (
              "Create Account"
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
          Already have an account?
        </div>

        {/* Login Link */}
        <div style={{
          textAlign: "center"
        }}>
          <p style={{ color: "#64748b", fontSize: "14px" }}>
            <Link
              to="/"
              style={{
                color: "#667eea",
                fontWeight: "600",
                textDecoration: "none",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => e.target.style.color = "#764ba2"}
              onMouseLeave={(e) => e.target.style.color = "#667eea"}
            >
              Sign in here
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

/* ===== Styles ===== */

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

const formStyle = {
  width: "100%"
};

const input = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: "10px",
  border: "2px solid #e2e8f0",
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

export default Register;
