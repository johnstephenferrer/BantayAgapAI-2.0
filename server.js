import express from "express";
import dotenv from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: path.join(__dirname, ".env")
});

const app = express();

const PORT = Number(process.env.PORT || 3000);
const DB_PATH = path.join(__dirname, "data", "db.json");
const PUBLIC_PATH = path.join(__dirname, "public");
const PROJECT_UPLOADS_PATH = path.join(PUBLIC_PATH, "uploads", "projects");
const MAX_PROJECT_IMAGE_BYTES = 4 * 1024 * 1024;
const ANNOUNCEMENT_UPLOADS_PATH = path.join(PUBLIC_PATH, "uploads", "announcements");
const MAX_ANNOUNCEMENT_IMAGE_BYTES = 5 * 1024 * 1024;
const CONCERN_UPLOADS_PATH = path.join(PUBLIC_PATH, "uploads", "concerns");
const MAX_CONCERN_IMAGE_BYTES = 5 * 1024 * 1024;

const SESSION_COOKIE = "bantay_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const sessions = new Map();

app.disable("x-powered-by");
app.use(express.json({ limit: "8mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(express.static(PUBLIC_PATH));

/* =========================================
   GENERAL HELPERS
========================================= */

function clean(value, max = 2000) {
  return String(value ?? "").trim().slice(0, max);
}

function newId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(3).toString("hex")}`;
}

async function saveProjectImageData(imageData) {
  if (typeof imageData !== "string") {
    const error = new Error("A valid cropped project photo is required.");
    error.status = 400;
    throw error;
  }

  const match = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(imageData);
  if (!match || match[1].length > Math.ceil(MAX_PROJECT_IMAGE_BYTES * 4 / 3) + 8) {
    const error = new Error("Project photo must be a JPEG image smaller than 4 MB.");
    error.status = 400;
    throw error;
  }

  const imageBuffer = Buffer.from(match[1], "base64");
  const isJpeg =
    imageBuffer.length >= 4 &&
    imageBuffer[0] === 0xff &&
    imageBuffer[1] === 0xd8 &&
    imageBuffer[imageBuffer.length - 2] === 0xff &&
    imageBuffer[imageBuffer.length - 1] === 0xd9;

  if (!isJpeg || imageBuffer.length > MAX_PROJECT_IMAGE_BYTES) {
    const error = new Error("Project photo is invalid or larger than 4 MB.");
    error.status = 400;
    throw error;
  }

  await fs.mkdir(PROJECT_UPLOADS_PATH, { recursive: true });
  const filename = `${newId("project_image")}.jpg`;
  const filePath = path.join(PROJECT_UPLOADS_PATH, filename);
  await fs.writeFile(filePath, imageBuffer, { flag: "wx" });

  return {
    url: `/uploads/projects/${filename}`,
    filePath
  };
}

async function removeProjectImage(imageUrl) {
  const prefix = "/uploads/projects/";
  if (typeof imageUrl !== "string" || !imageUrl.startsWith(prefix)) return;

  const filename = imageUrl.slice(prefix.length);
  if (!filename || path.basename(filename) !== filename) return;

  await fs.rm(path.join(PROJECT_UPLOADS_PATH, filename), { force: true });
}

async function saveAnnouncementImageData(imageData) {
  if (typeof imageData !== "string") {
    const error = new Error("Announcement photo data is invalid.");
    error.status = 400;
    throw error;
  }

  const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(imageData);
  if (!match || match[2].length > Math.ceil(MAX_ANNOUNCEMENT_IMAGE_BYTES * 4 / 3) + 8) {
    const error = new Error("Use a JPEG, PNG, or WebP photo smaller than 5 MB.");
    error.status = 400;
    throw error;
  }

  const extension = match[1] === "jpeg" ? "jpg" : match[1];
  const imageBuffer = Buffer.from(match[2], "base64");
  const validImage = match[1] === "jpeg"
    ? imageBuffer.length >= 4 && imageBuffer[0] === 0xff && imageBuffer[1] === 0xd8 && imageBuffer.at(-2) === 0xff && imageBuffer.at(-1) === 0xd9
    : match[1] === "png"
      ? imageBuffer.length >= 8 && imageBuffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
      : imageBuffer.length >= 12 && imageBuffer.toString("ascii", 0, 4) === "RIFF" && imageBuffer.toString("ascii", 8, 12) === "WEBP";

  if (!validImage || imageBuffer.length > MAX_ANNOUNCEMENT_IMAGE_BYTES) {
    const error = new Error("Announcement photo is invalid or larger than 5 MB.");
    error.status = 400;
    throw error;
  }

  await fs.mkdir(ANNOUNCEMENT_UPLOADS_PATH, { recursive: true });
  const filename = `${newId("announcement_image")}.${extension}`;
  const filePath = path.join(ANNOUNCEMENT_UPLOADS_PATH, filename);
  await fs.writeFile(filePath, imageBuffer, { flag: "wx" });

  return { url: `/uploads/announcements/${filename}`, filePath };
}

async function removeAnnouncementImage(imageUrl) {
  const prefix = "/uploads/announcements/";
  if (typeof imageUrl !== "string" || !imageUrl.startsWith(prefix)) return;
  const filename = imageUrl.slice(prefix.length);
  if (!filename || path.basename(filename) !== filename) return;
  await fs.rm(path.join(ANNOUNCEMENT_UPLOADS_PATH, filename), { force: true });
}

async function saveConcernImageData(imageData) {
  if (typeof imageData !== "string") {
    const error = new Error("Concern photo data is invalid.");
    error.status = 400;
    throw error;
  }

  const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(imageData);
  if (!match || match[2].length > Math.ceil(MAX_CONCERN_IMAGE_BYTES * 4 / 3) + 8) {
    const error = new Error("Use a JPG, PNG, or WebP photo smaller than 5 MB.");
    error.status = 400;
    throw error;
  }

  const [, type, encoded] = match;
  const imageBuffer = Buffer.from(encoded, "base64");
  const validImage = type === "jpeg"
    ? imageBuffer.length >= 4 && imageBuffer[0] === 0xff && imageBuffer[1] === 0xd8 && imageBuffer.at(-2) === 0xff && imageBuffer.at(-1) === 0xd9
    : type === "png"
      ? imageBuffer.length >= 8 && imageBuffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
      : imageBuffer.length >= 12 && imageBuffer.toString("ascii", 0, 4) === "RIFF" && imageBuffer.toString("ascii", 8, 12) === "WEBP";

  if (!validImage || imageBuffer.length > MAX_CONCERN_IMAGE_BYTES) {
    const error = new Error("Concern photo is invalid or larger than 5 MB.");
    error.status = 400;
    throw error;
  }

  await fs.mkdir(CONCERN_UPLOADS_PATH, { recursive: true });
  const extension = type === "jpeg" ? "jpg" : type;
  const filename = `${newId("concern_image")}.${extension}`;
  const filePath = path.join(CONCERN_UPLOADS_PATH, filename);
  await fs.writeFile(filePath, imageBuffer, { flag: "wx" });
  return { url: `/uploads/concerns/${filename}`, filePath };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

const DEFAULT_SNAPSHOT = {
  population: 15230,
  services: 25,
  ongoingProjects: 8,
  satisfaction: 95
};

const SNAPSHOT_LIMITS = {
  population: 10000000,
  services: 10000,
  ongoingProjects: 10000,
  satisfaction: 100
};

function normalizeSnapshot(snapshot = {}) {
  const normalized = {};

  for (const [key, fallback] of Object.entries(DEFAULT_SNAPSHOT)) {
    const value = Number(snapshot?.[key]);
    const max = SNAPSHOT_LIMITS[key];

    normalized[key] =
      Number.isInteger(value) && value >= 0 && value <= max
        ? value
        : fallback;
  }

  return normalized;
}

function validateSnapshotInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {
      error: "Snapshot data must be an object."
    };
  }

  const snapshot = {};

  for (const key of Object.keys(DEFAULT_SNAPSHOT)) {
    if (!Object.prototype.hasOwnProperty.call(input, key)) {
      return {
        error: `The ${key} value is required.`
      };
    }

    const rawValue = input[key];
    const value =
      typeof rawValue === "number"
        ? rawValue
        : typeof rawValue === "string" && rawValue.trim()
          ? Number(rawValue)
          : NaN;

    if (
      !Number.isInteger(value) ||
      value < 0 ||
      value > SNAPSHOT_LIMITS[key]
    ) {
      return {
        error: `Enter a whole number for ${key} between 0 and ${SNAPSHOT_LIMITS[key]}.`
      };
    }

    snapshot[key] = value;
  }

  return { snapshot };
}

/* =========================================
   DATABASE
========================================= */

const DEMO_SERVICES = [
  {
    id: "svc-clearance",
    name: "Barangay Clearance",
    category: "Documents",
    office: "Barangay Secretary",
    schedule: "Monday–Friday, 8:00 AM–5:00 PM",
    location: "Barangay Hall, Balut, Tondo, Manila",
    requirements: [
      "Valid government-issued ID",
      "Proof of residency, if requested"
    ],
    steps: [
      "Visit the Barangay Hall and ask for the clearance application form.",
      "Submit the completed form and the documents requested by staff.",
      "Follow the staff instructions for processing and release."
    ]
  },
  {
    id: "svc-complaint",
    name: "Barangay Complaint / Concern",
    category: "Complaints",
    office: "Barangay Office / Authorized Receiving Desk",
    schedule: "Visit the Barangay Hall during office hours",
    location: "Barangay Hall, Balut, Tondo, Manila",
    requirements: [
      "Name and contact information",
      "Clear description of the concern and where it happened"
    ],
    steps: [
      "Submit the concern through the website or at the Barangay Hall.",
      "Provide details that can help staff review the concern.",
      "Keep the reference number to check its status."
    ]
  },
  {
    id: "svc-assistance",
    name: "Assistance Program Inquiry",
    category: "Assistance",
    office: "Social Services Desk",
    schedule: "Confirm the current schedule with the Barangay Hall",
    location: "Barangay Hall, Balut, Tondo, Manila",
    requirements: [
      "Valid government-issued ID",
      "Supporting documents for the assistance requested"
    ],
    steps: [
      "Ask the Social Services Desk which program matches your concern.",
      "Confirm the current eligibility rules and required documents.",
      "Submit the documents requested by the assigned staff."
    ]
  },
  {
    id: "svc-emergency",
    name: "Emergency Assistance",
    category: "Emergency",
    office: "Barangay Emergency Response Desk",
    schedule: "For urgent danger, contact local emergency responders immediately",
    location: "Barangay 135, Balut, Tondo, Manila",
    requirements: [
      "Share your exact location and the type of emergency, if safe to do so"
    ],
    steps: [
      "Move to a safe place if possible.",
      "Contact the appropriate emergency responder or ask someone nearby to call.",
      "Give responders your location and a brief description of the emergency."
    ]
  },
  {
    id: "svc-business",
    name: "Business Permit Inquiry",
    category: "Business",
    office: "Barangay Business Desk",
    schedule: "Monday–Friday, 8:00 AM–5:00 PM",
    location: "Barangay Hall, Balut, Tondo, Manila",
    requirements: [
      "Valid government-issued ID",
      "Business address and business details",
      "Other documents as confirmed by the Barangay Business Desk"
    ],
    steps: [
      "Ask the Barangay Business Desk for the current requirements.",
      "Prepare the documents for your type of business.",
      "Submit the application and follow the instructions from staff."
    ]
  },
  {
    id: "svc-health",
    name: "Health Services",
    category: "Health",
    office: "Barangay Health Services",
    schedule: "Confirm clinic hours and availability with the health center",
    location: "Barangay Health Center, Barangay 135",
    requirements: [
      "Requirements depend on the specific health service"
    ],
    steps: [
      "Contact or visit the health center to confirm its schedule.",
      "Ask what documents or information to bring for the service.",
      "For a medical emergency, contact emergency responders immediately."
    ]
  }
];

const DEMO_PROJECTS = [
  {
    id: "demo-road-rehabilitation",
    name: "Road Rehabilitation Project",
    location: "Purok 1, Barangay 135",
    status: "Ongoing",
    progress: 80,
    start: "Jun 10, 2026",
    target: "Oct 15, 2026",
    description: "Demo project listing for the Barangay 135 website presentation."
  },
  {
    id: "demo-covered-court",
    name: "Covered Court Construction",
    location: "Purok 3, Barangay 135",
    status: "Ongoing",
    progress: 45,
    start: "Aug 1, 2026",
    target: "Dec 30, 2026",
    description: "Demo project listing for the Barangay 135 website presentation."
  },
  {
    id: "demo-drainage",
    name: "Drainage System Improvement",
    location: "Purok 5, Barangay 135",
    status: "In Progress",
    progress: 60,
    start: "Jul 5, 2026",
    target: "Nov 20, 2026",
    description: "Demo project listing for the Barangay 135 website presentation."
  },
  {
    id: "demo-street-lighting",
    name: "Street Lighting Installation",
    location: "Various Puroks, Barangay 135",
    status: "Planning",
    progress: 25,
    start: "Sep 1, 2026",
    target: "Jan 30, 2027",
    description: "Demo project listing for the Barangay 135 website presentation."
  }
];

const EMPTY_DB = {
  barangay: {
    projectName: "Bantay AgapAI — Barangay 135, Balut, Tondo, Manila"
  },
  snapshot: DEFAULT_SNAPSHOT,
  services: DEMO_SERVICES,
  projects: DEMO_PROJECTS,
  announcements: [],
  complaints: [],
  requests: [],
  users: []
};

async function readDb() {
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    const db = JSON.parse(raw);

    if (!db || typeof db !== "object" || Array.isArray(db)) {
      throw new Error("Database must contain a JSON object.");
    }

    return db;
  } catch (error) {
    if (error.code === "ENOENT") {
      await ensureDb();
      return readDb();
    }

    throw error;
  }
}

async function writeDb(db) {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });

  const tempPath =
    `${DB_PATH}.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`;

  try {
    await fs.writeFile(tempPath, JSON.stringify(db, null, 2), "utf8");
    await fs.rename(tempPath, DB_PATH);
  } catch (error) {
    await fs.rm(tempPath, { force: true }).catch(() => {});
    throw error;
  }
}

async function hashPassword(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, key) => {
      if (error) return reject(error);
      resolve(key);
    });
  });
}

async function ensureDb() {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });

  let db;

  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    db = JSON.parse(raw);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw new Error(`Could not read database: ${error.message}`);
    }

    db = structuredClone(EMPTY_DB);
    await writeDb(db);
    console.log("Created data/db.json.");
  }

  if (!db || typeof db !== "object" || Array.isArray(db)) {
    throw new Error("Database file must contain a JSON object.");
  }

  for (const key of [
    "services",
    "projects",
    "announcements",
    "complaints",
    "requests",
    "users"
  ]) {
    if (!Array.isArray(db[key])) {
      db[key] = [];
    }
  }

  // Add demo cards only when the database has no services or projects.
  // Existing records are kept intact.
  if (db.services.length === 0) {
    db.services = structuredClone(DEMO_SERVICES);
    console.log("Loaded demo barangay services.");
  }

  if (db.projects.length === 0) {
    db.projects = structuredClone(DEMO_PROJECTS);
    console.log("Loaded demo barangay projects.");
  }

  if (!db.barangay || typeof db.barangay !== "object") {
    db.barangay = structuredClone(EMPTY_DB.barangay);
  }

  if (!db.barangay.projectName) {
    db.barangay.projectName = EMPTY_DB.barangay.projectName;
  }

  // Keep an existing saved snapshot; add defaults when migrating an older DB.
  db.snapshot = normalizeSnapshot(db.snapshot);

  await writeDb(db);

  /*
   * Initial staff account from .env:
   * ADMIN_EMAIL=admin@example.com
   * ADMIN_PASSWORD=your-password (at least 8 characters)
   */

  const adminEmail = clean(process.env.ADMIN_EMAIL, 160).toLowerCase();
  const adminPassword = String(process.env.ADMIN_PASSWORD || "");

  if (!adminEmail) {
    console.warn("ADMIN_EMAIL was not loaded. Check for .env beside server.js.");
  } else if (!isValidEmail(adminEmail)) {
    console.warn("ADMIN_EMAIL is not a valid email address.");
  }

  if (adminEmail && isValidEmail(adminEmail)) {
    if (adminPassword.length < 8) {
      console.warn("ADMIN_PASSWORD must contain at least 8 characters.");
    } else {
      const adminUser = db.users.find(
        user => clean(user.email, 160).toLowerCase() === adminEmail
      );

      const salt = crypto.randomBytes(16).toString("hex");
      const passwordHash =
        (await hashPassword(adminPassword, salt)).toString("hex");

      if (adminUser) {
        adminUser.name = "Barangay Staff";
        adminUser.email = adminEmail;
        adminUser.role = "staff";
        adminUser.salt = salt;
        adminUser.passwordHash = passwordHash;

        console.log(`Staff account updated for ${adminEmail}.`);
      } else {
        db.users.push({
          id: newId("USR"),
          name: "Barangay Staff",
          email: adminEmail,
          role: "staff",
          salt,
          passwordHash,
          createdAt: new Date().toISOString()
        });

        console.log(`Initial staff account created for ${adminEmail}.`);
      }

      await writeDb(db);
    }
  }
}

/* =========================================
   SESSION / AUTHENTICATION HELPERS
========================================= */

function parseCookies(req) {
  const cookieHeader = req.headers.cookie || "";
  const cookies = {};

  for (const part of cookieHeader.split(";")) {
    const index = part.indexOf("=");

    if (index < 0) continue;

    const key = part.slice(0, index).trim();
    const rawValue = part.slice(index + 1).trim();

    if (!key) continue;

    try {
      cookies[key] = decodeURIComponent(rawValue);
    } catch {
      cookies[key] = rawValue;
    }
  }

  return cookies;
}

function currentUser(req) {
  const token = parseCookies(req)[SESSION_COOKIE];

  if (!token) return null;

  const session = sessions.get(token);

  if (!session || session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }

  return session.user;
}

function setSession(res, user) {
  const token = crypto.randomBytes(32).toString("hex");

  sessions.set(token, {
    user,
    expiresAt: Date.now() + SESSION_TTL_MS
  });

  const secure =
    process.env.NODE_ENV === "production" ? "; Secure" : "";

  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_MS / 1000}${secure}`
  );
}

