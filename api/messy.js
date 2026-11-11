/**
 * ============================================================================
 * Messy AI — TaskMesh Screen-Aware Gemini Assistant (Serverless API)
 * ============================================================================
 * Runs server-side on Vercel (/api/messy) and locally via Vite dev middleware
 * so GEMINI_API_KEY is never exposed in browser JavaScript.
 */

const GEMINI_MODELS = [
  "gemini-3-flash-preview",
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-3.1-flash-lite-preview"
];

function formatContextBlock(ctx = {}) {
  const lines = [];
  if (ctx.studentFirstName) {
    lines.push(`Student First Name: ${ctx.studentFirstName} (Respectful Hinglish addressing: ${ctx.studentHonorific || "ji"}, e.g. "${ctx.studentFirstName} ji")`);
  }
  if (ctx.tabLabel || ctx.activeTab) {
    lines.push(`Active Screen: ${ctx.tabLabel || ctx.activeTab}`);
  }
  if (ctx.codeMode) {
    lines.push(`Programming Language: ${String(ctx.codeMode).toUpperCase()}`);
  }
  if (ctx.tone) {
    lines.push(`User Preferred Explanation Tone: ${ctx.tone}`);
  }
  if (ctx.unitTitle) {
    lines.push(`Current DSA Unit: ${ctx.unitTitle}`);
  }
  if (ctx.unitSummary) {
    lines.push(`Unit Concept Summary: ${String(ctx.unitSummary).slice(0, 1200)}`);
  }
  if (ctx.referenceCode) {
    lines.push(`Reference Code Shown on Screen:\n\`\`\`\n${String(ctx.referenceCode).slice(0, 2200)}\n\`\`\``);
  }
  if (ctx.visualizerNodes) {
    lines.push(`Live Visualizer Nodes State: ${ctx.visualizerNodes}`);
  }
  if (ctx.visualizerLogs) {
    lines.push(`Recent Visualizer Log:\n${String(ctx.visualizerLogs).slice(0, 600)}`);
  }
  if (ctx.activeProblemTitle) {
    lines.push(`Current Practice Problem: ${ctx.activeProblemTitle}`);
  }
  if (ctx.activeProblemDesc) {
    lines.push(`Problem Statement: ${String(ctx.activeProblemDesc).slice(0, 1000)}`);
  }
  if (ctx.userCodeDraft) {
    lines.push(`Student's Current Editor Code:\n\`\`\`\n${String(ctx.userCodeDraft).slice(0, 2800)}\n\`\`\``);
  }
  if (ctx.consoleOutput) {
    lines.push(`Practice Test Console Output: ${String(ctx.consoleOutput).slice(0, 800)}`);
  }
  if (ctx.screenSnapshot) {
    lines.push(`Visible Screen Details: ${String(ctx.screenSnapshot).slice(0, 1200)}`);
  }
  return lines.join("\n\n");
}

export async function askMessy({ question, screenContext = {}, apiKey }) {
  const trimmedQ = String(question || "").trim();
  if (!trimmedQ) {
    return { status: 400, body: { error: "Please enter a question for Messy AI." } };
  }
  if (!apiKey) {
    return {
      status: 500,
      body: { error: "GEMINI_API_KEY is not configured on the server." }
    };
  }

  const contextBlock = formatContextBlock(screenContext);
  const systemInstruction = [
    "You are Messy AI, the dedicated DSA & coding mentor built into TaskMesh DSA (part of the TaskMesh ecosystem).",
    "You can see the user's current screen context below. Answer the user's doubt directly, accurately, and concisely without unnecessary fluff.",
    "Rules:",
    "- Always respond in crisp, proper formal English (never Hinglish) unless the student asks specifically for Hinglish.",
    "- When addressing the student, use ONLY their Student First Name followed by respectful 'ji' (e.g. 'Kartik ji', 'Avantika ji') instead of full name or bhai/behen.",
    "- Reference the exact unit, node list, problem, or student code from the screen context when answering.",
    "- If the student has a bug in their Editor Code, point out the exact line/pointer issue clearly and explain why.",
    "- Format code snippets cleanly using fenced markdown blocks with the active language (cpp or java).",
    "- Keep answers focused and easy to read inside a side panel (short paragraphs, bullet points, time/space complexity when relevant)."
  ].join("\n");

  const userPayloadText = contextBlock
    ? `CURRENT SCREEN CONTEXT:\n${contextBlock}\n\nSTUDENT QUESTION:\n${trimmedQ}`
    : `STUDENT QUESTION:\n${trimmedQ}`;

  let lastErrorMsg = "Unable to reach Gemini right now.";
  let lastStatus = 502;

  for (const model of GEMINI_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          contents: [
            {
              role: "user",
              parts: [{ text: userPayloadText }]
            }
          ],
          generationConfig: {
            temperature: 0.35,
            maxOutputTokens: 1200
          }
        })
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        const parts = data?.candidates?.[0]?.content?.parts || [];
        const answer = parts.map(p => p.text || "").join("").trim();
        if (answer) {
          return { status: 200, body: { answer, model } };
        }
        lastErrorMsg = "Messy AI returned an empty response. Please rephrase your question.";
        lastStatus = 502;
        break;
      }

      lastStatus = response.status;
      lastErrorMsg = data?.error?.message || `Gemini HTTP ${response.status}`;

      // Retry next fallback model only for transient load or unavailable model errors
      if (response.status !== 503 && response.status !== 404 && response.status !== 429) {
        break;
      }
    } catch (err) {
      lastStatus = 502;
      lastErrorMsg = err?.message || "Network error while contacting Gemini.";
    }
  }

  return {
    status: lastStatus >= 400 ? lastStatus : 502,
    body: { error: lastErrorMsg }
  };
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  body = body || {};

  const result = await askMessy({
    question: body.question,
    screenContext: body.screenContext || {},
    apiKey: process.env.GEMINI_API_KEY
  });

  return res.status(result.status).json(result.body);
}
