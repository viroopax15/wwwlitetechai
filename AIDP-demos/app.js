const app = document.querySelector("#app");
const backButton = document.querySelector("#backButton");
const navButtons = Array.from(document.querySelectorAll("[data-route]"));

const state = {
  route: "home",
  history: [],
  learnStep: 0,
  demo: null,
  tab: "overview"
};

const learnSteps = [
  {
    kicker: "The enterprise problem",
    title: "Why enterprise AI stalls",
    lead: "Data is fragmented, RAG pipelines are brittle, inference is expensive, and sovereignty requirements slow down progress.",
    bullets: [
      "Data lives across file systems, object stores, databases, and SaaS silos",
      "DIY retrieval pipelines become expensive to operate and hard to secure",
      "Idle GPUs and slow data movement weaken AI ROI",
      "Months of integration work delay agent and app launches"
    ],
    metrics: [["Months", "typical DIY runway"], ["Low", "GPU utilization"], ["High", "pipeline risk"]]
  },
  {
    kicker: "Cut complexity",
    title: "An AI factory gives teams a production path",
    lead: "Pre-validated infrastructure turns data, models, storage, networking, governance, and observability into one repeatable operating model.",
    bullets: [
      "Days to first production pilot instead of months of platform assembly",
      "Secure-by-design data paths for regulated enterprise environments",
      "NVIDIA-aligned inference, RAG, NeMo, NIM, and agent service patterns",
      "Business-ready templates for apps, copilots, and agentic workflows"
    ],
    metrics: [["Days", "to first pilot"], ["Secure", "by design"], ["Repeatable", "app pattern"]]
  },
  {
    kicker: "Turnkey AI solution",
    title: "From raw data to operational AI",
    lead: "AIDP-style pipelines combine high-performance storage, GPU acceleration, and retrieval services so AI apps can ground answers in trusted enterprise data.",
    bullets: [
      "Multimodal RAG for documents, tables, images, video, and operational records",
      "Metadata-smart movement that keeps GPUs fed and reduces repeated reads",
      "NIM and NeMo services for embedding, reranking, guardrails, and inference",
      "Hybrid data access for on-prem, edge, and cloud-aware AI factories"
    ],
    metrics: [["RAG", "ready"], ["NIM", "enabled"], ["Hybrid", "data access"]]
  },
  {
    kicker: "Ready on day one",
    title: "Blueprint to production",
    lead: "Instead of starting from a blank architecture diagram, teams begin with a validated blueprint and scale it as workloads mature.",
    bullets: [
      "Start with a small multimodal RAG or agent pilot",
      "Add extraction, embedding, indexing, and reranking pipelines",
      "Scale inference, storage, governance, and observability together",
      "Turn lessons from one use case into reusable enterprise patterns"
    ],
    metrics: [["4-8", "starter GPUs"], ["0.5PB+", "starter data tier"], ["256+", "scale-out GPUs"]]
  },
  {
    kicker: "Business outcomes",
    title: "Accelerate the industries that matter",
    lead: "The same data factory pattern supports finance, life sciences, manufacturing, public sector, telco, and media use cases.",
    bullets: [
      "Financial intelligence: intraday risk, fraud analytics, market surveillance",
      "Drug discovery: sequence to candidate workflows with model-assisted screening",
      "Media intelligence: search across video, image, audio, and documents",
      "Operations intelligence: agent workflows grounded in approved enterprise data"
    ],
    metrics: [["10x", "faster analysis"], ["20x", "RAG pipeline uplift"], ["2-3x", "faster lead discovery"]]
  }
];

