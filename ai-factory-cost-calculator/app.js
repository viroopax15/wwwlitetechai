const models = {
  "llama2-7b": { name: "Llama 2 7B", weightGb: 14, layers: 32, hidden: 4096 },
  "llama2-13b": { name: "Llama 2 13B", weightGb: 26, layers: 40, hidden: 5120 },
  "llama2-70b": { name: "Llama 2 70B", weightGb: 140, layers: 80, hidden: 8192 },
  "llama3-8b": { name: "Llama 3 8B", weightGb: 16, layers: 32, hidden: 4096 },
  "llama3-70b": { name: "Llama 3 70B", weightGb: 140, layers: 80, hidden: 8192 },
  "mixtral-8x7b": { name: "Mixtral 8x7B", weightGb: 94, layers: 32, hidden: 14336 },
  "mistral-7b": { name: "Mistral 7B", weightGb: 14, layers: 32, hidden: 4096 },
  "qwen2-72b": { name: "Qwen 2 72B", weightGb: 144, layers: 80, hidden: 8192 },
  "falcon-40b": { name: "Falcon 40B", weightGb: 80, layers: 60, hidden: 8192 },
  "nemotron3-nano-30b-a3b": { name: "NVIDIA Nemotron 3 Nano 30B-A3B NIM", weightGb: 60, layers: 48, hidden: 6144, activeParamsB: 3, context: "1M", kvScale: 0.72 },
  "nemotron3-nano-omni-30b-a3b": { name: "NVIDIA Nemotron 3 Nano Omni 30B-A3B NIM", weightGb: 60, layers: 48, hidden: 6144, activeParamsB: 3, context: "multimodal", kvScale: 0.8 },
  "nemotron3-super-120b-a12b": { name: "NVIDIA Nemotron 3 Super 120B-A12B NIM", weightGb: 240, layers: 80, hidden: 12288, activeParamsB: 12, context: "1M", kvScale: 0.9 },
  "nemotron3-ultra-550b-a55b": { name: "NVIDIA Nemotron 3 Ultra 550B-A55B NIM", weightGb: 1100, layers: 96, hidden: 18432, activeParamsB: 55, context: "1M", kvScale: 1 },
  "nemo-retriever-embed-300m": { name: "NeMo Retriever Llama Nemotron Embed 300M v2", weightGb: 3.5, layers: 24, hidden: 1536, category: "retriever", kvScale: 0.08 },
  "nemo-retriever-embed-1b": { name: "NeMo Retriever Llama Nemotron Embed 1B v2", weightGb: 6.5, layers: 32, hidden: 2048, category: "retriever", kvScale: 0.1 },
  "nemo-retriever-embed-vl-1b": { name: "NeMo Retriever Llama Nemotron Embed VL 1B v2", weightGb: 8.5, layers: 32, hidden: 2048, category: "retriever", kvScale: 0.12 },
  "nemo-retriever-nv-embedqa-e5": { name: "NeMo Retriever NV-EmbedQA-E5 v5", weightGb: 2, layers: 24, hidden: 1024, category: "retriever", kvScale: 0.08 },
  "custom-140b": { name: "My model", weightGb: 140, layers: 72, hidden: 8192 }
};

