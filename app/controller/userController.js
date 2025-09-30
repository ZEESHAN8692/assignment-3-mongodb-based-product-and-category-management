import User from "../model/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmailVerificationOTP from "../helper/sendMail.js";
import otpVerifyModel from "../model/userModel.js";
import fs from 'fs';
import path from 'path';


class UserController {
    async register(req, res) {
        try {
            const { fullName, email, password, role } = req.body;


            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "Email already registered" });
            }
            const profilePic = req.file ? req.file.filename : null;

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({
                fullName,
                email,
                password: hashedPassword,
                role,
                profilePic
            });

            // Send OTP email
            await sendEmailVerificationOTP(req, user);

            return res
                .status(201)
                .json({ message: "User registered successfully, OTP sent to email", userId: user._id });
        } catch (error) {
            console.error("Register Error:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    async verifyEmail(req, res) {
        try {
            const { userId, otp } = req.body;

            const record = await otpVerifyModel.findOne({ userId, otp });
            if (!record) {
                return res.status(400).json({ message: "Invalid OTP" });
            }

            // Verify user
            await User.findByIdAndUpdate(userId, { isVerified: true });

            // Delete OTP after use
            await otpVerifyModel.deleteMany({ userId });

            res.status(200).json({ message: "Email verified successfully" });
        } catch (error) {
            console.error("OTP Verify Error:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (!user.isVerified) {
                return res.status(403).json({ message: "Please verify your email first" });
            }


            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid credentials" });
            }


            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            res.status(200).json({
                message: "Login successful",
                token,
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role,
                    profilePic: user.profilePic,
                },
            });
        } catch (error) {
            console.error("Login Error:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    async profile(req, res) {
        try {
            const user = await User.findById(req.user.id).select("-password");
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(200).json(user);
        } catch (error) {
            console.error("Profile Error:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    async updateProfile(req, res) {
        try {
            const { fullName, email, password } = req.body;
            const user = await User.findByIdAndUpdate(
                req.user.id,
                {
                    fullName,
                    email,
                    ...(password && { password: await bcrypt.hash(password, 10) }),
                },
                { new: true }
            );
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            if (req.file) {
                const imagePath = path.join(process.cwd(), 'uploads', req.file.filename);
                const oldImagePath = path.join(process.cwd(), 'uploads', user.profilePic);
                if (oldImagePath !== imagePath) {
                    try {
                        fs.unlinkSync(oldImagePath);
                    } catch (error) {
                        console.error("Error deleting old image:", error);
                    }
                }
                user.profilePic = imagePath;
                await user.save();
            }
            res.status(200).json({ message: "Profile updated successfully" , user });
        } catch (error) {
            console.error("Update Profile Error:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
    


}

export default new UserController();