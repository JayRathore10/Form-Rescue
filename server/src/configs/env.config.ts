import dotenv from 'dotenv';
dotenv.config({path:`.env.${process.env.NODE_ENV || 'development'}.local`});

export const{
    MONGODB_URI,
    FRONTEND_URL,
    JWT_SECRET
}=process.env     