const hardware = {
  "dgx-h100": { label: "DGX/HGX H100 80GB", memoryGb: 80, warmTokPerSec: 145, coldReadGbps: 2.0, acceleratedReadGbps: 4.0, defaultGpus: 8, retrieverEmbedPerSec: 645, retrieverExtractPagesPerSec: 31, retrieverRerankPerSec: 498 },
  "dgx-h200": { label: "DGX/HGX H200 141GB", memoryGb: 141, warmTokPerSec: 175, coldReadGbps: 2.6, acceleratedReadGbps: 4.8, defaultGpus: 8, retrieverEmbedPerSec: 760, retrieverExtractPagesPerSec: 34, retrieverRerankPerSec: 540 },
  "dgx-b200": { label: "DGX B200 180GB", memoryGb: 180, warmTokPerSec: 255, coldReadGbps: 3.6, acceleratedReadGbps: 6.5, defaultGpus: 8, retrieverEmbedPerSec: 546, retrieverExtractPagesPerSec: 37, retrieverRerankPerSec: 532 },
  "gb200-nvl72": { label: "GB200 NVL72", memoryGb: 186, warmTokPerSec: 285, coldReadGbps: 4.0, acceleratedReadGbps: 7.2, defaultGpus: 72, retrieverEmbedPerSec: 620, retrieverExtractPagesPerSec: 42, retrieverRerankPerSec: 610 },
  a100: { label: "A100 80GB", memoryGb: 80, warmTokPerSec: 82, coldReadGbps: 1.4, acceleratedReadGbps: 2.4, defaultGpus: 8, retrieverEmbedPerSec: 509, retrieverExtractPagesPerSec: 21, retrieverRerankPerSec: 153 },
  l40s: { label: "L40S 48GB", memoryGb: 48, warmTokPerSec: 44, coldReadGbps: 1.0, acceleratedReadGbps: 1.8, defaultGpus: 4, retrieverEmbedPerSec: 471, retrieverExtractPagesPerSec: 7.2, retrieverRerankPerSec: 186 },
  "rtx-pro-6000": { label: "RTX PRO 6000 Blackwell", memoryGb: 96, warmTokPerSec: 120, coldReadGbps: 1.8, acceleratedReadGbps: 3.6, defaultGpus: 4, retrieverEmbedPerSec: 288, retrieverExtractPagesPerSec: 24, retrieverRerankPerSec: 233 }
};

const workloads = {
  rag: { label: "Enterprise RAG", hint: "RAG over internal knowledge, multi-turn Q&A, and audit logging.", recomputeNoFabric: 0.34, recomputeFabric: 0.05, hitNoFabric: 0.42, hitFabric: 0.9 },
  code: { label: "Code Assistant", hint: "Long context code generation with repository snippets and test logs.", recomputeNoFabric: 0.28, recomputeFabric: 0.06, hitNoFabric: 0.46, hitFabric: 0.86 },
  agent: { label: "Agentic Workflow", hint: "Tool calls, planning loops, scratch state, and long-lived session memory.", recomputeNoFabric: 0.42, recomputeFabric: 0.08, hitNoFabric: 0.35, hitFabric: 0.88 },
  batch: { label: "Batch Processing", hint: "High-throughput offline runs with fewer conversational KV reuse events.", recomputeNoFabric: 0.18, recomputeFabric: 0.04, hitNoFabric: 0.5, hitFabric: 0.78 },
  retriever: { label: "NeMo Retriever", hint: "Document extraction, embedding, indexing, reranking, and retrieval-augmented query service.", recomputeNoFabric: 0.22, recomputeFabric: 0.04, hitNoFabric: 0.48, hitFabric: 0.92 }
};

const precision = {
  fp16: { label: "FP16", weightMultiplier: 1, kvBytes: 2 },
  fp8: { label: "FP8", weightMultiplier: 0.55, kvBytes: 1 },
  int4: { label: "INT4", weightMultiplier: 0.33, kvBytes: 0.55 }
};

const state = {
  workload: "rag",
  precision: "fp16",
  hardware: "dgx-h100",
  activeTab: "memory",
  hasRun: false,
  result: null
};

const el = (id) => document.getElementById(id);
const fmt = new Intl.NumberFormat("en-US");
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const money2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

function numberValue(id) {
  return Number(el(id).value || 0);
}

function getHardwareProfile() {
  if (state.hardware !== "custom") return hardware[state.hardware];
  return {
    label: el("customHardwareLabel").value.trim() || "Custom BYO GPU",
    memoryGb: numberValue("customMemoryGb"),
    warmTokPerSec: numberValue("customTokPerSec"),
    coldReadGbps: numberValue("customColdRead"),
    acceleratedReadGbps: numberValue("customAccelRead"),
    defaultGpus: numberValue("gpus"),
    retrieverEmbedPerSec: Math.max(1, numberValue("customTokPerSec") * 2.2),
    retrieverExtractPagesPerSec: Math.max(1, numberValue("customTokPerSec") / 5),
    retrieverRerankPerSec: Math.max(1, numberValue("customTokPerSec") * 1.8)
  };
}

