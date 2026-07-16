import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import friendRoutes from "./routes/friendRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(authRoutes);

app.use("/uploads", express.static("uploads"));
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);

app.use("/api/users", userRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/messages", messageRoutes);


export default app;