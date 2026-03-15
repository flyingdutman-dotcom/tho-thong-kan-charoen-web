import { Router, Request, Response } from "express";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import multer from "multer";

const router = Router();

// Middleware to parse multipart form data
const uploadMiddleware = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

/**
 * POST /api/upload
 * Upload an image file and return the S3 URL
 */
router.post("/upload", uploadMiddleware.single("file"), async (req: any, res: Response) => {
  try {
    const file = req.file as Express.Multer.File | undefined;
    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    // Validate file type
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedMimes.includes(file.mimetype)) {
      return res.status(400).json({ error: "Invalid file type" });
    }

    // Generate unique filename
    const ext = file.originalname.split(".").pop() || "jpg";
    const filename = `portfolio-${nanoid()}.${ext}`;

    // Upload to S3
    const { url } = await storagePut(filename, file.buffer, file.mimetype);

    res.json({ url, filename: file.originalname });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
