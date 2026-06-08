import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import nodemailer from "nodemailer";

// Create Express application
const app = express();
const PORT = 3000;

// Enable large bodies for file attachments
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// ---------------------------------------------------
// SECURITY & SIGNATURE-BASED JWT SYSTEM
// ---------------------------------------------------
const JWT_SECRET = process.env.JWT_SECRET || "futuristic-saas-agency-token-key-2026";

// Function to generate a secure token
function generateToken(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 })).toString("base64url");
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${encodedPayload}`)
    .digest("base64url");
  return `${header}.${encodedPayload}.${signature}`;
}

// Function to verify and decode token
function verifyToken(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, encodedPayload, signature] = parts;
    const computedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${encodedPayload}`)
      .digest("base64url");
    if (signature !== computedSignature) return null;
    const decodedPayload = JSON.parse(Buffer.from(encodedPayload, "base-64url" as any).toString());
    if (Date.now() > decodedPayload.exp) return null; // Expired
    return decodedPayload;
  } catch (error) {
    return null;
  }
}

// Password hashing utility using SHA-256 with static salt
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + JWT_SECRET).digest("hex");
}

// ---------------------------------------------------
// DATABASE STATE ENGINE (FILE-PERSISTED)
// ---------------------------------------------------
const DB_FILE = path.join(process.cwd(), "agency_database.json");

interface DBState {
  users: any[];
  projects: any[];
  messages: any[];
  notifications: any[];
}

const DEFAULT_DB_STATE: DBState = {
  users: [
    {
      id: "admin-rohit",
      name: "Rohit Kumar (Admin)",
      email: "rohit21oc@gmail.com",
      password: hashPassword("Rohit@0202"),
      role: "ADMIN",
      provider: "LOCAL",
      createdAt: new Date().toISOString()
    },
    {
      id: "admin-1",
      name: "Global Administrator",
      email: "admin@agency.com",
      password: hashPassword("admin123"),
      role: "ADMIN",
      provider: "LOCAL",
      createdAt: new Date().toISOString()
    },
    {
      id: "demo-user",
      name: "Jane Doe",
      email: "client@company.com",
      password: hashPassword("client123"),
      role: "USER",
      provider: "LOCAL",
      createdAt: new Date().toISOString()
    }
  ],
  projects: [
    {
      id: "proj-1",
      userId: "demo-user",
      clientName: "Jane Doe",
      clientEmail: "client@company.com",
      companyName: "Cosmic Enterprises",
      phone: "+1 (555) 321-7890",
      projectType: "Website",
      budget: "$15,000",
      deadline: "3 Months",
      description: "We need a futuristic, high-converting React application with an immersive user experience, glassmorphic headers, beautiful motion sliders, and seamless customer intake pathways.",
      status: "In Progress",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      aiAnalysis: "### Architecture & Technology Approach\n- **Frontend**: React 19 + Tailwind CSS + Framer Motion\n- **Backend**: Node.js + Express\n- **Host**: Cloud Run with Nginx optimization\n\n### Strategic Roadmaps\n- **Month 1**: Design mockups, vector artwork integration, layout wireframes.\n- **Month 2**: Component integration, interactive form states.\n- **Month 3**: Sandbox QA, cross-device testing, SEO indexing, and direct production release.",
      adminNotes: "Admin: Welcome to our agency! Your design phase is complete and developers have begun initial coding."
    }
  ],
  messages: [
    {
      id: "msg-1",
      name: "Alice Vance",
      email: "alice@vancetech.com",
      subject: "Custom ERP Query",
      message: "Hello, looking to build an internal ERP system for our logistics company. Wondering if you have experience with shipping API integrations?",
      createdAt: new Date().toISOString()
    }
  ],
  notifications: [
    {
      id: "notif-1",
      userId: "demo-user",
      title: "Project Request Received",
      message: "Your project 'Cosmic Enterprises HQ' request has been securely recorded. Our architects are looking over specifications.",
      readStatus: false,
      createdAt: new Date().toISOString()
    }
  ]
};

