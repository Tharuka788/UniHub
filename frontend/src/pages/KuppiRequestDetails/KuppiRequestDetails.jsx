import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";

const KuppiRequestDetails = () => {
  const navigate = useNavigate();
  const { type } = useParams();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5050/api/kuppi");
      setRequests(response.data || []);
    } catch (error) {
      console.error("Error fetching kuppi requests:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const sortedRequests = useMemo(() => {
    return [...requests].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
  }, [requests]);

  const filteredRequests = useMemo(() => {
    switch (type) {
      case "pending":
        return sortedRequests.filter(
          (request) => request.status?.toLowerCase() === "pending"
        );
      case "approved":
        return sortedRequests.filter(
          (request) => request.status?.toLowerCase() === "approved"
        );
      case "latest":
        return sortedRequests.length > 0 ? [sortedRequests[0]] : [];
      case "all":
      default:
        return sortedRequests;
    }
  }, [sortedRequests, type]);

  const pageTitle = useMemo(() => {
    switch (type) {
      case "pending":
        return "Pending Kuppi Requests";
      case "approved":
        return "Approved Kuppi Requests";
      case "latest":
        return "Latest Kuppi Request";
      case "all":
      default:
        return "All Kuppi Requests";
    }
  }, [type]);

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main-content">
        <div className="admin-dashboard-page">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1 style={{ fontSize: "2.1rem", fontWeight: "800", color: "#111827", marginBottom: "0.4rem" }}>
                {pageTitle}
              </h1>
              <p style={{ color: "#6b7280" }}>
                Showing relevant Kuppi request details in table format.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/admin-dashboard")}
              className="admin-action-btn"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
          </div>

          <div className="admin-main-card">
            {loading ? (
              <p style={{ color: "#6b7280", fontWeight: "600" }}>Loading requests...</p>
            ) : filteredRequests.length === 0 ? (
              <p style={{ color: "#6b7280", fontWeight: "600" }}>
                No requests found for this category.
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: "1100px",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th style={thStyle}>Batch Rep</th>
                      <th style={thStyle}>Email</th>
                      <th style={thStyle}>Module</th>
                      <th style={thStyle}>Faculty</th>
                      <th style={thStyle}>Description</th>
                      <th style={thStyle}>Letter</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Scheduled Date</th>
                      <th style={thStyle}>Requested Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr key={request._id}>
                        <td style={tdStyle}>{request.batchRepName || "—"}</td>
                        <td style={tdStyle}>{request.email || "—"}</td>
                        <td style={tdStyle}>{request.module || "—"}</td>
                        <td style={tdStyle}>{request.faculty || "—"}</td>
                        <td style={tdStyle}>{request.description || "—"}</td>
                        <td style={tdStyle}>
                          {request.letterUrl ? (
                            <a
                              href={request.letterUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                color: "#2563eb",
                                textDecoration: "none",
                                fontWeight: "600",
                              }}
                            >
                              <FileText size={15} />
                              View Letter
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td style={tdStyle}>
                          <span
                            style={{
                              padding: "0.35rem 0.75rem",
                              borderRadius: "999px",
                              fontSize: "0.85rem",
                              fontWeight: "700",
                              textTransform: "capitalize",
                              background:
                                request.status?.toLowerCase() === "approved"
                                  ? "#dcfce7"
                                  : request.status?.toLowerCase() === "pending"
                                  ? "#fef3c7"
                                  : "#fee2e2",
                              color:
                                request.status?.toLowerCase() === "approved"
                                  ? "#166534"
                                  : request.status?.toLowerCase() === "pending"
                                  ? "#92400e"
                                  : "#991b1b",
                            }}
                          >
                            {request.status || "—"}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          {request.scheduledDate
                            ? new Date(request.scheduledDate).toLocaleString()
                            : "—"}
                        </td>
                        <td style={tdStyle}>
                          {request.createdAt
                            ? new Date(request.createdAt).toLocaleString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const thStyle = {
  textAlign: "left",
  padding: "14px 16px",
  borderBottom: "1px solid #e5e7eb",
  color: "#374151",
  fontWeight: "700",
  fontSize: "0.95rem",
};

const tdStyle = {
  padding: "14px 16px",
  borderBottom: "1px solid #e5e7eb",
  color: "#111827",
  fontSize: "0.95rem",
  verticalAlign: "top",
};

export default KuppiRequestDetails;