const demos = {
  rag: {
    title: "RAG. Easy. Secure.",
    subtitle: "Upload documents, retrieve relevant context, ask questions naturally, and compare data-pipeline performance.",
    visual: "./assets/demo-rag.svg",
    nav: ["overview", "storage", "ingest", "query", "benchmark", "next"],
    metrics: [["20x", "faster pipeline"], ["99%", "GPU feed target"], ["Private", "enterprise data"]],
    terminal: [
      "$ connect source --type object --policy governed",
      "$ ingest docs --extract tables --embed multimodal",
      "✓ 42,000 pages parsed",
      "✓ 8.4M chunks indexed",
      "✓ retrieval cache warm",
      "$ ask \"Which contracts renew this quarter?\"",
      "→ Answer grounded with citations and confidence"
    ]
  },
  fsi: {
    title: "Financial Analysis 2.0",
    subtitle: "Move from overnight batch analytics to intraday decision-making with GPU-optimized data pipelines.",
    visual: "./assets/demo-finance.svg",
    nav: ["overview", "terminal", "architecture", "next"],
    metrics: [["6 hrs → 2 min", "risk calculation"], ["60% → 90%", "GPU utilization"], ["$800K+", "avoided CapEx"]],
    terminal: [
      "$ load portfolio --positions 18M --market-feed live",
      "$ run monte-carlo --scenarios 50k --gpu-pool production",
      "✓ VaR recalculated in 02:03",
      "✓ anomalies routed to review queue",
      "✓ compliance notes attached",
      "→ Desk receives intraday explainability packet"
    ]
  },
  bio: {
    title: "Drug Discovery. Faster.",
    subtitle: "Accelerate target discovery, structure prediction, virtual screening, and candidate validation.",
    visual: "./assets/demo-bio.svg",
    nav: ["overview", "rag", "screening", "architecture", "next"],
    metrics: [["Weeks → Hours", "target to lead"], ["Billions", "screened compounds"], ["2-3x", "faster lead cycle"]],
    terminal: [
      "$ submit protein-sequence target.fasta",
      "$ predict-structure --model bionemo",
      "✓ binding pockets identified",
      "$ screen-library --compounds 2.1B --top-k 500",
      "✓ candidates ranked by affinity and toxicity",
      "→ validation packet ready for lab review"
    ]
  },
  media: {
    title: "Multimedia Intelligence",
    subtitle: "Search across images, video, text, audio, and metadata with a unified retrieval layer.",
    visual: "./assets/demo-media.svg",
    nav: ["overview", "extract", "search", "govern", "next"],
    metrics: [["All media", "single index"], ["Frames + text", "multimodal chunks"], ["Seconds", "answer latency"]],
    terminal: [
      "$ ingest media --video --images --transcripts --metadata",
      "✓ scene frames extracted",
      "✓ OCR and speech transcripts aligned",
      "✓ brand-safe policy tags applied",
      "$ search \"show turbine corrosion from last inspection\"",
      "→ Matching video frames, reports, and service logs returned"
    ]
  }
};

function setRoute(route, push = true) {
  if (push && state.route !== route) state.history.push({ route: state.route, demo: state.demo, tab: state.tab, learnStep: state.learnStep });
  state.route = route;
  if (route !== "demo") state.demo = null;
  render();
}

function setDemo(name) {
  state.history.push({ route: state.route, demo: state.demo, tab: state.tab, learnStep: state.learnStep });
  state.route = "demo";
  state.demo = name;
  state.tab = demos[name].nav[0];
  render();
}

function goBack() {
  const previous = state.history.pop();
  if (!previous) {
    setRoute("home", false);
    return;
  }
  Object.assign(state, previous);
  render();
}

function updateNav() {
  navButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.route === state.route));
}

function homeTemplate() {
  return `
    <section class="hero">
      <div>
        <div class="eyebrow">AIDP demo center</div>
        <h1>Make your data AI ready</h1>
        <p class="lead">Transform raw enterprise data into operational AI through data pipelines, retrieval, governed storage, and GPU-accelerated AI factories ready for agents and apps.</p>
        <div class="choice-grid">
          <button class="choice-card" type="button" data-action="route" data-target="learn">
            <span class="select-glyph">01</span>
            <h3>Learn</h3>
            <p class="muted">Understand how an enterprise AI Data Platform and AI factory operating model works.</p>
          </button>
          <button class="choice-card" type="button" data-action="route" data-target="experience">
            <span class="select-glyph">02</span>
            <h3>Experience</h3>
            <p class="muted">Explore guided demos for RAG, finance, drug discovery, and multimedia intelligence.</p>
          </button>
          <button class="choice-card" type="button" data-action="route" data-target="try">
            <span class="select-glyph">03</span>
            <h3>Try</h3>
            <p class="muted">Translate the demo into business value props for your own AI factory roadmap.</p>
          </button>
        </div>
      </div>
      <div class="hero-visual">
        <img class="architecture-image" src="./assets/ai-factory-architecture.svg" alt="AI factory data plane architecture from data sources to storage, AI services, and apps" />
      </div>
    </section>`;
}

