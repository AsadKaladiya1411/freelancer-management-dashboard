import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import { FaMoneyBillWave, FaUsers, FaProjectDiagram, FaChartBar } from "react-icons/fa";
import { Line, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import api from "./api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [projectStatusSummary, setProjectStatusSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }

    const fetchDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const [dashboardResponse, projectStatusResponse] = await Promise.all([
          api.get("/dashboard"),
          api.get("/analytics/project-status")
        ]);

        setData(dashboardResponse.data);
        setProjectStatusSummary(projectStatusResponse.data);
      } catch (err) {
        console.log("Dashboard Error:", err);
        setError("Failed to load dashboard data. Please refresh and try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [userId, navigate]);

  const cardStyle = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
    textAlign: "center",
    color: "white",
    cursor: "pointer",
    transform: "translateY(0)",
    transition: "all 0.3s ease",
    flex: 1,
    minHeight: "180px"
  };

  const cardHover = {
    ...cardStyle,
    transform: "translateY(-10px)",
    boxShadow: "0 15px 40px rgba(0, 0, 0, 0.25)"
  };

  const [hoveredCard, setHoveredCard] = useState(null);

  const getCardStyle = (index) => hoveredCard === index ? cardHover : cardStyle;

  const monthlyChartData = data?.monthlyEarnings ? {
    labels: data.monthlyEarnings.map(m => `${m._id.month}/${m._id.year}`),
    datasets: [
      {
        label: "Monthly Earnings",
        data: data.monthlyEarnings.map(m => m.total),
        borderColor: "#667eea",
        backgroundColor: "rgba(102, 126, 234, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: "#667eea",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      }
    ]
  } : null;

  const clientChartData = data?.clientWiseEarnings ? {
    labels: data.clientWiseEarnings.map(c => c.clientName),
    datasets: [
      {
        label: "Client Wise Earnings",
        data: data.clientWiseEarnings.map(c => c.total),
        backgroundColor: [
          "#667eea",
          "#764ba2",
          "#f093fb",
          "#4facfe",
          "#00f2fe",
          "#43e97b",
          "#fa709a",
          "#fee140"
        ],
        borderColor: "#fff",
        borderWidth: 2,
      }
    ]
  } : null;

  const projectStatusChartData = projectStatusSummary ? {
    labels: ["Pending", "In Progress", "On Hold", "Completed"],
    datasets: [
      {
        label: "Project Status",
        data: [
          projectStatusSummary.pending || 0,
          projectStatusSummary["in progress"] || 0,
          projectStatusSummary["on hold"] || 0,
          projectStatusSummary.completed || 0
        ],
        backgroundColor: ["#f6ad55", "#4299e1", "#ed8936", "#48bb78"],
        borderColor: "#fff",
        borderWidth: 2,
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          font: { size: 14, weight: "bold" },
          padding: 20,
          color: "#333"
        }
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 12 }
      }
    }
  };

  const earningsListStyle = {
    background: "white",
    borderRadius: "10px",
    padding: "20px",
    marginTop: "20px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)"
  };

  const itemStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px",
    borderBottom: "1px solid #eee",
    fontSize: "15px"
  };

  return (
    <Layout>
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div style={{
            fontSize: "18px",
            color: "#667eea",
            fontWeight: "bold"
          }}>
            ⏳ Loading dashboard...
          </div>
        </div>
      ) : error ? (
        <div style={{ padding: "30px" }}>
          <div style={{
            background: "#fff5f5",
            color: "#c53030",
            border: "1px solid #feb2b2",
            padding: "16px 18px",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "600"
          }}>
            {error}
          </div>
        </div>
      ) : (
        <div style={{ padding: "20px", background: "#f5f7fa", minHeight: "100vh" }}>
          {/* Header */}
          <div style={{ marginBottom: "30px" }}>
            <h1 style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#2d3748",
              marginBottom: "10px"
            }}>
              Freelancer Analytics Dashboard
            </h1>
            <p style={{
              color: "#718096",
              fontSize: "16px"
            }}>
              Welcome back! Here's your business overview.
            </p>
          </div>

          {/* Stats Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "25px",
              marginBottom: "40px"
            }}
          >
            <div
              style={getCardStyle(0)}
              onMouseEnter={() => setHoveredCard(0)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <FaMoneyBillWave size={40} style={{ marginBottom: "15px" }} />
              <h3 style={{ fontSize: "14px", fontWeight: "600", opacity: 0.9, marginBottom: "10px" }}>
                Total Earnings
              </h3>
              <h2 style={{ fontSize: "32px", fontWeight: "700", margin: 0 }}>
                ₹ {data.totalEarnings?.toLocaleString() || 0}
              </h2>
            </div>

            <div
              style={getCardStyle(1)}
              onMouseEnter={() => setHoveredCard(1)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <FaUsers size={40} style={{ marginBottom: "15px" }} />
              <h3 style={{ fontSize: "14px", fontWeight: "600", opacity: 0.9, marginBottom: "10px" }}>
                Total Clients
              </h3>
              <h2 style={{ fontSize: "32px", fontWeight: "700", margin: 0 }}>
                {data.totalClients || 0}
              </h2>
            </div>

            <div
              style={getCardStyle(2)}
              onMouseEnter={() => setHoveredCard(2)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <FaProjectDiagram size={40} style={{ marginBottom: "15px" }} />
              <h3 style={{ fontSize: "14px", fontWeight: "600", opacity: 0.9, marginBottom: "10px" }}>
                Total Projects
              </h3>
              <h2 style={{ fontSize: "32px", fontWeight: "700", margin: 0 }}>
                {data.totalProjects || 0}
              </h2>
            </div>
          </div>

          {/* Charts Section */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
              gap: "25px",
              marginBottom: "40px"
            }}
          >
            {monthlyChartData && (
              <div style={{
                background: "white",
                borderRadius: "15px",
                padding: "25px",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)"
              }}>
                <h3 style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#2d3748",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}>
                  <FaChartBar style={{ color: "#667eea" }} />
                  Monthly Earnings
                </h3>
                <Line data={monthlyChartData} options={chartOptions} />
              </div>
            )}

            {clientChartData && (
              <div style={{
                background: "white",
                borderRadius: "15px",
                padding: "25px",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)"
              }}>
                <h3 style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#2d3748",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}>
                  <FaChartBar style={{ color: "#667eea" }} />
                  Client Wise Earnings
                </h3>
                <Pie data={clientChartData} options={chartOptions} />
              </div>
            )}

            {projectStatusChartData && (
              <div style={{
                background: "white",
                borderRadius: "15px",
                padding: "25px",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)"
              }}>
                <h3 style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#2d3748",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}>
                  <FaChartBar style={{ color: "#667eea" }} />
                  Project Status Overview
                </h3>
                <Doughnut data={projectStatusChartData} options={chartOptions} />
              </div>
            )}
          </div>

          {/* Detailed Lists */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "25px"
            }}
          >
            {data.monthlyEarnings && data.monthlyEarnings.length > 0 && (
              <div style={earningsListStyle}>
                <h3 style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#2d3748",
                  marginBottom: "15px"
                }}>
                  📅 Monthly Earnings Breakdown
                </h3>
                {data.monthlyEarnings.map((m, i) => (
                  <div key={i} style={itemStyle}>
                    <span style={{ color: "#4a5568", fontWeight: "500" }}>
                      {m._id.month}/{m._id.year}
                    </span>
                    <span style={{
                      color: "#667eea",
                      fontWeight: "700",
                      fontSize: "16px"
                    }}>
                      ₹ {m.total.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {data.clientWiseEarnings && data.clientWiseEarnings.length > 0 && (
              <div style={earningsListStyle}>
                <h3 style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#2d3748",
                  marginBottom: "15px"
                }}>
                  👥 Client Wise Earnings
                </h3>
                {data.clientWiseEarnings.map((c, i) => (
                  <div key={i} style={itemStyle}>
                    <span style={{ color: "#4a5568", fontWeight: "500" }}>
                      {c.clientName}
                    </span>
                    <span style={{
                      color: "#667eea",
                      fontWeight: "700",
                      fontSize: "16px"
                    }}>
                      ₹ {c.total.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Dashboard;
