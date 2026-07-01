const state = {
  protocol: "s3",
  term: 3,
  deployment: "appliance",
  activeTab: "options",
  hasRun: false,
  result: null,
  selectedIndex: 0,
  assumptions: {
    efficiencyMin: 0.75,
    efficiencyMax: 0.84,
    reservation: 0.04,
    minNodes: 4,
    driveSlots: 12,
    spares: 6,
    wattsPerNode: 382,
    wattsPerDrive: 25
  }
};

const densityProfiles = [
  { key: "low", label: "Low Density", driveTb: 30.72 },
  { key: "medium", label: "Medium Density", driveTb: 61.44 },
  { key: "high", label: "High Density", driveTb: 122.88 }
];

const softwarePlatforms = [
  { vendor: "Validated 12-slot NVMe Server", slots: 12, nodeWatts: 682, rackU: 1, perfFactor: 1 },
  { vendor: "Validated 16-slot NVMe Server", slots: 16, nodeWatts: 782, rackU: 1, perfFactor: 0.9 },
  { vendor: "Compact 10-slot NVMe Server", slots: 10, nodeWatts: 632, rackU: 1, perfFactor: 0.82 }
];

const performanceModel = {
  s3: {
    small: { label: "Small · 4K", read: 0.24, write: 0.07, readIops: 59495, writeIops: 16071 },
    medium: { label: "Medium · 8M", read: 14.86, write: 10.25, readIops: 1770, writeIops: 1220 },
    large: { label: "Large · 128M", read: 15.18, write: 10.34, readIops: 111, writeIops: 76 }
  },
  posix: {
    small: { label: "Small · 4K", read: 0.55, write: 0.18, readIops: 141732, writeIops: 46962 },
    medium: { label: "Medium · 8M", read: 23.4, write: 12.64, readIops: 5845, writeIops: 3155 },
    large: { label: "Large · 128M", read: 24.2, write: 13.1, readIops: 190, writeIops: 104 }
  }
};

const el = (id) => document.getElementById(id);
const fmt = new Intl.NumberFormat("en-US");
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function value(id) {
  return Number(el(id).value || 0);
}

function pb(valuePb) {
  if (valuePb >= 1000) return `${(valuePb / 1000).toFixed(2)} EB`;
  if (valuePb >= 10) return `${valuePb.toFixed(1)} PB`;
  return `${valuePb.toFixed(2)} PB`;
}

function inputState() {
  const objectSize = el("objectSize").value;
  return {
    capacityPb: value("capacityPb"),
    readGbps: value("readGbps"),
    writeGbps: value("writeGbps"),
    protocol: state.protocol,
    term: state.term,
    deployment: state.deployment,
    objectSize,
    perf: performanceModel[state.protocol][objectSize]
  };
}

function usableFor(nodes, driveTb, slots) {
  const drives = nodes * slots;
  const netDriveUnits = Math.max(0, drives - state.assumptions.spares) * (1 - state.assumptions.reservation);
  const rawPb = drives * driveTb / 1000;
  const usableMin = netDriveUnits * driveTb / 1000 * state.assumptions.efficiencyMin;
  const usableMax = netDriveUnits * driveTb / 1000 * state.assumptions.efficiencyMax;
  return { drives, rawPb, usableMin, usableMax };
}

