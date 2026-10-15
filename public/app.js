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
    updateCommunityBoardControls();
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
    updateCommunityBoardControls();

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
  { id: 1, question: "Anong mga serbisyo ang available sa barangay?", answer: "Makikita sa Services section ang mga serbisyong nakalista sa website, kabilang ang barangay clearance, reklamo o concern, assistance inquiry, emergency guidance, business permit inquiry, at health services. Piliin ang serbisyo para makita ang mga nakasaad na hakbang. Maaaring magbago ang availability; kumpirmahin muna sa kaukulang tanggapan." },
  { id: 2, question: "Paano kumuha ng Barangay Clearance?", answer: "Sundin ang mga hakbang na ito para sa Barangay Clearance o Barangay Certification:\n1. Alamin muna kung anong eksaktong papel ang hinihingi ng tatanggap—Barangay Clearance, Certificate of Residency, o First-Time Jobseeker Certification. Magkaiba ang proseso at maaaring magkaiba ang bayad.\n2. Magtungo sa Barangay Hall ng Barangay 135 at sabihin ang layunin ng dokumento. Bago pumunta, itanong sa hall ang kasalukuyang checklist, office hours, kung kailangan ng appointment, at kung tumatanggap sila ng original o photocopy. Wala akong makitang opisyal na online checklist o fee schedule para mismo sa Barangay 135, kaya huwag umasa sa tantiyang halaga.\n3. Ihanda ang valid ID at dokumentong nagpapatunay ng tirahan bilang paghahanda; ang barangay ang magkukumpirma kung ano ang aktuwal na requirement at kung may karagdagang dokumento para sa layunin mo.\n4. Punan ang opisyal na request form, ipa-check ang mga dokumento, at kunin ang assessment o Order of Payment kung may singil.\n5. Magbayad lamang sa opisyal na cashier o City Treasurer na itinuro ng tanggapan. Humingi ng official receipt at claim stub/release schedule.\n\nKung first-time jobseeker ka at para sa employment ang clearance, sabihin ito agad at itanong ang certification para sa RA 11261. Kapag kwalipikado at nagamit mo pa lang nang isang beses ang benepisyo, waived ang government fees para sa covered pre-employment documents, kabilang ang barangay clearance. Kung City of Manila Certificate of Residency naman ang hinihingi, hiwalay na proseso iyon sa Barangay Hall clearance; tingnan ang kaugnay na tanong sa ibaba." },
  { id: 3, question: "Nawala ang ID ko. Saan ako pupunta?", answer: "Ang ahensiyang nag-issue ng ID ang dapat magbigay ng replacement procedure. Kung kailangan ng proof of residency o barangay certification, itanong sa Barangay Hall kung maaari itong maibigay at ano ang requirements. Kung pinaghihinalaan mong ninakaw ang ID o may panganib ng identity misuse, i-report ito sa issuing agency at sa kinauukulang awtoridad." },
  { id: 4, question: "Anong requirements ang dapat kong dalhin?", answer: "Nag-iiba ang checklist depende sa dokumento at purpose; walang iisang listahan para sa lahat. Para sa Barangay Clearance/Certification, ihanda muna ang valid ID at proof of address, at itanong sa Barangay 135 kung kailangan ang original, photocopies, request form, o ibang supporting paper. Ito ay paghahanda lamang—Barangay Hall ang dapat magkumpirma ng eksaktong checklist.\n\nKung first-time jobseeker, kailangan ang Barangay Certification na nagsasaad na first-time jobseeker ka para ma-avail ang one-time fee waiver sa mga covered pre-employment documents. Kung City of Manila Certificate of Residency ang hinihingi, ang Manila Citizen’s Charter ay naglilista ng: Barangay Clearance/Certification na pirmado ng Punong Barangay (valid nang 6 buwan), endorsement ng Manila Barangay Bureau para patunayan ang pirma, at personal letter na nagsasaad ng purpose.\n\nKung hinihingi ang cedula/Community Tax Certificate, hiwalay itong dokumento—hindi awtomatikong requirement sa bawat barangay clearance. Kumpirmahin sa tatanggap ng papeles kung kailangan talaga." },
  { id: 5, question: "Saan matatagpuan ang Barangay Hall?", answer: "Ang nakalistang lokasyon ay Barangay Hall, Barangay 135, Balut, Tondo, Manila. Tingnan ang Services section para sa tanggapan na aasikasuhin. Kumpirmahin ang kasalukuyang office hours at schedule bago bumiyahe dahil maaaring mag-iba ang oras kada serbisyo." },
  { id: 6, question: "Anong oras bukas ang barangay office?", answer: "Hindi ko ma-verify ang kasalukuyang office hours ng Barangay 135 mula sa opisyal na online source. Bago bumiyahe, kumpirmahin sa Barangay Hall ang araw at oras ng serbisyo, kung tumatanggap sila ng walk-in, at kung may cut-off para sa dokumentong kailangan mo. Maaaring magkaiba ang schedule ng bawat desk." },
  { id: 7, question: "Paano magsumite ng reklamo o concern?", answer: "Gamitin ang Complaints section ng website at ilarawan nang malinaw ang concern. Maaari kang magdagdag ng supporting photos o dokumento kung mayroon. Itago ang reference number kung ibinigay. Maaari ring magsumite sa receiving desk sa Barangay Hall at itanong ang susunod na hakbang, gaya ng mediation, investigation, o referral. Ang pagsusumite ay hindi garantiya ng agarang resolusyon." },
  { id: 8, question: "Paano ko susubaybayan ang complaint o request ko?", answer: "Buksan ang request o complaints page at gamitin ang reference number na ibinigay pagkatapos magsumite. Kung walang online status o kailangan ng update, makipag-ugnayan sa Barangay Hall at ihanda ang reference number at petsa ng submission. Huwag mag-post ng sensitibong personal na detalye sa pampublikong comment." },
  { id: 9, question: "Saan ako makakakuha ng assistance?", answer: "Magtanong sa Barangay Assistance / Social Services Desk kung may programang kasalukuyang bukas at kung pasok ka sa eligibility. Ipaliwanag kung anong tulong ang kailangan. Maaaring hingin ang valid ID, proof of residency, at supporting documents, pero nag-iiba ang requirements at schedule bawat programa. Ang inquiry ay hindi garantiya ng approval o benepisyo." },
  { id: 10, question: "Paano kumuha ng business permit?", answer: "Magtanong sa Barangay Business Desk para sa kasalukuyang checklist at proseso. Ihanda ang business details at anumang dokumentong mayroon ka; maaaring mag-iba ang requirements ayon sa uri at lokasyon ng negosyo. Ang barangay permit ay maaaring bahagi lamang ng proseso, kaya itanong kung kailangan ding mag-apply sa City of Manila o ibang ahensiya. Kumpirmahin ang fees at schedule sa opisina." },
  { id: 11, question: "Anong health services ang available?", answer: "Tingnan ang Services section para sa health services na nakalista. Kumpirmahin sa Barangay Health Services o health facility kung anong serbisyo ang available, schedule, eligibility, at documents na dadalhin. Hindi ito kapalit ng payong medikal. Kung may agarang panganib o malubhang sintomas, humingi agad ng tulong sa emergency responder o pinakamalapit na pasilidad." },
  { id: 12, question: "Ano ang gagawin kapag may emergency?", answer: "Kung may agarang panganib, sunog, malubhang aksidente, karahasan, o medical emergency, tumawag agad sa naaangkop na emergency service o humingi ng tulong sa pinakamalapit na ligtas na lugar. Ibigay ang eksaktong lokasyon at sundin ang responder. Hindi makakatawag ang guide na ito at wala itong kumpirmadong hotline number. Pagkatapos matiyak ang kaligtasan, kontakin ang barangay para sa follow-up kung naaangkop." },
  { id: 13, question: "Paano tingnan ang barangay projects?", answer: "Bisitahin ang Projects section para makita ang mga proyektong nakalista at ang status o progreso na ipinapakita. Ang website ay maaaring may demo o hindi pa updated na impormasyon. Para sa pinakabagong timeline, budget, o detalye ng proyekto, magtanong sa Barangay Hall." },
  { id: 14, question: "Paano mag-report ng basura o problema sa kapaligiran?", answer: "Isumite ang concern sa Complaints section o sa receiving desk ng Barangay Hall. Isama ang eksaktong lokasyon, maikling paglalarawan, at larawan kung ligtas at mayroon. Itago ang reference number kung ibinigay. Para sa kasalukuyang collection schedule o agarang panganib, kumpirmahin sa barangay o naaangkop na city service; hindi nakasaad dito ang verified schedule." },
  { id: 15, question: "Puwede bang online mag-submit ng request?", answer: "May ilang request o concern na maaaring isumite sa form ng website. Tingnan ang kaukulang Services o Complaints section at sundin ang fields na ipinapakita. Kung walang form para sa serbisyo, o kailangan ng original documents o personal assessment, itanong sa Barangay Hall kung paano magpatuloy. I-save ang reference number kung may ibinigay." },
  { id: 16, question: "Magkano ang bayad at saan ako magbabayad?", answer: "Wala akong ma-verify na kasalukuyang fee schedule para sa Barangay 135 Barangay Clearance, kaya hindi ako maglalagay ng presyo o estimate. Bago mag-file, hingin sa Barangay Hall ang assessment at kung saan ang opisyal na cashier. Magbayad lang ayon sa written/official assessment, humingi ng official receipt, at itago ang claim stub. Huwag magbigay ng bayad sa personal account o sa indibidwal na walang opisyal na resibo.\n\nMay fee waiver sa ilalim ng RA 11261 para sa kwalipikadong first-time jobseeker: one-time lang ito at kailangan ang Barangay Certification na nagpapatunay ng eligibility. Iba ito sa karaniwang clearance request.\n\nKung ang hinihingi ay City of Manila Certificate of Residency, hindi Barangay Clearance, sinasabi ng Manila Citizen’s Charter na ₱20 ang processing fee na binabayaran sa City Treasurer’s Office, at ang nakasaad na processing time ay 2 working days. Huwag ilapat ang halagang iyon sa ibang dokumento o barangay transaction." },
  { id: 17, question: "Hindi ko makita ang sagot sa tanong ko. Ano ang gagawin?", answer: "Limitado ang naka-save na impormasyon ng demo guide. Tingnan ang kaukulang page sa website o magtanong sa Barangay Hall, Barangay 135, Balut, Tondo, Manila. Kumpirmahin sa opisina ang anumang detalye na maaaring magbago gaya ng schedule, eligibility, requirements, fees, o contact numbers." },
  { id: 18, question: "Ano ang mga benepisyo kapag may Senior Citizen ID?", answer: "Ang Senior Citizen ID ay patunay ng edad at pagkakakilanlan para ma-avail ang mga benepisyong itinakda ng batas; hindi ibig sabihin na automatic na kwalipikado ang lahat sa bawat cash assistance. Kabilang sa pangunahing karapatan ang 20% discount at VAT exemption, kung naaangkop, sa mga saklaw na gamot at serbisyong medikal, pamasahe sa pampublikong transportasyon, restaurant, hotel at recreation services, at funeral/burial services para sa sariling gamit o pagkonsumo ng senior. Maaaring hingin ang OSCA ID o ibang kinikilalang proof of age.\n\nHindi awtomatikong 20% ang diskwento sa lahat ng grocery items. May hiwalay na 5% discount para sa mga kwalipikadong basic necessities at prime commodities, alinsunod sa kasalukuyang DTI/DA rules at limitasyon. Mayroon ding 5% diskwento sa tubig at kuryente kung pasok sa mga kondisyon, kabilang ang meter na nakapangalan sa senior at itinakdang consumption limits.\n\nMay benepisyong nakadepende sa eligibility at programa: ang DSWD Social Pension na ₱1,000 kada buwan ay para lamang sa kwalipikadong indigent seniors; ang libreng flu at pneumococcal vaccination sa ilalim ng batas ay para sa indigent senior patients. Binabanggit ng Manila OSCA application form ang ₱500 monthly monetary allowance, at inililista ng City Citizen’s Charter ang birthday cake program. Hindi ko ma-verify na birthday benefit ito na cash o na may bakuna sa Smokey Health Center/Tondo Medical Center tuwing March at September—kumpirmahin ang kasalukuyang schedule at eligibility sa Manila OSCA o health center.\n\nPara sa namatayan ng senior, nakasaad sa batas ang minimum na ₱2,000 death benefit assistance para sa pinakamalapit na surviving relative. Hindi ko ma-verify ang dagdag na ₱5,000 na lokal na assistance; itanong sa barangay o OSCA ang requirements at kung may hiwalay na programa." },
  { id: 19, question: "Sino ang maaaring makakuha ng DSWD Social Pension?", answer: "Hindi lahat ng may Senior Citizen ID ay awtomatikong makakakuha ng Social Pension. Ang ₱1,000 kada buwan ay para sa kwalipikadong indigent senior citizen—karaniwang 60 pataas, frail, may sakit o kapansanan, walang permanenteng pinagkakakitaan at regular na suportang pampamilya, at hindi tumatanggap ng ibang pension na nag-aalis sa eligibility. May assessment at validation; ang payout ay maaaring ibigay nang pinagsama-sama ayon sa iskedyul ng DSWD/LGU. Magtanong sa Barangay Hall, Manila OSCA, o DSWD kung bukas ang listahan, ano ang eksaktong pamantayan, at anong dokumento ang kailangan. Ang paglista o pag-aapply ay hindi garantiya ng approval." },
  { id: 20, question: "May libreng bakuna ba para sa senior citizens?", answer: "Nakasaad sa batas ang libreng influenza at pneumococcal vaccination para sa indigent senior citizen patients. Hindi nito pinatutunayan na libre ito para sa lahat ng senior o na may bakuna sa isang partikular na health center tuwing March at September. Tawagan o puntahan muna ang health center para kumpirmahin ang eligibility, stock, schedule, at kailangang dalhin. Kung bibili ng saklaw na bakuna, itanong kung paano ia-apply ang senior discount." },
  { id: 21, question: "May monthly allowance o birthday cash gift ba ang seniors sa Manila?", answer: "Binabanggit ng Manila OSCA Senior Citizen ID application form ang ₱500 monthly monetary allowance para sa kwalipikadong Manileño, na may requirements at masterlist. Dahil maaaring magbago ang programa at eligibility, kumpirmahin muna sa Manila OSCA kung kasalukuyang bukas ito at kung pasok ang aplikante. Sa City of Manila Citizen’s Charter na nakita ko, nakalista ang birthday cake na ipinapamahagi sa birth month—hindi ko nahanap doon ang kumpirmasyon ng age-based birthday cash gift. Itanong sa OSCA ang kasalukuyang benepisyo, requirements, at payout schedule." },
  { id: 22, question: "Ano ang burial o death benefit para sa senior citizen?", answer: "Sa ilalim ng Expanded Senior Citizens Act, may minimum na ₱2,000 death benefit assistance para sa pinakamalapit na surviving relative ng namatay na senior. Hiwalay pa rito ang 20% discount at VAT exemption, kung naaangkop, sa covered funeral at burial services para sa senior. Hindi ko ma-verify ang ₱2,000–₱5,000 na dagdag na assistance mula sa Barangay 135 o Office of the Mayor. Makipag-ugnayan sa Barangay Hall o Manila OSCA para sa kasalukuyang requirements, deadline, at kung may lokal na tulong na puwedeng idagdag." },
  { id: 23, question: "Paano kumuha ng barangay clearance bilang first-time jobseeker?", answer: "Sa ilalim ng First Time Jobseekers Assistance Act (RA 11261), maaaring ma-waive nang isang beses ang government fees para sa covered pre-employment documents, kabilang ang Barangay Clearance. Gawin ito:\n1. Tiyaking first-time jobseeker ka, Filipino citizen, aktibong naghahanap ng trabaho, at residente ng barangay na mag-iisyu ng certification.\n2. Sa Barangay 135 Hall, sabihin na mag-a-apply ka bilang first-time jobseeker sa ilalim ng RA 11261 at humingi ng Barangay Certification na nagpapatunay ng eligibility.\n3. Dalhin ang mga dokumentong hihingin ng barangay para patunayan ang identity, tirahan, at eligibility. Walang nakapost na official Barangay 135 checklist, kaya tawagan o puntahan muna sila para malaman ang eksaktong listahan at kung ilang kopya ang kailangan.\n4. Isumite ang certification sa barangay at hingin ang clearance na gagamitin sa employment. Itanong kung may form, claim stub, o release date.\n5. Ipakita ang certification sa ibang government offices kapag nag-aapply ng covered pre-employment documents. Ang waiver ay one-time; hindi nito awtomatikong sinasaklaw ang private-company fees, laboratory tests, o transactions na hindi kasama sa batas. Huwag magbayad ng covered government fee nang hindi muna kinukumpirma kung eligible ka." },
  { id: 24, question: "Paano kumuha ng City of Manila Certificate of Residency?", answer: "Iba ito sa Barangay Clearance. Ayon sa Manila Citizen’s Charter para sa Certification of Residency:\n1. Kumuha muna ng Barangay Clearance/Certification na pirmado ng Punong Barangay; nakasaad sa charter na valid ito nang 6 na buwan.\n2. Kumuha ng endorsement mula sa Manila Barangay Bureau na nagpapatunay sa pirma ng Punong Barangay.\n3. Gumawa ng personal letter na nagsasaad kung para saan ang City Certificate of Residency.\n4. Dalhin ang tatlong requirement sa Office of the Secretary to the Mayor at isumite sa tamang desk. Hihingi sila ng Order of Payment.\n5. Bayaran ang nakasaad na ₱20 sa City Treasurer’s Office, ibalik ang official receipt sa receiving desk, at kunin ang claim stub na may schedule ng release.\n\nNakalista sa charter ang 2 working days na processing time. Kumpirmahin muna sa City Hall/Manila Barangay Bureau kung pareho pa rin ang requirements, fee, office location, at schedule bago bumiyahe." },
  { id: 25, question: "Saan at paano kumuha ng cedula sa Manila?", answer: "Ang cedula ay Community Tax Certificate at hiwalay ito sa Barangay Clearance. Sa Manila Bureau of Permits Citizen’s Charter, nakalista ang pagkuha nito sa GoManila App: buksan ang app, piliin ang Payments, at piliin ang pagkuha/pagbabayad ng current-year Cedula. Maaari ring magtanong sa City Treasurer’s Office tungkol sa kasalukuyang in-person process.\n\nNag-iiba ang halaga ayon sa tax basis at sitwasyon, kaya huwag gumamit ng lumang estimate. Suriin ang official assessment bago magbayad at i-save ang official receipt/digital confirmation. Kumpirmahin din muna sa tanggapang humihingi ng cedula kung kailangan ito para sa dokumento o serbisyo mo." }
];

