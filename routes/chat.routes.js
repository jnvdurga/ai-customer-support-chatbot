const express = require("express");
const router = express.Router();

const {
  detectIntent,
  generateResponse
} = require("../services/llm.service");

router.post("/", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const intentResult = await detectIntent(message);
  const response = generateResponse(intentResult);

  res.json({
    intent: intentResult.intent,
    confidence: intentResult.confidence,
    response
  });
});


module.exports = router;
