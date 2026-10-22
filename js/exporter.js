/**
 * IDEF Builder - Exporter Engine
 * Supports Pure Vector SVG (ГОСТ Р 50.1.028-2001), 300 DPI PNG, JSON Project Save/Load
 */

class DiagramExporter {
  /**
   * Export to clean, standalone SVG document
   */
  static exportSvg(model) {
    const W = model.width || 1200;
    const H = model.height || 820;

    // Build temporary SVG string
    const frame = new GostFrame(model);
    const frameG = frame.render();

    let defsSvg = `
      <defs>
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
        <marker id="arr_dataflow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#1e293b"/>
        </marker>
        <marker id="arr_precedence" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#374151"/>
        </marker>
        <marker id="arr_crowfoot" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 M 0 5 L 10 5" fill="none" stroke="#000000" stroke-width="1.3"/>
        </marker>
      </defs>
    `;

    // Connections SVG
    let connsSvg = '';
    model.connections.forEach(conn => {
      const el = ConnectorEngine.renderConnection(conn, model);
      if (el) connsSvg += el.outerHTML;
    });

    // Elements SVG
    let elementsSvg = '';
    const tempCanvas = new CanvasController(document.createElement('div'), model);
    model.elements.forEach(element => {
      const el = tempCanvas.renderElement(element);
      if (el) elementsSvg += el.outerHTML;
    });

    const fullSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <style>
    text { font-family: "Times New Roman", Times, serif; }
    .connection-port { display: none; }
  </style>
  <rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"/>
  ${defsSvg}
  ${frameG.outerHTML}
  <g class="elements-layer">${elementsSvg}</g>
  <g class="connections-layer">${connsSvg}</g>
</svg>`;

    DiagramExporter.downloadBlob(new Blob([fullSvg], { type: 'image/svg+xml;charset=utf-8' }), `${model.masterPage.node || 'diagram'}.svg`);
  }

  /**
   * Export to high-res PNG (2x for crisp 300 DPI print quality)
   */
  static exportPng(model, scaleFactor = 2.0) {
    const W = model.width || 1200;
    const H = model.height || 820;

    const svgString = DiagramExporter.getSvgString(model);
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = W * scaleFactor;
      canvas.height = H * scaleFactor;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scaleFactor, scaleFactor);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((pngBlob) => {
        DiagramExporter.downloadBlob(pngBlob, `${model.masterPage.node || 'diagram'}.png`);
        URL.revokeObjectURL(blobURL);
      }, 'image/png');
    };
    img.src = blobURL;
  }

  static getSvgString(model) {
    const W = model.width || 1200;
    const H = model.height || 820;
    const frame = new GostFrame(model);
    const frameG = frame.render();

    let defsSvg = `
      <defs>
        <marker id="arr_input" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#1e40af"/></marker>
        <marker id="arr_control" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#7c3aed"/></marker>
        <marker id="arr_output" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#1e293b"/></marker>
        <marker id="arr_mechanism" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#dc2626"/></marker>
        <marker id="arr_dataflow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#1e293b"/></marker>
        <marker id="arr_precedence" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#374151"/></marker>
        <marker id="arr_crowfoot" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 M 0 5 L 10 5" fill="none" stroke="#000000" stroke-width="1.3"/></marker>
      </defs>
    `;

    let connsSvg = '';
    model.connections.forEach(conn => {
      const el = ConnectorEngine.renderConnection(conn, model);
      if (el) connsSvg += el.outerHTML;
    });

    let elementsSvg = '';
    const tempCanvas = new CanvasController(document.createElement('div'), model);
    model.elements.forEach(element => {
      const el = tempCanvas.renderElement(element);
      if (el) elementsSvg += el.outerHTML;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <style>
    text { font-family: "Times New Roman", Times, serif; }
    .connection-port { display: none; }
  </style>
  <rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"/>
  ${defsSvg}
  ${frameG.outerHTML}
  <g class="elements-layer">${elementsSvg}</g>
  <g class="connections-layer">${connsSvg}</g>
</svg>`;
  }

  /**
   * Export to JSON project file
   */
  static exportJson(model) {
    const jsonStr = JSON.stringify(model.toJSON(), null, 2);
    DiagramExporter.downloadBlob(new Blob([jsonStr], { type: 'application/json' }), `${model.masterPage.node || 'diagram'}.idef.json`);
  }

  static downloadBlob(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

window.DiagramExporter = DiagramExporter;
