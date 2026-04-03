import React, { useState } from "react";
import axios from "axios";
import "./KuppiRequest.css";

const KuppiRequest = () => {
  const [formData, setFormData] = useState({
    batchRepName: "",
    email: "",
    module: "",
    moduleCode: "",
    year: "",
    semester: "",
    faculty: "",
    description: "",
    letter: null,
  });

  const [errors, setErrors] = useState({
    batchRepName: "",
    email: "",
    module: "",
    moduleCode: "",
    year: "",
    semester: "",
    faculty: "",
    description: "",
    letter: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const allowedFileTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];

  const validateField = (name, value) => {
    switch (name) {
      case "batchRepName":
        if (!value || !value.trim()) return "Batch Rep Name is required";
        if (value.trim().length < 3) {
          return "Batch Rep Name must be at least 3 characters";
        }
        if (!/^[A-Za-z\s.'-]+$/.test(value.trim())) {
          return "Batch Rep Name can only contain letters and spaces";
        }
        return "";

      case "email":
        if (!value || !value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return "Please enter a valid email address";
        }
        return "";

      case "module":
        if (!value || !value.trim()) return "Module Name is required";
        if (value.trim().length < 2) {
          return "Module Name must be at least 2 characters";
        }
        return "";

      case "moduleCode":
        if (!value || !value.trim()) return "Module Code is required";
        if (!/^[A-Za-z0-9-]+$/.test(value.trim())) {
          return "Module Code can only contain letters, numbers, and hyphens";
        }
        return "";

      case "year":
        if (!value || !value.trim()) return "Year is required";
        if (!["1", "2", "3", "4"].includes(value.trim())) {
          return "Please select a valid year";
        }
        return "";

      case "semester":
        if (!value || !value.trim()) return "Semester is required";
        if (!["1", "2"].includes(value.trim())) {
          return "Please select a valid semester";
        }
        return "";

      case "faculty":
        if (!value || !value.trim()) return "Faculty Name is required";
        if (value.trim().length < 2) {
          return "Faculty Name must be at least 2 characters";
        }
        if (!/^[A-Za-z\s&.'-]+$/.test(value.trim())) {
          return "Faculty Name contains invalid characters";
        }
        return "";

      case "description":
        if (value && value.trim() && value.trim().length < 5) {
          return "Additional Details must be at least 5 characters if provided";
        }
        if (value && value.length > 500) {
          return "Additional Details cannot exceed 500 characters";
        }
        return "";

      case "letter":
        if (!value) return "Verification letter is required";
        if (!allowedFileTypes.includes(value.type)) {
          return "Only PDF, JPG, JPEG, and PNG files are allowed";
        }
        if (value.size > 5 * 1024 * 1024) {
          return "File size must be less than 5MB";
        }
        return "";

      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {
      batchRepName: validateField("batchRepName", formData.batchRepName),
      email: validateField("email", formData.email),
      module: validateField("module", formData.module),
      moduleCode: validateField("moduleCode", formData.moduleCode),
      year: validateField("year", formData.year),
      semester: validateField("semester", formData.semester),
      faculty: validateField("faculty", formData.faculty),
      description: validateField("description", formData.description),
      letter: validateField("letter", formData.letter),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "letter") {
      const selectedFile = files[0] || null;

      setFormData((prev) => ({
        ...prev,
        letter: selectedFile,
      }));

      setErrors((prev) => ({
        ...prev,
        letter: validateField("letter", selectedFile),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value, files } = e.target;

    if (name === "letter") {
      setErrors((prev) => ({
        ...prev,
        letter: validateField("letter", files?.[0] || formData.letter),
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append("batchRepName", formData.batchRepName.trim());
      submitData.append("email", formData.email.trim());
      submitData.append("module", formData.module.trim());
      submitData.append("moduleCode", formData.moduleCode.trim().toUpperCase());
      submitData.append("year", formData.year.trim());
      submitData.append("semester", formData.semester.trim());
      submitData.append("faculty", formData.faculty.trim());
      submitData.append("description", formData.description.trim());
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
        email: "",
        module: "",
        moduleCode: "",
        year: "",
        semester: "",
        faculty: "",
        description: "",
        letter: null,
      });

      setErrors({
        batchRepName: "",
        email: "",
        module: "",
        moduleCode: "",
        year: "",
        semester: "",
        faculty: "",
        description: "",
        letter: "",
      });

      e.target.reset();
    } catch (error) {
      console.error("Submit error:", error);
      setMessage(error.response?.data?.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kuppi-container">
      <h1>Kuppi Session Request</h1>

      <form className="kuppi-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <input
            type="text"
            name="batchRepName"
            placeholder="Batch Rep Name"
            value={formData.batchRepName}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.batchRepName ? "input-error" : ""}
          />
          {errors.batchRepName && (
            <p className="error-text">{errors.batchRepName}</p>
          )}
        </div>

        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.email ? "input-error" : ""}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="module"
            placeholder="Module Name"
            value={formData.module}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.module ? "input-error" : ""}
          />
          {errors.module && <p className="error-text">{errors.module}</p>}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="moduleCode"
            placeholder="Module Code"
            value={formData.moduleCode}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.moduleCode ? "input-error" : ""}
          />
          {errors.moduleCode && (
            <p className="error-text">{errors.moduleCode}</p>
          )}
        </div>

        <div className="form-group">
          <select
            name="year"
            value={formData.year}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.year ? "input-error" : ""}
          >
            <option value="">Select Year</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>
          {errors.year && <p className="error-text">{errors.year}</p>}
        </div>

        <div className="form-group">
          <select
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.semester ? "input-error" : ""}
          >
            <option value="">Select Semester</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>
          {errors.semester && <p className="error-text">{errors.semester}</p>}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="faculty"
            placeholder="Faculty Name"
            value={formData.faculty}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.faculty ? "input-error" : ""}
          />
          {errors.faculty && <p className="error-text">{errors.faculty}</p>}
        </div>

        <div className="form-group">
          <textarea
            name="description"
            placeholder="Additional Details (optional)"
            value={formData.description}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.description ? "input-error" : ""}
          />
          {errors.description && (
            <p className="error-text">{errors.description}</p>
          )}
        </div>

        <div className="form-group">
          <input
            type="file"
            name="letter"
            onChange={handleChange}
            onBlur={handleBlur}
            accept=".pdf,.jpg,.jpeg,.png"
            className={errors.letter ? "input-error" : ""}
          />
          {errors.letter && <p className="error-text">{errors.letter}</p>}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>

      {message && <p className="kuppi-message">{message}</p>}
    </div>
  );
};

export default KuppiRequest;