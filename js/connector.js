/**
 * IDEF Builder - Orthogonal Connector Engine (ГОСТ Р 50.1.028-2001, п. 5.3.2)
 * Strictly enforces 90° angles, ICOM port semantics, and standard arrowheads.
 */

class ConnectorEngine {
  static ICOM_COLORS = {
    input: '#1e40af',      // Blue
    control: '#7c3aed',    // Purple
    output: '#1e293b',     // Dark blue / Navy
    mechanism: '#dc2626',  // Red
    call: '#dc2626',       // Red (points down)
    dataflow: '#1e293b',   // DFD Navy
    rel_ident: '#000000',  // IDEF1X Solid
    rel_non: '#000000',    // IDEF1X Dashed
    rel_opt: '#000000',    // IDEF1X Optional (Dashed with Diamond)
    precedence: '#000000'  // IDEF3 Slate
  };

  /**
   * Calculate 90-degree orthogonal path between start and end points
   * @param {Point} p1 - {x, y, side: 'left'|'right'|'top'|'bottom'}
   * @param {Point} p2 - {x, y, side: 'left'|'right'|'top'|'bottom'}
   * @returns {Array<Point>} Array of points forming 90° segments
   */
  static routeOrthogonal(p1, p2) {
    const points = [{ x: p1.x, y: p1.y }];

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    // Direct straight line if aligned
    if (Math.abs(p1.x - p2.x) < 2 || Math.abs(p1.y - p2.y) < 2) {
      points.push({ x: p2.x, y: p2.y });
      return points;
    }

    const side1 = p1.side || 'right';
    const side2 = p2.side || 'left';

    // Standard Horizontal-First or Vertical-First routing based on exit/entry sides
    if (side1 === 'right' && side2 === 'left') {
      const midX = p1.x + dx / 2;
      points.push({ x: midX, y: p1.y });
      points.push({ x: midX, y: p2.y });
    } else if (side1 === 'bottom' && side2 === 'top') {
      const midY = p1.y + dy / 2;
      points.push({ x: p1.x, y: midY });
      points.push({ x: p2.x, y: midY });
    } else if (side1 === 'right' && side2 === 'top') {
      points.push({ x: p2.x, y: p1.y });
    } else if (side1 === 'left' && side2 === 'top') {
      points.push({ x: p2.x, y: p1.y });
    } else if (side1 === 'bottom' && side2 === 'left') {
      points.push({ x: p1.x, y: p2.y });
    } else if (side1 === 'top' && side2 === 'right') {
      points.push({ x: p1.x, y: p2.y });
    } else {
      // General fallback Manhattan routing
      const midX = p1.x + dx / 2;
      points.push({ x: midX, y: p1.y });
      points.push({ x: midX, y: p2.y });
    }

    points.push({ x: p2.x, y: p2.y });
    return points;
  }

