const KuppiRequest = require("../../models/kuppi/KuppiRequest");

const createKuppiRequest = async (req, res) => {
  try {
    const { batchRepName, module, faculty, description } = req.body;

    if (!batchRepName || !module || !faculty) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Verification letter is required" });
    }

    const newRequest = new KuppiRequest({
      batchRepName,
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

module.exports = {
  createKuppiRequest,
  getAllKuppiRequests,
};