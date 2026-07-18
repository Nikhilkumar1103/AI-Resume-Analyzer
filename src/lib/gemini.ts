import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalysisResult } from './parser';

export async function analyzeResumeWithAI(text: string, customApiKey?: string): Promise<AnalysisResult | null> {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('No GEMINI_API_KEY provided. Falling back to local heuristic analyzer.');
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash for fast and cost-effective text analysis
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      }
    });

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

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse response
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
    
    throw new Error('Invalid JSON structure returned by Gemini');
  } catch (error) {
    console.error('Error during Gemini AI analysis:', error);
    return null;
  }
}
