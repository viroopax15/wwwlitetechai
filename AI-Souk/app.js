const nav = [
  ["Command Center", "home", "House"],
  ["Ask AI Control Tower", "ask", "MessageSquare"],
  ["Crisis Operations", "crisis", "TriangleAlert"],
  ["Action Items", "actions", "SquareCheck"],
  ["AI Souk", "revenue", "CircleDollarSign"],
  ["Safer Housing", "housing", "Building2"],
  ["Equity Dashboard", "equity", "Scale"],
  ["CyberSecurity Threats", "cyber", "ShieldAlert"],
  ["Citizen Pulse", "pulse", "Activity"],
  ["Inter-Governmental", "intergov", "Network"],
  ["CongestionDEPT", "CongestionDEPT", "TrafficCone"],
  ["Reports", "reports", "ChartBar"],
  ["Documents", "documents", "FileText"],
  ["Audit Log", "audit", "ClipboardList"],
];

const signals = [
  ["urgent", "heat_index_alert, coastal_humidity", "Extreme heat index watch across central Abu Dhabi"],
  ["priority", "permit_reviews_over_60d", "Building permit reviews exceed target window in three zones"],
  ["signal", "addc_outages_open, customers_out", "ADDC reports minor outage affecting 105 customers"],
  ["win", "civil_defence_readiness", "Civil Defence readiness checks remain on schedule"],
];

const layers = [
  ["800 555 Gov Contact", "TAMM service requests", "86,345", "blue", true],
  ["Building Permits", "Last 180 days", "219,077", "gold", false],
  ["Code Compliance", "Open + recently closed", "28,132", "red", false],
  ["Tree Permits", "Tree review requests", "6,054", "green", false],
  ["Live Traffic", "Integrated Transport Centre congestion", "-", "red", false],
  ["Live Buses", "Abu Dhabi Mobility · real time", "-", "blue", false],
  ["Live Clouds", "NCM cloud and humidity layer", "-", "blue", false],
  ["Police Emergency 999", "Life safety + urgent assistance", "19", "olive", true],
  ["Ambulance 998", "Emergency medical response", "2,519", "red", false],
  ["Civil Defence 997", "Fire + rescue operations", "2,390", "gold", false],
  ["Municipal Emergency 993", "Municipal incident escalation", "323", "blue", false],
  ["Directory 181 / 199", "Etisalat + du inquiries", "-", "green", false],
  ["Hospitals", "Critical health facilities", "9", "red", false],
];

const stories = [
  ["HIGH", "PUBLIC SAFETY", "BRIEF", "Heat safety outreach expands across Musaffah, Khalifa City, and Al Reem", "Press will ask about worker safety, cooling centers, and outdoor activity guidance"],
  ["HIGH", "MOBILITY", "BRIEF", "Abu Dhabi Mobility flags congestion near Corniche and Al Maryah corridors", "Event traffic may require signal timing and public messaging before evening peak"],
  ["HIGH", "GOVERNANCE", "ARTICLE", "UAE digital government services set new response-time targets", "Service-level expectations may shape municipal KPIs and public dashboards"],
  ["HIGH", "HOUSING", "BRIEF", "New community facilities package advances for Al Shamkha growth areas", "Planning approvals and utility sequencing affect resident-facing delivery dates"],
];

const tasks = [
  ["URGENT", "ANOMALY (AUTO)", "Critical anomaly: Generator readiness gap at 3 NCEMA backup facilities", "Quarterly load test flagged 3 backup generators below the 72-hour readiness threshold.", "Civil Defence"],
  ["URGENT", "KPI REGRESSION (AUTO)", "KPI regression: anomaly value at risk ↑ 8.8σ", "Anomaly value at risk = AED 60.06B today vs 30-day mean AED 2.19B.", "Office of Management & Budget"],
  ["URGENT", "GRANT DEADLINE (AUTO)", "Grant 6d to deadline: Coastal Resilience Funding Package", "Authority submission deadline 2026-06-15 with AED 45.2B allocation.", "Environment Agency"],
];

let mapLayersOpen = false;
const runtime = {
  dateLabel: "",
  weather: {
    temp: "--",
    high: "--",
    low: "--",
    summary: "Updating Local Conditions",
    icon: "CloudSun",
    alert: "Live",
  },
};

function updateClock() {
  runtime.dateLabel = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());
  const dateEl = document.querySelector("[data-live-date]");
  if (dateEl) dateEl.textContent = runtime.dateLabel;
}

function weatherCodeSummary(code, apparent) {
  if ([95, 96, 99].includes(code)) return ["Thunderstorm Watch", "CloudLightning", "Alert"];
  if ([61, 63, 65, 80, 81, 82].includes(code)) return ["Rain Showers", "CloudRain", "Watch"];
  if ([45, 48].includes(code)) return ["Haze And Low Visibility", "CloudFog", "Watch"];
  if (apparent >= 40) return ["Hot And Humid Conditions", "SunMedium", "Alert"];
  if (apparent >= 34) return ["Warm And Humid", "SunMedium", "Watch"];
  return ["Clear Local Conditions", "SunMedium", "Live"];
}

async function updateWeather() {
  try {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=24.4539&longitude=54.3773&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code&daily=temperature_2m_max,temperature_2m_min&forecast_days=1&timezone=auto";
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`weather ${response.status}`);
    const payload = await response.json();
    const current = payload.current || {};
    const daily = payload.daily || {};
    const apparent = Number(current.apparent_temperature ?? current.temperature_2m ?? 39);
    const [summary, iconName, alert] = weatherCodeSummary(Number(current.weather_code || 0), apparent);
    runtime.weather = {
      temp: Math.round(Number(current.temperature_2m ?? apparent)),
      high: Math.round(Number(daily.temperature_2m_max?.[0] ?? apparent + 4)),
      low: Math.round(Number(daily.temperature_2m_min?.[0] ?? apparent - 6)),
      summary,
      icon: iconName,
      alert,
    };
  } catch {
    const month = new Date().getMonth();
    runtime.weather = {
      temp: month >= 4 && month <= 9 ? 39 : 29,
      high: month >= 4 && month <= 9 ? 42 : 31,
      low: month >= 4 && month <= 9 ? 31 : 21,
      summary: month >= 4 && month <= 9 ? "Hot And Humid Conditions" : "Clear Local Conditions",
      icon: "SunMedium",
      alert: month >= 4 && month <= 9 ? "Alert" : "Live",
    };
  }
  render();
}

