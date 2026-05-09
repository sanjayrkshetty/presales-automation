const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-20250514';

async function generateFollowUp({ engagement_type, stage, days_since_update, client_side_updates }) {
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: `Generate a short, professional follow-up message (2-3 sentences) for a pre-sales analyst to send to an account manager on Microsoft Teams to get a deal status update.
Engagement type: ${engagement_type}
Current stage: ${stage}
Days since last update: ${days_since_update}
Last known note: ${client_side_updates || 'None'}

Rules:
- Do NOT mention the client name
- Refer to "the client" or "the deal"
- End with a specific question
- Conversational tone, not formal
- Output only the message text`
    }]
  });
  return msg.content[0].text.trim();
}

async function generateExecutiveSummary({ engagement_type, tier, context }) {
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: `Write a professional 3-sentence executive summary for a ${engagement_type} proposal.
${tier ? `Tier: ${tier}` : ''}
Context: ${context || 'Not provided'}

Rules:
- Do not mention any client name
- Start with "We propose..." or "This proposal outlines..."
- Focus on value: protection, investigation, compliance, response
- Output only the executive summary text, no labels`
    }]
  });
  return msg.content[0].text.trim();
}

async function generateIncidentScope(incident_description) {
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: `Given this incident description for an Internal Forensic Investigation, write:
1. A bullet list of 5-6 investigation objectives (starting with "To determine...")
2. A scope section with 4-5 scope areas as sub-headings with 2-3 bullet points each

Incident: ${incident_description}

Format as JSON: { "objectives": ["...", "..."], "scope": [{ "title": "...", "items": ["..."] }] }
Output only valid JSON.`
    }]
  });
  const text = msg.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : text);
}

async function generateChallenges(incident_description) {
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `List 5-6 likely investigation challenges for this incident type.
Incident: ${incident_description}
Output as JSON array of strings: ["challenge 1", "challenge 2", ...]
Output only valid JSON.`
    }]
  });
  const text = msg.content[0].text.trim();
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : text);
}

async function generateBASScope(context) {
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 800,
    messages: [{
      role: 'user',
      content: `Generate a BAS scope section for this client. Context: ${context}
Return JSON: { "scope_areas": [{ "title": "...", "items": ["..."] }] }
Output only valid JSON.`
    }]
  });
  const text = msg.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : text);
}

module.exports = {
  generateFollowUp,
  generateExecutiveSummary,
  generateIncidentScope,
  generateChallenges,
  generateBASScope,
};