function compactNumber(value, suffix = "") {
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${(value / 1e12).toFixed(2)}T${suffix}`;
  if (abs >= 1e9) return `${(value / 1e9).toFixed(2)}B${suffix}`;
  if (abs >= 1e6) return `${(value / 1e6).toFixed(2)}M${suffix}`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(1)}K${suffix}`;
  return `${fmt.format(Math.round(value))}${suffix}`;
}

function formatStorage(tb) {
  if (tb >= 1000) return `${(tb / 1000).toFixed(tb >= 10000 ? 1 : 2)} PB`;
  if (tb >= 1) return `${tb.toFixed(tb >= 100 ? 0 : 1)} TB`;
  return `${(tb * 1000).toFixed(0)} GB`;
}

function readInputs() {
  const model = models[el("model").value];
  const hw = getHardwareProfile();
  const quant = precision[state.precision];
  const users = numberValue("users");
  const turns = numberValue("turns");
  const sessions = numberValue("sessions");
  const batchSize = numberValue("batchSize");
  const systemPrompt = numberValue("systemPrompt");
  const userInput = numberValue("userInput");
  const ragContext = numberValue("ragContext");
  const maxOutput = numberValue("maxOutput");
  const gpus = numberValue("gpus");
  const tenants = numberValue("tenants");
  const corpusTb = numberValue("corpusTb");
  const growthRate = numberValue("growthRate") / 100;
  const logRetention = numberValue("logRetention");
  const userRetention = numberValue("userRetention");
  const gpuRate = numberValue("gpuRate");
  const prefill = systemPrompt + userInput + ragContext;
  const tokensPerTurn = prefill + maxOutput;
  const tokensPerDay = users * turns * sessions * tokensPerTurn;

  return {
    model,
    hw,
    hardwareKey: state.hardware,
    quant,
    workload: workloads[state.workload],
    users,
    turns,
    sessions,
    batchSize,
    systemPrompt,
    userInput,
    ragContext,
    maxOutput,
    gpus,
    tenants,
    corpusTb,
    growthRate,
    logRetention,
    userRetention,
    gpuRate,
    prefill,
    tokensPerTurn,
    tokensPerDay
  };
}

function kvGbForTokens(input, tokens) {
  const bytes = tokens * input.model.layers * input.model.hidden * 2 * input.quant.kvBytes * (input.model.kvScale || 1);
  return bytes / 1024 ** 3;
}

