import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { formatDate, type ApiResponse } from '@repo/shared';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  const response: ApiResponse<{ status: string; timestamp: string }> = {
    success: true,
    data: {
      status: 'healthy',
      timestamp: formatDate(new Date())
    }
  };
  res.json(response);
});

app.get('/api/hello', (_req: Request, res: Response) => {
  const response: ApiResponse<{ message: string }> = {
    success: true,
    data: {
      message: 'Hello from the API!'
    }
  };
  res.json(response);
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
