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
    this.panStart = { x: 0, y: 0 };

    // Interaction state
    this.dragTarget = null;
    this.dragOffset = { x: 0, y: 0 };
    this.dragLabelTarget = null;
    this.dragLabelStartPt = { x: 0, y: 0 };
    this.dragLabelInitOffset = { x: 0, y: 0 };
    this.dragHandleTarget = null;
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
        <polygon points="0 0, 8 3, 0 6" fill="#374151"/>
      </marker>
      <marker id="arr_crowfoot" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 M 0 5 L 10 5" fill="none" stroke="#000000" stroke-width="1.3"/>
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
    // 1. Render GOST Master Frame
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

    // 4. Render Geometry Handles for selected connections
    this.overlayLayer.innerHTML = '';
    this.renderConnectionHandles();
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
        let p1, p2;
        if (conn.sourceId && conn.targetId) {
          const src = this.model.getElementById(conn.sourceId);
          const tgt = this.model.getElementById(conn.targetId);
          if (src && tgt) {
            const srcPorts = ConnectorEngine.getBlockPorts(src);
            const tgtPorts = ConnectorEngine.getBlockPorts(tgt);
            p1 = srcPorts[conn.sourcePort || 'right'];
            p2 = tgtPorts[conn.targetPort || 'left'];
          }
        } else if (conn.sourceId) {
          const src = this.model.getElementById(conn.sourceId);
          if (src) {
            const srcPorts = ConnectorEngine.getBlockPorts(src);
            p1 = srcPorts[conn.sourcePort || 'right'];
          }
          p2 = conn.p2 || { x: (p1 ? p1.x + 100 : 250), y: (p1 ? p1.y : 150) };
        } else if (conn.targetId) {
          const tgt = this.model.getElementById(conn.targetId);
          if (tgt) {
            const tgtPorts = ConnectorEngine.getBlockPorts(tgt);
            p2 = tgtPorts[conn.targetPort || 'left'];
          }
          p1 = conn.p1 || { x: (p2 ? p2.x - 100 : 50), y: (p2 ? p2.y : 150) };
        } else {
          p1 = conn.p1 || { x: 50, y: 150 };
          p2 = conn.p2 || { x: 250, y: 150 };
        }

        if (!p1 || !p2) return;

        // If no custom points or invalid length, route standard orthogonal
        if (!conn.points || conn.points.length < 2) {
          conn.points = ConnectorEngine.routeOrthogonal(p1, p2);
        } else {
          // Keep ends anchored to ports while preserving strict 90° orthogonality
          conn.points[0] = { x: p1.x, y: p1.y };
          conn.points[conn.points.length - 1] = { x: p2.x, y: p2.y };

          if (conn.points.length === 4) {
            // Check orientation of first segment
            if (Math.abs(conn.points[0].y - conn.points[1].y) <= Math.abs(conn.points[0].x - conn.points[1].x)) {
              // Horizontal-first: Seg 0 is horiz, Seg 1 is vert, Seg 2 is horiz
              conn.points[1].y = p1.y;
              conn.points[2].y = p2.y;
              conn.points[2].x = conn.points[1].x;
            } else {
              // Vertical-first: Seg 0 is vert, Seg 1 is horiz, Seg 2 is vert
              conn.points[1].x = p1.x;
              conn.points[2].x = p2.x;
              conn.points[2].y = conn.points[1].y;
            }
          }
        }

        const pts = conn.points;

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

    // Append connection ports (Left, Top, Right, Bottom)
    const ports = ConnectorEngine.getBlockPorts(el);
    const portsSvg = `
      <circle cx="${ports.left.x}" cy="${ports.left.y}" r="5" class="connection-port" data-port="left" data-id="${el.id}"/>
      <circle cx="${ports.top.x}" cy="${ports.top.y}" r="5" class="connection-port" data-port="top" data-id="${el.id}"/>
      <circle cx="${ports.right.x}" cy="${ports.right.y}" r="5" class="connection-port" data-port="right" data-id="${el.id}"/>
      <circle cx="${ports.bottom.x}" cy="${ports.bottom.y}" r="5" class="connection-port" data-port="bottom" data-id="${el.id}"/>
    `;

    g.innerHTML = content + portsSvg;
    return g;
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
    const lines = (el.name || '').split('\n');
    let textSvg = '';
    lines.forEach((l, i) => {
      textSvg += `<text x="${el.x + el.width / 2}" y="${el.y + 24 + i * 14}" font-family="Times New Roman, serif" font-size="10" fill="#000" text-anchor="middle">${l}</text>`;
    });

    return `
      <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="#ffffff" stroke="#000000" stroke-width="2" class="block-border"/>
      <line x1="${el.x}" y1="${el.y + 6}" x2="${el.x + el.width}" y2="${el.y + 6}" stroke="#000" stroke-width="0.8"/>
      ${textSvg}
    `;
  }

  renderDfdProcess(el) {
    const rx = el.width / 2;
    const ry = el.height / 2;
    const cx = el.x + rx;
    const cy = el.y + ry;
    const lines = (el.name || '').split('\n');
    let textSvg = '';
    lines.forEach((l, i) => {
      textSvg += `<text x="${cx}" y="${cy - (lines.length - 1) * 6 + i * 12}" font-family="Times New Roman, serif" font-size="9" fill="#000" text-anchor="middle">${l}</text>`;
    });

    return `
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#ffffff" stroke="#000000" stroke-width="2" class="block-border"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${rx - 5}" ry="${ry - 5}" fill="none" stroke="#000000" stroke-width="0.8"/>
      <text x="${cx}" y="${cy - ry + 12}" font-family="Times New Roman, serif" font-size="8" font-weight="bold" fill="#000" text-anchor="middle">${el.procId || '1'}</text>
      ${textSvg}
    `;
  }

  renderDfdStore(el) {
    const idWidth = 32;
    return `
      <!-- Fully closed rectangle per GOST and accepted reports -->
      <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="#ffffff" stroke="#000000" stroke-width="2" class="block-border"/>
      <!-- ID column -->
      <rect x="${el.x}" y="${el.y}" width="${idWidth}" height="${el.height}" fill="#f1f5f9" stroke="#000000" stroke-width="1.5"/>
      <text x="${el.x + idWidth / 2}" y="${el.y + el.height / 2 + 4}" font-family="Times New Roman, serif" font-size="10" font-weight="bold" fill="#000000" text-anchor="middle">${el.storeId || 'D1'}</text>
      <!-- Name -->
      <text x="${el.x + idWidth + 8}" y="${el.y + el.height / 2 + 4}" font-family="Times New Roman, serif" font-size="10" fill="#000000">${el.name || 'Накопитель данных'}</text>
    `;
  }

  renderIdef1xEntity(el) {
    const rx = el.isDep ? 8 : 0;
    const headerH = 20;
    const pks = el.pks || ['id (PK)'];
    const attrs = el.attrs || ['attribute'];
    const rowH = 16;
    const totalH = headerH + (pks.length + attrs.length) * rowH + 6;
    el.height = totalH; // sync calculated height

    let rowsSvg = '';
    pks.forEach((pk, i) => {
      rowsSvg += `<text x="${el.x + 6}" y="${el.y + headerH + 13 + i * rowH}" font-family="Times New Roman, serif" font-size="9" fill="#dc2626" font-weight="bold">🔑 ${pk}</text>`;
    });

    const pkEndY = el.y + headerH + pks.length * rowH + 2;
    rowsSvg += `<line x1="${el.x}" y1="${pkEndY}" x2="${el.x + el.width}" y2="${pkEndY}" stroke="#000000" stroke-width="1"/>`;

    attrs.forEach((attr, j) => {
      rowsSvg += `<text x="${el.x + 6}" y="${pkEndY + 13 + j * rowH}" font-family="Times New Roman, serif" font-size="9" fill="#000000">• ${attr}</text>`;
    });

    return `
      <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${totalH}" rx="${rx}" ry="${rx}" fill="#ffffff" stroke="#000000" stroke-width="2" class="block-border"/>
      <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${headerH}" rx="${rx}" ry="${rx}" fill="#1e40af" stroke="#000000" stroke-width="1.5"/>
      <text x="${el.x + el.width / 2}" y="${el.y + 14}" font-family="Times New Roman, serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">${el.name}</text>
      ${rowsSvg}
    `;
  }

  renderIdef3Uob(el) {
    const barH = 18;
    const lines = (el.name || '').split('\n');
    let textSvg = '';
    lines.forEach((l, i) => {
      textSvg += `<text x="${el.x + el.width / 2}" y="${el.y + 20 + i * 14}" font-family="Times New Roman, serif" font-size="10" fill="#000" text-anchor="middle">${l}</text>`;
    });

    return `
      <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="#ffffff" stroke="#000000" stroke-width="2" class="block-border"/>
      ${textSvg}
      <line x1="${el.x}" y1="${el.y + el.height - barH}" x2="${el.x + el.width}" y2="${el.y + el.height - barH}" stroke="#000000" stroke-width="1.2"/>
      <rect x="${el.x}" y="${el.y + el.height - barH}" width="${el.width}" height="${barH}" fill="#f3f4f6"/>
      <text x="${el.x + 6}" y="${el.y + el.height - 5}" font-family="Times New Roman, serif" font-size="8" font-weight="bold" fill="#000">${el.uobId || 'J1.1'}</text>
      <text x="${el.x + el.width - 6}" y="${el.y + el.height - 5}" font-family="Times New Roman, serif" font-size="8" fill="#6b7280" text-anchor="end">${el.status || 'Выполняется'}</text>
    `;
  }

  renderIdef3Junction(el) {
    const r = el.width / 2;
    const cx = el.x + r;
    const cy = el.y + r;
    return `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" stroke="#000000" stroke-width="2" class="block-border"/>
      <text x="${cx}" y="${cy + 5}" font-family="Times New Roman, serif" font-size="14" font-weight="bold" fill="#000000" text-anchor="middle">${el.juncType || '&'}</text>
    `;
  }

  // ── Event Handlers ──
  initEvents() {
    // Canvas Mouse Down
    this.container.addEventListener('mousedown', (e) => {
      // Space or Middle Click = Pan
      if (e.spaceKey || e.button === 1 || (e.button === 0 && e.target === this.container)) {
        this.isPanning = true;
        this.panStart = { x: e.clientX - this.panX, y: e.clientY - this.panY };
        this.container.style.cursor = 'grabbing';
        return;
      }

      // Connection Handle Drag (Endpoints, Corners, Segments)
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
        this.showInlineMetaEditor(metaNode, fieldName, e);
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

      // Clear selection on background click
      this.model.selectedIds = [];
      this.render();
      if (this.app) this.app.updateInspector();
    });

    // Window Mouse Move
    window.addEventListener('mousemove', (e) => {
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
          // Snap to nearest port if close
          const nearest = this.getNearestPort(pt.x, pt.y, 25);
          const targetPt = nearest ? { x: nearest.x, y: nearest.y } : {
            x: Math.round(pt.x / snap) * snap,
            y: Math.round(pt.y / snap) * snap
          };
          pts[0].x = targetPt.x;
          pts[0].y = targetPt.y;
          // Keep first segment strictly orthogonal
          if (pts.length > 2) {
            if (Math.abs(pts[0].y - pts[1].y) <= Math.abs(pts[0].x - pts[1].x)) {
              pts[1].y = targetPt.y;
            } else {
              pts[1].x = targetPt.x;
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
          // Keep last segment strictly orthogonal
          if (pts.length > 2) {
            if (Math.abs(pts[lastIdx].y - pts[lastIdx - 1].y) <= Math.abs(pts[lastIdx].x - pts[lastIdx - 1].x)) {
              pts[lastIdx - 1].y = targetPt.y;
            } else {
              pts[lastIdx - 1].x = targetPt.x;
            }
          }
          this.updateConnectionPathInDom(conn);
          return;
        }

        if (type === 'corner') {
          const newX = Math.round(pt.x / snap) * snap;
          const newY = Math.round(pt.y / snap) * snap;
          const prev = pts[ptIdx - 1];
          const next = pts[ptIdx + 1];

          // Check if segment from prev is horizontal or vertical
          const prevHoriz = Math.abs(prev.y - pts[ptIdx].y) <= Math.abs(prev.x - pts[ptIdx].x);
          if (prevHoriz) {
            if (ptIdx - 1 > 0) prev.y = newY;
            pts[ptIdx].y = (ptIdx - 1 === 0 && conn.sourceId) ? prev.y : newY;
            if (ptIdx + 1 < pts.length - 1) next.x = newX;
            pts[ptIdx].x = (ptIdx + 1 === pts.length - 1 && conn.targetId) ? next.x : newX;
          } else {
            if (ptIdx - 1 > 0) prev.x = newX;
            pts[ptIdx].x = (ptIdx - 1 === 0 && conn.sourceId) ? prev.x : newX;
            if (ptIdx + 1 < pts.length - 1) next.y = newY;
            pts[ptIdx].y = (ptIdx + 1 === pts.length - 1 && conn.targetId) ? next.y : newY;
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
      if (this.isPanning) {
        this.isPanning = false;
        this.container.style.cursor = 'default';
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

        this.dragHandleTarget = null;
        this.render();
        if (this.app) this.app.recordHistory();
      }

      if (this.dragLabelTarget) {
        this.dragLabelTarget = null;
        document.querySelectorAll('.conn-label-group.dragging').forEach(n => n.classList.remove('dragging'));
        if (this.app) this.app.recordHistory();
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

    // Zoom on wheel
    this.container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      this.zoom(zoomFactor, e.clientX, e.clientY);
    }, { passive: false });

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

    this.tempConnection = {
      sourceId: blockId,
      sourcePort: portSide,
      startPt: startPt,
      icomType: startPt.type || 'input'
    };

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('id', 'temp-conn-line');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', ConnectorEngine.ICOM_COLORS[this.tempConnection.icomType]);
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
        this.model.addConnection({
          sourceId: this.tempConnection.sourceId,
          sourcePort: this.tempConnection.sourcePort,
          targetId: tgtId,
          targetPort: tgtSide,
          icomType: this.tempConnection.icomType,
          label: 'Интерфейсный поток'
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
    textarea.style.left = `${rect.left + el.x * this.scale + 10}px`;
    textarea.style.top = `${rect.top + el.y * this.scale + 10}px`;
    textarea.style.width = `${Math.max(120, el.width * this.scale - 20)}px`;
    textarea.style.height = `${Math.max(50, el.height * this.scale - 20)}px`;

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
    // Switch to 'tab-master' tab in inspector silently so sidebar is in sync
    if (this.app) {
      this.app.switchInspectorTab('tab-master');
    }

    const currentVal = this.model.masterPage[fieldName] || '';
    const isMultiline = fieldName === 'title' || fieldName === 'project';
    const input = document.createElement(isMultiline ? 'textarea' : 'input');
    if (!isMultiline) input.type = 'text';
    input.className = 'canvas-text-editor';
    input.value = currentVal;

    const rect = metaNode.getBoundingClientRect();
    input.style.left = `${Math.max(10, rect.left - 2)}px`;
    input.style.top = `${Math.max(10, rect.top - 2)}px`;
    input.style.width = `${Math.max(120, rect.width + 10)}px`;
    input.style.height = `${Math.max(26, rect.height + 4)}px`;

    document.body.appendChild(input);
    
    input.focus();
    input.select();

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      this.model.masterPage[fieldName] = input.value.trim();
      input.remove();
      this.render();
      if (this.app) {
        this.app.updateInspector();
        this.app.recordHistory();
      }
    };

    // Guard against instant blur race condition from the click event
    let canBlur = false;
    setTimeout(() => { canBlur = true; }, 200);

    input.addEventListener('blur', () => {
      if (canBlur) finish();
    });

    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' && (!isMultiline || !ev.shiftKey)) {
        ev.preventDefault();
        finish();
      } else if (ev.key === 'Escape') {
        finished = true;
        input.remove();
      }
    });
  }
}

window.CanvasController = CanvasController;
