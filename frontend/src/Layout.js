import React, { useState } from "react";
import { FaHome, FaUsers, FaProjectDiagram, FaMoneyBillWave, FaSignOutAlt } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { clearAuthStorage } from "./api";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const userName = localStorage.getItem("userName") || "Admin User";

  const handleLogout = () => {
    clearAuthStorage();
    navigate("/");
  };

  const menuItems = [
    { name: "Dashboard", icon: FaHome, path: "/dashboard" },
    { name: "Clients", icon: FaUsers, path: "/clients" },
    { name: "Projects", icon: FaProjectDiagram, path: "/projects" },
    { name: "Payments", icon: FaMoneyBillWave, path: "/payments" }
  ];

  const getMenuItemStyle = (path, index) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "12px 0",
    padding: "12px 15px",
    cursor: "pointer",
    fontSize: "15px",
    borderRadius: "8px",
    transition: "all 0.3s ease",
    background: location.pathname === path 
      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
      : hoveredMenu === index 
        ? "rgba(102, 126, 234, 0.2)" 
        : "transparent",
    color: "white",
    fontWeight: location.pathname === path ? "600" : "500",
    transform: hoveredMenu === index ? "translateX(8px)" : "translateX(0)"
  });

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f5f7fa" }}>

      {/* Sidebar */}
      <div
        style={{
          width: "280px",
          background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
          color: "white",
          padding: "25px 0",
          boxShadow: "4px 0 15px rgba(0, 0, 0, 0.2)",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflowY: "auto"
        }}
      >
        {/* Logo Section */}
        <div style={{
          padding: "0 20px",
          marginBottom: "30px",
          borderBottom: "2px solid rgba(102, 126, 234, 0.3)",
          paddingBottom: "20px"
        }}>
          <h2 style={{
            fontSize: "22px",
            fontWeight: "700",
            margin: "0",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            🚀 Admin Panel
          </h2>
          <p style={{
            fontSize: "12px",
            color: "#94a3b8",
            margin: "8px 0 0 0"
          }}>
            Freelancer Management System
          </p>
        </div>

        {/* Menu Items */}
        <nav style={{ flex: 1, padding: "0 15px" }}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                style={getMenuItemStyle(item.path, index)}
                onMouseEnter={() => setHoveredMenu(index)}
                onMouseLeave={() => setHoveredMenu(null)}
                onClick={() => navigate(item.path)}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </div>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div style={{
          padding: "15px",
          borderTop: "1px solid rgba(102, 126, 234, 0.2)",
          marginTop: "20px"
        }}>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "12px 15px",
              background: "rgba(239, 68, 68, 0.2)",
              color: "#fca5a5",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              transition: "all 0.3s ease",
              hover: {
                background: "rgba(239, 68, 68, 0.3)"
              }
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(239, 68, 68, 0.3)";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(239, 68, 68, 0.2)";
              e.target.style.transform = "translateY(0)";
            }}
          >
            <FaSignOutAlt size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Section */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>

        {/* Header */}
        <div
          style={{
            background: "white",
            padding: "20px 30px",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "2px solid #e2e8f0"
          }}
        >
          <h2 style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#2d3748",
            margin: "0"
          }}>
            💼 Freelancer Management System
          </h2>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            color: "#64748b",
            fontSize: "14px"
          }}>
            <span>👤 {userName}</span>
          </div>
        </div>

        {/* Page Content */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          background: "#f5f7fa"
        }}>
          {children}
        </div>

      </div>
    </div>
  );
};

export default Layout;
