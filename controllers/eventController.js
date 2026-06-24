// ============================================================
// FILE: controllers/eventController.js
// ------------------------------------------------------------
// WHAT THIS FILE DOES:
//   This is where the LOGIC lives. When a request comes in,
//   the route file decides "who handles this?" and the controller
//   is the one who actually does the work:
//     - Reading from the events array
//     - Adding a new event
//     - Updating or deleting one
//     - Sending back the response to the user
//
// THINK OF IT LIKE THIS:
//   The route is a traffic sign that points you in the right
//   direction. The controller is the actual destination — the
//   person who does the real work when you arrive.
//
// WHAT ARE req AND res?
//   - req (request):  Everything the USER sent to us.
//                     Body data, URL parameters, headers, etc.
//   - res (response): Our tool for sending something BACK to the user.
//                     We use res.json() to send JSON data.
// ============================================================

// Pull in our "database" (the array from data/events.js)
// require() is how Node.js imports things from other files
const events = require("../data/events.js");

// -------------------------------------------------------
// HELPER: nextId()
// -------------------------------------------------------
// WHY DO WE NEED THIS?
//   Every event needs a unique ID so we can find, update,
//   or delete it later. In a real database, the DB generates
//   this automatically. Since we're using an array, we do it
//   ourselves by finding the highest existing ID and adding 1.
// -------------------------------------------------------
function nextId() {
  if (events.length === 0) {
    // If there are no events yet, start IDs at 1
    return 1;
  }
  // Math.max(...) finds the largest number in a list.
  // We spread the array of IDs using "..." so Math.max can read them.
  // Example: if IDs are [1, 2, 3], Math.max(1, 2, 3) returns 3, then +1 = 4
  const highestId = Math.max(...events.map((event) => event.id));
  return highestId + 1;
}

// -------------------------------------------------------
// CONTROLLER 1: getAllEvents
// Handles: GET /events
// -------------------------------------------------------
// PURPOSE: Return every event in our array to the user
// -------------------------------------------------------
function getAllEvents(req, res) {
  // res.json() converts our JavaScript object into JSON format
  // and sends it back to whoever made the request.
  // The HTTP status 200 means "OK / Success".
  return res.status(200).json({
    success: true,
    message: "All events retrieved successfully",
    data: events, // Send the entire events array
  });
}

// -------------------------------------------------------
// CONTROLLER 2: getEventById
// Handles: GET /events/:id
// -------------------------------------------------------
// PURPOSE: Find and return ONE event that matches the given ID
//
// WHAT IS :id?
//   When the user visits /events/3, Express captures "3"
//   and puts it in req.params.id for us to use.
// -------------------------------------------------------
function getEventById(req, res) {
  // req.params.id comes in as a STRING like "3"
  // We use Number() to convert it to an actual number (3)
  // because our IDs in the array are numbers, not strings
  const id = Number(req.params.id);

  // Array.find() goes through each event and returns the FIRST
  // one where event.id matches our id. If nothing matches, it returns undefined.
  const event = events.find((event) => event.id === id);

  // If no event was found, we send a 404 (Not Found) response
  if (!event) {
    return res.status(404).json({
      success: false,
      message: `No event found with ID ${id}`,
      data: null,
    });
  }

  // If we found it, send it back with a 200 OK
  return res.status(200).json({
    success: true,
    message: "Event retrieved successfully",
    data: event,
  });
}

