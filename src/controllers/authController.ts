import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";
import { sendOtpSchema, verifyOtpSchema } from "../types/types.js";
import jwt from "jsonwebtoken";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET!;

// ---  Send OTP ---
export const sendOtp = async (req: Request, res: Response) => {
  const validation = sendOtpSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ message: "Invalid phone number" });
  }

  const { phone } = validation.data;

  try {
    // TODO: Integrate your actual SMS provider here (Twilio, AWS SNS, Fast2SMS)
    // Example: await twilioClient.verify.v2.services(serviceSid).verifications.create({ to: phone, channel: 'sms' });

    // For development, we will mock the OTP sending
    console.log(`[MOCK SMS] OTP sent to ${phone}: 123456`);

    return res.status(200).json({
      message: "OTP sent successfully",
      phone: phone,
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

// ---  Verify OTP & Authenticate ---
export const verifyOtp = async (req: Request, res: Response) => {
  const validation = verifyOtpSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ message: "Invalid inputs" });
  }

  const { phone, otp } = validation.data;

  try {
    // TODO: Verify the OTP with your SMS provider
    // Example: const verification = await twilioClient.verify.v2.services(serviceSid).verificationChecks.create({ to: phone, code: otp });
    // if (verification.status !== 'approved') throw new Error("Invalid OTP");

    // For development, we mock a successful check if the OTP is 123456
    if (otp !== "123456") {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    // 1. Check if the user already exists
    let user = await prisma.user.findUnique({
      where: { phone: phone },
    });

    let isNewUser = false;

    // 2. If user doesn't exist, Auto-Register them
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone: phone,
          role: "CUSTOMER",
        },
      });
      isNewUser = true;
    }

    // 3. Generate the final JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "30d" } // Mobile sessions usually last longer
    );

    // 4. Send token and user data to React Native
    return res.status(200).json({
      message: isNewUser
        ? "Account created successfully"
        : "Logged in successfully",
      isNewUser: isNewUser, // Tells React Native what screen to show next
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
      token: token,
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// --- Logout ---
export const logout = (req: Request, res: Response) => {
  // In a pure JWT mobile setup, logout is handled client-side by deleting the token from SecureStore.
  // The backend just sends a success response.
  res.json({ message: "Logged out successfully" });
};