const GUIDE_BY_ID = new Map(GUIDE_QUESTIONS.map(item => [item.id, item]));
let guideLanguage = "tl";
const GUIDE_ENGLISH = {
  1: { question: "What services are available in the barangay?", answer: "The Services section lists the services shown on this website, including barangay clearance, complaints or concerns, assistance inquiries, emergency guidance, business permit inquiries, and health services. Choose a service to see its listed steps. Availability may change, so confirm with the appropriate office first." },
  2: { question: "How do I get a Barangay Clearance?", answer: "Follow these steps for a Barangay Clearance or Barangay Certification:\n1. First confirm exactly which document the receiving office requires—Barangay Clearance, Certificate of Residency, or First-Time Jobseeker Certification. Their processes and possible fees differ.\n2. Visit Barangay 135 Hall and state the document's purpose. Before going, ask the hall for its current checklist, office hours, walk-in/appointment rules, and whether it needs originals or photocopies. I could not find an official online checklist or fee schedule for Barangay 135, so do not rely on estimated prices.\n3. Prepare a valid ID and proof of address; the barangay must confirm the actual requirements and any supporting papers for your purpose.\n4. Complete the official request form, have the documents checked, and get an assessment or Order of Payment if a fee applies.\n5. Pay only at the official cashier or City Treasurer's Office specified by the office. Get an official receipt and claim stub/release schedule.\n\nIf you are a first-time jobseeker applying for employment, say so and ask for the RA 11261 certification. If eligible and you have not used the benefit before, government fees for covered pre-employment documents, including barangay clearance, are waived. If the requested document is a City of Manila Certificate of Residency, that is a separate process from barangay clearance; see the related question below." },
  3: { question: "I lost my ID. Where should I go?", answer: "The agency that issued your ID should provide the replacement procedure. If you need proof of residency or a barangay certification, ask the Barangay Hall whether it can issue one and what the requirements are. If you suspect the ID was stolen or your identity may be misused, report it to the issuing agency and the appropriate authorities." },
  4: { question: "What requirements should I bring?", answer: "The checklist varies by document and purpose; there is no single list for every request. For a Barangay Clearance/Certification, prepare a valid ID and proof of address, then ask Barangay 135 whether it needs originals, photocopies, a request form, or other supporting papers. This is only preparation—the Barangay Hall must confirm the exact checklist.\n\nIf you are a first-time jobseeker, you need a Barangay Certification stating that you are a first-time jobseeker to claim the one-time fee waiver for covered pre-employment documents. If the requested document is a City of Manila Certificate of Residency, the Manila Citizen's Charter lists: a Barangay Clearance/Certification signed by the Punong Barangay (valid for 6 months), an endorsement from the Manila Barangay Bureau authenticating the signature, and a personal letter stating the purpose.\n\nIf a cedula/Community Tax Certificate is requested, it is a separate document—not automatically required for every barangay clearance. Confirm with the receiving office whether it is actually needed." },
  5: { question: "Where is the Barangay Hall?", answer: "The location listed is Barangay Hall, Barangay 135, Balut, Tondo, Manila. Check the Services section to find the office that handles your request. Confirm current office hours and schedules before traveling, since hours may vary by service." },
  6: { question: "What time is the barangay office open?", answer: "I could not verify Barangay 135's current office hours from an official online source. Before traveling, confirm the service day and hours with the Barangay Hall, whether walk-ins are accepted, and whether there is a cut-off for your document. Different desks may have different schedules." },
  7: { question: "How do I submit a complaint or concern?", answer: "Use the website's Complaints section and describe your concern clearly. You may add supporting photos or documents if available. Keep the reference number if one is provided. You may also submit it at the receiving desk in the Barangay Hall and ask about the next steps, such as mediation, investigation, or referral. Submission does not guarantee an immediate resolution." },
  8: { question: "How can I track my complaint or request?", answer: "Open the requests or complaints page and use the reference number provided after submission. If there is no online status or you need an update, contact the Barangay Hall and have your reference number and submission date ready. Do not post sensitive personal details in public comments." },
  9: { question: "Where can I ask for assistance?", answer: "Ask the Barangay Assistance / Social Services Desk whether a program is currently open and whether you may be eligible. Explain what kind of help you need. A valid ID, proof of residency, and supporting documents may be requested, but requirements and schedules vary by program. An inquiry does not guarantee approval or benefits." },
  10: { question: "How do I get a business permit?", answer: "Ask the Barangay Business Desk for the current checklist and process. Prepare your business details and any documents you have; requirements may vary by business type and location. A barangay permit may be only one part of the process, so ask whether you also need to apply with the City of Manila or another agency. Confirm fees and schedules with the office." },
  11: { question: "What health services are available?", answer: "Check the Services section for the health services listed. Confirm with Barangay Health Services or a health facility which services are available, along with their schedule, eligibility, and required documents. This is not a substitute for medical advice. For immediate danger or severe symptoms, seek help from an emergency responder or the nearest facility." },
  12: { question: "What should I do in an emergency?", answer: "If there is immediate danger, a fire, serious accident, violence, or medical emergency, contact the appropriate emergency service or seek help at the nearest safe place right away. Give your exact location and follow the responder's instructions. This guide cannot place calls and does not have a verified hotline number. Once everyone is safe, contact the barangay for follow-up if appropriate." },
  13: { question: "How can I check barangay projects?", answer: "Visit the Projects section to see listed projects and their displayed status or progress. The website may contain demo or outdated information. For the latest timeline, budget, or project details, ask the Barangay Hall." },
  14: { question: "How do I report garbage or an environmental problem?", answer: "Submit the concern through the Complaints section or at the Barangay Hall receiving desk. Include the exact location, a brief description, and a photo if it is safe and available. Keep the reference number if one is provided. For the current collection schedule or immediate danger, confirm with the barangay or appropriate city service; no verified schedule is listed here." },
  15: { question: "Can I submit a request online?", answer: "Some requests or concerns may be submitted through a website form. Check the relevant Services or Complaints section and follow the fields shown. If there is no form for the service, or original documents or an in-person assessment are needed, ask the Barangay Hall how to proceed. Save the reference number if one is provided." },
  16: { question: "How much is the fee, and where do I pay?", answer: "I could not verify a current fee schedule for Barangay 135 Barangay Clearance, so I will not give an estimated price. Before filing, ask the Barangay Hall for an assessment and the official cashier location. Pay only against an official assessment, request an official receipt, and keep the claim stub. Do not send payment to a personal account or pay an individual who cannot issue an official receipt.\n\nRA 11261 provides a one-time fee waiver for eligible first-time jobseekers for covered government pre-employment documents. A Barangay Certification confirming eligibility is required. This is separate from an ordinary clearance request.\n\nIf the requested document is a City of Manila Certificate of Residency—not a Barangay Clearance—the Manila Citizen's Charter states a ₱20 processing fee paid at the City Treasurer's Office and a processing time of 2 working days. Do not apply that fee to other documents or barangay transactions." },
  17: { question: "I can't find the answer to my question. What should I do?", answer: "This demo guide has limited saved information. Check the relevant page on the website or ask the Barangay Hall, Barangay 135, Balut, Tondo, Manila. Confirm details that may change, such as schedules, eligibility, requirements, fees, or contact numbers, with the office." },
  18: { question: "What benefits come with a Senior Citizen ID?", answer: "A Senior Citizen ID is proof of age and identity for claiming benefits provided by law; it does not automatically qualify everyone for every cash assistance program. Key privileges include a 20% discount and VAT exemption, when applicable, on covered medicines and medical services, public transportation, restaurant, hotel and recreation services, and funeral/burial services for the senior's own use. An OSCA ID or another accepted proof of age may be requested.\n\nThe discount is not automatically 20% on every grocery item. A separate 5% discount may apply to qualified basic necessities and prime commodities under current DTI/DA rules and limits. A 5% water and electricity discount may also apply if the senior meets conditions, including meter registration and consumption limits.\n\nSome benefits depend on eligibility and current programs: the DSWD Social Pension of ₱1,000 per month is only for qualified indigent seniors; free flu and pneumococcal vaccination under the law is for indigent senior patients. Manila's OSCA application form mentions a ₱500 monthly monetary allowance, and the City Citizen's Charter lists a birthday cake program. I could not verify that the birthday benefit is cash or that vaccines are scheduled at Smokey Health Center/Tondo Medical Center in March and September, so confirm eligibility and current schedules with Manila OSCA or the health center.\n\nFor the death of a senior, the law provides a minimum ₱2,000 death benefit assistance to the nearest surviving relative. I could not verify the additional ₱5,000 local assistance; ask the barangay or OSCA about requirements and any separate program." },
  19: { question: "Who may qualify for the DSWD Social Pension?", answer: "Having a Senior Citizen ID does not automatically qualify someone for the Social Pension. The ₱1,000 monthly stipend is for qualified indigent senior citizens—generally people aged 60 or older who are frail, sickly, or have a disability, have no permanent source of income or regular family support, and do not receive another pension that disqualifies them. Applicants undergo assessment and validation; payouts may be grouped according to the DSWD/LGU schedule. Ask the Barangay Hall, Manila OSCA, or DSWD whether registration is open, what criteria currently apply, and which documents are needed. Applying or being listed does not guarantee approval." },
  20: { question: "Are free vaccines available for senior citizens?", answer: "The law provides free influenza and pneumococcal vaccination for indigent senior citizen patients. This does not confirm that vaccines are free for every senior or available at a specific health center in March and September. Contact the health center first to confirm eligibility, stock, schedule, and required documents. If purchasing a covered vaccine, ask how the senior discount is applied." },
  21: { question: "Is there a monthly allowance or birthday cash gift for Manila seniors?", answer: "Manila's OSCA Senior Citizen ID application form mentions a ₱500 monthly monetary allowance for qualified Manila residents, with requirements and an OSCA masterlist. Because programs and eligibility can change, confirm with Manila OSCA whether it is currently available and whether the applicant qualifies. The City of Manila Citizen's Charter I found lists a birthday cake distributed during the birth month; I could not verify an age-based birthday cash gift there. Ask OSCA about current benefits, requirements, and payout schedules." },
  22: { question: "What burial or death benefit is available for a senior citizen?", answer: "Under the Expanded Senior Citizens Act, a minimum ₱2,000 death benefit assistance is provided to the nearest surviving relative of a deceased senior. Separately, covered funeral and burial services for the senior are entitled to a 20% discount and VAT exemption, when applicable. I could not verify additional ₱2,000–₱5,000 assistance from Barangay 135 or the Office of the Mayor. Contact the Barangay Hall or Manila OSCA for current requirements, deadlines, and whether local assistance is available." },
  23: { question: "How do I get a barangay clearance as a first-time jobseeker?", answer: "Under the First Time Jobseekers Assistance Act (RA 11261), eligible first-time jobseekers may receive a one-time waiver of government fees for covered pre-employment documents, including Barangay Clearance. Follow these steps:\n1. Confirm that you are a Filipino citizen, a first-time jobseeker actively looking for work, and a resident of the barangay issuing the certification.\n2. At Barangay 135 Hall, say that you are applying as a first-time jobseeker under RA 11261 and request a Barangay Certification confirming eligibility.\n3. Bring the documents the barangay requires to verify your identity, residence, and eligibility. Barangay 135 has no published official checklist that I could find, so contact or visit the hall first to confirm the exact list and number of copies.\n4. Submit the certification and request the clearance for employment. Ask whether there is a form, claim stub, or release date.\n5. Present the certification to other government offices when requesting covered pre-employment documents. The waiver is one-time and does not automatically cover private-company charges, laboratory tests, or transactions not included in the law. Before paying, confirm whether you qualify for the waiver." },
  24: { question: "How do I get a City of Manila Certificate of Residency?", answer: "This is separate from a Barangay Clearance. The Manila Citizen's Charter for Certification of Residency lists these steps:\n1. First obtain a Barangay Clearance/Certification signed by the Punong Barangay; the charter states that it is valid for 6 months.\n2. Get an endorsement from the Manila Barangay Bureau authenticating the Punong Barangay's signature.\n3. Write a personal letter stating the purpose of the City Certificate of Residency.\n4. Submit all three requirements to the appropriate desk at the Office of the Secretary to the Mayor. They will issue an Order of Payment.\n5. Pay the listed ₱20 at the City Treasurer's Office, return the official receipt to the receiving desk, and keep the claim stub with the release schedule.\n\nThe charter lists 2 working days for processing. Confirm that the requirements, fee, office location, and schedule are still current with City Hall/Manila Barangay Bureau before traveling." },
  25: { question: "Where and how can I get a cedula in Manila?", answer: "A cedula is a Community Tax Certificate and is separate from a Barangay Clearance. Manila's Bureau of Permits Citizen's Charter lists this GoManila App process: open the app, choose Payments, then choose the current-year Cedula application/payment. You may also ask the City Treasurer's Office about the current in-person process.\n\nThe amount varies according to the applicable tax basis and circumstances, so do not rely on an old estimate. Check the official assessment before paying and save the official receipt or digital confirmation. Also confirm with the receiving office whether a cedula is required for your document or service." }
};
const GUIDE_FOLLOWUPS = {
  1: [2, 7, 9, 12, 10, 11], 2: ["clearance-steps", 4, 16, 23, 24, 25, 5, 6],
  3: [4, 5, 17], 4: [2, 7, 9, 10, 5, 16, 23, 24, 25], 5: [6, 2, 7, 9],
  6: [5, 2, 7], 7: [8, 14, 15, 16], 8: [7, 15, 17],
  9: [4, 5, 16, 15], 10: [4, 5, 6, 16], 11: [12, 5, 6, 4],
  12: [11, 5, 6], 13: [1, 14, 17], 14: [7, 8, 12, 15],
  15: [2, 7, 8, 4], 16: [2, 9, 10, 5, 23, 24, 25], 17: [1, 4, 5, 6, 16],
  18: [19, 20, 21, 22, 4], 19: [18, 4, 21], 20: [18, 11, 12],
  21: [18, 19, 22, 4], 22: [18, 21, 16],
  23: [2, 4, 16, 25], 24: [2, 4, 16, 25], 25: [2, 4, 16, 24]
};
const GUIDE_SOURCES = {
  2: [
    { label: "Republic Act 7160: barangay clearance and reasonable fees", url: "https://officialgazette.gov.ph/1991/10/10/republic-act-no-7160/" },
    { label: "Manila Citizen's Charter: Certification of Residency", url: "https://www.manila.gov.ph/wp-content/uploads/2024/08/1-Office-of-the-Mayor-Vice-Mayor-City-Administrator_.pdf" },
    { label: "RA 11261: First Time Jobseekers Assistance Act", url: "https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/87437" }
  ],
  4: [
    { label: "Manila Citizen's Charter: Certification of Residency", url: "https://www.manila.gov.ph/wp-content/uploads/2024/08/1-Office-of-the-Mayor-Vice-Mayor-City-Administrator_.pdf" },
    { label: "RA 11261: First Time Jobseekers Assistance Act", url: "https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/87437" }
  ],
  16: [
    { label: "Republic Act 7160: barangay fees", url: "https://officialgazette.gov.ph/1991/10/10/republic-act-no-7160/" },
    { label: "RA 11261: First Time Jobseekers Assistance Act", url: "https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/87437" },
    { label: "Manila Citizen's Charter: fee for Certification of Residency", url: "https://www.manila.gov.ph/wp-content/uploads/2024/08/1-Office-of-the-Mayor-Vice-Mayor-City-Administrator_.pdf" }
  ],
  "clearance-steps": [
    { label: "RA 11261: First Time Jobseekers Assistance Act", url: "https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/87437" },
    { label: "Republic Act 7160: barangay clearance", url: "https://officialgazette.gov.ph/1991/10/10/republic-act-no-7160/" }
  ],
  23: [
    { label: "RA 11261: First Time Jobseekers Assistance Act", url: "https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/87437" },
    { label: "Civil Service Commission: FTJAA eligibility", url: "https://csc.gov.ph/csc-gov-t-agencies-sign-implementing-guidelines-for-first-time-jobseekers-law" }
  ],
  24: [
    { label: "City of Manila Citizen's Charter: Certification of Residency", url: "https://www.manila.gov.ph/wp-content/uploads/2024/08/1-Office-of-the-Mayor-Vice-Mayor-City-Administrator_.pdf" }
  ],
  25: [
    { label: "Manila Bureau of Permits Citizen's Charter: Cedula process", url: "https://www.manila.gov.ph/wp-content/uploads/2021/10/2021-CITIZENS-CHARTER-HANDBOOK-BOP.pdf" }
  ],
  18: [
    { label: "NCSC: Senior citizen rights and privileges", url: "https://www.ncsc.gov.ph/post/what-are-the-rights-and-privileges-of-senior-citizens" },
    { label: "DSWD: Social Pension Program", url: "https://www.dswd.gov.ph/social-pension/" },
    { label: "City of Manila: Senior Citizen ID Application Form", url: "https://manila.gov.ph/wp-content/uploads/2024/06/SENIOR-CITIZEN-ID-APPLICATION-FORM.pdf" }
  ],
  19: [
    { label: "DSWD: Social Pension eligibility", url: "https://www.dswd.gov.ph/only-indigent-seniors-are-eligible-for-php1k-monthly-social-pension-dswd-exec/" }
  ],
  20: [
    { label: "NCSC: Senior citizen rights, discounts, and vaccination", url: "https://www.ncsc.gov.ph/post/what-are-the-rights-and-privileges-of-senior-citizens" }
  ],
  21: [
    { label: "City of Manila: Senior Citizen ID Application Form", url: "https://manila.gov.ph/wp-content/uploads/2024/06/SENIOR-CITIZEN-ID-APPLICATION-FORM.pdf" },
    { label: "City of Manila: Citizen's Charter – OSCA services", url: "https://www.manila.gov.ph/wp-content/uploads/2024/08/1-Office-of-the-Mayor-Vice-Mayor-City-Administrator_.pdf" }
  ],
  22: [
    { label: "NCSC: Senior citizen rights and death benefit", url: "https://www.ncsc.gov.ph/post/what-are-the-rights-and-privileges-of-senior-citizens" }
  ]
};