function readDB(): DBState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading database file, using in-memory state override", err);
  }
  return DEFAULT_DB_STATE;
}

function writeDB(data: DBState) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database file", err);
  }
}

// In-memory shadow reference for instant latency access
let db = readDB();

// Ensure the required admin user is always configured
const rohitAdminExists = db.users.some((u) => u.email === "rohit21oc@gmail.com");
if (!rohitAdminExists) {
  db.users.push({
    id: "admin-rohit",
    name: "Rohit Kumar (Admin)",
    email: "rohit21oc@gmail.com",
    password: hashPassword("Rohit@0202"),
    role: "ADMIN",
    provider: "LOCAL",
    createdAt: new Date().toISOString()
  });
  writeDB(db);
} else {
  const rohitUser = db.users.find((u) => u.email === "rohit21oc@gmail.com");
  if (rohitUser) {
    rohitUser.role = "ADMIN";
    rohitUser.password = hashPassword("Rohit@0202");
    writeDB(db);
  }
}

// Initialize DB file if missing
if (!fs.existsSync(DB_FILE)) {
  writeDB(DEFAULT_DB_STATE);
}

// ---------------------------------------------------
// SERVICE-SIDE LAZY GEMINI CALLS
// ---------------------------------------------------
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: apiKey
      });
    }
  }
  return aiClient;
}

// AI-powered support chatbot and requirements analyzer simulation fallbacks
async function queryGeminiConsultant(prompt: string, contextSystem: string): Promise<string> {
  const client = getGeminiClient();
  if (client) {
    try {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: contextSystem,
          temperature: 0.7
        }
      });
      return response.text || "I was unable to formulate a response at this moment. Please ask our agent live.";
    } catch (e: any) {
      console.error("Gemini API query error:", e);
      return `[Gemini API: ${e.message}]. Using local architect backup.\n\nWe recommend a classic full-stack path utilizing Tailwind, Fast API, and custom middleware controls. Let's start the blueprint in our discuss thread!`;
    }
  }

  // Fallback response when API key is missing
  return `### Nexus Strategic Software Proposal (Simulated)
Thank you for providing parameters! Here is our high-level architecture:
- **Core Technology Stack**: React 19 / Angular 16, coupled with Tailwind CSS for glassmorphic elements, Node Express database caching.
- **Milestones**: Complete standard wireframing under 3 weeks. Core component release by week 6. Direct server-side launch on secure Cloud Run infrastructure.
- **Assurances**: Complete JWT-token security, Bcrypt password grids, and robust CORS validations.

*To activate live, real-world Gemini AI suggestions, configure the **GEMINI_API_KEY** secret inside the Settings panel.*`;
}

// ---------------------------------------------------
// AUTHENTICATION INTERCEPTORS & ROUTE GUARD MIDDLEWARES
// ---------------------------------------------------
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access token missing from Authorization header" });

  const payload = verifyToken(token);
  if (!payload) return res.status(403).json({ error: "Access token is invalid or has expired" });

  req.user = payload;
  next();
}

function requireAdmin(req: any, res: any, next: any) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Access restriction: Requires administrative privileges" });
  }
  next();
}

// ---------------------------------------------------
// API ROUTES
// ---------------------------------------------------

// Public register
app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing required registration parameters" });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const userExists = db.users.some((u) => u.email === normalizedEmail);
  if (userExists) {
    return res.status(400).json({ error: "An account has already been registered with this email address" });
  }

  const newUser = {
    id: "user-" + crypto.randomUUID(),
    name,
    email: normalizedEmail,
    password: hashPassword(password),
    role: "USER",
    provider: "LOCAL",
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDB(db);

  const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name });
  res.status(201).json({
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, provider: newUser.provider }
  });
});

// Public login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = db.users.find((u) => u.email === normalizedEmail);

  if (!user || user.password !== hashPassword(password)) {
    return res.status(400).json({ error: "Incorrect email address or password credentials" });
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name });
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, provider: user.provider }
  });
});