function dailyBriefCopy() {
  const { high, low, summary } = runtime.weather;
  const highText = high === "--" ? "updating" : `${high}°C`;
  const lowText = low === "--" ? "updating" : `${low}°C`;
  const summerPeak = high === "--" ? 45 : Math.max(44, high + 3);
  const condition = summary === "Updating Local Conditions" ? "Local weather conditions" : `${summary.toLowerCase()} conditions`;
  const sentenceStart = condition.charAt(0).toUpperCase() + condition.slice(1);
  return `${sentenceStart} are being monitored across the urban core today, with an expected daytime high of ${highText} and an overnight low near ${lowText}. During peak summer windows, the city should plan for heat spikes up to about ${summerPeak}°C in exposed districts, especially around industrial corridors, inland work sites, and low-shade transit areas. The city remains in normal operations with enhanced heat-safety monitoring, while permit review queues continue to loom large in several zones above the 60-day target.`;
}

function icon(name, size = 20) {
  return `<i data-lucide="${name}" style="width:${size}px;height:${size}px"></i>`;
}

function currentRoute() {
  const params = new URLSearchParams(location.search);
  if (params.get("screen") === "splash") return "splash";
  return (location.hash.replace("#/", "") || "splash").split("?")[0];
}

function render() {
  const route = currentRoute();
  if (route === "splash") {
    document.getElementById("app").innerHTML = splashScreen();
    lucide.createIcons();
    return;
  }
  document.getElementById("app").innerHTML = `
    <div class="app">
      ${topbar()}
      ${promiseStrip()}
      <div class="shell">
        ${sidebar(route)}
        <main class="main">${screen(route)}</main>
      </div>
    </div>`;
  scatterPoints();
  lucide.createIcons();
  document.querySelectorAll("[data-route]").forEach((el) => {
    el.addEventListener("click", () => { location.hash = `#/${el.dataset.route}`; });
  });
  document.querySelectorAll("[data-toggle-layers]").forEach((el) => {
    el.addEventListener("click", () => {
      mapLayersOpen = !mapLayersOpen;
      render();
    });
  });
}

function splashScreen() {
  return `<section class="splash-screen">
    <div class="splash-copy">
      <div class="eyebrow">MONETIZE360 · NATIONAL OPERATING LAYER</div>
      <h1>Revenue OS for an AI Nation with AEGI &amp; Monetize360</h1>
      <p class="splash-mission">From Citizens to Enterprise to Sovereign AI - Monetize360 makes every service, every deployment, measurable revenue</p>
      <div class="splash-metrics">
        <div><b>TARGET AED 2.4T</b><span>national productivity model</span></div>
        <div><b>501B</b><span>AI Souk revenue pool</span></div>
        <div><b>24/7</b><span>sovereign control tower</span></div>
      </div>
      <div class="splash-actions">
        <a class="splash-enter" href="#/home">${icon("ArrowRight",18)} Enter Control Tower</a>
        <a class="splash-secondary" href="#/revenue">${icon("CircleDollarSign",18)} Open AI Souk</a>
      </div>
      <div class="splash-footer">The Operating System for AI Revenue</div>
    </div>
  </section>`;
}

function topbar() {
  return `
    <header class="topbar">
      <a class="brand" href="#/home">
        <div class="seal"></div>
        <div><div class="brand-title">AI CONTROL TOWER · CITY OF ABU DHABI</div></div>
      </a>
      <div class="date" data-live-date>${runtime.dateLabel}</div>
      <div class="top-actions">
        <button class="search-pill" data-route="ask">${icon("Search",18)}<span>Ask AI Control Tower...</span><span class="keycap">/</span></button>
        <button class="status-pill">${icon("ShieldCheck",17)} NORMAL</button>
        <button class="icon-btn">${icon("Bell",20)}<span class="badge">99+</span></button>
        <button class="avatar" onclick="document.body.classList.toggle('show-account')">CO</button>
      </div>
      <div class="account-pop">
        <div class="name"><b>City Operations</b><br><span class="sub">admin@abudhabi.gov.ae</span><br><span class="sub">ADMIN</span></div>
        <a href="#">${icon("Settings",18)} Settings</a>
        <a href="#">${icon("LogOut",18)} Sign out</a>
      </div>
    </header>`;
}

function promiseStrip() {
  const colors = ["gold","olive","olive","olive","olive","olive","olive","green","green","green","green","green"];
  return `<section class="promise">
    <div class="promise-title">DMT : The UAE Promise</div>
    <div class="promise-bars">${colors.map(c => `<span class="bar ${c}"></span>`).join("")}</div>
    <div class="legend"><span><i class="dot red"></i>1 SLIPPING</span><span><i class="dot gold"></i>1 AT RISK</span><span><i class="dot olive"></i>3 ON TRACK</span><span><i class="dot"></i>7 DELIVERED</span></div>
  </section>`;
}

function sidebar(route) {
  return `<aside class="side">
    ${nav.map(([label, key, iconName]) => `<a class="nav-item ${route === key ? "active" : ""}" href="#/${key}">${icon(iconName)}<span>${label}</span></a>`).join("")}
    <div class="mode-card">${icon("ShieldCheck")}<div><b>NORMAL</b><span>All clear</span></div></div>
    <div class="view-audit">VIEW TOOL-CALL AUDIT →</div>
  </aside>`;
}

