const getAllKuppiRequests = async (req, res) => {
  res.json({ message: "Get all kuppi requests working" });
};

const createKuppiRequest = async (req, res) => {
  res.json({ message: "Create kuppi request working" });
};

module.exports = {
  getAllKuppiRequests,
  createKuppiRequest,
};