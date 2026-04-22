import express from "express";                         // Express framework
import path from "path";                               // Handle file paths
import cors from "cors";                               // Enable CORS
import dotenv from "dotenv";                           // Load env variables
import nodemailer from "nodemailer";                   // Send emails
import mongoose from "mongoose";                       // MongoDB ODM
import { fileURLToPath } from "url";                   // Fix __dirname in ES modules

import News from "./models/News.js";                   // Import News model
import UserMessage from "./models/UserMessage.js";     // import Usermessage model

dotenv.config();                                       // Load .env variables

const __filename = fileURLToPath(import.meta.url);     // Get current file path
const __dirname = path.dirname(__filename);            // Get directory path

const app = express();
const PORT = process.env.PORT || 3000;

// ================= MIDDLEWARE =================
app.use(cors());                                       // Allow cross-origin requests
app.use(express.json());                               // Parse JSON body
app.use(express.urlencoded({ extended: true }));       // Parse form data
app.use(express.static(path.join(__dirname, "public"))); // Serve static files

// ================= DB CONNECT =================
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => {
        console.error("MongoDB connection error:", err);
        process.exit(1);                               // Stop server if DB fails
    });


// ================= NEWS ROUTE =================
app.get("/api/news", async (req, res) => {
    const query = req.query.q || "world";
    const apiKey = process.env.NEWS_API_KEY;

    try {
        // 1. Check latest stored news (for freshness)
        const latestNews = await News.findOne({ category: query })
            .sort({ createdAt: -1 });

        const isFresh =
            latestNews &&
            (Date.now() - new Date(latestNews.createdAt)) < 30 * 60 * 1000;

        if (isFresh) {
            console.log("Serving FULL history from DB");

            // Return ALL stored news (full history)
            const allNews = await News.find({ category: query })
                .sort({ publishedAt: -1 });

            return res.json({ articles: allNews });
        }

        // 2. Fetch from external API
        const url = `https://newsapi.org/v2/everything?q=${query}&apiKey=${apiKey}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("API request failed");
        }

        const data = await response.json();

        // 3. Map API response
        const articles = data.articles.map(article => ({
            title: article.title,
            description: article.description,
            url: article.url,
            urlToImage: article.urlToImage,
            publishedAt: article.publishedAt,
            source: { name: article.source?.name || "Unknown" },
            category: query,
            createdAt: new Date()
        }));

        // 4. Avoid duplicates
        const existingUrls = await News.find({
            url: { $in: articles.map(a => a.url) }
        }).select("url").lean();

        const existingSet = new Set(existingUrls.map(a => a.url));
        const newArticles = articles.filter(a => !existingSet.has(a.url));

        // 5. Insert only new ones
        if (newArticles.length > 0) {
            await News.insertMany(newArticles, { ordered: false });
            console.log(`Inserted ${newArticles.length} new articles`);
        } else {
            console.log("No new articles to insert");
        }

        // 6. Return FULL history (not just new ones)
        const allNews = await News.find({ category: query })
            .sort({ publishedAt: -1 });

        res.json({ articles: allNews });

    } catch (error) {
        console.error("News API error:", error.message);
        res.status(500).json({ error: "Failed to fetch news" });
    }
});


// ================= EMAIL ROUTE =================
app.post("/send-message", async (req, res) => {
    const { name, email, message } = req.body;

    try {
        // 1. Save to DB
        const newMessage = new UserMessage({
            name,
            email,
            message
        });

        await newMessage.save();

        console.log("User message saved to DB");

        // 2. Send Email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: "New Contact Message - NewsXpress",
            html: `
                <h2>Feedback</h2>
                <p><b>Name:</b> ${name}</p>
                <p><b>Email:</b> ${email}</p>
                <p><b>Message:</b> ${message}</p>
            `,
            replyTo: email,
        };

        await transporter.sendMail(mailOptions);

        res.sendFile(path.join(__dirname, "public", "success.html"));

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).send("Error processing request");
    }
});


// ================= SERVER START =================
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});