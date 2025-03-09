const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("📅 Events API Running...");
});

module.exports = router;
