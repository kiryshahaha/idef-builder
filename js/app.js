/**
 * IDEF Builder - Main Application Controller
 * Coordinates UI, Palette, Canvas, Inspector, Templates, and Undo/Redo
 */

class IdefApp {
  constructor() {
    this.model = new DiagramModel();
    this.canvasContainer = document.getElementById('canvas-container');
    this.canvas = new CanvasController(this.canvasContainer, this.model, this);

    // History for Undo/Redo
    this.history = [];
    this.historyIndex = -1;

    this.initUI();
    this.loadTemplate('idef0_context'); // default initial diagram
  }

  initUI() {
    this.initNavbar();
    this.initPalette();
    this.initInspector();
    this.initTemplatesModal();
    this.initKeyboardShortcuts();
    this.initFloatingToolbar();
  }

  // ── Navbar Actions ──
  initNavbar() {
    document.getElementById('btn-templates').addEventListener('click', () => this.showModal('modal-templates'));
    document.getElementById('btn-new').addEventListener('click', () => {
      if (confirm('Создать новую чистую диаграмму? Несохраненные изменения будут сброшены.')) {
        this.loadTemplate('blank_idef0');
      }
    });

    document.getElementById('btn-export-svg').addEventListener('click', () => DiagramExporter.exportSvg(this.model));
    document.getElementById('btn-export-png').addEventListener('click', () => DiagramExporter.exportPng(this.model, 2.0));
    document.getElementById('btn-save-json').addEventListener('click', () => DiagramExporter.exportJson(this.model));
    document.getElementById('btn-print').addEventListener('click', () => window.print());

    // File Open
    const fileInput = document.getElementById('input-file-json');
    document.getElementById('btn-open-json').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          this.model.fromJSON(data);
          this.canvas.render();
          this.updateInspector();
          this.recordHistory();
        } catch (err) {
          alert('Ошибка чтения файла проекта: ' + err.message);
        }
      };
      reader.readAsText(file);
    });

    // Undo / Redo
    document.getElementById('btn-undo').addEventListener('click', () => this.undo());
    document.getElementById('btn-redo').addEventListener('click', () => this.redo());

    // Check GOST button
    document.getElementById('btn-check-gost').addEventListener('click', () => {
      this.switchInspectorTab('tab-validation');
      this.runValidation();
    });
  }

  // ── Left Palette ──
  initPalette() {
    document.querySelectorAll('.palette-item').forEach(item => {
      // Enable HTML5 drag-and-drop
      item.setAttribute('draggable', 'true');
      item.addEventListener('dragstart', (e) => {
        const type = item.getAttribute('data-type');
        e.dataTransfer.setData('text/plain', type);
        e.dataTransfer.effectAllowed = 'copy';
      });

      // Also support direct click to add
      item.addEventListener('click', () => {
        const type = item.getAttribute('data-type');
        this.addShapeFromPalette(type);
      });
    });
  }

  addShapeFromPalette(type, customX, customY) {
    const cx = customX !== undefined ? customX : 400;
    const cy = customY !== undefined ? customY : 300;

    switch (type) {
      case 'idef0_block':
        this.model.addElement({
          type: 'idef0_block',
          x: cx,
          y: cy,
          width: 200,
          height: 120,
          name: 'Новая функция\n(Глагол в начальной форме)',
          nodeCode: 'A' + (this.model.elements.filter(e => e.type === 'idef0_block').length + 1)
        });
        break;

      case 'dfd_entity':
        this.model.addElement({
          type: 'dfd_entity',
          x: cx,
          y: cy,
          width: 130,
          height: 60,
          name: 'Внешняя сущность'
        });
        break;

      case 'dfd_process':
        this.model.addElement({
          type: 'dfd_process',
          x: cx,
          y: cy,
          width: 110,
          height: 70,
          procId: '' + (this.model.elements.filter(e => e.type === 'dfd_process').length + 1),
          name: 'Обработать\nданные'
        });
        break;

      case 'dfd_store':
        this.model.addElement({
          type: 'dfd_store',
          x: cx,
          y: cy,
          width: 180,
          height: 30,
          storeId: 'D' + (this.model.elements.filter(e => e.type === 'dfd_store').length + 1),
          name: 'База данных'
        });
        break;

      case 'idef1x_entity_indep':
        this.model.addElement({
          type: 'idef1x_entity',
          x: cx,
          y: cy,
          width: 190,
          isDep: false,
          name: 'СУЩНОСТЬ',
          pks: ['id (PK)'],
          attrs: ['name', 'created_at']
        });
        break;

      case 'idef1x_entity_dep':
        this.model.addElement({
          type: 'idef1x_entity',
          x: cx,
          y: cy,
          width: 190,
          isDep: true,
          name: 'ЗАВИСИМАЯ_СУЩНОСТЬ',
          pks: ['id (PK)'],
          attrs: ['parent_id (FK)', 'status']
        });
        break;

      case 'idef3_uob':
        this.model.addElement({
          type: 'idef3_uob',
          x: cx,
          y: cy,
          width: 170,
          height: 85,
          uobId: 'J1.' + (this.model.elements.filter(e => e.type === 'idef3_uob').length + 1),
          name: 'Выполнить действие',
          status: 'В планах'
        });
        break;

      case 'idef3_junction':
        this.model.addElement({
          type: 'idef3_junction',
          x: cx,
          y: cy,
          width: 34,
          height: 34,
          juncType: '&'
        });
        break;

      // Standalone Arrow add
      case 'arrow_input':
      case 'arrow_control':
      case 'arrow_output':
      case 'arrow_mechanism': {
        const icom = type.replace('arrow_', '');
        this.model.addConnection({
          icomType: icom,
          label: 'Интерфейсный поток',
          p1: { x: cx - 100, y: cy },
          p2: { x: cx + 100, y: cy }
        });
        break;
      }
    }

    this.canvas.render();
    this.recordHistory();
  }

  // ── Inspector & Properties ──
  initInspector() {
    // Tabs
    document.querySelectorAll('.inspector-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-target');
        this.switchInspectorTab(target);
      });
    });

    // Master Page Form Inputs
    const mpInputs = [
      { id: 'inp-mp-author', prop: 'author' },
      { id: 'inp-mp-project', prop: 'project' },
      { id: 'inp-mp-reader', prop: 'reader' },
      { id: 'inp-mp-node', prop: 'node' },
      { id: 'inp-mp-title', prop: 'title' },
      { id: 'inp-mp-cnumber', prop: 'cnumber' },
      { id: 'inp-mp-context', prop: 'context' },
      { id: 'sel-mp-status', prop: 'status' }
    ];

    mpInputs.forEach(({ id, prop }) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', (e) => {
          this.model.masterPage[prop] = e.target.value;
          this.canvas.render();
        });
      }
    });

    // Element Inspector Inputs
    document.getElementById('inp-el-name').addEventListener('input', (e) => {
      if (this.model.selectedIds.length === 1) {
        const id = this.model.selectedIds[0];
        const el = this.model.getElementById(id);
        const conn = this.model.getConnectionById(id);
        if (el) el.name = e.target.value;
        if (conn) conn.label = e.target.value;
        this.canvas.render();
      }
    });

    document.getElementById('inp-el-code').addEventListener('input', (e) => {
      if (this.model.selectedIds.length === 1) {
        const el = this.model.getElementById(this.model.selectedIds[0]);
        if (el) {
          if (el.nodeCode !== undefined) el.nodeCode = e.target.value;
          if (el.procId !== undefined) el.procId = e.target.value;
          if (el.storeId !== undefined) el.storeId = e.target.value;
          if (el.uobId !== undefined) el.uobId = e.target.value;
          this.canvas.render();
        }
      }
    });

    document.getElementById('sel-conn-type').addEventListener('change', (e) => {
      if (this.model.selectedIds.length === 1) {
        const conn = this.model.getConnectionById(this.model.selectedIds[0]);
        if (conn) {
          conn.icomType = e.target.value;
          this.canvas.render();
          this.recordHistory();
        }
      }
    });

    document.getElementById('btn-del-selected').addEventListener('click', () => this.deleteSelected());
  }

  switchInspectorTab(tabId) {
    document.querySelectorAll('.inspector-tab').forEach(t => t.classList.toggle('active', t.getAttribute('data-target') === tabId));
    document.querySelectorAll('.inspector-content-pane').forEach(p => p.style.display = p.id === tabId ? 'flex' : 'none');
    if (tabId === 'tab-validation') {
      this.runValidation();
    }
  }

  updateInspector() {
    const mp = this.model.masterPage;
    const authorEl = document.getElementById('inp-mp-author');
    if (authorEl) authorEl.value = mp.author || '';
    const projEl = document.getElementById('inp-mp-project');
    if (projEl) projEl.value = mp.project || '';
    const readerEl = document.getElementById('inp-mp-reader');
    if (readerEl) readerEl.value = mp.reader || '';
    const nodeEl = document.getElementById('inp-mp-node');
    if (nodeEl) nodeEl.value = mp.node || '';
    const titleEl = document.getElementById('inp-mp-title');
    if (titleEl) titleEl.value = mp.title || '';
    const cnumEl = document.getElementById('inp-mp-cnumber');
    if (cnumEl) cnumEl.value = mp.cnumber || '';
    const ctxEl = document.getElementById('inp-mp-context');
    if (ctxEl) ctxEl.value = mp.context || '';
    const statEl = document.getElementById('sel-mp-status');
    if (statEl) statEl.value = mp.status || 'work';

    // Selection properties
    const elPropsBox = document.getElementById('selected-props-box');
    const emptyNotice = document.getElementById('no-selection-notice');

    if (this.model.selectedIds.length === 1) {
      elPropsBox.style.display = 'flex';
      emptyNotice.style.display = 'none';

      const id = this.model.selectedIds[0];
      const el = this.model.getElementById(id);
      const conn = this.model.getConnectionById(id);

      const nameInp = document.getElementById('inp-el-name');
      const codeInp = document.getElementById('inp-el-code');
      const connTypeBox = document.getElementById('conn-type-box');

      if (el) {
        nameInp.value = el.name || '';
        codeInp.value = el.nodeCode || el.procId || el.storeId || el.uobId || '';
        codeInp.parentElement.style.display = 'flex';
        connTypeBox.style.display = 'none';
      } else if (conn) {
        nameInp.value = conn.label || '';
        codeInp.parentElement.style.display = 'none';
        connTypeBox.style.display = 'flex';
        document.getElementById('sel-conn-type').value = conn.icomType || 'input';
      }
    } else {
      elPropsBox.style.display = 'none';
      emptyNotice.style.display = 'block';
    }

    this.runValidation();
  }

  // ── Validation Engine UI ──
  runValidation() {
    const listEl = document.getElementById('validation-items-list');
    const badgeEl = document.getElementById('gost-compliance-badge');
    if (!listEl) return;

    const issues = GostValidator.validate(this.model);
    listEl.innerHTML = '';

    const hasErrors = issues.some(i => i.type === 'err');
    const hasWarnings = issues.some(i => i.type === 'warn');

    if (badgeEl) {
      if (hasErrors) {
        badgeEl.className = 'badge badge-danger';
        badgeEl.textContent = '❌ Нарушения ГОСТ';
      } else if (hasWarnings) {
        badgeEl.className = 'badge badge-warning';
        badgeEl.textContent = '⚠️ Есть замечания';
      } else {
        badgeEl.className = 'badge badge-success';
        badgeEl.textContent = '✅ Соответствует ГОСТ';
      }
    }

    issues.forEach(iss => {
      const item = document.createElement('div');
      item.className = `validation-item ${iss.type}`;
      item.innerHTML = `
        <strong>${iss.title}</strong>
        <div>${iss.desc}</div>
        <small>${iss.rule}</small>
      `;
      listEl.appendChild(item);
    });
  }

  // ── Templates ──
  initTemplatesModal() {
    const grid = document.getElementById('templates-grid');
    grid.innerHTML = '';

    Object.values(DIAGRAM_TEMPLATES).forEach(tmpl => {
      const card = document.createElement('div');
      card.className = 'template-card';
      card.innerHTML = `
        <div class="template-card-preview">
          <svg viewBox="0 0 120 70" width="100" height="60">
            <rect x="2" y="2" width="116" height="66" fill="#f8fafc" stroke="#334155" stroke-width="1"/>
            <rect x="35" y="20" width="50" height="28" fill="#e2e8f0" stroke="#000" stroke-width="1"/>
          </svg>
        </div>
        <div class="template-card-info">
          <div class="template-card-title">${tmpl.name}</div>
          <div class="template-card-desc">${tmpl.desc}</div>
        </div>
      `;
      card.addEventListener('click', () => {
        this.loadTemplate(tmpl.type === 'blank_idef0' ? 'blank_idef0' : Object.keys(DIAGRAM_TEMPLATES).find(k => DIAGRAM_TEMPLATES[k] === tmpl));
        this.hideModal('modal-templates');
      });
      grid.appendChild(card);
    });
  }

  loadTemplate(templateKey) {
    const tmpl = DIAGRAM_TEMPLATES[templateKey];
    if (!tmpl) return;

    this.model.fromJSON(JSON.parse(JSON.stringify(tmpl)));
    this.canvas.render();
    this.updateInspector();
    this.recordHistory();
  }

  // ── Floating Zoom / Pan Controls ──
  initFloatingToolbar() {
    document.getElementById('btn-zoom-in').addEventListener('click', () => this.canvas.zoom(1.15));
    document.getElementById('btn-zoom-out').addEventListener('click', () => this.canvas.zoom(0.85));
    document.getElementById('btn-zoom-reset').addEventListener('click', () => {
      this.canvas.scale = 0.85;
      this.canvas.panX = 40;
      this.canvas.panY = 30;
      this.canvas.applyTransform();
    });
  }

  updateZoomIndicator(scale) {
    const el = document.getElementById('zoom-level-text');
    if (el) el.textContent = `${Math.round(scale * 100)}%`;
  }

  // ── Keyboard Shortcuts ──
  initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Don't trigger if typing in input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        this.deleteSelected();
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        this.undo();
      } else if ((e.key === 'y' && (e.ctrlKey || e.metaKey)) || (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey)) {
        e.preventDefault();
        this.redo();
      } else if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        DiagramExporter.exportJson(this.model);
      } else if (e.key === 'Escape') {
        this.model.selectedIds = [];
        this.canvas.render();
        this.updateInspector();
        this.hideModal('modal-templates');
      }
    });
  }

  deleteSelected() {
    if (this.model.selectedIds.length > 0) {
      this.model.selectedIds.forEach(id => {
        this.model.removeElement(id);
        this.model.removeConnection(id);
      });
      this.model.selectedIds = [];
      this.canvas.render();
      this.updateInspector();
      this.recordHistory();
    }
  }

  // ── Undo / Redo ──
  recordHistory() {
    const state = JSON.stringify(this.model.toJSON());
    // Truncate redo states
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(state);
    this.historyIndex = this.history.length - 1;
    // Limit history stack size
    if (this.history.length > 40) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.model.fromJSON(JSON.parse(this.history[this.historyIndex]));
      this.canvas.render();
      this.updateInspector();
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.model.fromJSON(JSON.parse(this.history[this.historyIndex]));
      this.canvas.render();
      this.updateInspector();
    }
  }

  // ── Modals ──
  showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
  }

  hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
  }
}

// Auto-boot on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new IdefApp();
});