function clearSession(req, res) {
  const token = parseCookies(req)[SESSION_COOKIE];

  if (token) {
    sessions.delete(token);
  }

  const secure =
    process.env.NODE_ENV === "production" ? "; Secure" : "";

  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`
  );
}

function requireAuth(req, res, next) {
  const user = currentUser(req);

  if (!user) {
    return res.status(401).json({
      error: "Login required."
    });
  }

  req.user = user;
  next();
}

function requireStaff(req, res, next) {
  const user = currentUser(req);

  if (!user || user.role !== "staff") {
    return res.status(401).json({
      error: "Staff login required."
    });
  }

  req.user = user;
  next();
}

/* =========================================
   DEMO BANTAY AGAPAI GUIDE
========================================= */

const DEMO_GUIDE_ANSWERS = {
  greeting:
    "Kumusta! Ako ang Bantay AgapAI demo assistant. Maaari kitang tulungan tungkol sa barangay services, emergency assistance, business permit, health services, complaints, project monitoring, at mga requirements o hakbang.",

  services:
    "Para sa barangay services, tingnan ang Services page ng website para makita ang mga serbisyong nakalista. Piliin ang serbisyong kailangan mo para makita ang detalye at kung may online request form. Para sa impormasyong hindi nakalagay sa website, makipag-ugnayan sa Barangay Hall.",

  emergency:
    "Kung may agarang panganib, sunog, malubhang aksidente, karahasan, o emergency na medikal, tumawag agad sa naaangkop na emergency responder o pumunta sa pinakamalapit na ligtas na lugar. Hindi ako makakatawag ng responders at wala akong kumpirmadong emergency hotline number na maibibigay.",

  businessPermit:
    "Para sa business permit, magtanong muna sa Barangay Hall tungkol sa kasalukuyang requirements at proseso para sa inyong negosyo. Maaaring mag-iba ang mga kailangang dokumento depende sa uri ng negosyo. Dalhin ang mga dokumentong mayroon ka at kumpirmahin ang opisyal na listahan bago mag-apply.",

  health:
    "Para sa health services, tingnan ang Services page kung may nakalistang serbisyong pangkalusugan. Para sa iskedyul, availability, at mga kailangang dalhin, kumpirmahin muna sa Barangay Hall o health center. Kung emergency ito, humingi agad ng tulong sa emergency responder.",

  complaints:
    "Maaari kang magsumite ng reklamo gamit ang Complaints page ng website. Ilagay ang iyong pangalan at malinaw na paglalarawan ng concern. Pagkatapos magsumite, itago ang reference number para masubaybayan ang status. Hindi awtomatikong naaayos o nareresolba ang reklamo sa oras ng pagsusumite.",

  projects:
    "Bisitahin ang Projects page para makita ang mga proyektong nakalista at ang impormasyong ibinigay tungkol sa kanilang status at progreso. Demo information lamang ang maaaring makita rito; para sa pinakabagong detalye, magtanong sa Barangay Hall.",

  requirements:
    "Nagkakaiba ang requirements depende sa serbisyo o dokumentong kailangan. Piliin ang partikular na serbisyo sa Services page para makita ang nakalistang detalye. Kung walang nakasaad na requirements, kumpirmahin muna sa Barangay Hall bago pumunta.",

  fallback:
    "Pasensya na, demo chatbot lang ako at limitado ang mga naka-save kong sagot. Maaari kang magtanong tungkol sa barangay services, emergency assistance, business permit, health services, complaints, project monitoring, o requirements at steps. Para sa ibang detalye, makipag-ugnayan sa Barangay Hall."
};

function getDemoGuideReply(question, history = []) {
  const normalizedQuestion = question
    .toLocaleLowerCase("fil")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  const previousUserMessages = history
    .filter(message => message.role === "user")
    .map(message => message.content.toLocaleLowerCase("fil"))
    .join(" ");

  const text = `${previousUserMessages} ${normalizedQuestion}`;

  if (
    /\b(kumusta|kamusta|hello|hi|hey| magandang araw|magandang umaga|magandang hapon|magandang gabi)\b/i.test(
      normalizedQuestion
    )
  ) {
    return DEMO_GUIDE_ANSWERS.greeting;
  }

  if (
    /\b(emergency|emergencies|sunog|aksidente|aksident(e|o)|nasaktan|nasugatan|dugo|atake|agarang tulong|urgent|panganib|karahasan|medical emergency)\b/i.test(
      text
    )
  ) {
    return DEMO_GUIDE_ANSWERS.emergency;
  }

  if (
    /\b(business permit|permit sa negosyo|pahintulot sa negosyo|negosyo|business|may negosyo)\b/i.test(
      normalizedQuestion
    )
  ) {
    return DEMO_GUIDE_ANSWERS.businessPermit;
  }

  if (
    /\b(health|kalusugan|health center|clinic|klinika|bakuna|vaccine|check up|checkup|medical|gamot|doctor|doktor)\b/i.test(
      text
    )
  ) {
    return DEMO_GUIDE_ANSWERS.health;
  }

  if (
    /\b(complaint|complaints|reklamo|magreklamo|sumbong|concern|hinaing)\b/i.test(
      normalizedQuestion
    )
  ) {
    return DEMO_GUIDE_ANSWERS.complaints;
  }

  if (
    /\b(project|projects|proyekto|monitor|monitoring|progress|progreso|status ng proyekto)\b/i.test(
      normalizedQuestion
    )
  ) {
    return DEMO_GUIDE_ANSWERS.projects;
  }

  if (
    /\b(requirement|requirements|kailangan dalhin|mga kailangan|papeles|dokumento|documents|paano mag apply|paano kumuha|steps|hakbang|proseso)\b/i.test(
      text
    )
  ) {
    return DEMO_GUIDE_ANSWERS.requirements;
  }

  if (
    /\b(service|services|serbisyo|serbisyong|tulong|barangay service|mga serbisyo)\b/i.test(
      normalizedQuestion
    )
  ) {
    return DEMO_GUIDE_ANSWERS.services;
  }

  return DEMO_GUIDE_ANSWERS.fallback;
}

/* =========================================
   AUTHENTICATION ROUTES
========================================= */

async function registerResident(req, res) {
  const name = clean(req.body?.name, 100);
  const email = clean(req.body?.email, 160).toLowerCase();
  const password = String(req.body?.password || "");

  if (
    !name ||
    !isValidEmail(email) ||
    password.length < 8 ||
    password.length > 200
  ) {
    return res.status(400).json({
      error:
        "Enter your name, a valid email, and a password of 8–200 characters."
    });
  }

  const db = await readDb();

  if (db.users.some(user => user.email === email)) {
    return res.status(409).json({
      error: "An account with that email already exists."
    });
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash =
    (await hashPassword(password, salt)).toString("hex");

  const user = {
    id: newId("USR"),
    name,
    email,
    role: "resident",
    salt,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  db.users.push(user);
  await writeDb(db);

  setSession(res, publicUser(user));

  return res.status(201).json({
    user: publicUser(user),
    message: "Account created successfully."
  });
}

async function loginUser(req, res) {
  const email = clean(req.body?.email, 160).toLowerCase();
  const password = String(req.body?.password || "");
  const configuredAdminEmail = clean(process.env.ADMIN_EMAIL, 160).toLowerCase();

  const requestedRole =
    req.body?.role === "staff" ||
    (!req.body?.role && email === configuredAdminEmail)
      ? "staff"
      : "resident";

  if (!isValidEmail(email) || !password) {
    return res.status(400).json({
      error: "Enter a valid email and password."
    });
  }

  const db = await readDb();

  const user = db.users.find(
    item =>
      clean(item.email, 160).toLowerCase() === email &&
      item.role === requestedRole
  );

  if (!user || !user.salt || !user.passwordHash) {
    return res.status(401).json({
      error: "Invalid email or password."
    });
  }

  const candidate = await hashPassword(password, user.salt);
  const stored = Buffer.from(user.passwordHash, "hex");

  if (
    candidate.length !== stored.length ||
    !crypto.timingSafeEqual(candidate, stored)
  ) {
    return res.status(401).json({
      error: "Invalid email or password."
    });
  }

  const safeUser = publicUser(user);
  setSession(res, safeUser);

  return res.json({
    user: safeUser,
    message: "Login successful."
  });
}

app.post("/api/auth/register", asyncRoute(registerResident));
app.post("/api/auth/login", asyncRoute(loginUser));

app.get("/api/auth/me", (req, res) => {
  res.json({
    user: currentUser(req)
  });
});

app.post("/api/auth/logout", (req, res) => {
  clearSession(req, res);

  res.json({
    message: "Logged out."
  });
});

/* Compatibility aliases for resident-specific auth URLs. */

app.post("/api/resident/register", asyncRoute(registerResident));

app.post(
  "/api/resident/login",
  asyncRoute(async (req, res) => {
    req.body = {
      ...req.body,
      role: "resident"
    };

    return loginUser(req, res);
  })
);

app.get("/api/resident/me", (req, res) => {
  const user = currentUser(req);

  res.json({
    user: user?.role === "resident" ? user : null
  });
});

app.post("/api/resident/logout", (req, res) => {
  clearSession(req, res);

  res.json({
    message: "Logged out."
  });
});

/* =========================================
   ADMIN AUTHORIZATION
========================================= */

app.use("/api/admin", requireStaff);

/* =========================================
   PUBLIC CONFIGURATION AND DATA
========================================= */

app.get(
  "/api/config",
  asyncRoute(async (_req, res) => {
    const db = await readDb();

    res.json({
      barangay: db.barangay,
      snapshot: normalizeSnapshot(db.snapshot),
      aiMode: "demo"
    });
  })
);

app.get(
  "/api/services",
  asyncRoute(async (_req, res) => {
    const db = await readDb();
    res.json(db.services);
  })
);

app.get(
  "/api/projects",
  asyncRoute(async (_req, res) => {
    const db = await readDb();
    res.json(db.projects);
  })
);

app.get(
  "/api/announcements",
  asyncRoute(async (_req, res) => {
    const db = await readDb();
    res.json(db.announcements.slice().sort((a, b) => {
      return new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0);
    }));
  })
);

app.get(
  "/api/projects/:id",
  asyncRoute(async (req, res) => {
    const db = await readDb();
    const project = db.projects.find(
      item => item.id === req.params.id
    );

    if (!project) {
      return res.status(404).json({
        error: "Project not found."
      });
    }

    return res.json(project);
  })
);

/* =========================================
   DEMO BARANGAY GUIDE
========================================= */

app.post(
  "/api/guide",
  asyncRoute(async (req, res) => {
    const question = clean(req.body?.question, 1000);

    if (!question) {
      return res.status(400).json({
        error: "Please enter a question."
      });
    }

    const history = Array.isArray(req.body?.history)
      ? req.body.history
          .filter(
            message =>
              message &&
              ["user", "assistant"].includes(message.role) &&
              typeof message.content === "string"
          )
          .slice(-12)
          .map(message => ({
            role: message.role,
            content: clean(message.content, 1000)
          }))
      : [];

    const reply = getDemoGuideReply(question, history);

    return res.json({
      mode: "demo",
      reply
    });
  })
);

/* =========================================
   COMPLAINT SUBMISSION
========================================= */

app.post(
  "/api/complaints",
  asyncRoute(async (req, res) => {
    const name = clean(req.body?.name, 100);
    const contact = clean(req.body?.contact, 120);
    const category = clean(req.body?.category, 80);
    const description = clean(req.body?.description, 2000);
    const allowedCategories = [
      "General Concern",
      "Lost & Found",
      "Missing Pet",
      "Missing Person",
      "Noise / Community",
      "Environment",
      "Safety",
      "Other"
    ];

    if (!name || !description) {
      return res.status(400).json({
        error: "Name and description are required."
      });
    }

    if (category && !allowedCategories.includes(category)) {
      return res.status(400).json({ error: "Choose a valid concern category." });
    }

    const db = await readDb();

    let uploadedImage = null;
    if (req.body?.imageData) {
      uploadedImage = await saveConcernImageData(req.body.imageData);
    }

    const complaint = {
      id: newId("CMP"),
      name,
      contact,
      category: category || "General Concern",
      description,
      status: "Submitted",
      createdAt: new Date().toISOString()
    };

    if (uploadedImage) complaint.image = uploadedImage.url;

    db.complaints.unshift(complaint);
    try {
      await writeDb(db);
    } catch (error) {
      if (uploadedImage) await fs.rm(uploadedImage.filePath, { force: true }).catch(() => {});
      throw error;
    }

    return res.status(201).json({
      message: "Complaint submitted successfully.",
      reference: complaint.id,
      complaint
    });
  })
);

/* =========================================
   SERVICE REQUEST SUBMISSION
========================================= */

app.post(
  "/api/requests",
  asyncRoute(async (req, res) => {
    const name = clean(req.body?.name, 100);
    const contact = clean(req.body?.contact, 120);
    const serviceId = clean(req.body?.serviceId, 80);
    const purpose = clean(req.body?.purpose, 500);

    if (!name || !serviceId) {
      return res.status(400).json({
        error: "Name and service are required."
      });
    }

    const db = await readDb();
    const service = db.services.find(item => item.id === serviceId);

    if (!service) {
      return res.status(404).json({
        error: "Service not found."
      });
    }

    const request = {
      id: newId("REQ"),
      name,
      contact,
      serviceId,
      serviceName: service.name,
      purpose,
      status: "Submitted",
      createdAt: new Date().toISOString()
    };

    db.requests.unshift(request);
    await writeDb(db);

    return res.status(201).json({
      message: "Service request submitted successfully.",
      reference: request.id,
      request
    });
  })
);

/* =========================================
   REQUEST / COMPLAINT TRACKING
========================================= */

app.get(
  "/api/track/:id",
  asyncRoute(async (req, res) => {
    const db = await readDb();
    const id = clean(req.params.id, 100);

    const complaint = db.complaints.find(
      item => item.id === id
    );

    if (complaint) {
      return res.json({
        type: "complaint",
        item: complaint
      });
    }

    const request = db.requests.find(
      item => item.id === id
    );

    if (request) {
      return res.json({
        type: "request",
        item: request
      });
    }

    return res.status(404).json({
      error: "Reference number not found."
    });
  })
);

/* =========================================
   ADMIN DASHBOARD API
========================================= */

app.get(
  "/api/admin/summary",
  asyncRoute(async (_req, res) => {
    const db = await readDb();

    res.json({
      projects: db.projects.length,
      complaints: db.complaints.length,
      requests: db.requests.length,
      pendingComplaints: db.complaints.filter(
        item => item.status !== "Resolved"
      ).length,
      pendingRequests: db.requests.filter(
        item => item.status !== "Completed"
      ).length
    });
  })
);

app.get(
  "/api/admin/snapshot",
  asyncRoute(async (_req, res) => {
    const db = await readDb();
    return res.json(normalizeSnapshot(db.snapshot));
  })
);

app.patch(
  "/api/admin/snapshot",
  asyncRoute(async (req, res) => {
    const result = validateSnapshotInput(req.body);

    if (result.error) {
      return res.status(400).json({
        error: result.error
      });
    }

    const db = await readDb();
    db.snapshot = result.snapshot;
    await writeDb(db);

    return res.json(db.snapshot);
  })
);

app.get(
  "/api/admin/complaints",
  asyncRoute(async (_req, res) => {
    const db = await readDb();
    res.json(db.complaints);
  })
);

app.get(
  "/api/admin/requests",
  asyncRoute(async (_req, res) => {
    const db = await readDb();
    res.json(db.requests);
  })
);

app.get(
  "/api/admin/projects",
  asyncRoute(async (_req, res) => {
    const db = await readDb();
    res.json(db.projects);
  })
);

app.post(
  "/api/admin/announcements",
  asyncRoute(async (req, res) => {
    const type = clean(req.body?.type, 40);
    const allowedTypes = ["lost-found", "missing-pet", "missing-person"];
    const announcement = {
      id: newId("ANN"),
      type,
      title: clean(req.body?.title, 120),
      location: clean(req.body?.location, 180),
      date: clean(req.body?.date, 30),
      description: clean(req.body?.description, 1200),
      reporterName: clean(req.body?.reporterName, 100),
      contact: clean(req.body?.contact, 100),
      status: "Missing",
      createdAt: new Date().toISOString(),
      createdBy: req.user.id
    };

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ error: "Choose a valid announcement type." });
    }
    if (!announcement.title || !announcement.location || !announcement.date || !announcement.description) {
      return res.status(400).json({ error: "Type, title, location, date, and description are required." });
    }

    let uploadedImage = null;
    if (req.body?.imageData) {
      uploadedImage = await saveAnnouncementImageData(req.body.imageData);
      announcement.image = uploadedImage.url;
    }

    const db = await readDb();
    db.announcements.unshift(announcement);
    try {
      await writeDb(db);
    } catch (error) {
      if (uploadedImage) await fs.rm(uploadedImage.filePath, { force: true }).catch(() => {});
      throw error;
    }

    return res.status(201).json(announcement);
  })
);

app.put(
  "/api/admin/announcements/:id",
  asyncRoute(async (req, res) => {
    const db = await readDb();
    const announcement = db.announcements.find(item => item.id === req.params.id);

    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found." });
    }

    const type = clean(req.body?.type, 40);
    const allowedTypes = ["lost-found", "missing-pet", "missing-person"];
    const updatedFields = {
      type,
      title: clean(req.body?.title, 120),
      location: clean(req.body?.location, 180),
      date: clean(req.body?.date, 30),
      description: clean(req.body?.description, 1200),
      reporterName: clean(req.body?.reporterName, 100),
      contact: clean(req.body?.contact, 100)
    };

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ error: "Choose a valid announcement type." });
    }
    if (!updatedFields.title || !updatedFields.location || !updatedFields.date || !updatedFields.description) {
      return res.status(400).json({ error: "Type, title, location, date, and description are required." });
    }

    let uploadedImage = null;
    if (req.body?.imageData) {
      uploadedImage = await saveAnnouncementImageData(req.body.imageData);
    }

    const previousImage = announcement.image;
    const previousType = announcement.type;
    Object.assign(announcement, updatedFields, { updatedAt: new Date().toISOString() });
    if (type !== "lost-found" && previousType === "lost-found") {
      announcement.status = "Missing";
      delete announcement.foundAt;
    }
    if (uploadedImage) announcement.image = uploadedImage.url;

    try {
      await writeDb(db);
    } catch (error) {
      if (uploadedImage) await fs.rm(uploadedImage.filePath, { force: true }).catch(() => {});
      throw error;
    }

    if (uploadedImage && previousImage) {
      await removeAnnouncementImage(previousImage).catch(error => {
        console.warn("Could not remove replaced announcement photo:", error);
      });
    }

    return res.json(announcement);
  })
);

app.patch(
  "/api/admin/announcements/:id/found",
  asyncRoute(async (req, res) => {
    const db = await readDb();
    const announcement = db.announcements.find(item => item.id === req.params.id);

    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found." });
    }
    if (!["lost-found", "missing-pet", "missing-person"].includes(announcement.type)) {
      return res.status(400).json({ error: "This announcement type cannot be marked as found." });
    }

    announcement.status = "Found";
    announcement.foundAt = new Date().toISOString();
    await writeDb(db);
    return res.json(announcement);
  })
);

app.patch(
  "/api/admin/announcements/:id/unmark-found",
  asyncRoute(async (req, res) => {
    const db = await readDb();
    const announcement = db.announcements.find(item => item.id === req.params.id);

    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found." });
    }
    if (!["lost-found", "missing-pet", "missing-person"].includes(announcement.type)) {
      return res.status(400).json({ error: "This announcement type cannot be changed back to missing." });
    }

    announcement.status = "Missing";
    delete announcement.foundAt;
    await writeDb(db);
    return res.json(announcement);
  })
);

app.post(
  "/api/admin/projects",
  asyncRoute(async (req, res) => {
    const db = await readDb();

    const rawProgress = Number(req.body?.progress);
    const progress = Number.isFinite(rawProgress)
      ? Math.max(0, Math.min(100, rawProgress))
      : 0;

    const project = {
      id: newId("PRJ"),
      name: clean(req.body?.name, 120),
      location: clean(req.body?.location, 160),
      status: clean(req.body?.status, 40) || "Planning",
      progress,
      start: clean(req.body?.start, 60),
      target: clean(req.body?.target, 60),
      description: clean(req.body?.description, 500)
    };

    if (!project.name || !project.location) {
      return res.status(400).json({
        error: "Project name and location are required."
      });
    }

    let uploadedImage = null;
    if (req.body?.imageData !== undefined && req.body.imageData !== "") {
      uploadedImage = await saveProjectImageData(req.body.imageData);
      project.image = uploadedImage.url;
    }

    db.projects.push(project);
    try {
      await writeDb(db);
    } catch (error) {
      if (uploadedImage) {
        await fs.rm(uploadedImage.filePath, { force: true }).catch(() => {});
      }
      throw error;
    }

    return res.status(201).json(project);
  })
);

app.patch(
  "/api/admin/projects/:id",
  asyncRoute(async (req, res) => {
    const db = await readDb();
    const project = db.projects.find(
      item => item.id === req.params.id
    );

    if (!project) {
      return res.status(404).json({
        error: "Project not found."
      });
    }

    if (req.body?.name !== undefined) {
      project.name = clean(req.body.name, 120);
    }

    if (req.body?.location !== undefined) {
      project.location = clean(req.body.location, 160);
    }

    if (req.body?.status !== undefined) {
      project.status = clean(req.body.status, 40);
    }

    if (req.body?.progress !== undefined) {
      const rawProgress = Number(req.body.progress);
      project.progress = Number.isFinite(rawProgress)
        ? Math.max(0, Math.min(100, rawProgress))
        : 0;
    }

    if (req.body?.start !== undefined) {
      project.start = clean(req.body.start, 60);
    }

    if (req.body?.target !== undefined) {
      project.target = clean(req.body.target, 60);
    }

    if (req.body?.description !== undefined) {
      project.description = clean(req.body.description, 500);
    }

    let uploadedImage = null;
    if (req.body?.imageData !== undefined && req.body.imageData !== "") {
      uploadedImage = await saveProjectImageData(req.body.imageData);
      const previousImage = project.image;
      project.image = uploadedImage.url;

      try {
        await writeDb(db);
      } catch (error) {
        project.image = previousImage;
        await fs.rm(uploadedImage.filePath, { force: true }).catch(() => {});
        throw error;
      }

      await removeProjectImage(previousImage).catch(() => {});
    } else {
      await writeDb(db);
    }
    return res.json(project);
  })
);

app.patch(
  "/api/admin/complaints/:id",
  asyncRoute(async (req, res) => {
    const db = await readDb();
    const item = db.complaints.find(
      entry => entry.id === req.params.id
    );

    if (!item) {
      return res.status(404).json({
        error: "Complaint not found."
      });
    }

    const allowedStatuses = [
      "Submitted",
      "Under Review",
      "For Action",
      "Resolved"
    ];

    const status = clean(req.body?.status, 40);

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid complaint status."
      });
    }

    item.status = status;
    await writeDb(db);

    return res.json(item);
  })
);

app.patch(
  "/api/admin/requests/:id",
  asyncRoute(async (req, res) => {
    const db = await readDb();
    const item = db.requests.find(
      entry => entry.id === req.params.id
    );

    if (!item) {
      return res.status(404).json({
        error: "Request not found."
      });
    }

    const allowedStatuses = [
      "Submitted",
      "Processing",
      "Ready for Release",
      "Completed"
    ];

    const status = clean(req.body?.status, 40);

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid request status."
      });
    }

    item.status = status;
    await writeDb(db);

    return res.json(item);
  })
);

/* =========================================
   UNKNOWN API ROUTES
========================================= */

app.use("/api", (_req, res) => {
  res.status(404).json({
    error: "API endpoint not found."
  });
});

/* =========================================
   WEBSITE FALLBACK
========================================= */

app.get(/.*/, (_req, res, next) => {
  res.sendFile(path.join(PUBLIC_PATH, "index.html"), error => {
    if (error) next(error);
  });
});

/* =========================================
   ERROR HANDLER
========================================= */

app.use((error, _req, res, _next) => {
  console.error("Server error:", error);

  if (res.headersSent) return;

  if (
    error instanceof SyntaxError &&
    error.status === 400 &&
    "body" in error
  ) {
    return res.status(400).json({
      error: "Invalid JSON request body."
    });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({
      error: "The request is too large. Choose a smaller photo."
    });
  }

  const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 600
    ? error.status
    : 500;

  return res.status(status).json({
    error: status === 500
      ? "An unexpected server error occurred."
      : error.message
  });
});

/* =========================================
   START SERVER
========================================= */

ensureDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `Bantay AgapAI running at http://localhost:${PORT}`
      );
    });
  })
  .catch(error => {
    console.error("Database initialization failed:", error);
    process.exit(1);
  });
