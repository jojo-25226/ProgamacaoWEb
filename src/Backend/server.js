import express from "express";
import cors from "cors";
import authRoutes from "./auth.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use(authRoutes);

const PORT = 5000;
export default PORT;
app.listen(PORT, () => {
    console.log(`Servidor a correr na porta ${PORT}`);
});