function simulate() {
  const input = readInputs();
  const modelWeightGb = input.model.weightGb * input.quant.weightMultiplier;
  const engineReserveGb = Math.max(64, modelWeightGb * 0.9);
  const hbmGb = input.gpus * input.hw.memoryGb;
  const usableHbmGb = hbmGb * 0.86;
  const kvCapacityGb = Math.max(0, usableHbmGb - modelWeightGb - engineReserveGb);
  const turnRows = Array.from({ length: input.turns }, (_, index) => {
    const turn = index + 1;
    const sessionTokens = input.prefill + input.maxOutput * turn;
    const kvGb = kvGbForTokens(input, sessionTokens) * Math.min(input.users, input.batchSize * 40) / 128;
    const totalGb = modelWeightGb + engineReserveGb + kvGb;
    const overflowGb = Math.max(0, totalGb - usableHbmGb);
    return { turn, sessionTokens, kvGb, totalGb, overflowGb };
  });

  const final = turnRows[turnRows.length - 1];
  const firstOverflow = turnRows.find((row) => row.overflowGb > 0);
  const gpuMemoryNeed = Math.ceil((modelWeightGb + engineReserveGb + final.kvGb) / (input.hw.memoryGb * 0.86));
  const baseComputeNeed = Math.ceil((input.tokensPerDay / 86400) / input.hw.warmTokPerSec);
  const retrieverComputeNeed = input.model.category === "retriever"
    ? Math.ceil(Math.max(
        (input.users * input.sessions * input.turns) / Math.max(1, input.hw.retrieverEmbedPerSec * 3600),
        (input.corpusTb * 1024 * 1024 / 24) / Math.max(1, input.hw.retrieverExtractPagesPerSec * 3600),
        (input.users * input.sessions * input.turns * 40) / Math.max(1, input.hw.retrieverRerankPerSec * 3600)
      ))
    : 0;
  const gpuComputeNeed = Math.max(baseComputeNeed, retrieverComputeNeed);
  const rightSizedNoFabric = Math.max(gpuMemoryNeed, gpuComputeNeed);
  const rightSizedFabric = Math.max(Math.ceil((modelWeightGb + engineReserveGb + Math.min(final.kvGb, kvCapacityGb)) / (input.hw.memoryGb * 0.86)), gpuComputeNeed);
  const annualNoFabric = rightSizedNoFabric * input.gpuRate * 8760;
  const annualFabric = rightSizedFabric * input.gpuRate * 8760;
  const annualSavings = Math.max(0, annualNoFabric - annualFabric);
  const tokensPerYear = input.tokensPerDay * 365;
  const work = workloads[state.workload];
  const effectiveTokensNoFabric = tokensPerYear * (1 - work.recomputeNoFabric);
  const effectiveTokensFabric = tokensPerYear * (1 - work.recomputeFabric);
  const cpmNoFabric = (annualNoFabric / Math.max(1, effectiveTokensNoFabric)) * 1e6;
  const cpmFabric = (annualFabric / Math.max(1, effectiveTokensFabric)) * 1e6;

  const month36Corpus = input.corpusTb * Math.pow(1 + input.growthRate, 35) * input.tenants;
  const embeddingsTb = month36Corpus * 3.1;
  const chunkCacheTb = month36Corpus * 0.25;
  const uploadsTb = (input.users * input.sessions * 0.000004) * input.userRetention * 7;
  const outputsTb = (input.tokensPerDay * 0.000000000003) * input.userRetention * 7;
  const conversationsTb = (input.tokensPerDay * 0.000000000015) * input.logRetention * 7;
  const auditTb = (input.users * input.turns * input.sessions * 0.0000007) * input.logRetention * 7;
  const modelTb = modelWeightGb / 1000;
  const knowledgeTb = month36Corpus + embeddingsTb + chunkCacheTb;
  const usageTb = uploadsTb + outputsTb + conversationsTb;
  const totalStorageTb = knowledgeTb + usageTb + auditTb + modelTb;
  const recommendedTb = totalStorageTb * 1.35;

  const coldNoFabric = modelWeightGb / input.hw.coldReadGbps;
  const coldFabric = modelWeightGb / input.hw.acceleratedReadGbps;
  const warmTtft = Math.max(0.25, input.prefill / (input.hw.warmTokPerSec * input.gpus * 3.4));
  const uploadNoFabric = (input.userInput / 1000) * 0.75;
  const uploadFabric = uploadNoFabric * 0.18;
  const retrieval = Math.min(120, 22 + input.ragContext / 150);
  const tbtNoFabric = 1000 / (input.hw.warmTokPerSec * (1 - work.recomputeNoFabric));
  const tbtFabric = 1000 / (input.hw.warmTokPerSec * (1 - work.recomputeFabric));
  const recomputeLostTokens = tokensPerYear * work.recomputeNoFabric;
  const fabricLostTokens = tokensPerYear * work.recomputeFabric;

  return {
    input,
    modelWeightGb,
    engineReserveGb,
    hbmGb,
    usableHbmGb,
    kvCapacityGb,
    turnRows,
    final,
    firstOverflow,
    baseComputeNeed,
    retrieverComputeNeed,
    rightSizedNoFabric,
    rightSizedFabric,
    annualNoFabric,
    annualFabric,
    annualSavings,
    tokensPerYear,
    cpmNoFabric,
    cpmFabric,
    work,
    month36Corpus,
    knowledgeTb,
    usageTb,
    auditTb,
    modelTb,
    totalStorageTb,
    recommendedTb,
    coldNoFabric,
    coldFabric,
    warmTtft,
    uploadNoFabric,
    uploadFabric,
    retrieval,
    tbtNoFabric,
    tbtFabric,
    recomputeLostTokens,
    fabricLostTokens
  };
}

