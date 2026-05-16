import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaProjectDiagram, FaCalendar, FaDollarSign, FaUser } from "react-icons/fa";

function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    client_id: "",
    budget: "",
    deadline: "",
    status: "Pending"
  });

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }
    fetchProjects();
    fetchClients();
  }, [userId, navigate]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/projects?user_id=${userId}`);
      setProjects(res.data.projects);
    } catch (err) {
      console.log("Error fetching projects:", err);
    }
    setLoading(false);
  };

  const fetchClients = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/clients?user_id=${userId}`);
      setClients(res.data.clients);
    } catch (err) {
      console.log("Error fetching clients:", err);
    }
  };

  const handleAddProject = () => {
    setEditMode(false);
    setFormData({
      title: "",
      client_id: "",
      budget: "",
      deadline: "",
      status: "Pending"
    });
    setShowModal(true);
  };

  const handleEditProject = (project) => {
    setEditMode(true);
    setCurrentProject(project);
    setFormData({
      title: project.title,
      client_id: project.client_id?._id || "",
      budget: project.budget || "",
      deadline: project.deadline ? project.deadline.split('T')[0] : "",
      status: project.status
    });
    setShowModal(true);
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await axios.delete(`http://localhost:5000/api/projects/${id}`);
        fetchProjects();
      } catch (err) {
        console.log("Error deleting project:", err);
        alert("Failed to delete project");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.client_id) {
      alert("Project title and client are required");
      return;
    }

    try {
      if (editMode) {
        await axios.put(`http://localhost:5000/api/projects/${currentProject._id}`, formData);
      } else {
        await axios.post("http://localhost:5000/api/projects", {
          ...formData,
          user_id: userId
        });
      }
      
      setShowModal(false);
      fetchProjects();
    } catch (err) {
      console.log("Error saving project:", err);
      alert("Failed to save project");
    }
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.client_id?.name && project.client_id.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    project.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "#48bb78";
      case "In Progress": return "#4299e1";
      case "On Hold": return "#ed8936";
      case "Pending": return "#9f7aea";
      default: return "#718096";
    }
  };

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
              📁 Project Management
            </h1>
            <p style={{ color: "#718096", fontSize: "15px" }}>
              Track and manage all your projects
            </p>
          </div>
          
          <button
            onClick={handleAddProject}
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
            <FaPlus /> Add New Project
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
            placeholder="Search projects by title, client, or status..."
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

        {/* Projects Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <div style={{ fontSize: "18px", color: "#667eea", fontWeight: "600" }}>
              Loading projects...
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div style={{
            background: "white",
            padding: "60px",
            borderRadius: "10px",
            textAlign: "center",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>📋</div>
            <div style={{ fontSize: "18px", color: "#4a5568", fontWeight: "600", marginBottom: "10px" }}>
              No projects found
            </div>
            <p style={{ color: "#718096", fontSize: "14px" }}>
              {searchTerm ? "Try adjusting your search" : "Get started by adding your first project"}
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
                    <th style={tableHeaderStyle}>Project Title</th>
                    <th style={tableHeaderStyle}>Client</th>
                    <th style={tableHeaderStyle}>Budget</th>
                    <th style={tableHeaderStyle}>Deadline</th>
                    <th style={tableHeaderStyle}>Status</th>
                    <th style={tableHeaderStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <tr key={project._id} style={{
                      borderBottom: "1px solid #e2e8f0",
                      transition: "background 0.2s ease"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f7fafc"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                    >
                      <td style={tableCellStyle}>
                        <div style={{ fontWeight: "600", color: "#2d3748" }}>
                          {project.title}
                        </div>
                      </td>
                      <td style={tableCellStyle}>
                        {project.client_id?.name || "—"}
                      </td>
                      <td style={tableCellStyle}>
                        {project.budget ? `₹ ${project.budget.toLocaleString()}` : "—"}
                      </td>
                      <td style={tableCellStyle}>
                        {project.deadline ? new Date(project.deadline).toLocaleDateString() : "—"}
                      </td>
                      <td style={tableCellStyle}>
                        <span style={{
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                          background: getStatusColor(project.status) + "20",
                          color: getStatusColor(project.status)
                        }}>
                          {project.status}
                        </span>
                      </td>
                      <td style={tableCellStyle}>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            onClick={() => handleEditProject(project)}
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
                            onClick={() => handleDeleteProject(project._id)}
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
                {editMode ? "Edit Project" : "Add New Project"}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    <FaProjectDiagram style={{ color: "#667eea" }} /> Project Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    style={inputStyle}
                    placeholder="Enter project title"
                    required
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    <FaUser style={{ color: "#667eea" }} /> Client *
                  </label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    style={inputStyle}
                    required
                  >
                    <option value="">Select a client</option>
                    {clients.map(client => (
                      <option key={client._id} value={client._id}>
                        {client.name} {client.company ? `(${client.company})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    <FaDollarSign style={{ color: "#667eea" }} /> Budget
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    style={inputStyle}
                    placeholder="Enter budget amount"
                    min="0"
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    <FaCalendar style={{ color: "#667eea" }} /> Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
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
                    {editMode ? "Update Project" : "Add Project"}
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
  maxHeight: "90vh",
  overflowY: "auto",
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

export default Projects;