function learnTemplate() {
  const step = learnSteps[state.learnStep];
  return `
    <section>
      <div class="section-head">
        <div>
          <div class="eyebrow">${step.kicker}</div>
          <h2>${step.title}</h2>
        </div>
        <span class="muted">${state.learnStep + 1} / ${learnSteps.length}</span>
      </div>
      <div class="stepper">
        <article class="story-card">
          <p class="lead">${step.lead}</p>
          <figure class="story-visual">
            <img src="./assets/ai-factory-architecture.svg" alt="AI factory architecture diagram" />
          </figure>
          <ul>${step.bullets.map((item) => `<li>${item}</li>`).join("")}</ul>
          <div class="actions">
            <button class="primary-action" type="button" data-action="next-learn">${state.learnStep === learnSteps.length - 1 ? "Explore demos" : "Continue"}</button>
            <button class="ghost-action" type="button" data-action="route" data-target="experience">Experience workloads</button>
          </div>
        </article>
        <aside class="story-side">
          ${step.metrics.map(([value, label]) => `<div class="metric-card"><strong>${value}</strong><span class="muted">${label}</span></div>`).join("")}
        </aside>
      </div>
    </section>`;
}

function experienceTemplate() {
  return `
    <section>
      <div class="section-head">
        <div>
          <div class="eyebrow">AI workloads</div>
          <h2>Start your AI journey</h2>
          <p class="lead">Choose a guided workload and see how data pipelines, storage, GPU acceleration, retrieval, and governance come together.</p>
        </div>
      </div>
      <div class="experience-grid">
        <button class="demo-card" type="button" data-action="demo" data-demo="rag"><img src="${demos.rag.visual}" alt="" /><h3>RAG. Easy. <span>Secure.</span></h3><p class="muted">Ingest, retrieve, query, and benchmark governed enterprise documents.</p></button>
        <button class="demo-card" type="button" data-action="demo" data-demo="fsi"><img src="${demos.fsi.visual}" alt="" /><h3>Financial <span>Analysis 2.0</span></h3><p class="muted">Walk through AI-powered financial intelligence from terminal to architecture.</p></button>
        <button class="demo-card" type="button" data-action="demo" data-demo="bio"><img src="${demos.bio.visual}" alt="" /><h3>Drug Discovery. <span>Faster.</span></h3><p class="muted">Move from protein sequence to validated candidates with AI-assisted screening.</p></button>
        <button class="demo-card" type="button" data-action="demo" data-demo="media"><img src="${demos.media.visual}" alt="" /><h3>Multimedia <span>Intelligence</span></h3><p class="muted">Search images, video, text, audio, and metadata through one retrieval interface.</p></button>
      </div>
    </section>`;
}

function demoTemplate() {
  const demo = demos[state.demo];
  return `
    <section class="demo-shell">
      <div class="section-head">
        <div>
          <div class="eyebrow">Guided workload</div>
          <h2>${demo.title}</h2>
          <p class="lead">${demo.subtitle}</p>
        </div>
      </div>
      <div class="tabs">${demo.nav.map((tab) => `<button class="tab-button ${state.tab === tab ? "is-active" : ""}" type="button" data-action="tab" data-tab="${tab}">${tabLabel(tab)}</button>`).join("")}</div>
      <div class="demo-layout">
        <article class="panel">${demoPanel(demo)}</article>
        <aside class="story-side">
          ${demo.metrics.map(([value, label]) => `<div class="metric-card"><strong>${value}</strong><span class="muted">${label}</span></div>`).join("")}
        </aside>
      </div>
    </section>`;
}

function tabLabel(tab) {
  return tab.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");
}