function updateSummaries() {
  const input = readInputs();
  el("architectureSummary").textContent = `${input.workload.label} | ${input.model.name} | ${input.gpus} GPUs`;
  el("loadSummary").textContent = `${fmt.format(input.users)} users | ${input.turns} turns | batch ${input.batchSize}`;
  el("tokenSummary").textContent = `${fmt.format(input.prefill)} in | ${fmt.format(input.maxOutput)} out`;
  el("dataSummary").textContent = `${input.tenants} tenant${input.tenants === 1 ? "" : "s"} | ${fmt.format(input.corpusTb)} TB | ${(input.growthRate * 100).toFixed(1)}%/mo`;
  el("workloadHint").textContent = input.workload.hint;
  el("gpusValue").textContent = fmt.format(input.gpus);
  el("usersValue").textContent = fmt.format(input.users);
  el("turnsValue").textContent = fmt.format(input.turns);
  el("hardwareSummary").textContent = `${input.gpus} x ${input.hw.label} | ${fmt.format(input.gpus * input.hw.memoryGb)} GB HBM`;
  el("tokenDaySummary").textContent = `${compactNumber(input.tokensPerDay, "/day")} | ${fmt.format(input.users)} users x ${input.turns} turns x ${fmt.format(input.tokensPerTurn)} tokens`;
  el("kvSummary").textContent = input.model.category === "retriever"
    ? `${input.model.name} | ${fmt.format(input.prefill)} query/context tokens | embedding + retrieval profile`
    : `${fmt.format(input.prefill)} prefill + ${fmt.format(input.maxOutput)} output per turn`;
  const month36Corpus = input.corpusTb * Math.pow(1 + input.growthRate, 35) * input.tenants;
  el("storageSummary").textContent = `Corpus reaches ${formatStorage(month36Corpus)} at month 36 before derived data.`;
}

function updateMetrics(result) {
  const memoryText = result.final.overflowGb > 0 ? `${formatStorage(result.final.overflowGb / 1000)} overflow` : "Fits in HBM";
  el("metricMemory").textContent = memoryText;
  el("metricMemoryNote").textContent = result.firstOverflow ? `First pressure at turn ${result.firstOverflow.turn}` : `${formatStorage(result.usableHbmGb / 1000)} usable HBM`;
  el("metricCost").textContent = money.format(result.annualFabric);
  el("metricCostNote").textContent = `${money.format(result.annualSavings)} annual savings vs expand-only`;
  el("metricStorage").textContent = formatStorage(result.totalStorageTb);
  el("metricStorageNote").textContent = `${formatStorage(result.recommendedTb)} with 35% headroom`;
  el("metricCpm").textContent = money2.format(result.cpmFabric);
  el("metricCpmNote").textContent = `${Math.max(0, ((result.cpmNoFabric - result.cpmFabric) / result.cpmNoFabric) * 100).toFixed(1)}% lower than expand-only`;
  el("resultsSubtitle").textContent = `${result.input.workload.label} | ${result.input.model.name} | ${result.input.gpus} x ${result.input.hw.label} | ${fmt.format(result.input.users)} users`;
  el("statusPill").textContent = result.final.overflowGb > 0 ? "Memory pressure" : "HBM fit";
  el("statusPill").className = `status-pill ${result.final.overflowGb > 0 ? "is-warning" : "is-good"}`;
}

function memoryTab(result) {
  const maxGb = Math.max(result.usableHbmGb * 1.35, result.final.totalGb);
  const rows = result.turnRows.map((row) => {
    const fill = Math.min(100, (row.totalGb / maxGb) * 100);
    const hbm = Math.min(100, (result.usableHbmGb / maxGb) * 100);
    const overflow = Math.max(0, fill - hbm);
    return `
      <div class="memory-row">
        <span>Turn ${row.turn}</span>
        <div class="bar-track" style="--fill:${fill.toFixed(2)}%; --hbm:${hbm.toFixed(2)}%; --overflow:${overflow.toFixed(2)}%">
          <div class="bar-fill"></div>
          <div class="bar-overflow"></div>
        </div>
        <strong>${formatStorage(row.totalGb / 1000)}</strong>
      </div>`;
  }).join("");

  return `
    <div class="detail-grid">
      <article class="detail-card">
        <h2>How memory grows with every turn</h2>
        <p>Weights and engine reserve occupy GPU memory first. Multi-turn KV cache then grows each turn; orange marks the portion that exceeds usable HBM.</p>
        <div class="memory-bars">${rows}</div>
        <div class="legend"><span>Weights + KV in HBM</span><span class="orange">KV beyond HBM</span></div>
      </article>
      <article class="detail-card">
        <h3>Memory sizing</h3>
        <div class="stat-list">
          <div class="stat"><span>Weights</span><strong>${formatStorage(result.modelWeightGb / 1000)}</strong></div>
          <div class="stat"><span>Engine reserve</span><strong>${formatStorage(result.engineReserveGb / 1000)}</strong></div>
          <div class="stat"><span>Final-turn KV</span><strong>${formatStorage(result.final.kvGb / 1000)}</strong></div>
          <div class="stat"><span>Usable HBM</span><strong>${formatStorage(result.usableHbmGb / 1000)}</strong></div>
          <div class="stat"><span>Hardware profile</span><strong>${result.input.hw.label}</strong></div>
          <div class="stat"><span>Expand-only GPUs</span><strong>${result.rightSizedNoFabric}</strong></div>
          <div class="stat"><span>Fabric-assisted GPUs</span><strong>${result.rightSizedFabric}</strong></div>
        </div>
      </article>
    </div>`;
}

