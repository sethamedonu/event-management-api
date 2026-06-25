const { ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require("uuid");
const { db, TABLE } = require("../data/db.js");

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET = process.env.S3_BUCKET;

// -------------------------------------------------------
// Validation helper
// -------------------------------------------------------
function validateFields({ title, description, date, location }) {
  const t = title?.trim();
  const d = description?.trim();
  const loc = location?.trim();
  const dt = date?.trim();

  if (!t || !d || !dt || !loc)
    return "All fields are required: title, description, date, location";
  if (t.length > 100) return "title max 100 chars";
  if (d.length > 500) return "description max 500 chars";
  if (loc.length > 200) return "location max 200 chars";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dt) || isNaN(Date.parse(dt)))
    return "date must be a valid date in YYYY-MM-DD format";

  return null;
}

// -------------------------------------------------------
// GET /events
// -------------------------------------------------------
async function getAllEvents(req, res) {
  try {
    const result = await db.send(new ScanCommand({ TableName: TABLE }));
    const events = (result.Items || []).sort((a, b) => a.createdAt - b.createdAt);
    return res.status(200).json({ success: true, message: "All events retrieved successfully", data: events });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to retrieve events", data: null });
  }
}

// -------------------------------------------------------
// GET /events/:id
// -------------------------------------------------------
async function getEventById(req, res) {
  try {
    const result = await db.send(new GetCommand({ TableName: TABLE, Key: { id: req.params.id } }));
    if (!result.Item)
      return res.status(404).json({ success: false, message: `No event found with ID ${req.params.id}`, data: null });
    return res.status(200).json({ success: true, message: "Event retrieved successfully", data: result.Item });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to retrieve event", data: null });
  }
}

// -------------------------------------------------------
// POST /events
// -------------------------------------------------------
async function createEvent(req, res) {
  const { title, description, date, location, imageUrl } = req.body;
  const error = validateFields({ title, description, date, location });
  if (error) return res.status(400).json({ success: false, message: error, data: null });

  const newEvent = {
    id: uuidv4(),
    title: title.trim(),
    description: description.trim(),
    date: date.trim(),
    location: location.trim(),
    imageUrl: imageUrl || null,
    createdAt: Date.now(),
  };

  try {
    await db.send(new PutCommand({ TableName: TABLE, Item: newEvent }));
    return res.status(201).json({ success: true, message: "Event created successfully", data: newEvent });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to create event", data: null });
  }
}

// -------------------------------------------------------
// PUT /events/:id
// -------------------------------------------------------
async function updateEvent(req, res) {
  const { id } = req.params;
  const { title, description, date, location, imageUrl } = req.body;
  const error = validateFields({ title, description, date, location });
  if (error) return res.status(400).json({ success: false, message: error, data: null });

  try {
    const existing = await db.send(new GetCommand({ TableName: TABLE, Key: { id } }));
    if (!existing.Item)
      return res.status(404).json({ success: false, message: `No event found with ID ${id}`, data: null });

    const result = await db.send(new UpdateCommand({
      TableName: TABLE,
      Key: { id },
      UpdateExpression: "SET #title = :title, description = :description, #date = :date, #location = :location, imageUrl = :imageUrl",
      ExpressionAttributeNames: { "#title": "title", "#date": "date", "#location": "location" },
      ExpressionAttributeValues: {
        ":title": title.trim(),
        ":description": description.trim(),
        ":date": date.trim(),
        ":location": location.trim(),
        ":imageUrl": imageUrl || existing.Item.imageUrl || null,
      },
      ReturnValues: "ALL_NEW",
    }));

    return res.status(200).json({ success: true, message: "Event updated successfully", data: result.Attributes });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to update event", data: null });
  }
}

// -------------------------------------------------------
// DELETE /events/:id
// -------------------------------------------------------
async function deleteEvent(req, res) {
  const { id } = req.params;
  try {
    const existing = await db.send(new GetCommand({ TableName: TABLE, Key: { id } }));
    if (!existing.Item)
      return res.status(404).json({ success: false, message: `No event found with ID ${id}`, data: null });

    // Delete image from S3 if exists
    if (existing.Item.imageUrl) {
      const key = existing.Item.imageUrl.split(".amazonaws.com/")[1];
      if (key) {
        await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key })).catch(() => {});
      }
    }

    await db.send(new DeleteCommand({ TableName: TABLE, Key: { id } }));
    return res.status(200).json({ success: true, message: "Event deleted successfully", data: existing.Item });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to delete event", data: null });
  }
}

// -------------------------------------------------------
// GET /events/upload-url
// -------------------------------------------------------
async function getUploadUrl(req, res) {
  const { fileName, fileType } = req.query;
  if (!fileName || !fileType)
    return res.status(400).json({ success: false, message: "fileName and fileType are required", data: null });

  const key = `events/${uuidv4()}-${fileName}`;

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: fileType,
    });
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    const imageUrl = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return res.status(200).json({ success: true, message: "Upload URL generated", data: { uploadUrl, imageUrl } });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to generate upload URL", data: null });
  }
}

module.exports = { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent, getUploadUrl };
