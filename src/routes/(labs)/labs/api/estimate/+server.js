// app/api/estimate/+server.js
import { json } from '@sveltejs/kit';
import { OpenAI } from 'openai';

export async function POST({ request }) {
  const { projectData } = await request.json();
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a software agency cost estimator. Provide realistic ranges in NGN."
      },
      {
        role: "user",
        content: `Estimate cost for: ${JSON.stringify(projectData)}`
      }
    ],
    functions: [{
      name: "provide_estimate",
      description: "Provide a software project cost estimate",
      parameters: {
        type: "object",
        properties: {
          range_min: { type: "number" },
          range_max: { type: "number" },
          explanation: { type: "string" },
          complexity: { type: "string", enum: ["MVP", "Standard", "Advanced"] }
        }
      }
    }]
  });
  
  return json(completion.choices[0].message.function_call.arguments);
}