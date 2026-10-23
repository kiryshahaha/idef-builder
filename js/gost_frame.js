/**
 * IDEF Builder - GOST Frame Renderer (Р 50.1.028-2001, Приложение А)
 * Exact vector implementation of the standard Master Page (Мастер-страница)
 */

class GostFrame {
  constructor(model) {
    this.model = model;
  }

      getFrameType() {
    if (this.model.masterPage && this.model.masterPage.frameStyle) {
      return this.model.masterPage.frameStyle;
    }
    const t = (this.model.type || '').toLowerCase();
    const id = (this.model.id || '').toLowerCase();

    if (t.startsWith('idef0') || id.includes('idef0') || id.startsWith('fig1') || id.startsWith('fig2')) {
      return 'gost';
    }
    if (t === 'dfd' || t.includes('dfd') || id.includes('dfd') || id.startsWith('fig3')) {
      return 'dfd';
    }
    if (t === 'idef1x' || t.includes('idef1') || id.includes('idef1') || id.startsWith('fig4')) {
      return 'idef1x';
    }
    if (t === 'idef3' || t.includes('idef3') || id.includes('idef3') || id.startsWith('fig5')) {
      return 'idef3';
    }
    return 'gost';
  }

  isDfd() {
    return this.getFrameType() === 'dfd';
  }

  isModernFrame() {
    const ft = this.getFrameType();
    return ft === 'dfd' || ft === 'idef1x' || ft === 'idef3' || ft === 'academic';
  }

  render(svg) {
    const frameType = this.getFrameType();
    if (frameType === 'none') {
      return this.renderBlankFrame();
    }
    if (frameType === 'dfd') {
      return this.renderDfdFrame();
    }
    if (frameType === 'idef1x') {
      return this.renderIdef1xFrame();
    }
    if (frameType === 'idef3') {
      return this.renderIdef3Frame();
    }
    if (frameType === 'academic') {
      return this.renderAcademicFrame();
    }
    return this.renderGostFrame();
  }

