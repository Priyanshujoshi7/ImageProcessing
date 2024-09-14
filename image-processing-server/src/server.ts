import express, { Request, Response } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

// Initialize express app
const app = express();
const port = 5000;

// Enable CORS to allow communication between frontend (port 3000) and backend
app.use(cors({
  origin: 'http://localhost:3000'  // Ensure this matches your frontend URL
}));

// Middleware to handle JSON data (if needed in requests)
app.use(express.json());

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Multer setup for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type! Only PNG and JPEG allowed.'));
    }
  }
});

// Image upload route
app.post('/upload', upload.single('image'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const imagePath = path.join(tempDir, `${Date.now()}-${req.file.originalname}`);

  try {
    // Save the original image temporarily
    fs.writeFileSync(imagePath, req.file.buffer);

    // Send back a low-quality preview image
    const preview = await sharp(req.file.buffer)
      .resize(300) // Reduce size for quick preview
      .jpeg({ quality: 50 }) // Lower quality for speed
      .toBuffer();

    res.set('Content-Type', 'image/jpeg');
    res.send(preview);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error processing image.');
  }
});

// Image manipulation (brightness, contrast, rotation)
app.post('/process', upload.single('image'), async (req: Request, res: Response) => {
  const { brightness = 1, contrast = 1, rotate = 0 } = req.body;

  if (!req.file) {
    return res.status(400).send('No file uploaded for processing.');
  }

  try {
    // Process the image using sharp
    let image = sharp(req.file.buffer);

    // Brightness adjustment (use modulate for brightness)
    image = image.modulate({ brightness: parseFloat(brightness) });

    // Contrast adjustment using linear (a, b)
    const contrastValue = parseFloat(contrast);
    image = image.linear(contrastValue, -(0.5 * contrastValue) + 0.5); // Adjust contrast

    // Rotate the image
    image = image.rotate(parseFloat(rotate));

    // Generate a preview with lower quality
    const processedImage = await image.jpeg({ quality: 50 }).toBuffer();

    res.set('Content-Type', 'image/jpeg');
    res.send(processedImage);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error processing image.');
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
