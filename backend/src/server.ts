import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authMiddleware } from './middleware/auth';
import { Db } from './db';


const app = express();
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

app.get('/api/protected', authMiddleware, (req: Request, res: Response) => {
  res.json({ message: 'Protected route accessed successfully', user: req.user });
});

const PORT = process.env.PORT || 1337;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
