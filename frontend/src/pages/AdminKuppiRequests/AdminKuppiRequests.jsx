import React, { useEffect, useState } from "react";
import axios from "axios";
import { BookOpen, Clock3, CheckCircle2, FileText } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";
import "./AdminKuppiRequests.css";

const AdminKuppiRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const response = await axios.get("http://localhost:5050/api/kuppi");
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching kuppi requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

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
              <p>View all batch representative requests submitted for Kuppi sessions.</p>
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
                      <th>Module</th>
                      <th>Faculty</th>
                      <th>Description</th>
                      <th>Letter</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => (
                      <tr key={request._id}>
                        <td>{request.batchRepName}</td>
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
                          <span
                            className={`status-badge ${request.status?.toLowerCase()}`}
                          >
                            {request.status}
                          </span>
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