  renderBlankFrame() {
    const W = this.model.width || 1200;
    const H = this.model.height || 820;
    let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'blank-master-frame');
    g.innerHTML = `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" fill="none" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="6,4"/>`;
    return g;
  }

  renderAcademicFrame() {
    const W = this.model.width || 1300;
    const H = this.model.height || 680;
    const mp = this.model.masterPage || {};

    const title = mp.title || 'IDEF0: Декомпозиция деятельности актора';
    const subtitle = mp.dfdSubtitle || 'Функциональная декомпозиция на узлы А1–А4 в целевой модели процессов студии';
    const node = mp.node || 'A0';
    const leftFooter = mp.dfdLegend || 'ГУАП | Кафедра № 43 | Дисциплина: Проектирование программных систем | Преподаватель: доц. Белая Т. И.';
    const rightFooter = mp.dfdFooterMeta || 'Студент: Энгельгардт К. А., гр. 4434 | ИС «Samarov Studio»';
    const caption = mp.caption || '';

    let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'gost-master-frame academic-master-frame');
    g.setAttribute('style', 'user-select: none; font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;');

    let captionSvg = '';
    if (caption) {
      captionSvg = `
        <g class="editable-meta" data-field="caption" style="cursor: default;">
          <rect x="${W / 2 - 400}" y="${H - 18}" width="800" height="20" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
          <text x="${W / 2}" y="${H - 6}" font-size="10.5" font-weight="bold" fill="#000000" text-anchor="middle">${caption}</text>
        </g>
      `;
    }

    g.innerHTML = `
      <!-- Outer Border -->
      <rect x="2" y="2" width="${W - 4}" height="${H - 4}" fill="none" stroke="#000000" stroke-width="1.2"/>

      <!-- ═══ HEADER ═══ -->
      <!-- Node Badge in top left -->
      <g class="editable-meta" data-field="node" style="cursor: default;">
        <rect x="15" y="8" width="90" height="24" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="20" y="25" font-size="12" font-weight="bold" fill="#000000">NODE: ${node}</text>
      </g>

      <!-- Title & Subtitle centered -->
      <g class="editable-meta" data-field="title" style="cursor: default;">
        <rect x="${W / 2 - 400}" y="8" width="800" height="24" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="${W / 2}" y="25" font-size="13.5" font-weight="bold" fill="#000000" text-anchor="middle">${title}</text>
      </g>

      <g class="editable-meta" data-field="dfdSubtitle" style="cursor: default;">
        <rect x="${W / 2 - 450}" y="32" width="900" height="18" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="${W / 2}" y="44" font-size="9.5" fill="#374151" text-anchor="middle">${subtitle}</text>
      </g>

      <!-- ═══ FOOTER ═══ -->
      <line x1="2" y1="${H - 40}" x2="${W - 2}" y2="${H - 40}" stroke="#000000" stroke-width="0.8"/>

      <!-- Left footer meta -->
      <g class="editable-meta" data-field="dfdLegend" style="cursor: default;">
        <rect x="15" y="${H - 34}" width="600" height="22" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="20" y="${H - 18}" font-size="8.5" fill="#111827">${leftFooter}</text>
      </g>

      <!-- Right footer meta -->
      <g class="editable-meta" data-field="dfdFooterMeta" style="cursor: default;">
        <rect x="${W - 550}" y="${H - 34}" width="535" height="22" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="${W - 20}" y="${H - 18}" font-size="8.5" fill="#111827" text-anchor="end">${rightFooter}</text>
      </g>

      ${captionSvg}
    `;

    return g;
  }

  renderDfdFrame() {
    const W = this.model.width || 1280;
    const H = this.model.height || 840;
    const mp = this.model.masterPage || {};

    const title = mp.title || 'DFD — основной поток планирования';
    const subtitle = (mp.dfdSubtitle && mp.dfdSubtitle !== 'DFD') ? mp.dfdSubtitle : 'Процессы Р1–Р4, внешние стороны, потоки данных и накопители D1–D5';
    const note = (mp.dfdNote !== undefined && mp.dfdNote !== '') ? mp.dfdNote : 'D4 обеспечивает проверку ключа повтора и хранение результата изменяющей команды; P4 добавляет события инженеров и решения диспетчера по проверкам.';
    const legend = (mp.dfdLegend && !mp.dfdLegend.includes('ГОСТ')) ? mp.dfdLegend : 'Прямоугольник — внешняя сущность или накопитель; скруглённый блок — процесс. Стрелки обозначают передачу данных. Повтор диспетчера показан для читаемости отдельных потоков.';
    const footerMeta = (mp.dfdFooterMeta && !mp.dfdFooterMeta.includes('Samarov')) ? mp.dfdFooterMeta : 'Beeline Business | ЛР3 | DFD, основной сценарий | 08.10.2026';

    let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'gost-master-frame dfd-master-frame');
    g.setAttribute('style', 'user-select: none; font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;');

    let noteSvg = '';
    if (note && note.trim()) {
      noteSvg = `
        <g class="editable-meta" data-field="dfdNote" style="cursor: default;">
          <rect x="18" y="${H - 96}" width="${W - 36}" height="18" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
          <text x="24" y="${H - 82}" font-size="8.5" fill="#111827">${note}</text>
        </g>
      `;
    }

    g.innerHTML = `
      <!-- Outer Border -->
      <rect x="2" y="2" width="${W - 4}" height="${H - 4}" fill="none" stroke="#000000" stroke-width="1.2"/>

      <!-- ═══ HEADER ═══ -->
      <g class="editable-meta" data-field="title" style="cursor: default;">
        <rect x="${W / 2 - 350}" y="10" width="700" height="26" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="${W / 2}" y="28" font-size="15" font-weight="bold" fill="#000000" text-anchor="middle">${title}</text>
      </g>

      <g class="editable-meta" data-field="dfdSubtitle" style="cursor: default;">
        <rect x="${W / 2 - 450}" y="36" width="900" height="20" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="${W / 2}" y="49" font-size="10.5" fill="#111827" text-anchor="middle">${subtitle}</text>
      </g>

      <!-- ═══ FOOTER ═══ -->
      ${noteSvg}

      <g class="editable-meta" data-field="dfdLegend" style="cursor: default;">
        <rect x="18" y="${H - 74}" width="${W - 36}" height="20" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="24" y="${H - 60}" font-size="8.5" fill="#111827">${legend}</text>
      </g>

      <line x1="2" y1="${H - 40}" x2="${W - 2}" y2="${H - 40}" stroke="#000000" stroke-width="0.8"/>

      <g class="editable-meta" data-field="dfdFooterMeta" style="cursor: default;">
        <rect x="${W / 2 - 350}" y="${H - 34}" width="700" height="24" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="${W / 2}" y="${H - 18}" font-size="9" fill="#111827" text-anchor="middle">${footerMeta}</text>
      </g>
    `;

    return g;
  }

  renderIdef1xFrame() {
    const W = this.model.width || 1280;
    const H = this.model.height || 840;
    const mp = this.model.masterPage || {};

    const title = mp.title || 'IDEF1X — команды, ключи повторов и аудит';
    const subtitle = mp.dfdSubtitle || 'IDEF1X: сплошная — идентифицирующая (зависимая сущность со скруглённым блоком); штриховая — неидентифицирующая; точка у потомка — 0..*, Z — 0..1, P — 1..* (Z/P заменяют точку); ромб у родителя — необязательная связь';
    const note = (mp.dfdNote !== undefined && mp.dfdNote !== '') ? mp.dfdNote : '';
    const footerMeta = mp.dfdFooterMeta || 'Beeline Business | ЛР3 | IDEF1X | Лист 7';

    let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'gost-master-frame idef1x-master-frame');
    g.setAttribute('style', 'user-select: none; font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;');

    let noteSvg = '';
    if (note && note.trim()) {
      noteSvg = `
        <g class="editable-meta" data-field="dfdNote" style="cursor: default;">
          <rect x="18" y="${H - 68}" width="${W - 36}" height="18" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
          <text x="24" y="${H - 54}" font-size="8.5" fill="#111827">${note}</text>
        </g>
      `;
    }

    g.innerHTML = `
      <!-- Outer Border -->
      <rect x="2" y="2" width="${W - 4}" height="${H - 4}" fill="none" stroke="#000000" stroke-width="1.2"/>

      <!-- ═══ HEADER ═══ -->
      <g class="editable-meta" data-field="title" style="cursor: default;">
        <rect x="${W / 2 - 350}" y="10" width="700" height="26" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="${W / 2}" y="28" font-size="15" font-weight="bold" fill="#000000" text-anchor="middle">${title}</text>
      </g>

      <g class="editable-meta" data-field="dfdSubtitle" style="cursor: default;">
        <rect x="20" y="36" width="${W - 40}" height="20" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="${W / 2}" y="49" font-size="9" fill="#111827" text-anchor="middle">${subtitle}</text>
      </g>

      <!-- ═══ FOOTER ═══ -->
      ${noteSvg}

      <line x1="2" y1="${H - 40}" x2="${W - 2}" y2="${H - 40}" stroke="#000000" stroke-width="0.8"/>

      <g class="editable-meta" data-field="dfdFooterMeta" style="cursor: default;">
        <rect x="${W / 2 - 350}" y="${H - 34}" width="700" height="24" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="${W / 2}" y="${H - 18}" font-size="9" fill="#111827" text-anchor="middle">${footerMeta}</text>
      </g>
    `;

    return g;
  }

  renderIdef3Frame() {
    const W = this.model.width || 1280;
    const H = this.model.height || 840;
    const mp = this.model.masterPage || {};

    const title = mp.title || 'IDEF3 — дневное планирование и публикация';
    const subtitle = mp.dfdSubtitle || 'UOB — единица поведения; X в круге — взаимоисключающая развилка (XOR)';
    const note = (mp.dfdNote !== undefined && mp.dfdNote !== '') ? mp.dfdNote : 'Повтор того же ключа возвращает сохранённый результат. Отказ, конфликт или отказ в проверке завершаются без частичной публикации.';
    const footerMeta = mp.dfdFooterMeta || 'Beeline Business | ЛР3 | IDEF3 | Сценарий 1 | 08.10.2026';

    let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'gost-master-frame idef3-master-frame');
    g.setAttribute('style', 'user-select: none; font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;');

    let noteSvg = '';
    if (note && note.trim()) {
      noteSvg = `
        <g class="editable-meta" data-field="dfdNote" style="cursor: default;">
          <rect x="18" y="${H - 74}" width="${W - 36}" height="20" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
          <text x="24" y="${H - 60}" font-size="8.5" fill="#111827">${note}</text>
        </g>
      `;
    }

    g.innerHTML = `
      <!-- Outer Border -->
      <rect x="2" y="2" width="${W - 4}" height="${H - 4}" fill="none" stroke="#000000" stroke-width="1.2"/>

      <!-- ═══ HEADER ═══ -->
      <g class="editable-meta" data-field="title" style="cursor: default;">
        <rect x="${W / 2 - 350}" y="10" width="700" height="26" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="${W / 2}" y="28" font-size="15" font-weight="bold" fill="#000000" text-anchor="middle">${title}</text>
      </g>

      <g class="editable-meta" data-field="dfdSubtitle" style="cursor: default;">
        <rect x="${W / 2 - 450}" y="36" width="900" height="20" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="${W / 2}" y="49" font-size="9.5" fill="#111827" text-anchor="middle">${subtitle}</text>
      </g>

      <!-- ═══ FOOTER ═══ -->
      ${noteSvg}

      <line x1="2" y1="${H - 40}" x2="${W - 2}" y2="${H - 40}" stroke="#000000" stroke-width="0.8"/>

      <g class="editable-meta" data-field="dfdFooterMeta" style="cursor: default;">
        <rect x="${W / 2 - 350}" y="${H - 34}" width="700" height="24" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="${W / 2}" y="${H - 18}" font-size="9" fill="#111827" text-anchor="middle">${footerMeta}</text>
      </g>
    `;

    return g;
  }

  renderGostFrame() {
    const W = this.model.width || 1200;
    const H = this.model.height || 820;
    const H_hdr = 85;
    const H_ftr = 38;
    const mp = this.model.masterPage;

    const lw = 180;  // left col width
    const mw = 590;  // mid col width
    const rw = W - lw - mw; // right col = 430

    const ac = 200;  // author label col
    const dc = 60;   // date col
    const tc = 60;   // time col

    // Colors per GOST style
    const cBlue = '#1e40af';
    const cPurple = '#7c3aed';
    const cRed = '#dc2626';

    let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'gost-master-frame');
    g.setAttribute('style', 'user-select: none; font-family: "Times New Roman", Times, serif;');

    // ── Outer border ──
    g.innerHTML = `
      <!-- Outer Border -->
      <rect x="2" y="2" width="${W - 4}" height="${H - 4}" fill="none" stroke="#000000" stroke-width="2"/>

      <!-- ═══ HEADER (85px) ═══ -->
      <rect x="0" y="0" width="${W}" height="${H_hdr}" fill="#ffffff" stroke="#000000" stroke-width="1"/>

      <!-- Left col: Используется в / РД / Замечания -->
      <rect x="0" y="0" width="${lw}" height="${H_hdr}" fill="#ffffff" stroke="#000000" stroke-width="1"/>
      <text x="6" y="14" font-size="9" fill="#000000">Используется в:</text>
      <g class="editable-meta" data-field="usedAt">
        <rect x="2" y="15" width="${lw - 4}" height="15" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="6" y="27" font-size="9" font-style="italic" fill="${cBlue}">${mp.usedAt}</text>
      </g>
      <line x1="0" y1="31" x2="${lw}" y2="31" stroke="#000000" stroke-width="0.8"/>
      <g class="editable-meta" data-field="rd">
        <rect x="2" y="32" width="${lw - 4}" height="22" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="6" y="45" font-size="9" font-style="italic" fill="${cBlue}">${mp.rd}</text>
      </g>
      <line x1="0" y1="55" x2="${lw}" y2="55" stroke="#000000" stroke-width="0.8"/>
      <text x="6" y="67" font-size="9" fill="#000000">Замечания:</text>
      <g class="remarks-row" style="cursor: pointer;">
        ${this.renderRemarks(mp.remarks, 6, 80)}
      </g>

      <!-- Mid col: Автор / Проект / Даты / Время / Версия -->
      <rect x="${lw}" y="0" width="${mw}" height="${H_hdr}" fill="#ffffff" stroke="#000000" stroke-width="1"/>
      <text x="${lw + 6}" y="17" font-size="9" fill="#000000">Автор:</text>
      <g class="editable-meta" data-field="author">
        <rect x="${lw + 42}" y="2" width="${ac - 44}" height="25" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="${lw + 45}" y="17" font-size="10" font-weight="bold" fill="${cBlue}">${mp.author}</text>
      </g>
      
      <!-- Date labels & values (Editable) -->
      <text x="${lw + ac + 6}" y="11" font-size="8" fill="#555555">Дата</text>
      <text x="${lw + ac + dc + 6}" y="11" font-size="8" fill="#555555">Дата</text>
      <text x="${lw + ac + 2 * dc + 6}" y="11" font-size="8" fill="#555555">Дата</text>
      <g class="editable-meta" data-field="date1">
        <rect x="${lw + ac}" y="12" width="${dc}" height="16" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="${lw + ac + 6}" y="24" font-size="8" fill="#000000">${mp.date1 || '22.10.2026'}</text>
      </g>
      <g class="editable-meta" data-field="date2">
        <rect x="${lw + ac + dc}" y="12" width="${dc}" height="16" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="${lw + ac + dc + 6}" y="24" font-size="8" fill="#000000">${mp.date2 || '22.10.2026'}</text>
      </g>
      <g class="editable-meta" data-field="date3">
        <rect x="${lw + ac + 2 * dc}" y="12" width="${dc}" height="16" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="${lw + ac + 2 * dc + 6}" y="24" font-size="8" fill="#000000">${mp.date3 || '22.10.2026'}</text>
      </g>
      
      <line x1="${lw}" y1="28" x2="${lw + mw}" y2="28" stroke="#000000" stroke-width="0.8"/>
      
      <!-- Project row -->
      <text x="${lw + 6}" y="43" font-size="9" fill="#000000">Проект:</text>
      <g class="editable-meta" data-field="project">
        <rect x="${lw + 48}" y="29" width="${ac - 50}" height="25" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="${lw + 50}" y="43" font-size="10" font-weight="bold" font-style="italic" fill="${cBlue}">${mp.project}</text>
      </g>
      
      <!-- Time headers & values (Editable) -->
      <text x="${lw + ac + 6}" y="38" font-size="8" fill="#555555">Время:</text>
      <g class="editable-meta" data-field="time1">
        <rect x="${lw + ac}" y="40" width="${dc}" height="15" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="${lw + ac + 6}" y="51" font-size="8" fill="#000000">${mp.time1 || '10:00'}</text>
      </g>
      <g class="editable-meta" data-field="time2">
        <rect x="${lw + ac + dc}" y="40" width="${dc}" height="15" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="${lw + ac + dc + 6}" y="51" font-size="8" fill="#000000">${mp.time2 || '11:00'}</text>
      </g>
      <g class="editable-meta" data-field="time3">
        <rect x="${lw + ac + 2 * dc}" y="40" width="${dc}" height="15" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="${lw + ac + 2 * dc + 6}" y="51" font-size="8" fill="#000000">${mp.time3 || '12:00'}</text>
      </g>
      
      <line x1="${lw}" y1="55" x2="${lw + mw}" y2="55" stroke="#000000" stroke-width="0.8"/>
      
      <!-- Version row -->
      <text x="${lw + 6}" y="71" font-size="9" fill="#000000">Версия:</text>
      <g class="editable-meta" data-field="revision">
        <rect x="${lw + 48}" y="56" width="${ac - 50}" height="27" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="${lw + 50}" y="71" font-size="9" fill="#000000">${mp.revision}</text>
      </g>

      <!-- Vertical separators in Mid col -->
      <line x1="${lw + ac}" y1="0" x2="${lw + ac}" y2="${H_hdr}" stroke="#000000" stroke-width="0.7"/>
      <line x1="${lw + ac + dc}" y1="0" x2="${lw + ac + dc}" y2="${H_hdr}" stroke="#000000" stroke-width="0.7"/>
      <line x1="${lw + ac + 2 * dc}" y1="0" x2="${lw + ac + 2 * dc}" y2="${H_hdr}" stroke="#000000" stroke-width="0.7"/>
      <line x1="${lw + ac + 3 * dc}" y1="0" x2="${lw + ac + 3 * dc}" y2="${H_hdr}" stroke="#000000" stroke-width="0.7"/>

      <!-- Right col: Status matrix, reader, context (Clickable status toggles) -->
      <rect x="${lw + mw}" y="0" width="${rw}" height="${H_hdr}" fill="#ffffff" stroke="#000000" stroke-width="1"/>
      
      <!-- Status table header -->
      <g class="status-cell-click" data-status="work" style="cursor: pointer;">
        <rect x="${lw + mw}" y="0" width="125" height="16" fill="transparent"/>
        <text x="${lw + mw + 6}" y="12" font-size="9" font-weight="bold" fill="${cRed}">Рабочая версия</text>
      </g>
      <text x="${lw + mw + 130}" y="12" font-size="8" fill="#000000">Читатель</text>
      <text x="${lw + mw + 200}" y="12" font-size="8" fill="#000000">Дата</text>
      <text x="${lw + mw + 250}" y="12" font-size="8" fill="#000000">Контекст:</text>
      <line x1="${lw + mw}" y1="16" x2="${lw + mw + rw}" y2="16" stroke="#000000" stroke-width="0.7"/>

      <!-- Status rows (Clickable) -->
      <g class="status-cell-click" data-status="draft" style="cursor: pointer;">
        <rect x="${lw + mw}" y="16" width="125" height="14" fill="transparent"/>
        <text x="${lw + mw + 6}" y="28" font-size="8" fill="#000000">Проект</text>
      </g>
      <g class="editable-meta" data-field="reader">
        <rect x="${lw + mw + 125}" y="16" width="70" height="14" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="${lw + mw + 130}" y="28" font-size="8" fill="#000000">${mp.reader}</text>
      </g>
      <g class="editable-meta" data-field="readerDate">
        <rect x="${lw + mw + 195}" y="16" width="50" height="14" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="${lw + mw + 200}" y="28" font-size="8" fill="#000000">${mp.readerDate || '22.10.2026'}</text>
      </g>
      <line x1="${lw + mw}" y1="30" x2="${lw + mw + rw}" y2="30" stroke="#000000" stroke-width="0.7"/>

      <g class="status-cell-click" data-status="recommended" style="cursor: pointer;">
        <rect x="${lw + mw}" y="30" width="125" height="16" fill="transparent"/>
        <text x="${lw + mw + 6}" y="44" font-size="8" fill="#000000">Рекомендовано</text>
      </g>
      <text x="${lw + mw + 250}" y="44" font-size="9" font-weight="bold" fill="${cRed}">None</text>
      <line x1="${lw + mw}" y1="46" x2="${lw + mw + rw}" y2="46" stroke="#000000" stroke-width="0.7"/>

      <g class="status-cell-click" data-status="publication" style="cursor: pointer;">
        <rect x="${lw + mw}" y="46" width="125" height="14" fill="transparent"/>
        <text x="${lw + mw + 6}" y="58" font-size="8" fill="#000000">Публикация</text>
      </g>
      <line x1="${lw + mw}" y1="60" x2="${lw + mw + rw}" y2="60" stroke="#000000" stroke-width="0.7"/>

      <!-- Context label -->
      <g class="editable-meta" data-field="context">
        <rect x="${lw + mw + 245}" y="60" width="${rw - 245}" height="24" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="${lw + mw + 250}" y="76" font-size="8" fill="${cBlue}">${mp.context}</text>
      </g>

      <!-- Status markers (X) -->
      ${this.renderStatusMarker(mp.status, lw + mw)}

      <!-- Vertical separators in Right col -->
      <line x1="${lw + mw + 125}" y1="0" x2="${lw + mw + 125}" y2="${H_hdr}" stroke="#000000" stroke-width="0.7"/>
      <line x1="${lw + mw + 195}" y1="0" x2="${lw + mw + 195}" y2="${H_hdr}" stroke="#000000" stroke-width="0.7"/>
      <line x1="${lw + mw + 245}" y1="0" x2="${lw + mw + 245}" y2="${H_hdr}" stroke="#000000" stroke-width="0.7"/>

      <!-- Purpose / Agreement label in top right -->
      <text x="${W - 6}" y="72" font-size="7.5" fill="${cPurple}" text-anchor="end">Цель проекта и соглашение</text>
      <text x="${W - 6}" y="82" font-size="7.5" fill="${cPurple}" text-anchor="end">по ведению проекта</text>

      <!-- ═══ WORKING AREA BORDER ═══ -->
      <rect x="0" y="${H_hdr}" width="${W}" height="${H - H_hdr - H_ftr}" fill="none" stroke="#000000" stroke-width="1"/>

      <!-- ═══ FOOTER (38px) ═══ -->
      <rect x="0" y="${H - H_ftr}" width="${W}" height="${H_ftr}" fill="#ffffff" stroke="#000000" stroke-width="1"/>
      <line x1="60" y1="${H - H_ftr}" x2="60" y2="${H}" stroke="#000000" stroke-width="0.7"/>
      <line x1="750" y1="${H - H_ftr}" x2="750" y2="${H}" stroke="#000000" stroke-width="0.7"/>
      <line x1="950" y1="${H - H_ftr}" x2="950" y2="${H}" stroke="#000000" stroke-width="0.7"/>
      <line x1="1100" y1="${H - H_ftr}" x2="1100" y2="${H}" stroke="#000000" stroke-width="0.7"/>

      <!-- Node -->
      <g class="editable-meta" data-field="node">
        <rect x="0" y="${H - H_ftr}" width="60" height="${H_ftr}" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="4" y="${H - H_ftr + 14}" font-size="10" fill="#000000">Узел:</text>
        <text x="4" y="${H - H_ftr + 28}" font-size="11" font-weight="bold" fill="${cBlue}">${mp.node}</text>
      </g>

      <!-- Title -->
      <g class="editable-meta" data-field="title">
        <rect x="60" y="${H - H_ftr}" width="690" height="${H_ftr}" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="66" y="${H - H_ftr + 14}" font-size="10" fill="#000000">Заголовок:</text>
        <text x="66" y="${H - H_ftr + 28}" font-size="11" font-weight="bold" fill="${cBlue}">${mp.title}</text>
      </g>

      <!-- C-Number -->
      <g class="editable-meta" data-field="cnumber">
        <rect x="750" y="${H - H_ftr}" width="200" height="${H_ftr}" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="756" y="${H - H_ftr + 14}" font-size="10" fill="#000000">Номер:</text>
        <text x="756" y="${H - H_ftr + 28}" font-size="11" font-weight="bold" fill="${cBlue}">${mp.cnumber}</text>
      </g>

      <!-- Page -->
      <g class="editable-meta" data-field="page">
        <rect x="950" y="${H - H_ftr}" width="150" height="${H_ftr}" fill="transparent" class="cell-hitarea" style="pointer-events: none;"/>
        <text x="956" y="${H - H_ftr + 14}" font-size="10" fill="#000000">Стр.:</text>
        <text x="956" y="${H - H_ftr + 28}" font-size="11" font-weight="bold" fill="${cBlue}">${mp.page}</text>
      </g>
    `;

    return g;
  }

  renderRemarks(activeCount, startX, y) {
    let html = '';
    const step = 14;
    for (let i = 1; i <= 10; i++) {
      const cx = startX + (i - 1) * step;
      const isCrossed = i <= activeCount;
      html += `
        <g class="remark-item-click" data-remark-num="${i}" style="cursor: pointer;">
          <rect x="${cx - 2}" y="${y - 10}" width="12" height="12" fill="transparent"/>
          <text x="${cx}" y="${y}" font-size="9" fill="${isCrossed ? '#dc2626' : '#555555'}" font-weight="${isCrossed ? 'bold' : 'normal'}">${i}</text>
          ${isCrossed ? `<line x1="${cx - 1}" y1="${y - 8}" x2="${cx + 7}" y2="${y + 1}" stroke="#dc2626" stroke-width="1.2"/>` : ''}
        </g>
      `;
    }
    return html;
  }

  renderStatusMarker(status, rightColX) {
    let y = 12;
    if (status === 'draft') y = 28;
    else if (status === 'recommended') y = 44;
    else if (status === 'publication') y = 58;

    return `
      <!-- Active status mark -->
      <rect x="${rightColX + 110}" y="${y - 8}" width="10" height="10" fill="none" stroke="#dc2626" stroke-width="1"/>
      <text x="${rightColX + 115}" y="${y}" font-size="9" font-weight="bold" fill="#dc2626" text-anchor="middle">X</text>
    `;
  }
}

window.GostFrame = GostFrame;