  /**
   * Render SVG path string from points
   */
  static pointsToSvgPath(points) {
    if (!points || points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    return d;
  }

  /**
   * Get block attachment ports (Left=Input, Top=Control, Right=Output, Bottom=Mech)
   */
  static getBlockPorts(block) {
    const x = block.x;
    const y = block.y;
    const w = block.width;
    const h = block.height;

    return {
      left:   { x: x,         y: y + h / 2, side: 'left' },
      top:    { x: x + w / 2, y: y,         side: 'top' },
      right:  { x: x + w,     y: y + h / 2, side: 'right' },
      bottom: { x: x + w / 2, y: y + h,     side: 'bottom' }
    };
  }

  /**
   * Render complete connection SVG element
   */
  static getConnectionEndpoints(conn, model) {
    let p1, p2;

    if (conn.sourceId) {
      const src = model.getElementById(conn.sourceId);
      if (src) {
        const srcPorts = ConnectorEngine.getBlockPorts(src);
        p1 = srcPorts[conn.sourcePort || 'right'];
      }
    }
    if (!p1) {
      p1 = conn.p1 || { x: 50, y: 150, side: 'left' };
    }

    if (conn.targetId) {
      const tgt = model.getElementById(conn.targetId);
      if (tgt) {
        const tgtPorts = ConnectorEngine.getBlockPorts(tgt);
        p2 = tgtPorts[conn.targetPort || 'left'];
      }
    }
    if (!p2) {
      p2 = conn.p2 || { x: 250, y: 150, side: 'right' };
    }

    return { p1, p2 };
  }

  static renderConnection(conn, model) {
    const color = ConnectorEngine.ICOM_COLORS[conn.icomType] || '#1e293b';
    const { p1, p2 } = ConnectorEngine.getConnectionEndpoints(conn, model);
    if (!p1 || !p2) return null;

    const isDirectStraight = Math.abs(p2.x - p1.x) < 2 || Math.abs(p2.y - p1.y) < 2;

    if (!conn.points || conn.points.length < 2 || (conn.points.length === 2 && !isDirectStraight)) {
      conn.points = ConnectorEngine.routeOrthogonal(p1, p2);
    } else {
      // Keep ends anchored strictly to endpoints
      conn.points[0].x = p1.x;
      conn.points[0].y = p1.y;
      const last = conn.points.length - 1;
      conn.points[last].x = p2.x;
      conn.points[last].y = p2.y;

      // Only adjust intermediate corners if we have at least 3 points (prevents crossing over endpoints on 2-point lines!)
      if (conn.points.length >= 3) {
        // Keep segment 0 orthogonal
        if (Math.abs(conn.points[0].y - conn.points[1].y) <= Math.abs(conn.points[0].x - conn.points[1].x)) {
          conn.points[1].y = p1.y;
        } else {
          conn.points[1].x = p1.x;
        }

        // Keep last segment orthogonal (last - 1 >= 1, so it never touches points[0])
        if (Math.abs(conn.points[last].y - conn.points[last - 1].y) <= Math.abs(conn.points[last].x - conn.points[last - 1].x)) {
          conn.points[last - 1].y = p2.y;
        } else {
          conn.points[last - 1].x = p2.x;
        }
      }
    }

    const points = conn.points;
    const d = ConnectorEngine.pointsToSvgPath(points);

    // Midpoint for label
    const midIdx = Math.floor(points.length / 2);
    const midPt = points[midIdx];
    const prevPt = points[midIdx - 1] || points[0];
    const labelX = (midPt.x + prevPt.x) / 2 + (conn.labelOffsetX || 0);
    const labelY = (midPt.y + prevPt.y) / 2 - 8 + (conn.labelOffsetY || 0);

    const isDashed = conn.icomType === 'rel_non' || conn.icomType === 'rel_opt';
    const isTunnel = conn.isTunnel || false;

    let markerEnd = `arr_${conn.icomType || 'input'}`;
    let markerStart = null;

    if (conn.icomType === 'rel_ident' || conn.icomType === 'rel_non' || conn.icomType === 'rel_opt') {
      if (conn.cardinality === 'Z') {
        markerEnd = 'arr_idef1x_z';
      } else if (conn.cardinality === 'P') {
        markerEnd = 'arr_idef1x_p';
      } else if (conn.cardinality === 'none') {
        markerEnd = '';
      } else {
        markerEnd = 'arr_idef1x_dot';
      }

      if (conn.icomType === 'rel_opt' || conn.hasDiamond) {
        markerStart = 'arr_idef1x_diamond';
      }
    }

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'svg-connection');
    g.setAttribute('data-id', conn.id);
    g.setAttribute('style', 'cursor: pointer;');

    // Tunnel brackets ( ) if specified per ГОСТ
    let tunnelSvg = '';
    if (isTunnel) {
      tunnelSvg = `
        <circle cx="${points[points.length - 1].x}" cy="${points[points.length - 1].y}" r="8" fill="none" stroke="${color}" stroke-width="1.2" stroke-dasharray="2,2"/>
      `;
    }

    // Label rendering with drag handle, halo and multiline support
    let labelSvg = '';
    if (conn.label) {
      const lines = conn.label.split('\n');
      const baseFontSize = 8.5;
      const lineH = 11;
      let tspans = '';
      lines.forEach((line, i) => {
        tspans += `<tspan x="${labelX}" dy="${i === 0 ? 0 : lineH}">${line}</tspan>`;
      });

      const maxLineLen = Math.max(...lines.map(l => l.length));
      const boxW = Math.max(40, maxLineLen * 5.6 + 10);
      const boxH = lines.length * lineH + 6;
      const boxX = labelX - boxW / 2;
      const boxY = labelY - 11;

      labelSvg = `
        <g class="conn-label-group ${conn.selected ? 'selected' : ''}" data-conn-id="${conn.id}" style="cursor: grab;">
          <!-- Optional background pill on selection/hover -->
          <rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" rx="3" ry="3" 
                fill="#ffffff" fill-opacity="0.9" stroke="${conn.selected ? '#2563eb' : '#d1d5db'}" 
                stroke-width="${conn.selected ? '1.5' : '0.6'}" stroke-dasharray="${conn.selected ? '3,2' : 'none'}"
                class="conn-label-bg"/>
          <text x="${labelX}" y="${labelY}" font-family="Times New Roman, serif" 
                font-size="${baseFontSize}" fill="${color}" text-anchor="middle" font-weight="${conn.selected ? 'bold' : 'normal'}"
                paint-order="stroke fill" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round"
                class="conn-label">
            ${tspans}
          </text>
        </g>
      `;
    }

    g.innerHTML = `
      <!-- Hover hit area -->
      <path d="${d}" fill="none" stroke="transparent" stroke-width="14" class="conn-hitarea"/>
      
      <!-- Visible line -->
      <path d="${d}" fill="none" stroke="${color}" stroke-width="${conn.selected ? 2.5 : 1.5}" 
            ${isDashed ? 'stroke-dasharray="6,4"' : ''} 
            ${markerStart ? `marker-start="url(#${markerStart})"` : ''}
            ${markerEnd ? `marker-end="url(#${markerEnd})"` : ''} class="conn-line"/>
      
      ${tunnelSvg}

      <!-- Arrow Label (On top of line) -->
      ${labelSvg}
    `;

    return g;
  }
}

window.ConnectorEngine = ConnectorEngine;