// -------------------------------------------------------
// CONTROLLER 3: createEvent
// Handles: POST /events
// -------------------------------------------------------
// PURPOSE: Add a brand new event to our array
//
// WHERE DOES THE DATA COME FROM?
//   The user sends a JSON body in their request, like:
//   {
//     "title": "My Event",
//     "description": "...",
//     "date": "2025-10-01",
//     "location": "Nairobi"
//   }
//   Express puts that body in req.body for us (because we
//   use express.json() middleware in app.js).
// -------------------------------------------------------
function createEvent(req, res) {
  const { title, description, date, location } = req.body;

  // Trim whitespace and validate all fields are present and non-empty
  const t = title?.trim();
  const d = description?.trim();
  const loc = location?.trim();
  const dt = date?.trim();

  if (!t || !d || !dt || !loc) {
    return res.status(400).json({
      success: false,
      message: "All fields are required: title, description, date, location",
      data: null,
    });
  }

  // Validate field lengths
  if (t.length > 100 || d.length > 500 || loc.length > 200) {
    return res.status(400).json({
      success: false,
      message: "title max 100 chars, description max 500 chars, location max 200 chars",
      data: null,
    });
  }

  // Validate date format (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dt) || isNaN(Date.parse(dt))) {
    return res.status(400).json({
      success: false,
      message: "date must be a valid date in YYYY-MM-DD format",
      data: null,
    });
  }

  const newEvent = {
    id: nextId(),
    title: t,
    description: d,
    date: dt,
    location: loc,
  };

  // Add the new event to our array
  // push() appends an item to the end of an array
  events.push(newEvent);

  // Send back a 201 Created response with the new event
  // 201 is the "correct" status code for successfully creating something
  return res.status(201).json({
    success: true,
    message: "Event created successfully",
    data: newEvent,
  });
}

// -------------------------------------------------------
// CONTROLLER 4: updateEvent
// Handles: PUT /events/:id
// -------------------------------------------------------
// PURPOSE: Find an event by ID and overwrite its fields
//          with new data from the request body.
//
// PUT means "replace the whole thing". The user sends
// all the fields they want, and we update the event.
// -------------------------------------------------------
function updateEvent(req, res) {
  const id = Number(req.params.id);

  // Find the INDEX (position) of the event in the array.
  // findIndex() is like find() but returns the position number (0, 1, 2...)
  // instead of the actual object. We need the index to update it in place.
  const eventIndex = events.findIndex((event) => event.id === id);

  // findIndex() returns -1 if nothing was found
  if (eventIndex === -1) {
    return res.status(404).json({
      success: false,
      message: `No event found with ID ${id}`,
      data: null,
    });
  }

  const { title, description, date, location } = req.body;

  const t = title?.trim();
  const d = description?.trim();
  const loc = location?.trim();
  const dt = date?.trim();

  if (!t || !d || !dt || !loc) {
    return res.status(400).json({
      success: false,
      message: "All fields are required: title, description, date, location",
      data: null,
    });
  }

  if (t.length > 100 || d.length > 500 || loc.length > 200) {
    return res.status(400).json({
      success: false,
      message: "title max 100 chars, description max 500 chars, location max 200 chars",
      data: null,
    });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dt) || isNaN(Date.parse(dt))) {
    return res.status(400).json({
      success: false,
      message: "date must be a valid date in YYYY-MM-DD format",
      data: null,
    });
  }

  events[eventIndex] = {
    ...events[eventIndex],
    title: t,
    description: d,
    date: dt,
    location: loc,
  };

  return res.status(200).json({
    success: true,
    message: "Event updated successfully",
    data: events[eventIndex],
  });
}

// -------------------------------------------------------
// CONTROLLER 5: deleteEvent
// Handles: DELETE /events/:id
// -------------------------------------------------------
// PURPOSE: Remove an event from the array permanently
// -------------------------------------------------------
function deleteEvent(req, res) {
  const id = Number(req.params.id);

  // Find the index of the event to delete
  const eventIndex = events.findIndex((event) => event.id === id);

  if (eventIndex === -1) {
    return res.status(404).json({
      success: false,
      message: `No event found with ID ${id}`,
      data: null,
    });
  }

  // splice() removes items from an array at a given index.
  // splice(eventIndex, 1) means: "starting at eventIndex, remove 1 item"
  // splice() also RETURNS the removed items as an array, so [0] gets the first one.
  const deletedEvent = events.splice(eventIndex, 1)[0];

  return res.status(200).json({
    success: true,
    message: "Event deleted successfully",
    data: deletedEvent, // Return what was deleted, so the user knows what got removed
  });
}

// Export all the controller functions so routes/eventRoutes.js can use them.
// Each function is listed by name — same as naming them in an object.
module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
