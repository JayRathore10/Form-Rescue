import {Request,Response,NextFunction,CookieOptions} from 'express';
import { User } from '../models/user.model';
import bcrypt from 'bcrypt';
import jwt,{Secret,SignOptions} from 'jsonwebtoken';

const secret:Secret=process.env.JWT_SECRET!;
const options:SignOptions={
    expiresIn:process.env.JWT_EXPIRES_IN! as SignOptions['expiresIn']
}

export interface AuthUser {
    id: string;
    email: string;
}

// normal Request + auth middleware ke baad `user` yahan milega
export interface authRequest extends Request {
    user?: AuthUser;
}

// same options set aur clear dono me use honge
const cookieOptions:CookieOptions={
    httpOnly:true,
    secure:true,
    sameSite:'lax',
}

const generateToken=(userId:string,email:string)=>{
    return jwt.sign(
        {id:userId,email:email},
        secret,
        options,
    )
}

export const signup=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const {name,userName,email,password}=req.body;
        if(!name || !email || !password){
            res.status(400).json({
                success:false,
                message:"All Fields are Required",
            });
            return;
        }
        const normalizedEmail=email.toLowerCase();
        const existingUser=await User.findOne({email:normalizedEmail});
        if(existingUser){
            res.status(409).json({
                success:false,
                message:"user already exist",
            });
            return;
        }
        const hashPassword=await bcrypt.hash(password,10);
        const user=await User.create({
            name,
            email:normalizedEmail,
            password:hashPassword,
        });
        if(!user){
            res.status(400).json({
                success:false,
                message:"Error creating User",
            });
        }
        const token=generateToken(user._id.toString(),normalizedEmail);
        res.cookie("token",token,cookieOptions);
        res.status(201).json({
            success:true,
            message:"successfully register",
            token,
        })
    }catch(err){
        console.log(err);
        next(err);
    }
}

export const signin=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const {email,password}=req.body;
        if(!email || !password){
            res.status(400).json({
                success:false,
                message:"All Fields are Required",
            });
            return;
        }
        const normalizedEmail=email.toLowerCase();
        const user=await User.findOne({email:normalizedEmail});
        if(!user){
            res.status(400).json({
                success:false,
                message:"please do a signup first",
            });
            return;
        }
        if(!user.password){
            res.status(400).json({
                success:false,
                message:"This account has no password set. Please sign up again."
            });
            return;
        }
        const compare=await bcrypt.compare(password,user.password);
        if(!compare){
            res.status(400).json({
                success:false,
                message:"incorrect password",
            });
            return;
        }
        const token=generateToken(user._id.toString(),normalizedEmail);
        res.cookie("token",token,cookieOptions);
        res.status(200).json({
            success:true,
            message:"successfully verified",
            token,
        });
    }catch(err){
        next(err);
    }
}

export const logout=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        res.clearCookie("token",cookieOptions);
        res.status(200).json({
            success:true,
            message:"successfully logout",
        });
    }catch(err){
        next(err);
    }
}