const GUIDE_CLEARANCE_STEPS = {
  id: "clearance-steps",
  question: "Ano ang proseso?",
  answer: "1. Kumpirmahin muna kung Barangay Clearance, Barangay Certification, o City of Manila Certificate of Residency ang hinihingi; magkaiba ang proseso.\n2. Para sa Barangay Clearance/Certification, pumunta o makipag-ugnayan sa Barangay 135 Hall at hingin ang kasalukuyang checklist, oras, at fee assessment. Hindi verified online ang eksaktong checklist o presyo ng Barangay 135.\n3. Ihanda ang valid ID at proof of address, pero sundin ang eksaktong dokumentong kukumpirmahin ng barangay para sa purpose mo.\n4. Punan ang official request form, isumite ang requirements, at hintayin ang pagsusuri.\n5. Kung may bayad, kunin muna ang assessment/Order of Payment at magbayad lang sa opisyal na cashier. Itago ang official receipt at claim stub.\n6. Kung first-time jobseeker ka, sabihin ito bago magbayad at itanong ang RA 11261 fee waiver. Kung City Certificate of Residency ang kailangan, tingnan ang hiwalay na step-by-step sa mga kaugnay na tanong."
};
const GUIDE_CLEARANCE_STEPS_EN = {
  id: "clearance-steps",
  question: "What is the process?",
  answer: "1. First confirm whether the receiving office wants a Barangay Clearance, Barangay Certification, or City of Manila Certificate of Residency; these are different documents with different processes.\n2. For a Barangay Clearance/Certification, contact or visit Barangay 135 Hall and request the current checklist, hours, and fee assessment. I could not verify Barangay 135's exact checklist or price online.\n3. Prepare a valid ID and proof of address, but follow the exact documents the barangay confirms for your purpose.\n4. Complete the official request form, submit the requirements, and wait for staff to check them.\n5. If a fee applies, get the assessment/Order of Payment first and pay only at the official cashier. Keep the official receipt and claim stub.\n6. If you are a first-time jobseeker, mention this before paying and ask about the RA 11261 fee waiver. If you need a City Certificate of Residency, see the separate step-by-step in the related questions."
};

