const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

async function api(url, options = {}) {
  const res = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json().catch(() => ({}))
    : {};

  if (!res.ok) {
    const error = new Error(
      data.error ||
      `Request failed (${res.status}). Check that the server is running and try again.`
    );

    error.status = res.status;
    throw error;
  }

  return data;
}

function esc(s = "") {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[c]);
}

function serviceIcon(category) {
  return ({
    Documents: "📄",
    Complaints: "💬",
    Assistance: "🤝",
    Emergency: "🚨",
    Business: "💼",
    Health: "♥"
  })[category] || "▣";
}

// Local demo data keeps the cards visible even when the API is unavailable.
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

let currentServices = DEMO_SERVICES;
let currentProjects = DEMO_PROJECTS;

const SNAPSHOT_DEFAULTS = {
  population: 15230,
  services: 25,
  ongoingProjects: 8,
  satisfaction: 95
};

function normalizeSnapshot(snapshot = {}) {
  const numberOrDefault = (value, fallback, max) => {
    const number = Number(value);

    return Number.isInteger(number) && number >= 0 && number <= max
      ? number
      : fallback;
  };

  return {
    population: numberOrDefault(
      snapshot.population,
      SNAPSHOT_DEFAULTS.population,
      10000000
    ),
    services: numberOrDefault(
      snapshot.services,
      SNAPSHOT_DEFAULTS.services,
      10000
    ),
    ongoingProjects: numberOrDefault(
      snapshot.ongoingProjects,
      SNAPSHOT_DEFAULTS.ongoingProjects,
      10000
    ),
    satisfaction: numberOrDefault(
      snapshot.satisfaction,
      SNAPSHOT_DEFAULTS.satisfaction,
      100
    )
  };
}

function updateHeroSnapshot(snapshot) {
  const safeSnapshot = normalizeSnapshot(snapshot);
  const cards = $$("#heroStats .hero-stat");

  const values = [
    safeSnapshot.population.toLocaleString("en-PH"),
    `${safeSnapshot.services.toLocaleString("en-PH")}+`,
    safeSnapshot.ongoingProjects.toLocaleString("en-PH"),
    `${safeSnapshot.satisfaction}%`
  ];

  cards.forEach((card, index) => {
    const value = $("b", card);

    if (value && values[index] !== undefined) {
      value.textContent = values[index];
    }
  });
}

/* =========================================
   RESIDENT AND STAFF AUTHENTICATION
========================================= */

let signedInUser = null;
let authMode = "resident-login";