function screen(route) {
  if (route === "home") return homeScreen();
  if (route === "ask") return askScreen();
  if (route === "crisis") return crisisScreen();
  if (route === "equity") return equityScreen();
  if (route === "cyber") return cyberScreen();
  if (route === "revenue") return revenueScreen();
  if (route === "actions") return actionsScreen();
  if (route === "housing") return genericScreen("Safer Housing", "Safer Housing Pipeline", "Track blocked safer-housing and worker-accommodation projects, municipality-owned parcels, and permit bottlenecks relevant to Abu Dhabi.", housingCards());
  if (route === "pulse") return genericScreen("Citizen Pulse", "Abu Dhabi Briefing", "Relevant stories, resident signals, and AI-suggested City Hall responses.", pulseCards());
  if (route === "intergov") return genericScreen("Inter-Governmental", "Funding & Agency Coordination", "UAE, emirate, authority, and regional partner items that need executive attention.", intergovCards());
  if (route === "CongestionDEPT" || route === "departments") return congestionScreen();
  if (route === "reports") return genericScreen("Reports", "Generated Reports", "Prepared briefs, anomaly reports, and exports ready for staff circulation.", reportCards());
  if (route === "documents") return genericScreen("Documents", "Document Intelligence", "Uploaded budgets, ordinances, grant memos, and supporting records indexed for Ask AI Control Tower.", documentCards());
  return genericScreen("Audit Log", "Tool-Call Audit", "Trace every AI answer back to tool calls, retrieved records, and operator actions.", auditCards());
}

function baseMap(extra = "") {
  const tiles = Array.from({ length: 20 }, (_, i) => `<img src="./assets/tiles/tile-${Math.floor(i / 5)}-${i % 5}.png" alt="">`).join("");
  return `<div class="map"><div class="tile-map">${tiles}</div><div class="map-wash"></div><div class="label city-label">Abu Dhabi</div><div class="label district-label">Al Reem Island</div><div class="label outer-label">Khalifa City</div><div class="points ${extra}"></div></div>`;
}

function homeScreen() {
  return `<section class="screen map-screen ${mapLayersOpen ? "layers-open" : ""}">
    ${baseMap("blue-points")}
    <div class="weather">${icon(runtime.weather.icon,23)}<b>${runtime.weather.temp}°C</b><span>${runtime.weather.summary}</span><span class="tag ${runtime.weather.alert === "Alert" ? "gold" : "green"}">${runtime.weather.alert}</span></div>
    <button class="map-layer-toggle" data-toggle-layers>${icon("Layers",18)} Map Layers</button>
    ${briefPanel()}
    ${layersPanel()}
    <aside class="ops">
      <div class="metric-card"><div class="card-head">OPERATIONS SNAPSHOT</div><div class="metric-row"><div class="metric"><strong>86,345</strong><small>800 555 gov contact cases</small></div><div class="metric"><strong>28,124</strong><small>Code cases</small></div><div class="metric"><strong>0</strong><small>Recert overdue</small></div></div></div>
      <div class="card recert-list"><div class="card-head">${icon("Building2",18)} BUILDING RECERT · LIFE SAFETY</div>
        <div class="metric-row"><div class="metric"><strong>9,043</strong><small>Tracked</small></div><div class="metric"><strong style="color:var(--red)">0</strong><small>Overdue</small></div><div class="metric"><strong style="color:var(--gold)">105</strong><small>In progress</small></div></div>
        ${["Al Reem Tower 14","Khalifa City Plot 63","Mina Zayed Block 1","Al Bateen Zone 2","Musaffah M-37"].map(x => `<div class="row"><div><div class="row-title">${x}</div><div class="sub">Inspection cycle · age 6...</div></div><span class="tag gold">In progress</span><b>0.4 ↗</b></div>`).join("")}
      </div>
      <div class="card"><div class="card-head">${icon("Waves",18)} COASTAL TIDE · CORNICHE <a style="color:#007bd1">OUTLOOK</a></div><div class="card-body"><p>Next coastal tide above advisory threshold: none in next 14 days.</p></div></div>
    </aside>
  </section>`;
}

function briefPanel() {
  return `<section class="brief-panel">
    <div class="panel-head">${icon("Sparkles",18)} DIRECTOR GENERAL (DMT) DAILY BRIEF</div>
    <div class="brief-copy"><h2>Good morning, City of Abu Dhabi.</h2><p>${dailyBriefCopy()}</p></div>
    <div class="brief-list">
      ${signals.map(([kind, code, title]) => `<a class="signal" href="#/ask"><span class="tag ${kind === "priority" ? "gold" : kind === "signal" ? "blue" : kind === "win" ? "green" : ""}">${kind}</span><span class="code">${code}</span><b>${title}</b></a>`).join("")}
      <a class="ask-link" href="#/ask">${icon("Sparkles",18)} Ask AI Control Tower about today ↗</a>
    </div>
    <div class="panel-head">ABU DHABI BRIEFING <a href="#/pulse" style="margin-left:auto;letter-spacing:0;font-family:var(--sans);text-transform:none">Open Citizen Pulse ↗</a></div>
    <div class="brief-list briefing"><div><span class="tag gold">High · 7</span> <span class="tag blue">Moderate · 5</span></div><p>12 stories relevant to City Hall today.</p>${stories.map(s => `<a class="signal" href="#/ask"><span class="dot gold"></span><span class="tag gold">${s[0]}</span> <span class="tag gray">${s[1]}</span> <span class="tag blue">${s[2]}</span><b>${s[3]}</b><div class="sub">${s[4]}</div></a>`).join("")}<a class="ask-link" href="#/ask">${icon("Sparkles",18)} Ask ↗</a></div>
  </section>`;
}

