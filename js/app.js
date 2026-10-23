/**
 * IDEF Builder - Main Application Controller
 * Coordinates UI, Palette, Canvas, Inspector, Templates, and Undo/Redo
 */

class IdefApp {
  constructor() {
    // Invalidate stale LocalStorage cache for DFD and Samarov Studio
    try {
      // Clear legacy Samarov & Beeline specific cases from LocalStorage
      ['fig1_idef0_context', 'fig2_idef0_decomp', 'fig3_dfd_level1', 'fig4_idef1x', 'fig5_idef3'].forEach(id => {
        const raw = localStorage.getItem('idef_diag_' + id);
        if (raw && (raw.includes('Samarov') || raw.includes('смарт-бриф') || raw.includes('Beeline') || raw.includes('Geopify') || raw.includes('Бригадир'))) {
          localStorage.removeItem('idef_diag_' + id);
        }
      });
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith('idef_diag_')) {
          if (k.includes('fig6') || k.includes('fig7') || k.includes('fig8') || k.includes('fig9') || k.includes('fig10') || k.includes('fig11') || k.includes('fig12') || k.includes('fig4_dfd') || k.includes('fig5_dfd')) {
            localStorage.removeItem(k);
          }
        }
      }
    } catch(e) {}
    this.model = new DiagramModel();
    this.canvasContainer = document.getElementById('canvas-container');
    this.canvas = new CanvasController(this.canvasContainer, this.model, this);

    // History for Undo/Redo
    this.history = [];
    this.historyIndex = -1;

    this.currentDiagramId = null;

    this.initUI();

    // Auto-restore last active diagram or fallback to fig1_idef0_context
    const lastActive = localStorage.getItem('idef_active_diagram_id') || 'fig1_idef0_context';
    this.loadDiagram(lastActive);

    // Auto-save on page close / refresh
    window.addEventListener('beforeunload', () => {
      this.saveCurrentDiagramToStorage();
    });
  }

  initUI() {
    this.initNavbar();
    this.initPalette();
    this.initInspector();
    this.initTemplatesModal();
    this.initKeyboardShortcuts();
    this.initFloatingToolbar();
    this.initCanvasSizeControls();
    this.initCreatePageModal();
  }

  // ── Navbar Actions ──
  initNavbar() {
    document.getElementById('btn-templates').addEventListener('click', () => {
      this.initTemplatesModal();
      this.showModal('modal-templates');
    });

    document.getElementById('btn-new').addEventListener('click', () => {
      this.showCreatePageModal();
    });

    const btnModalCreate = document.getElementById('btn-modal-create-page');
    if (btnModalCreate) {
      btnModalCreate.addEventListener('click', () => this.showCreatePageModal());
    }

    document.getElementById('btn-export-svg').addEventListener('click', () => DiagramExporter.exportSvg(this.model));
    document.getElementById('btn-export-png').addEventListener('click', () => DiagramExporter.exportPng(this.model, 2.0));
    document.getElementById('btn-save-json').addEventListener('click', () => DiagramExporter.exportJson(this.model));
    document.getElementById('btn-print').addEventListener('click', () => window.print());

    // File Open
    const fileInput = document.getElementById('input-file-json');
    if (fileInput) {
      document.getElementById('btn-open-json')?.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          this.openJsonFile(file);
        }
        fileInput.value = '';
      });
    }

    // Window Drag & Drop .json project files
    window.addEventListener('dragover', (e) => {
      if (e.dataTransfer && e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }
    });

    window.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.name.toLowerCase().endsWith('.json') || file.type === 'application/json') {
          e.preventDefault();
          this.openJsonFile(file);
        }
      }
    });

    // Undo / Redo
    document.getElementById('btn-undo').addEventListener('click', () => this.undo());
    document.getElementById('btn-redo').addEventListener('click', () => this.redo());

    // Check GOST button
    document.getElementById('btn-check-gost')?.addEventListener('click', () => {
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

      case 'idef0_purpose':
        this.model.addElement({
          type: 'idef0_purpose',
          x: cx,
          y: cy,
          width: 260,
          height: 70,
          name: 'Моделирование процесса с целью\nвыявления узких мест и автоматизации'
        });
        break;

      case 'idef0_viewpoint':
        this.model.addElement({
          type: 'idef0_viewpoint',
          x: cx,
          y: cy,
          width: 260,
          height: 70,
          name: 'Директор студии / Ведущий архитектор'
        });
        break;

      case 'dfd_entity':
        this.model.addElement({
          type: 'dfd_entity',
          x: cx,
          y: cy,
          width: 140,
          height: 60,
          name: 'Внешняя сущность'
        });
        break;

      case 'dfd_process':
        this.model.addElement({
          type: 'dfd_process',
          x: cx,
          y: cy,
          width: 160,
          height: 95,
          procId: 'P' + (this.model.elements.filter(e => e.type === 'dfd_process').length + 1),
          name: 'Проверить входные данные\nи доступность ресурсов'
        });
        break;

      case 'dfd_store':
        this.model.addElement({
          type: 'dfd_store',
          x: cx,
          y: cy,
          width: 150,
          height: 55,
          storeId: 'D' + (this.model.elements.filter(e => e.type === 'dfd_store').length + 1),
          name: 'Накопитель данных'
        });
        break;

      case 'idef1x_entity_indep':
        this.model.addElement({
          type: 'idef1x_entity',
          x: cx,
          y: cy,
          width: 220,
          height: 95,
          isDep: false,
          name: 'ACT_TEMPLATES',
          pks: ['PK template_id'],
          attrs: ['template_name, legal_basis_63fz, form_code']
        });
        break;

      case 'idef1x_entity_dep':
        this.model.addElement({
          type: 'idef1x_entity',
          x: cx,
          y: cy,
          width: 220,
          height: 95,
          isDep: true,
          name: 'ACCEPTANCE_ACTS',
          pks: ['PK act_id'],
          attrs: ['FK stage_id, FK template_id', 'act_number, act_date, status']
        });
        break;

      case 'arrow_idef1x_ident':
        this.model.addConnection({
          icomType: 'rel_ident',
          cardinality: 'dot',
          label: 'Связь',
          p1: { x: cx - 100, y: cy },
          p2: { x: cx + 100, y: cy }
        });
        break;

      case 'arrow_idef1x_non':
        this.model.addConnection({
          icomType: 'rel_non',
          cardinality: 'dot',
          label: 'Связь',
          p1: { x: cx - 100, y: cy },
          p2: { x: cx + 100, y: cy }
        });
        break;

      case 'arrow_idef1x_opt':
        this.model.addConnection({
          icomType: 'rel_opt',
          cardinality: 'dot',
          hasDiamond: true,
          label: 'Связь',
          p1: { x: cx - 100, y: cy },
          p2: { x: cx + 100, y: cy }
        });
        break;

      case 'arrow_idef1x_z':
        this.model.addConnection({
          icomType: 'rel_ident',
          cardinality: 'Z',
          label: 'Связь 0..1',
          p1: { x: cx - 100, y: cy },
          p2: { x: cx + 100, y: cy }
        });
        break;

      case 'idef3_uob': {
        const count = this.model.elements.filter(e => e.type === 'idef3_uob').length + 1;
        this.model.addElement({
          type: 'idef3_uob',
          x: cx,
          y: cy,
          width: 170,
          height: 70,
          uobId: 'UOB' + count,
          name: 'Новое действие UOB'
        });
        break;
      }

      case 'idef3_junction':
        this.model.addElement({
          type: 'idef3_junction',
          x: cx,
          y: cy,
          width: 28,
          height: 28,
          juncType: 'X'
        });
        break;

      case 'arrow_idef3_precedence':
        this.model.addConnection({
          icomType: 'precedence',
          label: '',
          p1: { x: cx - 80, y: cy },
          p2: { x: cx + 80, y: cy }
        });
        break;

      // Standalone Arrow add
      case 'arrow_input':
      case 'arrow_control':
      case 'arrow_output':
      case 'arrow_mechanism':
      case 'arrow_dataflow': {
        const icom = type === 'arrow_dataflow' ? 'dataflow' : type.replace('arrow_', '');
        this.model.addConnection({
          icomType: icom,
          label: icom === 'dataflow' ? 'Поток данных' : 'Интерфейсный поток',
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
    // Inspector collapse / expand controls
    const inspectorEl = document.querySelector('.inspector');
    const btnCollapse = document.getElementById('btn-collapse-inspector');
    const btnExpand = document.getElementById('btn-expand-inspector');
    const btnToggleNav = document.getElementById('btn-toggle-inspector-nav');

    const setInspectorCollapsed = (collapsed) => {
      if (!inspectorEl) return;
      if (collapsed) {
        inspectorEl.classList.add('collapsed');
        if (btnExpand) btnExpand.style.display = 'flex';
        if (btnToggleNav) btnToggleNav.classList.remove('active');
        localStorage.setItem('idef_inspector_collapsed', 'true');
      } else {
        inspectorEl.classList.remove('collapsed');
        if (btnExpand) btnExpand.style.display = 'none';
        if (btnToggleNav) btnToggleNav.classList.add('active');
        localStorage.setItem('idef_inspector_collapsed', 'false');
      }
    };

    btnCollapse?.addEventListener('click', () => setInspectorCollapsed(true));
    btnExpand?.addEventListener('click', () => setInspectorCollapsed(false));
    btnToggleNav?.addEventListener('click', () => {
      const isCollapsed = inspectorEl.classList.contains('collapsed');
      setInspectorCollapsed(!isCollapsed);
    });

    if (localStorage.getItem('idef_inspector_collapsed') === 'true') {
      setInspectorCollapsed(true);
    } else {
      setInspectorCollapsed(false);
    }

    // Tabs
    document.querySelectorAll('.inspector-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-target');
        this.switchInspectorTab(target);
      });
    });

    // Initialize Dynamic Master Page (Штамп ГОСТ) Inspector tab
    this.renderMasterStampTab(true);

    // Element Inspector Inputs
    document.getElementById('inp-el-name').addEventListener('input', (e) => {
      if (this.model.selectedIds.length === 1) {
        const id = this.model.selectedIds[0];
        const el = this.model.getElementById(id);
        const conn = this.model.getConnectionById(id);
        if (el) el.name = e.target.value;
        if (conn) conn.label = e.target.value;
        this.canvas.render();
        this.saveCurrentDiagramToStorage();
      }
    });
    document.getElementById('inp-el-name').addEventListener('change', () => {
      this.recordHistory();
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
          this.saveCurrentDiagramToStorage();
        }
      }
    });
    document.getElementById('inp-el-code').addEventListener('change', () => {
      this.recordHistory();
    });

    const handleSizeInput = () => {
      if (this.model.selectedIds.length === 1) {
        const el = this.model.getElementById(this.model.selectedIds[0]);
        if (el) {
          const wVal = parseInt(document.getElementById('inp-el-width')?.value);
          const hVal = parseInt(document.getElementById('inp-el-height')?.value);
          if (!isNaN(wVal) && wVal >= 20) el.width = wVal;
          if (!isNaN(hVal) && hVal >= 20) el.height = hVal;
          this.canvas.render();
          this.saveCurrentDiagramToStorage();
        }
      }
    };

    document.getElementById('inp-el-width')?.addEventListener('input', handleSizeInput);
    document.getElementById('inp-el-height')?.addEventListener('input', handleSizeInput);
    document.getElementById('inp-el-width')?.addEventListener('change', () => this.recordHistory());
    document.getElementById('inp-el-height')?.addEventListener('change', () => this.recordHistory());

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

    // IDEF1X Entity Inspector Listeners
    document.getElementById('sel-idef1x-type')?.addEventListener('change', (e) => {
      if (this.model.selectedIds.length === 1) {
        const el = this.model.getElementById(this.model.selectedIds[0]);
        if (el && el.type === 'idef1x_entity') {
          el.isDep = e.target.value === 'dep';
          this.canvas.render();
          this.recordHistory();
        }
      }
    });

    document.getElementById('inp-idef1x-pks')?.addEventListener('input', (e) => {
      if (this.model.selectedIds.length === 1) {
        const el = this.model.getElementById(this.model.selectedIds[0]);
        if (el && el.type === 'idef1x_entity') {
          el.pks = e.target.value.split('\n').filter(l => l.trim().length > 0);
          this.canvas.render();
          this.saveCurrentDiagramToStorage();
        }
      }
    });
    document.getElementById('inp-idef1x-pks')?.addEventListener('change', () => this.recordHistory());

    document.getElementById('inp-idef1x-attrs')?.addEventListener('input', (e) => {
      if (this.model.selectedIds.length === 1) {
        const el = this.model.getElementById(this.model.selectedIds[0]);
        if (el && el.type === 'idef1x_entity') {
          el.attrs = e.target.value.split('\n').filter(l => l.trim().length > 0);
          this.canvas.render();
          this.saveCurrentDiagramToStorage();
        }
      }
    });
    document.getElementById('inp-idef1x-attrs')?.addEventListener('change', () => this.recordHistory());

    // IDEF1X Cardinality Listener
    document.getElementById('sel-idef1x-cardinality')?.addEventListener('change', (e) => {
      if (this.model.selectedIds.length === 1) {
        const conn = this.model.getConnectionById(this.model.selectedIds[0]);
        if (conn) {
          conn.cardinality = e.target.value;
          this.canvas.render();
          this.recordHistory();
        }
      }
    });

    document.getElementById('btn-reverse-conn')?.addEventListener('click', () => {
      if (this.model.selectedIds.length === 1) {
        const connId = this.model.selectedIds[0];
        if (this.model.getConnectionById(connId)) {
          this.canvas.reverseConnection(connId);
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
    this.updateCanvasSizeInputs();

    // Dynamic Master Page & Stamp Tab
    this.renderMasterStampTab();

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

      const sizeBox = document.getElementById('el-size-box');
      const wInp = document.getElementById('inp-el-width');
      const hInp = document.getElementById('inp-el-height');

      const idef1xPropsBox = document.getElementById('idef1x-entity-props');
      const idef1xCardBox = document.getElementById('idef1x-cardinality-box');
      const codeGroup = document.getElementById('code-prop-group') || codeInp.parentElement;

      if (el) {
        nameInp.value = el.name || '';
        const isNote = el.type === 'idef0_purpose' || el.type === 'idef0_viewpoint';
        const isIdef1x = el.type === 'idef1x_entity';

        if (isNote || isIdef1x) {
          codeGroup.style.display = 'none';
        } else {
          codeInp.value = el.nodeCode || el.procId || el.storeId || el.uobId || '';
          codeGroup.style.display = 'flex';
        }

        if (idef1xPropsBox) {
          if (isIdef1x) {
            idef1xPropsBox.style.display = 'flex';
            document.getElementById('sel-idef1x-type').value = el.isDep ? 'dep' : 'indep';
            document.getElementById('inp-idef1x-pks').value = (el.pks || []).join('\n');
            document.getElementById('inp-idef1x-attrs').value = (el.attrs || []).join('\n');
          } else {
            idef1xPropsBox.style.display = 'none';
          }
        }

        if (sizeBox && wInp && hInp) {
          sizeBox.style.display = 'flex';
          wInp.value = Math.round(el.width || 100);
          hInp.value = Math.round(el.height || 60);
        }
        connTypeBox.style.display = 'none';
      } else if (conn) {
        nameInp.value = conn.label || '';
        codeGroup.style.display = 'none';
        if (idef1xPropsBox) idef1xPropsBox.style.display = 'none';
        const idef3JuncBox = document.getElementById('idef3-junction-props');
        if (idef3JuncBox) idef3JuncBox.style.display = 'none';
        if (sizeBox) sizeBox.style.display = 'none';
        connTypeBox.style.display = 'flex';
        document.getElementById('sel-conn-type').value = conn.icomType || 'input';

        const isIdef1xConn = conn.icomType === 'rel_ident' || conn.icomType === 'rel_non' || conn.icomType === 'rel_opt';
        if (idef1xCardBox) {
          idef1xCardBox.style.display = isIdef1xConn ? 'flex' : 'none';
          if (isIdef1xConn) {
            document.getElementById('sel-idef1x-cardinality').value = conn.cardinality || 'dot';
          }
        }
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

  // ── Local Storage & Persistence Engine ──
  getStorageKey(diagramId) {
    return 'idef_diag_' + diagramId;
  }

  getCustomPagesList() {
    try {
      const data = localStorage.getItem('idef_custom_pages');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveCustomPagesList(list) {
    try {
      localStorage.setItem('idef_custom_pages', JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save custom pages list:', e);
    }
  }

  saveCustomPageMeta(id, name, type) {
    const list = this.getCustomPagesList();
    const existing = list.find(p => p.id === id);
    if (existing) {
      existing.name = name;
      existing.type = type;
      existing.updatedAt = Date.now();
    } else {
      list.push({ id, name, type, createdAt: Date.now(), updatedAt: Date.now() });
    }
    this.saveCustomPagesList(list);
  }

  isDiagramLocallyModified(diagramId) {
    return localStorage.getItem(this.getStorageKey(diagramId)) !== null;
  }

  saveCurrentDiagramToStorage() {
    if (!this.currentDiagramId) return;
    try {
      const json = this.model.toJSON();
      localStorage.setItem(this.getStorageKey(this.currentDiagramId), JSON.stringify(json));
      localStorage.setItem('idef_active_diagram_id', this.currentDiagramId);

      // Keep custom page metadata in sync
      const customPages = this.getCustomPagesList();
      const page = customPages.find(p => p.id === this.currentDiagramId);
      if (page) {
        page.name = this.model.masterPage.title || page.name;
        page.updatedAt = Date.now();
        this.saveCustomPagesList(customPages);
      }

      this.updateDiagramHeaderBadge();
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  loadDiagram(diagramId) {
    // 1. Save currently open diagram before switching
    if (this.currentDiagramId && this.currentDiagramId !== diagramId) {
      this.saveCurrentDiagramToStorage();
    }

    // 2. Try loading from LocalStorage
    const savedJson = localStorage.getItem(this.getStorageKey(diagramId));
    let data = null;

    if (savedJson) {
      try {
        data = JSON.parse(savedJson);
      } catch (e) {
        console.error('Error parsing saved diagram:', e);
      }
    }

    // 3. Fallback to default template if not in LocalStorage
    if (!data) {
      const tmpl = DIAGRAM_TEMPLATES[diagramId] || Object.values(DIAGRAM_TEMPLATES).find(t => t.id === diagramId || t.type === diagramId);
      if (tmpl) {
        data = JSON.parse(JSON.stringify(tmpl));
      } else {
        data = JSON.parse(JSON.stringify(DIAGRAM_TEMPLATES.blank_idef0 || {}));
      }
    }

    this.currentDiagramId = diagramId;
    localStorage.setItem('idef_active_diagram_id', diagramId);
    // If IDEF0 diagram was corrupted with DFD, restore clean template
    if (diagramId.startsWith('fig1') || diagramId.startsWith('fig2') || diagramId.includes('idef0')) {
      if (data && (data.type === 'dfd' || (data.masterPage && data.masterPage.dfdSubtitle))) {
        const tmpl = DIAGRAM_TEMPLATES[diagramId];
        if (tmpl) data = JSON.parse(JSON.stringify(tmpl));
        localStorage.removeItem(this.getStorageKey(diagramId));
      }
    }

    // If DFD diagram has old Samarov content, upgrade to new Beeline Business DFD
    if (diagramId.includes('dfd') || (data && data.type === 'dfd')) {
      if (data) {
        data.type = 'dfd';
        const raw = JSON.stringify(data);
        if (raw.includes('Samarov') || raw.includes('смарт-бриф') || !data.masterPage || !data.masterPage.dfdSubtitle) {
          const tmpl = DIAGRAM_TEMPLATES[diagramId] || DIAGRAM_TEMPLATES.fig3_dfd_level1;
          if (tmpl) {
            data = JSON.parse(JSON.stringify(tmpl));
            localStorage.setItem(this.getStorageKey(diagramId), JSON.stringify(data));
          }
        }
      }
    }

    this.model.fromJSON(data);
    this.history = [];
    this.historyIndex = -1;
    this.canvas.render();
    this.updateInspector();
    this.recordHistory();
    this.updateDiagramHeaderBadge();
  }

  openJsonFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!data || typeof data !== 'object') {
          throw new Error('Файл не содержит корректные данные схемы');
        }

        // 1. Save currently open diagram before switching
        if (this.currentDiagramId) {
          this.saveCurrentDiagramToStorage();
        }

        // 2. Identify diagram ID and store in localStorage
        const diagId = data.id || ('imported_' + Date.now());
        data.id = diagId;
        this.currentDiagramId = diagId;
        localStorage.setItem('idef_active_diagram_id', diagId);
        localStorage.setItem(this.getStorageKey(diagId), JSON.stringify(data));

        // 3. Register in custom pages list if not a standard template
        const isBuiltin = (typeof DIAGRAM_TEMPLATES !== 'undefined') && Boolean(DIAGRAM_TEMPLATES[diagId]);
        if (!isBuiltin) {
          const title = (data.masterPage && data.masterPage.title) || file.name.replace(/\.json$/i, '') || 'Импортированная схема';
          const type = data.type || 'idef0';
          this.saveCustomPageMeta(diagId, title, type);
        }

        // 4. Load into active diagram model
        this.model.fromJSON(data);
        this.history = [];
        this.historyIndex = -1;

        // 5. Update canvas and inspector
        this.canvas.render();
        this.updateInspector();
        this.updateCanvasSizeInputs();
        this.recordHistory();
        this.updateDiagramHeaderBadge();
        if (typeof this.initTemplatesModal === 'function') {
          this.initTemplatesModal();
        }

        // 6. Visual confirmation in status badge
        const autoBadge = document.getElementById('autosave-status');
        if (autoBadge) {
          const origHTML = autoBadge.innerHTML;
          autoBadge.innerHTML = '<span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#3b82f6;"></span> Загружено';
          setTimeout(() => { autoBadge.innerHTML = origHTML; }, 3000);
        }
      } catch (err) {
        console.error('Ошибка импорта JSON:', err);
        alert('Ошибка чтения файла проекта: ' + err.message);
      }
    };
    reader.onerror = () => {
      alert('Ошибка при чтении файла');
    };
    reader.readAsText(file);
  }

  loadTemplate(templateKey) {
    this.loadDiagram(templateKey);
  }

  resetTemplateToOriginal(diagramId) {
    if (!confirm('Сбросить этот шаблон к исходному состоянию по ГОСТ? Все ваши локальные изменения в нем будут удалены.')) {
      return;
    }
    localStorage.removeItem(this.getStorageKey(diagramId));
    if (this.currentDiagramId === diagramId) {
      const tmpl = DIAGRAM_TEMPLATES[diagramId] || Object.values(DIAGRAM_TEMPLATES).find(t => t.id === diagramId || t.type === diagramId);
      if (tmpl) {
        this.model.fromJSON(JSON.parse(JSON.stringify(tmpl)));
        this.history = [];
        this.historyIndex = -1;
        this.canvas.render();
        this.updateInspector();
        this.recordHistory();
        this.updateDiagramHeaderBadge();
      }
    }
    this.initTemplatesModal();
  }

  deleteCustomPage(pageId) {
    if (!confirm('Удалить эту страницу? Действие нельзя отменить.')) {
      return;
    }
    localStorage.removeItem(this.getStorageKey(pageId));
    const list = this.getCustomPagesList().filter(p => p.id !== pageId);
    this.saveCustomPagesList(list);

    if (this.currentDiagramId === pageId) {
      this.loadDiagram('fig1_idef0_context');
    }
    this.initTemplatesModal();
  }

  createNewPage() {
    this.showCreatePageModal();
  }

  updateDiagramHeaderBadge() {
    const titleEl = document.getElementById('active-diagram-title');
    if (!titleEl) return;

    let title = this.model.masterPage.title;
    if (!title) {
      const tmpl = DIAGRAM_TEMPLATES[this.currentDiagramId] || Object.values(DIAGRAM_TEMPLATES).find(t => t.id === this.currentDiagramId);
      if (tmpl) title = tmpl.name;
    }
    if (!title) title = 'Диаграмма';
    titleEl.textContent = title;
    titleEl.title = title;
  }

  // ── Templates & Pages Modal ──
  initTemplatesModal() {
    const grid = document.getElementById('templates-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const customPages = this.getCustomPagesList();

    // 1. Custom created pages section (if any)
    if (customPages.length > 0) {
      const secHeader = document.createElement('div');
      secHeader.className = 'templates-section-header';
      secHeader.innerHTML = `<span>Мои созданные страницы (${customPages.length})</span>`;
      grid.appendChild(secHeader);

      const customGrid = document.createElement('div');
      customGrid.className = 'templates-grid';
      customGrid.style.marginBottom = '24px';

      customPages.forEach(page => {
        const card = document.createElement('div');
        const isActive = this.currentDiagramId === page.id;
        card.className = `template-card ${isActive ? 'active' : ''}`;

        const updatedStr = page.updatedAt ? new Date(page.updatedAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';

        card.innerHTML = `
          <div class="template-card-preview">
            <svg viewBox="0 0 120 70" width="100" height="60">
              <rect x="2" y="2" width="116" height="66" fill="#f8fafc" stroke="#334155" stroke-width="1"/>
              <rect x="35" y="20" width="50" height="28" fill="#e2e8f0" stroke="#000" stroke-width="1"/>
              <text x="60" y="37" font-size="9" font-weight="bold" fill="#334155" text-anchor="middle">ГОСТ</text>
            </svg>
          </div>
          <div class="template-card-info">
            <div class="template-card-header-row">
              <span class="template-badge-modified">Пользовательская</span>
              ${isActive ? '<span class="template-badge-active">Открыта</span>' : ''}
            </div>
            <div class="template-card-title">${page.name || 'Новая страница'}</div>
            <div class="template-card-desc" style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
              <span>Обновлено: ${updatedStr}</span>
              <button class="btn btn-xs btn-del-page" style="color:#ef4444;" title="Удалить страницу">🗑️</button>
            </div>
          </div>
        `;

        const delBtn = card.querySelector('.btn-del-page');
        if (delBtn) {
          delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteCustomPage(page.id);
          });
        }

        card.addEventListener('click', () => {
          this.loadDiagram(page.id);
          this.hideModal('modal-templates');
        });

        customGrid.appendChild(card);
      });

      grid.appendChild(customGrid);
    }

    // 2. Built-in GOST Templates section
    const tplHeader = document.createElement('div');
    tplHeader.className = 'templates-section-header';
    tplHeader.innerHTML = `<span>Базовые шаблоны и примеры заполнения методологий (1–5)</span>`;
    grid.appendChild(tplHeader);

    const tplGrid = document.createElement('div');
    tplGrid.className = 'templates-grid';

    Object.entries(DIAGRAM_TEMPLATES).forEach(([tmplKey, tmpl]) => {
      const diagId = tmpl.id || tmplKey;
      const isModified = this.isDiagramLocallyModified(diagId);
      const isActive = this.currentDiagramId === diagId;

      const card = document.createElement('div');
      card.className = `template-card ${isActive ? 'active' : ''}`;

      card.innerHTML = `
        <div class="template-card-preview">
          <svg viewBox="0 0 120 70" width="100" height="60">
            <rect x="2" y="2" width="116" height="66" fill="#f8fafc" stroke="#334155" stroke-width="1"/>
            <rect x="35" y="20" width="50" height="28" fill="#e2e8f0" stroke="#000" stroke-width="1"/>
            <line x1="10" y1="34" x2="35" y2="34" stroke="#1e40af" stroke-width="1.5"/>
            <line x1="85" y1="34" x2="110" y2="34" stroke="#1e293b" stroke-width="1.5"/>
          </svg>
        </div>
        <div class="template-card-info">
          <div class="template-card-header-row">
            ${isModified ? '<span class="template-badge-modified" title="Есть сохраненные локальные правки">Изменено (локально)</span>' : '<span style="font-size:10px; color:var(--text-muted);">ГОСТ Р 50.1.028</span>'}
            ${isActive ? '<span class="template-badge-active">Открыт</span>' : ''}
          </div>
          <div class="template-card-title">${tmpl.name}</div>
          <div class="template-card-desc">${tmpl.desc || ''}</div>
          ${isModified ? `
            <div style="margin-top:6px; display:flex; justify-content:flex-end;">
              <button class="btn btn-xs btn-reset-tmpl" title="Сбросить все локальные правки к оригиналу ГОСТ">Сбросить к оригиналу</button>
            </div>
          ` : ''}
        </div>
      `;

      if (isModified) {
        const resetBtn = card.querySelector('.btn-reset-tmpl');
        if (resetBtn) {
          resetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.resetTemplateToOriginal(diagId);
          });
        }
      }

      card.addEventListener('click', () => {
        this.loadDiagram(diagId);
        this.hideModal('modal-templates');
      });

      tplGrid.appendChild(card);
    });

    grid.appendChild(tplGrid);
  }

  // ── Floating Zoom / Pan Controls ──
  initFloatingToolbar() {
    const panBtn = document.getElementById('btn-pan-mode');
    if (panBtn) {
      panBtn.addEventListener('click', () => {
        const active = !this.canvas.isPanModeActive;
        this.canvas.setPanMode(active);
        panBtn.classList.toggle('active', active);
      });
    }

    document.getElementById('btn-zoom-in').addEventListener('click', () => this.canvas.zoom(1.15));
    document.getElementById('btn-zoom-out').addEventListener('click', () => this.canvas.zoom(0.85));
    document.getElementById('btn-zoom-reset').addEventListener('click', () => {
      this.canvas.resetZoom();
    });

    const fitBtn = document.getElementById('btn-zoom-fit');
    if (fitBtn) {
      fitBtn.addEventListener('click', () => {
        this.canvas.fitToScreen();
      });
    }
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
      } else if (e.key === 'h' || e.key === 'H' || e.key === 'р' || e.key === 'Р') {
        const panBtn = document.getElementById('btn-pan-mode');
        const active = !this.canvas.isPanModeActive;
        this.canvas.setPanMode(active);
        if (panBtn) panBtn.classList.toggle('active', active);
      } else if (e.key === 'r' || e.key === 'R' || e.key === 'к' || e.key === 'К') {
        if (this.model.selectedIds.length === 1) {
          const connId = this.model.selectedIds[0];
          if (this.model.getConnectionById(connId)) {
            this.canvas.reverseConnection(connId);
          }
        }
      } else if (e.key === 'v' || e.key === 'V' || e.key === 'м' || e.key === 'М') {
        const panBtn = document.getElementById('btn-pan-mode');
        this.canvas.setPanMode(false);
        if (panBtn) panBtn.classList.remove('active');
      } else if (e.key === 'Escape') {
        const panBtn = document.getElementById('btn-pan-mode');
        if (this.canvas.isPanModeActive) {
          this.canvas.setPanMode(false);
          if (panBtn) panBtn.classList.remove('active');
        }
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

    // Auto-save changes to LocalStorage on every action
    this.saveCurrentDiagramToStorage();
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.model.fromJSON(JSON.parse(this.history[this.historyIndex]));
      this.canvas.render();
      this.updateInspector();
      this.saveCurrentDiagramToStorage();
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.model.fromJSON(JSON.parse(this.history[this.historyIndex]));
      this.canvas.render();
      this.updateInspector();
      this.saveCurrentDiagramToStorage();
    }
  }

  // ── Modals ──
  showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
  }

  hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
  }

  // ── Create Page Dialog & Diagram Type Logic ──
  initCreatePageModal() {
    const typeSel = document.getElementById('sel-new-page-type');
    const frameSel = document.getElementById('sel-new-page-frame');
    const sizePresetSel = document.getElementById('sel-new-page-size-preset');
    const wInp = document.getElementById('inp-new-page-w');
    const hInp = document.getElementById('inp-new-page-h');
    const hintEl = document.getElementById('new-page-frame-hint');

    if (typeSel) {
      typeSel.addEventListener('change', () => {
        const val = typeSel.value;
        if (val === 'dfd') {
          if (frameSel) frameSel.value = 'dfd';
          if (hintEl) hintEl.textContent = 'Для DFD будет создана шапка процессов/накопителей и футер с описанием блоков.';
        } else if (val === 'idef1x') {
          if (frameSel) frameSel.value = 'idef1x';
          if (hintEl) hintEl.textContent = 'Для IDEF1X будет создана шапка с легендой связей (идентифицирующая, Z, P, ромб) и разделитель.';
        } else if (val === 'idef3') {
          if (frameSel) frameSel.value = 'idef3';
          if (hintEl) hintEl.textContent = 'Для IDEF3 будет создана шапка UOB/Junctions, примечание и нижний колонтитул.';
        } else {
          if (frameSel) frameSel.value = 'gost';
          if (hintEl) hintEl.textContent = 'Для IDEF0 будет создан официальный штамп ГОСТ Р 50.1.028-2001.';
        }
      });
    }

    if (frameSel) {
      frameSel.addEventListener('change', () => {
        const val = frameSel.value;
        if (val === 'dfd') {
          if (hintEl) hintEl.textContent = 'Специальная шапка потоков данных и футер с описанием блоков.';
        } else if (val === 'none') {
          if (hintEl) hintEl.textContent = 'Чистый холст без рамки и штампа.';
        } else {
          if (hintEl) hintEl.textContent = 'Официальный штамп по ГОСТ Р 50.1.028-2001.';
        }
      });
    }

    if (sizePresetSel) {
      sizePresetSel.addEventListener('change', () => {
        const val = sizePresetSel.value;
        if (val !== 'custom') {
          const [pw, ph] = val.split('x').map(Number);
          if (wInp) wInp.value = pw;
          if (hInp) hInp.value = ph;
        }
      });
    }

    const btnConfirm = document.getElementById('btn-confirm-create-page');
    if (btnConfirm) {
      btnConfirm.addEventListener('click', () => this.confirmCreatePage());
    }
  }

  showCreatePageModal() {
    this.hideModal('modal-templates');
    const titleInp = document.getElementById('inp-new-page-title');
    if (titleInp) titleInp.value = 'Новая диаграмма';
    const typeSel = document.getElementById('sel-new-page-type');
    if (typeSel) typeSel.value = 'idef0_context';
    const frameSel = document.getElementById('sel-new-page-frame');
    if (frameSel) frameSel.value = 'gost';
    const presetSel = document.getElementById('sel-new-page-size-preset');
    if (presetSel) presetSel.value = '1200x820';
    const wInp = document.getElementById('inp-new-page-w');
    if (wInp) wInp.value = 1200;
    const hInp = document.getElementById('inp-new-page-h');
    if (hInp) hInp.value = 820;

    const hintEl = document.getElementById('new-page-frame-hint');
    if (hintEl) hintEl.textContent = 'Для IDEF0 будет создан стандартный штамп ГОСТ Р 50.1.028-2001.';

    this.showModal('modal-create-page');
    setTimeout(() => { if (titleInp) titleInp.focus(); }, 80);
  }

  confirmCreatePage() {
    const title = (document.getElementById('inp-new-page-title')?.value || 'Новая диаграмма').trim();
    const type = document.getElementById('sel-new-page-type')?.value || 'idef0_context';
    const frameStyle = document.getElementById('sel-new-page-frame')?.value || 'gost';
    const width = parseInt(document.getElementById('inp-new-page-w')?.value, 10) || 1200;
    const height = parseInt(document.getElementById('inp-new-page-h')?.value, 10) || 820;

    const pageId = 'page_' + Date.now() + '_' + type;
    this.saveCurrentDiagramToStorage();

    const newDiagram = {
      id: pageId,
      name: title,
      type: type,
      width: width,
      height: height,
      masterPage: {
        ...DiagramModel.getDefaultMasterPage(),
        title: title,
        frameStyle: frameStyle
      },
      elements: [],
      connections: []
    };

    if (frameStyle === 'dfd' || type === 'dfd') {
      newDiagram.type = 'dfd';
      newDiagram.masterPage.frameStyle = 'dfd';
      newDiagram.masterPage.dfdSubtitle = 'Процессы Р1–Р4, внешние стороны, потоки данных и накопители D1–D5';
      newDiagram.masterPage.dfdLegend = 'Прямоугольник — внешняя сущность или накопитель; скруглённый блок — процесс. Стрелки обозначают передачу данных.';
      newDiagram.masterPage.dfdNote = '';
      newDiagram.masterPage.dfdFooterMeta = title + ' | ' + new Date().toLocaleDateString('ru-RU');
    } else if (frameStyle === 'idef1x' || type === 'idef1x') {
      newDiagram.type = 'idef1x';
      newDiagram.masterPage.frameStyle = 'idef1x';
      newDiagram.masterPage.dfdSubtitle = 'IDEF1X: сплошная — идентифицирующая (зависимая сущность со скруглённым блоком); штриховая — неидентифицирующая; точка у потомка — 0..*, Z — 0..1, P — 1..* (Z/P заменяют точку); ромб у родителя — необязательная связь';
      newDiagram.masterPage.dfdFooterMeta = title + ' | Лист 1';
    } else if (frameStyle === 'idef3' || type === 'idef3') {
      newDiagram.type = 'idef3';
      newDiagram.masterPage.frameStyle = 'idef3';
      newDiagram.masterPage.dfdSubtitle = 'UOB — единица поведения; X в круге — взаимоисключающая развилка (XOR)';
      newDiagram.masterPage.dfdNote = 'Повтор того же ключа возвращает сохранённый результат. Отказ, конфликт или отказ в проверке завершаются без частичной публикации.';
      newDiagram.masterPage.dfdFooterMeta = title + ' | Сценарий 1 | ' + new Date().toLocaleDateString('ru-RU');
    }

    this.saveCustomPageMeta(pageId, title, type);
    localStorage.setItem(this.getStorageKey(pageId), JSON.stringify(newDiagram));

    this.hideModal('modal-create-page');
    this.loadDiagram(pageId);
  }

  // ── Canvas Workspace Sizing Controls ──
  initCanvasSizeControls() {
    const presetSel = document.getElementById('sel-canvas-preset');
    const wInp = document.getElementById('inp-canvas-width');
    const hInp = document.getElementById('inp-canvas-height');
    const frameSel = document.getElementById('sel-canvas-frame-style');
    const btnApply = document.getElementById('btn-apply-canvas-size');
    const btnQuick = document.getElementById('btn-quick-canvas-size');

    if (presetSel) {
      presetSel.addEventListener('change', () => {
        const val = presetSel.value;
        if (val !== 'custom') {
          const [w, h] = val.split('x').map(Number);
          if (wInp) wInp.value = w;
          if (hInp) hInp.value = h;
          this.setCanvasDimensions(w, h);
        }
      });
    }

    if (btnApply) {
      btnApply.addEventListener('click', (e) => {
        e.preventDefault();
        const w = parseInt(wInp?.value, 10) || this.model.width;
        const h = parseInt(hInp?.value, 10) || this.model.height;
        const fStyle = frameSel?.value || this.model.masterPage.frameStyle;
        this.setCanvasDimensions(w, h, fStyle);

        const origText = btnApply.textContent;
        btnApply.textContent = '✓ Применено (' + w + ' × ' + h + ')';
        btnApply.style.backgroundColor = 'var(--success, #16a34a)';
        setTimeout(() => {
          btnApply.textContent = origText;
          btnApply.style.backgroundColor = '';
        }, 1200);
      });
    }

    if (wInp) {
      wInp.addEventListener('change', () => {
        const w = parseInt(wInp.value, 10);
        if (w >= 600 && w <= 5000) this.setCanvasDimensions(w, this.model.height);
      });
      wInp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const w = parseInt(wInp.value, 10);
          if (w >= 600 && w <= 5000) this.setCanvasDimensions(w, this.model.height);
        }
      });
    }

    if (hInp) {
      hInp.addEventListener('change', () => {
        const h = parseInt(hInp.value, 10);
        if (h >= 400 && h <= 4000) this.setCanvasDimensions(this.model.width, h);
      });
      hInp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const h = parseInt(hInp.value, 10);
          if (h >= 400 && h <= 4000) this.setCanvasDimensions(this.model.width, h);
        }
      });
    }

    if (frameSel) {
      frameSel.addEventListener('change', () => {
        this.setCanvasDimensions(this.model.width, this.model.height, frameSel.value);
      });
    }

    if (btnQuick) {
      btnQuick.addEventListener('click', () => {
        const inspector = document.getElementById('inspector');
        if (inspector && inspector.classList.contains('collapsed')) {
          inspector.classList.remove('collapsed');
          const edgeToggle = document.getElementById('btn-inspector-edge-toggle');
          if (edgeToggle) edgeToggle.textContent = '>';
        }
        this.switchInspectorTab('tab-props');
        wInp?.focus();
      });
    }
  }

  setCanvasDimensions(width, height, frameStyle) {
    this.model.width = Math.max(600, Math.min(5000, width));
    this.model.height = Math.max(400, Math.min(4000, height));
    if (frameStyle) {
      this.model.masterPage.frameStyle = frameStyle;
      if (frameStyle === 'dfd') {
        this.model.type = 'dfd';
        if (!this.model.masterPage.dfdSubtitle) {
          this.model.masterPage.dfdSubtitle = 'Процессы Р1–Р4, внешние стороны, потоки данных и накопители D1–D5';
        }
      } else if (frameStyle === 'gost') {
        if (this.model.type === 'dfd') {
          this.model.type = 'idef0_context';
        }
      }
    }
    this.canvas.render();
    this.updateCanvasSizeInputs();
    this.updateInspector();
    this.recordHistory();
    this.saveCurrentDiagramToStorage();
  }

  updateCanvasSizeInputs() {
    const w = this.model.width || 1200;
    const h = this.model.height || 820;
    const sizeStr = `${w} × ${h}`;

    const badge = document.getElementById('canvas-current-size-badge');
    if (badge) badge.textContent = sizeStr;

    const quickBtn = document.getElementById('btn-quick-canvas-size');
    if (quickBtn) quickBtn.textContent = sizeStr;

    const wInp = document.getElementById('inp-canvas-width');
    if (wInp && document.activeElement !== wInp) wInp.value = w;

    const hInp = document.getElementById('inp-canvas-height');
    if (hInp && document.activeElement !== hInp) hInp.value = h;

    const presetSel = document.getElementById('sel-canvas-preset');
    if (presetSel) {
      const matchKey = `${w}x${h}`;
      const hasOption = Array.from(presetSel.options).some(o => o.value === matchKey);
      presetSel.value = hasOption ? matchKey : 'custom';
    }

    const frameSel = document.getElementById('sel-canvas-frame-style');
    if (frameSel) {
      frameSel.value = this.model.masterPage.frameStyle || (this.canvas.gostFrame.isDfd() ? 'dfd' : 'gost');
    }
  }

  changeFrameFormat(newFormat) {
    this.model.masterPage.frameStyle = newFormat;

    // Set contextual defaults if needed
    if (newFormat === 'dfd') {
      if (!this.model.masterPage.dfdSubtitle) {
        this.model.masterPage.dfdSubtitle = 'Состав: Процессы (1.0..), Хранилища данных (D1..), Внешние сущности';
      }
      if (!this.model.masterPage.dfdLegend) {
        this.model.masterPage.dfdLegend = 'Процессы (круг/скругленный) | Хранилища (открытые линии) | Внешние сущности (прямоугольник)';
      }
    } else if (newFormat === 'idef1x') {
      if (!this.model.masterPage.dfdSubtitle) {
        this.model.masterPage.dfdSubtitle = '● Мощность связи 0..* | Z 0..1 | P 1..* | Сплошная: Идент. | Пунктир: Неидент.';
      }
    } else if (newFormat === 'idef3') {
      if (!this.model.masterPage.dfdSubtitle) {
        this.model.masterPage.dfdSubtitle = 'UOB Единицы работы | Развилки: & (AND), X (XOR), O (OR)';
      }
    }

    // Keep workspace inspector frame dropdown in sync
    const frameSel = document.getElementById('sel-canvas-frame-style');
    if (frameSel) frameSel.value = newFormat;

    this.canvas.render();
    this.saveCurrentDiagramToStorage();
    this.recordHistory();
    this.renderMasterStampTab(true);
  }

  renderMasterStampTab(forceRebuild = false) {
    const container = document.getElementById('dynamic-stamp-container');
    if (!container) return;

    const mp = this.model.masterPage;
    const format = this.canvas && this.canvas.gostFrame ? this.canvas.gostFrame.getFrameType() : (mp.frameStyle || 'gost');

    // Keep inspector tab header as "Штамп ГОСТ"
    const tabMasterBtn = document.querySelector('.inspector-tab[data-target="tab-master"]');
    if (tabMasterBtn) {
      tabMasterBtn.textContent = 'Штамп ГОСТ';
    }

    if (this._renderedStampFormat !== format || forceRebuild || !container.children.length) {
      this._renderedStampFormat = format;

      let formatBadge = 'IDEF0 (ГОСТ)';
      if (format === 'dfd') formatBadge = 'DFD';
      else if (format === 'idef1x') formatBadge = 'IDEF1X';
      else if (format === 'idef3') formatBadge = 'IDEF3';
      else if (format === 'none') formatBadge = 'Чистый холст';

      let html = `
        <div class="form-group" style="padding-bottom: 10px; border-bottom: 1px solid var(--border-color, #3e3e4a);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <label style="font-weight: 600; color: var(--text-main); font-size: 11px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Стиль оформления</label>
            <span style="font-size: 10px; font-weight: 600; color: var(--accent, #60a5fa); background: rgba(37,99,235,0.15); border: 1px solid rgba(37,99,235,0.3); padding: 1px 6px; border-radius: 4px;">${formatBadge}</span>
          </div>
          <select id="sel-master-frame-type" class="form-control" style="font-size: 12px;">
            <option value="gost" ${format === 'gost' ? 'selected' : ''}>Штамп ГОСТ Р 50.1.028-2001 (IDEF0)</option>
            <option value="dfd" ${format === 'dfd' ? 'selected' : ''}>Шапка и футер DFD (Потоки данных)</option>
            <option value="idef1x" ${format === 'idef1x' ? 'selected' : ''}>Шапка и футер IDEF1X (Модели данных)</option>
            <option value="idef3" ${format === 'idef3' ? 'selected' : ''}>Шапка и футер IDEF3 (Сценарии процессов)</option>
            <option value="none" ${format === 'none' ? 'selected' : ''}>Чистый холст (без рамки)</option>
          </select>
        </div>
      `;

      if (format === 'gost') {
        html += `
          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px;">
            Верхний колонтитул (Шапка)
          </div>
          <div class="form-group">
            <label>Автор (п. 11.2)</label>
            <input type="text" id="inp-master-author" data-prop="author" class="form-control" placeholder="ФИО автора">
          </div>
          <div class="form-row" style="display: flex; gap: 8px;">
            <div class="form-group" style="flex: 1;">
              <label>Дата</label>
              <input type="text" id="inp-master-date1" data-prop="date1" class="form-control" placeholder="08.10.2026">
            </div>
            <div class="form-group" style="flex: 1;">
              <label>Редакция (Rev)</label>
              <input type="text" id="inp-master-revision" data-prop="revision" class="form-control" placeholder="1.0">
            </div>
          </div>
          <div class="form-group">
            <label>Проект</label>
            <input type="text" id="inp-master-project" data-prop="project" class="form-control" placeholder="Название проекта">
          </div>
          <div class="form-row" style="display: flex; gap: 8px;">
            <div class="form-group" style="flex: 1;">
              <label>Используется в</label>
              <input type="text" id="inp-master-usedAt" data-prop="usedAt" class="form-control" placeholder="Контекст">
            </div>
            <div class="form-group" style="flex: 1;">
              <label>РД / Рев</label>
              <input type="text" id="inp-master-rd" data-prop="rd" class="form-control" placeholder="РД/РЕВ">
            </div>
          </div>
          <div class="form-group">
            <label>Статус листа (п. 11.3)</label>
            <select id="inp-master-status" data-prop="status" class="form-control">
              <option value="work">РАБОЧИЙ (WORK)</option>
              <option value="draft">ПРОЕКТ (DRAFT)</option>
              <option value="recommended">РЕКОМЕНДОВАН (RECOMMENDED)</option>
              <option value="publication">ПРИНЯТ (PUBLICATION)</option>
            </select>
          </div>
          <div class="form-row" style="display: flex; gap: 8px;">
            <div class="form-group" style="flex: 1;">
              <label>Читатель / Рецензент</label>
              <input type="text" id="inp-master-reader" data-prop="reader" class="form-control" placeholder="ФИО читателя">
            </div>
            <div class="form-group" style="flex: 1;">
              <label>Дата читателя</label>
              <input type="text" id="inp-master-readerDate" data-prop="readerDate" class="form-control" placeholder="08.10.2026">
            </div>
          </div>
          <div class="form-group">
            <label>Контекст родителя</label>
            <input type="text" id="inp-master-context" data-prop="context" class="form-control" placeholder="ТОЛЬКО ДЛЯ РАЗРАБОТКИ">
          </div>

          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-color, #3e3e4a);">
            Нижний колонтитул (Штамп ГОСТ)
          </div>
          <div class="form-row" style="display: flex; gap: 8px;">
            <div class="form-group" style="flex: 1;">
              <label>Шифр узла</label>
              <input type="text" id="inp-master-node" data-prop="node" class="form-control" placeholder="A-0, A0...">
            </div>
            <div class="form-group" style="flex: 1;">
              <label>Лист (Стр.)</label>
              <input type="text" id="inp-master-page" data-prop="page" class="form-control" placeholder="1">
            </div>
          </div>
          <div class="form-group">
            <label>Название диаграммы (ГОСТ п. 6.1)</label>
            <textarea id="inp-master-title" data-prop="title" class="form-control" rows="2" placeholder="Название функции (в глагольной форме)..."></textarea>
          </div>
          <div class="form-group">
            <label>C-Номер / Код документа</label>
            <input type="text" id="inp-master-cnumber" data-prop="cnumber" class="form-control" placeholder="C-номер">
          </div>
        `;
      } else if (format === 'dfd') {
        html += `
          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px;">
            Шапка диаграммы DFD
          </div>
          <div class="form-group">
            <label>Заголовок диаграммы DFD</label>
            <input type="text" id="inp-master-title" data-prop="title" class="form-control" placeholder="Название системы / диаграммы потоков...">
          </div>
          <div class="form-group">
            <label>Шапка: Обозначения и подзаголовок</label>
            <textarea id="inp-master-dfdSubtitle" data-prop="dfdSubtitle" class="form-control" rows="3" placeholder="Состав процессов, внешних сторон и накопителей данных..."></textarea>
          </div>

          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-color, #3e3e4a);">
            Подвал диаграммы DFD
          </div>
          <div class="form-group">
            <label>Футер: Легенда блоков</label>
            <textarea id="inp-master-dfdLegend" data-prop="dfdLegend" class="form-control" rows="3" placeholder="Описание обозначений блоков (Процессы / Хранилища / Сущности)..."></textarea>
          </div>
          <div class="form-group">
            <label>Футер: Примечания и правила</label>
            <textarea id="inp-master-dfdNote" data-prop="dfdNote" class="form-control" rows="2" placeholder="Правила обработки данных или примечание..."></textarea>
          </div>
          <div class="form-group">
            <label>Нижний колонтитул</label>
            <input type="text" id="inp-master-dfdFooterMeta" data-prop="dfdFooterMeta" class="form-control" placeholder="Организация | ЛР3 | Сценарий | Дата">
          </div>
        `;
      } else if (format === 'idef1x') {
        html += `
          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px;">
            Шапка модели данных IDEF1X
          </div>
          <div class="form-group">
            <label>Заголовок модели данных IDEF1X</label>
            <input type="text" id="inp-master-title" data-prop="title" class="form-control" placeholder="Концептуальная / логическая модель БД...">
          </div>
          <div class="form-group">
            <label>Шапка: Обозначения связей (FIPS 184-1)</label>
            <textarea id="inp-master-dfdSubtitle" data-prop="dfdSubtitle" class="form-control" rows="3" placeholder="● Мощность 0..* | Z 0..1 | P 1..* | Сплошная: Идент. | Пунктир: Неидент."></textarea>
          </div>

          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-color, #3e3e4a);">
            Подвал модели IDEF1X
          </div>
          <div class="form-group">
            <label>Футер: Пояснения к модели данных</label>
            <textarea id="inp-master-dfdNote" data-prop="dfdNote" class="form-control" rows="3" placeholder="Правила ссылочной целостности, внешние ключи (FK) и бизнес-правила..."></textarea>
          </div>
          <div class="form-group">
            <label>Нижний колонтитул</label>
            <input type="text" id="inp-master-dfdFooterMeta" data-prop="dfdFooterMeta" class="form-control" placeholder="Организация | ЛР3 | IDEF1X | Лист 7 | Дата">
          </div>
        `;
      } else if (format === 'idef3') {
        html += `
          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px;">
            Шапка сценария процессов IDEF3
          </div>
          <div class="form-group">
            <label>Заголовок сценария процессов IDEF3</label>
            <input type="text" id="inp-master-title" data-prop="title" class="form-control" placeholder="Сценарий выполнения процесса...">
          </div>
          <div class="form-group">
            <label>Шапка: Обозначения UOB и переходов</label>
            <textarea id="inp-master-dfdSubtitle" data-prop="dfdSubtitle" class="form-control" rows="3" placeholder="UOB Единицы работы | Развилки: & (AND), X (XOR), O (OR)"></textarea>
          </div>

          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-color, #3e3e4a);">
            Подвал сценария IDEF3
          </div>
          <div class="form-group">
            <label>Футер: Пояснение логики сценария</label>
            <textarea id="inp-master-dfdNote" data-prop="dfdNote" class="form-control" rows="3" placeholder="Описание сценария, условий ветвления и логических соединений..."></textarea>
          </div>
          <div class="form-group">
            <label>Нижний колонтитул</label>
            <input type="text" id="inp-master-dfdFooterMeta" data-prop="dfdFooterMeta" class="form-control" placeholder="Организация | ЛР3 | IDEF3 | Сценарий 1 | Дата">
          </div>
        `;
      } else {
        html += `
          <div style="padding: 18px 14px; background: var(--bg-app, #1e1e24); border: 1px dashed var(--border-color, #3e3e4a); border-radius: 6px; text-align: center; color: var(--text-muted); font-size: 12px; margin-top: 4px;">
            <div style="font-size: 26px; margin-bottom: 8px;">📄</div>
            <div style="font-weight: 600; color: var(--text-main); font-size: 13px; margin-bottom: 4px;">Чистый холст</div>
            <p style="margin: 0 0 10px 0; line-height: 1.4;">Рамка и штамп отключены. Вы можете включить нужный формат в выпадающем списке выше.</p>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-master-enable-gost" style="font-size: 11px;">Включить ГОСТ (IDEF0)</button>
          </div>
        `;
      }

      container.innerHTML = html;

      // Bind format switcher
      const selFormat = document.getElementById('sel-master-frame-type');
      if (selFormat) {
        selFormat.addEventListener('change', (e) => {
          this.changeFrameFormat(e.target.value);
        });
      }

      const btnEnableGost = document.getElementById('btn-master-enable-gost');
      if (btnEnableGost) {
        btnEnableGost.addEventListener('click', () => {
          this.changeFrameFormat('gost');
        });
      }

      // Bind all dynamic inputs with [data-prop]
      container.querySelectorAll('input[data-prop], textarea[data-prop], select[data-prop]').forEach(inp => {
        const prop = inp.getAttribute('data-prop');
        inp.addEventListener('input', (e) => {
          this.model.masterPage[prop] = e.target.value;
          this.canvas.render();
          this.saveCurrentDiagramToStorage();
        });
        inp.addEventListener('change', () => {
          this.recordHistory();
        });
      });
    }

    // Always synchronize values if not focused
    container.querySelectorAll('input[data-prop], textarea[data-prop], select[data-prop]').forEach(inp => {
      const prop = inp.getAttribute('data-prop');
      if (document.activeElement !== inp) {
        inp.value = mp[prop] || '';
      }
    });

    const selFormat = document.getElementById('sel-master-frame-type');
    if (selFormat && document.activeElement !== selFormat) {
      selFormat.value = format;
    }
  }

  focusMasterField(fieldName) {
    // Expand inspector if collapsed
    const inspector = document.getElementById('inspector');
    if (inspector && inspector.classList.contains('collapsed')) {
      inspector.classList.remove('collapsed');
      const edgeToggle = document.getElementById('btn-inspector-edge-toggle');
      if (edgeToggle) edgeToggle.textContent = '>';
    }

    // Switch to tab-master (Штамп ГОСТ)
    this.switchInspectorTab('tab-master');
    this.renderMasterStampTab();

    requestAnimationFrame(() => {
      let targetInput = document.getElementById(`inp-master-${fieldName}`);
      if (!targetInput) {
        if (fieldName.startsWith('date')) targetInput = document.getElementById('inp-master-date1');
        else if (fieldName.startsWith('time')) targetInput = document.getElementById('inp-master-date1');
        else if (fieldName === 'remarks') targetInput = document.getElementById('inp-master-context');
      }

      if (targetInput) {
        targetInput.focus();
        if (targetInput.select) targetInput.select();
        targetInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetInput.style.transition = 'box-shadow 0.2s, border-color 0.2s';
        targetInput.style.borderColor = 'var(--accent, #2563eb)';
        targetInput.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.45)';
        setTimeout(() => {
          targetInput.style.borderColor = '';
          targetInput.style.boxShadow = '';
        }, 1500);
      }
    });
  }
}

// Auto-boot on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new IdefApp();
});