function demoPanel(demo) {
  if (state.tab === "terminal") {
    return `${demoVisual(demo)}<h3>Terminal walkthrough</h3><div class="terminal">${demo.terminal.map((line) => `<span>${line}</span>`).join("")}</div>`;
  }
  if (state.tab === "benchmark") {
    return `${demoVisual(demo)}<h3>Benchmark</h3><p class="muted">Compare a traditional cloud pipeline against a tuned AI factory data path.</p>${barRows([["Cloud baseline", 38], ["AI factory pipeline", 92], ["GPU feed efficiency", 99]])}`;
  }
  if (state.tab === "architecture") {
    return `${architectureVisual()}<h3>Architecture</h3><div class="workflow-grid">${["AI applications", "Orchestration", "Monetization", "AI agents and users"].map((item) => `<div class="workflow-card"><b>${item}</b><span class="muted">${architectureText(item)}</span></div>`).join("")}</div>`;
  }
  if (state.tab === "next") {
    return `${demoVisual(demo)}<h3>Next steps</h3><p class="muted">Pick one high-value workflow, connect approved data, define success metrics, and launch a production pilot with monitoring from day one.</p><div class="actions"><button class="primary-action" type="button" data-action="route" data-target="try">See business value props</button><button class="ghost-action" type="button" data-action="route" data-target="experience">Choose another demo</button></div>`;
  }
  return `${demoVisual(demo)}<h3>${tabLabel(state.tab)}</h3><p class="muted">${panelCopy(state.demo, state.tab)}</p><div class="workflow-grid">${workflowItems(state.demo, state.tab).map((item) => `<div class="workflow-card"><b>${item[0]}</b><span class="muted">${item[1]}</span></div>`).join("")}</div>`;
}

function demoVisual(demo) {
  return `<figure class="demo-screen"><img src="${demo.visual}" alt="${demo.title} demo screen" /></figure>`;
}

function architectureVisual() {
  return `<figure class="demo-screen"><img src="./assets/ai-factory-architecture.svg" alt="AI factory architecture diagram" /></figure>`;
}

function barRows(rows) {
  return rows.map(([label, width]) => `<div class="bar-row"><span>${label}</span><div class="bar"><span style="--w:${width}%"></span></div><strong>${width}%</strong></div>`).join("");
}

function architectureText(item) {
  const text = {
    "AI applications": "Copilots, dashboards, APIs, and domain workflows grounded in enterprise data.",
    "Orchestration": "Routing, tools, guardrails, function calls, workflow state, and service placement.",
    "Monetization": "Usage metering, chargeback, catalogs, SLAs, token cost, and business outcome tracking.",
    "AI agents and users": "Agents consume tools and context, then deliver governed actions and answers to users."
  };
  return text[item];
}

function panelCopy(demoKey, tab) {
  const copy = {
    rag: {
      overview: "A document-to-insight flow where governed data is extracted, chunked, embedded, retrieved, reranked, and cited.",
      storage: "Connect performant object and file storage so ingestion and retrieval avoid bottlenecks.",
      ingest: "Parse tables, PDFs, images, and records into reusable chunks with metadata and policy tags.",
      query: "Ask questions naturally and ground responses in retrieved evidence with citations."
    },
    fsi: {
      overview: "A financial intelligence workflow for risk, fraud, market surveillance, and portfolio analytics.",
      architecture: "Validated data paths let teams move from batch analysis to intraday decisions."
    },
    bio: {
      overview: "An AI-assisted discovery workflow that moves from sequence to structure, molecules, screening, and validation.",
      rag: "Scientific literature, assay results, and internal notebooks become searchable context.",
      screening: "GPU services rank candidate compounds and route top hits for review."
    },
    media: {
      overview: "A multimodal intelligence flow for images, video, audio, OCR, transcripts, and metadata.",
      extract: "Scene frames, speech, text, entities, and labels become searchable chunks.",
      search: "One query can find moments, documents, frames, and evidence across media types.",
      govern: "Policy tags, lineage, and access controls follow the indexed content."
    }
  };
  return copy[demoKey]?.[tab] || "A guided step showing how the AI factory pipeline turns enterprise data into operational AI.";
}

