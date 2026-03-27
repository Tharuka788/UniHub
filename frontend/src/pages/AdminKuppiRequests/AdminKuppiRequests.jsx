import React, { useEffect, useState } from "react";
import axios from "axios";
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

  return (
    <div className="admin-kuppi-container">
      <h1>Kuppi Requests</h1>

      {loading ? (
        <p>Loading requests...</p>
      ) : requests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <table className="kuppi-table">
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
                  >
                    View Letter
                  </a>
                </td>
                <td>{request.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminKuppiRequests;