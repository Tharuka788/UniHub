import React, { useState } from "react";
import axios from "axios";
import "./KuppiRequest.css";

const KuppiRequest = () => {
  const [formData, setFormData] = useState({
    batchRepName: "",
    module: "",
    faculty: "",
    description: "",
    letter: null,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "letter") {
      setFormData({ ...formData, letter: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const submitData = new FormData();
      submitData.append("batchRepName", formData.batchRepName);
      submitData.append("module", formData.module);
      submitData.append("faculty", formData.faculty);
      submitData.append("description", formData.description);
      submitData.append("letter", formData.letter);

      const response = await axios.post(
        "http://localhost:5050/api/kuppi",
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(response.data.message || "Request submitted successfully");

      setFormData({
        batchRepName: "",
        module: "",
        faculty: "",
        description: "",
        letter: null,
      });

      e.target.reset();
    } catch (error) {
      console.error("Submit error:", error);
      setMessage(
        error.response?.data?.message || "Failed to submit request"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kuppi-container">
      <h1>Kuppi Session Request</h1>

      <form className="kuppi-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="batchRepName"
          placeholder="Batch Rep Name"
          value={formData.batchRepName}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="module"
          placeholder="Module Name"
          value={formData.module}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="faculty"
          placeholder="Faculty Name"
          value={formData.faculty}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Additional Details (optional)"
          value={formData.description}
          onChange={handleChange}
        />

        <input
          type="file"
          name="letter"
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>

      {message && <p className="kuppi-message">{message}</p>}
    </div>
  );
};

export default KuppiRequest;