# 📅 Event Management API

A simple, beginner-friendly REST API built with **Node.js** and **Express**.
No database required — data is stored in memory (a JavaScript array).

---

## 📁 Folder Structure

```
event-management-api/
│
├── app.js                    ← Entry point. Starts the server.
├── package.json              ← Project info and dependencies
│
├── routes/
│   └── eventRoutes.js        ← Defines URL paths (GET, POST, PUT, DELETE)
│
├── controllers/
│   └── eventController.js    ← Logic: what happens for each route
│
└── data/
    └── events.js             ← In-memory "database" (just an array)
```

---

## 🚀 How to Run the Project

### Step 1 — Install Node.js
Download from https://nodejs.org (choose the LTS version)

### Step 2 — Install dependencies
```bash
cd event-management-api
npm install
```

### Step 3 — (Optional) Set a custom port
By default the server runs on port **3000**. To use a different port, set the `PORT` environment variable before starting:
```bash
# Windows
set PORT=8080 && npm start

# Mac/Linux
PORT=8080 npm start
```

### Step 4 — Start the server
```bash
# Option A: Standard start
npm start

# Option B: Dev mode (auto-restarts on file changes — recommended while learning)
npm run dev
```

You should see:
```
✅ Server is running at http://localhost:3000
```

---

## 📦 Dependencies

| Package | Purpose |
|---|---|
| `express` | Web framework — handles routing and requests |
| `helmet` | Sets secure HTTP response headers |
| `cors` | Allows cross-origin requests from browsers/frontends |
| `express-rate-limit` | Limits each IP to 100 requests per 15 minutes |
| `nodemon` *(dev)* | Auto-restarts the server when files change |

---

## 🔌 API Endpoints

| Method | URL             | What it does             |
|--------|-----------------|--------------------------|
| GET    | /events         | Get all events           |
| GET    | /events/:id     | Get one event by ID      |
| POST   | /events         | Create a new event       |
| PUT    | /events/:id     | Update an event by ID    |
| DELETE | /events/:id     | Delete an event by ID    |

---

## ✏️ Request Body (POST and PUT)

Both `POST /events` and `PUT /events/:id` require a JSON body with these fields:

```json
{
  "title": "My Event",
  "description": "A great time",
  "date": "2025-12-01",
  "location": "Accra"
}
```

### Validation rules

| Field | Required | Max Length | Format |
|---|---|---|---|
| `title` | ✅ | 100 chars | Any non-empty string |
| `description` | ✅ | 500 chars | Any non-empty string |
| `date` | ✅ | — | `YYYY-MM-DD` (e.g. `2025-12-01`) |
| `location` | ✅ | 200 chars | Any non-empty string |

- Whitespace-only values (e.g. `"   "`) are rejected.
- Dates must be real calendar dates — `"2025-13-99"` will be rejected.

---

## 🧪 Testing with curl

### Get all events
```bash
curl http://localhost:3000/events
```

### Get one event (ID = 1)
```bash
curl http://localhost:3000/events/1
```

### Create a new event
```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"My Event\",\"description\":\"A great time\",\"date\":\"2025-12-01\",\"location\":\"Accra\"}"
```

### Update an event (ID = 1)
```bash
curl -X PUT http://localhost:3000/events/1 \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Updated Title\",\"description\":\"Updated desc\",\"date\":\"2025-12-31\",\"location\":\"Lagos\"}"
```

### Delete an event (ID = 2)
```bash
curl -X DELETE http://localhost:3000/events/2
```

---

## 🧪 Testing with Postman

1. Download Postman from https://www.postman.com
2. Create a new request
3. Set the method (GET, POST, PUT, DELETE)
4. Enter the URL: `http://localhost:3000/events`
5. For POST/PUT: click **Body** → **raw** → **JSON** and paste your JSON

---

## 📦 Response Format

All responses follow this format:
```json
{
  "success": true,
  "message": "Human-readable message here",
  "data": {}
}
```

### Error responses

| Status | Meaning |
|---|---|
| `400` | Bad request — missing, invalid, or too-long fields |
| `404` | No event found with the given ID |
| `429` | Too many requests — rate limit exceeded (100 req / 15 min) |

---

## 🔒 Security Features

- **Helmet** — automatically sets secure HTTP headers (e.g. `X-Content-Type-Options`, `X-Frame-Options`)
- **CORS** — enables cross-origin resource sharing so browser-based frontends can connect
- **Rate limiting** — each IP address is limited to 100 requests per 15 minutes to prevent abuse
- **Input sanitization** — all string fields are trimmed of whitespace before saving
- **Input validation** — field lengths and date formats are strictly validated

---

## ⚠️ Common Beginner Mistakes

1. **Forgetting `express.json()` middleware**
   Without it, `req.body` is `undefined` and POST/PUT won't work.

2. **Not converting `req.params.id` to a Number**
   URL params are always strings. `"1" === 1` is `false` in JavaScript.
   Always use `Number(req.params.id)`.

3. **Not restarting the server after changes**
   Node.js doesn't auto-reload. Either restart manually or use `nodemon`.

4. **Sending requests without `Content-Type: application/json`**
   For POST/PUT requests, this header tells Express the body is JSON.

5. **Sending an invalid date format**
   The `date` field only accepts `YYYY-MM-DD`. Sending `"Dec 1 2025"` or `"01-12-2025"` will return a 400 error.

6. **Data disappears on restart**
   That's expected! We're using in-memory storage. A real app uses a database.
