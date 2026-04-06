import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { User } from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { z } from 'zod';

const registerSchema =z.object ({
name: z.string().min(1, 'Name is required'),
email: z.email('Please provide a valid email address'),
password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerUser = asyncHandler(async (req: Request, res: Response) => {

const validation = registerSchema.safeParse(req.body);

if (!validation.success){
  res.status(400).json({message: validation.error.issues[0].message});
  return;
}
  const { name, email, password } = req.body;
  
  
  // if (!name || name.trim() === '') {
  //   res.status(400).json({ message: 'Name is required' });
  //   return;
  // }
  
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }
  const user = await User.create({ name, email, password });
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id.toString()),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id.toString()),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

export const githubLogin = asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.body; // The code sent from React

  // Exchange the code for an Access Token
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData = await tokenResponse.json();
  if (tokenData.error) {
    res.status(400).json({ message: 'GitHub authentication failed' });
    return;
  }

  // Fetch the user's GitHub profile
  const userResponse = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const githubUser = await userResponse.json();

  // GitHub emails are sometimes hidden, so we fetch their emails specifically
  const emailResponse = await fetch('https://api.github.com/user/emails', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const emails = await emailResponse.json();
  const primaryEmail = emails.find((e: any) => e.primary)?.email || emails[0]?.email;

  if (!primaryEmail) {
    res.status(400).json({ message: 'No email found on GitHub account' });
    return;
  }

  // Find or Create the user
  let user = await User.findOne({ email: primaryEmail });
  if (!user) {
    user = await User.create({
      name: githubUser.name || githubUser.login,
      email: primaryEmail,
      password: Math.random().toString(36).slice(-10) + 'A1!',
    });
  }

  // Issue your standard app JWT
  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id.toString()),
  });
});