function storageTab(result) {
  const total = Math.max(1, result.totalStorageTb);
  const shares = {
    knowledge: `${(result.knowledgeTb / total * 100).toFixed(2)}%`,
    usage: `${(result.usageTb / total * 100).toFixed(2)}%`,
    audit: `${(result.auditTb / total * 100).toFixed(2)}%`,
    model: `${(result.modelTb / total * 100).toFixed(2)}%`
  };

  return `
    <div class="detail-grid">
      <article class="detail-card">
        <h2>Storage growth</h2>
        <p>Knowledge, usage, audit, and model data accumulate independently. The recommendation adds headroom for re-indexing, re-embedding, and operations.</p>
        <div class="storage-stack" style="--knowledge:${shares.knowledge}; --usage:${shares.usage}; --audit:${shares.audit}; --model:${shares.model}">
          <span title="Knowledge"></span><span title="Usage"></span><span title="Audit"></span><span title="Model"></span>
        </div>
        <div class="legend"><span>Knowledge</span><span style="--accent:#2563eb">Usage</span><span class="orange">Audit</span><span style="--accent:#334155">Model</span></div>
      </article>
      <article class="detail-card">
        <h3>Month 36 composition</h3>
        <div class="stat-list">
          <div class="stat"><span>Knowledge data</span><strong>${formatStorage(result.knowledgeTb)}</strong></div>
          <div class="stat"><span>Usage data</span><strong>${formatStorage(result.usageTb)}</strong></div>
          <div class="stat"><span>Audit logs</span><strong>${formatStorage(result.auditTb)}</strong></div>
          <div class="stat"><span>Model artifacts</span><strong>${formatStorage(result.modelTb)}</strong></div>
          <div class="stat"><span>Total data</span><strong>${formatStorage(result.totalStorageTb)}</strong></div>
          <div class="stat"><span>Recommended capacity</span><strong>${formatStorage(result.recommendedTb)}</strong></div>
        </div>
      </article>
    </div>`;
}

function businessTab(result) {
  return `
    <div class="detail-grid">
      <article class="detail-card">
        <h2>Cluster economics</h2>
        <p>The expand-only case provisions enough GPUs to keep the full working set in HBM. The fabric-assisted case keeps the hot working set local and uses external high-performance storage for overflow and reuse.</p>
        <div class="stat-list">
          <div class="stat"><span>Expand-only annual cost</span><strong>${money.format(result.annualNoFabric)}</strong></div>
          <div class="stat"><span>Fabric-assisted annual cost</span><strong>${money.format(result.annualFabric)}</strong></div>
          <div class="stat"><span>Annual savings</span><strong>${money.format(result.annualSavings)}</strong></div>
          <div class="stat"><span>3-year savings</span><strong>${money.format(result.annualSavings * 3)}</strong></div>
        </div>
      </article>
      <article class="detail-card">
        <h3>GPU sizing</h3>
        <div class="stat-list">
          <div class="stat"><span>Configured GPUs</span><strong>${result.input.gpus}</strong></div>
          <div class="stat"><span>Expand-only GPUs</span><strong>${result.rightSizedNoFabric}</strong></div>
          <div class="stat"><span>Fabric-assisted GPUs</span><strong>${result.rightSizedFabric}</strong></div>
          <div class="stat"><span>GPU delta</span><strong>${Math.max(0, result.rightSizedNoFabric - result.rightSizedFabric)}</strong></div>
          <div class="stat"><span>Overflow KV at final turn</span><strong>${formatStorage(result.final.overflowGb / 1000)}</strong></div>
        </div>
      </article>
    </div>`;
}

