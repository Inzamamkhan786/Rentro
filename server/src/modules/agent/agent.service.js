/**
 * agent.service.js
 * ─────────────────────────────────────────────────────────────────────────────
 * The ONE AI Agent service for Rentora.
 *
 * HOW IT WORKS:
 *  1. Imports every tool file from ./tools/ — each file exports { tools, handlers }
 *  2. Merges all tool schemas → passes to OpenAI function-calling
 *  3. Merges all handlers → dispatches by tool name after each model turn
 *  4. Runs a tool-calling loop (max 5 rounds) until the model stops
 *
 * ADDING A NEW FEATURE:
 *  → Create tools/<feature>.tool.js exporting { tools, handlers }
 *  → Add it to the TOOL_MODULES array below — done, no other file changes needed.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const OpenAI = require('openai');

// ── Import all feature tool modules ──────────────────────────────────────────
const bookingTool  = require('./tools/booking.tool');
const providerTool = require('./tools/provider.tool');
const supportTool  = require('./tools/support.tool');
const documentTool = require('./tools/document.tool');

// To add a new feature: just push it here ↓
const TOOL_MODULES = [bookingTool, providerTool, supportTool, documentTool];

// ── Build unified tool list & handler map ────────────────────────────────────
// toolDefinitions → array of OpenAI function schemas
const toolDefinitions = TOOL_MODULES.flatMap((m) => m.tools);

// handlerMap → { toolName: handlerFn }
const handlerMap = Object.assign({}, ...TOOL_MODULES.map((m) => m.handlers));

// ── OpenAI client ─────────────────────────────────────────────────────────────
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── System prompt ─────────────────────────────────────────────────────────────
const buildSystemPrompt = (userRole) => `
You are Rentora AI Assistant — a smart, concise rental marketplace agent.
Current date/time (IST): ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}.

## 🚗 CONSUMER
- Find and book the cheapest vehicle by type, brand, location
- VEHICLE TYPES (exact values): "scooter" | "bike" | "car"
- For location: pass only the city name (e.g. "Nagpur"), not "near IIITN nagpur"
- ALWAYS call search_cheapest_vehicle first → confirm price with user → THEN call book_vehicle
- For hour-based bookings: compute ISO datetimes from today's date + requested hours
- Always show total cost in ₹ (INR) after booking

## 🏢 PROVIDER (Vehicle Owner)
- List incoming rent requests (default: pending)
- Accept or reject bookings directly from chat

## 🎫 SUPPORT (All users)
- Auto-generate a professional subject + description from the user's issue
- Show the draft ticket to the user for confirmation before submitting

## 📋 ADMIN
- List all documents pending verification with full uploader details

## RULES
1. Never expose raw tool names or JSON to the user.
2. Be concise — use bullet points for lists, ₹ for amounts.
3. Use ✅ ❌ 🚗 📋 sparingly for clarity.
4. Current user role: **${userRole || 'consumer'}**.
`.trim();

// ── Main agent function ───────────────────────────────────────────────────────
/**
 * Run the Rentora AI Agent with full tool-calling loop.
 * @param {number} userId
 * @param {string} userRole  'consumer' | 'provider' | 'admin'
 * @param {Array<{role: string, content: string}>} messageHistory
 * @returns {Promise<string>} Final assistant reply text
 */
const processAgentChat = async (userId, userRole, messageHistory) => {
  try {
    const messages = [
      { role: 'system', content: buildSystemPrompt(userRole) },
      ...messageHistory.map((m) => ({
        role:    m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    ];

    // Tool-calling loop — max 5 rounds to prevent runaway loops
    for (let round = 0; round < 5; round++) {
      const response = await openai.chat.completions.create({
        model:       'gpt-4o',
        messages,
        tools:       toolDefinitions,
        tool_choice: 'auto',
        temperature: 0.2,
      });

      const choice    = response.choices[0];
      const assistant = choice.message;
      messages.push(assistant);

      // No tool calls → final answer ready
      if (choice.finish_reason === 'stop' || !assistant.tool_calls?.length) {
        return assistant.content || 'Done.';
      }

      // Execute all tool calls (may be parallel from the model)
      const toolResults = await Promise.all(
        assistant.tool_calls.map(async (call) => {
          const name = call.function.name;
          let args;
          try { args = JSON.parse(call.function.arguments); } catch { args = {}; }

          console.log(`[agent] tool="${name}" args=`, args);

          const fn     = handlerMap[name];
          const result = fn
            ? await fn(args, userId)
            : JSON.stringify({ error: `Unknown tool: "${name}"` });

          console.log(`[agent] tool="${name}" result=`, result);

          return { role: 'tool', tool_call_id: call.id, content: result };
        })
      );

      messages.push(...toolResults);
    }

    return 'I was unable to complete the request in the allowed steps. Please try rephrasing.';
  } catch (err) {
    console.error('[agent] fatal error:', err?.message);
    if (err?.code === 'invalid_api_key')      return '⚠️ Invalid OpenAI API key. Check your .env file.';
    if (err?.code === 'insufficient_quota')   return '⚠️ OpenAI quota exceeded. Check your billing.';
    return `Something went wrong: ${err?.message || 'Unknown error'}. Please try again.`;
  }
};

module.exports = { processAgentChat };
