import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";
const allowedOrigins = (process.env.CORS_ORIGIN || "").split(",").map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Allow command-line health checks and same-origin local use; production should set CORS_ORIGIN.
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  }
}));
app.use(express.json({ limit: "20kb" }));
app.use("/api/", rateLimit({ windowMs: 60 * 1000, limit: 20, standardHeaders: "draft-7", legacyHeaders: false }));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "jarvis-watch-ai", aiConfigured: Boolean(API_KEY) }));

app.post("/api/chat", async (req, res) => {
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (!message) return res.status(400).json({ error: "Please send a message." });
  if (message.length > 2000) return res.status(413).json({ error: "Message is too long. Keep it under 2000 characters." });
  if (!API_KEY) return res.status(503).json({ error: "AI backend is not configured. Set OPENAI_API_KEY in your hosting provider's environment variables." });

  try {
    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        instructions: "You are JARVIS, a friendly, concise personal AI assistant inside a smartwatch companion prototype. Be useful and clear. Do not claim to access the user's watch, sensors, messages, location, or device unless a connected tool actually provides that data. This application has no such tools currently.",
        input: message,
        max_output_tokens: 500
      }),
      signal: AbortSignal.timeout(30000)
    });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error("AI provider error:", upstream.status, data?.error?.message || "Unknown provider error");
      return res.status(502).json({ error: "The AI provider could not complete the request. Check your API key, billing, and model access." });
    }
    const reply = (data.output || [])
      .flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("\n")
      .trim();
    if (!reply) return res.status(502).json({ error: "The AI provider returned an empty response. Please try again." });
    return res.json({ reply });
  } catch (error) {
    console.error("Chat request failed:", error.message);
    return res.status(504).json({ error: "AI request timed out or the provider could not be reached. Please try again." });
  }
});

app.get("/", (_req, res) => res.json({ service: "JARVIS Watch AI backend", health: "/api/health" }));
app.listen(PORT, () => console.log(`JARVIS backend listening on port ${PORT}`));
