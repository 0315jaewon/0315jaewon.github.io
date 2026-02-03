const canvas = document.getElementById("canvas");

const diameter = 60;
const radius = diameter / 2;
const canvasWidth = 600;
const canvasHeight = 500;
const maxNodes = 64;
const defaultEdgeWeight = 1;
const edgeClickTolerance = 14;

let c; // p5 canvas
let currentMode = "select";
let directed = false;

let nodes = [];
let edges = [];
let nodeIdCounter = 1;
let edgeIdCounter = 1;

let selectedNodeId = null;
let selectedEdgeId = null;
let pendingEdgeStartId = null;

let steps = [];
let stepIndex = 0;
let playTimer = null;
let visitedNodes = new Set();
let pathEdges = new Set();
let activeNodeId = null;
let activeEdgeId = null;
let algorithmPrepared = false;

const ui = {
    modeSelect: document.getElementById("modeSelect"),
    modeNode: document.getElementById("modeNode"),
    modeEdge: document.getElementById("modeEdge"),
    directedToggle: document.getElementById("directedToggle"),
    nodeLabel: document.getElementById("nodeLabel"),
    edgeWeight: document.getElementById("edgeWeight"),
    applyEdgeWeight: document.getElementById("applyEdgeWeight"),
    selectionSection: document.getElementById("selectionSection"),
    algoSelect: document.getElementById("algoSelect"),
    startNode: document.getElementById("startNode"),
    goalNode: document.getElementById("goalNode"),
    runAlgo: document.getElementById("runAlgo"),
    stepAlgo: document.getElementById("stepAlgo"),
    playAlgo: document.getElementById("playAlgo"),
    pauseAlgo: document.getElementById("pauseAlgo"),
    resetAlgo: document.getElementById("resetAlgo"),
    playSpeed: document.getElementById("playSpeed"),
    randNodes: document.getElementById("randNodes"),
    randDensity: document.getElementById("randDensity"),
    randomGraph: document.getElementById("randomGraph"),
    clearGraph: document.getElementById("clearGraph"),
    visitedList: document.getElementById("visitedList"),
    status: document.getElementById("status"),
};

class Node {
    constructor(x, y, label) {
        this.id = nodeIdCounter++;
        this.x = x;
        this.y = y;
        this.label = label;
    }
}

class Edge {
    constructor(from, to, weight) {
        this.id = edgeIdCounter++;
        this.from = from;
        this.to = to;
        this.weight = weight;
    }
}

function setup() {
    c = createCanvas(canvasWidth, canvasHeight);
    c.parent("canvas");
    noLoop();
    redrawScene();
}

function draw() {}

function setStatus(message) {
    ui.status.textContent = message;
}

function setMode(mode) {
    currentMode = mode;
    ui.modeSelect.classList.toggle("active", mode === "select");
    ui.modeNode.classList.toggle("active", mode === "addNode");
    ui.modeEdge.classList.toggle("active", mode === "addEdge");
    pendingEdgeStartId = null;
    if (mode !== "select") {
        clearSelection({ silent: true });
    }
    toggleSelectionPanel();
    if (mode === "addNode") {
        setStatus("Click on the canvas to add a node.");
    } else if (mode === "addEdge") {
        setStatus("Select a start node, then an end node.");
    } else {
        setStatus("Select a node or edge to edit.");
    }
}

function resetAlgorithmState() {
    steps = [];
    stepIndex = 0;
    visitedNodes = new Set();
    pathEdges = new Set();
    activeNodeId = null;
    activeEdgeId = null;
    algorithmPrepared = false;
    stopPlayback();
    updateVisitedList();
    redrawScene();
}

function stopPlayback() {
    if (playTimer) {
        clearInterval(playTimer);
        playTimer = null;
    }
}

function mousePressed() {
    if (mouseX < 0 || mouseX > canvasWidth || mouseY < 0 || mouseY > canvasHeight) return;

    if (currentMode === "addNode") {
        addNode(mouseX, mouseY);
        return;
    }

    if (currentMode === "addEdge") {
        handleEdgeCreation(mouseX, mouseY);
        return;
    }

    handleSelection(mouseX, mouseY);
}

