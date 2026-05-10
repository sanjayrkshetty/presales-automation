const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-20250514';

// Cached system block reused across all calls — saves tokens on repeated invocations
const SYSTEM_CACHE = {
  type: 'text',
  text: 'You are an expert cybersecurity pre-sales assistant for a DFIR company. You write precise, professional content for proposals and client communications. Never invent client names. Always output exactly what is asked for — no preamble, no labels, no extra explanation.',
  cache_control: { type: 'ephemeral' },
};

async function callClaude(userPrompt, maxTokens = 600) {
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: [SYSTEM_CACHE],
    messages: [{ role: 'user', content: userPrompt }],
  });
  return msg.content[0].text.trim();
}

async function generateFollowUp({ engagement_type, stage, days_since_update, client_side_updates }) {
  return callClaude(
    `Generate a short, professional follow-up message (2-3 sentences) for a pre-sales analyst to send to an account manager on Microsoft Teams to get a deal status update.
Engagement type: ${engagement_type}
Current stage: ${stage}
Days since last update: ${days_since_update}
Last known note: ${client_side_updates || 'None'}

Rules:
- Do NOT mention the client name
- Refer to "the client" or "the deal"
- End with a specific question
- Conversational tone, not formal
- Output only the message text`,
    300
  );
}

async function generateExecutiveSummary({ engagement_type, tier, context }) {
  return callClaude(
    `Write a professional 3-sentence executive summary for a ${engagement_type} proposal.
${tier ? `Tier: ${tier}` : ''}
Context: ${context || 'Not provided'}

Rules:
- Do not mention any client name
- Start with "We propose..." or "This proposal outlines..."
- Focus on value: protection, investigation, compliance, response
- Output only the executive summary text, no labels`,
    400
  );
}

async function generateIncidentScope(incident_description) {
  const text = await callClaude(
    `Given this incident description for an Internal Forensic Investigation, write:
1. A bullet list of 5-6 investigation objectives (starting with "To determine...")
2. A scope section with 4-5 scope areas as sub-headings with 2-3 bullet points each

Incident: ${incident_description}

Format as JSON: { "objectives": ["...", "..."], "scope": [{ "title": "...", "items": ["..."] }] }
Output only valid JSON.`,
    1000
  );
  const match = text.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : text);
}

async function generateChallenges(incident_description) {
  const text = await callClaude(
    `List 5-6 likely investigation challenges for this incident type.
Incident: ${incident_description}
Output as JSON array of strings: ["challenge 1", "challenge 2", ...]
Output only valid JSON.`,
    600
  );
  const match = text.match(/\[[\s\S]*\]/);
  return JSON.parse(match ? match[0] : text);
}

async function generateBASScope(context) {
  const text = await callClaude(
    `Generate a BAS scope section for this client. Context: ${context}
Return JSON: { "scope_areas": [{ "title": "...", "items": ["..."] }] }
Output only valid JSON.`,
    800
  );
  const match = text.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : text);
}

module.exports = {
  generateFollowUp,
  generateExecutiveSummary,
  generateIncidentScope,
  generateChallenges,
  generateBASScope,
};
