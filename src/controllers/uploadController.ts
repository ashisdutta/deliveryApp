import { type Request, type Response } from "express";
import ImageKit from "imagekit";

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

// @desc    Generate Auth parameters for frontend ImageKit uploads
// @route   GET /api/upload/imagekit-auth
export const getImageKitAuth = (req: Request, res: Response) => {
  try {
    const result = imagekit.getAuthenticationParameters();
    res.status(200).json(result);
  } catch (error) {
    console.error("ImageKit Auth Error:", error);
    res.status(500).json({ message: "Failed to generate image upload auth" });
  }
};