function addNode(x, y) {
    if (nodes.length >= maxNodes) {
        setStatus("Node limit reached.");
        return;
    }
    const label = nextNodeLabel();
    const node = new Node(x, y, label);
    nodes.push(node);
    resolveOverlap();
    updateNodeSelectors();
    setStatus(`Node ${label} added.`);
    redrawScene();
}

function handleEdgeCreation(x, y) {
    const node = findNodeAt(x, y);
    if (!node) {
        setStatus("Pick a node to start or end an edge.");
        return;
    }
    if (!pendingEdgeStartId) {
        pendingEdgeStartId = node.id;
        setStatus(`Start node ${node.label} selected. Choose an end node.`);
        return;
    }
    if (pendingEdgeStartId === node.id) {
        setStatus("Choose a different end node.");
        return;
    }
    if (edgeExists(pendingEdgeStartId, node.id)) {
        setStatus("Edge already exists.");
        pendingEdgeStartId = null;
        return;
    }
    const edge = new Edge(pendingEdgeStartId, node.id, defaultEdgeWeight);
    edges.push(edge);
    pendingEdgeStartId = null;
    setStatus("Edge added.");
    redrawScene();
}

function handleSelection(x, y) {
    const node = findNodeAt(x, y);
    if (node) {
        selectNode(node.id);
        return;
    }
    const edge = findEdgeAt(x, y);
    if (edge) {
        selectEdge(edge.id);
        return;
    }
    clearSelection();
}

function selectNode(nodeId) {
    selectedNodeId = nodeId;
    selectedEdgeId = null;
    const node = getNode(nodeId);
    ui.nodeLabel.disabled = false;
    ui.nodeLabel.value = node.label;
    ui.edgeWeight.disabled = true;
    ui.applyEdgeWeight.disabled = true;
    setStatus(`Selected node ${node.label}.`);
    toggleSelectionPanel();
    redrawScene();
}

function selectEdge(edgeId) {
    selectedEdgeId = edgeId;
    selectedNodeId = null;
    const edge = getEdge(edgeId);
    ui.edgeWeight.disabled = false;
    ui.edgeWeight.value = edge.weight;
    ui.applyEdgeWeight.disabled = false;
    ui.nodeLabel.disabled = true;
    setStatus("Selected edge. Update weight to apply.");
    toggleSelectionPanel();
    redrawScene();
}

function clearSelection(options = {}) {
    const silent = options.silent === true;
    selectedNodeId = null;
    selectedEdgeId = null;
    ui.nodeLabel.disabled = true;
    ui.edgeWeight.disabled = true;
    ui.applyEdgeWeight.disabled = true;
    ui.nodeLabel.value = "";
    ui.edgeWeight.value = defaultEdgeWeight;
    toggleSelectionPanel();
    if (!silent) {
        setStatus("Selection cleared.");
    }
    redrawScene();
}

function toggleSelectionPanel() {
    const visible = currentMode === "select" && (selectedNodeId || selectedEdgeId);
    ui.selectionSection.style.display = visible ? "grid" : "none";
}

function updateNodeSelectors() {
    const currentStart = ui.startNode.value;
    const currentGoal = ui.goalNode.value;
    const options = nodes.map((node) => `<option value="${node.id}">${node.label}</option>`).join("");
    ui.startNode.innerHTML = options;
    ui.goalNode.innerHTML = `<option value="">None</option>${options}`;
    if (nodes.length > 0) {
        ui.startNode.value = currentStart && nodes.some((n) => String(n.id) === currentStart) ? currentStart : nodes[0].id;
        ui.goalNode.value = currentGoal && nodes.some((n) => String(n.id) === currentGoal) ? currentGoal : nodes[nodes.length - 1].id;
    }
}

function getNode(nodeId) {
    return nodes.find((node) => node.id === nodeId);
}

function getEdge(edgeId) {
    return edges.find((edge) => edge.id === edgeId);
}

function edgeExists(fromId, toId) {
    return edges.some((edge) => {
        if (directed) {
            return edge.from === fromId && edge.to === toId;
        }
        return (edge.from === fromId && edge.to === toId) || (edge.from === toId && edge.to === fromId);
    });
}

