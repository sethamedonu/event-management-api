// ============================================================
// FILE: routes/eventRoutes.js
// ------------------------------------------------------------
// WHAT THIS FILE DOES:
//   This file defines all the URL paths (routes) for our events API.
//   It says: "When someone visits THIS URL with THIS method,
//   call THIS controller function."
//
// THINK OF IT LIKE A RECEPTIONIST:
//   The route file is like a receptionist at a company.
//   A visitor (request) walks in and says "I'm here for POST /events."
//   The receptionist checks the list and says "Ah yes, please go see
//   createEvent in the controller department."
//
// WHY SEPARATE ROUTES FROM CONTROLLERS?
//   To keep things organized. Routes only decide WHERE to go.
//   Controllers do the actual work. Mixing them together in one
//   file makes code harder to read as your app grows.
// ============================================================

// Express gives us a "Router" — a mini-app just for handling routes.
// We use it to group related routes together (all event routes here).
const express = require("express");
const router = express.Router();

// Import all the controller functions we wrote in eventController.js
// require() loads the file and destructuring pulls out the named functions
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController.js");

// -------------------------------------------------------
// ROUTE DEFINITIONS
// -------------------------------------------------------
// Syntax: router.METHOD("path", controllerFunction)
//
// METHOD can be: .get(), .post(), .put(), .delete()
// These match the HTTP methods a client sends.
// -------------------------------------------------------

// GET /events → return all events
// When someone does: GET http://localhost:3000/events
router.get("/", getAllEvents);

// GET /events/:id → return one event by ID
// The ":id" is a URL parameter — it's a placeholder.
// If user visits /events/5, then req.params.id = "5"
router.get("/:id", getEventById);

// POST /events → create a new event
// The user sends data in the request body (JSON)
router.post("/", createEvent);

// PUT /events/:id → update an existing event by ID
// The user sends the updated data in the request body
router.put("/:id", updateEvent);

// DELETE /events/:id → delete an event by ID
router.delete("/:id", deleteEvent);

// Export the router so app.js can use it
module.exports = router;
