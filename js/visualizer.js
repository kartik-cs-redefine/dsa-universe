// Tactical Linked List Visualizer Engine
export class VisualizerNode {
  constructor(val, addr = null) {
    this.id = Math.random().toString(36).substring(2, 9);
    this.val = val;
    this.addr = addr || '0x' + Math.floor(Math.random() * 0x8FF + 0x100).toString(16).toUpperCase();
    this.next = null;
  }
}

export class LinkedListVisualizer {
  constructor() {
    this.head = null;
    this.isAnimating = false;
    this.speedMs = 600;
    this.logs = [];
    this.nodesContainer = null;
    this.logContainer = null;
    this.initSampleList();
  }

  mount(nodesContainer, logContainer) {
    this.nodesContainer = nodesContainer || null;
    this.logContainer = logContainer || null;
    this.render();
    this.renderLogs();
  }

  setSpeed(ms) {
    const parsed = parseInt(ms, 10);
    if (Number.isFinite(parsed) && parsed >= 100 && parsed <= 2000) {
      this.speedMs = parsed;
      this.log(`Animation delay set to ${parsed}ms.`, "accent");
    }
  }

  initSampleList() {
    if (this.isAnimating) return;
    this.head = null;
    const initialVals = [10, 20, 30, 40];
    let curr = null;
    for (const v of initialVals) {
      const newNode = new VisualizerNode(v);
      if (!this.head) {
        this.head = newNode;
        curr = this.head;
      } else {
        curr.next = newNode;
        curr = curr.next;
      }
    }
    this.log("Sample List Initialized: [10 -> 20 -> 30 -> 40 -> nullptr]", "accent");
    this.render();
  }

  resetDefault() {
    this.initSampleList();
  }

  _getNodesEl() {
    if (this.nodesContainer && document.body.contains(this.nodesContainer)) {
      return this.nodesContainer;
    }
    return document.getElementById('visualizerNodesTrack') || document.getElementById('vizNodesRowContainer');
  }

  _getLogEl() {
    if (this.logContainer && document.body.contains(this.logContainer)) {
      return this.logContainer;
    }
    return document.getElementById('visualizerLogTerminal') || document.getElementById('vizTerminalLogBox');
  }

