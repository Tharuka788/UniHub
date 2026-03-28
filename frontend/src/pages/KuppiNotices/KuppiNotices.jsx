import React, { useEffect, useState } from "react";
import axios from "axios";
import { CalendarDays, BookOpen, User, GraduationCap } from "lucide-react";
import "./KuppiNotices.css";

const KuppiNotices = () => {
  const [approvedSessions, setApprovedSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovedSessions = async () => {
    try {
      const response = await axios.get("http://localhost:5050/api/kuppi");
      const approvedOnly = (response.data || []).filter(
        (item) => item.status?.toLowerCase() === "approved"
      );
      setApprovedSessions(approvedOnly);
    } catch (error) {
      console.error("Error fetching approved kuppi sessions:", error);
      setApprovedSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedSessions();
  }, []);

  return (
    <div className="kuppi-notices-page">
      <div className="kuppi-notices-header">
        <h1>Published Kuppi Notices</h1>
        <p>Browse approved Kuppi sessions and register for upcoming classes.</p>
      </div>

      {loading ? (
        <p className="kuppi-notices-message">Loading notices...</p>
      ) : approvedSessions.length === 0 ? (
        <p className="kuppi-notices-message">No approved Kuppi sessions available right now.</p>
      ) : (
        <div className="kuppi-notices-grid">
          {approvedSessions.map((session) => (
            <div className="kuppi-notice-card" key={session._id}>
              <div className="notice-badge">Approved Session</div>

              <h2>{session.module}</h2>

              <div className="notice-info">
                <span>
                  <GraduationCap size={16} />
                  {session.faculty}
                </span>
                <span>
                  <User size={16} />
                  Batch Rep: {session.batchRepName}
                </span>
                <span>
                  <CalendarDays size={16} />
                  {session.scheduledDate
                    ? new Date(session.scheduledDate).toLocaleString()
                    : "Date not scheduled"}
                </span>
                <span>
                  <BookOpen size={16} />
                  {session.description || "No additional description"}
                </span>
              </div>

              <button
                className="register-btn"
                onClick={() => alert("Registration form will be linked later")}
              >
                Register
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KuppiNotices;