function guideText(item, field) {
  if (field === "question" && item.id === 17 && item.question !== GUIDE_BY_ID.get(17).question) {
    return item.question;
  }
  if (guideLanguage === "en") {
    if (item.id === "clearance-steps") return GUIDE_CLEARANCE_STEPS_EN[field] || item[field];
    return GUIDE_ENGLISH[item.id]?.[field] || item[field];
  }
  return item[field];
}

function guideFollowupPrompt(item) {
  if (item.id === 2 || item.id === "clearance-steps") {
    return guideLanguage === "en"
      ? "Would you like to know anything else about clearance?"
      : "May gusto ka pa bang malaman tungkol sa clearance?";
  }
  return guideLanguage === "en"
    ? "Would you like to know anything else about this?"
    : "May gusto ka pa bang malaman tungkol dito?";
}

function installGuideChatStyles() {
  if ($("#guideChatStyles")) return;

  const style = document.createElement("style");
  style.id = "guideChatStyles";
  style.textContent = [
    "#guideResult { display:none; box-sizing:border-box; width:100%; height:auto; min-height:180px; max-height:min(68vh, 680px); overflow-y:auto; overflow-x:hidden; padding:18px; border:1px solid #d6e5f5; border-radius:18px; background:#f7fbff; scroll-behavior:smooth; transition:max-height .25s ease, padding .25s ease; }",
    "#guideResult:not(.hidden) { display:block!important; }",
    ".guide-chat-row { display:flex!important; width:100%; height:auto!important; min-height:0!important; margin:10px 0; padding:0; align-items:flex-start!important; flex:none!important; }",
    ".guide-chat-row.user-row { justify-content:flex-end!important; }",
    ".guide-chat-row.ai-row { justify-content:flex-start!important; }",
    ".guide-chat-bubble { display:block!important; box-sizing:border-box; width:fit-content!important; max-width:min(78%,560px)!important; min-width:0!important; height:auto!important; padding:11px 15px!important; border-radius:16px; overflow-wrap:anywhere; line-height:1.5; }",
    ".user-bubble { background:#376e6f!important; color:#fff!important; border-bottom-right-radius:5px; }",
    ".ai-bubble { background:#e9f1fa!important; color:#172b4d!important; border-bottom-left-radius:5px; }",
    ".guide-chat-label { display:block!important; margin:0 0 5px!important; font-size:10px; line-height:1.3; font-weight:800; letter-spacing:.5px; opacity:.75; }",
    ".guide-chat-text { display:block!important; margin:0!important; padding:0!important; font-size:14px; line-height:1.55; white-space:pre-wrap; overflow-wrap:anywhere; }",
    ".guide-question-menu { margin:14px 0; padding:14px; border:1px solid #d6e5f5; border-radius:16px; background:#fff; }",
    ".guide-language-switch { display:flex; justify-content:flex-end; gap:6px; margin:0 0 12px; }",
    ".guide-reset-button { margin-right:auto; padding:6px 11px; border:1px solid #c7d9eb; border-radius:999px; background:#fff; color:#234b61; font:inherit; font-size:12px; font-weight:700; cursor:pointer; transition:background .18s ease,color .18s ease,border-color .18s ease,transform .18s ease; }",
    ".guide-reset-button:hover { transform:translateY(-1px); border-color:#376e6f; background:#eaf5f4; }",
    ".guide-language-button { padding:6px 11px; border:1px solid #c7d9eb; border-radius:999px; background:#fff; color:#234b61; font:inherit; font-size:12px; font-weight:700; cursor:pointer; transition:background .18s ease,color .18s ease,border-color .18s ease,transform .18s ease; }",
    ".guide-language-button:hover { transform:translateY(-1px); border-color:#376e6f; }",
    ".guide-language-button[aria-pressed='true'] { background:#376e6f; border-color:#376e6f; color:#fff; }",
    ".guide-question-menu-title { margin:0 0 10px; color:#234b61; font-size:12px; font-weight:800; letter-spacing:.06em; }",
    ".guide-question-list { display:flex; flex-wrap:wrap; gap:8px; margin:10px 0 2px; }",
    ".ai-bubble .guide-question-list { margin:12px 0 0; padding-top:11px; border-top:1px solid rgba(35,75,97,.16); }",
    ".guide-followup-prompt { display:block; margin:12px 0 0; color:#234b61; font-size:13px; font-weight:700; }",
    ".guide-sources { display:flex; flex-wrap:wrap; gap:6px 12px; margin:10px 0 0; padding-top:9px; border-top:1px solid rgba(35,75,97,.12); font-size:12px; }",
    ".guide-sources-label { flex-basis:100%; color:#234b61; font-weight:800; }",
    ".guide-sources a { color:#235e67; text-decoration:underline; text-underline-offset:2px; }",
    ".guide-question-button { padding:9px 13px; border:1px solid #c7d9eb; border-radius:999px; background:#fff; color:#234b61; font:inherit; font-size:13px; text-align:left; cursor:pointer; }",
    ".guide-question-button:hover, .guide-question-button:focus-visible { border-color:#376e6f; background:#eaf5f4; outline:2px solid #376e6f; outline-offset:2px; }",
    ".guide-question-button:active { transform:scale(.97); }",
    ".guide-question-button { transition:background .18s ease, border-color .18s ease, transform .18s ease; }",
    "#guideForm { display:none!important; }",
    ".guide-main > .chips { display:none!important; }",
    "@media (max-width:600px) { #guideResult { min-height:160px; max-height:68vh; padding:12px; } .guide-chat-bubble { max-width:88%!important; } }"
  ].join("\n");

  document.head.appendChild(style);
}

