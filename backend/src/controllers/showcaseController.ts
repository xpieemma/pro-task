import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

// Initialize SDKs using backend environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const genAIx = new GoogleGenerativeAI(process.env.GEMINI_API_KEYx || '');
const genAIModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

// Story Weaver (Gemini)
export const generateStory = asyncHandler(async (req: Request, res: Response) => {
  const { storySoFar } = req.body;
  const prompt = `You are a creative co-author. Continue this story with exactly ONE sentence. Do not include any conversational filler. Just write the next sentence:\n\n${storySoFar}\n\nNext sentence:`;
  
  const result = await genAIModel.generateContent(prompt);
  res.json({ text: result.response.text() });
});

// Poem Weaver (Groq)
export const generatePoem = asyncHandler(async (req: Request, res: Response) => {
  const { context } = req.body;
  const chatCompletion = await groq.chat.completions.create({
    model: 'llama3-8b-8192',
    messages: [
      { role: 'system', content: 'You are a poet collaborating with a human. Continue this poem with exactly ONE line. Keep the same mood and style. Do not add quotes, introductory text, or conversational filler. Just write the next line.' },
      { role: 'user', content: context }
    ],
    temperature: 0.8,
    max_tokens: 60
  });
  res.json({ text: chatCompletion.choices[0]?.message?.content || '' });
});

// Poem Hint (Groq)
export const generatePoemHint = asyncHandler(async (req: Request, res: Response) => {
  const { context } = req.body;
  const chatCompletion = await groq.chat.completions.create({
    model: 'llama3-8b-8192',
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
  const model = genAIx.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    generationConfig: { responseMimeType: "application/json" }
  });
  
  const result = await model.generateContent(prompt);
  res.json({ data: JSON.parse(result.response.text()) });
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