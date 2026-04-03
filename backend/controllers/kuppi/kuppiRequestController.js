const KuppiRequest = require("../../models/kuppi/KuppiRequest");

const createKuppiRequest = async (req, res) => {
  try {
    const { batchRepName, email, module, faculty, description } = req.body;

    if (!batchRepName || !email || !module || !faculty) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Verification letter is required" });
    }

    const newRequest = new KuppiRequest({
      batchRepName,
      email,
      module,
      faculty,
      description,
      letterUrl: req.file.path,
    });

    await newRequest.save();

    res.status(201).json({
      message: "Kuppi request submitted successfully",
      data: newRequest,
    });
  } catch (error) {
    console.error("Create Kuppi Request Error:", error);
    res.status(500).json({ message: "Server error while creating request" });
  }
};

const getAllKuppiRequests = async (req, res) => {
  try {
    const requests = await KuppiRequest.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    console.error("Get All Kuppi Requests Error:", error);
    res.status(500).json({ message: "Server error while fetching requests" });
  }
};

const approveKuppiRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledDate } = req.body;

    if (!scheduledDate) {
      return res.status(400).json({ message: "Scheduled date and time is required" });
    }

    const selectedDate = new Date(scheduledDate);
    const now = new Date();

    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({ message: "Invalid scheduled date" });
    }

    if (selectedDate <= now) {
      return res.status(400).json({ message: "Please select a future date and time" });
    }

    const updatedRequest = await KuppiRequest.findByIdAndUpdate(
      id,
      {
        status: "approved",
        scheduledDate,
        rejectionReason: "",
      },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: "Kuppi request not found" });
    }

    res.status(200).json({
      message: "Kuppi request approved successfully",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Approve Kuppi Request Error:", error);
    res.status(500).json({ message: "Server error while approving request" });
  }
};

const rejectKuppiRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const updatedRequest = await KuppiRequest.findByIdAndUpdate(
      id,
      {
        status: "rejected",
        rejectionReason: rejectionReason || "",
        scheduledDate: null,
      },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: "Kuppi request not found" });
    }

    res.status(200).json({
      message: "Kuppi request rejected successfully",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Reject Kuppi Request Error:", error);
    res.status(500).json({ message: "Server error while rejecting request" });
  }
};

module.exports = {
  createKuppiRequest,
  getAllKuppiRequests,
  approveKuppiRequest,
  rejectKuppiRequest,
};