function renderGuideMessages(messages = guideHistory) {
  const result = $("#guideResult");
  if (!result) return;

  installGuideChatStyles();
  result.classList.remove("hidden");

  result.innerHTML = "";

  messages.forEach(message => {
    const isUser = message.role === "user";
    const row = document.createElement("div");
    row.className = "guide-chat-row " + (isUser ? "user-row" : "ai-row");

    const bubble = document.createElement("div");
    bubble.className = "guide-chat-bubble " + (isUser ? "user-bubble" : "ai-bubble");

    const label = document.createElement("div");
    label.className = "guide-chat-label";
    label.textContent = isUser
      ? (guideLanguage === "en" ? "YOUR QUESTION" : "NAPILI MONG TANONG")
      : "BANTAY AGAPAI";

    const text = document.createElement("div");
    text.className = "guide-chat-text";
    text.textContent = message.guideItem
      ? guideText(message.guideItem, isUser ? "question" : "answer")
      : message.content;

    bubble.append(label, text);

    const sources = !isUser && message.guideItem ? GUIDE_SOURCES[message.guideItem.id] : null;
    if (sources?.length) {
      const sourceList = document.createElement("div");
      sourceList.className = "guide-sources";
      const sourceLabel = document.createElement("span");
      sourceLabel.className = "guide-sources-label";
      sourceLabel.textContent = guideLanguage === "en" ? "Official references" : "Opisyal na sanggunian";
      sourceList.appendChild(sourceLabel);
      sources.forEach(source => {
        const link = document.createElement("a");
        link.href = source.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = source.label;
        sourceList.appendChild(link);
      });
      bubble.appendChild(sourceList);
    }

    if (!isUser && message.followups?.length) {
      const prompt = document.createElement("div");
      prompt.className = "guide-followup-prompt";
      prompt.textContent = message.guideItem
        ? guideFollowupPrompt(message.guideItem)
        : (guideLanguage === "en" ? "Would you like to know anything else about this?" : "May gusto ka pa bang malaman tungkol dito?");
      bubble.append(prompt, makeGuideQuestionList(message.followups, "Mga kaugnay na tanong"));
    }

    row.appendChild(bubble);
    result.appendChild(row);
  });

  requestAnimationFrame(() => {
    result.scrollTop = result.scrollHeight;
  });
}

function makeGuideQuestionList(questionItems = GUIDE_QUESTIONS, label = "Pumili ng tanong") {
  const questionList = document.createElement("div");
  questionList.className = "guide-question-list";
  questionList.setAttribute("aria-label", label);

  questionItems.forEach(item => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "guide-question-button";
    button.textContent = guideText(item, "question");
    button.addEventListener("click", () => showGuideAnswer(item));
    questionList.appendChild(button);
  });

  return questionList;
}

