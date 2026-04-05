import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const generateStory = asyncHandler(async (req: Request, res: Response) => {
  const { storySoFar } = req.body;
  
  if (!process.env.GEMINI_API_KEY) throw new Error('Server missing API key');

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a creative co-author. Continue this story with exactly ONE sentence. Do not include any conversational filler. Just write the next sentence:\n\n${storySoFar}\n\nNext sentence:`;
  
  const result = await model.generateContent(prompt);
  res.json({ text: result.response.text() });
});