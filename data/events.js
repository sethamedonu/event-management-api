// ============================================================
// FILE: data/events.js
// ------------------------------------------------------------
// WHAT THIS FILE DOES:
//   This file acts as our "fake database". Instead of connecting
//   to a real database (like MySQL or MongoDB), we're storing
//   all our events right here in a JavaScript array.
//
// WHY DO THIS?
//   For learning purposes, this keeps things simple. No database
//   setup, no SQL, no connection strings. Just plain JavaScript.
//   The downside: all data is LOST when the server restarts.
//   That's fine for learning — in a real app, you'd use a database.
// ============================================================

// This is our "database" — just a plain JavaScript array.
// Each item in this array will be one event object.
// We're starting with two sample events so you can test the
// GET /events endpoint immediately without creating anything first.
let events = [
  {
    id: 1,                                     // Unique identifier for this event
    title: "Node.js Workshop",                 // Name of the event
    description: "A beginner-friendly intro to Node.js and Express", // What it's about
    date: "2025-08-15",                        // When it happens (stored as a string)
    location: "Accra, Ghana",                  // Where it happens
  },
  {
    id: 2,
    title: "Tech Conference 2025",
    description: "Annual technology conference featuring AI and Web Dev talks",
    date: "2025-09-20",
    location: "Lagos, Nigeria",
  },
];

// We export this array so other files can use it.
// "module.exports" is how Node.js shares things between files.
// Think of it like handing a piece of paper to another person.
module.exports = events;
