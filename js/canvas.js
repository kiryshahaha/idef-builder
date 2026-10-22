/**
 * IDEF Builder - Canvas Controller & Interactive SVG Renderer
 * Full support for dragging, snapping, port connections, inline editing, zoom & pan
 */

class CanvasController {
  constructor(containerEl, model, app) {
    this.container = containerEl;
    this.model = model;
    this.app = app;

    // Viewport transform
    this.scale = 0.85;
    this.panX = 40;
    this.panY = 30;
    this.isPanning = false;
    this.isPanModeActive = false;
    this.isSpacePressed = false;
    this.panStart = { x: 0, y: 0 };
    this.isResizingCanvas = false;
    this.canvasResizeStartPt = null;
    this.canvasResizeStartDim = null;

    // Interaction state
    this.dragTarget = null;
    this.dragOffset = { x: 0, y: 0 };
    this.dragLabelTarget = null;
    this.dragLabelStartPt = { x: 0, y: 0 };
    this.dragLabelInitOffset = { x: 0, y: 0 };
    this.dragHandleTarget = null;
    this.resizeTarget = null;
    this.activePort = null;
    this.tempConnection = null;

    // Create SVG Canvas structure
    this.initSvg();
    this.initEvents();
  }

  initSvg() {
    this.container.innerHTML = '';

    // Wrapper for scaling and panning
    this.viewportEl = document.createElement('div');
    this.viewportEl.className = 'canvas-viewport';
    this.container.appendChild(this.viewportEl);

    // SVG Sheet
    this.svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svgEl.setAttribute('class', 'gost-sheet');
    this.svgEl.setAttribute('width', this.model.width);
    this.svgEl.setAttribute('height', this.model.height);
    this.svgEl.setAttribute('viewBox', `0 0 ${this.model.width} ${this.model.height}`);
    this.viewportEl.appendChild(this.svgEl);

    // SVG Defs for markers
    this.defsEl = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    this.defsEl.innerHTML = `
      <marker id="arr_input" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#1e40af"/>
      </marker>
      <marker id="arr_control" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#7c3aed"/>
      </marker>
      <marker id="arr_output" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#1e293b"/>
      </marker>
      <marker id="arr_mechanism" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#dc2626"/>
      </marker>
      <marker id="arr_call" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#dc2626"/>
      </marker>
      <marker id="arr_dataflow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#1e293b"/>
      </marker>
      <marker id="arr_precedence" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#000000"/>
      </marker>
      <marker id="arr_crowfoot" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 M 0 5 L 10 5" fill="none" stroke="#000000" stroke-width="1.3"/>
      </marker>
      <!-- IDEF1X Standard Relationship Markers per NIST FIPS PUB 184 -->
      <marker id="arr_idef1x_dot" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
        <circle cx="5" cy="5" r="3.5" fill="#000000"/>
      </marker>
      <marker id="arr_idef1x_diamond" markerWidth="14" markerHeight="10" refX="7" refY="5" orient="auto">
        <polygon points="1 5, 7 1.5, 13 5, 7 8.5" fill="#ffffff" stroke="#000000" stroke-width="1.3"/>
      </marker>
      <marker id="arr_idef1x_z" markerWidth="14" markerHeight="14" refX="7" refY="7" orient="auto">
        <rect x="0" y="0" width="14" height="14" fill="#ffffff" fill-opacity="0.9"/>
        <text x="7" y="11" font-family="'Times New Roman', serif" font-size="12" font-weight="bold" fill="#000000" text-anchor="middle">Z</text>
      </marker>
      <marker id="arr_idef1x_p" markerWidth="14" markerHeight="14" refX="7" refY="7" orient="auto">
        <rect x="0" y="0" width="14" height="14" fill="#ffffff" fill-opacity="0.9"/>
        <text x="7" y="11" font-family="'Times New Roman', serif" font-size="12" font-weight="bold" fill="#000000" text-anchor="middle">P</text>
      </marker>
    `;
    this.svgEl.appendChild(this.defsEl);

    // Frame layer (background & stamps)
    this.frameLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.svgEl.appendChild(this.frameLayer);

    // Elements layer (blocks, entities, stores)
    this.elementsLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.svgEl.appendChild(this.elementsLayer);

    // Connections layer (now on top of elements so lines and labels are never covered!)
    this.connLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.svgEl.appendChild(this.connLayer);

    // Interaction overlay layer (handles, temp lines)
    this.overlayLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.svgEl.appendChild(this.overlayLayer);

    this.applyTransform();
  }

  applyTransform() {
    this.viewportEl.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
    if (this.app) {
      this.app.updateZoomIndicator(this.scale);
    }
  }