function getGuideFollowups(item) {
  const followups = item.id === 2 || item.id === "clearance-steps"
    ? [GUIDE_CLEARANCE_STEPS, ...GUIDE_FOLLOWUPS[2].filter(id => id !== "clearance-steps").map(id => GUIDE_BY_ID.get(id))]
    : (GUIDE_FOLLOWUPS[item.id] || [17]).map(id => GUIDE_BY_ID.get(id));
  return followups.filter(Boolean);
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
  const questionMenu = document.createElement("div");
  questionMenu.id = "guideQuestionMenu";
  questionMenu.className = "guide-question-menu";
  const languageSwitch = document.createElement("div");
  languageSwitch.className = "guide-language-switch";
  languageSwitch.setAttribute("role", "group");
  languageSwitch.setAttribute("aria-label", guideLanguage === "en" ? "Guide language" : "Wika ng gabay");
  const resetButton = document.createElement("button");
  resetButton.type = "button";
  resetButton.className = "guide-reset-button";
  resetButton.textContent = guideLanguage === "en" ? "Reset conversation" : "I-reset ang usapan";
  resetButton.setAttribute("aria-label", resetButton.textContent);
  resetButton.addEventListener("click", () => {
    guideHistory.length = 0;
    renderGuideQuestions();
  });
  languageSwitch.appendChild(resetButton);
  [["en", "English"], ["tl", "Tagalog"]].forEach(([language, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "guide-language-button";
    button.textContent = label;
    button.setAttribute("aria-pressed", String(guideLanguage === language));
    button.addEventListener("click", () => {
      if (guideLanguage === language) return;
      guideLanguage = language;
      renderGuideQuestions();
    });
    languageSwitch.appendChild(button);
  });
  const menuTitle = document.createElement("p");
  menuTitle.className = "guide-question-menu-title";
  menuTitle.textContent = guideLanguage === "en" ? "QUESTIONS YOU CAN ASK" : "MGA PUWEDENG ITANONG";
  questionMenu.append(languageSwitch, menuTitle, makeGuideQuestionList(
    GUIDE_QUESTIONS,
    guideLanguage === "en" ? "Questions about the barangay" : "Lahat ng tanong tungkol sa barangay"
  ));

  const existingMenu = $("#guideQuestionMenu");
  if (existingMenu) existingMenu.remove();
  result.parentNode.insertBefore(questionMenu, result);

  if (guideHistory.length) {
    renderGuideMessages(guideHistory);
  } else {
    result.innerHTML =
      '<div class="guide-chat-row ai-row">' +
        '<div class="guide-chat-bubble ai-bubble">' +
          '<div class="guide-chat-label">BANTAY AGAPAI</div>' +
          `<div class="guide-chat-text">${guideLanguage === "en" ? "Hello! Choose a question to learn about barangay services." : "Kumusta! Piliin ang tanong na gusto mong itanong tungkol sa barangay."}</div>` +
        '</div>' +
      '</div>';
  }
}

function showGuideAnswer(item) {
  const result = $("#guideResult");
  if (!result || !item) return;

  guideHistory.push(
    { role: "user", content: item.question, guideItem: item },
    {
      role: "assistant",
      content: item.answer,
      guideItem: item,
      followups: getGuideFollowups(item)
    }
  );

  renderGuideMessages(guideHistory);
}

function findGuideAnswer(question) {
  const text = String(question || "")
    .toLocaleLowerCase("fil")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (/\b(social pension|socpen|dswd pension|indigent senior)\b/.test(text)) return GUIDE_BY_ID.get(19);
  if (/\b(vaccine|vaccination|bakuna|flu shot|pneumococcal|pneumonia)\b/.test(text)) return GUIDE_BY_ID.get(20);
  if (/\b(allowance|birthday cash|cash gift|birthday cake|monthly allowance)\b/.test(text)) return GUIDE_BY_ID.get(21);
  if (/\b(burial|death benefit|burial assistance|namatay na senior)\b/.test(text)) return GUIDE_BY_ID.get(22);
  if (/\b(senior citizen|senior id|osca id|senior benefits|benepisyo ng senior|senior citizen benefits)\b/.test(text)) return GUIDE_BY_ID.get(18);

  if (/\b(first time jobseeker|first time job seeker|first-time jobseeker|first-time job seeker|ra 11261)\b/.test(text)) return GUIDE_BY_ID.get(23);
  if (/\b(city of manila certificate of residency|certificate of residency|certification of residency|residency certificate)\b/.test(text)) return GUIDE_BY_ID.get(24);
  if (/\b(cedula|community tax certificate)\b/.test(text)) return GUIDE_BY_ID.get(25);
  if (/\b(bayad|fee|fees|resibo|magkano|payment|presyo|singil|cost)\b/.test(text)) return GUIDE_BY_ID.get(16);
  if (/\b(requirement|requirements|kailangan|papeles|dokumento|checklist|dalhin)\b/.test(text)) return GUIDE_BY_ID.get(4);
  if (/\b(clearance|barangay certification)\b/.test(text)) return GUIDE_BY_ID.get(2);
  if (/\b(id|identity|ninakaw|nawala)\b/.test(text)) return GUIDE_BY_ID.get(3);
  if (/\b(location|address|lokasyon|matatagpuan|barangay hall)\b/.test(text) && /\b(saan|nasaan|address|location|matatagpuan|barangay hall)\b/.test(text)) return GUIDE_BY_ID.get(5);
  if (/\b(oras|schedule|open|bukas|office hours)\b/.test(text)) return GUIDE_BY_ID.get(6);
  if (/\b(assistance|assists|tulong|ayuda|social services)\b/.test(text)) return GUIDE_BY_ID.get(9);
  if (/\b(basura|kapaligiran|waste|garbage|collection)\b/.test(text)) return GUIDE_BY_ID.get(14);
  if (/\b(track|subaybayan|status|reference number|update)\b/.test(text)) return GUIDE_BY_ID.get(8);
  if (/\b(complaint|reklamo|magreklamo|sumbong|concern|report)\b/.test(text)) return GUIDE_BY_ID.get(7);
  if (/\b(business permit|permit sa negosyo|negosyo|business)\b/.test(text)) return GUIDE_BY_ID.get(10);
  if (/\b(health|kalusugan|health center|clinic|klinika|bakuna|medical|gamot|doktor)\b/.test(text)) return GUIDE_BY_ID.get(11);
  if (/\b(emergency|sunog|aksidente|nasugatan|nasaktan|panganib|karahasan|agarang tulong)\b/.test(text)) return GUIDE_BY_ID.get(12);
  if (/\b(project|proyekto|monitoring|progress|progreso|budget)\b/.test(text)) return GUIDE_BY_ID.get(13);
  if (/\b(online|submit|request|form)\b/.test(text)) return GUIDE_BY_ID.get(15);
  if (/\b(service|services|serbisyo|serbisyong)\b/.test(text)) return GUIDE_BY_ID.get(1);

  return {
    question: String(question || "").trim() || "Iba pang tanong",
    answer: GUIDE_BY_ID.get(17).answer,
    id: 17
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

const complaintPhotoInput = $("#complaintPhoto");
const complaintPhotoPreview = $("#complaintPhotoPreview");
const complaintPhotoName = $("#complaintPhotoName");
const complaintPhotoRemove = $("#complaintPhotoRemove");
let complaintPhotoPreviewUrl = "";

function clearComplaintPhoto() {
  if (complaintPhotoInput) complaintPhotoInput.value = "";
  complaintPhotoPreview.hidden = true;
  complaintPhotoPreview.removeAttribute("src");
  complaintPhotoName.textContent = "No photo selected";
  complaintPhotoRemove.hidden = true;
  if (complaintPhotoPreviewUrl) URL.revokeObjectURL(complaintPhotoPreviewUrl);
  complaintPhotoPreviewUrl = "";
}

complaintPhotoInput?.addEventListener("change", () => {
  const file = complaintPhotoInput.files?.[0];
  const message = $("#complaintMessage");

  if (complaintPhotoPreviewUrl) URL.revokeObjectURL(complaintPhotoPreviewUrl);
  complaintPhotoPreviewUrl = "";
  complaintPhotoPreview.hidden = true;
  complaintPhotoPreview.removeAttribute("src");
  complaintPhotoName.textContent = file?.name || "No photo selected";
  complaintPhotoRemove.hidden = !file;
  message.textContent = "";

  if (!file) return;

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    clearComplaintPhoto();
    message.textContent = "Please choose a JPG, PNG, or WebP image.";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    clearComplaintPhoto();
    message.textContent = "Choose a photo smaller than 5 MB.";
    return;
  }

  complaintPhotoPreviewUrl = URL.createObjectURL(file);
  complaintPhotoPreview.src = complaintPhotoPreviewUrl;
  complaintPhotoPreview.hidden = false;
});

complaintPhotoRemove?.addEventListener("click", () => {
  clearComplaintPhoto();
  $("#complaintMessage").textContent = "";
});

$("#complaintForm").addEventListener("submit", async e => {
  e.preventDefault();

  const form = e.currentTarget;
  const payload = Object.fromEntries(new FormData(form).entries());
  const photo = complaintPhotoInput?.files?.[0];
  const message = $("#complaintMessage");
  const submitButton = form.querySelector('button[type="submit"], button:not([type])');
  const originalButtonText = submitButton?.textContent || "Submit Concern";
  delete payload.photo;

  try {
    if (photo) {
      payload.imageData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Could not read the selected photo."));
        reader.readAsDataURL(photo);
      });
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";
    }

    const data = await api("/api/complaints", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    message.textContent = `${data.message} Reference: ${data.reference}`;
    form.reset();
    clearComplaintPhoto();
  } catch (err) {
    message.textContent = err.message;
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
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
    updateCommunityBoardControls();
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
   COMMUNITY ANNOUNCEMENT BOARD
========================================= */

let communityAnnouncements = [];

function updateCommunityBoardControls() {
  const postButton = $("#communityBoardPostButton");
  if (postButton) {
    postButton.hidden = signedInUser?.role !== "staff";
  }
}

function announcementTypeLabel(type) {
  return ({
    "lost-found": "Lost & Found",
    "missing-pet": "Missing Pet",
    "missing-person": "Missing Person"
  })[type] || "Announcement";
}

function formatAnnouncementDate(value) {
  if (!value) return "Not specified";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return esc(value);
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric", month: "long", day: "numeric"
  }).format(date);
}

function getFilteredAnnouncements() {
  const activeTab = $("#communityBoardTabs [aria-pressed='true']")?.dataset.announcementType || "all";
  const category = $("#communityBoardCategory")?.value || "all";
  const search = ($("#communityBoardSearch")?.value || "").trim().toLowerCase();
  const sort = $("#communityBoardSort")?.value || "newest";

  const results = communityAnnouncements.filter(item => {
    const type = item.type || item.category || "lost-found";
    const matchesTab = activeTab === "all" || type === activeTab;
    const matchesCategory = category === "all" || type === category;
    const searchable = [item.title, item.description, item.location, item.reporterName]
      .filter(Boolean).join(" ").toLowerCase();
    return matchesTab && matchesCategory && (!search || searchable.includes(search));
  });

  results.sort((a, b) => {
    const first = new Date(a.createdAt || a.date || 0).getTime() || 0;
    const second = new Date(b.createdAt || b.date || 0).getTime() || 0;
    return sort === "oldest" ? first - second : second - first;
  });

  return results;
}

function renderCommunityAnnouncements() {
  const list = $("#communityAnnouncementList");
  if (!list) return;

  const announcements = getFilteredAnnouncements();
  if (!announcements.length) {
    list.innerHTML = `
      <div class="community-announcement-empty">
        <div class="community-announcement-empty-icon" aria-hidden="true">⌕</div>
        <h2>No announcements found</h2>
        <p>Try another category or search term, or check back later for updates.</p>
      </div>`;
    return;
  }

  list.innerHTML = announcements.map(item => {
    const type = item.type || item.category || "lost-found";
    const isFound = String(item.status || "").toLowerCase() === "found";
    const image = typeof item.image === "string" && item.image
      ? `<img class="community-announcement-image" src="${esc(item.image)}" alt="Photo for ${esc(item.title || "announcement")}">`
      : "";
    const contact = item.contact
      ? `<div><strong>Contact:</strong> ${esc(item.contact)}</div>`
      : "";
    const reporter = item.reporterName
      ? `<div><strong>Reported by:</strong> ${esc(item.reporterName)}</div>`
      : "";
    const staffActions = signedInUser?.role === "staff"
      ? `<div class="announcement-admin-actions" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">
          <button type="button" data-announcement-edit="${esc(item.id)}" style="padding:9px 13px;border:1px solid #c9d9ed;border-radius:8px;background:#edf5ff;color:#123f83;font:inherit;font-size:13px;font-weight:800;cursor:pointer">Edit Announcement</button>
          <button type="button" class="announcement-found-button" data-announcement-status-toggle="${esc(item.id)}" data-current-status="${isFound ? "found" : "missing"}" style="padding:9px 13px;border-radius:8px;${isFound ? "background:#eaf1fb;color:#123f83;border:1px solid #c9d9ed" : "background:#167342;color:#fff;border:0"};font:inherit;font-size:13px;font-weight:800;cursor:pointer">${isFound ? "Undo: Mark as Missing" : "Mark as Found"}</button>
        </div>`
      : "";

    return `
      <article class="community-announcement-card">
        <div class="community-announcement-copy">
          <span class="community-announcement-status ${isFound ? "" : "is-missing"}">${isFound ? "Found" : announcementTypeLabel(type)}</span>
          <h2>${esc(item.title || "Community Announcement")}</h2>
          <div class="community-announcement-meta">
            <div><strong>Location:</strong> ${esc(item.location || "Not specified")}</div>
            <div><strong>Date:</strong> ${formatAnnouncementDate(item.date || item.createdAt)}</div>
            ${item.description ? `<div><strong>Description:</strong> ${esc(item.description)}</div>` : ""}
            ${reporter}${contact}
          </div>
          ${staffActions}
        </div>
        ${image}
      </article>`;
  }).join("");
}

async function loadCommunityAnnouncements() {
  const list = $("#communityAnnouncementList");
  if (!list) return;

  try {
    const data = await api("/api/announcements");
    communityAnnouncements = Array.isArray(data) ? data : (data.announcements || []);
    renderCommunityAnnouncements();
  } catch (error) {
    console.error("Could not load community announcements:", error);
    list.innerHTML = `
      <div class="community-announcement-empty">
        <div class="community-announcement-empty-icon" aria-hidden="true">!</div>
        <h2>Announcements are temporarily unavailable</h2>
        <p>Please try again in a moment.</p>
      </div>`;
  }
}

function ensureAnnouncementForm() {
  if ($("#announcementFormDialog")) return;

  const dialog = document.createElement("dialog");
  dialog.id = "announcementFormDialog";
  dialog.style.cssText = "width:min(620px,calc(100% - 28px));max-height:90vh;overflow:auto;padding:0;border:1px solid #dce9fa;border-top:4px solid #E8C95A;border-radius:18px;color:#08245f;box-shadow:0 24px 70px rgba(8,36,95,.28)";
  dialog.innerHTML = `
    <form id="announcementForm" style="display:grid;gap:13px;padding:24px" enctype="multipart/form-data">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
        <div><p style="margin:0 0 5px;color:#D94A65;font-size:11px;font-weight:800;letter-spacing:.1em">STAFF POST</p><h2 id="announcementFormTitle" style="margin:0;font-size:22px">Post an Announcement</h2></div>
        <button type="button" id="announcementFormClose" aria-label="Close" style="border:0;background:#edf5ff;border-radius:50%;width:36px;height:36px;font-size:22px;cursor:pointer">×</button>
      </div>
      <label style="display:grid;gap:6px;font-weight:700;font-size:13px">Announcement type
        <input type="hidden" name="type" id="announcementTypeValue" value="lost-found">
        <div class="announcement-type-picker" id="announcementTypePicker">
          <button type="button" class="announcement-type-trigger" id="announcementTypeToggle" aria-haspopup="listbox" aria-expanded="false" aria-controls="announcementTypeOptions">
            <span id="announcementTypeLabel">Lost &amp; Found</span><span class="announcement-type-chevron" aria-hidden="true"></span>
          </button>
          <div class="announcement-type-options" id="announcementTypeOptions" role="listbox" aria-label="Announcement type" hidden>
            <button type="button" role="option" aria-selected="true" data-announcement-type-option="lost-found">Lost &amp; Found</button>
            <button type="button" role="option" aria-selected="false" data-announcement-type-option="missing-pet">Missing Pet</button>
            <button type="button" role="option" aria-selected="false" data-announcement-type-option="missing-person">Missing Person</button>
          </div>
        </div>
      </label>
      <label style="display:grid;gap:6px;font-weight:700;font-size:13px">Title<input name="title" maxlength="120" required placeholder="Example: Black wallet found" style="padding:11px;border:1px solid #dce9fa;border-radius:9px;font:inherit"></label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <label style="display:grid;gap:6px;font-weight:700;font-size:13px">Location<input name="location" maxlength="180" required placeholder="Where was it lost or seen?" style="padding:11px;border:1px solid #dce9fa;border-radius:9px;font:inherit"></label>
        <label style="display:grid;gap:6px;font-weight:700;font-size:13px">Date<input name="date" type="date" required style="padding:11px;border:1px solid #dce9fa;border-radius:9px;font:inherit"></label>
      </div>
      <label style="display:grid;gap:6px;font-weight:700;font-size:13px">Description<textarea name="description" rows="3" maxlength="1200" required placeholder="Add useful details for residents." style="padding:11px;border:1px solid #dce9fa;border-radius:9px;font:inherit;resize:vertical"></textarea></label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <label style="display:grid;gap:6px;font-weight:700;font-size:13px">Reported by<input name="reporterName" maxlength="100" placeholder="Name" style="padding:11px;border:1px solid #dce9fa;border-radius:9px;font:inherit"></label>
        <label style="display:grid;gap:6px;font-weight:700;font-size:13px">Contact information<input name="contact" maxlength="100" placeholder="Optional contact" style="padding:11px;border:1px solid #dce9fa;border-radius:9px;font:inherit"></label>
      </div>
      <label style="display:grid;gap:6px;font-weight:700;font-size:13px">Photo evidence (optional)<input id="announcementPhoto" name="photo" type="file" accept="image/*" style="padding:9px;border:1px solid #dce9fa;border-radius:9px;font:inherit"></label>
      <img id="announcementPhotoPreview" alt="Selected announcement photo preview" hidden style="max-width:100%;max-height:220px;object-fit:contain;border-radius:10px;background:#f4f7fc">
      <p id="announcementFormMessage" role="status" aria-live="polite" style="min-height:18px;margin:0;color:#b3344b;font-size:13px"></p>
      <button id="announcementSubmit" type="submit" style="padding:12px 16px;border:0;border-radius:10px;background:#1850D9;color:#fff;font:inherit;font-weight:800;cursor:pointer">Publish Announcement</button>
    </form>`;
  document.body.append(dialog);

  const form = $("#announcementForm");
  const fileInput = $("#announcementPhoto");
  const preview = $("#announcementPhotoPreview");
  const typePicker = $("#announcementTypePicker");
  const typeToggle = $("#announcementTypeToggle");
  const typeOptions = $("#announcementTypeOptions");
  const typeValue = $("#announcementTypeValue");
  const typeLabel = $("#announcementTypeLabel");

  const setTypeMenuOpen = open => {
    typeToggle.setAttribute("aria-expanded", String(open));
    if (open) {
      typeOptions.hidden = false;
      requestAnimationFrame(() => typeOptions.classList.add("is-open"));
    } else {
      typeOptions.classList.remove("is-open");
      window.setTimeout(() => {
        if (typeToggle.getAttribute("aria-expanded") === "false") typeOptions.hidden = true;
      }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 170);
    }
  };

  typeToggle.addEventListener("click", () => setTypeMenuOpen(typeToggle.getAttribute("aria-expanded") !== "true"));
  typeOptions.addEventListener("click", event => {
    const option = event.target.closest("[data-announcement-type-option]");
    if (!option) return;
    typeValue.value = option.dataset.announcementTypeOption;
    typeLabel.textContent = option.textContent.trim();
    typeOptions.querySelectorAll("[role=option]").forEach(item => item.setAttribute("aria-selected", String(item === option)));
    setTypeMenuOpen(false);
    typeToggle.focus();
  });
  typeToggle.addEventListener("keydown", event => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setTypeMenuOpen(true);
      typeOptions.querySelector('[aria-selected="true"]')?.focus();
    }
  });
  typeOptions.addEventListener("keydown", event => {
    const options = [...typeOptions.querySelectorAll("[role=option]")];
    const index = options.indexOf(document.activeElement);
    if (event.key === "Escape") {
      event.preventDefault();
      setTypeMenuOpen(false);
      typeToggle.focus();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      options[(index + step + options.length) % options.length]?.focus();
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      document.activeElement?.click();
    }
  });
  document.addEventListener("click", event => {
    if (!typePicker.contains(event.target)) setTypeMenuOpen(false);
  });
  let closing = false;
  const closeDialog = () => {
    if (!dialog.open || closing) return;
    closing = true;
    dialog.classList.add("is-closing");
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 190;
    window.setTimeout(() => {
      dialog.close();
      dialog.classList.remove("is-closing");
      closing = false;
    }, delay);
  };

  $("#announcementFormClose").addEventListener("click", closeDialog);
  dialog.addEventListener("cancel", event => {
    event.preventDefault();
    closeDialog();
  });
  // Keep the form open while residents/admins select or copy text. It closes
  // through its close button, Escape, or after a successful publish.
  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (!file) {
      preview.hidden = true;
      preview.removeAttribute("src");
      return;
    }
    if (!file.type.startsWith("image/")) {
      fileInput.value = "";
      preview.hidden = true;
      $("#announcementFormMessage").textContent = "Please select an image file.";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      fileInput.value = "";
      preview.hidden = true;
      $("#announcementFormMessage").textContent = "Choose an image smaller than 5 MB.";
      return;
    }
    $("#announcementFormMessage").textContent = "";
    preview.src = URL.createObjectURL(file);
    preview.hidden = false;
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!typeValue.value) {
      $("#announcementFormMessage").textContent = "Choose an announcement type.";
      typeToggle.focus();
      return;
    }
    if (signedInUser?.role !== "staff") {
      $("#announcementFormMessage").textContent = "Only signed-in staff can post announcements.";
      return;
    }

    const submit = $("#announcementSubmit");
    const message = $("#announcementFormMessage");
    const editId = form.dataset.editId;
    const payload = Object.fromEntries(new FormData(form).entries());
    const photo = fileInput.files?.[0];
    delete payload.photo;

    try {
      submit.disabled = true;
      submit.textContent = editId ? "Saving changes..." : "Publishing...";
      message.textContent = "";
      if (photo) {
        payload.imageData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("Could not read the selected photo."));
          reader.readAsDataURL(photo);
        });
        payload.imageName = photo.name;
      }

      await api(editId
        ? `/api/admin/announcements/${encodeURIComponent(editId)}`
        : "/api/admin/announcements", {
        method: editId ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });
      form.reset();
      delete form.dataset.editId;
      typeValue.value = "lost-found";
      typeLabel.textContent = "Lost & Found";
      typeOptions.querySelectorAll("[role=option]").forEach(option => {
        option.setAttribute("aria-selected", String(option.dataset.announcementTypeOption === "lost-found"));
      });
      $("#announcementFormTitle").textContent = "Post an Announcement";
      preview.hidden = true;
      preview.removeAttribute("src");
      closeDialog();
      await loadCommunityAnnouncements();
    } catch (error) {
      message.textContent = error.message || "Could not publish the announcement.";
    } finally {
      submit.disabled = false;
      submit.textContent = form.dataset.editId ? "Save Changes" : "Publish Announcement";
    }
  });
}

