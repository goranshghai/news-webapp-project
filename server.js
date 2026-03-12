import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));


// NEWS API ROUTE
app.get("/api/news", async (req, res) => {
    const query = req.query.q || "world";
    const apiKey = process.env.NEWS_API_KEY;

    const url = `https://newsapi.org/v2/everything?q=${query}&apiKey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch news" });
    }
});


// EMAIL ROUTE
app.post("/send-message", async (req, res) => {

    const { name, email, message } = req.body;
    try {

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: email,
            to: process.env.EMAIL_USER,
            subject: "New Contact Message - NewsXpress🖤",
            html: `
                 <h2>Feedback 📬</h2>
                 <p><b>💖 Name:</b> ${name}</p>
                 <p><b>📧 Email:</b> ${email}</p>
                 <p><b>💬 Message:</b> ${message}</p>
            `
        };

        await transporter.sendMail(mailOptions);

       res.sendFile(path.join(__dirname, "public", "success.html"));

    } catch (error) {
        console.error(error);
        res.status(500).send("Error sending message");
    }
});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});