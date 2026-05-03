
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./src/routes/user.route.js";
import messageRoutes from "./src/routes/message.route.js";
import { connectDatabase } from "./src/config/db.js";
import { app, server } from "./src/lib/socket.js";

const port = process.env.PORT || 4000;

// Middleware to parse JSON
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);



app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("Health Check")
})


// Connect to Database and start server
const startServer = async () => {
  try {
    await connectDatabase();
    server.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();