function ensureAuthDialog() {
  if ($("#authDialog")) return;

  const wrapper = document.createElement("div");
  wrapper.id = "authDialog";
  wrapper.className = "modal hidden";

  wrapper.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 99999;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(10, 20, 35, 0.65);
    backdrop-filter: blur(5px);
  `;

  wrapper.innerHTML = `
    <div class="modal-card" style="
      position:relative;
      width:100%;
      max-width:440px;
      max-height:90vh;
      overflow-y:auto;
      padding:32px;
      border-radius:20px;
      background:#fff;
      color:#172b4d;
      box-shadow:0 20px 60px rgba(0,0,0,.25)
    ">
      <button
        type="button"
        id="authClose"
        aria-label="Close login"
        style="
          position:absolute;
          top:14px;
          right:18px;
          border:0;
          background:transparent;
          font-size:28px;
          cursor:pointer;
          color:#52627a
        "
      >×</button>

      <div style="margin-bottom:22px">
        <p style="
          margin:0 0 8px;
          color:#d94b72;
          font-size:11px;
          font-weight:800;
          letter-spacing:2px;
          text-transform:uppercase
        ">BANTAY AGAPAI</p>

        <h2 id="authTitle" style="
          margin:0 0 8px;
          font-size:25px;
          color:#172b4d
        ">Resident Login</h2>

        <p id="authDescription" style="
          margin:0;
          color:#64748b;
          font-size:14px;
          line-height:1.6
        ">Log in to your resident account.</p>
      </div>

      <form id="authForm" style="display:grid;gap:15px">
        <label id="authNameWrap" style="display:none">
          <span style="display:block;margin-bottom:7px;font-size:13px;font-weight:700">
            Full name
          </span>
          <input
            id="authName"
            type="text"
            autocomplete="name"
            placeholder="Enter your full name"
            style="box-sizing:border-box;width:100%;padding:13px 14px;border:1px solid #d6dfec;border-radius:10px;font:inherit;outline-color:#376e6f"
          >
        </label>

        <label id="authContactWrap" style="display:none">
          <span style="display:block;margin-bottom:7px;font-size:13px;font-weight:700">
            Contact number (optional)
          </span>
          <input
            id="authContact"
            type="text"
            autocomplete="tel"
            placeholder="Enter contact number"
            style="box-sizing:border-box;width:100%;padding:13px 14px;border:1px solid #d6dfec;border-radius:10px;font:inherit;outline-color:#376e6f"
          >
        </label>

        <label>
          <span id="authEmailLabel" style="display:block;margin-bottom:7px;font-size:13px;font-weight:700">
            Email address
          </span>
          <input
            id="authEmail"
            type="email"
            autocomplete="username"
            placeholder="Enter email address"
            required
            style="box-sizing:border-box;width:100%;padding:13px 14px;border:1px solid #d6dfec;border-radius:10px;font:inherit;outline-color:#376e6f"
          >
        </label>

        <label>
          <span style="display:block;margin-bottom:7px;font-size:13px;font-weight:700">
            Password
          </span>
          <input
            id="authPassword"
            type="password"
            autocomplete="current-password"
            placeholder="Enter password"
            required
            style="box-sizing:border-box;width:100%;padding:13px 14px;border:1px solid #d6dfec;border-radius:10px;font:inherit;outline-color:#376e6f"
          >
        </label>

        <button
          type="submit"
          id="authSubmit"
          style="width:100%;padding:14px;border:0;border-radius:10px;background:#376e6f;color:#fff;font-size:15px;font-weight:700;cursor:pointer"
        >Login</button>

        <p
          id="authMessage"
          role="status"
          aria-live="polite"
          style="min-height:20px;margin:0;color:#b42318;font-size:13px;line-height:1.5"
        ></p>

        <div id="authSwitchWrap" style="text-align:center;font-size:13px;color:#64748b">
          <span id="authSwitchText">Don't have an account?</span>
          <button
            type="button"
            id="authSwitch"
            style="border:0;background:transparent;color:#376e6f;font-weight:800;cursor:pointer"
          >Create account</button>
        </div>
      </form>
    </div>
  `;

  document.body.append(wrapper);

  $("#authClose").addEventListener("click", closeAuth);
  $("#authForm").addEventListener("submit", submitAuth);

  $("#authSwitch").addEventListener("click", () => {
    authMode = authMode === "resident-login"
      ? "resident-register"
      : "resident-login";

    renderAuthMode();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeAuth();
  });
}

function renderAuthMode() {
  const isStaff = authMode === "staff-login";
  const isRegister = authMode === "resident-register";

  $("#authNameWrap").style.display = isRegister ? "block" : "none";
  $("#authContactWrap").style.display = isRegister ? "block" : "none";
  $("#authName").required = isRegister;

  if (isStaff) {
    $("#authTitle").textContent = "Staff Login";
    $("#authDescription").textContent =
      "Authorized barangay staff only. Use your staff credentials.";
    $("#authEmailLabel").textContent = "Staff email";
    $("#authEmail").placeholder = "Enter staff email";
    $("#authPassword").placeholder = "Enter staff password";
    $("#authSubmit").textContent = "Staff Login";
    $("#authSwitchWrap").style.display = "none";
  } else if (isRegister) {
    $("#authTitle").textContent = "Create Resident Account";
    $("#authDescription").textContent =
      "Register an account to access resident services.";
    $("#authEmailLabel").textContent = "Email address";
    $("#authEmail").placeholder = "Enter email address";
    $("#authPassword").placeholder = "Create a password (at least 8 characters)";
    $("#authPassword").autocomplete = "new-password";
    $("#authSubmit").textContent = "Create Account";
    $("#authSwitchWrap").style.display = "block";
    $("#authSwitchText").textContent = "Already have an account?";
    $("#authSwitch").textContent = "Log in";
  } else {
    $("#authTitle").textContent = "Resident Login";
    $("#authDescription").textContent =
      "Log in to your resident account to access barangay services.";
    $("#authEmailLabel").textContent = "Email address";
    $("#authEmail").placeholder = "Enter email address";
    $("#authPassword").placeholder = "Enter password";
    $("#authPassword").autocomplete = "current-password";
    $("#authSubmit").textContent = "Resident Login";
    $("#authSwitchWrap").style.display = "block";
    $("#authSwitchText").textContent = "Don't have an account?";
    $("#authSwitch").textContent = "Create account";
  }
}

function openAuth(mode = "resident-login") {
  ensureAuthDialog();

  authMode = mode;
  $("#authMessage").textContent = "";
  $("#authForm").reset();

  renderAuthMode();

  const dialog = $("#authDialog");
  dialog.classList.remove("hidden");
  dialog.style.display = "flex";

  setTimeout(() => $("#authEmail")?.focus(), 50);
}

function closeAuth() {
  const dialog = $("#authDialog");
  if (!dialog) return;

  dialog.classList.add("hidden");
  dialog.style.display = "none";
}

async function submitAuth(e) {
  e.preventDefault();

  const message = $("#authMessage");
  const submitButton = $("#authSubmit");
  const email = $("#authEmail").value.trim();
  const password = $("#authPassword").value;

  const isStaff = authMode === "staff-login";
  const isRegister = authMode === "resident-register";

  const endpoint = isStaff
    ? "/api/auth/login"
    : isRegister
      ? "/api/resident/register"
      : "/api/resident/login";

  const payload = isRegister
    ? {
        name: $("#authName").value.trim(),
        contact: $("#authContact").value.trim(),
        email,
        password
      }
    : {
        email,
        password,
        ...(isStaff ? { role: "staff" } : {})
      };

  message.textContent = "";
  submitButton.disabled = true;
  submitButton.textContent = "Please wait...";

  try {
    const data = await api(endpoint, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    signedInUser = data.user;
    closeAuth();
    updateLoginButton();

    if (signedInUser.role === "staff") {
      $("#admin").classList.remove("hidden");
      $("#admin").scrollIntoView({ behavior: "smooth" });
      await loadAdmin();
    } else {
      $("#admin").classList.add("hidden");
      alert(isRegister ? "Resident account created successfully!" : "Welcome back!");
    }
  } catch (err) {
    message.textContent = err.message;
  } finally {
    submitButton.disabled = false;
    renderAuthMode();
  }
}

function updateLoginButton() {
  const button = $("#loginBtn");
  if (!button) return;

  button.textContent = signedInUser
    ? `${signedInUser.name || "Account"} · Logout`
    : "RESIDENT LOGIN →";
}

function ensureLogoutDialog() {
  if ($("#logoutDialog")) return;

  const dialog = document.createElement("div");
  dialog.id = "logoutDialog";
  dialog.style.cssText = `
    position:fixed;inset:0;z-index:100000;display:none;
    align-items:center;justify-content:center;padding:20px;
    background:rgba(10,20,35,.65);backdrop-filter:blur(5px);
  `;

  dialog.innerHTML = `
    <div role="dialog" aria-modal="true" aria-labelledby="logoutTitle"
      style="box-sizing:border-box;width:100%;max-width:400px;padding:30px;border-radius:20px;background:#fff;color:#172b4d;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.25)">
      <div aria-hidden="true" style="font-size:38px;margin-bottom:12px">⚠️</div>
      <h2 id="logoutTitle" style="margin:0 0 10px;font-size:23px">Confirm Logout</h2>
      <p style="margin:0 0 20px;color:#64748b;line-height:1.6">
        Are you sure you want to log out of your account?
      </p>
      <p id="logoutMessage" role="status" aria-live="polite"
        style="min-height:20px;margin:0 0 12px;color:#b42318;font-size:13px"></p>
      <div style="display:flex;gap:10px">
        <button type="button" id="cancelLogout"
          style="flex:1;padding:12px;border:1px solid #d6dfec;border-radius:10px;background:#fff;color:#334155;font:inherit;font-weight:700;cursor:pointer">
          Cancel
        </button>
        <button type="button" id="confirmLogout"
          style="flex:1;padding:12px;border:0;border-radius:10px;background:#b42318;color:#fff;font:inherit;font-weight:700;cursor:pointer">
          Log Out
        </button>
      </div>
    </div>
  `;

  document.body.append(dialog);

  $("#cancelLogout").addEventListener("click", closeLogoutDialog);
  $("#confirmLogout").addEventListener("click", confirmLogout);

  dialog.addEventListener("click", event => {
    if (event.target === dialog && !$("#confirmLogout").disabled) {
      closeLogoutDialog();
    }
  });

  document.addEventListener("keydown", event => {
    if (
      event.key === "Escape" &&
      dialog.style.display === "flex" &&
      !$("#confirmLogout").disabled
    ) {
      closeLogoutDialog();
    }
  });
}

function openLogoutDialog() {
  ensureLogoutDialog();

  $("#logoutMessage").textContent = "";
  $("#confirmLogout").disabled = false;
  $("#cancelLogout").disabled = false;
  $("#confirmLogout").textContent = "Log Out";
  $("#logoutDialog").style.display = "flex";
  $("#cancelLogout").focus();
}

function closeLogoutDialog() {
  const dialog = $("#logoutDialog");
  if (dialog) dialog.style.display = "none";
}

async function confirmLogout() {
  if (!signedInUser) {
    closeLogoutDialog();
    return;
  }

  const button = $("#confirmLogout");
  const cancelButton = $("#cancelLogout");
  const message = $("#logoutMessage");
  const wasStaff = signedInUser.role === "staff";

  button.disabled = true;
  cancelButton.disabled = true;
  button.textContent = "Logging out...";
  message.textContent = "";

  try {
    await api(wasStaff ? "/api/auth/logout" : "/api/resident/logout", {
      method: "POST"
    });

    signedInUser = null;
    updateLoginButton();

    if (wasStaff) $("#admin").classList.add("hidden");

    closeLogoutDialog();
  } catch (err) {
    message.textContent = err.message || "Unable to log out. Please try again.";
    button.disabled = false;
    cancelButton.disabled = false;
    button.textContent = "Log Out";
  }
}

async function handleLoginButton() {
  if (signedInUser) {
    openLogoutDialog();
  } else {
    openAuth("resident-login");
  }
}

$("#loginBtn").addEventListener("click", handleLoginButton);

/* =========================================
   CONFIG AND SERVICES
========================================= */

async function loadConfig() {
  const status = $("#aiStatus");
  let aiMode = "demo";

  try {
    const config = await api("/api/config");
    aiMode = config.aiMode === "live" ? "live" : "demo";

    if (config.snapshot) {
      updateHeroSnapshot(config.snapshot);
    }
  } catch (error) {
    console.warn("Config API unavailable; using demo mode.", error);
  }

  if (!status) return;

  status.textContent = aiMode === "live" ? "● Live AI" : "● Demo FAQ";
  status.style.background = aiMode === "live" ? "#dff8e8" : "#eaf3ff";
  status.style.color = aiMode === "live" ? "#16854d" : "var(--blue)";
}

async function loadServices() {
  const grid = $("#serviceGrid");
  if (!grid) return;

  let services = [];

  try {
    const result = await api("/api/services");
    if (Array.isArray(result)) services = result;
  } catch (error) {
    console.warn("Services API unavailable; showing demo services.", error);
  }

  currentServices = services.length ? services : DEMO_SERVICES;
  const featuredServices = currentServices.slice(0, 6);

  grid.innerHTML = featuredServices.map(s => `
    <article class="service-card" data-service="${esc(s.id)}">
      <div class="service-icon">${serviceIcon(s.category)}</div>
      <div class="service-card-content">
        <h3>${esc(s.name || "Barangay Service")}</h3>
        <p>${esc(s.category || "Service")} · ${esc(s.office || "Barangay Hall")}</p>
      </div>
      <span class="service-arrow">→</span>
    </article>
  `).join("");

  $$(".service-card", grid).forEach(card =>
    card.addEventListener("click", () => {
      const service = featuredServices.find(
        item => item.id === card.dataset.service
      );

      if (service) showService(service, card);
    })
  );
}

function showService(s, sourceCard = null) {
  const requirements = Array.isArray(s.requirements) ? s.requirements : [];
  const steps = Array.isArray(s.steps) ? s.steps : [];

  $("#modalContent").innerHTML = `
    <h2>${esc(s.name || "Barangay Service")}</h2>
    <p class="muted">${esc(s.category || "Service")}</p>
    <hr>
    <p><b>Responsible office</b><br>${esc(s.office || "Barangay Hall")}</p>
    <p><b>Schedule</b><br>${esc(s.schedule || "Please confirm with the Barangay Hall.")}</p>
    <p><b>Location</b><br>${esc(s.location || "Barangay Hall, Balut, Tondo, Manila")}</p>
    <h3>Requirements</h3>
    <ul>${requirements.map(x => `<li>${esc(x)}</li>`).join("") || "<li>Please confirm the current requirements with the barangay office.</li>"}</ul>
    <h3>Steps</h3>
    <ol>${steps.map(x => `<li>${esc(x)}</li>`).join("") || "<li>Contact or visit the barangay office for assistance.</li>"}</ol>
  `;

  openDetailModal(sourceCard);
}

/* =========================================
   PROJECTS — FIXED IMAGE ASSIGNMENT
========================================= */
function installProjectImageStyles() {
  if ($("#projectImageStyles")) return;

  const style = document.createElement("style");
  style.id = "projectImageStyles";

  style.textContent = `
    .project-image {
      position: relative;
      height: 145px;
      min-height: 145px;
      overflow: hidden;
      background-color: #fff;
      background-repeat: no-repeat;
      background-position: center center;
      background-size: cover;
    }

    .project-image .badge {
      position: absolute;
      top: 9px;
      left: 9px;
      z-index: 2;
    }

    .project-card {
      min-width: 0;
      overflow: hidden;
    }

    .project-promo {
      background-image:
        linear-gradient(90deg, rgba(13,49,133,.86), rgba(11,54,129,.18)),
        url("/barangay.png") !important;
      background-position: center center;
      background-size: cover;
      background-repeat: no-repeat;
      min-width: 0;
      overflow: hidden;
    }

    @media (max-width: 760px) {
      .project-image {
        height: 125px;
        min-height: 125px;
      }
    }
  `;

  document.head.appendChild(style);
}

const PROJECT_IMAGES = [
  "/road.jpg",
  "/court.jpg",
  "/drainage.jpg",
  "/lighting.jpg"
];

function getProjectImage(index) {
  return PROJECT_IMAGES[index] || "/barangay.png";
}

async function loadProjects() {
  installProjectImageStyles();

  const grid = $("#projectGrid");
  if (!grid) return;

  let projects = [];

  try {
    const result = await api("/api/projects");
    if (Array.isArray(result)) projects = result;
  } catch (error) {
    console.warn("Projects API unavailable; showing demo projects.", error);
  }

  currentProjects = projects.length ? projects : DEMO_PROJECTS;

  grid.innerHTML = currentProjects.map((p, index) => {
    const image = typeof p.image === "string" && p.image.startsWith("/uploads/projects/")
      ? p.image
      : getProjectImage(index);
    const progress = Math.min(100, Math.max(0, Number(p.progress) || 0));

    return `
      <article class="project-card" data-project="${esc(p.id)}">
        <div
          class="project-image"
          style="background-image:url('${esc(image)}')"
        >
          <span class="badge">${esc(p.status || "Planning")}</span>
        </div>

        <div class="project-body">
          <h3>${esc(p.name || "Barangay Project")}</h3>
          <div class="meta">📍 ${esc(p.location || "Barangay 135")}</div>

          <div class="bar">
            <span style="width:${progress}%"></span>
          </div>

          <div class="project-foot">
            <span>${progress}% complete</span>
            <span>Target: ${esc(p.target || "TBA")}</span>
          </div>
        </div>
      </article>
    `;
  }).join("");

  $$(".project-card", grid).forEach(card =>
    card.addEventListener("click", () => {
      const project = currentProjects.find(
        item => String(item.id) === card.dataset.project
      );

      if (!project) return;

      const progress = Math.min(100, Math.max(0, Number(project.progress) || 0));

      $("#modalContent").innerHTML =
        "<h2>" + esc(project.name || "Barangay Project") + "</h2>" +
        "<p class=\"muted\">" + esc(project.status || "Planning") +
        " · " + progress + "% complete</p>" +
        "<hr>" +
        "<p><b>Location</b><br>" + esc(project.location || "Barangay 135") + "</p>" +
        "<p><b>Timeline</b><br>" + esc(project.start || "TBA") + " → " +
        esc(project.target || "TBA") + "</p>" +
        "<p><b>Description</b><br>" +
        esc(project.description || "No description available.") + "</p>" +
        "<div class=\"bar\"><span style=\"width:" + progress + "%\"></span></div>";

      openDetailModal(card);
    })
  );
}

/* =========================================
   DEMO BARANGAY GUIDE — CLICKABLE QUESTIONS
========================================= */

const guideHistory = [];

const GUIDE_QUESTIONS = [
  {
    question: "Anong mga barangay services ang available?",
    answer: "Para makita ang mga serbisyong available, tingnan ang Services section ng website. Piliin ang serbisyong kailangan mo para makita ang mga detalye at requirements na nakalista."
  },
  {
    question: "Ano ang gagawin kapag may emergency?",
    answer: "Kung may agarang panganib, sunog, malubhang aksidente, karahasan, o emergency na medikal, humingi agad ng tulong sa naaangkop na emergency responder o pumunta sa pinakamalapit na ligtas na lugar. Hindi ako makakatawag ng responders o makapagbibigay ng hindi kumpirmadong hotline number."
  },
  {
    question: "Paano kumuha ng business permit?",
    answer: "Para sa business permit, kumpirmahin muna sa Barangay Hall ang kasalukuyang requirements at proseso. Maaaring mag-iba ang kailangang dokumento depende sa uri ng negosyo."
  },
  {
    question: "Anong health services ang mayroon?",
    answer: "Tingnan ang Services section para sa mga nakalistang serbisyong pangkalusugan. Para sa schedule, availability, at kailangang dalhin, kumpirmahin muna sa Barangay Hall o health center."
  },
  {
    question: "Paano magsumite ng reklamo?",
    answer: "Pumunta sa Complaints section ng website at ilagay ang iyong pangalan at malinaw na paglalarawan ng concern. Pagkatapos magsumite, itago ang reference number para masubaybayan ang status."
  },
  {
    question: "Paano tingnan ang barangay projects?",
    answer: "Bisitahin ang Projects section para makita ang mga proyektong nakalista at ang status o progreso na ipinapakita sa website."
  },
  {
    question: "Ano ang requirements at mga hakbang?",
    answer: "Nagkakaiba ang requirements depende sa serbisyo o dokumentong kailangan. Piliin ang serbisyo sa Services section para makita ang mga nakalistang requirements at steps. Kung walang nakasaad, kumpirmahin muna sa Barangay Hall."
  }
];

function installGuideChatStyles() {
  if ($("#guideChatStyles")) return;

  const style = document.createElement("style");
  style.id = "guideChatStyles";
  style.textContent = [
    "#guideResult { display:none; box-sizing:border-box; width:100%; height:300px; min-height:300px; max-height:300px; overflow-y:auto; overflow-x:hidden; padding:18px; border:1px solid #d6e5f5; border-radius:18px; background:#f7fbff; scroll-behavior:smooth; }",
    "#guideResult:not(.hidden) { display:block!important; }",
    ".guide-chat-row { display:flex!important; width:100%; height:auto!important; min-height:0!important; margin:10px 0; padding:0; align-items:flex-start!important; flex:none!important; }",
    ".guide-chat-row.user-row { justify-content:flex-end!important; }",
    ".guide-chat-row.ai-row { justify-content:flex-start!important; }",
    ".guide-chat-bubble { display:block!important; box-sizing:border-box; width:fit-content!important; max-width:min(78%,560px)!important; min-width:0!important; height:auto!important; padding:11px 15px!important; border-radius:16px; overflow-wrap:anywhere; line-height:1.5; }",
    ".user-bubble { background:#376e6f!important; color:#fff!important; border-bottom-right-radius:5px; }",
    ".ai-bubble { background:#e9f1fa!important; color:#172b4d!important; border-bottom-left-radius:5px; }",
    ".guide-chat-label { display:block!important; margin:0 0 5px!important; font-size:10px; line-height:1.3; font-weight:800; letter-spacing:.5px; opacity:.75; }",
    ".guide-chat-text { display:block!important; margin:0!important; padding:0!important; font-size:14px; line-height:1.55; white-space:pre-wrap; overflow-wrap:anywhere; }",
    ".guide-question-list { display:flex; flex-wrap:wrap; gap:8px; margin-top:12px; }",
    ".guide-question-button { padding:9px 13px; border:1px solid #c7d9eb; border-radius:999px; background:#fff; color:#234b61; font:inherit; font-size:13px; text-align:left; cursor:pointer; }",
    ".guide-question-button:hover, .guide-question-button:focus-visible { border-color:#376e6f; background:#eaf5f4; outline:2px solid #376e6f; outline-offset:2px; }",
    "#guideForm { display:none!important; }",
    "@media (max-width:600px) { #guideResult { height:280px; min-height:280px; max-height:280px; padding:12px; } .guide-chat-bubble { max-width:88%!important; } }"
  ].join("\n");

  document.head.appendChild(style);
}

function renderGuideMessages(messages = guideHistory) {
  const result = $("#guideResult");
  if (!result) return;

  installGuideChatStyles();
  result.classList.remove("hidden");

  result.innerHTML = messages.map(message => {
    const isUser = message.role === "user";

    return (
      '<div class="guide-chat-row ' + (isUser ? "user-row" : "ai-row") + '">' +
        '<div class="guide-chat-bubble ' + (isUser ? "user-bubble" : "ai-bubble") + '">' +
          '<div class="guide-chat-label">' + (isUser ? "NAPILI MONG TANONG" : "BANTAY AGAPAI") + '</div>' +
          '<div class="guide-chat-text">' + esc(message.content) + '</div>' +
        '</div>' +
      '</div>'
    );
  }).join("");

  requestAnimationFrame(() => {
    result.scrollTop = result.scrollHeight;
  });
}

function makeGuideQuestionList() {
  const questionList = document.createElement("div");
  questionList.className = "guide-question-list";
  questionList.setAttribute("aria-label", "Pumili ng tanong");

  GUIDE_QUESTIONS.forEach(item => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "guide-question-button";
    button.textContent = item.question;
    button.addEventListener("click", () => showGuideAnswer(item));
    questionList.appendChild(button);
  });

  return questionList;
}

function renderGuideQuestions() {
  const form = $("#guideForm");
  const result = $("#guideResult");
  if (!result) return;

  installGuideChatStyles();

  if (form) {
    form.style.display = "none";
    form.setAttribute("aria-hidden", "true");
  }

  const input = $("#question");
  if (input) {
    input.disabled = true;
    input.setAttribute("aria-hidden", "true");
  }

  result.classList.remove("hidden");
  result.innerHTML =
    '<div class="guide-chat-row ai-row">' +
      '<div class="guide-chat-bubble ai-bubble">' +
        '<div class="guide-chat-label">BANTAY AGAPAI</div>' +
        '<div class="guide-chat-text">Kumusta! Pumili ng tanong sa ibaba para makita ang sagot.</div>' +
      '</div>' +
    '</div>';

  result.appendChild(makeGuideQuestionList());
}

function showGuideAnswer(item) {
  const result = $("#guideResult");
  if (!result || !item) return;

  guideHistory.push(
    { role: "user", content: item.question },
    { role: "assistant", content: item.answer }
  );

  renderGuideMessages(guideHistory);
  result.appendChild(makeGuideQuestionList());
  result.scrollTop = result.scrollHeight;
}

function findGuideAnswer(question) {
  const text = String(question || "")
    .toLocaleLowerCase("fil")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  const rules = [
    [/\b(emergency|sunog|aksidente|nasugatan|nasaktan|panganib|karahasan|agarang tulong|medical emergency)\b/, 1],
    [/\b(business permit|permit sa negosyo|negosyo|business)\b/, 2],
    [/\b(health|kalusugan|health center|clinic|klinika|bakuna|medical|gamot|doktor)\b/, 3],
    [/\b(complaint|reklamo|magreklamo|sumbong|concern)\b/, 4],
    [/\b(project|proyekto|monitoring|progress|progreso)\b/, 5],
    [/\b(requirement|requirements|kailangan|papeles|dokumento|steps|hakbang|proseso|paano kumuha)\b/, 6],
    [/\b(service|services|serbisyo|serbisyong|tulong)\b/, 0]
  ];

  for (const [pattern, index] of rules) {
    if (pattern.test(text)) return GUIDE_QUESTIONS[index];
  }

  return {
    question: String(question || "").trim() || "Iba pang tanong",
    answer: "Demo FAQ lang ang assistant na ito. Pumili ng isa sa mga nakalistang paksa tungkol sa barangay services, emergency, business permit, health services, complaints, projects, o requirements."
  };
}

// Pati ang mga dati nang data-q buttons ay gagamit ng demo answers.
$$("[data-q]").forEach(button => {
  button.type = "button";
  button.addEventListener("click", () => {
    const question = String(button.dataset.q || button.textContent || "").trim();
    showGuideAnswer(findGuideAnswer(question));
  });
});

renderGuideQuestions();

/* =========================================
   COMPLAINT SUBMISSION
========================================= */

$("#complaintForm").addEventListener("submit", async e => {
  e.preventDefault();

  const payload = Object.fromEntries(new FormData(e.target).entries());
  const message = $("#complaintMessage");

  try {
    const data = await api("/api/complaints", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    message.textContent =
      `${data.message} Reference: ${data.reference}`;

    e.target.reset();
  } catch (err) {
    message.textContent = err.message;
  }
});

/* =========================================
   REPORT TRACKING
========================================= */

$("#trackForm").addEventListener("submit", async e => {
  e.preventDefault();

  const id = $("#trackId").value.trim();
  const box = $("#trackResult");

  try {
    const data = await api("/api/track/" + encodeURIComponent(id));
    const item = data.item;

    box.innerHTML = `
      <div class="track-card">
        <b>${esc(item.id)}</b><br>
        ${esc(item.serviceName || item.category || "Concern")}<br>
        Status: <strong>${esc(item.status)}</strong><br>
        Submitted: ${new Date(item.createdAt).toLocaleString()}
      </div>
    `;
  } catch (err) {
    box.innerHTML = `<div class="track-card">${esc(err.message)}</div>`;
  }
});

/* =========================================
   PROJECT REFRESH
========================================= */

$("#refreshProjects").addEventListener("click", async () => {
  const button = $("#refreshProjects");
  const originalText = button.textContent;

  if (button.disabled) return;

  button.disabled = true;
  button.textContent = "Refreshing...";

  try {
    await loadProjects();
    button.textContent = "Updated ✓";
  } catch (error) {
    console.error("Failed to refresh projects:", error);
    button.textContent = "Refresh failed";
    alert("Unable to refresh projects. Please try again.");
  } finally {
    setTimeout(() => {
      button.disabled = false;
      button.textContent = originalText;
    }, 1500);
  }
});

/* =========================================
   CARD-TO-CENTER DETAIL MODAL
========================================= */

let activeDetailCard = null;
let activeDetailCardVisibility = "";
let cardZoomBusy = false;
let detailModalOpen = false;
let heroAnimationFrame = null;
let detailModalOriginalStyles = null;

function pauseHeroAnimation() {
  if (heroAnimationFrame === null) return;

  cancelAnimationFrame(heroAnimationFrame);
  heroAnimationFrame = null;
}

function resumeHeroAnimation() {
  if (
    heroAnimationFrame !== null ||
    cardZoomBusy ||
    detailModalOpen ||
    document.hidden
  ) {
    return;
  }

  heroAnimationFrame = requestAnimationFrame(animate);
}

function cardZoomAllowed() {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  return (
    !reduceMotion &&
    typeof Element !== "undefined" &&
    typeof Element.prototype.animate === "function"
  );
}

function getCardRect(element) {
  const rect = element.getBoundingClientRect();

  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height
  };
}

function transformFromRect(startRect, endRect) {
  const scaleX = startRect.width / endRect.width;
  const scaleY = startRect.height / endRect.height;
  const moveX = startRect.left - endRect.left;
  const moveY = startRect.top - endRect.top;

  return `translate(${moveX}px, ${moveY}px) scale(${scaleX}, ${scaleY})`;
}

function restoreInlineStyle(element, previousStyle) {
  if (!element) return;

  if (previousStyle === null) {
    element.removeAttribute("style");
  } else {
    element.setAttribute("style", previousStyle);
  }
}

function saveDetailModalStyles(modal, modalCard) {
  detailModalOriginalStyles = {
    modal: modal.getAttribute("style"),
    card: modalCard.getAttribute("style")
  };
}

function restoreDetailModalStyles(modal, modalCard) {
  if (!detailModalOriginalStyles) return;

  restoreInlineStyle(modal, detailModalOriginalStyles.modal);
  restoreInlineStyle(modalCard, detailModalOriginalStyles.card);
  detailModalOriginalStyles = null;
}

function waitForModalFrame() {
  return new Promise(resolve => requestAnimationFrame(resolve));
}

async function openDetailModal(sourceCard = null) {
  const modal = $("#modal");
  const modalCard = modal?.querySelector(".modal-card");

  if (
    !modal ||
    !modalCard ||
    cardZoomBusy ||
    detailModalOpen ||
    !modal.classList.contains("hidden")
  ) {
    return;
  }

  detailModalOpen = true;
  pauseHeroAnimation();
  saveDetailModalStyles(modal, modalCard);

  activeDetailCard =
    sourceCard?.isConnected && cardZoomAllowed()
      ? sourceCard
      : null;

  if (!activeDetailCard) {
    modal.classList.remove("hidden");
    return;
  }

  activeDetailCardVisibility = activeDetailCard.style.visibility;
  cardZoomBusy = true;

  const animations = [];

  try {
    modal.style.animation = "none";
    modal.style.opacity = "0";
    modalCard.style.animation = "none";
    modalCard.style.visibility = "hidden";
    modal.classList.remove("hidden");

    await waitForModalFrame();

    const sourceRect = getCardRect(activeDetailCard);
    const modalRect = getCardRect(modalCard);

    if (
      sourceRect.width <= 0 ||
      sourceRect.height <= 0 ||
      modalRect.width <= 0 ||
      modalRect.height <= 0
    ) {
      throw new Error("Could not measure the selected card or detail modal.");
    }

    const startingTransform = transformFromRect(sourceRect, modalRect);

    activeDetailCard.style.visibility = "hidden";
    modalCard.style.visibility = "visible";
    modalCard.style.transformOrigin = "top left";

    animations.push(
      modal.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        {
          duration: 240,
          easing: "ease-out",
          fill: "forwards"
        }
      )
    );

    animations.push(
      modalCard.animate(
        [
          {
            transform: startingTransform,
            transformOrigin: "top left"
          },
          {
            transform: "translate(0, 0) scale(1, 1)",
            transformOrigin: "top left"
          }
        ],
        {
          duration: 420,
          easing: "cubic-bezier(.2, .75, .25, 1)",
          fill: "forwards"
        }
      )
    );

    await Promise.all(
      animations.map(animation => animation.finished.catch(() => {}))
    );

    animations.forEach(animation => animation.cancel());
    restoreDetailModalStyles(modal, modalCard);
  } catch (error) {
    console.warn("Card-to-modal opening animation failed.", error);

    animations.forEach(animation => animation.cancel());

    if (activeDetailCard) {
      activeDetailCard.style.visibility = activeDetailCardVisibility;
    }

    activeDetailCard = null;
    restoreDetailModalStyles(modal, modalCard);
    modal.classList.remove("hidden");
  } finally {
    cardZoomBusy = false;
    resumeHeroAnimation();
  }
}

async function closeDetailModal() {
  const modal = $("#modal");
  const modalCard = modal?.querySelector(".modal-card");

  if (!modal || !modalCard || cardZoomBusy || !detailModalOpen) return;

  const sourceCard = activeDetailCard;

  if (
    !sourceCard ||
    !sourceCard.isConnected ||
    !cardZoomAllowed()
  ) {
    modal.classList.add("hidden");

    if (sourceCard) {
      sourceCard.style.visibility = activeDetailCardVisibility;
    }

    restoreDetailModalStyles(modal, modalCard);

    activeDetailCard = null;
    detailModalOpen = false;
    resumeHeroAnimation();
    return;
  }

  cardZoomBusy = true;
  pauseHeroAnimation();

  const animations = [];

  try {
    modal.style.animation = "none";
    modal.style.opacity = "1";
    modalCard.style.animation = "none";
    modalCard.style.visibility = "visible";
    modalCard.style.transformOrigin = "top left";

    const modalRect = getCardRect(modalCard);
    const sourceRect = getCardRect(sourceCard);

    if (
      modalRect.width <= 0 ||
      modalRect.height <= 0 ||
      sourceRect.width <= 0 ||
      sourceRect.height <= 0
    ) {
      throw new Error("Could not measure the modal or original card.");
    }

    const endingTransform = transformFromRect(sourceRect, modalRect);

    animations.push(
      modal.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        {
          duration: 260,
          easing: "ease-in",
          fill: "forwards"
        }
      )
    );

    animations.push(
      modalCard.animate(
        [
          {
            transform: "translate(0, 0) scale(1, 1)",
            transformOrigin: "top left"
          },
          {
            transform: endingTransform,
            transformOrigin: "top left"
          }
        ],
        {
          duration: 380,
          easing: "cubic-bezier(.4, 0, .8, .3)",
          fill: "forwards"
        }
      )
    );

    await Promise.all(
      animations.map(animation => animation.finished.catch(() => {}))
    );
  } catch (error) {
    console.warn("Card-to-modal closing animation failed.", error);
  } finally {
    modal.classList.add("hidden");
    animations.forEach(animation => animation.cancel());

    sourceCard.style.visibility = activeDetailCardVisibility;
    restoreDetailModalStyles(modal, modalCard);

    activeDetailCard = null;
    detailModalOpen = false;
    cardZoomBusy = false;
    resumeHeroAnimation();
  }
}

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && detailModalOpen) {
    closeDetailModal();
  }
});

/* =========================================
   GENERAL MODALS AND BUTTONS
========================================= */

$("#closeModal").addEventListener("click", closeDetailModal);

$("#modal").addEventListener("click", event => {
  if (event.target.id === "modal") {
    closeDetailModal();
  }
});

// Barangay label is static in the current index.html.

/* =========================================
   ADMIN DASHBOARD - STAFF ONLY
========================================= */

$("#adminBtn").addEventListener("click", async () => {
  try {
    if (signedInUser?.role !== "staff") {
      const auth = await api("/api/auth/me");
      signedInUser = auth.user;

      if (!signedInUser || signedInUser.role !== "staff") {
        openAuth("staff-login");
        return;
      }
    }

    updateLoginButton();
    $("#admin").classList.remove("hidden");
    $("#admin").scrollIntoView({ behavior: "smooth" });

    await loadAdmin();
  } catch (error) {
    if (error.status === 401) {
      signedInUser = null;
      updateLoginButton();
      $("#admin").classList.add("hidden");
      openAuth("staff-login");
      return;
    }

    console.error("Could not load the admin dashboard:", error);
    alert(error.message || "Could not load the admin dashboard.");
  }
});

$("#closeAdmin").addEventListener("click", () => {
  $("#admin").classList.add("hidden");
});

/* =========================================
   ADMIN DASHBOARD DATA
========================================= */

function renderSnapshotEditor(snapshotResponse) {
  const holder = $("#adminRequests");
  if (!holder) return;

  const card = holder.closest(".admin-card");
  const heading = card?.querySelector("h3");

  if (heading) {
    heading.textContent = "Edit Barangay Snapshot";
  }

  const snapshotData = snapshotResponse?.snapshot ?? snapshotResponse;
  const snapshot = normalizeSnapshot(snapshotData);

  holder.innerHTML = `
    <p class="admin-item">
      These figures appear in the public Barangay Snapshot.
    </p>

    <form class="mini-form" id="snapshotEditorForm">
      <label>
        Estimated residents
        <input
          name="population"
          type="number"
          min="0"
          max="10000000"
          step="1"
          value="${snapshot.population}"
          required
        >
      </label>

      <label>
        Barangay services
        <input
          name="services"
          type="number"
          min="0"
          max="10000"
          step="1"
          value="${snapshot.services}"
          required
        >
      </label>

      <label>
        Ongoing projects
        <input
          name="ongoingProjects"
          type="number"
          min="0"
          max="10000"
          step="1"
          value="${snapshot.ongoingProjects}"
          required
        >
      </label>

      <label>
        Satisfaction percentage
        <input
          name="satisfaction"
          type="number"
          min="0"
          max="100"
          step="1"
          value="${snapshot.satisfaction}"
          required
        >
      </label>

      <button class="blue-btn" type="submit">Save Snapshot</button>
      <p id="snapshotMessage" class="message" role="status" aria-live="polite"></p>
    </form>
  `;

  const form = $("#snapshotEditorForm", holder);
  const message = $("#snapshotMessage", holder);
  const saveButton = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const payload = Object.fromEntries(new FormData(form).entries());

    for (const key of Object.keys(SNAPSHOT_DEFAULTS)) {
      payload[key] = Number(payload[key]);
    }

    saveButton.disabled = true;
    saveButton.textContent = "Saving...";
    message.textContent = "";

    try {
      const savedResponse = await api("/api/admin/snapshot", {
        method: "PATCH",
        body: JSON.stringify(payload)
      });

      const savedData = savedResponse?.snapshot ?? savedResponse;
      const updatedSnapshot = normalizeSnapshot(savedData);

      updateHeroSnapshot(updatedSnapshot);

      for (const [key, value] of Object.entries(updatedSnapshot)) {
        form.elements[key].value = value;
      }

      message.textContent = "Snapshot saved and updated.";
      message.style.color = "#16854d";
    } catch (error) {
      message.textContent = error.message || "Could not save the snapshot.";
      message.style.color = "#b42318";
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = "Save Snapshot";
    }
  });
}

async function loadAdmin() {
  // Render the replacement first so a snapshot API error cannot leave
  // the old Service Requests panel in place.
  renderSnapshotEditor(SNAPSHOT_DEFAULTS);

  try {
    const snapshot = await api("/api/admin/snapshot");
    renderSnapshotEditor(snapshot);
  } catch (error) {
    const message = $("#snapshotMessage");

    if (message) {
      message.textContent =
        `Could not load the saved snapshot: ${error.message}`;
      message.style.color = "#b42318";
    }

    console.warn("Could not load the saved snapshot.", error);
  }

  const summary = await api("/api/admin/summary");

  $("#adminSummary").innerHTML = [
    ["Projects", summary.projects],
    ["Complaints", summary.complaints],
    ["Pending Complaints", summary.pendingComplaints]
  ].map(item => `
    <div class="admin-stat">
      <b>${item[1]}</b>
      <span>${item[0]}</span>
    </div>
  `).join("");

  const projects = await api("/api/projects");

  $("#adminProjects").innerHTML = projects.map(p => `
    <div class="admin-item">
      <b>${esc(p.name)}</b><br>
      ${esc(p.progress)}% · ${esc(p.status)}
      <div class="admin-project-actions">
        <select data-project-status="${esc(p.id)}">
          <option ${p.status === "Planning" ? "selected" : ""}>Planning</option>
          <option ${p.status === "Ongoing" ? "selected" : ""}>Ongoing</option>
          <option ${p.status === "In Progress" ? "selected" : ""}>In Progress</option>
          <option ${p.status === "Completed" ? "selected" : ""}>Completed</option>
          <option ${p.status === "Delayed" ? "selected" : ""}>Delayed</option>
        </select>
        <button class="link-btn" type="button" data-project-photo="${esc(p.id)}">${p.image ? "Change photo" : "Set project photo"}</button>
      </div>
    </div>
  `).join("");

  const PROJECT_STATUS_PROGRESS = {
    "Planning": 0,
    "Delayed": 25,
    "Ongoing": 50,
    "In Progress": 75,
    "Completed": 100
  };

  $$("[data-project-status]").forEach(select =>
    select.addEventListener("change", async () => {
      const status = select.value;
      const progress = PROJECT_STATUS_PROGRESS[status];

      await api(
        "/api/admin/projects/" + select.dataset.projectStatus,
        {
          method: "PATCH",
          body: JSON.stringify({ status, progress })
        }
      );

      await loadAdmin();
      await loadProjects();
    })
  );

  $$('[data-project-photo]').forEach(button =>
    button.addEventListener("click", () => {
      openProjectPhotoPicker(button.dataset.projectPhoto);
    })
  );

  const complaints = await api("/api/admin/complaints");

  $("#adminComplaints").innerHTML = complaints.length
    ? complaints.map(c => `
      <div class="admin-item">
        <b>${esc(c.id)}</b> · ${esc(c.category)}<br>
        ${esc(c.description)}
        <select data-complaint-status="${esc(c.id)}">
          <option ${c.status === "Submitted" ? "selected" : ""}>Submitted</option>
          <option ${c.status === "Under Review" ? "selected" : ""}>Under Review</option>
          <option ${c.status === "For Action" ? "selected" : ""}>For Action</option>
          <option ${c.status === "Resolved" ? "selected" : ""}>Resolved</option>
        </select>
      </div>
    `).join("")
    : "<p>No complaints yet.</p>";

  $$("[data-complaint-status]").forEach(select =>
    select.addEventListener("change", async () => {
      await api(
        "/api/admin/complaints/" + select.dataset.complaintStatus,
        {
          method: "PATCH",
          body: JSON.stringify({ status: select.value })
        }
      );

      await loadAdmin();
    })
  );
}

/* =========================================
   ADD PROJECT
========================================= */

let pendingProjectImageData = "";
let photoTargetProjectId = "";
let projectCropState = null;

function installProjectPhotoStyles() {
  if ($("#projectPhotoStyles")) return;

  const style = document.createElement("style");
  style.id = "projectPhotoStyles";
  style.textContent = `
    .project-photo-field { display: grid; gap: 8px; margin: 4px 0 2px; }
    .project-photo-field label { font-weight: 700; }
    .project-photo-help, .project-photo-message { margin: 0; color: #64748b; font-size: 12px; line-height: 1.45; }
    .project-photo-controls, .admin-project-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .project-photo-controls button, .admin-project-actions button { cursor: pointer; }
    .project-photo-preview {
      display: none; width: min(100%, 320px); aspect-ratio: 16 / 9; overflow: hidden;
      border-radius: 10px; background: #e2e8f0 center / cover no-repeat;
      border: 1px solid rgba(15, 23, 42, .12);
    }
    .project-photo-input { display: none !important; }
    .admin-project-actions { margin-top: 8px; }
    .project-crop-backdrop {
      position: fixed; inset: 0; z-index: 10000; display: none; align-items: center;
      justify-content: center; padding: 18px; background: rgba(15, 23, 42, .72);
    }
    .project-crop-backdrop.is-open { display: flex; }
    .project-crop-dialog {
      width: min(560px, 100%); max-height: min(92vh, 760px); overflow: auto;
      padding: 20px; border-radius: 18px; background: #fff; color: #172033;
      box-shadow: 0 24px 80px rgba(0, 0, 0, .3);
    }
    .project-crop-dialog h2 { margin: 0 0 6px; font-size: 21px; }
    .project-crop-dialog p { margin: 0 0 14px; color: #64748b; font-size: 13px; }
    .project-crop-viewport {
      position: relative; width: 100%; aspect-ratio: 16 / 9; overflow: hidden;
      border-radius: 12px; background: #111827; cursor: grab; touch-action: none; user-select: none;
    }
    .project-crop-viewport.is-dragging { cursor: grabbing; }
    .project-crop-viewport img { position: absolute; max-width: none; max-height: none; pointer-events: none; user-select: none; }
    .project-crop-zoom { display: grid; grid-template-columns: auto 1fr; gap: 12px; align-items: center; margin: 16px 0; }
    .project-crop-zoom label { font-size: 13px; font-weight: 700; }
    .project-crop-actions { display: flex; justify-content: flex-end; gap: 10px; }
    .project-crop-actions button { cursor: pointer; }
    @media (max-width: 520px) {
      .project-crop-dialog { padding: 15px; }
      .project-crop-actions { display: grid; grid-template-columns: 1fr 1fr; }
    }
  `;
  document.head.appendChild(style);
}

function ensureProjectCropDialog() {
  if ($("#projectCropBackdrop")) return;

  const backdrop = document.createElement("div");
  backdrop.id = "projectCropBackdrop";
  backdrop.className = "project-crop-backdrop";
  backdrop.innerHTML = `
    <section class="project-crop-dialog" role="dialog" aria-modal="true" aria-labelledby="projectCropTitle">
      <h2 id="projectCropTitle">Adjust project photo</h2>
      <p>Drag the photo to position it, then use the slider to zoom. This crop will appear on the project card.</p>
      <div class="project-crop-viewport" id="projectCropViewport">
        <img id="projectCropImage" alt="Project photo crop preview">
      </div>
      <div class="project-crop-zoom">
        <label for="projectCropZoom">Zoom</label>
        <input id="projectCropZoom" type="range" min="1" max="3" value="1" step="0.01">
      </div>
      <p class="project-crop-message" id="projectCropMessage" aria-live="polite"></p>
      <div class="project-crop-actions">
        <button class="link-btn" id="projectCropCancel" type="button">Cancel</button>
        <button class="blue-btn" id="projectCropConfirm" type="button">Confirm photo</button>
      </div>
    </section>
  `;
  document.body.appendChild(backdrop);

  const viewport = $("#projectCropViewport");
  const zoom = $("#projectCropZoom");

  backdrop.addEventListener("click", event => {
    if (event.target === backdrop) closeProjectCropper();
  });
  $("#projectCropCancel").addEventListener("click", closeProjectCropper);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && backdrop.classList.contains("is-open")) {
      closeProjectCropper();
    }
  });
  zoom.addEventListener("input", () => {
    if (!projectCropState) return;
    projectCropState.zoom = Number(zoom.value);
    renderProjectCrop();
  });
  viewport.addEventListener("pointerdown", event => {
    if (!projectCropState) return;
    projectCropState.dragging = true;
    projectCropState.pointerX = event.clientX;
    projectCropState.pointerY = event.clientY;
    viewport.classList.add("is-dragging");
    viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener("pointermove", event => {
    if (!projectCropState?.dragging) return;
    projectCropState.panX += event.clientX - projectCropState.pointerX;
    projectCropState.panY += event.clientY - projectCropState.pointerY;
    projectCropState.pointerX = event.clientX;
    projectCropState.pointerY = event.clientY;
    renderProjectCrop();
  });
  const stopDragging = () => {
    if (projectCropState) projectCropState.dragging = false;
    viewport.classList.remove("is-dragging");
  };
  viewport.addEventListener("pointerup", stopDragging);
  viewport.addEventListener("pointercancel", stopDragging);
  window.addEventListener("resize", () => {
    if (projectCropState) renderProjectCrop();
  });
  $("#projectCropConfirm").addEventListener("click", confirmProjectPhoto);
}

function installProjectPhotoField() {
  installProjectPhotoStyles();
  ensureProjectCropDialog();

  const form = $("#projectForm");
  if (!form || $("#projectPhotoField")) return;

  const field = document.createElement("div");
  field.id = "projectPhotoField";
  field.className = "project-photo-field";
  field.innerHTML = `
    <label for="projectPhotoFile">Project photo</label>
    <div class="project-photo-controls">
      <input class="project-photo-input" id="projectPhotoFile" type="file" accept="image/*">
      <button class="link-btn" id="chooseProjectPhoto" type="button">Choose photo</button>
      <span class="project-photo-message" id="projectPhotoMessage">Choose and confirm a photo for this project.</span>
    </div>
    <div class="project-photo-preview" id="projectPhotoPreview" aria-label="Selected project photo preview"></div>
    <p class="project-photo-help">Choose a photo of the project, adjust its crop, then confirm it before adding the project.</p>
  `;

  const targetInput = form.elements.target;
  if (targetInput) targetInput.insertAdjacentElement("afterend", field);
  else form.appendChild(field);

  $("#chooseProjectPhoto").addEventListener("click", () => openProjectPhotoPicker());
  $("#projectPhotoFile").addEventListener("change", event => {
    const file = event.target.files?.[0];
    if (file) loadProjectPhotoFile(file);
  });
}

function openProjectPhotoPicker(projectId = "") {
  installProjectPhotoField();
  photoTargetProjectId = String(projectId || "");
  const input = $("#projectPhotoFile");
  input.value = "";
  input.click();
}

function loadProjectPhotoFile(file) {
  const message = $("#projectPhotoMessage");
  if (!file.type.startsWith("image/")) {
    if (message) message.textContent = "Choose an image file.";
    return;
  }
  if (file.size > 8 * 1024 * 1024) {
    if (message) message.textContent = "Image is too large. Choose a file under 8 MB.";
    return;
  }

  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    projectCropState = {
      image,
      objectUrl,
      zoom: 1,
      panX: 0,
      panY: 0,
      dragging: false,
      pointerX: 0,
      pointerY: 0
    };
    $("#projectCropTitle").textContent = photoTargetProjectId
      ? "Change project photo"
      : "Adjust project photo";
    $("#projectCropMessage").textContent = "";
    $("#projectCropZoom").value = "1";
    $("#projectCropImage").src = objectUrl;
    $("#projectCropBackdrop").classList.add("is-open");
    requestAnimationFrame(renderProjectCrop);
  };
  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    if (message) message.textContent = "That image could not be opened.";
  };
  image.src = objectUrl;
}

function renderProjectCrop() {
  if (!projectCropState) return;

  const viewport = $("#projectCropViewport");
  const imageElement = $("#projectCropImage");
  const width = viewport.clientWidth;
  const height = viewport.clientHeight;
  if (!width || !height) return;

  const image = projectCropState.image;
  const fit = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const scale = fit * projectCropState.zoom;
  const imageWidth = image.naturalWidth * scale;
  const imageHeight = image.naturalHeight * scale;
  const maxPanX = Math.max(0, (imageWidth - width) / 2);
  const maxPanY = Math.max(0, (imageHeight - height) / 2);
  projectCropState.panX = Math.max(-maxPanX, Math.min(maxPanX, projectCropState.panX));
  projectCropState.panY = Math.max(-maxPanY, Math.min(maxPanY, projectCropState.panY));

  imageElement.style.width = `${imageWidth}px`;
  imageElement.style.height = `${imageHeight}px`;
  imageElement.style.left = `${(width - imageWidth) / 2 + projectCropState.panX}px`;
  imageElement.style.top = `${(height - imageHeight) / 2 + projectCropState.panY}px`;
  projectCropState.scale = scale;
}

function closeProjectCropper() {
  $("#projectCropBackdrop")?.classList.remove("is-open");
  if (projectCropState?.objectUrl) URL.revokeObjectURL(projectCropState.objectUrl);
  projectCropState = null;
  photoTargetProjectId = "";
}

async function confirmProjectPhoto() {
  if (!projectCropState) return;

  const confirmButton = $("#projectCropConfirm");
  const message = $("#projectCropMessage");
  confirmButton.disabled = true;
  confirmButton.textContent = "Preparing photo...";

  try {
    const crop = projectCropState;
    const viewport = $("#projectCropViewport");
    const imageElement = $("#projectCropImage");
    const viewportRect = viewport.getBoundingClientRect();
    const imageRect = imageElement.getBoundingClientRect();
    const sourceX = Math.max(0, (viewportRect.left - imageRect.left) / crop.scale);
    const sourceY = Math.max(0, (viewportRect.top - imageRect.top) / crop.scale);
    const sourceWidth = Math.min(crop.image.naturalWidth - sourceX, viewportRect.width / crop.scale);
    const sourceHeight = Math.min(crop.image.naturalHeight - sourceY, viewportRect.height / crop.scale);
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 675;
    const context = canvas.getContext("2d");
    context.drawImage(crop.image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg", 0.86);

    if (photoTargetProjectId) {
      confirmButton.textContent = "Saving photo...";
      await api(`/api/admin/projects/${encodeURIComponent(photoTargetProjectId)}`, {
        method: "PATCH",
        body: JSON.stringify({ imageData })
      });
      closeProjectCropper();
      await loadAdmin();
      await loadProjects();
      return;
    }

    pendingProjectImageData = imageData;
    const preview = $("#projectPhotoPreview");
    preview.style.backgroundImage = `url("${imageData}")`;
    preview.style.display = "block";
    $("#projectPhotoMessage").textContent = "Photo ready · it will be saved when you add the project.";
    closeProjectCropper();
  } catch (error) {
    message.textContent = error.message || "Could not save this project photo.";
  } finally {
    confirmButton.disabled = false;
    confirmButton.textContent = "Confirm photo";
  }
}

installProjectPhotoField();

$("#projectForm").addEventListener("submit", async e => {
  e.preventDefault();

  const payload = Object.fromEntries(new FormData(e.target).entries());
  payload.progress = Number(payload.progress || 0);
  if (!pendingProjectImageData) {
    alert("Choose and confirm a project photo before adding this project.");
    return;
  }
  payload.imageData = pendingProjectImageData;

  try {
    await api("/api/admin/projects", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    e.target.reset();
    pendingProjectImageData = "";
    $("#projectPhotoPreview").style.backgroundImage = "";
    $("#projectPhotoPreview").style.display = "none";
    $("#projectPhotoMessage").textContent = "Choose and confirm a photo for this project.";
    await loadAdmin();
    await loadProjects();
  } catch (err) {
    alert(err.message);
  }
});

/* =========================================
   HERO PARTICLE / WAVE ANIMATION
========================================= */

const canvas = $("#heroCanvas");
const ctx = canvas.getContext("2d");
const hero = $(".hero");

let W = 0;
let H = 0;
let parts = [];
let mx = 0;
let my = 0;
let mouseActive = false;

function resize() {
  const rect = hero.getBoundingClientRect();

  W = rect.width;
  H = rect.height;

  // A lower pixel ratio reduces canvas work on high-resolution screens.
  const d = Math.min(devicePixelRatio || 1, 1.5);

  canvas.width = W * d;
  canvas.height = H * d;

  ctx.setTransform(d, 0, 0, d, 0, 0);

  // Fewer particles keep the effect light while preserving the look.
  parts = Array.from({
    length: Math.min(100, Math.max(45, Math.floor(W / 14)))
  }, () => ({
    x: Math.random() * W,
    y: Math.random() * H * 0.8,
    r: 0.5 + Math.random() * 1.5,
    v: 0.05 + Math.random() * 0.22,
    p: Math.random() * 6.28
  }));
}

function wave(base, amp, len, speed, alpha, time) {
  ctx.beginPath();

  for (let x = -20; x < W + 20; x += 10) {
    const y =
      base +
      Math.sin(x / len + time * speed) * amp +
      Math.sin(x / (len * 0.45) + time * speed * 0.7) * amp * 0.25;

    if (x === -20) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.strokeStyle = `rgba(159,210,244,${alpha})`;
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

function animate() {
  // Do not keep queueing frames while a details modal is open.
  heroAnimationFrame = null;

  if (cardZoomBusy || detailModalOpen || document.hidden) return;

  const time = performance.now();

  ctx.clearRect(0, 0, W, H);

  wave(H * 0.38, 32, 190, 0.00035, 0.25, time);
  wave(H * 0.51, 27, 245, -0.00028, 0.2, time);
  wave(H * 0.64, 39, 310, 0.00023, 0.17, time);

  const px = mouseActive ? mx : W * 0.55;
  const py = mouseActive ? my : H * 0.35;

  for (const p of parts) {
    p.y -= p.v;

    if (p.y < -5) {
      p.y = H * 0.8 + Math.random() * H * 0.18;
      p.x = Math.random() * W;
    }

    const dx = px - p.x;
    const dy = py - p.y;
    const dist = Math.hypot(dx, dy);

    const force =
      mouseActive && dist < 170
        ? (1 - dist / 170) * 13
        : 0;

    ctx.beginPath();

    ctx.arc(
      p.x - (dx / Math.max(dist, 1)) * force,
      p.y - (dy / Math.max(dist, 1)) * force,
      p.r,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = `rgba(220,246,255,${
      0.25 + 0.45 * (
        Math.sin(time * 0.002 + p.p) * 0.5 + 0.5
      )
    })`;

    ctx.fill();
  }

  heroAnimationFrame = requestAnimationFrame(animate);
}

hero.addEventListener("pointermove", e => {
  const rect = hero.getBoundingClientRect();

  mx = e.clientX - rect.left;
  my = e.clientY - rect.top;
  mouseActive = true;
});

hero.addEventListener("pointerleave", () => {
  mouseActive = false;
});

addEventListener("resize", resize);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    pauseHeroAnimation();
  } else {
    resumeHeroAnimation();
  }
});

resize();
resumeHeroAnimation();

/* =========================================
   RESTORE LOGIN SESSION AND LOAD WEBSITE
========================================= */

async function restoreSession() {
  try {
    const auth = await api("/api/auth/me");

    signedInUser = auth.user;
    updateLoginButton();
    return;
  } catch (_err) {
    // No active staff session; check resident session.
  }

  try {
    const resident = await api("/api/resident/me");

    signedInUser = resident.user;
    updateLoginButton();
  } catch (_err) {
    signedInUser = null;
    updateLoginButton();
  }
}

Promise.all([
  loadConfig(),
  loadServices(),
  loadProjects(),
  restoreSession()
]).catch(e => console.error(e));