function pipelineTab(result) {
  const coldStartNo = result.coldNoFabric + result.warmTtft;
  const coldStartFabric = result.coldFabric + result.warmTtft;
  return `
    <article class="detail-card">
      <h2>Inference pipeline</h2>
      <div class="pipeline-flow">
        <div class="pipeline-stage"><strong>Query</strong><span>User input, upload, request logging.</span></div>
        <div class="pipeline-stage"><strong>Retrieve</strong><span>Embed, search, fetch chunks, assemble prompt.</span></div>
        <div class="pipeline-stage"><strong>Prefill</strong><span>Load weights, ingest prompt, build KV.</span></div>
        <div class="pipeline-stage"><strong>Decode</strong><span>Generate output tokens and page KV.</span></div>
        <div class="pipeline-stage"><strong>Persist</strong><span>Store context, outputs, logs, and audit events.</span></div>
      </div>
    </article>
    <article class="detail-card">
      <h3>Latency and throughput model</h3>
      <table>
        <thead><tr><th>Metric</th><th>Step</th><th>Expand-only</th><th>Fabric-assisted</th></tr></thead>
        <tbody>
          <tr><td>Warm TTFT</td><td>Prefill</td><td>${result.warmTtft.toFixed(2)} s</td><td>${result.warmTtft.toFixed(2)} s</td></tr>
          <tr><td>Upload latency</td><td>Query</td><td>${result.uploadNoFabric.toFixed(2)} ms</td><td>${result.uploadFabric.toFixed(2)} ms</td></tr>
          <tr><td>RAG retrieval</td><td>Retrieve</td><td>${result.retrieval.toFixed(1)} ms</td><td>${result.retrieval.toFixed(1)} ms</td></tr>
          <tr><td>Cold-start TTFT</td><td>Prefill</td><td>${coldStartNo.toFixed(1)} s</td><td>${coldStartFabric.toFixed(1)} s</td></tr>
          <tr><td>Time between tokens</td><td>Decode</td><td>${result.tbtNoFabric.toFixed(2)} ms</td><td>${result.tbtFabric.toFixed(2)} ms</td></tr>
          <tr><td>KV cache hit rate</td><td>Decode</td><td>${(result.work.hitNoFabric * 100).toFixed(0)}%</td><td>${(result.work.hitFabric * 100).toFixed(0)}%</td></tr>
          <tr><td>Retriever embedding</td><td>Retrieve</td><td>${fmt.format(Math.round(result.input.hw.retrieverEmbedPerSec || 0))} inputs/s/GPU</td><td>${fmt.format(Math.round((result.input.hw.retrieverEmbedPerSec || 0) * 1.12))} inputs/s/GPU</td></tr>
          <tr><td>Document extraction</td><td>Ingest</td><td>${(result.input.hw.retrieverExtractPagesPerSec || 0).toFixed(1)} pages/s/GPU</td><td>${((result.input.hw.retrieverExtractPagesPerSec || 0) * 1.1).toFixed(1)} pages/s/GPU</td></tr>
        </tbody>
      </table>
    </article>`;
}

