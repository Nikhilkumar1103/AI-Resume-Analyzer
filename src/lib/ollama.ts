import { Ollama } from 'ollama';
import { AnalysisResult } from './parser';

export async function analyzeResumeWithOllama(
  text: string,
  modelName = 'llama3.2:3b',
  host = 'http://localhost:11434'
): Promise<AnalysisResult | null> {
  try {
    const customOllama = new Ollama({ host });

    const prompt = `You are a professional IT Recruiter and ATS (Applicant Tracking System) optimizer.
Analyze the following resume text and provide a structured JSON assessment.

The output must be a valid JSON object matching the following structure:
{
  "score": number, // Overall resume score from 0 to 100 based on modern ATS standards, formatting, impact, and skill alignment
  "strengths": string[], // List of 3 to 4 key strengths found in the resume
  "weaknesses": string[], // List of 3 to 4 critical weaknesses or structural missing items in the resume
  "missingSkills": string[], // List of 4 to 6 relevant technical or soft skills that would make this resume stronger for the suggested roles
  "suggestedRoles": string[], // List of 2 to 3 target job titles/roles (e.g. Frontend Engineer, Product Manager, DevOps Engineer) matching the profile
  "suggestions": string[] // List of 4 to 5 actionable suggestions to improve the resume (e.g., "Use the STAR method for bullet points", "Add numbers to quantify impact")
}

Resume Text:
"""
${text}
"""

Ensure the response contains ONLY the JSON object. Do not include markdown code block formatting (like \`\`\`json) inside the JSON response.`;

    const response = await customOllama.chat({
      model: modelName,
      messages: [{ role: 'user', content: prompt }],
      format: 'json',
    });

    const responseText = response.message.content;
    const jsonResult = JSON.parse(responseText.trim()) as AnalysisResult;

    // Validate fields
    if (
      typeof jsonResult.score === 'number' &&
      Array.isArray(jsonResult.strengths) &&
      Array.isArray(jsonResult.weaknesses) &&
      Array.isArray(jsonResult.missingSkills) &&
      Array.isArray(jsonResult.suggestedRoles) &&
      Array.isArray(jsonResult.suggestions)
    ) {
      return jsonResult;
    }

    throw new Error('Invalid JSON structure returned by Ollama');
  } catch (error) {
    console.error('Error during Ollama AI analysis:', error);
    return null;
  }
}
