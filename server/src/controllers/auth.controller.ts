import { Request, Response, CookieOptions } from 'express';
import { User } from '../models/user.model';
import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../configs/env.config';

export interface AuthUser {
    id: string;
    email: string;
    name?: string;
    role?: string;
}

export interface authRequest extends Request {
    user?: AuthUser;
}

const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
};

const generateToken = (userId: string, email: string) => {
    const secret: Secret = JWT_SECRET || "formrescue-super-secret-jwt-key-2026";
    const options: SignOptions = {
        expiresIn: (JWT_EXPIRES_IN || "7d") as SignOptions['expiresIn'],
    };
    return jwt.sign(
        { id: userId, email: email },
        secret,
        options
    );
};

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({
                success: false,
                message: "All fields (name, email, password) are required",
            });
            return;
        }

        if (name.trim().length < 3) {
            res.status(400).json({
                success: false,
                message: "Name must be at least 3 characters long",
            });
            return;
        }

        if (password.length < 3) {
            res.status(400).json({
                success: false,
                message: "Password must be at least 3 characters long",
            });
            return;
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            res.status(409).json({
                success: false,
                message: "An account with this email already exists",
            });
            return;
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashPassword,
        });

        if (!user) {
            res.status(400).json({
                success: false,
                message: "Error creating user account",
            });
            return;
        }

        const token = generateToken(user._id.toString(), normalizedEmail);
        res.cookie("token", token, cookieOptions);
        res.status(201).json({
            success: true,
            message: "Successfully registered",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({
            success: false,
            message: err instanceof Error ? err.message : "Error occurred during registration",
        });
    }
};

export const signin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Both email and password are required",
            });
            return;
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            res.status(400).json({
                success: false,
                message: "No account found with this email. Please sign up first.",
            });
            return;
        }

        if (!user.password) {
            res.status(400).json({
                success: false,
                message: "This account has no password set. Please sign up again.",
            });
            return;
        }

        const compare = await bcrypt.compare(password, user.password);
        if (!compare) {
            res.status(400).json({
                success: false,
                message: "Incorrect password. Please try again.",
            });
            return;
        }

        const token = generateToken(user._id.toString(), normalizedEmail);
        res.cookie("token", token, cookieOptions);
        res.status(200).json({
            success: true,
            message: "Successfully verified",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        console.error("Signin error:", err);
        res.status(500).json({
            success: false,
            message: err instanceof Error ? err.message : "Error occurred during sign in",
        });
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        res.clearCookie("token", cookieOptions);
        res.status(200).json({
            success: true,
            message: "Successfully logged out",
        });
    } catch (err) {
        console.error("Logout error:", err);
        res.status(500).json({
            success: false,
            message: err instanceof Error ? err.message : "Error occurred during logout",
        });
    }
};