// Tactical Linked List Visualizer Engine
class VisualizerNode {
  constructor(val, addr = null) {
    this.id = Math.random().toString(36).substring(2, 9);
    this.val = val;
    this.addr = addr || '0x' + Math.floor(Math.random() * 0x8FF + 0x100).toString(16).toUpperCase();
    this.next = null;
  }
}

class LinkedListVisualizer {
  constructor() {
    this.head = null;
    this.isAnimating = false;
    this.logs = [];
    this.initSampleList();
  }

  initSampleList() {
    this.head = null;
    const initialVals = [10, 20, 30, 40];
    let curr = null;
    for (let v of initialVals) {
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
  }

  log(msg, type = "normal") {
    this.logs.unshift({ msg, type, time: new Date().toLocaleTimeString() });
    if (this.logs.length > 25) this.logs.pop();
    this.renderLogs();
  }

  renderLogs() {
    const logBox = document.getElementById('vizTerminalLogBox');
    if (!logBox) return;
    logBox.innerHTML = this.logs
      .map(l => `<div class="log-entry-row ${l.type}">[${l.time}] ${l.msg}</div>`)
      .join('');
  }

  getArray() {
    const arr = [];
    let curr = this.head;
    while (curr) {
      arr.push(curr);
      curr = curr.next;
    }
    return arr;
  }

  render(highlightId = null, highlightClass = "") {
    const container = document.getElementById('vizNodesRowContainer');
    if (!container) return;
    container.innerHTML = '';

    const nodes = this.getArray();
    if (nodes.length === 0) {
      container.innerHTML = `
        <div style="color: var(--text-muted); font-style: italic; margin-right: 1.5rem; font-family: var(--font-code);">
          List is empty (head == nullptr)
        </div>
        <div class="viz-null-terminator">nullptr</div>
      `;
      return;
    }

    nodes.forEach((node, idx) => {
      const isHead = (idx === 0);
      const isTail = (idx === nodes.length - 1);
      const nextAddr = node.next ? node.next.addr : 'nullptr';
      const isHighlighted = (node.id === highlightId);

      const nodeWrapper = document.createElement('div');
      nodeWrapper.className = 'viz-node-unit';

      nodeWrapper.innerHTML = `
        <div class="viz-node-block ${isHighlighted ? (highlightClass || 'highlight-curr') : ''}" id="node-${node.id}">
          ${isHead ? '<div class="viz-flag-head">HEAD</div>' : ''}
          ${isTail ? '<div class="viz-flag-tail">TAIL</div>' : ''}
          <div class="viz-val-cell">${node.val}</div>
          <div class="viz-addr-cell">${nextAddr}</div>
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
    if (isNaN(val)) return;
    const newNode = new VisualizerNode(val);
    newNode.next = this.head;
    this.head = newNode;
    this.log(`Node(${val}) allocated at ${newNode.addr}. newNode->next = head; head = newNode.`, "success");
    this.render(newNode.id, "highlight-curr");
  }

  insertTail(val) {
    if (isNaN(val)) return;
    const newNode = new VisualizerNode(val);
    if (!this.head) {
      this.head = newNode;
      this.log(`List khali thi. Node(${val}) banaya aur head assign kiya at ${newNode.addr}`, "success");
    } else {
      let curr = this.head;
      while (curr.next) {
        curr = curr.next;
      }
      curr.next = newNode;
      this.log(`Tail tak traverse kiya. Node(${val}) attach at ${newNode.addr}`, "success");
    }
    this.render(newNode.id, "highlight-curr");
  }

  insertAt(val, pos) {
    if (isNaN(val) || isNaN(pos) || pos < 1) return;
    if (pos === 1) {
      this.insertHead(val);
      return;
    }
    const newNode = new VisualizerNode(val);
    let curr = this.head;
    let count = 1;
    while (curr && count < pos - 1) {
      curr = curr.next;
      count++;
    }
    if (!curr) {
      this.log(`Index ${pos} out of range!`, "warn");
      return;
    }
    newNode.next = curr.next;
    curr.next = newNode;
    this.log(`Node(${val}) inserted at position ${pos} (between curr and curr->next).`, "success");
    this.render(newNode.id, "highlight-curr");
  }

  deleteHead() {
    if (!this.head) {
      this.log("List pehle se empty hai! deleteHead() skipped.", "warn");
      return;
    }
    const oldHead = this.head;
    this.head = this.head.next;
    this.log(`Head node(${oldHead.val}) deleted: delete temp; head = head->next;`, "accent");
    this.render();
  }

  deleteTail() {
    if (!this.head) {
      this.log("List empty hai!", "warn");
      return;
    }
    if (!this.head.next) {
      const val = this.head.val;
      this.head = null;
      this.log(`Single node(${val}) deleted. List now empty.`, "accent");
      this.render();
      return;
    }
    let curr = this.head;
    while (curr.next && curr.next.next) {
      curr = curr.next;
    }
    const delVal = curr.next.val;
    curr.next = null;
    this.log(`Tail node(${delVal}) deleted. Second-to-last node->next = nullptr`, "accent");
    this.render();
  }

  deleteVal(val) {
    if (!this.head) {
      this.log("List empty hai!", "warn");
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
    curr.next = curr.next.next;
    this.log(`Node with value ${val} deleted. curr->next bypassed.`, "success");
    this.render();
  }

  async reverseListAnimated() {
    if (this.isAnimating) return;
    if (!this.head || !this.head.next) {
      this.log("0 ya 1 node ki list ko reverse karne ki zaroorat nahi.", "warn");
      return;
    }

    this.isAnimating = true;
    this.log("Reversal Animation Started: prev = nullptr, curr = head", "accent");

    let prev = null;
    let curr = this.head;

    while (curr) {
      let forward = curr.next;
      
      this.log(`Processing node(${curr.val}): forward = curr->next (${forward ? forward.val : 'nullptr'}), curr->next = prev (${prev ? prev.val : 'nullptr'})`, "accent");
      
      this.render(curr.id, "highlight-curr");
      await new Promise(r => setTimeout(r, 650));

      curr.next = prev;
      prev = curr;
      curr = forward;

      this.log(`Pointers shifted: prev = node(${prev.val}), curr = ${curr ? 'node(' + curr.val + ')' : 'nullptr'}`, "normal");
      await new Promise(r => setTimeout(r, 400));
    }

    this.head = prev;
    this.isAnimating = false;
    this.log("Reversal Complete! New head is node(" + this.head.val + ")", "success");
    this.render(this.head.id, "highlight-curr");
  }
}

window.visualizerInstance = new LinkedListVisualizer();
