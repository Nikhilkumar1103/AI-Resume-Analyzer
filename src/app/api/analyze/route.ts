import { NextRequest, NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { pathToFileURL } from 'url';
import path from 'path';
import { parseResume } from '@/lib/parser';
import { analyzeResumeWithAI } from '@/lib/gemini';
import { analyzeResumeWithOllama } from '@/lib/ollama';

// Configure the PDFJS worker statically or during module initialization
try {
  const workerPath = path.resolve('node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs');
  const workerUrl = pathToFileURL(workerPath).toString();
  PDFParse.setWorker(workerUrl);
} catch (err) {
  console.error('Failed to configure PDFJS worker path:', err);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const clientApiKey = formData.get('apiKey') as string | null;
    const engine = formData.get('engine') as string | null;
    const ollamaModel = formData.get('ollamaModel') as string | null;
    const ollamaHost = formData.get('ollamaHost') as string | null;

    console.log(`\n==================================================`);
    console.log(`[API REQUEST] POST /api/analyze`);
    console.log(`- File Name: ${file?.name || 'none'}`);
    console.log(`- File Size: ${file?.size || 0} bytes`);
    console.log(`- Engine Preference: ${engine || 'default (Gemini -> Ollama)'}`);
    console.log(`==================================================`);

    if (!file) {
      console.warn(`[VALIDATION FAILED] No file uploaded.`);
      return NextResponse.json(
        { error: 'No resume file uploaded.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let extractedText = '';
    const fileType = file.name.split('.').pop()?.toLowerCase();

    console.log(`[PARSING] Attempting to extract text from ${fileType?.toUpperCase()} file...`);

    if (fileType === 'pdf' || file.type === 'application/pdf') {
      try {
        const parser = new PDFParse({ data: new Uint8Array(buffer) });
        const textResult = await parser.getText();
        extractedText = textResult.text;
        console.log(`[PARSING] Successfully extracted text using PDFJS parser.`);
      } catch (pdfErr) {
        console.error('PDF parsing failed:', pdfErr);
        return NextResponse.json(
          { error: 'Failed to extract text from PDF resume. The file may be corrupt or secured.' },
          { status: 422 }
        );
      }
    } else if (
      fileType === 'docx' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
        console.log(`[PARSING] Successfully extracted text using Mammoth docx parser.`);
      } catch (docxErr) {
        console.error('Word document parsing failed:', docxErr);
        return NextResponse.json(
          { error: 'Failed to extract text from DOCX resume.' },
          { status: 422 }
        );
      }
    } else if (fileType === 'txt' || file.type === 'text/plain') {
      extractedText = buffer.toString('utf-8');
      console.log(`[PARSING] Successfully read text from TXT file.`);
    } else {
      // Fallback: try reading as plain text
      extractedText = buffer.toString('utf-8');
      if (!extractedText.trim()) {
        console.warn(`[PARSING FAILED] Unsupported file type: ${fileType}`);
        return NextResponse.json(
          { error: 'Unsupported file type. Please upload a PDF, DOCX, or TXT file.' },
          { status: 400 }
        );
      }
      console.log(`[PARSING] Fallback: parsed file as raw text.`);
    }
    console.log("===== Extracted Text =====");
    console.log(extractedText);
    console.log("==========================");
    if (!extractedText.trim()) {
      console.warn(`[PARSING FAILED] File text content is empty.`);
      return NextResponse.json(
        { error: 'The uploaded file appears to be empty.' },
        { status: 400 }
      );
    }

    // Validate that the uploaded document looks like a resume
    const resumeKeywords = [
      "education",
      "experience",
      "skills",
      "projects",
      "internship",
      "certifications",
      "summary",
      "objective",
      "linkedin",
      "github"
    ];

    const lowerText = extractedText.toLowerCase();

    const matchedKeywords = resumeKeywords.filter(keyword =>
      lowerText.includes(keyword)
    );

    console.log(`[VALIDATION] Matched resume keywords: ${matchedKeywords.length}/${resumeKeywords.length} (${matchedKeywords.join(', ') || 'none'})`);

    if (matchedKeywords.length < 3) {
      console.warn(`[VALIDATION FAILED] Document does not match enough resume keywords. Rejecting.`);
      return NextResponse.json(
        {
          error: "❌ This document doesn't appear to be a resume. Please upload a valid resume."
        },
        { status: 400 }
      );
    }
    let analysisResult = null;
    let engineUsed = 'heuristics';

    const apiKeyToUse = clientApiKey?.trim() || undefined;
    const modelToUse = ollamaModel?.trim() || undefined;
    const hostToUse = ollamaHost?.trim() || undefined;

    if (engine === 'ollama') {
      console.log(`[ENGINE] Trying local Ollama (Host: ${hostToUse || 'http://localhost:11434'}, Model: ${modelToUse || 'llama3.2:3b'})...`);
      analysisResult = await analyzeResumeWithOllama(extractedText, modelToUse, hostToUse);
      if (analysisResult) {
        engineUsed = 'ollama';
        console.log(`[OLLAMA] SUCCESS: Succeeded in getting a response from Ollama.`);
      } else {
        console.error(`[OLLAMA] FAILED: Could not get a valid response from local Ollama.`);
      }
    } else if (engine === 'heuristics') {
      console.log(`[ENGINE] Forced local rule-based Heuristics parsing.`);
      analysisResult = parseResume(extractedText);
      engineUsed = 'heuristics';
      console.log(`[HEURISTICS] SUCCESS: Local regex and scoring computed.`);
    } else {
      // Default to Gemini, fallback to Ollama
      console.log(`[ENGINE] Trying Gemini AI (using API key: ${apiKeyToUse ? 'Provided (Client)' : 'Default (Server)'})...`);
      analysisResult = await analyzeResumeWithAI(extractedText, apiKeyToUse);
      if (analysisResult) {
        engineUsed = 'gemini';
        console.log(`[GEMINI] SUCCESS: Succeeded using Gemini API.`);
      } else {
        console.warn(`[GEMINI] FAILED/UNCONFIGURED. Trying local Ollama fallback...`);
        console.log(`[ENGINE] Trying local Ollama fallback (Host: ${hostToUse || 'http://localhost:11434'}, Model: ${modelToUse || 'llama3.2:3b'})...`);
        analysisResult = await analyzeResumeWithOllama(extractedText, modelToUse, hostToUse);
        if (analysisResult) {
          engineUsed = 'ollama';
          console.log(`[OLLAMA] SUCCESS: Local Ollama fallback succeeded.`);
        } else {
          console.error(`[OLLAMA] FAILED: Local Ollama fallback failed.`);
        }
      }
    }

    // Baseline fallback if both AI options fail
    if (!analysisResult) {
      console.warn(`[FALLBACK] All AI options failed or were bypassed. Falling back to local rule-based Heuristics parser.`);
      analysisResult = parseResume(extractedText);
      engineUsed = 'heuristics';
    }

    console.log(`[API RESPONSE] Successful response. Engine used: ${engineUsed.toUpperCase()}`);
    console.log(`==================================================\n`);

    return NextResponse.json({
      success: true,
      data: analysisResult,
      isAI: engineUsed !== 'heuristics',
      engineUsed,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error: any) {
    console.error('Error during analysis request processing:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred during resume analysis.' },
      { status: 500 }
    );
  }
}
