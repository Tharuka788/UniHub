import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  BookOpen,
  Clock3,
  CheckCircle2,
  FileText,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";
import "./AdminKuppiRequests.css";

const AdminKuppiRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduleInputs, setScheduleInputs] = useState({});
  const [rejectInputs, setRejectInputs] = useState({});
  const [actionLoading, setActionLoading] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5050/api/kuppi");
      setRequests(response.data || []);
    } catch (error) {
      console.error("Error fetching kuppi requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    const scheduledDate = scheduleInputs[id];

    if (!scheduledDate) {
      alert("Please select date and time before approving.");
      return;
    }

    try {
      setActionLoading(id);
      await axios.put(`http://localhost:5050/api/kuppi/approve/${id}`, {
        scheduledDate,
      });
      alert("Kuppi request approved successfully");
      await fetchRequests();
    } catch (error) {
      console.error("Approve error:", error);
      alert(error.response?.data?.message || "Failed to approve request");
    } finally {
      setActionLoading("");
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoading(id);
      await axios.put(`http://localhost:5050/api/kuppi/reject/${id}`, {
        rejectionReason: rejectInputs[id] || "",
      });
      alert("Kuppi request rejected successfully");
      await fetchRequests();
    } catch (error) {
      console.error("Reject error:", error);
      alert(error.response?.data?.message || "Failed to reject request");
    } finally {
      setActionLoading("");
    }
  };

  const totalRequests = requests.length;
  const pendingRequests = requests.filter(
    (request) => request.status?.toLowerCase() === "pending"
  ).length;
  const approvedRequests = requests.filter(
    (request) => request.status?.toLowerCase() === "approved"
  ).length;
  const rejectedRequests = requests.filter(
    (request) => request.status?.toLowerCase() === "rejected"
  ).length;

  const sortedRequests = useMemo(() => {
    return [...requests].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
  }, [requests]);

  const filteredRequests = useMemo(() => {
    if (activeFilter === "pending") {
      return sortedRequests.filter(
        (request) => request.status?.toLowerCase() === "pending"
      );
    }

    if (activeFilter === "approved") {
      return sortedRequests.filter(
        (request) => request.status?.toLowerCase() === "approved"
      );
    }

    if (activeFilter === "rejected") {
      return sortedRequests.filter(
        (request) => request.status?.toLowerCase() === "rejected"
      );
    }

    return sortedRequests;
  }, [sortedRequests, activeFilter]);

  const tableTitle =
    activeFilter === "pending"
      ? "Pending Requests"
      : activeFilter === "approved"
      ? "Approved Requests"
      : activeFilter === "rejected"
      ? "Rejected Requests"
      : "All Requests";

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main-content">
        <div className="admin-kuppi-page">
          <div className="admin-kuppi-header">
            <div>
              <h1>Manage Kuppi Requests</h1>
              <p>View, approve, or reject submitted Kuppi session requests.</p>
            </div>
          </div>

          <div className="admin-kuppi-summary-grid four-cards">
            <div
              className={`admin-kuppi-summary-card glass-card clickable-card ${
                activeFilter === "all" ? "active-card" : ""
              }`}
              onClick={() => setActiveFilter("all")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setActiveFilter("all");
                }
              }}
            >
              <div className="summary-icon-box icon-all">
                <BookOpen size={20} />
              </div>
              <h3>Total Requests</h3>
              <p>{loading ? "..." : totalRequests}</p>
            </div>

            <div
              className={`admin-kuppi-summary-card glass-card clickable-card ${
                activeFilter === "pending" ? "active-card" : ""
              }`}
              onClick={() => setActiveFilter("pending")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setActiveFilter("pending");
                }
              }}
            >
              <div className="summary-icon-box icon-pending">
                <Clock3 size={20} />
              </div>
              <h3>Pending Requests</h3>
              <p>{loading ? "..." : pendingRequests}</p>
            </div>

            <div
              className={`admin-kuppi-summary-card glass-card clickable-card ${
                activeFilter === "approved" ? "active-card" : ""
              }`}
              onClick={() => setActiveFilter("approved")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setActiveFilter("approved");
                }
              }}
            >
              <div className="summary-icon-box icon-approved">
                <CheckCircle2 size={20} />
              </div>
              <h3>Approved Requests</h3>
              <p>{loading ? "..." : approvedRequests}</p>
            </div>

            <div
              className={`admin-kuppi-summary-card glass-card clickable-card ${
                activeFilter === "rejected" ? "active-card" : ""
              }`}
              onClick={() => setActiveFilter("rejected")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setActiveFilter("rejected");
                }
              }}
            >
              <div className="summary-icon-box icon-rejected">
                <AlertTriangle size={20} />
              </div>
              <h3>Rejected Requests</h3>
              <p>{loading ? "..." : rejectedRequests}</p>
            </div>
          </div>

          <div className="admin-kuppi-table-card">
            <div className="admin-kuppi-table-header">
              <h2>{tableTitle}</h2>
              <span>{loading ? "..." : `${filteredRequests.length} record(s)`}</span>
            </div>

            {loading ? (
              <p className="admin-kuppi-message">Loading requests...</p>
            ) : filteredRequests.length === 0 ? (
              <p className="admin-kuppi-message">No Kuppi requests found.</p>
            ) : (
              <div className="admin-kuppi-table-wrapper">
                <table className="admin-kuppi-table">
                  <thead>
                    <tr>
                      <th>Batch Rep</th>
                      <th>Email</th>
                      <th>Module</th>
                      <th>Faculty</th>
                      <th>Description</th>
                      <th>Letter</th>
                      <th>Status</th>
                      <th>Schedule</th>
                      <th>Reject Reason</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr key={request._id}>
                        <td>{request.batchRepName}</td>
                        <td>{request.email || "—"}</td>
                        <td>{request.module}</td>
                        <td>{request.faculty}</td>
                        <td>{request.description || "—"}</td>
                        <td>
                          <a
                            href={request.letterUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="view-letter-link"
                          >
                            <FileText size={15} />
                            View Letter
                          </a>
                        </td>
                        <td>
                          <span className={`status-badge ${request.status?.toLowerCase()}`}>
                            {request.status}
                          </span>
                        </td>
                        <td>
                          {request.status?.toLowerCase() === "pending" ? (
                            <input
                              type="datetime-local"
                              value={scheduleInputs[request._id] || ""}
                              min={getMinDateTime()}
                              onChange={(e) =>
                                setScheduleInputs({
                                  ...scheduleInputs,
                                  [request._id]: e.target.value,
                                })
                              }
                              className="admin-input"
                            />
                          ) : request.scheduledDate ? (
                            new Date(request.scheduledDate).toLocaleString()
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          {request.status?.toLowerCase() === "pending" ? (
                            <input
                              type="text"
                              placeholder="Optional reason"
                              value={rejectInputs[request._id] || ""}
                              onChange={(e) =>
                                setRejectInputs({
                                  ...rejectInputs,
                                  [request._id]: e.target.value,
                                })
                              }
                              className="admin-input"
                            />
                          ) : request.rejectionReason ? (
                            request.rejectionReason
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          {request.status?.toLowerCase() === "pending" ? (
                            <div className="action-buttons">
                              <button
                                className="approve-btn"
                                onClick={() => handleApprove(request._id)}
                                disabled={actionLoading === request._id}
                              >
                                Approve
                              </button>
                              <button
                                className="reject-btn"
                                onClick={() => handleReject(request._id)}
                                disabled={actionLoading === request._id}
                              >
                                <XCircle size={14} />
                                Reject
                              </button>
                            </div>
                          ) : (
                            "Done"
                          )}
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

export default AdminKuppiRequests;