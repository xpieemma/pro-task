import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import 'dotenv/config';

// Initialize SDKs using backend environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_STORY_KEY || '');
const genAIx = new GoogleGenerativeAI(process.env.GEMINI_STUDY_KEY || '');
const genAIModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

// Story Weaver (Gemini)
export const generateStory = asyncHandler(async (req: Request, res: Response) => {
  const { storySoFar } = req.body;

  if (!process.env.GEMINI_STORY_KEY) {
    throw new Error('GEMINI_STORY_KEY is missing from backend .env');
  }

 try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `You are a creative co-author. Continue this story with exactly ONE sentence. Do not include any conversational filler, introductory text, or quotes. Just write the next sentence:\n\n${storySoFar}\n\nNext sentence:`;
    
    const result = await model.generateContent(prompt);
    res.json({ text: result.response.text() });
  } catch (error: any) {
    console.error('❌ Gemini Story Error:', error.message); // <-- THIS WILL TELL US THE PROBLEM
    res.status(500);
    throw new Error('Failed to generate story.');
  }
});

// Poem Weaver (Groq)
export const generatePoem = asyncHandler(async (req: Request, res: Response) => {
  const { context } = req.body;

  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is missing from backend .env');
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a poet collaborating with a human. Continue this poem with exactly ONE line. Keep the same mood and style. Do not add quotes, introductory text, or conversational filler. Just write the next line.' },
        { role: 'user', content: context }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.8,
      max_tokens: 60,
    });

    res.json({ text: chatCompletion.choices[0]?.message?.content || '' });
  } catch (error: any) {
    console.error('❌ Groq Poem Error:', error.message);
    res.status(500);
    throw new Error('Failed to generate poem.');
  }
});

// Poem Hint (Groq)
export const generatePoemHint = asyncHandler(async (req: Request, res: Response) => {
  const { context } = req.body;
  const chatCompletion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: 'Give a short, inspiring hint (one sentence max) for the next line of this poem. Be creative.' },
      { role: 'user', content: context }
    ],
    temperature: 0.7,
    max_tokens: 40
  });
  res.json({ text: chatCompletion.choices[0]?.message?.content || 'Think about a surprising word.' });
});

// Study Studio & AI Project Tasks (Gemini JSON Mode)
export const generateJsonData = asyncHandler(async (req: Request, res: Response) => {
  const { prompt } = req.body;
  if (!process.env.GEMINI_STUDY_KEY) {
    res.status(500);
    throw new Error('GEMINI_STUDY_KEY is missing from backend .env file.');
  }

try {
  const model = genAIx.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: "application/json" }
  });
console.log("🧠 Sending prompt to Gemini...");

  
  const result = await model.generateContent(prompt);
  let rawText = result.response.text();
  rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
  const parsedData = JSON.parse(rawText);
  res.json({ data: parsedData });

  // res.json({ data: JSON.parse(result.response.text()) });
} catch (error: any) {
  console.error('❌ Gemini JSON Error:', error.message);
  res.status(500);
  throw new Error('Failed to generate or parse AI data. Check backend terminal for details.');
}
});

// Gallery (Pexels)
export const searchGallery = asyncHandler(async (req: Request, res: Response) => {
  const { query } = req.query;
  const url = query 
    ? `https://api.pexels.com/v1/search?query=${encodeURIComponent(query as string)}&per_page=12`
    : `https://api.pexels.com/v1/curated?per_page=12`;

  const response = await fetch(url, {
    headers: { Authorization: process.env.PEXELS_API_KEY || '' }
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Pexels API Error');
  
  res.json(data);
});