function workflowItems(demoKey, tab) {
  const shared = {
    overview: [["Data ready", "Gather data and enforce access policy."], ["Model ready", "Prepare embeddings, rerankers, and inference services."], ["App ready", "Expose APIs and dashboards for users."], ["Ops ready", "Monitor throughput, cost, quality, and safety."]],
    storage: [["Connect", "Attach object, file, and data lake sources."], ["Cache", "Keep hot context close to GPUs."], ["Govern", "Preserve access controls and lineage."], ["Scale", "Grow from pilot to production."],
    ],
    ingest: [["Extract", "Parse PDFs, tables, images, and records."], ["Chunk", "Split content into retrieval units."], ["Embed", "Create vector representations."], ["Index", "Build searchable stores with metadata."]],
    query: [["Ask", "Use natural language prompts."], ["Retrieve", "Find relevant context."], ["Rerank", "Prioritize high-confidence evidence."], ["Answer", "Generate cited responses."]],
    rag: [["Literature", "Ground research in approved sources."], ["Assays", "Connect experiment data."], ["Targets", "Link proteins and compounds."], ["Review", "Package candidates for scientists."]],
    screening: [["Generate", "Create candidate lists."], ["Score", "Rank by fit and risk."], ["Filter", "Apply toxicity and novelty checks."], ["Validate", "Send top hits to review."]],
    extract: [["Frames", "Sample video and image moments."], ["Speech", "Transcribe audio."], ["OCR", "Extract on-screen text."], ["Labels", "Add entities and metadata."]],
    search: [["Unified query", "Search all media types."], ["Evidence", "Return frames, docs, and excerpts."], ["Context", "Keep related records together."], ["Actions", "Route findings to workflows."]],
    govern: [["Policy", "Respect data access."], ["Lineage", "Trace source and transformations."], ["Audit", "Record usage."], ["Retention", "Manage data lifecycle."]]
  };
  return shared[tab] || shared.overview;
}

function tryTemplate() {
  return `
    <section>
      <div class="section-head">
        <div>
          <div class="eyebrow">Get started</div>
          <h2>Build the AI factory behind your agents and apps</h2>
          <p class="lead">The practical next step is aligning business value, data readiness, and platform patterns so every AI app can start from trusted, governed context.</p>
        </div>
      </div>
      <div class="try-grid">
        <article class="value-card"><strong>Launch agents on trusted data</strong><p class="muted">AI agents are only as good as the data they can retrieve, cite, and act on. Start with governed pipelines, not isolated prompts.</p></article>
        <article class="value-card"><strong>Reduce time to production</strong><p class="muted">Reusable ingestion, embedding, indexing, and inference patterns shorten the path from pilot to production app.</p></article>
        <article class="value-card"><strong>Keep GPUs economically useful</strong><p class="muted">High-performance data movement and caching improve utilization and reduce the cost of slow, repeated context rebuilds.</p></article>
        <article class="value-card"><strong>Scale from one use case</strong><p class="muted">The same AI factory can power support copilots, research assistants, financial agents, and operational dashboards.</p></article>
        <article class="value-card"><strong>Meet governance needs</strong><p class="muted">Access control, lineage, audit trails, retention, and policy-aware retrieval become part of the platform instead of an afterthought.</p></article>
        <article class="value-card"><strong>Measure business outcomes</strong><p class="muted">Track cycle time, GPU utilization, answer quality, user adoption, and workflow impact from day one.</p></article>
      </div>
      <div class="callout">
        <h3>Recommended first move</h3>
        <p class="muted">Choose one workflow with measurable value, connect the minimum approved data set, define quality and governance targets, and build the first reusable AI pipeline pattern for your organization.</p>
      </div>
    </section>`;
}

function render() {
  updateNav();
  backButton.disabled = state.route === "home" && state.history.length === 0;
  const templates = { home: homeTemplate, learn: learnTemplate, experience: experienceTemplate, demo: demoTemplate, try: tryTemplate };
  app.innerHTML = templates[state.route]();
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action], [data-route]");
  if (!target) return;
  if (target.dataset.route) {
    state.learnStep = target.dataset.route === "learn" ? 0 : state.learnStep;
    setRoute(target.dataset.route);
    return;
  }
  if (target.dataset.action === "route") {
    if (target.dataset.target === "learn") state.learnStep = 0;
    setRoute(target.dataset.target);
  }
  if (target.dataset.action === "demo") setDemo(target.dataset.demo);
  if (target.dataset.action === "tab") {
    state.tab = target.dataset.tab;
    render();
  }
  if (target.dataset.action === "next-learn") {
    if (state.learnStep < learnSteps.length - 1) {
      state.learnStep += 1;
      render();
    } else {
      setRoute("experience");
    }
  }
});

backButton.addEventListener("click", goBack);
render();