function findNodeAt(x, y) {
    for (const node of nodes) {
        if (distance(node.x, node.y, x, y) < radius) return node;
    }
    return null;
}

function findEdgeAt(x, y) {
    for (const edge of edges) {
        const from = getNode(edge.from);
        const to = getNode(edge.to);
        if (!from || !to) continue;
        if (edgeClickDetect(from, to, x, y)) return edge;
    }
    return null;
}

function edgeClickDetect(node1, node2, x, y) {
    const vec = unitVector(node1, node2);
    const dx = vec[0] * radius;
    const dy = vec[1] * radius;
    const x1 = node1.x - dx;
    const y1 = node1.y - dy;
    const x2 = node2.x + dx;
    const y2 = node2.y + dy;
    return pointToSegmentDistance(x, y, x1, y1, x2, y2) <= edgeClickTolerance;
}

function resolveOverlap() {
    if (nodes.length < 2) return;
    for (let iter = 0; iter < 3; iter++) {
        let moved = false;
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const nodeA = nodes[i];
                const nodeB = nodes[j];
                const d = distance(nodeA.x, nodeA.y, nodeB.x, nodeB.y);
                if (d > 0 && d < diameter) {
                    const vec = unitVector(nodeA, nodeB);
                    const overlap = diameter - d;
                    const dx = vec[0] * (overlap / 2);
                    const dy = vec[1] * (overlap / 2);
                    nodeA.x += dx;
                    nodeA.y += dy;
                    nodeB.x -= dx;
                    nodeB.y -= dy;
                    moved = true;
                }
            }
        }
        if (!moved) break;
        clampNodesToCanvas();
    }
}

function clampNodesToCanvas() {
    for (const node of nodes) {
        node.x = Math.max(radius, Math.min(canvasWidth - radius, node.x));
        node.y = Math.max(radius, Math.min(canvasHeight - radius, node.y));
    }
}

function redrawScene() {
    background(251, 249, 245);
    drawEdges();
    drawNodes();
}

function drawEdges() {
    for (const edge of edges) {
        const from = getNode(edge.from);
        const to = getNode(edge.to);
        if (!from || !to) continue;
        const isPath = pathEdges.has(edge.id);
        const isActive = edge.id === activeEdgeId || edge.id === selectedEdgeId;
        stroke(isPath ? 20 : isActive ? 40 : 90);
        strokeWeight(isPath ? 3 : 2);
        drawEdgeLine(from, to);
        drawEdgeWeight(from, to, edge.weight);
    }
}

function drawEdgeLine(from, to) {
    const vec = unitVector(from, to);
    const dx = vec[0] * radius;
    const dy = vec[1] * radius;
    const startX = from.x - dx;
    const startY = from.y - dy;
    const endX = to.x + dx;
    const endY = to.y + dy;
    line(startX, startY, endX, endY);
    if (directed) {
        drawArrowhead(startX, startY, endX, endY);
    }
}

function drawArrowhead(x1, y1, x2, y2) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const size = 10;
    const leftX = x2 - size * Math.cos(angle - Math.PI / 6);
    const leftY = y2 - size * Math.sin(angle - Math.PI / 6);
    const rightX = x2 - size * Math.cos(angle + Math.PI / 6);
    const rightY = y2 - size * Math.sin(angle + Math.PI / 6);
    fill(30);
    noStroke();
    triangle(x2, y2, leftX, leftY, rightX, rightY);
    noFill();
}

function drawEdgeWeight(from, to, weight) {
    const mid = midpoint(from.x, from.y, to.x, to.y);
    const padding = textPadding(from, to);
    const textX = mid[0] + padding[0];
    const textY = mid[1] + padding[1];
    noStroke();
    fill(40);
    textSize(12);
    text(weight.toString(), textX, textY);
    noFill();
}