function openAnnouncementForm(announcement = null) {
  if (signedInUser?.role !== "staff") return;
  ensureAnnouncementForm();

  const form = $("#announcementForm");
  const typeValue = $("#announcementTypeValue");
  const typeLabel = $("#announcementTypeLabel");
  const typeOptions = $("#announcementTypeOptions");
  const preview = $("#announcementPhotoPreview");
  const submit = $("#announcementSubmit");

  form.reset();
  $("#announcementFormMessage").textContent = "";
  $("#announcementTypeOptions").hidden = true;
  $("#announcementTypeOptions").classList.remove("is-open");
  $("#announcementTypeToggle").setAttribute("aria-expanded", "false");

  if (announcement) {
    form.dataset.editId = announcement.id;
    $("#announcementFormTitle").textContent = "Edit Announcement";
    submit.textContent = "Save Changes";
    typeValue.value = announcement.type || announcement.category || "lost-found";
    typeLabel.textContent = announcementTypeLabel(typeValue.value);
    $("[name=title]", form).value = announcement.title || "";
    $("[name=location]", form).value = announcement.location || "";
    $("[name=date]", form).value = String(announcement.date || "").slice(0, 10);
    $("[name=description]", form).value = announcement.description || "";
    $("[name=reporterName]", form).value = announcement.reporterName || "";
    $("[name=contact]", form).value = announcement.contact || "";
    typeOptions.querySelectorAll("[role=option]").forEach(option => {
      option.setAttribute("aria-selected", String(option.dataset.announcementTypeOption === typeValue.value));
    });
    if (announcement.image) {
      preview.src = announcement.image;
      preview.hidden = false;
    } else {
      preview.removeAttribute("src");
      preview.hidden = true;
    }
  } else {
    delete form.dataset.editId;
    $("#announcementFormTitle").textContent = "Post an Announcement";
    submit.textContent = "Publish Announcement";
    typeValue.value = "lost-found";
    typeLabel.textContent = "Lost & Found";
    typeOptions.querySelectorAll("[role=option]").forEach(option => {
      option.setAttribute("aria-selected", String(option.dataset.announcementTypeOption === "lost-found"));
    });
    preview.removeAttribute("src");
    preview.hidden = true;
  }

  $("#announcementFormDialog").showModal();
}

