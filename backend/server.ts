import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

// Load environment variables
config();

// Initialize Express app
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

// PostgreSQL connection pool
// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: parseInt(process.env.DB_PORT || '5432'),
// });

// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'not-so-secret-dev-secret';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        // Add other user properties as needed
      };
    }
  }
}

// JWT authentication middleware
const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    // // Fetch user from database
    // const result = await pool.query(
    //   'SELECT id, email FROM users WHERE id = $1',
    //   [decoded.userId]
    // );

    // if (result.rows.length === 0) {
    //   return res.status(404).json({ error: 'User not found' });
    // }

    console.log('decoded', decoded);
    req.user = {
      id: 1,
      email: 'jim@jim.computertest',
    }
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Example protected route
app.get('/api/protected', authenticateToken, (req: Request, res: Response) => {
  res.json({ message: 'Protected route accessed successfully', user: req.user });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
