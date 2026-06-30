import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to parse bank mutation
  app.post("/api/parse-mutation", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Missing or invalid 'text' property in body" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY is not configured. Please set it in Settings > Secrets." 
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const currentYear = new Date().getFullYear();

      const prompt = `You are an expert Indonesian banking assistant. Your task is to parse bank mutation logs (specifically from Bank Central Asia / BCA, e.g., KlikBCA, m-BCA SMS/notif, WA, or copy-pasted bank statement text) and extract individual transactions.
      
      Analyze the following text and extract all transaction lines. For each transaction, extract:
      - date: The date of transaction (convert to format "YYYY-MM-DD" using current year ${currentYear}, or "DD/MM" if year is missing).
      - description: Cleaned up description of the transaction (e.g., name of sender/recipient, type of transfer, or remark). Keep it human-readable and clean.
      - amount: The numeric value of the transaction (exclude thousand separators and decimals, e.g., 1.500.000,00 should be 1500000. Must be a positive number).
      - type: 'CR' for Credit (incoming money / Uang Masuk / Mutasi Masuk) or 'DB' for Debit (outgoing money / Uang Keluar / Mutasi Keluar).
      - rawText: The exact raw transaction text line from the input.

      Text to parse:
      """
      ${text}
      """`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING, description: "Format: YYYY-MM-DD or DD/MM" },
                description: { type: Type.STRING, description: "Clean description including names/remarks" },
                amount: { type: Type.NUMBER, description: "Positive numeric transaction amount" },
                type: { type: Type.STRING, description: "CR (for credit/uang masuk) or DB (for debit/uang keluar)" },
                rawText: { type: Type.STRING, description: "The original line parsed" }
              },
              required: ["date", "description", "amount", "type", "rawText"]
            }
          }
        }
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error("Empty response received from Gemini");
      }

      const transactions = JSON.parse(resultText.trim());
      return res.json({ success: true, transactions });
    } catch (error: any) {
      console.error("Error in /api/parse-mutation:", error);
      return res.status(500).json({ error: error?.message || "Internal Server Error" });
    }
  });

  // Moota sync endpoint
  app.post("/api/moota/sync", async (req, res) => {
    try {
      const { apiToken, bankId, isDemo } = req.body;
      
      if (isDemo || !apiToken) {
        // Return realistic simulated Moota mutations for testing
        const demoMutations = [
          {
            id: `moota-${Date.now()}-1`,
            date: new Date().toISOString().split('T')[0],
            description: "TRSF E-BANKING CR MOOTA-DEMO HADI PRANOTO",
            amount: 3500000,
            type: "CR",
            rawText: "TRSF E-BANKING CR MOOTA-DEMO HADI PRANOTO Rp 3.500.000"
          },
          {
            id: `moota-${Date.now()}-2`,
            date: new Date().toISOString().split('T')[0],
            description: "TRSF E-BANKING CR MOOTA-DEMO AMALIA PUTRI",
            amount: 5200000,
            type: "CR",
            rawText: "TRSF E-BANKING CR MOOTA-DEMO AMALIA PUTRI Rp 5.200.000"
          }
        ];
        return res.json({ success: true, transactions: demoMutations, isDemo: true });
      }

      // Real integration with Moota API
      // URL: https://api.moota.co/v2/mutation?bank=bankId
      const response = await fetch(`https://api.moota.co/v2/mutation?bank=${bankId || ""}`, {
        headers: {
          "Authorization": `Bearer ${apiToken}`,
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(400).json({ error: `Moota API returned status ${response.status}: ${errText}` });
      }

      const mootaData = await response.json() as any;
      
      const parsedTransactions = (mootaData.data || []).map((item: any) => {
        const transType = String(item.type).toUpperCase() === "DEBIT" || String(item.type).toUpperCase() === "DB" ? "DB" : "CR";
        return {
          id: `moota-${item.id || Date.now()}-${Math.floor(Math.random() * 1000)}`,
          date: item.date ? item.date.split(" ")[0] : new Date().toISOString().split('T')[0],
          description: item.description || `Moota transfer ${item.type}`,
          amount: Number(item.amount) || 0,
          type: transType,
          rawText: `[MOOTA] ${item.description || ""} Rp ${Number(item.amount).toLocaleString('id-ID')}`
        };
      });

      return res.json({ success: true, transactions: parsedTransactions, isDemo: false });
    } catch (error: any) {
      console.error("Error in /api/moota/sync:", error);
      return res.status(500).json({ error: error?.message || "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
