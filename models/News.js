import mongoose from "mongoose";                         // Import mongoose library for MongoDB interaction

const newsSchema = new mongoose.Schema({                 // Define schema for news collection
    
    title: String,                                      // Title of the news article
    description: String,                                // Short summary/description of the article
    url: { type: String, unique: true },                // Unique article URL (prevents duplicates)
    urlToImage: String,                                 // URL of the article image
    publishedAt: String,                                // Publication date (currently stored as string)

    source: {                                           // Nested object for source details
        name: String                                    // Name of the news source (e.g., BBC, CNN)
    },

    category: String                                    // Category/tag for filtering (e.g., world, tech)

}, { 
    timestamps: true                                    // Automatically adds createdAt and updatedAt fields
});

export default mongoose.model("News", newsSchema);       // Create and export model (collection name: "news")