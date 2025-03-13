// ES Module way to load environment variables
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

// Import routes
import listingRoutes from "./routes/listings.js";
import reviewsRoutes from "./routes/reviews.js";
import userRoutes from "./routes/user.js";

// Import models and utilities
import Apierror from "./utils/Apierror.js"; // Ensure this file exists

const port = process.env.PORT || 3030;
const dbUrl = process.env.ATLASDB_URL;

// Connect to MongoDB
mongoose.connect(dbUrl)
    .then(() => console.log(" Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// Middleware
app.use(cors({
    origin: "http://localhost:5173", // Your React app URL
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//  Serve Images from Public Folder
app.use("/images", express.static("public/images"));

//  API Routes
app.use("/api/listings", listingRoutes);
app.use("/api/reviews", reviewsRoutes);  // ✅ Fixed inconsistent naming
app.use("/api/auth", userRoutes);

//  404 Handler for Invalid Routes
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        status: 404,
        message: "Route not found",
    });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    if (err instanceof Apierror) {
        return res.status(err.statuscode).json({
            success: false,
            status: err.statuscode,
            message: err.message || "An error occurred",
            errors: err.errors || [],
        });
    }

    res.status(500).json({
        success: false,
        status: 500,
        message: "Something went wrong",
        errors: [],
    });
});

// ✅ Start Server
app.listen(port, () => console.log(`Server running on port ${port}`));
