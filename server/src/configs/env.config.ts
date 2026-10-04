import dotenv from 'dotenv';
dotenv.config({path:`.env.${process.env.NODE_ENV || 'development'}.local`});

export const {
  FRONTEND, 
  MONGODB_URI, 
  JWT_SECRET = "formrescue-super-secret-jwt-key-2026", 
  JWT_EXPIRES_IN = "7d",
  SALT_ROUND, 
  OLLAMA_URL, 
  GEMINI_API_KEY
} = process.env;    
