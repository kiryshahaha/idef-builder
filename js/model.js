/**
 * IDEF Builder - Data Model & State Management
 * Compliant with GOST R 50.1.028-2001 (IDEF0) and related SADT standards
 */

/**
 * IDEF Builder - Data Model & State Management
 * Compliant with GOST R 50.1.028-2001 (IDEF0) and related SADT standards
 */

class DiagramModel {
  static getDefaultMasterPage() {
    return {
      usedAt: 'ЛР3 ГУАП',
      rd: 'РД по моделированию',
      author: 'Энгельгардт К. А.',
      project: 'Samarov Studio IS',
      remarks: 0, // 0 means none, 1-10 index
      revision: '1.0',
      date1: new Date().toLocaleDateString('ru-RU'),
      date2: new Date().toLocaleDateString('ru-RU'),
      date3: new Date().toLocaleDateString('ru-RU'),
      time1: '10:00',
      time2: '11:00',
      time3: '12:00',
      status: 'work', // 'work' | 'draft' | 'recommended' | 'publication'
      reader: 'Белая Т. И.',
      readerDate: new Date().toLocaleDateString('ru-RU'),
      context: 'ТОЛЬКО ДЛЯ РАЗРАБОТКИ',
      node: 'A-0',
      title: 'Управлять жизненным циклом дизайн-проектов',
      cnumber: '1',
      page: '1',
      agreement: 'Цель проекта и соглашение по ведению проекта',
      frameStyle: 'gost' // 'gost' | 'dfd' | 'none'
    };
  }

  constructor(type = 'idef0_context') {
    this.id = 'diag_' + Date.now();
    this.type = type; // 'idef0_context' | 'idef0_decomp' | 'dfd' | 'idef1x' | 'idef3'
    this.width = 1200;
    this.height = 820;

    // Standard GOST R 50.1.028-2001 Appendix A Metadata
    this.masterPage = DiagramModel.getDefaultMasterPage();
    if (type === 'dfd') {
      this.masterPage.frameStyle = 'dfd';
    }

    // Diagram elements: blocks, processes, entities, stores
    this.elements = [];

    // Connections: ICOM arrows, data flows, relationships, precedence links
    this.connections = [];

    // Selection state
    this.selectedIds = [];
  }

  // ── Element Management ──
  addElement(element) {
    if (!element.id) {
      element.id = 'el_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    }
    this.elements.push(element);
    return element;
  }

  getElementById(id) {
    return this.elements.find(e => e.id === id);
  }

  updateElement(id, props) {
    const el = this.getElementById(id);
    if (el) {
      Object.assign(el, props);
      return el;
    }
    return null;
  }

  removeElement(id) {
    this.elements = this.elements.filter(e => e.id !== id);
    // Also remove connected arrows
    this.connections = this.connections.filter(c => c.sourceId !== id && c.targetId !== id);
    this.selectedIds = this.selectedIds.filter(selId => selId !== id);
  }

  // ── Connection Management ──
  addConnection(connection) {
    if (!connection.id) {
      connection.id = 'conn_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    }
    // Default ICOM semantic classification
    if (!connection.icomType) {
      connection.icomType = 'input'; // 'input' | 'control' | 'output' | 'mechanism' | 'call' | 'dataflow' | 'rel' | 'precedence'
    }
    this.connections.push(connection);
    return connection;
  }

  getConnectionById(id) {
    return this.connections.find(c => c.id === id);
  }

  updateConnection(id, props) {
    const conn = this.getConnectionById(id);
    if (conn) {
      Object.assign(conn, props);
      return conn;
    }
    return null;
  }

  removeConnection(id) {
    this.connections = this.connections.filter(c => c.id !== id);
    this.selectedIds = this.selectedIds.filter(selId => selId !== id);
  }

  // ── Master Page Updates ──
  updateMasterPage(props) {
    Object.assign(this.masterPage, props);
  }

  // ── Serialization ──
  toJSON() {
    return {
      version: '1.0',
      standard: 'GOST R 50.1.028-2001',
      id: this.id,
      type: this.type,
      width: this.width,
      height: this.height,
      masterPage: this.masterPage,
      elements: this.elements,
      connections: this.connections
    };
  }

  fromJSON(data) {
    this.id = data.id || 'diag_' + Date.now();
    this.type = data.type || 'idef0_context';
    this.width = data.width || 1200;
    this.height = data.height || 820;
    
    // Always start with clean default master page so previous diagram properties never leak
    this.masterPage = Object.assign(DiagramModel.getDefaultMasterPage(), data.masterPage || {});

    // Determine correct frameStyle
    if (!this.masterPage.frameStyle) {
      if (this.type === 'dfd') this.masterPage.frameStyle = 'dfd';
      else if (this.type === 'idef1x') this.masterPage.frameStyle = 'idef1x';
      else if (this.type === 'idef3') this.masterPage.frameStyle = 'idef3';
      else this.masterPage.frameStyle = 'gost';
    }

    const isModern = ['dfd', 'idef1x', 'idef3', 'academic'].includes(this.masterPage.frameStyle);
    if (!isModern) {
      delete this.masterPage.dfdSubtitle;
      delete this.masterPage.dfdLegend;
      delete this.masterPage.dfdNote;
      delete this.masterPage.dfdFooterMeta;
    }

    this.elements = data.elements || [];
    this.connections = data.connections || [];
    this.selectedIds = [];
  }
}

// Global Export for script inclusion
window.DiagramModel = DiagramModel;
