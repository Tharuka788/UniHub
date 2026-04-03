import React, { useEffect, useState } from "react";
import axios from "axios";
import { BookOpen, Clock3, CheckCircle2, FileText, XCircle } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";
import "./AdminKuppiRequests.css";

const AdminKuppiRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduleInputs, setScheduleInputs] = useState({});
  const [rejectInputs, setRejectInputs] = useState({});
  const [actionLoading, setActionLoading] = useState("");

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const fetchRequests = async () => {
    try {
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
    (request) => request.status === "pending"
  ).length;
  const approvedRequests = requests.filter(
    (request) => request.status === "approved"
  ).length;

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

          <div className="admin-kuppi-summary-grid">
            <div className="admin-kuppi-summary-card blue">
              <div className="summary-icon-box">
                <BookOpen size={20} />
              </div>
              <h3>Total Requests</h3>
              <p>{loading ? "..." : totalRequests}</p>
            </div>

            <div className="admin-kuppi-summary-card yellow">
              <div className="summary-icon-box">
                <Clock3 size={20} />
              </div>
              <h3>Pending Requests</h3>
              <p>{loading ? "..." : pendingRequests}</p>
            </div>

            <div className="admin-kuppi-summary-card green">
              <div className="summary-icon-box">
                <CheckCircle2 size={20} />
              </div>
              <h3>Approved Requests</h3>
              <p>{loading ? "..." : approvedRequests}</p>
            </div>
          </div>

          <div className="admin-kuppi-table-card">
            {loading ? (
              <p className="admin-kuppi-message">Loading requests...</p>
            ) : requests.length === 0 ? (
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
                    {requests.map((request) => (
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
                          {request.status === "pending" ? (
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
                          {request.status === "pending" ? (
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
                          {request.status === "pending" ? (
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