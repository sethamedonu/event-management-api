// ============================================================
// FILE: app.js
// ------------------------------------------------------------
// WHAT THIS FILE DOES:
//   This is the ENTRY POINT of our application — the first file
//   Node.js runs. Think of it as the front door to our building.
//
//   It is responsible for:
//     1. Creating the Express application
//     2. Setting up "middleware" (tools that process requests)
//     3. Connecting our routes (telling the app where URLs live)
//     4. Starting the server so it listens for incoming requests
//
// WHAT IS EXPRESS?
//   Express is a framework built on top of Node.js. Node.js alone
//   can handle web requests, but it's very low-level and verbose.
//   Express makes it much simpler. It handles a lot of repetitive
//   work for you (parsing JSON, routing, sending responses, etc.)
// ============================================================

// Step 1: Import Express
// require() is Node.js's way of loading installed packages or files.
// We installed express via: npm install express
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const eventRoutes = require("./routes/eventRoutes.js");

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// MIDDLEWARE SETUP
// ------------------------------------------------------------
// WHAT IS MIDDLEWARE?
//   Middleware is code that runs BETWEEN receiving a request
//   and sending a response. Think of it as security checkpoints
//   or processing steps before the real work begins.
//
//   Request → [Middleware 1] → [Middleware 2] → Controller → Response
//
// app.use() registers middleware to run on EVERY request.
// ============================================================

// Security headers
app.use(helmet());

// CORS — allows browsers/frontends on other origins to call this API
app.use(cors());

// Rate limiting — max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests, please try again later.", data: null },
});
app.use(limiter);

// Parse incoming JSON request bodies
app.use(express.json());

// ============================================================
// ROUTES SETUP
// ------------------------------------------------------------
// app.use("/events", eventRoutes) tells Express:
//   "For any request that starts with /events, hand it off
//    to the eventRoutes file to handle."
//
// So when someone hits GET /events/3:
//   - Express sees the path starts with "/events"
//   - It passes the request to eventRoutes
//   - eventRoutes strips "/events" and matches "/:id" → getEventById
// ============================================================
app.use("/events", eventRoutes);

// ============================================================
// ROOT ROUTE (nice welcome message)
// ------------------------------------------------------------
// This handles GET / (just the base URL with no path).
// It's a friendly message for anyone who visits the root URL.
// Not required for the API to work, but a nice touch.
// ============================================================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the Event Management API! Visit /events to get started.",
    data: null,
  });
});

// ============================================================
// 404 HANDLER (catch-all for unknown routes)
// ------------------------------------------------------------
// If someone visits a URL that doesn't exist (like /bananas),
// none of our routes will match. This middleware catches those
// "leftover" requests and sends a proper 404 Not Found response.
//
// IMPORTANT: This must come AFTER all other routes/middleware.
// Express runs middleware in order — if this were first, it would
// catch every single request, including valid ones.
// ============================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.url}`,
    data: null,
  });
});

// ============================================================
// START THE SERVER
// ------------------------------------------------------------
// app.listen() starts the server and makes it wait for requests.
// The callback function runs once the server is ready.
// "Listening" means: "I'm open and waiting for someone to talk to me."
// ============================================================
app.listen(PORT, () => {
  console.log("--------------------------------------------");
  console.log(`✅ Server is running at http://localhost:${PORT}`);
  console.log(`📋 View all events:  GET  http://localhost:${PORT}/events`);
  console.log(`➕ Create an event:  POST http://localhost:${PORT}/events`);
  console.log("--------------------------------------------");
});
