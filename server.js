// backend/index.js
import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import { franc } from "franc-min";
import cors from "cors";
import stringSimilarity from "string-similarity"; // npm install string-similarity

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Load FAQ dataset
const faqs = JSON.parse(fs.readFileSync("faqs.json", "utf8"));

// Helper function to detect language
function detectLanguage(text) {
  const langCode = franc(text);
  switch (langCode) {
    case "hin":
      return "hi";
    case "tam":
      return "ta";
    case "tel":
      return "te";
    case "ben":
      return "bn";
    case "eng":
      return "en";
    default:
      return "en"; // fallback
  }
}

// Find the closest question match
function findAnswer(query) {
  const lang = detectLanguage(query);

  // Create an array of questions in detected language
  const questions = faqs.map(faq => faq.question[lang]);

  // Use string similarity to find closest match
  const { bestMatchIndex } = stringSimilarity.findBestMatch(query, questions);

  return faqs[bestMatchIndex].answer[lang];
}

// API endpoint
app.post("/getAnswer", (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "Question is required" });

  const answer = findAnswer(question);
  res.json({ answer });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
