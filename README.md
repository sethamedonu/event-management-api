# Event Management API

A REST API built with Node.js and Express, containerized with Docker, and deployed to AWS ECS via a GitHub Actions CI/CD pipeline.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| Container | Docker |
| Container Registry | Amazon ECR |
| Deployment | AWS ECS (Fargate) via ECS Express Mode |
| CI/CD | GitHub Actions |
| Monitoring | Amazon CloudWatch |

---

## Project Structure

```
event-management-api/
│
├── .github/
│   └── workflows/
│       └── deploy.yml        <- CI/CD pipeline
│
├── controllers/
│   └── eventController.js    <- Route logic (CRUD operations)
│
├── data/
│   └── events.js             <- In-memory data store
│
├── routes/
│   └── eventRoutes.js        <- URL route definitions
│
├── app.js                    <- Entry point
├── Dockerfile                <- Container build instructions
├── .dockerignore             <- Files excluded from Docker image
├── .gitignore                <- Files excluded from Git
└── package.json              <- Dependencies and scripts
```

---

## Running Locally

### Prerequisites
- Node.js (https://nodejs.org — LTS version)
- npm (comes with Node.js)

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/sethamedonu/event-management-api.git
cd event-management-api

# 2. Install dependencies
npm install

# 3. Start the server
npm start

# Dev mode (auto-restarts on file changes)
npm run dev
```

### Custom port (optional)
```bash
# Windows
set PORT=8080 && npm start

# Mac/Linux
PORT=8080 npm start
```

Server runs at `http://localhost:3000` by default.

---

## Running with Docker

```bash
# Build the image
docker build -t event-management-api .

# Run the container
docker run -p 3000:3000 event-management-api
```

---

## Dependencies

| Package | Purpose |
|---|---|
| `express` | Web framework |
| `helmet` | Secure HTTP response headers |
| `cors` | Cross-origin resource sharing |
| `express-rate-limit` | Rate limiting (100 req / 15 min per IP) |
| `nodemon` *(dev)* | Auto-restart on file changes |

---

## API Endpoints

| Method | URL | Description |
|---|---|---|
| GET | /events | Get all events |
| GET | /events/:id | Get one event by ID |
| POST | /events | Create a new event |
| PUT | /events/:id | Update an event by ID |
| DELETE | /events/:id | Delete an event by ID |

---

## Request Body (POST and PUT)

```json
{
  "title": "My Event",
  "description": "A great time",
  "date": "2025-12-01",
  "location": "Accra"
}
```

### Validation Rules

| Field | Required | Max Length | Format |
|---|---|---|---|
| `title` | Yes | 100 chars | Non-empty string |
| `description` | Yes | 500 chars | Non-empty string |
| `date` | Yes | — | YYYY-MM-DD |
| `location` | Yes | 200 chars | Non-empty string |

- Whitespace-only values are rejected
- Invalid dates (e.g. `2025-13-99`) are rejected
- All fields are trimmed before saving

---

## Response Format

All responses follow this structure:

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": {}
}
```

### Error Status Codes

| Status | Meaning |
|---|---|
| `400` | Missing, invalid, or too-long fields |
| `404` | No event found with the given ID |
| `429` | Rate limit exceeded |

---

## Testing with curl

```bash
# Get all events
curl http://localhost:3000/events

# Get one event
curl http://localhost:3000/events/1

# Create an event
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"My Event\",\"description\":\"A great time\",\"date\":\"2025-12-01\",\"location\":\"Accra\"}"

# Update an event
curl -X PUT http://localhost:3000/events/1 \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Updated Title\",\"description\":\"Updated desc\",\"date\":\"2025-12-31\",\"location\":\"Lagos\"}"

# Delete an event
curl -X DELETE http://localhost:3000/events/2
```

---

## CI/CD Pipeline

Every push to `main` automatically:

1. Builds a new Docker image
2. Pushes it to Amazon ECR (tagged with the git commit SHA)
3. Updates the ECS task definition with the new image
4. Deploys to ECS and waits for the service to stabilize

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |

### Required GitHub Variables

| Variable | Value |
|---|---|
| `AWS_REGION` | `us-east-1` |

---

## AWS Infrastructure

| Resource | Name |
|---|---|
| ECR Repository | `event-management-api` |
| ECS Cluster | `default` |
| ECS Service | `event-management-api-service` |
| Task Definition | `default-event-management-api-service` |
| CloudWatch Log Group | `/aws/ecs/default/event-management-api-service-ed3f` |

---

## Monitoring & Logging

- **Logs** — streamed automatically to CloudWatch Logs. View at:
  `CloudWatch → Log groups → /aws/ecs/default/event-management-api-service-ed3f`

- **Alarm** — `event-api-container-down` triggers when running task count drops below 1, sending an email notification via SNS

---

## Security

- `helmet` sets secure HTTP headers on every response
- `cors` restricts cross-origin access
- Rate limiting prevents abuse (100 requests per 15 minutes per IP)
- Input validation and sanitization on all POST and PUT requests
- AWS credentials are stored as GitHub Secrets — never hardcoded

---

## Notes

- Data is stored in memory and resets on every server restart
- For production use, replace the in-memory store with a persistent database (e.g. Amazon DynamoDB or Amazon RDS)