function drawNodes() {
    textAlign(CENTER, CENTER);
    for (const node of nodes) {
        const isVisited = visitedNodes.has(node.id);
        const isActive = node.id === activeNodeId;
        const isStart = algorithmPrepared && node.id === Number(ui.startNode.value);
        const isGoal = algorithmPrepared && node.id === Number(ui.goalNode.value);
        const isSelected = node.id === selectedNodeId || node.id === pendingEdgeStartId;

        let fillColor = "#ffffff";
        if (isStart) fillColor = "#e6f4ff";
        if (isGoal) fillColor = "#fbe9e7";
        if (isVisited) fillColor = "#e8f5e9";
        if (isActive) fillColor = "#fff4d6";

        stroke(isSelected ? 20 : 90);
        strokeWeight(isSelected ? 2.5 : 1.25);
        fill(fillColor);
        circle(node.x, node.y, diameter);
        stroke(230);
        strokeWeight(1);
        circle(node.x, node.y, diameter - 10);

        fill(30);
        noStroke();
        textSize(13);
        text(node.label, node.x, node.y);
        noFill();
    }
}

function runAlgorithm() {
    if (nodes.length === 0) {
        setStatus("Add nodes before running an algorithm.");
        return;
    }
    const startId = Number(ui.startNode.value);
    if (!startId) {
        setStatus("Select a start node.");
        return;
    }
    const goalId = ui.goalNode.value ? Number(ui.goalNode.value) : null;

    const algo = ui.algoSelect.value;
    const result = runAlgorithmCore(algo, startId, goalId);
    if (!result) return;

    steps = result.order.map((nodeId) => ({
        nodeId,
        via: result.parents.get(nodeId) || null,
    }));
    stepIndex = 0;
    visitedNodes = new Set();
    pathEdges = new Set();
    activeNodeId = null;
    activeEdgeId = null;
    algorithmPrepared = true;

    if (goalId && result.parents.has(goalId)) {
        const path = buildPath(goalId, result.parents);
        for (let i = 0; i < path.length - 1; i++) {
            const edge = findEdgeBetween(path[i], path[i + 1]);
            if (edge) pathEdges.add(edge.id);
        }
    }

    setStatus(`${algo.toUpperCase()} prepared. Use Step or Play.`);
    updateVisitedList();
    redrawScene();
}

function runAlgorithmCore(algo, startId, goalId) {
    const adj = buildAdjList();
    if (!adj.has(startId)) {
        setStatus("Start node not found.");
        return null;
    }

    if (algo === "bfs") return bfs(adj, startId, goalId);
    if (algo === "dfs") return dfs(adj, startId, goalId);
    if (algo === "dijkstra") return dijkstra(adj, startId, goalId);
    if (algo === "astar") return astar(adj, startId, goalId);

    return null;
}

function buildAdjList() {
    const adj = new Map();
    nodes.forEach((node) => adj.set(node.id, []));
    edges.forEach((edge) => {
        if (!adj.has(edge.from) || !adj.has(edge.to)) return;
        adj.get(edge.from).push({ to: edge.to, weight: edge.weight });
        if (!directed) {
            adj.get(edge.to).push({ to: edge.from, weight: edge.weight });
        }
    });
    return adj;
}

function bfs(adj, startId, goalId) {
    const queue = [startId];
    const visited = new Set([startId]);
    const parents = new Map();
    const order = [];

    while (queue.length) {
        const nodeId = queue.shift();
        order.push(nodeId);
        if (goalId && nodeId === goalId) break;
        for (const neighbor of adj.get(nodeId)) {
            if (!visited.has(neighbor.to)) {
                visited.add(neighbor.to);
                parents.set(neighbor.to, nodeId);
                queue.push(neighbor.to);
            }
        }
    }

    return { order, parents };
}

function dfs(adj, startId, goalId) {
    const stack = [startId];
    const visited = new Set();
    const parents = new Map();
    const order = [];

    while (stack.length) {
        const nodeId = stack.pop();
        if (visited.has(nodeId)) continue;
        visited.add(nodeId);
        order.push(nodeId);
        if (goalId && nodeId === goalId) break;
        const neighbors = [...adj.get(nodeId)].reverse();
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor.to)) {
                parents.set(neighbor.to, nodeId);
                stack.push(neighbor.to);
            }
        }
    }

    return { order, parents };
}

