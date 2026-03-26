import React, { useState } from "react";
import "./KuppiRequest.css";

const KuppiRequest = () => {
  const [formData, setFormData] = useState({
    batchRepName: "",
    module: "",
    faculty: "",
    description: "",
    letter: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "letter") {
      setFormData({ ...formData, letter: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    alert("Request submitted (frontend only)");
  };

  return (
    <div className="kuppi-container">
      <h1>Kuppi Session Request</h1>

      <form className="kuppi-form" onSubmit={handleSubmit}>
        
        <input
          type="text"
          name="batchRepName"
          placeholder="Batch Rep Name"
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="module"
          placeholder="Module Name"
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="faculty"
          placeholder="Faculty Name"
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Additional Details (optional)"
          onChange={handleChange}
        />

        <input
          type="file"
          name="letter"
          onChange={handleChange}
          required
        />

        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
};

export default KuppiRequest;