const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./src/config/db");
const router = require("./src/routes/index");
const errorHandler = require("./src/middlewares/errorHandler");
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const app = express();

// Middleware
const corsOptions = {
  origin: "*", // Allowing all domains for testing. But for production, allow only trusted domains
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

// Enable Express to trust proxies
app.set("trust proxy", 1);

// Apply rate limiting to authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later.",
});
app.use(authLimiter); // Applies to all routes

// Routes
app.use("/api/v1", router);

// Error handling
app.use(errorHandler);

// Start the server
try {
  connectDB();
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
} catch (error) {
  console.error("Failed to connect to the database:", error);
  process.exit(1);
}

// Export app for Vercel or local development
module.exports = app;