function dijkstra(adj, startId, goalId) {
    const dist = new Map();
    const parents = new Map();
    const order = [];
    const unvisited = new Set(adj.keys());
    for (const nodeId of unvisited) dist.set(nodeId, Infinity);
    dist.set(startId, 0);

    while (unvisited.size) {
        let current = null;
        let currentDist = Infinity;
        for (const nodeId of unvisited) {
            const d = dist.get(nodeId);
            if (d < currentDist) {
                currentDist = d;
                current = nodeId;
            }
        }
        if (current === null || currentDist === Infinity) break;
        unvisited.delete(current);
        order.push(current);
        if (goalId && current === goalId) break;
        for (const neighbor of adj.get(current)) {
            const alt = dist.get(current) + neighbor.weight;
            if (alt < dist.get(neighbor.to)) {
                dist.set(neighbor.to, alt);
                parents.set(neighbor.to, current);
            }
        }
    }

    return { order, parents, dist };
}

function astar(adj, startId, goalId) {
    if (!goalId) {
        setStatus("A* needs a goal node.");
        return null;
    }
    const openSet = new Set([startId]);
    const parents = new Map();
    const gScore = new Map();
    const fScore = new Map();
    const order = [];

    for (const nodeId of adj.keys()) {
        gScore.set(nodeId, Infinity);
        fScore.set(nodeId, Infinity);
    }
    gScore.set(startId, 0);
    fScore.set(startId, heuristic(startId, goalId));

    while (openSet.size) {
        let current = null;
        let bestScore = Infinity;
        for (const nodeId of openSet) {
            const score = fScore.get(nodeId);
            if (score < bestScore) {
                bestScore = score;
                current = nodeId;
            }
        }

        if (current === null) break;
        order.push(current);
        if (current === goalId) break;

        openSet.delete(current);
        for (const neighbor of adj.get(current)) {
            const tentative = gScore.get(current) + neighbor.weight;
            if (tentative < gScore.get(neighbor.to)) {
                parents.set(neighbor.to, current);
                gScore.set(neighbor.to, tentative);
                fScore.set(neighbor.to, tentative + heuristic(neighbor.to, goalId));
                openSet.add(neighbor.to);
            }
        }
    }

    return { order, parents, gScore };
}

function heuristic(nodeId, goalId) {
    const node = getNode(nodeId);
    const goal = getNode(goalId);
    if (!node || !goal) return 0;
    return distance(node.x, node.y, goal.x, goal.y);
}

function buildPath(goalId, parents) {
    const path = [];
    let current = goalId;
    while (current) {
        path.unshift(current);
        current = parents.get(current);
    }
    return path;
}

function stepAlgorithm() {
    if (steps.length === 0) {
        runAlgorithm();
        if (steps.length === 0) return;
    }
    if (stepIndex >= steps.length) {
        setStatus("Algorithm complete.");
        stopPlayback();
        return;
    }
    const step = steps[stepIndex];
    visitedNodes.add(step.nodeId);
    activeNodeId = step.nodeId;
    if (step.via) {
        const edge = findEdgeBetween(step.via, step.nodeId);
        activeEdgeId = edge ? edge.id : null;
    } else {
        activeEdgeId = null;
    }
    stepIndex += 1;
    updateVisitedList();
    redrawScene();
}

function playAlgorithm() {
    if (playTimer) return;
    const interval = Number(ui.playSpeed.value) || 700;
    playTimer = setInterval(() => {
        if (stepIndex >= steps.length) {
            stopPlayback();
            setStatus("Algorithm complete.");
            return;
        }
        stepAlgorithm();
    }, interval);
}

function findEdgeBetween(fromId, toId) {
    return edges.find((edge) => {
        if (directed) {
            return edge.from === fromId && edge.to === toId;
        }
        return (edge.from === fromId && edge.to === toId) || (edge.from === toId && edge.to === fromId);
    });
}

function clearGraph() {
    nodes = [];
    edges = [];
    nodeIdCounter = 1;
    edgeIdCounter = 1;
    resetAlgorithmState();
    updateNodeSelectors();
    setStatus("Graph cleared.");
    redrawScene();
}