$("#communityBoardPostButton")?.addEventListener("click", () => {
  openAnnouncementForm();
});

$("#communityRobotOpen")?.addEventListener("click", () => {
  loadCommunityAnnouncements();
});

$("#communityBoardTabs")?.addEventListener("click", event => {
  const tab = event.target.closest("[data-announcement-type]");
  if (!tab) return;
  $$("#communityBoardTabs [data-announcement-type]").forEach(button => {
    button.setAttribute("aria-pressed", String(button === tab));
  });
  const category = $("#communityBoardCategory");
  if (category) category.value = "all";
  renderCommunityAnnouncements();
});

$("#communityBoardSearch")?.addEventListener("input", renderCommunityAnnouncements);
$("#communityBoardCategory")?.addEventListener("change", renderCommunityAnnouncements);
(() => {
  const picker = $("#communitySortPicker");
  const toggle = $("#communitySortToggle");
  const optionsPanel = $("#communitySortOptions");
  const nativeSelect = $("#communityBoardSort");
  const label = $("#communitySortLabel");
  if (!picker || !toggle || !optionsPanel || !nativeSelect || !label) return;

  const syncSortLabel = () => {
    const selected = optionsPanel.querySelector(`[data-community-sort-option="${nativeSelect.value}"]`);
    if (selected) label.textContent = selected.textContent.trim();
    optionsPanel.querySelectorAll("[role=option]").forEach(option => {
      option.setAttribute("aria-selected", String(option.dataset.communitySortOption === nativeSelect.value));
    });
  };
  const setOpen = open => {
    toggle.setAttribute("aria-expanded", String(open));
    if (open) {
      optionsPanel.hidden = false;
      requestAnimationFrame(() => optionsPanel.classList.add("is-open"));
    } else {
      optionsPanel.classList.remove("is-open");
      window.setTimeout(() => {
        if (toggle.getAttribute("aria-expanded") === "false") optionsPanel.hidden = true;
      }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 170);
    }
  };
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  optionsPanel.addEventListener("click", event => {
    const option = event.target.closest("[data-community-sort-option]");
    if (!option) return;
    nativeSelect.value = option.dataset.communitySortOption;
    syncSortLabel();
    nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));
    setOpen(false);
    toggle.focus();
  });
  toggle.addEventListener("keydown", event => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
      optionsPanel.querySelector('[aria-selected="true"]')?.focus();
    }
  });
  optionsPanel.addEventListener("keydown", event => {
    const options = [...optionsPanel.querySelectorAll("[role=option]")];
    const index = options.indexOf(document.activeElement);
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      toggle.focus();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      options[(index + step + options.length) % options.length]?.focus();
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      document.activeElement?.click();
    }
  });
  document.addEventListener("click", event => {
    if (!picker.contains(event.target)) setOpen(false);
  });
  nativeSelect.addEventListener("change", syncSortLabel);
  syncSortLabel();
})();
$("#communityBoardSort")?.addEventListener("change", renderCommunityAnnouncements);

$("#communityAnnouncementList")?.addEventListener("click", event => {
  const editButton = event.target.closest("[data-announcement-edit]");
  if (!editButton || signedInUser?.role !== "staff") return;
  const announcement = communityAnnouncements.find(item => item.id === editButton.dataset.announcementEdit);
  if (!announcement) {
    alert("This announcement could not be found. Refresh the board and try again.");
    return;
  }
  openAnnouncementForm(announcement);
});

$("#communityAnnouncementList")?.addEventListener("click", async event => {
  const button = event.target.closest("[data-announcement-status-toggle]");
  if (!button || signedInUser?.role !== "staff") return;
  button.disabled = true;
  try {
    const action = button.dataset.currentStatus === "found" ? "unmark-found" : "found";
    await api(`/api/admin/announcements/${encodeURIComponent(button.dataset.announcementStatusToggle)}/${action}`, {
      method: "PATCH"
    });
    await loadCommunityAnnouncements();
  } catch (error) {
    alert(error.message || "Could not update the announcement status.");
    button.disabled = false;
  }
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
        ${c.image ? `<a href="${esc(c.image)}" target="_blank" rel="noopener noreferrer" aria-label="Open attached concern photo"><img src="${esc(c.image)}" alt="Photo attached to concern ${esc(c.id)}" style="display:block;max-width:180px;max-height:120px;margin:9px 0;object-fit:cover;border-radius:8px"></a>` : ""}
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
    updateCommunityBoardControls();
    return;
  } catch (_err) {
    // No active staff session; check resident session.
  }

  try {
    const resident = await api("/api/resident/me");

    signedInUser = resident.user;
    updateLoginButton();
    updateCommunityBoardControls();
  } catch (_err) {
    signedInUser = null;
    updateLoginButton();
    updateCommunityBoardControls();
  }
}

Promise.all([
  loadConfig(),
  loadServices(),
  loadProjects(),
  loadCommunityAnnouncements(),
  restoreSession()
]).catch(e => console.error(e));
