import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import analysisRoutes from './routes/analysisRoutes';

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is not defined. Exiting.');
  process.exit(1);
}
if (!process.env.GEMINI_API_KEY) {
  console.error('FATAL ERROR: OPENAI_API_KEY environment variable is not defined. Exiting.');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('FATAL ERROR: DATABASE_URL environment variable is not defined. Exiting.');
  process.exit(1);
}

const app = express();
app.use(cors({
  origin: [
    'http://localhost:5173', // For your local frontend development
    'http://localhost:3000', // If you use CRA or another local dev server
    'https://seo-suggestion-frontend.onrender.com' // <--- YOUR DEPLOYED FRONTEND URL HERE
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
  credentials: true // Allow cookies to be sent (if you ever use them, good to include)
}));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/', analysisRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access auth routes at http://localhost:${PORT}/auth`);
  console.log(`Access analysis routes at http://localhost:${PORT}/analyze, etc.`);
});

// Error handling for unhandled errors
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack); 
  res.status(err.statusCode || 500).json({ message: err.message || 'Something went wrong!' }); 
});