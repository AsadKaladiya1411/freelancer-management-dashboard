import React, { useCallback, useEffect, useState } from "react";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaUser, FaEnvelope, FaPhone, FaBuilding } from "react-icons/fa";
import api from "./api";

function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: ""
  });

  const userId = localStorage.getItem("userId");

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/clients");
      setClients(Array.isArray(res.data?.clients) ? res.data.clients : []);
    } catch (err) {
      console.log("Error fetching clients:", err);
      setError(err.message || "Failed to load clients. Please try again.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }
    fetchClients();
  }, [fetchClients, userId, navigate]);

  const handleAddClient = () => {
    setEditMode(false);
    setFormData({ name: "", email: "", phone: "", company: "" });
    setShowModal(true);
  };

  const handleEditClient = (client) => {
    setEditMode(true);
    setCurrentClient(client);
    setFormData({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      company: client.company || ""
    });
    setShowModal(true);
  };

  const handleDeleteClient = async (id) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await api.delete(`/clients/${id}`);
        fetchClients();
      } catch (err) {
        console.log("Error deleting client:", err);
        setError(err.message || "Failed to delete client. Please try again.");
        alert(err.message || "Failed to delete client");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert("Client name is required");
      return;
    }

    try {
      if (editMode) {
        await api.put(`/clients/${currentClient._id}`, formData);
      } else {
        await api.post("/clients", {
          ...formData,
          user_id: userId
        });
      }
      
      setShowModal(false);
      setError("");
      fetchClients();
    } catch (err) {
      console.log("Error saving client:", err);
      setError(err.message || "Failed to save client. Please try again.");
      alert(err.message || "Failed to save client");
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
              👥 Client Management
            </h1>
            <p style={{ color: "#718096", fontSize: "15px" }}>
              Manage your clients and contacts
            </p>
          </div>
          
          <button
            onClick={handleAddClient}
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
            <FaPlus /> Add New Client
          </button>
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
            placeholder="Search clients by name, company, or email..."
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

        {/* Clients Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <div style={{ fontSize: "18px", color: "#667eea", fontWeight: "600" }}>
              Loading clients...
            </div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div style={{
            background: "white",
            padding: "60px",
            borderRadius: "10px",
            textAlign: "center",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>📋</div>
            <div style={{ fontSize: "18px", color: "#4a5568", fontWeight: "600", marginBottom: "10px" }}>
              No clients found
            </div>
            <p style={{ color: "#718096", fontSize: "14px" }}>
              {searchTerm ? "Try adjusting your search" : "Get started by adding your first client"}
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
                    <th style={tableHeaderStyle}>Client Name</th>
                    <th style={tableHeaderStyle}>Company</th>
                    <th style={tableHeaderStyle}>Email</th>
                    <th style={tableHeaderStyle}>Phone</th>
                    <th style={tableHeaderStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client._id} style={{
                      borderBottom: "1px solid #e2e8f0",
                      transition: "background 0.2s ease"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f7fafc"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                    >
                      <td style={tableCellStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "700",
                            fontSize: "16px"
                          }}>
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: "600", color: "#2d3748" }}>
                            {client.name}
                          </span>
                        </div>
                      </td>
                      <td style={tableCellStyle}>{client.company || "—"}</td>
                      <td style={tableCellStyle}>{client.email || "—"}</td>
                      <td style={tableCellStyle}>{client.phone || "—"}</td>
                      <td style={tableCellStyle}>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            onClick={() => handleEditClient(client)}
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
                            onClick={() => handleDeleteClient(client._id)}
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
                {editMode ? "Edit Client" : "Add New Client"}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    <FaUser style={{ color: "#667eea" }} /> Client Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={inputStyle}
                    placeholder="Enter client name"
                    required
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    <FaBuilding style={{ color: "#667eea" }} /> Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    style={inputStyle}
                    placeholder="Enter company name"
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    <FaEnvelope style={{ color: "#667eea" }} /> Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={inputStyle}
                    placeholder="Enter email address"
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    <FaPhone style={{ color: "#667eea" }} /> Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={inputStyle}
                    placeholder="Enter phone number"
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
                    {editMode ? "Update Client" : "Add Client"}
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

export default Clients;