function layersPanel() {
  return `<section class="layers"><div class="panel-head">${icon("Layers",18)} MAP LAYERS <button class="panel-close" data-toggle-layers aria-label="Close map layers">${icon("X",16)}</button></div>${layers.map(l => `<div class="layer"><i class="dot ${l[3]}"></i><div><b>${l[0]}</b><small>${l[1]}</small></div><span>${l[2]}</span><span class="toggle ${l[4] ? "on" : ""}"></span></div>`).join("")}</section>`;
}

function askScreen() {
  const threads = ["Brief me on NCEMA crisis control...", "Set up a local UCP for flash flooding...", "Tell me about safer housing...", "Explain building permit AD18...", "What permitting restrictions ...", "Show me police calls in this ...", "Explain anomaly anom-2026...", "Brief me on resilience fund...", "Brief me on Civil Defence.", "Where are residents most fr...", "What authority funding are we l..."];
  const prompts = [
    ["ShieldAlert", "What should DMT activate if NCEMA escalates today?"],
    ["RadioTower", "Build a Unified Command Post plan for Abu Dhabi"],
    ["Truck", "When should we deploy a Mobile Crisis Operations Unit?"],
    ["Siren", "Flash flooding: local police + municipality command steps"],
    ["Compass", 'Walk me through "heat index watch across Abu Dhabi..."'],
    ["OctagonAlert", "Explain anomaly anom-2026-011"],
    ["Waves", "Sea-level rise: coastal asset exposure by 2030?"],
    ["Building2", "What's blocking AlReemHeights-1009 in Pe..."],
    ["BriefcaseBusiness", "Where is the Abu Dhabi resilience budget mone..."],
    ["Landmark", "Show me municipal parcels suitable for commun..."],
    ["Lightbulb", "Where are residents most frustrated this week?"],
    ["DollarSign", "What authority funding are we leaving on the table?"],
  ];
  return `<section class="screen ask-screen">
    <aside class="history"><button class="new-chat">${icon("Plus")} New conversation</button><input placeholder="Search..." />${threads.map(t => `<div class="thread">${icon("MessageSquare",16)}<span>${t}</span></div>`).join("")}<div class="view-audit">VIEW TOOL-CALL AUDIT →</div></aside>
    <div class="ask-stage"><div class="ask-hero"><div class="eyebrow">ASK AI CONTROL TOWER</div><h1>Good morning, City of Abu Dhabi.</h1><p class="lead">Ask any operational question about Abu Dhabi. Real tool calls against Supabase, NCM, municipal services, transport feeds, Census-style indicators, and your uploaded documents will appear in the trace below the answer.</p><div class="prompt-grid">${prompts.map(p => `<button class="prompt-chip">${icon(p[0],18)}<span>${p[1]}</span></button>`).join("")}</div></div><div class="composer"><div class="composer-box"><input placeholder="Ask AI Control Tower about today's data, documents, weather, bills..." /><button class="send">${icon("ArrowUp")}</button></div><div class="composer-meta"><span>${icon("ShieldCheck",14)} AI CONTROL TOWER · City AI · Sovereign Mode</span><span>Enter to send · Shift+Enter for newline</span></div></div></div>
  </section>`;
}

function crisisScreen() {
  return `<section class="screen pad">
    <div class="eyebrow">CRISIS OPERATIONS</div><h1>NCEMA Surface</h1><div class="crisis-status-line"><p class="lead"><b class="eyebrow">POSTURE · NORMAL</b> Heat index watch active · coastal humidity monitored · 18 ICS items pending</p><span class="status-pill">● NORMAL</span></div>
    <div class="tabs"><span class="eyebrow">HAZARD LENS</span>${["Heat","Tide","Dust","Civil Defence 997","800 555"].map((t,i)=>`<button class="tab ${i===0?"active":""}">${icon(["Thermometer","Waves","Wind","ShieldCheck","Activity"][i],16)} ${t}</button>`).join("")}</div>
    <div class="crisis-grid">
      <div class="stack"><div class="card" style="border-color:var(--green)"><div class="card-head" style="color:var(--green)">${icon("ShieldCheck",18)} HEAT · MONITORING</div><div class="card-body"><h2>Summer heat protocol active</h2><p class="lead" style="font-size:16px">NCM conditions monitored · outreach ready for outdoor workers and transit stops</p></div></div><div class="card"><div class="card-head">BUILDING SAFETY · LIFE SAFETY</div><div class="metric-row"><div class="metric"><strong style="color:var(--red)">0</strong><small>Overdue</small></div><div class="metric"><strong style="color:var(--red)">0</strong><small>Failed reports</small></div></div><div class="card-body"><b>View building list →</b></div></div><div class="card"><div class="card-head">TRIGGERS MONITORED</div>${["NCM heat index advisory|ALERT","Coastal tide threshold|OK","Dust visibility below threshold|OK","Civil Defence readiness spike|OK"].map(x=>{const [a,b]=x.split("|");return `<div class="audit-row"><span>${a}</span><b>${b}</b></div>`}).join("")}</div></div>
      <div class="mini-map ${mapLayersOpen ? "layers-open" : ""}">${baseMap("green-points")}<button class="map-layer-toggle compact" data-toggle-layers>${icon("Layers",18)} Map Layers</button>${layersPanel()}<div class="map-controls"><span class="square">+</span><span class="square">−</span><span class="square">${icon("Navigation",20)}</span><span class="square">${icon("Layers",20)}</span></div></div>
      <div class="card"><div class="card-head">ICS READINESS CHECKLIST</div><div class="card-body"><p class="lead" style="font-size:16px">Toggle status to advance items. Updates audit-logged with your user and timestamp.</p><div class="tabs"><span class="eyebrow">18 OF 18</span><span style="margin-left:auto" class="eyebrow">MINE &nbsp; ${icon("Filter",15)} FILTERS</span><button class="tab">+ ADD</button></div></div>${["Activate NCEMA Level 2 coordination and notify department heads","Stage staff at primary shelters and verify ADA accessibility","Confirm fuel reserves at Fire/Police facilities (≥7 days)","Push heat advisory outreach to NET offices"].map(t=>`<div class="check-item"><span>${icon("Circle",18)}</span><div><b>${t}</b><div class="sub">City Manager Reyes · City ...</div></div><span class="eyebrow">PENDING</span><b>···</b></div>`).join("")}</div>
    </div>
    <div class="bottom-cards">${["COOLING CENTERS|1,510 CAP|Cultural Foundation|240", "EVACUATION PICKUPS|8 SITES|Pickup readiness brief →|", "ADDC OUTAGES|ACTIVE|105 customers out|1 active incident", "CRITICAL FACILITIES · HAZARD EXPOSURE||Hospitals 9|Coastal 2 · Heat 3 · SLR '50 9"].map(c=>{const p=c.split("|");return `<div class="card"><div class="card-head">${p[0]} <span>${p[1]}</span></div><div class="card-body"><h3>${p[2]}</h3><p>${p[3]}</p></div></div>`}).join("")}</div>
  </section>`;
}

