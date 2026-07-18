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

    if (!file) {
      return NextResponse.json(
        { error: 'No resume file uploaded.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let extractedText = '';
    const fileType = file.name.split('.').pop()?.toLowerCase();

    if (fileType === 'pdf' || file.type === 'application/pdf') {
      try {
        const parser = new PDFParse({ data: new Uint8Array(buffer) });
        const textResult = await parser.getText();
        extractedText = textResult.text;
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
      } catch (docxErr) {
        console.error('Word document parsing failed:', docxErr);
        return NextResponse.json(
          { error: 'Failed to extract text from DOCX resume.' },
          { status: 422 }
        );
      }
    } else if (fileType === 'txt' || file.type === 'text/plain') {
      extractedText = buffer.toString('utf-8');
    } else {
      // Fallback: try reading as plain text
      extractedText = buffer.toString('utf-8');
      if (!extractedText.trim()) {
        return NextResponse.json(
          { error: 'Unsupported file type. Please upload a PDF, DOCX, or TXT file.' },
          { status: 400 }
        );
      }
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: 'The uploaded file appears to be empty.' },
        { status: 400 }
      );
    }

    let analysisResult = null;
    let engineUsed = 'heuristics';

    const apiKeyToUse = clientApiKey?.trim() || undefined;
    const modelToUse = ollamaModel?.trim() || undefined;
    const hostToUse = ollamaHost?.trim() || undefined;

    if (engine === 'ollama') {
      analysisResult = await analyzeResumeWithOllama(extractedText, modelToUse, hostToUse);
      if (analysisResult) {
        engineUsed = 'ollama';
      }
    } else if (engine === 'heuristics') {
      analysisResult = parseResume(extractedText);
      engineUsed = 'heuristics';
    } else {
      // Default to Gemini, fallback to Ollama
      analysisResult = await analyzeResumeWithAI(extractedText, apiKeyToUse);
      if (analysisResult) {
        engineUsed = 'gemini';
      } else {
        console.warn('Gemini AI failed or was unconfigured. Attempting local Ollama...');
        analysisResult = await analyzeResumeWithOllama(extractedText, modelToUse, hostToUse);
        if (analysisResult) {
          engineUsed = 'ollama';
        }
      }
    }

    // Baseline fallback if both AI options fail
    if (!analysisResult) {
      analysisResult = parseResume(extractedText);
      engineUsed = 'heuristics';
    }

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