function solveProfile(input, profile, platform) {
  const slots = platform?.slots || state.assumptions.driveSlots;
  const perfFactor = platform?.perfFactor || 1;
  const readPerNode = input.perf.read * perfFactor;
  const writePerNode = input.perf.write * perfFactor;
  let capacityNodes = 0;
  if (input.capacityPb > 0) {
    for (let nodes = state.assumptions.minNodes; nodes <= 512; nodes += 1) {
      if (usableFor(nodes, profile.driveTb, slots).usableMin >= input.capacityPb) {
        capacityNodes = nodes;
        break;
      }
    }
  }
  const readNodes = input.readGbps > 0 ? Math.ceil(input.readGbps / readPerNode) : 0;
  const writeNodes = input.writeGbps > 0 ? Math.ceil(input.writeGbps / writePerNode) : 0;
  const perfNodes = Math.max(readNodes, writeNodes);
  const faultNodes = Math.max(state.assumptions.minNodes, Math.ceil(slots * 0.58));
  const nodes = Math.max(state.assumptions.minNodes, capacityNodes, perfNodes, faultNodes);
  const usable = usableFor(nodes, profile.driveTb, slots);
  const rackU = nodes * (platform?.rackU || 1);
  const powerW = nodes * (platform?.nodeWatts || state.assumptions.wattsPerNode) + usable.drives * state.assumptions.wattsPerDrive;
  const read = nodes * readPerNode;
  const write = nodes * writePerNode;
  const binding = [
    ["capacity", capacityNodes],
    ["read", readNodes],
    ["write", writeNodes],
    ["fault domain", faultNodes]
  ].sort((a, b) => b[1] - a[1])[0][0];
  const capacityLicenseUnits = Math.ceil(usable.rawPb * 1000 / 100);
  const nodeList = state.deployment === "software" ? 72000 : 101600;
  const driveList = profile.driveTb >= 122 ? 95000 : profile.driveTb >= 61 ? 52000 : 28000;
  const softwarePer100TbYear = 6800;
  const networkList = Math.ceil(nodes / 32) * 240000;
  const supportList = Math.round((nodes * nodeList + usable.drives * driveList) * 0.12 * input.term);
  const advisoryTotal = nodes * nodeList + usable.drives * driveList + networkList + supportList + capacityLicenseUnits * softwarePer100TbYear * input.term;

  return {
    key: `${profile.key}-${platform?.vendor || "integrated"}`,
    label: platform?.vendor || profile.label,
    density: profile.label,
    driveTb: profile.driveTb,
    nodes,
    drives: usable.drives,
    rawPb: usable.rawPb,
    usableMin: usable.usableMin,
    usableMax: usable.usableMax,
    read,
    write,
    rackU,
    powerW,
    heatBtu: powerW * 3.412,
    ports: nodes * 4,
    switches: Math.ceil(nodes * 4 / 64),
    cables: nodes * 4,
    binding,
    readNodes,
    writeNodes,
    capacityNodes,
    faultNodes,
    capacityLicenseUnits,
    advisoryTotal
  };
}

function simulate() {
  const input = inputState();
  const options = [];
  if (input.deployment === "software") {
    softwarePlatforms.forEach((platform) => {
      densityProfiles.forEach((profile) => options.push(solveProfile(input, profile, platform)));
    });
  } else {
    densityProfiles.forEach((profile) => options.push(solveProfile(input, profile)));
  }
  options.sort((a, b) => {
    const aPass = a.usableMin >= input.capacityPb && a.read >= input.readGbps && a.write >= input.writeGbps;
    const bPass = b.usableMin >= input.capacityPb && b.read >= input.readGbps && b.write >= input.writeGbps;
    if (aPass !== bPass) return aPass ? -1 : 1;
    if (a.nodes !== b.nodes) return a.nodes - b.nodes;
    const aHeadroom = Math.max(0, a.usableMin - input.capacityPb);
    const bHeadroom = Math.max(0, b.usableMin - input.capacityPb);
    if (Math.abs(aHeadroom - bHeadroom) > 0.01) return aHeadroom - bHeadroom;
    return a.rawPb - b.rawPb;
  });
  state.selectedIndex = 0;
  return { input, options, selected: options[0] };
}

function summaryText() {
  const input = inputState();
  const needs = [];
  if (input.capacityPb > 0) needs.push(`${pb(input.capacityPb)} usable`);
  if (input.readGbps > 0) needs.push(`${fmt.format(input.readGbps)} GB/s read`);
  if (input.writeGbps > 0) needs.push(`${fmt.format(input.writeGbps)} GB/s write`);
  needs.push(`${input.term}-year term`);
  return needs.join(" · ");
}

function updateInputs() {
  const input = inputState();
  el("requirementSummary").textContent = summaryText();
  el("perfLabel").textContent = performanceModel[input.protocol][input.objectSize].label;
}

function updateSegmentState() {
  document.querySelectorAll("#protocolChoices button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.value === state.protocol);
  });
  document.querySelectorAll("#termChoices button").forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.value) === state.term);
  });
  document.querySelectorAll("#deploymentChoices button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.value === state.deployment);
  });
}

function updateMetrics() {
  const result = state.result;
  const selected = result.selected;
  el("metricOption").textContent = `${selected.density}`;
  el("metricDriver").textContent = `${selected.nodes} nodes · driven by ${selected.binding}`;
  el("metricCapacity").textContent = `${pb(selected.usableMin)} - ${pb(selected.usableMax)}`;
  el("metricPerf").textContent = `${selected.read.toFixed(1)} / ${selected.write.toFixed(1)}`;
  el("metricFacilities").textContent = `${selected.rackU}U · ${fmt.format(selected.powerW)} W`;
  el("resultSubtitle").textContent = `${summaryText()} · ${result.input.protocol.toUpperCase()} · ${result.input.perf.label}`;
  el("statusPill").textContent = selected.binding === "capacity" ? "Capacity-led" : "Performance-led";
  el("statusPill").className = `status-pill ${selected.binding === "capacity" ? "is-good" : "is-warning"}`;
}

