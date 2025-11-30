import express, { type Request,type Response,type NextFunction } from "express";
import cors from "cors";
import dotenv from 'dotenv';
import appRoutes from './routes/index.js';
dotenv.config({});
const app = express();
const PORT = process.env.PORT;
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/',appRoutes);

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

