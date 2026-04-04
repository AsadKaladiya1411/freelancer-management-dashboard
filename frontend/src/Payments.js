import React, { useCallback, useEffect, useState } from "react";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaMoneyBillWave, FaCalendar, FaDollarSign, FaProjectDiagram } from "react-icons/fa";
import api from "./api";

function Payments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [formData, setFormData] = useState({
    project_id: "",
    amount: "",
    payment_date: ""
  });

  const userId = localStorage.getItem("userId");

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/payments");
      setPayments(res.data.payments);
    } catch (err) {
      console.log("Error fetching payments:", err);
      setError("Failed to load payments. Please try again.");
    }
    setLoading(false);
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.projects);
    } catch (err) {
      console.log("Error fetching projects:", err);
      setError("Failed to load project options.");
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }
    fetchPayments();
    fetchProjects();
  }, [fetchPayments, fetchProjects, userId, navigate]);

  const handleAddPayment = () => {
    setEditMode(false);
    setFormData({
      project_id: "",
      amount: "",
      payment_date: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleEditPayment = (payment) => {
    setEditMode(true);
    setCurrentPayment(payment);
    setFormData({
      project_id: payment.project_id?._id || "",
      amount: payment.amount || "",
      payment_date: payment.payment_date ? payment.payment_date.split('T')[0] : ""
    });
    setShowModal(true);
  };

  const handleDeletePayment = async (id) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      try {
        await api.delete(`/payments/${id}`);
        fetchPayments();
      } catch (err) {
        console.log("Error deleting payment:", err);
        setError("Failed to delete payment. Please try again.");
        alert("Failed to delete payment");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.project_id || !formData.amount || !formData.payment_date) {
      alert("All fields are required");
      return;
    }

    try {
      if (editMode) {
        await api.put(`/payments/${currentPayment._id}`, formData);
      } else {
        await api.post("/payments", {
          ...formData,
          user_id: userId
        });
      }
      
      setShowModal(false);
      setError("");
      fetchPayments();
    } catch (err) {
      console.log("Error saving payment:", err);
      setError("Failed to save payment. Please try again.");
      alert("Failed to save payment");
    }
  };

  const filteredPayments = payments.filter(payment =>
    (payment.project_id?.title && payment.project_id.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (payment.project_id?.client_id?.name && payment.project_id.client_id.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    payment.amount.toString().includes(searchTerm)
  );

  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <Layout>
      <div style={{ padding: "30px", background: "#f5f7fa", minHeight: "100vh" }}>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          flexWrap: "wrap",
          gap: "20px"
        }}>
          <div>
            <h1 style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#2d3748",
              marginBottom: "5px"
            }}>
              💰 Payment Management
            </h1>
            <p style={{ color: "#718096", fontSize: "15px" }}>
              Track and manage all your payments
            </p>
          </div>
          
          <button
            onClick={handleAddPayment}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 24px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "600",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
            onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
          >
            <FaPlus /> Add New Payment
          </button>
        </div>

        {/* Total Earnings Card */}
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "25px",
          borderRadius: "15px",
          marginBottom: "20px",
          boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
          color: "white"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{
              width: "60px",
              height: "60px",
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <FaMoneyBillWave size={28} />
            </div>
            <div>
              <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "5px" }}>
                Total Payments Received
              </div>
              <div style={{ fontSize: "32px", fontWeight: "700" }}>
                ₹ {totalAmount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{
          background: "white",
          padding: "15px 20px",
          borderRadius: "10px",
          marginBottom: "20px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <FaSearch style={{ color: "#667eea", fontSize: "18px" }} />
          <input
            type="text"
            placeholder="Search payments by project, client, or amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: "15px",
              padding: "5px"
            }}
          />
        </div>

        {error && (
          <div style={{
            background: "#fff5f5",
            color: "#c53030",
            border: "1px solid #feb2b2",
            padding: "12px 16px",
            borderRadius: "10px",
            marginBottom: "20px",
            fontSize: "14px",
            fontWeight: "600"
          }}>
            {error}
          </div>
        )}

        {/* Payments Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <div style={{ fontSize: "18px", color: "#667eea", fontWeight: "600" }}>
              Loading payments...
            </div>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div style={{
            background: "white",
            padding: "60px",
            borderRadius: "10px",
            textAlign: "center",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>📋</div>
            <div style={{ fontSize: "18px", color: "#4a5568", fontWeight: "600", marginBottom: "10px" }}>
              No payments found
            </div>
            <p style={{ color: "#718096", fontSize: "14px" }}>
              {searchTerm ? "Try adjusting your search" : "Get started by adding your first payment"}
            </p>
          </div>
        ) : (
          <div style={{
            background: "white",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
            overflow: "hidden"
          }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse"
              }}>
                <thead>
                  <tr style={{ background: "#f7fafc", borderBottom: "2px solid #e2e8f0" }}>
                    <th style={tableHeaderStyle}>Project</th>
                    <th style={tableHeaderStyle}>Client</th>
                    <th style={tableHeaderStyle}>Amount</th>
                    <th style={tableHeaderStyle}>Payment Date</th>
                    <th style={tableHeaderStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment._id} style={{
                      borderBottom: "1px solid #e2e8f0",
                      transition: "background 0.2s ease"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f7fafc"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                    >
                      <td style={tableCellStyle}>
                        <div style={{ fontWeight: "600", color: "#2d3748" }}>
                          {payment.project_id?.title || "N/A"}
                        </div>
                      </td>
                      <td style={tableCellStyle}>
                        {payment.project_id?.client_id?.name || "—"}
                      </td>
                      <td style={tableCellStyle}>
                        <span style={{
                          fontSize: "16px",
                          fontWeight: "700",
                          color: "#48bb78"
                        }}>
                          ₹ {payment.amount.toLocaleString()}
                        </span>
                      </td>
                      <td style={tableCellStyle}>
                        {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : "—"}
                      </td>
                      <td style={tableCellStyle}>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            onClick={() => handleEditPayment(payment)}
                            style={{
                              ...actionButtonStyle,
                              background: "#667eea",
                              color: "white"
                            }}
                            onMouseEnter={(e) => e.target.style.background = "#5568d3"}
                            onMouseLeave={(e) => e.target.style.background = "#667eea"}
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeletePayment(payment._id)}
                            style={{
                              ...actionButtonStyle,
                              background: "#f56565",
                              color: "white"
                            }}
                            onMouseEnter={(e) => e.target.style.background = "#e53e3e"}
                            onMouseLeave={(e) => e.target.style.background = "#f56565"}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
              <h2 style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#2d3748",
                marginBottom: "20px"
              }}>
                {editMode ? "Edit Payment" : "Add New Payment"}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    <FaProjectDiagram style={{ color: "#667eea" }} /> Project *
                  </label>
                  <select
                    value={formData.project_id}
                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                    style={inputStyle}
                    required
                  >
                    <option value="">Select a project</option>
                    {projects.map(project => (
                      <option key={project._id} value={project._id}>
                        {project.title} {project.client_id?.name ? `(${project.client_id.name})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    <FaDollarSign style={{ color: "#667eea" }} /> Amount *
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    style={inputStyle}
                    placeholder="Enter payment amount"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    <FaCalendar style={{ color: "#667eea" }} /> Payment Date *
                  </label>
                  <input
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>

                <div style={{
                  display: "flex",
                  gap: "15px",
                  marginTop: "30px"
                }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "15px",
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    }}
                  >
                    {editMode ? "Update Payment" : "Add Payment"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: "#e2e8f0",
                      color: "#2d3748",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "15px",
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

// Styles
const tableHeaderStyle = {
  padding: "16px 20px",
  textAlign: "left",
  fontSize: "13px",
  fontWeight: "700",
  color: "#4a5568",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const tableCellStyle = {
  padding: "16px 20px",
  fontSize: "14px",
  color: "#4a5568"
};

const actionButtonStyle = {
  padding: "8px 12px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  transition: "all 0.2s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000
};

const modalContentStyle = {
  background: "white",
  padding: "30px",
  borderRadius: "15px",
  width: "90%",
  maxWidth: "500px",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
};

const formGroupStyle = {
  marginBottom: "20px"
};

const labelStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "8px",
  fontSize: "14px",
  fontWeight: "600",
  color: "#2d3748"
};

const inputStyle = {
  width: "100%",
  padding: "12px 15px",
  border: "2px solid #e2e8f0",
  borderRadius: "8px",
  fontSize: "14px",
  outline: "none",
  transition: "border 0.2s ease",
  boxSizing: "border-box"
};

export default Payments;
