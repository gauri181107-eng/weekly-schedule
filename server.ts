import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { handleScheduleChat } from './server/geminiHandler';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Gemini Chat Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { history, currentSchedule, categories, modelName } = req.body;
    if (!Array.isArray(history)) {
      return res.status(400).json({ error: 'Missing history array' });
    }

    const result = await handleScheduleChat(
      history,
      currentSchedule,
      categories,
      modelName || 'gemini-3.5-flash'
    );

    res.json(result);
  } catch (error: any) {
    console.error('API Error in /api/chat:', error);
    res.status(500).json({
      error: error?.message || 'Internal server error in schedule assistant',
    });
  }
});

// Serve frontend static assets in production
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