function optionsTab(result) {
  return `
    <div class="option-grid">
      ${result.options.map((option, index) => `
        <article class="option-card ${index === state.selectedIndex ? "is-selected" : ""}" data-option-index="${index}">
          <div class="option-title">
            <strong>${option.density}</strong>
            <span>${option.label} · ${option.driveTb} TB drives · driven by ${option.binding}</span>
          </div>
          <div class="metric-cell"><span>Nodes</span><strong>${option.nodes}</strong></div>
          <div class="metric-cell"><span>Drives</span><strong>${option.drives}</strong></div>
          <div class="metric-cell"><span>Usable</span><strong>${pb(option.usableMin)} - ${pb(option.usableMax)}</strong></div>
          <div class="metric-cell"><span>Read</span><strong>${option.read.toFixed(1)}</strong></div>
          <div class="metric-cell"><span>Write</span><strong>${option.write.toFixed(1)}</strong></div>
          <div class="metric-cell"><span>Rack</span><strong>${option.rackU}U</strong></div>
          <div class="metric-cell"><span>Power</span><strong>${fmt.format(option.powerW)} W</strong></div>
        </article>
      `).join("")}
    </div>`;
}

function techTab(result) {
  const s = result.selected;
  return `
    <div class="detail-grid">
      <article class="detail-card">
        <h3>Technical details</h3>
        <p>${s.nodes}-node ${s.label} configuration sized for ${s.binding}; estimated ${pb(s.usableMin)} guaranteed usable with proportional scale-out performance and automatic recovery reserves.</p>
        <div class="stat-list">
          <div class="stat"><span>Installed raw</span><strong>${pb(s.rawPb)}</strong></div>
          <div class="stat"><span>Effective capacity</span><strong>${pb(s.usableMin)} - ${pb(s.usableMax)}</strong></div>
          <div class="stat"><span>Read performance</span><strong>${s.read.toFixed(1)} GB/s</strong></div>
          <div class="stat"><span>Write performance</span><strong>${s.write.toFixed(1)} GB/s</strong></div>
          <div class="stat"><span>Ports</span><strong>${s.ports} data ports</strong></div>
          <div class="stat"><span>Switches</span><strong>${s.switches}</strong></div>
        </div>
      </article>
      <article class="detail-card">
        <h4>Physical configuration</h4>
        <div class="stat-list">
          <div class="stat"><span>Nodes</span><strong>${s.nodes}</strong></div>
          <div class="stat"><span>Drive size</span><strong>${s.driveTb} TB</strong></div>
          <div class="stat"><span>Total drives</span><strong>${s.drives}</strong></div>
          <div class="stat"><span>Rack units</span><strong>${s.rackU}U</strong></div>
          <div class="stat"><span>Power draw</span><strong>${fmt.format(s.powerW)} W</strong></div>
          <div class="stat"><span>Heat</span><strong>${fmt.format(Math.round(s.heatBtu))} BTU/hr</strong></div>
        </div>
      </article>
    </div>`;
}

function bomRows(result) {
  const s = result.selected;
  const nodeSku = state.deployment === "software" ? "GEN-SW-NODE" : "GEN-STOR-NODE";
  const driveSku = `NVME-${String(Math.round(s.driveTb * 100)).padStart(5, "0")}`;
  return [
    ["SERVERS", nodeSku, `${state.deployment === "software" ? "Validated storage server" : "Integrated NVMe storage node"} with 4 high-speed data ports`, s.nodes],
    ["DRIVES", driveSku, `${s.driveTb} TB NVMe SSD drive module`, s.drives],
    ["SOFTWARE", "CAP-LIC-100TB", "Licensed usable/raw capacity per 100 TB band", s.capacityLicenseUnits],
    ["NETWORKING", "FABRIC-SW-64", "64-port high-speed Ethernet fabric switch", s.switches],
    ["NETWORKING", "FABRIC-CBL-3M", "Active optical cable, 3m", s.cables],
    ["SERVICES", `SUPPORT-${result.input.term}YR`, `${result.input.term}-year support and subscription term`, 1]
  ];
}