// Google Sign-In intake route
app.post("/api/auth/google", (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: "Missing Google account validation parameters" });
  }

  const normalizedEmail = email.toLowerCase().trim();
  let user = db.users.find((u) => u.email === normalizedEmail);

  // CRITICAL SECURITY GUARD: Block any unverified login attempt targeting an ADMIN profile
  if (user && user.role === "ADMIN") {
    return res.status(403).json({ 
      error: "Administrative accounts are highly protected and cannot be accessed via simulated Google sign-in. Please use your secure Workspace Email and Access Code." 
    });
  }

  if (!user) {
    // Auto-create user for Google provider
    user = {
      id: "user-" + crypto.randomUUID(),
      name,
      email: normalizedEmail,
      password: hashPassword(crypto.randomBytes(16).toString("hex")),
      role: "USER",
      provider: "GOOGLE",
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
    writeDB(db);
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name });
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, provider: user.provider }
  });
});

// ---------------------------------------------------
// HIGH-SECURITY PASSWORD RECOVERY ENGINE (OTP)
// ---------------------------------------------------

interface OTPRecord {
  otp: string;
  expiresAt: number;
}
const activeOTPs = new Map<string, OTPRecord>();

async function sendOTPEmail(email: string, otp: string): Promise<{ success: boolean; simulated: boolean; info?: any }> {
  const emailUser = process.env.SMTP_EMAIL || process.env.GMAIL_USER;
  const emailPass = process.env.SMTP_PASSWORD || process.env.GMAIL_PASS;
  
  if (!emailUser || !emailPass) {
    console.log(`[SMTP SIMULATION] Desired OTP ${otp} for account ${email}. (Include SMTP_EMAIL & SMTP_PASSWORD in workspace env secrets for live email dispatch)`);
    return { success: true, simulated: true };
  }
  
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
    
    const mailOptions = {
      from: `"WebWarp Workspace Desk" <${emailUser}>`,
      to: email,
      subject: `WebWarp Verification Key: ${otp}`,
      text: `Your WebWarp verification entry code is: ${otp}\n\nThis OTP is valid for 10 minutes. Please complete verification on our solution portal.\n\nWarm regards,\nWebWarp Technical Desk`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f1f5f9; padding: 30px; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid rgba(255, 255, 255, 0.1);">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #06b6d4; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.05em;">WEBWARP</h2>
            <p style="color: #94a3b8; font-size: 11px; margin: 4px 0 0 0; text-transform: uppercase; font-family: monospace;">Agency Solutions Desk</p>
          </div>
          <div style="background-color: rgba(255,255,255,0.03); padding: 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
            <p style="font-size: 14px; margin-top: 0; color: #cbd5e1;">Greeting Client,</p>
            <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">A password recovery or workspace access credentials check has been initiated for your profile. Please use the high-security verification passcode below to authorize your session:</p>
            <div style="text-align: center; margin: 25px 0;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 0.15em; color: #22d3ee; background-color: rgba(6, 182, 212, 0.1); border: 1px dashed rgba(6, 182, 212, 0.3); padding: 10px 25px; border-radius: 8px; display: inline-block; font-family: monospace;">${otp}</span>
            </div>
            <p style="font-size: 11px; color: #64748b; line-height: 1.4; margin-bottom: 0;">This cryptographic code expires in 10 minutes. If you did not initiate this workspace authentication, you can safely ignore this email.</p>
          </div>
          <p style="text-align: center; font-size: 10px; color: #475569; margin-top: 25px;">WebWarp Technology Pvt Ltd • 2026 Live Secure Server</p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP SUCCESS] Mail delivered to ${email}: ${info.messageId}`);
    return { success: true, simulated: false, info };
  } catch (error: any) {
    console.error(`[SMTP ERROR] NodeMailer failed to send, falling back to simulated output:`, error);
    return { success: false, simulated: true, info: error.message };
  }
}

// Request password reset OTP
app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Please enter your registered workspace email address." });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = db.users.find((u) => u.email === normalizedEmail);
  if (!user) {
    return res.status(404).json({ error: "This email address is not registered in our solution workspace." });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  activeOTPs.set(normalizedEmail, {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
  });

  const mailResult = await sendOTPEmail(normalizedEmail, otp);

  res.json({
    success: true,
    message: mailResult.simulated
      ? "Password recovery OTP generated! (Set SMTP_EMAIL & SMTP_PASSWORD to send live emails). COPY simulated OTP:"
      : "A high-security verification OTP has been emailed to your Gmail address.",
    simulated: mailResult.simulated,
    otp: mailResult.simulated ? otp : undefined // only expose code if SMTP is unconfigured for local testing comfort
  });
});

// Verify OTP & Reset password
app.post("/api/auth/reset-password", (req, res) => {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password) {
    return res.status(400).json({ error: "All fields (email, otp, and new secure password) are required." });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Your new password must be at least 6 characters in length." });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const record = activeOTPs.get(normalizedEmail);

  if (!record) {
    return res.status(400).json({ error: "No active verification request found for this email address." });
  }

  if (Date.now() > record.expiresAt) {
    activeOTPs.delete(normalizedEmail);
    return res.status(400).json({ error: "Your verification code has expired (10 minutes limit). Please request a new OTP." });
  }

  if (record.otp !== otp.trim()) {
    return res.status(400).json({ error: "The entered verification OTP code is incorrect." });
  }

  const user = db.users.find((u) => u.email === normalizedEmail);
  if (!user) {
    return res.status(404).json({ error: "Associate user account not located." });
  }

  // Update password
  user.password = hashPassword(password);
  writeDB(db);

  // Clear OTP
  activeOTPs.delete(normalizedEmail);

  res.json({
    success: true,
    message: "Your account password has been updated securely. You can now use your email and new password to log in!"
  });
});

// Verify token check
app.get("/api/auth/verify", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Authorization required" });

  const payload = verifyToken(token);
  if (!payload) return res.status(403).json({ error: "Invalid token session" });

  res.json({
    user: { id: payload.id, email: payload.email, role: payload.role, name: payload.name }
  });
});

// GET user info or database metrics for ADMIN only
app.get("/api/users", authenticateToken, requireAdmin, (req, res) => {
  const safeUsers = db.users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    provider: u.provider,
    createdAt: u.createdAt
  }));
  res.json(safeUsers);
});

// ---------------------------------------------------
// PROJECT REQUEST MANAGEMENT
// ---------------------------------------------------

// List client project initiatives
app.get("/api/projects", authenticateToken, (req: any, res) => {
  const userRole = req.user.role;
  const userId = req.user.id;

  if (userRole === "ADMIN") {
    res.json(db.projects);
  } else {
    const userProjects = db.projects.filter((p) => p.userId === userId);
    res.json(userProjects);
  }
});

// Create project request and initiate background AI consultation
app.post("/api/projects", authenticateToken, async (req: any, res) => {
  const {
    companyName,
    phone,
    projectType,
    budget,
    deadline,
    description,
    attachmentName,
    attachmentData
  } = req.body;

  if (!projectType || !budget || !deadline || !description) {
    return res.status(400).json({ error: "Please enter all required specifications fields" });
  }

  const newProject = {
    id: "proj-" + crypto.randomUUID(),
    userId: req.user.id,
    clientName: req.user.name,
    clientEmail: req.user.email,
    companyName: companyName || "Independent Client",
    phone: phone || "Not Provided",
    projectType,
    budget,
    deadline,
    description,
    status: "Pending",
    attachmentName: attachmentName || undefined,
    attachmentData: attachmentData || undefined,
    createdAt: new Date().toISOString(),
    aiAnalysis: "Consultant algorithms are analyzing your project... Refresh page to retrieve estimation breakdown."
  };

  db.projects.push(newProject);

  // Send automatic workspace notification to Admin
  db.notifications.push({
    id: "notif-" + crypto.randomUUID(),
    userId: "ADMIN",
    title: `New ${projectType} Request`,
    message: `${req.user.name} submitted a project with a budget of ${budget}.`,
    readStatus: false,
    createdAt: new Date().toISOString()
  });

  writeDB(db);

  // Reply instantly
  res.status(201).json(newProject);

  // Asynchronously execute Gemini API calculation
  const systemPrompt = `You are a professional solution architect and estimate analyzer for futuristic SaaS applications. You analyze custom client requests and output formatted markdown outlines describing solutions engineering approach, milestones, budget distribution advice, and hazard mitigations. Do not exceed 400 words. Keep it elegant, structured, and realistic.`;
  const userMessage = `Create an architect proposal for:
Type: ${projectType}
Client: ${req.user.name} (${companyName || "N/A"})
Budget: ${budget}
Deadline/Duration: ${deadline}
Requirements description: ${description}`;

  queryGeminiConsultant(userMessage, systemPrompt)
    .then((markdown) => {
      const liveDB = readDB();
      const projIndex = liveDB.projects.findIndex((p) => p.id === newProject.id);
      if (projIndex !== -1) {
        liveDB.projects[projIndex].aiAnalysis = markdown;
        
        liveDB.notifications.push({
          id: "notif-" + crypto.randomUUID(),
          userId: req.user.id,
          title: "AI Project Proposal Generated",
          message: `Our smart advisor has structured milestones and stack architecture choices for your proposal.`,
          readStatus: false,
          createdAt: new Date().toISOString()
        });

        db = liveDB;
        writeDB(liveDB);
      }
    })
    .catch((err) => {
      console.error("AI Async requirement mapping failed:", err);
    });
});

// Update project request status (ADMIN only)
app.patch("/api/projects/:id/status", authenticateToken, requireAdmin, (req, res) => {
  const { status, adminNotes } = req.body;
  if (!status) {
    return res.status(400).json({ error: "A valid status transition must be provided" });
  }

  const projIndex = db.projects.findIndex((p) => p.id === req.params.id);
  if (projIndex === -1) {
    return res.status(404).json({ error: "Project request record not located" });
  }

  db.projects[projIndex].status = status;
  if (adminNotes !== undefined) {
    db.projects[projIndex].adminNotes = adminNotes;
  }

  // Notify Client of the project status change
  db.notifications.push({
    id: "notif-" + crypto.randomUUID(),
    userId: db.projects[projIndex].userId,
    title: `Project Status Updated: ${status}`,
    message: `Your project request status has been changed to '${status}'. Check notes of discussion.`,
    readStatus: false,
    createdAt: new Date().toISOString()
  });

  writeDB(db);
  res.json(db.projects[projIndex]);
});

// Send/Reply user chat notes inside a project request
app.post("/api/projects/:id/notes", authenticateToken, (req: any, res) => {
  const { notes } = req.body;
  if (!notes) return res.status(400).json({ error: "Note text content required" });

  const projIndex = db.projects.findIndex((p) => p.id === req.params.id);
  if (projIndex === -1) return res.status(404).json({ error: "Project database record not found" });

  const currentProject = db.projects[projIndex];
  
  if (req.user.role !== "ADMIN" && currentProject.userId !== req.user.id) {
    return res.status(403).json({ error: "Access restriction: Unauthorized data boundary crossing" });
  }

  const senderLabel = req.user.role === "ADMIN" ? "Admin" : "Client";
  const formattedLine = `[${new Date().toLocaleTimeString()}] ${senderLabel}: ${notes}`;
  
  if (currentProject.adminNotes) {
    currentProject.adminNotes += `\n${formattedLine}`;
  } else {
    currentProject.adminNotes = formattedLine;
  }

  const targetUser = req.user.role === "ADMIN" ? currentProject.userId : "ADMIN";
  db.notifications.push({
    id: "notif-" + crypto.randomUUID(),
    userId: targetUser,
    title: `New message on Project ID ${currentProject.id.slice(0, 6)}...`,
    message: `${senderLabel} added project notes: "${notes.slice(0, 50)}..."`,
    readStatus: false,
    createdAt: new Date().toISOString()
  });

  writeDB(db);
  res.json(currentProject);
});

// Delete project request (ADMIN only)
app.delete("/api/projects/:id", authenticateToken, requireAdmin, (req, res) => {
  const filteredProjects = db.projects.filter((p) => p.id !== req.params.id);
  if (filteredProjects.length === db.projects.length) {
    return res.status(404).json({ error: "Project was not found" });
  }

  db.projects = filteredProjects;
  writeDB(db);
  res.json({ success: true, message: "Project request record securely erased" });
});

// ---------------------------------------------------
// PUBLIC CONTACT MESSAGES & NOTIFICATIONS FEED
// ---------------------------------------------------

// Public contact feedback submission
app.post("/api/messages", (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "Please populate all fields in the contact inquiry" });
  }

  const newMsg = {
    id: "msg-" + crypto.randomUUID(),
    name,
    email: email.toLowerCase().trim(),
    subject,
    message,
    createdAt: new Date().toISOString()
  };

  db.messages.push(newMsg);

  // Notify Admin Workspace of the inquiry
  db.notifications.push({
    id: "notif-" + crypto.randomUUID(),
    userId: "ADMIN",
    title: `Inquiry: ${subject}`,
    message: `${name} has reached out via the consultation form.`,
    readStatus: false,
    createdAt: new Date().toISOString()
  });

  writeDB(db);
  res.status(201).json({ success: true, message: "Thank you! Your outreach was safely dispatched." });
});

app.get("/api/messages", authenticateToken, requireAdmin, (req, res) => {
  res.json(db.messages);
});

app.get("/api/notifications", authenticateToken, (req: any, res) => {
  const userRole = req.user.role;
  const userId = req.user.id;

  if (userRole === "ADMIN") {
    const adminNotifs = db.notifications.filter((n) => n.userId === "ADMIN");
    res.json(adminNotifs);
  } else {
    const userNotifs = db.notifications.filter((n) => n.userId === userId);
    res.json(userNotifs);
  }
});

app.patch("/api/notifications/:id/read", authenticateToken, (req: any, res) => {
  const notifIndex = db.notifications.findIndex((n) => n.id === req.params.id);
  if (notifIndex !== -1) {
    const target = db.notifications[notifIndex];
    if (req.user.role === "ADMIN" && target.userId === "ADMIN") {
      target.readStatus = true;
    } else if (target.userId === req.user.id) {
      target.readStatus = true;
    }
    writeDB(db);
  }
  res.json({ success: true });
});

// ---------------------------------------------------
// CHAT SERVICES DIRECT INTEGRATIONS (GEMINI LIVE SUPPORT)
// ---------------------------------------------------
app.post("/api/support/chat", async (req: any, res) => {
  const { message, chatHistory } = req.body;
  if (!message) {
    return res.status(400).json({ error: "User message query was not formulated" });
  }

  const systemInstruction = `You are a legendary Senior Cloud Solutions Architect and Client Advisor at 'WebWarp Technology Pvt Ltd.', a global futuristic design and enterprise software studio. 
We deliver highly-polished SaaS web applications, responsive custom enterprise portals (React, TypeScript), and advanced API architectures.
You consult prospective clients elegantly, with a high-end corporate tone. Keep descriptions very modern, emphasizing tech security, speed, and premium user interaction.
Be brief yet insightful. Avoid sounding robotic, but offer robust technological solutions. Provide pricing estimates casually when prompted (ranging from $10k to $100k depending on complexity).`;

  const historyText = chatHistory && Array.isArray(chatHistory)
    ? chatHistory.slice(-4).map((m: any) => `${m.sender === "user" ? "Client" : "Advisor"}: ${m.text}`).join("\n")
    : "";

  const finalPrompt = historyText 
    ? `Recall past context:\n${historyText}\n\nLatest client question: ${message}\n\nProvide your architect insights:`
    : message;

  try {
    const aiAnswer = await queryGeminiConsultant(finalPrompt, systemInstruction);
    res.json({ response: aiAnswer });
  } catch (error: any) {
    res.status(500).json({ error: "Consultation agent experienced an algorithmic variance." });
  }
});

// ---------------------------------------------------
// BOOTSTRAP VITE SERVING LIFECYCLE
// ---------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Enterprise Full Stack Agent Port listening securely on connection http://localhost:${PORT}`);
  });
}

startServer();