  log(msg, type = "normal") {
    this.logs.unshift({ msg, type, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) });
    if (this.logs.length > 30) this.logs.pop();
    this.renderLogs();
  }

  renderLogs() {
    const logBox = this._getLogEl();
    if (!logBox) return;
    logBox.innerHTML = this.logs
      .map(l => `<div class="log-entry-row ${l.type}">[${l.time}] ${this._escapeHtml(l.msg)}</div>`)
      .join('');
  }

  _escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  getArray() {
    const arr = [];
    let curr = this.head;
    const seen = new Set();
    while (curr && !seen.has(curr.id)) {
      seen.add(curr.id);
      arr.push(curr);
      curr = curr.next;
    }
    return arr;
  }

  render(highlightMap = null, highlightClass = "") {
    const container = this._getNodesEl();
    if (!container) return;
    container.innerHTML = '';

    // Support both (id, class) and ({ [id]: { className, badge } })
    let map = {};
    if (typeof highlightMap === 'string' && highlightMap) {
      map[highlightMap] = { className: highlightClass || 'highlight-curr', badge: '' };
    } else if (highlightMap && typeof highlightMap === 'object') {
      map = highlightMap;
    }

    const nodes = this.getArray();
    if (nodes.length === 0) {
      container.innerHTML = `
        <div class="viz-empty-state">
          <span>List is empty (<code>head == nullptr</code>) — Insert a node to begin</span>
        </div>
        <div class="viz-null-terminator">nullptr</div>
      `;
      return;
    }

    nodes.forEach((node, idx) => {
      const isHead = (idx === 0);
      const isTail = (idx === nodes.length - 1);
      const nextAddr = node.next ? node.next.addr : 'nullptr';
      const hl = map[node.id];

      const nodeWrapper = document.createElement('div');
      nodeWrapper.className = 'viz-node-unit';

      nodeWrapper.innerHTML = `
        <div class="viz-node-block ${hl ? hl.className : ''}" id="node-${node.id}">
          ${isHead ? '<div class="viz-flag-head">HEAD</div>' : ''}
          ${hl && hl.badge ? `<div class="viz-flag-pointer">${hl.badge}</div>` : ''}
          ${isTail ? '<div class="viz-flag-tail">TAIL</div>' : ''}
          <div class="viz-val-cell">${node.val}</div>
          <div class="viz-addr-cell">${node.addr} → ${nextAddr}</div>
        </div>
        <div class="viz-link-arrow">
          <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
      `;
      container.appendChild(nodeWrapper);
    });

    const nullBlock = document.createElement('div');
    nullBlock.className = 'viz-null-terminator';
    nullBlock.innerText = 'nullptr';
    container.appendChild(nullBlock);
  }

  insertHead(val) {
    if (this.isAnimating) {
      this.log("Animation in progress. Please wait.", "warn");
      return;
    }
    if (!Number.isFinite(val)) {
      this.log("Please enter a valid integer value.", "warn");
      return;
    }
    const newNode = new VisualizerNode(val);
    newNode.next = this.head;
    this.head = newNode;
    this.log(`Allocated Node(${val}) at ${newNode.addr}. newNode->next = head; head = newNode.`, "success");
    this.render(newNode.id, "highlight-curr");
  }

  insertTail(val) {
    if (this.isAnimating) {
      this.log("Animation in progress. Please wait.", "warn");
      return;
    }
    if (!Number.isFinite(val)) {
      this.log("Please enter a valid integer value.", "warn");
      return;
    }
    const newNode = new VisualizerNode(val);
    if (!this.head) {
      this.head = newNode;
      this.log(`List was empty. Created head Node(${val}) at ${newNode.addr}.`, "success");
    } else {
      let curr = this.head;
      while (curr.next) {
        curr = curr.next;
      }
      curr.next = newNode;
      this.log(`Traversed to tail (${curr.val}). Attached Node(${val}) at ${newNode.addr}.`, "success");
    }
    this.render(newNode.id, "highlight-curr");
  }

  // 0-indexed insertion: pos = 0 inserts at head, pos = length inserts at tail
  insertAt(val, pos) {
    if (this.isAnimating) {
      this.log("Animation in progress. Please wait.", "warn");
      return;
    }
    if (!Number.isFinite(val) || !Number.isFinite(pos) || pos < 0) {
      this.log("Enter a valid integer value and position >= 0.", "warn");
      return;
    }
    if (pos === 0) {
      this.insertHead(val);
      return;
    }
    let curr = this.head;
    let idx = 0;
    while (curr && idx < pos - 1) {
      curr = curr.next;
      idx++;
    }
    if (!curr) {
      const len = this.getArray().length;
      this.log(`Position ${pos} out of bounds! Valid range is 0..${len}.`, "warn");
      return;
    }
    const newNode = new VisualizerNode(val);
    newNode.next = curr.next;
    curr.next = newNode;
    this.log(`Inserted Node(${val}) at index ${pos} after Node(${curr.val}).`, "success");
    this.render(newNode.id, "highlight-curr");
  }

  deleteHead() {
    if (this.isAnimating) return;
    if (!this.head) {
      this.log("List is already empty! deleteHead() skipped.", "warn");
      return;
    }
    const oldHead = this.head;
    this.head = this.head.next;
    this.log(`Deleted head Node(${oldHead.val}) at ${oldHead.addr}. head = head->next.`, "accent");
    this.render();
  }

  deleteTail() {
    if (this.isAnimating) return;
    if (!this.head) {
      this.log("List is empty! deleteTail() skipped.", "warn");
      return;
    }
    if (!this.head.next) {
      const val = this.head.val;
      this.head = null;
      this.log(`Deleted single Node(${val}). List is now empty (head = nullptr).`, "accent");
      this.render();
      return;
    }
    let curr = this.head;
    while (curr.next && curr.next.next) {
      curr = curr.next;
    }
    const delVal = curr.next.val;
    curr.next = null;
    this.log(`Deleted tail Node(${delVal}). Node(${curr.val})->next = nullptr.`, "accent");
    this.render();
  }

  deleteVal(val) {
    if (this.isAnimating) return;
    if (!Number.isFinite(val)) {
      this.log("Enter a valid integer value to delete.", "warn");
      return;
    }
    if (!this.head) {
      this.log("List is empty! Nothing to delete.", "warn");
      return;
    }
    if (this.head.val === val) {
      this.deleteHead();
      return;
    }
    let curr = this.head;
    while (curr.next && curr.next.val !== val) {
      curr = curr.next;
    }
    if (!curr.next) {
      this.log(`Value ${val} not found in the list!`, "warn");
      return;
    }
    const targetAddr = curr.next.addr;
    curr.next = curr.next.next;
    this.log(`Deleted Node(${val}) at ${targetAddr}. Bypassed curr->next.`, "success");
    this.render();
  }

  async searchAnimated(val) {
    if (this.isAnimating) return;
    if (!Number.isFinite(val)) {
      this.log("Enter a valid integer value to search.", "warn");
      return;
    }
    if (!this.head) {
      this.log("List is empty — value not found.", "warn");
      return;
    }
    this.isAnimating = true;
    this.log(`Linear search started for target = ${val}...`, "accent");
    let curr = this.head;
    let idx = 0;
    while (curr) {
      this.render({ [curr.id]: { className: "highlight-curr", badge: `curr [${idx}]` } });
      await new Promise(r => setTimeout(r, Math.max(200, this.speedMs * 0.75)));
      if (curr.val === val) {
        this.log(`Found ${val} at index ${idx} (${curr.addr})!`, "success");
        this.render({ [curr.id]: { className: "highlight-found", badge: `FOUND ✓` } });
        this.isAnimating = false;
        return;
      }
      curr = curr.next;
      idx++;
    }
    this.log(`Reached nullptr — value ${val} not found in list.`, "warn");
    this.isAnimating = false;
    this.render();
  }

  async reverseAnimated() {
    return this.reverseListAnimated();
  }

  async reverseListAnimated() {
    if (this.isAnimating) return;
    if (!this.head || !this.head.next) {
      this.log("List has 0 or 1 node — already reversed.", "warn");
      return;
    }

    this.isAnimating = true;
    this.log("3-Pointer Reversal Started: prev = nullptr, curr = head", "accent");

    // Snapshot nodes in current order so visual nodes stay readable during step-by-step link flip
    let prev = null;
    let curr = this.head;

    while (curr) {
      const forward = curr.next;
      const hl = {};
      if (prev) hl[prev.id] = { className: "highlight-prev", badge: "prev" };
      hl[curr.id] = { className: "highlight-curr", badge: "curr" };
      if (forward) hl[forward.id] = { className: "highlight-fwd", badge: "fwd" };

      this.log(`Step: forward = ${forward ? `Node(${forward.val})` : 'nullptr'}; curr(${curr.val})->next = ${prev ? `Node(${prev.val})` : 'nullptr'}`, "accent");
      this.render(hl);
      await new Promise(r => setTimeout(r, this.speedMs));

      curr.next = prev;
      prev = curr;
      curr = forward;

      this.log(`Shifted: prev = Node(${prev.val}), curr = ${curr ? `Node(${curr.val})` : 'nullptr'}`, "normal");
      await new Promise(r => setTimeout(r, Math.max(150, Math.round(this.speedMs * 0.55))));
    }

    this.head = prev;
    this.isAnimating = false;
    this.log(`Reversal Complete! New head is Node(${this.head.val}) at ${this.head.addr}.`, "success");
    this.render(this.head.id, "highlight-found");
  }
}

export const visualizerInstance = new LinkedListVisualizer();
if (typeof window !== "undefined") {
  window.visualizerInstance = visualizerInstance;
}