function bomTab(result) {
  return `
    <article class="detail-card">
      <h3>Bill of materials</h3>
      <p>Generic SKUs and quantities for planning. Final part numbers, pricing, discounts, taxes, services, and commercial terms should be confirmed in the quoting system.</p>
      <table>
        <thead><tr><th>Category</th><th>SKU</th><th>Description</th><th>Qty</th></tr></thead>
        <tbody>${bomRows(result).map((row) => `<tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td></tr>`).join("")}</tbody>
      </table>
    </article>`;
}

function reportTab(result) {
  const s = result.selected;
  return `
    <div class="detail-grid">
      <article class="detail-card">
        <h3>Executive report</h3>
        <div class="report-box">
          <p><strong>${s.density} · ${s.nodes} nodes</strong></p>
          <p>This estimate meets ${summaryText()} using ${s.drives} NVMe drives across ${s.nodes} nodes. The design delivers ${pb(s.usableMin)} guaranteed usable capacity, ${s.read.toFixed(1)} GB/s read, and ${s.write.toFixed(1)} GB/s write in approximately ${s.rackU} rack units.</p>
          <p>Primary sizing driver: ${s.binding}. Advisory list estimate: ${money.format(s.advisoryTotal)} before discounts and implementation services.</p>
        </div>
      </article>
      <article class="detail-card">
        <h4>Customer-ready talking points</h4>
        <div class="stat-list">
          <div class="stat"><span>Capacity headroom</span><strong>${((s.usableMin / Math.max(0.01, result.input.capacityPb) - 1) * 100).toFixed(0)}%</strong></div>
          <div class="stat"><span>Read headroom</span><strong>${result.input.readGbps ? ((s.read / result.input.readGbps - 1) * 100).toFixed(0) : "n/a"}%</strong></div>
          <div class="stat"><span>Write headroom</span><strong>${result.input.writeGbps ? ((s.write / result.input.writeGbps - 1) * 100).toFixed(0) : "n/a"}%</strong></div>
        </div>
      </article>
    </div>`;
}

function exportPayload(result) {
  const s = result.selected;
  return {
    schemaVersion: "generic-storage-estimator-v1",
    generatedDate: new Date().toISOString(),
    customerRequirements: {
      usableCapacityRequestedPB: result.input.capacityPb,
      minReadGBs: result.input.readGbps,
      minWriteGBs: result.input.writeGbps,
      protocol: result.input.protocol,
      objectSize: result.input.perf.label,
      subscriptionTermYears: result.input.term
    },
    derivedConfiguration: {
      deploymentModel: result.input.deployment,
      density: s.density,
      nodeCount: s.nodes,
      driveCapacityTB: s.driveTb,
      totalDrives: s.drives,
      rawCapacityPB: Number(s.rawPb.toFixed(3)),
      usableCapacityPB: { min: Number(s.usableMin.toFixed(3)), max: Number(s.usableMax.toFixed(3)) },
      sizingDriver: s.binding,
      rackUnits: s.rackU,
      powerNominalW: Math.round(s.powerW),
      portsTotal: s.ports,
      switchCount: s.switches
    },
    lineItems: bomRows(result).map((row) => ({ category: row[0], sku: row[1], description: row[2], quantity: row[3] })),
    assumptions: state.assumptions
  };
}

function exportTab(result) {
  return `
    <article class="detail-card">
      <h3>Export payload</h3>
      <p>Neutral JSON payload for handoff into a quoting, CRM, or design-review workflow.</p>
      <pre class="json-box">${JSON.stringify(exportPayload(result), null, 2)}</pre>
    </article>`;
}

function docsTab() {
  return `
    <article class="detail-card">
      <h3>Estimator notes</h3>
      <div class="doc-list">
        <p><strong>Capacity:</strong> effective capacity uses erasure-coding efficiency, catalog reservation, and reserved spare drive assumptions.</p>
        <p><strong>Performance:</strong> read/write throughput scales by node count from protocol and object-size anchors.</p>
        <p><strong>Facilities:</strong> rack units, ports, switches, power, and heat are advisory planning numbers.</p>
        <p><strong>Commercials:</strong> advisory totals are planning estimates only; final quote authority belongs in the quoting system.</p>
      </div>
    </article>`;
}