  render() {
    // 0. Update SVG dimensions if changed
    if (this.svgEl) {
      this.svgEl.setAttribute('width', this.model.width);
      this.svgEl.setAttribute('height', this.model.height);
      this.svgEl.setAttribute('viewBox', `0 0 ${this.model.width} ${this.model.height}`);
    }

    // 1. Render Master Frame
    this.frameLayer.innerHTML = '';
    const frame = new GostFrame(this.model);
    this.frameLayer.appendChild(frame.render(this.svgEl));

    // 2. Render Elements
    this.elementsLayer.innerHTML = '';
    this.model.elements.forEach(el => {
      el.selected = this.model.selectedIds.includes(el.id);
      const elSvg = this.renderElement(el);
      if (elSvg) {
        this.elementsLayer.appendChild(elSvg);
      }
    });

    // 3. Render Connections (Above blocks)
    this.connLayer.innerHTML = '';
    this.model.connections.forEach(conn => {
      conn.selected = this.model.selectedIds.includes(conn.id);
      const connSvg = ConnectorEngine.renderConnection(conn, this.model);
      if (connSvg) {
        this.connLayer.appendChild(connSvg);
      }
    });

    // 4. Render Geometry Handles for selected connections and elements
    this.overlayLayer.innerHTML = '';
    this.renderConnectionHandles();
    this.renderElementResizeHandles();
    this.renderCanvasCornerResizeHandle();
  }

  
  renderCanvasCornerResizeHandle() {
    const W = this.model.width || 1200;
    const H = this.model.height || 820;
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'canvas-corner-resize-handle');
    g.setAttribute('style', 'cursor: nwse-resize;');
    g.setAttribute('title', `Рабочее пространство: ${W} × ${H} px (Потяните для изменения размера)`);
    g.innerHTML = `
      <rect x="${W - 22}" y="${H - 22}" width="22" height="22" fill="#2563eb" rx="4" opacity="0.85"/>
      <path d="M ${W - 16} ${H - 6} L ${W - 6} ${H - 16} M ${W - 11} ${H - 6} L ${W - 6} ${H - 11}" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>
    `;
    this.overlayLayer.appendChild(g);
  }

  renderElementResizeHandles() {
    if (this.model.selectedIds.length !== 1) return;
    const id = this.model.selectedIds[0];
    const el = this.model.getElementById(id);
    if (!el) return;

    const x = el.x;
    const y = el.y;
    const w = el.width;
    const h = el.height;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'element-resize-overlay');

    // Bounding box dashed border
    const box = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    box.setAttribute('x', x - 2);
    box.setAttribute('y', y - 2);
    box.setAttribute('width', w + 4);
    box.setAttribute('height', h + 4);
    box.setAttribute('fill', 'none');
    box.setAttribute('stroke', '#2563eb');
    box.setAttribute('stroke-width', '1.2');
    box.setAttribute('stroke-dasharray', '3,3');
    box.setAttribute('pointer-events', 'none');
    g.appendChild(box);

    const handles = [
      { name: 'nw', x: x,         y: y,         cursor: 'nwse-resize' },
      { name: 'n',  x: x + w / 2, y: y,         cursor: 'ns-resize' },
      { name: 'ne', x: x + w,     y: y,         cursor: 'nesw-resize' },
      { name: 'e',  x: x + w,     y: y + h / 2, cursor: 'ew-resize' },
      { name: 'se', x: x + w,     y: y + h,     cursor: 'nwse-resize' },
      { name: 's',  x: x + w / 2, y: y + h,     cursor: 'ns-resize' },
      { name: 'sw', x: x,         y: y + h,     cursor: 'nesw-resize' },
      { name: 'w',  x: x,         y: y + h / 2, cursor: 'ew-resize' }
    ];

    const hs = 8; // handle size
    handles.forEach(hnd => {
      const hg = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      hg.setAttribute('class', 'element-resize-handle');
      hg.setAttribute('data-element-id', el.id);
      hg.setAttribute('data-handle', hnd.name);
      hg.setAttribute('style', `cursor: ${hnd.cursor};`);

      // Transparent larger hit area for easy grabbing
      const hit = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      hit.setAttribute('x', hnd.x - 7);
      hit.setAttribute('y', hnd.y - 7);
      hit.setAttribute('width', 14);
      hit.setAttribute('height', 14);
      hit.setAttribute('fill', 'transparent');
      hg.appendChild(hit);

      // Visible handle square
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', hnd.x - hs / 2);
      rect.setAttribute('y', hnd.y - hs / 2);
      rect.setAttribute('width', hs);
      rect.setAttribute('height', hs);
      rect.setAttribute('fill', '#ffffff');
      rect.setAttribute('stroke', '#2563eb');
      rect.setAttribute('stroke-width', '1.5');
      rect.setAttribute('rx', '1');
      rect.setAttribute('ry', '1');
      hg.appendChild(rect);

      g.appendChild(hg);
    });

    this.overlayLayer.appendChild(g);
  }

  getNearestPort(canvasX, canvasY, maxDist = 25) {
    let nearest = null;
    let minDist = maxDist;

    this.model.elements.forEach(el => {
      const ports = ConnectorEngine.getBlockPorts(el);
      Object.keys(ports).forEach(side => {
        const port = ports[side];
        const dist = Math.hypot(port.x - canvasX, port.y - canvasY);
        if (dist < minDist) {
          minDist = dist;
          nearest = { blockId: el.id, side: side, x: port.x, y: port.y };
        }
      });
    });

    return nearest;
  }

  createHandle(cfg) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', `conn-handle-group ${cfg.cls}`);
    g.setAttribute('data-conn-id', cfg.connId);
    g.setAttribute('data-handle-type', cfg.type);
    if (cfg.ptIdx !== undefined) g.setAttribute('data-pt-idx', cfg.ptIdx);
    if (cfg.segIdx !== undefined) g.setAttribute('data-seg-idx', cfg.segIdx);
    if (cfg.orient !== undefined) g.setAttribute('data-orient', cfg.orient);
    g.setAttribute('style', `cursor: ${cfg.cursor};`);
    g.innerHTML = `
      <circle cx="${cfg.x}" cy="${cfg.y}" r="14" fill="transparent" class="handle-hitarea"/>
      <circle cx="${cfg.x}" cy="${cfg.y}" r="5.5" fill="${cfg.fill}" stroke="#ffffff" stroke-width="2" class="handle-visible"/>
    `;
    this.overlayLayer.appendChild(g);
  }

  renderConnectionHandles() {
    this.model.connections.forEach(conn => {
      if (this.model.selectedIds.includes(conn.id)) {
        const { p1, p2 } = ConnectorEngine.getConnectionEndpoints(conn, this.model);
        if (!p1 || !p2) return;

        const isDirectStraight = Math.abs(p2.x - p1.x) < 2 || Math.abs(p2.y - p1.y) < 2;
        if (!conn.points || conn.points.length < 2 || (conn.points.length === 2 && !isDirectStraight)) {
          conn.points = ConnectorEngine.routeOrthogonal(p1, p2);
        } else {
          conn.points[0].x = p1.x;
          conn.points[0].y = p1.y;
          const last = conn.points.length - 1;
          conn.points[last].x = p2.x;
          conn.points[last].y = p2.y;
        }

        const pts = conn.points;

        // 0. QUICK REVERSE BUTTON: Floating ⇄ button near connection center
        const midIdx = Math.floor(pts.length / 2);
        const midPt = pts[midIdx];
        const prevPt = pts[midIdx - 1] || pts[0];
        const flipBtnX = (midPt.x + prevPt.x) / 2;
        const flipBtnY = (midPt.y + prevPt.y) / 2 - 24;

        const flipBtn = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        flipBtn.setAttribute('class', 'conn-flip-btn');
        flipBtn.setAttribute('data-conn-id', conn.id);
        flipBtn.setAttribute('style', 'cursor: pointer;');
        flipBtn.innerHTML = `
          <circle cx="${flipBtnX}" cy="${flipBtnY}" r="12" fill="#2563eb" stroke="#ffffff" stroke-width="2"/>
          <text x="${flipBtnX}" y="${flipBtnY + 4}" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle" pointer-events="none">⇄</text>
        `;
        flipBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.reverseConnection(conn.id);
        });
        this.overlayLayer.appendChild(flipBtn);

        // 1. ENDPOINTS: Start (green) & End (blue)
        this.createHandle({
          connId: conn.id,
          type: 'endpoint_start',
          ptIdx: 0,
          x: pts[0].x,
          y: pts[0].y,
          cursor: 'crosshair',
          fill: '#16a34a', // green
          cls: 'conn-handle-endpoint-start'
        });

        this.createHandle({
          connId: conn.id,
          type: 'endpoint_end',
          ptIdx: pts.length - 1,
          x: pts[pts.length - 1].x,
          y: pts[pts.length - 1].y,
          cursor: 'crosshair',
          fill: '#2563eb', // blue
          cls: 'conn-handle-endpoint-end'
        });

        // 2. CORNERS: At each 90° bend (purple)
        for (let i = 1; i < pts.length - 1; i++) {
          this.createHandle({
            connId: conn.id,
            type: 'corner',
            ptIdx: i,
            x: pts[i].x,
            y: pts[i].y,
            cursor: 'move',
            fill: '#4f46e5', // indigo
            cls: 'conn-handle-corner'
          });
        }

        // 3. STRAIGHT SEGMENTS: Handle on every straight segment (cyan)
        for (let i = 0; i < pts.length - 1; i++) {
          const pA = pts[i];
          const pB = pts[i + 1];
          const segLen = Math.hypot(pB.x - pA.x, pB.y - pA.y);
          // Always show on 2-point straight line, and on visible segments in multi-point lines
          if (pts.length === 2 || segLen >= 18) {
            const mx = (pA.x + pB.x) / 2;
            const my = (pA.y + pB.y) / 2;
            const isHoriz = Math.abs(pA.y - pB.y) <= Math.abs(pA.x - pB.x);
            this.createHandle({
              connId: conn.id,
              type: 'segment',
              segIdx: i,
              orient: isHoriz ? 'h' : 'v',
              x: mx,
              y: my,
              cursor: isHoriz ? 'ns-resize' : 'ew-resize',
              fill: '#06b6d4', // cyan
              cls: 'conn-handle-segment'
            });
          }
        }
      }
    });
  }

  updateConnectionPathInDom(conn) {
    const connEl = this.svgEl.querySelector(`.svg-connection[data-id="${conn.id}"]`);
    if (!connEl || !conn.points) return;

    const d = ConnectorEngine.pointsToSvgPath(conn.points);
    const hitArea = connEl.querySelector('.conn-hitarea');
    const line = connEl.querySelector('.conn-line');
    if (hitArea) hitArea.setAttribute('d', d);
    if (line) line.setAttribute('d', d);

    // Update label midpoint
    const midIdx = Math.floor(conn.points.length / 2);
    const midPt = conn.points[midIdx];
    const prevPt = conn.points[midIdx - 1] || conn.points[0];
    const labelX = (midPt.x + prevPt.x) / 2 + (conn.labelOffsetX || 0);
    const labelY = (midPt.y + prevPt.y) / 2 - 8 + (conn.labelOffsetY || 0);
    const labelGroup = connEl.querySelector('.conn-label-group');
    if (labelGroup) {
      const textEl = labelGroup.querySelector('.conn-label');
      if (textEl) {
        textEl.setAttribute('x', labelX);
        textEl.setAttribute('y', labelY);
        textEl.querySelectorAll('tspan').forEach(t => t.setAttribute('x', labelX));
      }
      const bgRect = labelGroup.querySelector('.conn-label-bg');
      if (bgRect) {
        bgRect.setAttribute('x', labelX - parseFloat(bgRect.getAttribute('width')) / 2);
        bgRect.setAttribute('y', labelY - 11);
      }
    }

    // Update all handle positions smoothly in overlayLayer
    const pts = conn.points;
    const handles = this.overlayLayer.querySelectorAll(`.conn-handle-group[data-conn-id="${conn.id}"]`);
    handles.forEach(h => {
      const type = h.getAttribute('data-handle-type');
      let hx, hy;
      if (type === 'endpoint_start' && pts[0]) {
        hx = pts[0].x;
        hy = pts[0].y;
      } else if (type === 'endpoint_end' && pts[pts.length - 1]) {
        hx = pts[pts.length - 1].x;
        hy = pts[pts.length - 1].y;
      } else if (type === 'corner') {
        const ptIdx = parseInt(h.getAttribute('data-pt-idx'));
        if (pts[ptIdx]) {
          hx = pts[ptIdx].x;
          hy = pts[ptIdx].y;
        }
      } else if (type === 'segment') {
        const segIdx = parseInt(h.getAttribute('data-seg-idx'));
        if (pts[segIdx] && pts[segIdx + 1]) {
          hx = (pts[segIdx].x + pts[segIdx + 1].x) / 2;
          hy = (pts[segIdx].y + pts[segIdx + 1].y) / 2;
        }
      }

      if (hx !== undefined && hy !== undefined) {
        h.querySelectorAll('circle').forEach(c => {
          c.setAttribute('cx', hx);
          c.setAttribute('cy', hy);
        });
      }
    });
  }

  renderElement(el) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', `svg-element ${el.selected ? 'selected' : ''}`);
    g.setAttribute('data-id', el.id);

    let content = '';

    switch (el.type) {
      case 'idef0_block':
        content = this.renderIdef0Block(el);
        break;
      case 'idef0_purpose':
        content = this.renderIdef0Purpose(el);
        break;
      case 'idef0_viewpoint':
        content = this.renderIdef0Viewpoint(el);
        break;
      case 'dfd_entity':
        content = this.renderDfdEntity(el);
        break;
      case 'dfd_process':
        content = this.renderDfdProcess(el);
        break;
      case 'dfd_store':
        content = this.renderDfdStore(el);
        break;
      case 'idef1x_entity':
        content = this.renderIdef1xEntity(el);
        break;
      case 'idef3_uob':
        content = this.renderIdef3Uob(el);
        break;
      case 'idef3_junction':
        content = this.renderIdef3Junction(el);
        break;
      default:
        content = `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="#fff" stroke="#000" stroke-width="1.5"/>`;
    }

    // Append connection ports (Left, Top, Right, Bottom) - omitted for annotation notes
    const isNote = el.type === 'idef0_purpose' || el.type === 'idef0_viewpoint';
    const ports = ConnectorEngine.getBlockPorts(el);
    const portsSvg = isNote ? '' : `
      <circle cx="${ports.left.x}" cy="${ports.left.y}" r="5" class="connection-port" data-port="left" data-id="${el.id}"/>
      <circle cx="${ports.top.x}" cy="${ports.top.y}" r="5" class="connection-port" data-port="top" data-id="${el.id}"/>
      <circle cx="${ports.right.x}" cy="${ports.right.y}" r="5" class="connection-port" data-port="right" data-id="${el.id}"/>
      <circle cx="${ports.bottom.x}" cy="${ports.bottom.y}" r="5" class="connection-port" data-port="bottom" data-id="${el.id}"/>
    `;

    g.innerHTML = content + portsSvg;
    return g;
  }

  renderIdef0Purpose(el) {
    const lines = (el.name || '').split('\n');
    const lh = 13;
    let textSvg = '';
    lines.forEach((line, i) => {
      textSvg += `<text x="${el.x + 8}" y="${el.y + 33 + i * lh}" font-family="Times New Roman, serif" font-size="10" fill="#000000">${line}</text>`;
    });

    return `
      <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="#ffffff" stroke="#1e40af" stroke-width="1.5" rx="3" class="block-border"/>
      <rect x="${el.x}" y="${el.y}" width="${el.width}" height="18" fill="#eff6ff" stroke="#1e40af" stroke-width="1" rx="3"/>
      <text x="${el.x + 8}" y="${el.y + 13}" font-family="Times New Roman, serif" font-size="10" font-weight="bold" fill="#1e40af">ЦЕЛЬ:</text>
      ${textSvg}
    `;
  }

  renderIdef0Viewpoint(el) {
    const lines = (el.name || '').split('\n');
    const lh = 13;
    let textSvg = '';
    lines.forEach((line, i) => {
      textSvg += `<text x="${el.x + 8}" y="${el.y + 33 + i * lh}" font-family="Times New Roman, serif" font-size="10" fill="#000000">${line}</text>`;
    });

    return `
      <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="#ffffff" stroke="#7c3aed" stroke-width="1.5" rx="3" class="block-border"/>
      <rect x="${el.x}" y="${el.y}" width="${el.width}" height="18" fill="#f5f3ff" stroke="#7c3aed" stroke-width="1" rx="3"/>
      <text x="${el.x + 8}" y="${el.y + 13}" font-family="Times New Roman, serif" font-size="10" font-weight="bold" fill="#7c3aed">ТОЧКА ЗРЕНИЯ:</text>
      ${textSvg}
    `;
  }

  renderIdef0Block(el) {
    const nw = 36;
    const nh = 16;
    const lines = (el.name || '').split('\n');
    const lh = 13;
    const startY = el.y + (el.height - lines.length * lh) / 2 + 10;

    let textSvg = '';
    lines.forEach((line, i) => {
      textSvg += `<text x="${el.x + el.width / 2}" y="${startY + i * lh}" font-family="Times New Roman, serif" font-size="11" font-weight="bold" fill="#000" text-anchor="middle">${line}</text>`;
    });

    return `
      <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="#ffffff" stroke="#000000" stroke-width="2" class="block-border"/>
      ${textSvg}
      <!-- Node sub-box at bottom-right -->
      <rect x="${el.x + el.width - nw}" y="${el.y + el.height - nh}" width="${nw}" height="${nh}" fill="#ffffff" stroke="#000000" stroke-width="1.5"/>
      <text x="${el.x + el.width - nw / 2}" y="${el.y + el.height - 4}" font-family="Times New Roman, serif" font-size="9" font-weight="bold" fill="#000" text-anchor="middle">${el.nodeCode || 'A1'}</text>
    `;
  }

  renderDfdEntity(el) {
    const lines = (el.name || 'Внешняя сущность').split('\n');
    const lh = 14;
    const h = el.height || 60;
    const totalTextH = lines.length * lh;
    const startY = el.y + Math.max(6, (h - totalTextH) / 2) + 11;
    let textSvg = '';
    lines.forEach((l, i) => {
      textSvg += `<text x="${el.x + el.width / 2}" y="${startY + i * lh}" font-family="'Times New Roman', serif" font-size="11" fill="#000000" text-anchor="middle">${l}</text>`;
    });

    return `
      <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${h}" fill="#ffffff" stroke="#000000" stroke-width="1.5" class="block-border"/>
      ${textSvg}
    `;
  }

  renderDfdProcess(el) {
    const procId = el.procId || 'P1';
    const lines = (el.name || 'Обработать\nданные').split('\n');
    const lh = 13;
    const h = Math.max(el.height || 70, 60);
    const availableH = h - 26;
    const totalTextH = lines.length * lh;
    const startY = el.y + 24 + Math.max(0, (availableH - totalTextH) / 2) + 11;
    let textSvg = '';
    lines.forEach((l, i) => {
      textSvg += `<text x="${el.x + el.width / 2}" y="${startY + i * lh}" font-family="'Times New Roman', serif" font-size="10.5" fill="#000000" text-anchor="middle">${l}</text>`;
    });

    return `
      <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${h}" rx="10" ry="10" fill="#ffffff" stroke="#000000" stroke-width="1.5" class="block-border"/>
      <text x="${el.x + el.width / 2}" y="${el.y + 18}" font-family="'Times New Roman', serif" font-size="11" font-weight="bold" fill="#000000" text-anchor="middle">${procId}</text>
      ${textSvg}
    `;
  }

  renderDfdStore(el) {
    const storeId = el.storeId || 'D1';
    let rawName = el.name || 'Накопитель данных';
    if (rawName.startsWith(storeId + ' ')) {
      rawName = rawName.substring(storeId.length + 1);
    }
    const lines = rawName.split('\n');
    const lh = 13;
    const h = Math.max(el.height || 48, 48);
    const availableH = h - 22;
    const totalTextH = lines.length * lh;
    const startY = el.y + 20 + Math.max(0, (availableH - totalTextH) / 2) + 11;
    let textSvg = '';
    lines.forEach((l, i) => {
      textSvg += `<text x="${el.x + el.width / 2}" y="${startY + i * lh}" font-family="'Times New Roman', serif" font-size="10.5" font-weight="bold" fill="#000000" text-anchor="middle">${l}</text>`;
    });

    return `
      <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${h}" fill="#ffffff" stroke="#000000" stroke-width="1.5" class="block-border"/>
      <text x="${el.x + el.width / 2}" y="${el.y + 17}" font-family="'Times New Roman', serif" font-size="11" font-weight="bold" fill="#000000" text-anchor="middle">${storeId}</text>
      ${textSvg}
    `;
  }

  renderIdef1xEntity(el) {
    const rx = el.isDep ? 10 : 0;
    const headerH = 22;
    const pks = el.pks && el.pks.length > 0 ? el.pks : ['PK id'];
    const attrs = el.attrs && el.attrs.length > 0 ? el.attrs : ['attribute'];
    const rowH = 14;

    const minH = headerH + (pks.length + attrs.length) * rowH + 12;
    const totalH = Math.max(el.height || minH, minH);
    el.height = totalH;

    const headerText = el.name || 'ENTITY_NAME';

    let pkSvg = '';
    pks.forEach((pk, i) => {
      const lineText = pk.startsWith('PK') ? pk : `PK ${pk}`;
      pkSvg += `<text x="${el.x + 8}" y="${el.y + headerH + 11 + i * rowH}" font-family="'Times New Roman', serif" font-size="9.5" fill="#000000">${lineText}</text>`;
    });

    const pkEndY = el.y + headerH + pks.length * rowH + 3;

    let attrsSvg = '';
    attrs.forEach((attr, j) => {
      attrsSvg += `<text x="${el.x + 8}" y="${pkEndY + 11 + j * rowH}" font-family="'Times New Roman', serif" font-size="9" fill="#000000">${attr}</text>`;
    });

    return `
      <!-- Entity Box: clean white background, sharp or rounded corners per GOST/IDEF1X -->
      <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${totalH}" rx="${rx}" ry="${rx}" fill="#ffffff" stroke="#000000" stroke-width="1.5" class="block-border"/>
      <!-- Header -->
      <text x="${el.x + el.width / 2}" y="${el.y + 15}" font-family="'Times New Roman', serif" font-size="10.5" font-weight="bold" fill="#000000" text-anchor="middle">${headerText}</text>
      <line x1="${el.x}" y1="${el.y + headerH}" x2="${el.x + el.width}" y2="${el.y + headerH}" stroke="#000000" stroke-width="1.2"/>
      <!-- PK Section -->
      ${pkSvg}
      <line x1="${el.x}" y1="${pkEndY}" x2="${el.x + el.width}" y2="${pkEndY}" stroke="#000000" stroke-width="1.2"/>
      <!-- Non-PK Section -->
      ${attrsSvg}
    `;
  }

  renderIdef3Uob(el) {
    const lines = (el.name || '').split('\n');
    const lh = 13;
    const totalTextH = lines.length * lh;
    const startY = el.y + Math.max(18, (el.height - totalTextH) / 2) + 10;
    let textSvg = '';
    lines.forEach((l, i) => {
      textSvg += `<text x="${el.x + el.width / 2}" y="${startY + i * lh}" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="10.5" fill="#000000" text-anchor="middle">${l}</text>`;
    });

    const uobId = el.uobId !== undefined ? el.uobId : 'UOB1';

    return `
      <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="#ffffff" stroke="#000000" stroke-width="1.5" class="block-border"/>
      <text x="${el.x + 8}" y="${el.y + 14}" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="9" font-weight="bold" fill="#000000">${uobId}</text>
      ${textSvg}
    `;
  }

  renderIdef3Junction(el) {
    const r = el.width / 2;
    const cx = el.x + r;
    const cy = el.y + r;
    let labelSvg = '';
    if (el.name && el.name.trim() && el.name.trim() !== (el.juncType || 'X')) {
      labelSvg = `<text x="${cx}" y="${cy + r + 13}" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="9" fill="#000000" text-anchor="middle">${el.name}</text>`;
    }
    return `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" stroke="#000000" stroke-width="1.5" class="block-border"/>
      <text x="${cx}" y="${cy + 4.5}" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="bold" fill="#000000" text-anchor="middle">${el.juncType || 'X'}</text>
      ${labelSvg}
    `;
  }

  setPanMode(enabled) {
    this.isPanModeActive = enabled;
    this.updateCursor();
  }

  updateCursor() {
    if (this.isPanModeActive || this.isSpacePressed) {
      this.container.style.cursor = 'grab';
    } else {
      this.container.style.cursor = 'default';
    }
  }

  resetZoom() {
    this.scale = 0.85;
    this.panX = 40;
    this.panY = 30;
    this.applyTransform();
  }

  fitToScreen() {
    const cw = this.container.clientWidth || window.innerWidth;
    const ch = this.container.clientHeight || window.innerHeight;
    const scale = Math.min((cw - 80) / this.model.width, (ch - 80) / this.model.height, 1.5);
    this.scale = Math.max(0.3, Math.min(2.0, scale));
    this.panX = Math.round((cw - this.model.width * this.scale) / 2);
    this.panY = Math.round((ch - this.model.height * this.scale) / 2);
    this.applyTransform();
  }

  // ── Event Handlers ──
  initEvents() {
    // Space bar pan mode support
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable) return;
      if (e.code === 'Space' && !this.isSpacePressed) {
        this.isSpacePressed = true;
        this.updateCursor();
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        this.isSpacePressed = false;
        this.updateCursor();
      }
    });

    window.addEventListener('blur', () => {
      this.isSpacePressed = false;
      this.isPanning = false;
      this.updateCursor();
    });
    // Canvas Mouse Down
    this.container.addEventListener('mousedown', (e) => {
      // Pan if Pan mode is active, Space is pressed, or Middle mouse clicked
      if (this.isPanModeActive || this.isSpacePressed || e.button === 1) {
        this.isPanning = true;
        this.panStart = { x: e.clientX - this.panX, y: e.clientY - this.panY };
        this.container.style.cursor = 'grabbing';
        e.preventDefault();
        return;
      }

      // Connection Handle Drag (Endpoints, Corners, Segments)
      const canvasCorner = e.target.closest('.canvas-corner-resize-handle');
      if (canvasCorner) {
        this.isResizingCanvas = true;
        const pt = this.screenToCanvasPoint(e.clientX, e.clientY);
        this.canvasResizeStartPt = pt;
        this.canvasResizeStartDim = { w: this.model.width, h: this.model.height };
        document.body.style.cursor = 'nwse-resize';
        e.stopPropagation();
        e.preventDefault();
        return;
      }

      const connHandle = e.target.closest('.conn-handle-group');
      if (connHandle) {
        const connId = connHandle.getAttribute('data-conn-id');
        const handleType = connHandle.getAttribute('data-handle-type');
        const conn = this.model.getConnectionById(connId);

        if (conn && conn.points) {
          connHandle.classList.add('dragging');
          this.dragHandleTarget = {
            conn,
            type: handleType,
            ptIdx: parseInt(connHandle.getAttribute('data-pt-idx')),
            segIdx: parseInt(connHandle.getAttribute('data-seg-idx')),
            orient: connHandle.getAttribute('data-orient'),
            handleEl: connHandle
          };
          e.stopPropagation();
          e.preventDefault();
          return;
        }
      }

      // Editable Header/Footer fields (Click to edit directly on canvas)
      const metaNode = e.target.closest('.editable-meta');
      if (metaNode) {
        const fieldName = metaNode.getAttribute('data-field');
        if (this.app) {
          this.app.focusMasterField(fieldName);
        }
        e.stopPropagation();
        return;
      }

      // Clickable status cells in Header
      const statusCell = e.target.closest('.status-cell-click');
      if (statusCell) {
        const status = statusCell.getAttribute('data-status');
        this.model.masterPage.status = status;
        this.render();
        if (this.app) {
          this.app.updateInspector();
          this.app.recordHistory();
        }
        e.stopPropagation();
        return;
      }

      // Clickable remark items (1..10) in Header
      const remarkItem = e.target.closest('.remark-item-click');
      if (remarkItem) {
        const num = parseInt(remarkItem.getAttribute('data-remark-num'));
        this.model.masterPage.remarks = (this.model.masterPage.remarks === num) ? num - 1 : num;
        this.render();
        if (this.app) {
          this.app.updateInspector();
          this.app.recordHistory();
        }
        e.stopPropagation();
        return;
      }

      // Drag-and-drop of Arrow Text Label
      const labelNode = e.target.closest('.conn-label-group') || (e.target.classList.contains('conn-label') ? e.target : null);
      if (labelNode) {
        const connId = labelNode.getAttribute('data-conn-id') || labelNode.closest('.svg-connection')?.getAttribute('data-id');
        const conn = this.model.getConnectionById(connId);
        if (conn) {
          this.dragLabelTarget = conn;
          const pt = this.screenToCanvasPoint(e.clientX, e.clientY);
          this.dragLabelStartPt = { x: pt.x, y: pt.y };
          this.dragLabelInitOffset = {
            x: conn.labelOffsetX || 0,
            y: conn.labelOffsetY || 0
          };
          this.selectConnection(conn.id);
          labelNode.classList.add('dragging');
          e.stopPropagation();
          return;
        }
      }

      // Port Connection Drag
      if (e.target.classList.contains('connection-port')) {
        const portSide = e.target.getAttribute('data-port');
        const blockId = e.target.getAttribute('data-id');
        this.startPortConnection(blockId, portSide, e);
        return;
      }

      // Element Resize Handle Drag
      const resizeHandle = e.target.closest('.element-resize-handle');
      if (resizeHandle) {
        const elId = resizeHandle.getAttribute('data-element-id');
        const handle = resizeHandle.getAttribute('data-handle');
        const el = this.model.getElementById(elId);
        if (el) {
          const pt = this.screenToCanvasPoint(e.clientX, e.clientY);
          this.resizeTarget = {
            el,
            handle,
            startPt: pt,
            startX: el.x,
            startY: el.y,
            startW: el.width,
            startH: el.height
          };
          e.stopPropagation();
          e.preventDefault();
          return;
        }
      }

      // Element Selection & Drag
      const elNode = e.target.closest('.svg-element');
      if (elNode) {
        const id = elNode.getAttribute('data-id');
        this.selectElement(id, e.shiftKey);
        const el = this.model.getElementById(id);
        if (el) {
          const pt = this.screenToCanvasPoint(e.clientX, e.clientY);
          this.dragTarget = el;
          this.dragOffset = { x: pt.x - el.x, y: pt.y - el.y };
        }
        return;
      }

      // Connection Selection
      const connNode = e.target.closest('.svg-connection');
      if (connNode) {
        const id = connNode.getAttribute('data-id');
        this.selectConnection(id);
        return;
      }

      // Background click: clear selection and allow panning via left-click drag on background
      if (this.model.selectedIds.length > 0) {
        this.model.selectedIds = [];
        this.render();
        if (this.app) this.app.updateInspector();
      }

      if (e.button === 0) {
        this.isPanning = true;
        this.panStart = { x: e.clientX - this.panX, y: e.clientY - this.panY };
        this.container.style.cursor = 'grabbing';
      }
    });

    // Window Mouse Move
    window.addEventListener('mousemove', (e) => {
      if (this.isResizingCanvas) {
        const pt = this.screenToCanvasPoint(e.clientX, e.clientY);
        const dx = pt.x - this.canvasResizeStartPt.x;
        const dy = pt.y - this.canvasResizeStartPt.y;
        const snap = 10;
        const newW = Math.max(700, Math.min(5000, Math.round((this.canvasResizeStartDim.w + dx) / snap) * snap));
        const newH = Math.max(500, Math.min(4000, Math.round((this.canvasResizeStartDim.h + dy) / snap) * snap));
        if (newW !== this.model.width || newH !== this.model.height) {
          this.model.width = newW;
          this.model.height = newH;
          this.render();
          if (this.app) {
            this.app.updateCanvasSizeInputs();
          }
        }
        return;
      }

      if (this.isPanning) {
        this.panX = e.clientX - this.panStart.x;
        this.panY = e.clientY - this.panStart.y;
        this.applyTransform();
        return;
      }

      // Move Connection Handle (strictly orthogonal, no diagonals, no jitter!)
      if (this.dragHandleTarget) {
        const pt = this.screenToCanvasPoint(e.clientX, e.clientY);
        const snap = 5;
        const { conn, type, ptIdx, segIdx, orient } = this.dragHandleTarget;
        const pts = conn.points;

        if (type === 'endpoint_start') {
          const nearest = this.getNearestPort(pt.x, pt.y, 25);
          const targetPt = nearest ? { x: nearest.x, y: nearest.y } : {
            x: Math.round(pt.x / snap) * snap,
            y: Math.round(pt.y / snap) * snap
          };
          pts[0].x = targetPt.x;
          pts[0].y = targetPt.y;
          if (pts.length > 2) {
            if (Math.abs(pts[0].y - pts[1].y) <= Math.abs(pts[0].x - pts[1].x)) {
              pts[1].y = targetPt.y;
            } else {
              pts[1].x = targetPt.x;
            }
          } else {
            if (Math.abs(pts[0].x - pts[1].x) >= 2 && Math.abs(pts[0].y - pts[1].y) >= 2) {
              conn.points = ConnectorEngine.routeOrthogonal(pts[0], pts[1]);
            }
          }
          this.updateConnectionPathInDom(conn);
          return;
        }

        if (type === 'endpoint_end') {
          const nearest = this.getNearestPort(pt.x, pt.y, 25);
          const targetPt = nearest ? { x: nearest.x, y: nearest.y } : {
            x: Math.round(pt.x / snap) * snap,
            y: Math.round(pt.y / snap) * snap
          };
          const lastIdx = pts.length - 1;
          pts[lastIdx].x = targetPt.x;
          pts[lastIdx].y = targetPt.y;
          if (pts.length > 2) {
            if (Math.abs(pts[lastIdx].y - pts[lastIdx - 1].y) <= Math.abs(pts[lastIdx].x - pts[lastIdx - 1].x)) {
              pts[lastIdx - 1].y = targetPt.y;
            } else {
              pts[lastIdx - 1].x = targetPt.x;
            }
          } else {
            if (Math.abs(pts[0].x - pts[lastIdx].x) >= 2 && Math.abs(pts[0].y - pts[lastIdx].y) >= 2) {
              conn.points = ConnectorEngine.routeOrthogonal(pts[0], pts[lastIdx]);
            }
          }
          this.updateConnectionPathInDom(conn);
          return;
        }

        if (type === 'corner') {
          const newX = Math.round(pt.x / snap) * snap;
          const newY = Math.round(pt.y / snap) * snap;
          const pPrev = pts[ptIdx - 1];
          const pCurr = pts[ptIdx];
          const pNext = pts[ptIdx + 1];

          // Determine whether segment before this corner is horizontal or vertical
          const segPrevHoriz = Math.abs(pPrev.y - pCurr.y) <= Math.abs(pPrev.x - pCurr.x);

          if (segPrevHoriz) {
            // Segment before (ptIdx-1 to ptIdx) is horizontal
            // Segment after (ptIdx to ptIdx+1) is vertical
            // 1. Moving horizontally shifts the vertical segment (both this corner and next corner move in X)
            pts[ptIdx].x = newX;
            if (ptIdx + 1 < pts.length - 1) {
              pts[ptIdx + 1].x = newX;
            }
            // 2. Moving vertically shifts the horizontal segment (only if inner segment, not fixed endpoint)
            if (ptIdx - 1 > 0) {
              pts[ptIdx - 1].y = newY;
              pts[ptIdx].y = newY;
            }
          } else {
            // Segment before (ptIdx-1 to ptIdx) is vertical
            // Segment after (ptIdx to ptIdx+1) is horizontal
            // 1. Moving horizontally shifts the vertical segment (only if inner segment, not fixed endpoint)
            if (ptIdx - 1 > 0) {
              pts[ptIdx - 1].x = newX;
              pts[ptIdx].x = newX;
            }
            // 2. Moving vertically shifts the horizontal segment (both this corner and next corner move in Y)
            pts[ptIdx].y = newY;
            if (ptIdx + 1 < pts.length - 1) {
              pts[ptIdx + 1].y = newY;
            }
          }

          this.updateConnectionPathInDom(conn);
          return;
        }

        if (type === 'segment') {
          if (pts.length === 2) {
            // Straight line: drag segment perpendicular to slide it
            if (orient === 'h') {
              const newY = Math.round(pt.y / snap) * snap;
              pts[0].y = newY;
              pts[1].y = newY;
            } else {
              const newX = Math.round(pt.x / snap) * snap;
              pts[0].x = newX;
              pts[1].x = newX;
            }
          } else {
            // Multi-segment line: slide segment strictly in its 1D axis
            if (orient === 'v') {
              const newX = Math.round(pt.x / snap) * snap;
              pts[segIdx].x = newX;
              pts[segIdx + 1].x = newX;
            } else {
              const newY = Math.round(pt.y / snap) * snap;
              pts[segIdx].y = newY;
              pts[segIdx + 1].y = newY;
            }
          }
          this.updateConnectionPathInDom(conn);
          return;
        }
      }

      if (this.dragLabelTarget) {
        const pt = this.screenToCanvasPoint(e.clientX, e.clientY);
        const dx = pt.x - this.dragLabelStartPt.x;
        const dy = pt.y - this.dragLabelStartPt.y;
        this.dragLabelTarget.labelOffsetX = Math.round((this.dragLabelInitOffset.x + dx) / 5) * 5;
        this.dragLabelTarget.labelOffsetY = Math.round((this.dragLabelInitOffset.y + dy) / 5) * 5;
        this.render();
        return;
      }

      if (this.resizeTarget) {
        const pt = this.screenToCanvasPoint(e.clientX, e.clientY);
        const dx = pt.x - this.resizeTarget.startPt.x;
        const dy = pt.y - this.resizeTarget.startPt.y;
        const { el, handle, startX, startY, startW, startH } = this.resizeTarget;

        const minW = (el.type === 'idef3_junction') ? 24 : 50;
        const minH = (el.type === 'idef3_junction') ? 24 : 30;
        const snap = 5;

        let newX = startX;
        let newY = startY;
        let newW = startW;
        let newH = startH;

        if (handle.includes('e')) {
          newW = Math.max(minW, Math.round((startW + dx) / snap) * snap);
        }
        if (handle.includes('s')) {
          newH = Math.max(minH, Math.round((startH + dy) / snap) * snap);
        }
        if (handle.includes('w')) {
          const proposedW = Math.round((startW - dx) / snap) * snap;
          if (proposedW >= minW) {
            newW = proposedW;
            newX = startX + (startW - proposedW);
          } else {
            newW = minW;
            newX = startX + (startW - minW);
          }
        }
        if (handle.includes('n')) {
          const proposedH = Math.round((startH - dy) / snap) * snap;
          if (proposedH >= minH) {
            newH = proposedH;
            newY = startY + (startH - proposedH);
          } else {
            newH = minH;
            newY = startY + (startH - minH);
          }
        }

        // Keep within diagram boundary
        if (newX < 10) { newW -= (10 - newX); newX = 10; }
        if (newY < 80) { newH -= (80 - newY); newY = 80; }
        newW = Math.max(minW, newW);
        newH = Math.max(minH, newH);

        el.x = newX;
        el.y = newY;
        el.width = newW;
        el.height = newH;

        this.render();
        if (this.app) this.app.updateInspector();
        return;
      }

      if (this.dragTarget) {
        const pt = this.screenToCanvasPoint(e.clientX, e.clientY);
        // 10px Grid snap
        const snapX = Math.round((pt.x - this.dragOffset.x) / 10) * 10;
        const snapY = Math.round((pt.y - this.dragOffset.y) / 10) * 10;
        this.dragTarget.x = Math.max(10, Math.min(this.model.width - this.dragTarget.width - 10, snapX));
        this.dragTarget.y = Math.max(90, Math.min(this.model.height - 40 - this.dragTarget.height, snapY));
        this.render();
        return;
      }

      if (this.tempConnection) {
        const pt = this.screenToCanvasPoint(e.clientX, e.clientY);
        this.updateTempConnection(pt);
      }
    });

    // Window Mouse Up
    window.addEventListener('mouseup', (e) => {
      if (this.isResizingCanvas) {
        this.isResizingCanvas = false;
        this.canvasResizeStartPt = null;
        this.canvasResizeStartDim = null;
        document.body.style.cursor = '';
        if (this.app) {
          this.app.recordHistory();
          this.app.saveCurrentDiagramToStorage();
          this.app.updateCanvasSizeInputs();
        }
      }
      if (this.isPanning) {
        this.isPanning = false;
        this.updateCursor();
      }

      if (this.dragHandleTarget) {
        const { conn, type } = this.dragHandleTarget;
        if (this.dragHandleTarget.handleEl) {
          this.dragHandleTarget.handleEl.classList.remove('dragging');
        }

        // If endpoint was dragged, check port reconnection
        if (type === 'endpoint_start') {
          const pt = conn.points[0];
          const nearest = this.getNearestPort(pt.x, pt.y, 25);
          if (nearest) {
            conn.sourceId = nearest.blockId;
            conn.sourcePort = nearest.side;
            conn.points[0] = { x: nearest.x, y: nearest.y };
          } else {
            conn.sourceId = null;
            conn.sourcePort = null;
            conn.p1 = { x: pt.x, y: pt.y };
          }
        } else if (type === 'endpoint_end') {
          const pt = conn.points[conn.points.length - 1];
          const nearest = this.getNearestPort(pt.x, pt.y, 25);
          if (nearest) {
            conn.targetId = nearest.blockId;
            conn.targetPort = nearest.side;
            conn.points[conn.points.length - 1] = { x: nearest.x, y: nearest.y };
          } else {
            conn.targetId = null;
            conn.targetPort = null;
            conn.p2 = { x: pt.x, y: pt.y };
          }
        }

        // Ensure free connection p1/p2 match points
        if (!conn.sourceId && conn.points && conn.points.length > 0) {
          conn.p1 = { x: conn.points[0].x, y: conn.points[0].y };
        }
        if (!conn.targetId && conn.points && conn.points.length > 0) {
          conn.p2 = { x: conn.points[conn.points.length - 1].x, y: conn.points[conn.points.length - 1].y };
        }
        const lastPt = conn.points[conn.points.length - 1];
        if (conn.points.length === 2 && Math.abs(conn.points[0].x - lastPt.x) >= 2 && Math.abs(conn.points[0].y - lastPt.y) >= 2) {
          conn.points = ConnectorEngine.routeOrthogonal(conn.points[0], lastPt);
        }

        this.dragHandleTarget = null;
        this.render();
        if (this.app) this.app.recordHistory();
      }

      if (this.dragLabelTarget) {
        this.dragLabelTarget = null;
        document.querySelectorAll('.conn-label-group.dragging').forEach(n => n.classList.remove('dragging'));
        if (this.app) this.app.recordHistory();
      }

      if (this.resizeTarget) {
        this.resizeTarget = null;
        this.render();
        if (this.app) {
          this.app.updateInspector();
          this.app.recordHistory();
        }
      }

      if (this.dragTarget) {
        this.dragTarget = null;
        if (this.app) this.app.recordHistory();
      }

      if (this.tempConnection) {
        this.finishPortConnection(e);
      }
    });

    // Drag & Drop from left palette onto Canvas
    this.container.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });

    this.container.addEventListener('drop', (e) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('text/plain');
      if (!type) return;

      const pt = this.screenToCanvasPoint(e.clientX, e.clientY);
      const dropX = Math.max(10, Math.round((pt.x - 70) / 10) * 10);
      const dropY = Math.max(90, Math.round((pt.y - 40) / 10) * 10);

      this.app.addShapeFromPalette(type, dropX, dropY);
    });

    // Touchpad 2-finger panning & Pinch-to-zoom / Mouse wheel pan & Ctrl-zoom
    this.container.addEventListener('wheel', (e) => {
      e.preventDefault();

      // Touchpad pinch-to-zoom OR Ctrl/Meta + wheel
      if (e.ctrlKey || e.metaKey) {
        const delta = e.deltaMode === 1 ? e.deltaY * 20 : e.deltaY;
        const zoomFactor = Math.min(1.2, Math.max(0.8, Math.exp(-delta * 0.003)));
        this.zoom(zoomFactor, e.clientX, e.clientY);
        return;
      }

      // 2-finger touchpad swipe OR mouse wheel
      let dx = e.deltaX;
      let dy = e.deltaY;

      if (e.deltaMode === 1) { // Lines
        dx *= 20;
        dy *= 20;
      } else if (e.deltaMode === 2) { // Pages
        dx *= 400;
        dy *= 400;
      }

      // Shift + Wheel converts vertical to horizontal pan
      if (e.shiftKey && dx === 0 && dy !== 0) {
        dx = dy;
        dy = 0;
      }

      this.panX -= dx;
      this.panY -= dy;
      this.applyTransform();
    }, { passive: false });

    // Touch gestures support (Touchscreen / Multi-touch)
    let touchState = {
      isTouch: false,
      startX: 0,
      startY: 0,
      initialDist: 0,
      initialScale: 1,
      center: { x: 0, y: 0 }
    };

    const getTouchDist = (t1, t2) => Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    const getTouchCenter = (t1, t2) => ({
      x: (t1.clientX + t2.clientX) / 2,
      y: (t1.clientY + t2.clientY) / 2
    });

    this.container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const target = e.target;
        const isInteractive = target.closest('.conn-handle-group, .editable-meta, .status-cell-click, .remark-item-click, .conn-label-group, .connection-port, .element-resize-handle, .svg-element, .svg-connection');
        if (!isInteractive || this.isPanModeActive || this.isSpacePressed) {
          touchState.isTouch = true;
          touchState.startX = e.touches[0].clientX - this.panX;
          touchState.startY = e.touches[0].clientY - this.panY;
        }
      } else if (e.touches.length === 2) {
        touchState.isTouch = true;
        touchState.initialDist = getTouchDist(e.touches[0], e.touches[1]);
        touchState.initialScale = this.scale;
        touchState.center = getTouchCenter(e.touches[0], e.touches[1]);
        touchState.startX = touchState.center.x - this.panX;
        touchState.startY = touchState.center.y - this.panY;
        e.preventDefault();
      }
    }, { passive: false });

    this.container.addEventListener('touchmove', (e) => {
      if (!touchState.isTouch) return;
      if (e.touches.length === 1) {
        this.panX = e.touches[0].clientX - touchState.startX;
        this.panY = e.touches[0].clientY - touchState.startY;
        this.applyTransform();
        e.preventDefault();
      } else if (e.touches.length === 2) {
        const currentDist = getTouchDist(e.touches[0], e.touches[1]);
        const center = getTouchCenter(e.touches[0], e.touches[1]);
        if (touchState.initialDist > 0) {
          const factor = currentDist / touchState.initialDist;
          const targetScale = Math.max(0.3, Math.min(2.5, touchState.initialScale * factor));
          const scaleChange = targetScale / this.scale;
          this.panX -= (center.x - this.panX) * (scaleChange - 1);
          this.panY -= (center.y - this.panY) * (scaleChange - 1);
          this.scale = targetScale;
          this.panX += (center.x - touchState.center.x);
          this.panY += (center.y - touchState.center.y);
          touchState.center = center;
          touchState.initialDist = currentDist;
          touchState.initialScale = targetScale;
          this.applyTransform();
        }
        e.preventDefault();
      }
    }, { passive: false });

    const endTouch = () => {
      touchState.isTouch = false;
    };
    this.container.addEventListener('touchend', endTouch);
    this.container.addEventListener('touchcancel', endTouch);

    // Double Click to edit label (both blocks and arrow labels!)
    this.container.addEventListener('dblclick', (e) => {
      const labelNode = e.target.closest('.conn-label-group') || e.target.closest('.conn-label');
      if (labelNode) {
        const connId = labelNode.getAttribute('data-conn-id') || labelNode.closest('.svg-connection')?.getAttribute('data-id');
        this.showInlineArrowEditor(connId, e);
        return;
      }

      const elNode = e.target.closest('.svg-element');
      if (elNode) {
        const id = elNode.getAttribute('data-id');
        this.showInlineEditor(id);
      }
    });
  }

  screenToCanvasPoint(clientX, clientY) {
    const rect = this.svgEl.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / this.scale,
      y: (clientY - rect.top) / this.scale
    };
  }

  zoom(factor, cx, cy) {
    const newScale = Math.max(0.3, Math.min(2.5, this.scale * factor));
    if (cx !== undefined && cy !== undefined) {
      this.panX -= (cx - this.panX) * (newScale / this.scale - 1);
      this.panY -= (cy - this.panY) * (newScale / this.scale - 1);
    }
    this.scale = newScale;
    this.applyTransform();
  }

  selectElement(id, multi = false) {
    if (multi) {
      if (!this.model.selectedIds.includes(id)) {
        this.model.selectedIds.push(id);
      }
    } else {
      this.model.selectedIds = [id];
    }
    this.render();
    if (this.app) this.app.updateInspector();
  }

  reverseConnection(connId) {
    const conn = this.model.getConnectionById(connId);
    if (!conn) return;

    // Swap source and target endpoints
    const tmpSourceId = conn.sourceId;
    const tmpSourcePort = conn.sourcePort;
    conn.sourceId = conn.targetId;
    conn.sourcePort = conn.targetPort;
    conn.targetId = tmpSourceId;
    conn.targetPort = tmpSourcePort;

    if (conn.p1 && conn.p2) {
      const tmpP = { ...conn.p1 };
      conn.p1 = { ...conn.p2 };
      conn.p2 = tmpP;
    }

    if (conn.points && conn.points.length > 1) {
      conn.points.reverse();
    }

    this.render();
    if (this.app) {
      this.app.updateInspector();
      this.app.recordHistory();
    }
  }

  selectConnection(id) {
    this.model.selectedIds = [id];
    this.render();
    if (this.app) this.app.updateInspector();
  }

  startPortConnection(blockId, portSide, e) {
    const src = this.model.getElementById(blockId);
    if (!src) return;
    const ports = ConnectorEngine.getBlockPorts(src);
    const startPt = ports[portSide];

    // Default neutral dark arrow (#1e293b); only colored when explicitly picked from palette or set in inspector
    let defaultType = 'output';
    if (this.model.type === 'dfd' || (src.type && src.type.startsWith('dfd_'))) {
      defaultType = 'dataflow';
    } else if (this.model.type === 'idef3' || (src.type && src.type.startsWith('idef3_'))) {
      defaultType = 'precedence';
    } else if (this.model.type === 'idef1x' || (src.type && src.type.startsWith('idef1x_'))) {
      defaultType = 'rel_ident';
    }

    this.tempConnection = {
      sourceId: blockId,
      sourcePort: portSide,
      startPt: startPt,
      icomType: defaultType
    };

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('id', 'temp-conn-line');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', ConnectorEngine.ICOM_COLORS[this.tempConnection.icomType] || '#1e293b');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-dasharray', '4,3');
    this.overlayLayer.appendChild(path);
  }

  updateTempConnection(pt) {
    const pathEl = document.getElementById('temp-conn-line');
    if (!pathEl || !this.tempConnection) return;
    const pts = ConnectorEngine.routeOrthogonal(this.tempConnection.startPt, { x: pt.x, y: pt.y });
    pathEl.setAttribute('d', ConnectorEngine.pointsToSvgPath(pts));
  }

  finishPortConnection(e) {
    const tempLine = document.getElementById('temp-conn-line');
    if (tempLine) tempLine.remove();

    const targetPort = e.target.classList.contains('connection-port') ? e.target : null;
    if (targetPort && this.tempConnection) {
      const tgtId = targetPort.getAttribute('data-id');
      const tgtSide = targetPort.getAttribute('data-port');

      if (tgtId !== this.tempConnection.sourceId) {
        const src = this.model.getElementById(this.tempConnection.sourceId);
        const tgt = this.model.getElementById(tgtId);

        let finalType = this.tempConnection.icomType;
        let defaultLabel = 'Поток';
        if (this.model.type === 'dfd' || (src && src.type && src.type.startsWith('dfd_')) || (tgt && tgt.type && tgt.type.startsWith('dfd_'))) {
          finalType = 'dataflow';
          defaultLabel = 'Поток данных';
        } else if (this.model.type === 'idef3' || (src && src.type && src.type.startsWith('idef3_')) || (tgt && tgt.type && tgt.type.startsWith('idef3_'))) {
          finalType = 'precedence';
          defaultLabel = '';
        } else if (this.model.type === 'idef1x' || (src && src.type && src.type.startsWith('idef1x_')) || (tgt && tgt.type && tgt.type.startsWith('idef1x_'))) {
          finalType = 'rel_ident';
          defaultLabel = 'Связь сущностей';
        } else {
          finalType = 'output';
          defaultLabel = 'Интерфейсный поток';
        }

        let actualSourceId = this.tempConnection.sourceId;
        let actualSourcePort = this.tempConnection.sourcePort;
        let actualTargetId = tgtId;
        let actualTargetPort = tgtSide;

        // Smart orientation: if user dragged from an Input port ('left') to an Output/source port ('right'),
        // OR from a Process's input port ('left') to an Entity or Store:
        // orient so data flows INTO the input port!
        const srcIsProcess = src && (src.type === 'dfd_process' || src.type === 'idef0_block');
        const tgtIsSource = tgt && (tgt.type === 'dfd_entity' || tgt.type === 'dfd_store');
        const isFromInputToOutput = (this.tempConnection.sourcePort === 'left' && tgtSide === 'right');
        const isFromProcessInputToEntity = (srcIsProcess && this.tempConnection.sourcePort === 'left' && tgtIsSource);

        if (isFromInputToOutput || isFromProcessInputToEntity) {
          actualSourceId = tgtId;
          actualSourcePort = tgtSide;
          actualTargetId = this.tempConnection.sourceId;
          actualTargetPort = this.tempConnection.sourcePort;
        }

        this.model.addConnection({
          sourceId: actualSourceId,
          sourcePort: actualSourcePort,
          targetId: actualTargetId,
          targetPort: actualTargetPort,
          icomType: finalType,
          label: defaultLabel
        });
        this.render();
        if (this.app) this.app.recordHistory();
      }
    }
    this.tempConnection = null;
  }

  showInlineEditor(id) {
    const el = this.model.getElementById(id);
    if (!el) return;

    const textarea = document.createElement('textarea');
    textarea.className = 'canvas-text-editor';
    textarea.value = el.name || '';

    const rect = this.svgEl.getBoundingClientRect();
    const topOffset = (el.type === 'idef0_purpose' || el.type === 'idef0_viewpoint') ? 20 : 10;
    textarea.style.left = `${rect.left + el.x * this.scale + 8}px`;
    textarea.style.top = `${rect.top + (el.y + topOffset) * this.scale}px`;
    textarea.style.width = `${Math.max(120, (el.width - 16) * this.scale)}px`;
    textarea.style.height = `${Math.max(40, (el.height - topOffset - 6) * this.scale)}px`;

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const finish = () => {
      el.name = textarea.value;
      textarea.remove();
      this.render();
      if (this.app) {
        this.app.updateInspector();
        this.app.recordHistory();
      }
    };

    textarea.addEventListener('blur', finish);
    textarea.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' && !ev.shiftKey) {
        ev.preventDefault();
        finish();
      }
    });
  }

  showInlineArrowEditor(connId, e) {
    const conn = this.model.getConnectionById(connId);
    if (!conn) return;

    const textarea = document.createElement('textarea');
    textarea.className = 'canvas-text-editor';
    textarea.value = conn.label || '';

    const clickX = e ? e.clientX : 300;
    const clickY = e ? e.clientY : 300;
    textarea.style.left = `${clickX - 60}px`;
    textarea.style.top = `${clickY - 20}px`;
    textarea.style.width = '140px';
    textarea.style.height = '48px';

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const finish = () => {
      conn.label = textarea.value;
      textarea.remove();
      this.render();
      if (this.app) {
        this.app.updateInspector();
        this.app.recordHistory();
      }
    };

    textarea.addEventListener('blur', finish);
    textarea.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' && !ev.shiftKey) {
        ev.preventDefault();
        finish();
      }
    });
  }

  showInlineMetaEditor(metaNode, fieldName, e) {
    if (this.app) {
      this.app.focusMasterField(fieldName);
    }
  }

  
}

window.CanvasController = CanvasController;