function tokenomicsTab(result) {
  const tokensHour = result.tokensPerYear / 8760;
  return `
    <div class="detail-grid">
      <article class="detail-card">
        <h2>Tokens generated</h2>
        <div class="stat-list">
          <div class="stat"><span>Tokens per day</span><strong>${compactNumber(result.input.tokensPerDay)}</strong></div>
          <div class="stat"><span>Tokens per year</span><strong>${compactNumber(result.tokensPerYear)}</strong></div>
          <div class="stat"><span>Tokens over 3 years</span><strong>${compactNumber(result.tokensPerYear * 3)}</strong></div>
          <div class="stat"><span>Lost to rebuilds, expand-only</span><strong>${compactNumber(result.recomputeLostTokens, "/yr")}</strong></div>
          <div class="stat"><span>Lost to rebuilds, fabric-assisted</span><strong>${compactNumber(result.fabricLostTokens, "/yr")}</strong></div>
        </div>
      </article>
      <article class="detail-card">
        <h3>Cost per million tokens</h3>
        <div class="formula-box">
          <div class="formula"><span>CPM</span><b>=</b><span>Hourly cost</span><b>/</b><span>Tokens per hour</span><b>x</b><span>1,000,000</span></div>
          <p>${compactNumber(tokensHour, "/hr")} baseline token demand. GPU rate: ${money2.format(result.input.gpuRate)} per GPU-hour.</p>
        </div>
        <div class="stat-list">
          <div class="stat"><span>Expand-only CPM</span><strong>${money2.format(result.cpmNoFabric)}</strong></div>
          <div class="stat"><span>Fabric-assisted CPM</span><strong>${money2.format(result.cpmFabric)}</strong></div>
          <div class="stat"><span>Delta per 1M tokens</span><strong>${money2.format(result.cpmNoFabric - result.cpmFabric)}</strong></div>
        </div>
      </article>
    </div>`;
}

function renderTab() {
  if (!state.hasRun || !state.result) return;
  const result = state.result;
  const panels = {
    memory: memoryTab,
    storage: storageTab,
    business: businessTab,
    pipeline: pipelineTab,
    tokenomics: tokenomicsTab
  };
  el("tabPanel").innerHTML = panels[state.activeTab](result);
}

function runSimulation() {
  state.result = simulate();
  state.hasRun = true;
  updateMetrics(state.result);
  renderTab();
}

function resetInputs() {
  el("model").value = "qwen2-72b";
  el("gpus").value = 8;
  el("users").value = 2000;
  el("turns").value = 20;
  el("sessions").value = 1.8;
  el("batchSize").value = 64;
  el("systemPrompt").value = 2000;
  el("userInput").value = 1000;
  el("ragContext").value = 4000;
  el("maxOutput").value = 1500;
  el("gpuRate").value = 2.8;
  el("tenants").value = 1;
  el("corpusTb").value = 500;
  el("growthRate").value = 4;
  el("logRetention").value = 52;
  el("userRetention").value = 521;
  state.workload = "rag";
  state.precision = "fp16";
  state.hardware = "dgx-h100";
  bindSegmentState();
  updateSummaries();
  runSimulation();
}

function bindSegmentState() {
  document.querySelectorAll("#workloadChoices button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.value === state.workload);
  });
  document.querySelectorAll("#precisionChoices button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.value === state.precision);
  });
  document.querySelectorAll("#hardwareChoices button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.value === state.hardware);
  });
  el("customHardware").classList.toggle("is-visible", state.hardware === "custom");
}

function init() {
  document.querySelectorAll("input, select").forEach((input) => {
    input.addEventListener("input", () => {
      updateSummaries();
      if (state.hasRun) runSimulation();
    });
  });

  document.querySelectorAll("#workloadChoices button").forEach((button) => {
    button.addEventListener("click", () => {
      state.workload = button.dataset.value;
      bindSegmentState();
      updateSummaries();
      if (state.hasRun) runSimulation();
    });
  });

  document.querySelectorAll("#precisionChoices button").forEach((button) => {
    button.addEventListener("click", () => {
      state.precision = button.dataset.value;
      bindSegmentState();
      updateSummaries();
      if (state.hasRun) runSimulation();
    });
  });

  document.querySelectorAll("#hardwareChoices button").forEach((button) => {
    button.addEventListener("click", () => {
      state.hardware = button.dataset.value;
      if (hardware[state.hardware]?.defaultGpus) {
        el("gpus").value = hardware[state.hardware].defaultGpus;
      }
      bindSegmentState();
      updateSummaries();
      if (state.hasRun) runSimulation();
    });
  });

  document.querySelectorAll("[data-accordion]").forEach((button) => {
    button.addEventListener("click", () => {
      button.closest(".panel-section").classList.toggle("is-collapsed");
    });
  });

  document.querySelectorAll(".tabs button").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTab = button.dataset.tab;
      document.querySelectorAll(".tabs button").forEach((tab) => tab.classList.toggle("is-active", tab === button));
      renderTab();
    });
  });

  el("runButton").addEventListener("click", runSimulation);
  el("resetButton").addEventListener("click", resetInputs);
  bindSegmentState();
  updateSummaries();
}

init();