function traceTab(result) {
  const s = result.selected;
  const steps = [
    ["Inputs", `${summaryText()} · ${result.input.protocol.toUpperCase()} · ${result.input.perf.label}`],
    ["Capacity floor", `capacity_nodes = ${s.capacityNodes}`],
    ["Performance floor", `read_nodes = ${s.readNodes}; write_nodes = ${s.writeNodes}`],
    ["Fault-domain floor", `fault_nodes = ${s.faultNodes}`],
    ["Decision", `node_count = max(${s.capacityNodes}, ${s.readNodes}, ${s.writeNodes}, ${s.faultNodes}) = ${s.nodes}`],
    ["Verification", `${pb(s.usableMin)} >= requested ${pb(result.input.capacityPb)}; ${s.read.toFixed(1)} / ${s.write.toFixed(1)} GB/s delivered`],
    ["Deployment", `${bomRows(result).length} generic line items generated`]
  ];
  return `
    <article class="detail-card">
      <h3>Engine trace</h3>
      <div class="trace-list">
        ${steps.map((step, index) => `<div class="trace-step"><strong>${index + 1}. ${step[0]}</strong><span>${step[1]}</span></div>`).join("")}
      </div>
    </article>`;
}

function settingsTab() {
  return `
    <article class="detail-card">
      <h3>Assumptions</h3>
      <div class="settings-box">
        <div class="stat-list">
          <div class="stat"><span>Efficiency min</span><strong>${state.assumptions.efficiencyMin}</strong></div>
          <div class="stat"><span>Efficiency max</span><strong>${state.assumptions.efficiencyMax}</strong></div>
          <div class="stat"><span>Catalog reservation</span><strong>${(state.assumptions.reservation * 100).toFixed(0)}%</strong></div>
          <div class="stat"><span>Reserved spares</span><strong>${state.assumptions.spares} drives</strong></div>
          <div class="stat"><span>Minimum nodes</span><strong>${state.assumptions.minNodes}</strong></div>
          <div class="stat"><span>Per-node baseline</span><strong>${state.assumptions.wattsPerNode} W + drives</strong></div>
        </div>
      </div>
    </article>`;
}

function renderTab() {
  if (!state.hasRun || !state.result) return;
  const panels = {
    options: optionsTab,
    tech: techTab,
    bom: bomTab,
    report: reportTab,
    export: exportTab,
    docs: docsTab,
    trace: traceTab,
    settings: settingsTab
  };
  el("tabPanel").innerHTML = panels[state.activeTab](state.result);
  document.querySelectorAll("[data-option-index]").forEach((card) => {
    card.addEventListener("click", () => {
      state.selectedIndex = Number(card.dataset.optionIndex);
      state.result.selected = state.result.options[state.selectedIndex];
      updateMetrics();
      renderTab();
    });
  });
}

function findSolutions() {
  state.result = simulate();
  state.hasRun = true;
  updateMetrics();
  renderTab();
}

function resetInputs() {
  el("capacityPb").value = 3;
  el("readGbps").value = 80;
  el("writeGbps").value = 40;
  el("objectSize").value = "medium";
  state.protocol = "s3";
  state.term = 3;
  state.deployment = "appliance";
  state.activeTab = "options";
  document.querySelectorAll(".tabs button").forEach((button) => button.classList.toggle("is-active", button.dataset.tab === "options"));
  updateSegmentState();
  updateInputs();
  findSolutions();
}

function bind() {
  document.querySelectorAll("input, select").forEach((input) => {
    input.addEventListener("input", () => {
      updateInputs();
      if (state.hasRun) findSolutions();
    });
  });

  document.querySelectorAll("#protocolChoices button").forEach((button) => {
    button.addEventListener("click", () => {
      state.protocol = button.dataset.value;
      updateSegmentState();
      updateInputs();
      if (state.hasRun) findSolutions();
    });
  });

  document.querySelectorAll("#termChoices button").forEach((button) => {
    button.addEventListener("click", () => {
      state.term = Number(button.dataset.value);
      updateSegmentState();
      updateInputs();
      if (state.hasRun) findSolutions();
    });
  });

  document.querySelectorAll("#deploymentChoices button").forEach((button) => {
    button.addEventListener("click", () => {
      state.deployment = button.dataset.value;
      updateSegmentState();
      updateInputs();
      if (state.hasRun) findSolutions();
    });
  });

  document.querySelectorAll(".tabs button").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTab = button.dataset.tab;
      document.querySelectorAll(".tabs button").forEach((tab) => tab.classList.toggle("is-active", tab === button));
      renderTab();
    });
  });

  el("perfToggle").addEventListener("click", () => {
    el("performancePanel").classList.toggle("is-open");
  });
  el("findButton").addEventListener("click", findSolutions);
  el("resetButton").addEventListener("click", resetInputs);
}

bind();
updateSegmentState();
updateInputs();
