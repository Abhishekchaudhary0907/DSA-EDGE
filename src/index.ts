import express, { type Request,type Response,type NextFunction } from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Express + TypeScript API 🚀",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", uptime: process.uptime() });
});

app.post("/echo", (req: Request, res: Response) => {
  res.json({
    received: req.body,
    method: req.method,
    path: req.path,
  });
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
// app.all("*", (req: Request, res: Response) => {
//   res
//     .status(404)
//     .json({ error: `Route ${req.method} ${req.originalUrl} not found` });
// });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// async function main() {
//   // Create a new user with a post
//   const user = await prisma.user.create({
//     data: {
//       name: "Alice",
//       email: "alice@pa.io",
//     },
//   });
//   console.log("Created user:", user);

//   // Fetch all users with their posts
//   const allUsers = await prisma.user.findMany({});
//   console.log("All users:", JSON.stringify(allUsers, null, 2));
// }

// main()
//   .then(async () => {
//     await prisma.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });
