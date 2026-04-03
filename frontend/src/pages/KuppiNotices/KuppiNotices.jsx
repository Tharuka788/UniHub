import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./KuppiNotices.css";

const KuppiNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchApprovedKuppiSessions = async () => {
    try {
      const response = await axios.get("http://localhost:5050/api/kuppi");

      const approvedSessions = (response.data || [])
        .filter(
          (item) =>
            item.status?.toLowerCase() === "approved" && item.scheduledDate
        )
        .sort(
          (a, b) =>
            new Date(a.scheduledDate).getTime() -
            new Date(b.scheduledDate).getTime()
        );

      setNotices(approvedSessions);
    } catch (error) {
      console.error("Error fetching kuppi notices:", error);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedKuppiSessions();
  }, []);

  useEffect(() => {
    if (notices.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notices.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [notices]);

  useEffect(() => {
    if (currentIndex >= notices.length && notices.length > 0) {
      setCurrentIndex(0);
    }
  }, [currentIndex, notices]);

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? notices.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % notices.length);
  };

  const currentNotice = notices[currentIndex];

  return (
    <div className="kuppi-notices-section">
      <div className="kuppi-notices-header">
        <h2>Available Kuppi Sessions</h2>
        <p>Join upcoming Kuppi sessions approved by the admin.</p>
      </div>

      {loading ? (
        <p className="kuppi-notices-message">Loading notices...</p>
      ) : notices.length === 0 ? (
        <p className="kuppi-notices-message">
          No Kuppi notices available right now.
        </p>
      ) : (
        <div className="kuppi-slider-card">
          <div className="kuppi-slider-top">
            <span className="kuppi-slider-badge">
              {currentIndex + 1} / {notices.length}
            </span>

            {notices.length > 1 && (
              <div className="kuppi-slider-controls">
                <button
                  type="button"
                  className="kuppi-arrow-btn"
                  onClick={handlePrev}
                  aria-label="Previous notice"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  type="button"
                  className="kuppi-arrow-btn"
                  onClick={handleNext}
                  aria-label="Next notice"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>

          <div className="kuppi-slider-content">
            <h3>{currentNotice.module}</h3>

            <p>
              A Kuppi session has been scheduled for this module on{" "}
              <strong>
                {new Date(currentNotice.scheduledDate).toLocaleString()}
              </strong>
              .
            </p>

            <p>
              This Kuppi session will be conducted via{" "}
              <strong>Microsoft Teams</strong>. Students who wish to participate
              are required to register and complete the payment{" "}
              <strong>at least one day prior</strong> to the scheduled session
              to secure their spot.
            </p>

            <div className="kuppi-btn-wrapper">
              <button
                className="kuppi-register-btn"
                onClick={() =>
                  alert("Registration form will be connected later.")
                }
              >
                Register
              </button>
            </div>
          </div>

          {notices.length > 1 && (
            <div className="kuppi-slider-dots">
              {notices.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`kuppi-dot ${
                    currentIndex === index ? "active" : ""
                  }`}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to notice ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KuppiNotices;