function createRandomGraph() {
    clearGraph();
    const count = clampNumber(Number(ui.randNodes.value) || 8, 2, 20);
    const density = clampNumber(Number(ui.randDensity.value) || 25, 5, 100);
    for (let i = 0; i < count; i++) {
        const x = random(radius, canvasWidth - radius);
        const y = random(radius, canvasHeight - radius);
        nodes.push(new Node(x, y, nextNodeLabel()));
    }
    resolveOverlap();
    const possible = directed ? count * (count - 1) : (count * (count - 1)) / 2;
    const targetEdges = Math.max(1, Math.floor((density / 100) * possible));
    while (edges.length < targetEdges) {
        const a = nodes[Math.floor(Math.random() * nodes.length)].id;
        const b = nodes[Math.floor(Math.random() * nodes.length)].id;
        if (a === b || edgeExists(a, b)) continue;
        edges.push(new Edge(a, b, defaultEdgeWeight + Math.floor(Math.random() * 9)));
    }
    updateNodeSelectors();
    updateVisitedList();
    setStatus("Random graph generated.");
    redrawScene();
}

function updateVisitedList() {
    const list = steps.slice(0, stepIndex).map((step) => {
        const node = getNode(step.nodeId);
        return node ? node.label : step.nodeId;
    });
    ui.visitedList.textContent = list.length ? list.join(" → ") : "No steps yet.";
}

function nextNodeLabel() {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const index = nodes.length;
    if (index < alphabet.length) return alphabet[index];
    const first = alphabet[Math.floor(index / alphabet.length) - 1];
    const second = alphabet[index % alphabet.length];
    return `${first}${second}`;
}

function distance(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}

function midpoint(x1, y1, x2, y2) {
    return [(x1 + x2) / 2, (y1 + y2) / 2];
}

function textPadding(node1, node2) {
    const unit = unitVector(node1, node2);
    return [-10 * unit[1], 10 * unit[0]];
}

function unitVector(node1, node2) {
    const xvec = node1.x - node2.x;
    const yvec = node1.y - node2.y;
    const mag = Math.sqrt(xvec * xvec + yvec * yvec);
    if (mag === 0) return [1, 0];
    return [xvec / mag, yvec / mag];
}

function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return distance(px, py, x1, y1);
    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const projX = x1 + t * dx;
    const projY = y1 + t * dy;
    return distance(px, py, projX, projY);
}

function clampNumber(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

ui.modeSelect.addEventListener("click", () => setMode("select"));
ui.modeNode.addEventListener("click", () => setMode("addNode"));
ui.modeEdge.addEventListener("click", () => setMode("addEdge"));

ui.directedToggle.addEventListener("change", (event) => {
    directed = event.target.checked;
    setStatus(directed ? "Directed edges enabled." : "Undirected edges enabled.");
    redrawScene();
});

ui.nodeLabel.addEventListener("input", (event) => {
    if (!selectedNodeId) return;
    const node = getNode(selectedNodeId);
    if (!node) return;
    node.label = event.target.value.trim() || "Node";
    updateNodeSelectors();
    redrawScene();
});

ui.applyEdgeWeight.addEventListener("click", () => {
    if (!selectedEdgeId) return;
    const edge = getEdge(selectedEdgeId);
    if (!edge) return;
    const value = Number(ui.edgeWeight.value);
    if (Number.isNaN(value)) return;
    edge.weight = value;
    setStatus("Edge weight updated.");
    redrawScene();
});

ui.runAlgo.addEventListener("click", () => {
    resetAlgorithmState();
    runAlgorithm();
});
ui.stepAlgo.addEventListener("click", stepAlgorithm);
ui.playAlgo.addEventListener("click", () => {
    if (steps.length === 0) runAlgorithm();
    playAlgorithm();
});
ui.pauseAlgo.addEventListener("click", () => {
    stopPlayback();
    setStatus("Paused.");
});
ui.resetAlgo.addEventListener("click", () => {
    resetAlgorithmState();
    setStatus("Algorithm state reset.");
});

ui.randomGraph.addEventListener("click", createRandomGraph);
ui.clearGraph.addEventListener("click", clearGraph);

setMode("select");
updateNodeSelectors();
setStatus("Ready.");
toggleSelectionPanel();
updateVisitedList();