function equityScreen() {
  const rows = [
    ["800 555 close rate", 96,96,95,96,95,96, ["good","good","good","good","good"]],
    ["800 555 closed ≤ 14d", 81,79,78,80,83,80, ["good","good","good","good","good"]],
    ["Code calm (inv.)", 83,95,92,92,38,80, ["good","good","good","good","bad"]],
    ["Permits issued", "22,379","81,456","33,610","27,246","54,386","43,815", ["bad","good","bad","bad","good"]],
    ["Recert compliance", 99,98,99,98,99,99, ["good","good","good","good","good"]],
    ["Eviction calm (inv.)", 90,74,89,88,60,80, ["good","warn","good","good","bad"]],
  ];
  return `<section class="screen pad"><div class="eyebrow">EQUITY DASHBOARD</div><h1>Service-Delivery & Outcome Equity</h1><p class="lead">District-level matrix of services and outcomes vs the citywide mean, with community-service and resident-access monitors layered on top.</p><div class="matrix"><table><thead><tr><th>Service</th><th>D1</th><th>D2</th><th>D3</th><th>D4</th><th>D5</th><th>Citywide Avg</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${r[0]}</b></td>${r.slice(1,6).map((v,i)=>`<td><span class="score ${r[7][i]}">${v}</span></td>`).join("")}<td>${r[6]}</td></tr>`).join("")}</tbody></table></div><div class="districts">${["Al Danah", "Al Bateen", "Al Reem", "Khalifa City", "Musaffah"].map((n,i)=>`<div class="district-card"><div class="eyebrow">${icon("Landmark",17)} DISTRICT ${i+1} <span class="tag ${i===1||i===4?"gold":"green"}" style="float:right">${i===1||i===4?"WATCH":"ON TRACK"}</span></div><h3>${n}</h3><div class="money">AED 657B</div><div class="sub">FY26 ALLOCATION (EST.)</div><br><div class="eyebrow">TOP 800 555</div><p>WASTE CONTAINER DAMAG... ${[2755,1529,2096,4787,3027][i]}</p><p>PUBLIC REALM / LITTER ${[1049,1284,1285,1788,1757][i]}</p><p>RECYCLING CART DAMAGED ${[1034,1179,1635,1400,1400][i]}</p></div>`).join("")}</div></section>`;
}

function actionsScreen() {
  return `<section class="screen pad"><div style="display:flex;justify-content:space-between;gap:20px"><div><div class="eyebrow">OPERATIONS INBOX</div><h1>Action Items</h1><p class="lead">Every “Track this” click across the platform lands here. Filter, reassign, mark complete, or surface to AI Control Tower for the next concrete step.</p></div><div class="legend" style="align-items:end"><span><b class="large-number">91</b> OPEN</span><span><b class="large-number">1</b> IN PROGRESS</span><span><b class="large-number" style="color:var(--green)">0</b> OVERDUE</span><span><b class="large-number">92</b> TOTAL</span></div></div><div class="filters">${["Urgent","High","Normal","Low","Anomaly (auto)","Ask AI Control Tower","Code case (auto)","Crisis checklist","Equity dashboard","ADDC outage (auto)","Grant deadline (auto)","KPI regression (auto)","Police hot-spot (auto)"].map(f=>`<span class="filter">${f}</span>`).join("")}</div><div class="board"><div class="column"><div class="card-head"><span><i class="dot red"></i> OPEN</span><span>91</span></div>${tasks.map(taskCard).join("")}</div><div class="column"><div class="card-head"><span><i class="dot gold"></i> IN PROGRESS</span><span>1</span></div>${taskCard(["URGENT","EQUITY DASHBOARD","Schedule weekly equity review with Equity Officer","Equity Officer · no due date","Equity Officer"])}</div><div class="column"><div class="card-head"><span><i class="dot green"></i> COMPLETED / DISMISSED</span><span>0</span></div><div class="card-body" style="text-align:center;color:var(--muted)">Nothing here.</div></div></div></section>`;
}

function congestionScreen() {
  const pipeline = [
    ["01", "Stream", "Video input", "Camera"],
    ["02", "Detect", "Plate + vehicle class", "ScanLine"],
    ["03", "Price", "Dynamic toll quote", "CircleDollarSign"],
    ["04", "Settle", "RevenueOS ledger", "Database"],
    ["05", "Act", "Signal + route control", "Sparkles"],
  ];
  const corridors = [
    ["E22 Abu Dhabi-Al Ain Road", "88 km/h", "AED 31.6B", "High"],
    ["E611 key interchanges", "76 km/h", "AED 27.2B", "Watch"],
    ["E11/E311 Dubai-bound relief", "104 km/h", "AED 44.8B", "Normal"],
  ];
  return `<section class="screen pad congestion-screen">
    <div class="eyebrow">CONGESTION</div>
    <h1>Congestion Flow & Tolling Control</h1>
    <p class="lead">Video and license-capture signals help DMT reduce congestion, price access fairly, and settle toll revenue through the AI Souk revenue-sharing gateway powered by RevenueOS from Monetize360.</p>
    <div class="congestion-layout">
      <div class="card congestion-map-card">
        <div class="card-head">${icon("Map",18)} LIVE ABU DHABI CORRIDORS <span class="tag green">FLOW IMPROVING</span></div>
        <div class="traffic-map corridor-image-panel">
          <img src="./assets/snips/abu-dhabi-traffic-corridors.png" alt="Historical Abu Dhabi traffic corridors and potential monetization map covering E11, E22, E30, E311, and E611" />
        </div>
      </div>
      <div class="stack">
        <div class="card"><div class="card-head">REVENUEOS SETTLEMENT</div><div class="card-body"><div class="large-number">AED 96B</div><p>Modeled annual corridor value from dynamic tolling, commercial fleet access, parking zones, and event-day congestion pricing.</p></div></div>
        <div class="corridor-assumption">${icon("Route",18)} <b>E22</b><span>Abu Dhabi-Al Ain Road · high-volume industrial flow</span></div>
        <div class="corridor-assumption">${icon("BadgeDollarSign",18)} <b>E611</b><span>Bypass interchanges · regional congestion relief</span></div>
        <div class="card"><div class="card-head">FLOW OUTCOME</div><div class="metric-row"><div class="metric"><strong>22-28%</strong><small>Delay reduction</small></div><div class="metric"><strong>E22</strong><small>Industrial flow</small></div><div class="metric"><strong>E611</strong><small>Bypass relief</small></div></div></div>
      </div>
    </div>
    <div class="video-action card">
      <div class="card-head">${icon("Cctv",18)} FROM VIDEO STREAM TO AGENT-READY ACTION <span>MONETIZE360 · REVENUEOS</span></div>
      <div class="pipeline">${pipeline.map((p) => `<div class="pipe-step"><span>${p[0]}</span>${icon(p[3],22)}<b>${p[1]}</b><small>${p[2]}</small></div>`).join("")}</div>
      <div class="video-grid">
        <div class="video-feed"><div class="feed-road"></div><span class="plate">AD 12 · 88421</span><span class="feed-tag">REAL-TIME VIDEO INTELLIGENCE</span></div>
        <div class="action-list">
          <div>${icon("Eye",18)} <b>Capture</b><span>Vehicle + plate confidence streamed to evidence layer</span></div>
          <div>${icon("Receipt",18)} <b>Charge</b><span>Dynamic toll posted into RevenueOS ledger</span></div>
          <div>${icon("Network",18)} <b>Share</b><span>AI Souk gateway allocates DMT, police, operator, and enterprise revenue</span></div>
          <div>${icon("Route",18)} <b>Optimize</b><span>Signals, route guidance, and toll bands update before queues form</span></div>
        </div>
      </div>
    </div>
    <div class="simulation-panel card">
      <div class="card-head">${icon("Play",18)} BEFORE ACTION, SIMULATE THE RESPONSE <span>INCHOR AI · ADVISORY MODE</span></div>
      <div class="simulation-grid">
        <div class="simulation-shot">
          <img src="./assets/snips/congestion-simulation.png" alt="Congestion simulation showing aerial traffic response options and KPI planning" />
          <span class="sim-badge">INCHOR AI SIMULATION</span>
          <span class="sim-status">Engineer approval required</span>
        </div>
        <div class="simulation-side">
          <div class="sim-card"><div class="eyebrow">INCHOR AI ROLE</div><p>Simulates candidate response options, compares per-plan KPIs, and keeps DMT engineers in the approval loop before execution.</p></div>
          <div class="sim-card"><div class="eyebrow">PLAN SELECTOR</div><div class="plan-tabs"><span>Plan A</span><b>Plan B</b><span>Plan C</span></div><p>Plan B: extend eastbound green +15s and rebalance toll bands near the gantry pair.</p></div>
          <div class="sim-card kpi-card"><div class="eyebrow">KPI COMPARISON</div>${[["Avg wait","61 s"],["Queue","74 m"],["Throughput","1,420"],["Spillback risk","Low"],["Revenue leakage","-8%"]].map(r=>`<div><span>${r[0]}</span><b>${r[1]}</b></div>`).join("")}<button class="tab">ADVISORY · AWAITING ENGINEER APPROVAL</button></div>
        </div>
      </div>
      <div class="sim-prompts"><div class="eyebrow">SMART ASSIST · NATURAL-LANGUAGE QUESTIONS</div>${[
        ["SIM SIMULATION", "What if we extend eastbound green by 15s on this corridor?"],
        ["VIDEO / VLM SEARCH", "Show queue-spike events at this gantry over the last 30 days."],
        ["EXECUTIVE ROI", "What is the ROI of scaling image-based tolling city-wide?"]
      ].map(p=>`<div><span class="tag green">${p[0]}</span><p>${p[1]}</p></div>`).join("")}</div>
    </div>
    <div class="share-table card"><div class="card-head">TOLLABLE CORRIDOR QUEUE <span>SPEED · VALUE · POSTURE</span></div>${corridors.map((r) => `<div class="share-row"><div><b>${r[0]}</b><div class="sub">image/video license capture tolling · AI Souk settlement · RevenueOS posting</div></div><strong>${r[1]}</strong><span class="tag ${r[3] === "High" ? "" : r[3] === "Watch" ? "gold" : "green"}">${r[3]}</span></div>`).join("")}</div>
  </section>`;
}

function cyberScreen() {
  const threatRows = [
    ["Citizen ID portal", "Credential stuffing", "High", "2,914 attempts", "Contain"],
    ["Enterprise API gateway", "Token replay pattern", "Elevated", "17 partners", "Rotate"],
    ["City Police dispatch", "Phishing campaign", "Guarded", "6 mailboxes", "Coach"],
    ["Healthcare exchange", "Ransomware indicator", "Critical", "2 clinics", "Isolate"],
    ["Regional Gov link", "DDoS pressure", "Elevated", "4.2 Gbps", "Rate-limit"],
  ];
  return `<section class="screen pad">
    <div class="eyebrow">CYBERSECURITY THREATS</div>
    <h1>Digital Trust Operations</h1>
    <p class="lead">Unified threat surface for Abu Dhabi AI services across citizens, enterprises, city police, healthcare, regional government, and national growth infrastructure.</p>
    <div class="cyber-layout">
      <div class="threat-radar card">
        <div class="card-head">${icon("Radar",18)} THREAT RADAR <span class="tag">LIVE</span></div>
        <div class="radar-stage">
          <span class="radar-ring r1"></span><span class="radar-ring r2"></span><span class="radar-ring r3"></span><span class="radar-sweep"></span>
          <span class="blip red" style="left:63%;top:28%"></span>
          <span class="blip gold" style="left:39%;top:62%"></span>
          <span class="blip blue" style="left:71%;top:68%"></span>
          <span class="blip green" style="left:44%;top:34%"></span>
          <div class="radar-core">${icon("ShieldAlert",36)}<b>47</b><span>active signals</span></div>
        </div>
      </div>
      <div class="stack">
        <div class="card"><div class="card-head">MISSION IMPACT</div><div class="metric-row"><div class="metric"><strong>99.98%</strong><small>Citizen services uptime</small></div><div class="metric"><strong style="color:var(--red)">2</strong><small>Critical incidents</small></div><div class="metric"><strong>AED 8.7B</strong><small>Exposure avoided</small></div></div></div>
        <div class="card"><div class="card-head">AI RECOMMENDED RESPONSE</div><div class="card-body"><h2>Isolate healthcare exchange anomalies before business hours</h2><p>Prioritize endpoint isolation for two clinics, rotate enterprise API tokens, and brief City Police cyber liaison on the phishing cluster.</p><button class="tab" data-route="ask">${icon("Sparkles",16)} Ask AI Control Tower for incident brief</button></div></div>
      </div>
    </div>
    <div class="threat-table card"><div class="card-head">ACTIVE THREAT QUEUE <span>OWNER · RESPONSE</span></div>${threatRows.map((r) => `<div class="audit-row threat-row"><div><b>${r[0]}</b><div class="sub">${r[1]} · ${r[3]}</div></div><span class="tag ${r[2] === "Critical" ? "" : r[2] === "High" || r[2] === "Elevated" ? "gold" : "green"}">${r[2]}</span><button class="tab">${r[4]}</button></div>`).join("")}</div>
    <div class="ecosystem-grid">${ecosystemCards("cyber").join("")}</div>
  </section>`;
}

function revenueScreen() {
  const flows = [
    ["Citizens", "Premium convenience services", "AED 42B", "12%"],
    ["Enterprises", "AI APIs + compliance services", "AED 186B", "34%"],
    ["City Police", "Safety analytics subscriptions", "AED 58B", "11%"],
    ["Healthcare", "Population-health intelligence", "AED 91B", "17%"],
    ["Regional Gov", "Shared platforms + data exchange", "AED 124B", "23%"],
    ["National GDP Growth", "Productivity uplift", "AED 2.4T", "3.1x"],
  ];
  return `<section class="screen pad">
    <div class="eyebrow">AI SOUK</div>
    <h1>AI Souk Value Exchange</h1>
    <p class="lead">Demo model for how Abu Dhabi and UAE enterprises can share AI-service revenue while measuring citizen benefit, enterprise adoption, public-safety outcomes, healthcare efficiency, regional coordination, and national GDP growth.</p>
    <div class="revenue-hero">
      <div class="card flow-card"><div class="card-head">${icon("Network",18)} ECOSYSTEM LEDGER <span class="tag green">BALANCED</span></div><div class="flow-diagram">
        <div class="hub"><b>City of Abu Dhabi</b><span>AI Services Platform</span></div>
        ${flows.map((f, i) => `<div class="flow-node n${i}"><b>${f[0]}</b><span>${f[2]}</span></div>`).join("")}
      </div></div>
      <div class="stack">
        <div class="card"><div class="card-head">FY26 REVENUE POOL</div><div class="card-body"><div class="large-number">AED 501B</div><p>Direct platform revenue before reinvestment, service credits, and enterprise co-development share.</p></div></div>
        <div class="card"><div class="card-head">GDP UPLIFT MODEL</div><div class="card-body"><div class="large-number">AED 2.4T</div><p>Modeled productivity and service-efficiency impact across the AI-services ecosystem.</p></div></div>
      </div>
    </div>
    <div class="share-table card"><div class="card-head">REVENUE SHARE BY STAKEHOLDER <span>POOL · SHARE</span></div>${flows.map((f) => `<div class="share-row"><div><b>${f[0]}</b><div class="sub">${f[1]}</div></div><strong>${f[2]}</strong><span class="tag ${f[0] === "National GDP Growth" ? "green" : "gold"}">${f[3]}</span></div>`).join("")}</div>
    <div class="ecosystem-grid">${ecosystemCards("revenue").join("")}</div>
  </section>`;
}

function ecosystemCards(mode) {
  const cyber = mode === "cyber";
  const items = [
    ["Citizens", "Users", cyber ? "Identity protection, fraud defense, and trusted digital access." : "Better services funded through convenience, licensing, and reinvestment credits.", "Users"],
    ["Enterprises", "Building2", cyber ? "API security, partner risk scoring, and commercial data-sharing controls." : "Revenue share for AI APIs, compliance products, and co-developed services.", "Building2"],
    ["City Police", "Shield", cyber ? "Cyber liaison queue for public-safety systems and evidence-chain integrity." : "Safety analytics subscriptions and public-safety productivity returns.", "Shield"],
    ["Healthcare", "HeartPulse", cyber ? "Clinical-network isolation posture and sensitive data monitoring." : "Population-health intelligence and operational efficiency dividends.", "HeartPulse"],
    ["Regional Gov", "Landmark", cyber ? "Cross-authority incident coordination and federated trust controls." : "Shared platforms, inter-authority data exchange, and pooled procurement.", "Landmark"],
    ["National GDP Growth", "TrendingUp", cyber ? "Resilience score tied to investor trust and digital economy continuity." : "Productivity uplift, enterprise growth, and national competitiveness impact.", "TrendingUp"],
  ];
  return items.map((x) => `<div class="ecosystem-card"><div class="ecosystem-icon">${icon(x[3],22)}</div><h3>${x[0]}</h3><p>${x[2]}</p></div>`);
}

function taskCard(t) {
  return `<div class="task"><div><span class="tag">${t[0]}</span> <span class="tag gray">${t[1]}</span></div><h3>${t[2]}</h3><p>${t[3]}</p><div class="sub">${icon("Users",14)} ${t[4]} &nbsp; ${icon("Calendar",14)} due Invalid Date</div><div class="tabs" style="margin:12px 0 0"><button class="tab">Open</button><button class="tab"><i class="dot red"></i>Urgent</button><button class="tab" data-route="ask">Ask AI Control Tower</button></div></div>`;
}

function genericScreen(eyebrow, title, lead, cards) {
  return `<section class="screen pad"><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p class="lead">${lead}</p><div class="generic-grid">${cards}</div></section>`;
}

function simpleCard(title, num, body, tag = "NORMAL") {
  return `<div class="card"><div class="card-head">${title}<span class="tag ${tag === "ALERT" ? "gold" : tag === "URGENT" ? "" : "green"}">${tag}</span></div><div class="card-body"><div class="large-number">${num}</div><p>${body}</p><button class="tab" data-route="ask">${icon("Sparkles",16)} Ask AI Control Tower</button></div></div>`;
}
function housingCards(){ return [simpleCard("Safety-Ready Units","12,440","Active safer-housing, worker-accommodation, and mixed-use residential units across tracked projects."), simpleCard("Blocked Permits","37","Projects delayed by zoning, environmental, or inter-agency life-safety review.","ALERT"), simpleCard("Municipality Parcels","54","Candidate parcels ranked for transit access, heat exposure, coastal risk, and service-readiness fit.")].join("");}
function pulseCards(){ return stories.map(s=>simpleCard(`${s[0]} · ${s[1]}`,s[2],`${s[3]} ${s[4]}`,s[0]==="HIGH"?"ALERT":"NORMAL")).join("");}
function intergovCards(){ return [simpleCard("Authority Deadlines","6","Funding and agency responses due in the next 14 days.","ALERT"), simpleCard("Emirate Dependencies","18","Items awaiting authority action or data transfer."), simpleCard("UAE Watchlist","11","Regulatory and executive actions with city impact.")].join("");}
function departmentCards(){ return [simpleCard("Civil Defence 997","3","Generator readiness and station coverage items require follow-up.","ALERT"), simpleCard("Public Realm","28,124","Code and infrastructure signals under weekly review."), simpleCard("Building Permits","213k","Permit backlog cases older than 90 days.","URGENT")].join("");}
function reportCards(){ return [simpleCard("Budget Anomaly Report","Ready","Independent review packet prepared for publication."), simpleCard("Daily Brief PDF","Today","Executive-ready briefing generated from live city signals."), simpleCard("Equity Review","Draft","District matrix with AI narrative and action appendix.")].join("");}
function documentCards(){ return [simpleCard("Indexed Files","148","Budgets, ordinances, memos, grants, and PDFs searchable by Ask AI Control Tower."), simpleCard("New Uploads","9","Awaiting classification and summary."), simpleCard("Citations","2,931","Answer snippets trace back to document spans.")].join("");}
function auditCards(){ return [simpleCard("Tool Calls","14,882","Supabase, NCM, municipal service feeds, transport data, and document retrieval traces."), simpleCard("User Actions","927","Status changes, exports, and assignments recorded."), simpleCard("System Health","Degraded","Map/weather latency detected in the last update window.","ALERT")].join("");}

function scatterPoints() {
  document.querySelectorAll(".points").forEach((el) => {
    const green = el.classList.contains("green-points");
    let html = "";
    for (let i = 0; i < 520; i++) {
      const x = 28 + Math.random() * 34 + Math.sin(i) * 8;
      const y = 4 + Math.random() * 74;
      const cls = green ? "green" : i % 29 === 0 ? "gold" : i % 41 === 0 ? "red" : "";
      html += `<span class="point ${cls}" style="left:${x}%;top:${y}%"></span>`;
    }
    for (let i = 0; i < 80; i++) html += `<span class="point ${green ? "green" : ""}" style="left:${56 + Math.random()*9}%;top:${6 + Math.random()*35}%"></span>`;
    el.innerHTML = html;
  });
}

window.addEventListener("hashchange", render);
updateClock();
render();
updateWeather();
setInterval(updateClock, 60 * 1000);
setInterval(updateWeather, 10 * 60 * 1000);
