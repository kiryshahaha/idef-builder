/**
 * IDEF Builder - Standard Templates Library (12 Figures for Samarov Studio LR3)
 * Pre-configured ГОСТ Р 50.1.028-2001 and SADT models (IDEF0, DFD, IDEF1X, IDEF3)
 */

const DIAGRAM_TEMPLATES = {
  // ── 1. IDEF0 A-0 Context Diagram ──
  fig1_idef0_context: {
    id: 'fig1_idef0_context',
    name: '1. IDEF0: Контекстная диаграмма (А-0)',
    type: 'idef0_context',
    desc: 'Черный ящик ИС: 1 функциональный блок, входы ICOM, внешние интерфейсы',
    masterPage: {
      usedAt: 'ЛР3 ГУАП', rd: 'РД по моделированию', author: 'Энгельгардт К. А.',
      project: 'Samarov Studio IS', remarks: 0, revision: '2.0', status: 'work',
      reader: 'Белая Т. И.', context: 'ТОЛЬКО ДЛЯ РАЗРАБОТКИ',
      node: 'A-0', title: 'Управлять жизненным циклом дизайн-проектов студии «Samarov Studio»',
      cnumber: '1', page: '1'
    },
    elements: [
      {
        id: 'block_0', type: 'idef0_block', x: 370, y: 280, width: 420, height: 210,
        name: 'Управлять жизненным\nциклом дизайн-проектов\nи взаимодействием с клиентами\nстудии «Samarov Studio»',
        nodeCode: 'A-0'
      }
    ],
    connections: [
      { id: 'c_i1', icomType: 'input', label: 'Бриф-анкета клиента (FR-01, FR-02)', p1: { x: 10, y: 320 }, p2: { x: 370, y: 320 } },
      { id: 'c_i2', icomType: 'input', label: 'Планы БТИ, замеры и фото помещений', p1: { x: 10, y: 370 }, p2: { x: 370, y: 370 } },
      { id: 'c_i3', icomType: 'input', label: 'Исходные 3D-рендеры и чертежи', p1: { x: 10, y: 420 }, p2: { x: 370, y: 420 } },
      { id: 'c_i4', icomType: 'input', label: 'Прайс-листы поставщиков и коды ПЭП', p1: { x: 10, y: 460 }, p2: { x: 370, y: 460 } },
      { id: 'c_c1', icomType: 'control', label: 'ГК РФ и 63-ФЗ', p1: { x: 440, y: 90 }, p2: { x: 440, y: 280 } },
      { id: 'c_c2', icomType: 'control', label: 'Договор и SLA (≤2 правок)', p1: { x: 580, y: 90 }, p2: { x: 580, y: 280 } },
      { id: 'c_c3', icomType: 'control', label: 'СНиП/СП и бюджет', p1: { x: 710, y: 90 }, p2: { x: 710, y: 280 } },
      { id: 'c_o1', icomType: 'output', label: 'Утвержденный проект (3D + PDF)', p1: { x: 790, y: 320 }, p2: { x: 1190, y: 320 } },
      { id: 'c_o2', icomType: 'output', label: 'Smart-смета комплектации', p1: { x: 790, y: 370 }, p2: { x: 1190, y: 370 } },
      { id: 'c_o3', icomType: 'output', label: 'Акты сдачи-приемки по ПЭП', p1: { x: 790, y: 420 }, p2: { x: 1190, y: 420 } },
      { id: 'c_o4', icomType: 'output', label: 'Журнал надзора и дефектов', p1: { x: 790, y: 460 }, p2: { x: 1190, y: 460 } },
      { id: 'c_m1', icomType: 'mechanism', label: 'Арт-директор и архитекторы', p1: { x: 450, y: 775 }, p2: { x: 450, y: 490 } },
      { id: 'c_m2', icomType: 'mechanism', label: 'Заказчик и прораб', p1: { x: 580, y: 775 }, p2: { x: 580, y: 490 } },
      { id: 'c_m3', icomType: 'mechanism', label: 'Платформа FastAPI, PostgreSQL, S3', p1: { x: 710, y: 775 }, p2: { x: 710, y: 490 } }
    ]
  },

  // ── 2. IDEF0 A0 Decomposition ──
  fig2_idef0_decomp: {
    id: 'fig2_idef0_decomp',
    name: '2. IDEF0: Декомпозиция (А0)',
    type: 'idef0_decomp',
    desc: 'Диагональ из 4 блоков ЖЦ: А1, А2, А3, А4 с интерфейсной балансировкой',
    masterPage: {
      usedAt: 'ЛР3 ГУАП', rd: 'РД по моделированию', author: 'Энгельгардт К. А.',
      project: 'Samarov Studio IS', remarks: 0, revision: '2.0', status: 'work',
      reader: 'Белая Т. И.', context: 'A-0',
      node: 'A0', title: 'Декомпозиция функциональной модели IDEF0 на узлы А1–А4',
      cnumber: '2', page: '2'
    },
    elements: [
      { id: 'blk_a1', type: 'idef0_block', x: 60, y: 140, width: 210, height: 110, name: 'Первичная обработка\nобращений, Smart-бриф\nи заключение договора', nodeCode: 'A1' },
      { id: 'blk_a2', type: 'idef0_block', x: 340, y: 280, width: 210, height: 110, name: 'Разработка планировок\nи 3D-моделирование\nинтерьера', nodeCode: 'A2' },
      { id: 'blk_a3', type: 'idef0_block', x: 620, y: 420, width: 210, height: 110, name: 'Интерактивное визуальное\nревью и согласование\nэтапов по ПЭП', nodeCode: 'A3' },
      { id: 'blk_a4', type: 'idef0_block', x: 900, y: 560, width: 210, height: 110, name: 'Формирование Smart-сметы\nи ведение журнала\nавторского надзора', nodeCode: 'A4' }
    ],
    connections: [
      { id: 'd_i1', icomType: 'input', label: 'Заявка и бриф', p1: { x: 10, y: 175 }, p2: { x: 60, y: 175 } },
      { id: 'd_i2', icomType: 'input', label: 'Планы БТИ и замеры', p1: { x: 10, y: 315 }, p2: { x: 340, y: 315 } },
      { id: 'd_f1', icomType: 'output', label: 'ТЗ и договор', p1: { x: 270, y: 180, side: 'right' }, p2: { x: 340, y: 350, side: 'left' } },
      { id: 'd_f2', icomType: 'output', label: '3D-рендеры и чертежи', p1: { x: 550, y: 320, side: 'right' }, p2: { x: 620, y: 450, side: 'left' } },
      { id: 'd_f3', icomType: 'output', label: 'Принятый 3D-проект', p1: { x: 830, y: 460, side: 'right' }, p2: { x: 900, y: 590, side: 'left' } },
      { id: 'd_loop', icomType: 'mechanism', label: 'Пин-замечания заказчика (лимит ≤ 2)', p1: { x: 680, y: 530, side: 'bottom' }, p2: { x: 450, y: 390, side: 'bottom' } },
      { id: 'd_c1', icomType: 'control', label: 'ГК РФ и оферта', p1: { x: 140, y: 90 }, p2: { x: 140, y: 140 } },
      { id: 'd_c2', icomType: 'control', label: 'СНиП / СП', p1: { x: 420, y: 90 }, p2: { x: 420, y: 280 } },
      { id: 'd_c3', icomType: 'control', label: '63-ФЗ и лимит SLA', p1: { x: 700, y: 90 }, p2: { x: 700, y: 420 } },
      { id: 'd_c4', icomType: 'control', label: 'Бюджет сметы', p1: { x: 980, y: 90 }, p2: { x: 980, y: 560 } },
      { id: 'd_o1', icomType: 'output', label: 'Акты приемки по ПЭП', p1: { x: 830, y: 490 }, p2: { x: 1190, y: 490 } },
      { id: 'd_o2', icomType: 'output', label: 'Smart-ведомость сметы', p1: { x: 1110, y: 595 }, p2: { x: 1190, y: 595 } },
      { id: 'd_o3', icomType: 'output', label: 'Журнал надзора', p1: { x: 1110, y: 635 }, p2: { x: 1190, y: 635 } }
    ]
  },

  // ── 3. DFD Level 1 ──
  fig3_dfd_level1: {
    id: 'fig3_dfd_level1',
    name: '3. DFD: Потоки данных (Уровень 1)',
    type: 'dfd',
    desc: 'Нотация Гейна-Сарсона: Внешние сущности E1..E6, Процессы P1..P6, Накопители D1..D6',
    masterPage: {
      usedAt: 'ЛР3 ГУАП', rd: 'РД по моделированию', author: 'Энгельгардт К. А.',
      project: 'Samarov Studio IS', remarks: 0, revision: '2.0', status: 'work',
      reader: 'Белая Т. И.', context: 'DFD',
      node: 'DFD-1', title: 'Диаграмма потоков данных первого уровня (DFD Level 1)',
      cnumber: '3', page: '3'
    },
    elements: [
      { id: 'e_client', type: 'dfd_entity', x: 20, y: 140, width: 130, height: 60, name: 'Клиент\n(Заказчик)' },
      { id: 'e_designer', type: 'dfd_entity', x: 20, y: 240, width: 130, height: 60, name: 'Арт-директор /\nДизайнер' },
      { id: 'e_builder', type: 'dfd_entity', x: 20, y: 620, width: 130, height: 60, name: 'Подрядчик /\nПрораб' },
      { id: 'e_bank', type: 'dfd_entity', x: 1050, y: 140, width: 130, height: 60, name: 'Платежный шлюз\n(СБП / 54-ФЗ)' },
      { id: 'e_sms', type: 'dfd_entity', x: 1050, y: 240, width: 130, height: 60, name: 'SMS / Email шлюз\n(ПЭП 63-ФЗ)' },
      { id: 'e_vendor', type: 'dfd_entity', x: 1050, y: 620, width: 130, height: 60, name: 'Каталоги поставщиков\n(API комплектации)' },
      { id: 'p1', type: 'dfd_process', x: 240, y: 130, width: 170, height: 75, name: 'Smart-брифование\nи калькулятор', procId: '1.0' },
      { id: 'p2', type: 'dfd_process', x: 510, y: 130, width: 170, height: 75, name: 'Управление этапами\nи чертежами', procId: '2.0' },
      { id: 'p3', type: 'dfd_process', x: 780, y: 130, width: 170, height: 75, name: 'Интерактивное\nпин-рецензирование', procId: '3.0' },
      { id: 'p4', type: 'dfd_process', x: 240, y: 610, width: 170, height: 75, name: 'Smart-смета\nи комплектация', procId: '4.0' },
      { id: 'p5', type: 'dfd_process', x: 510, y: 610, width: 170, height: 75, name: 'Подписание актов\nчерез ПЭП', procId: '5.0' },
      { id: 'p6', type: 'dfd_process', x: 780, y: 610, width: 170, height: 75, name: 'Авторский надзор\nи дефекты', procId: '6.0' },
      { id: 'd1', type: 'dfd_store', x: 200, y: 350, width: 190, height: 34, name: 'D1 Клиенты и профили', storeId: 'D1' },
      { id: 'd2', type: 'dfd_store', x: 420, y: 350, width: 190, height: 34, name: 'D2 Проекты и этапы', storeId: 'D2' },
      { id: 'd3', type: 'dfd_store', x: 640, y: 350, width: 190, height: 34, name: 'D3 Рендеры и чертежи', storeId: 'D3' },
      { id: 'd4', type: 'dfd_store', x: 860, y: 350, width: 190, height: 34, name: 'D4 Пин-комментарии', storeId: 'D4' },
      { id: 'd5', type: 'dfd_store', x: 310, y: 420, width: 210, height: 34, name: 'D5 Ведомости комплектации', storeId: 'D5' },
      { id: 'd6', type: 'dfd_store', x: 580, y: 420, width: 210, height: 34, name: 'D6 Акты приемки по ПЭП', storeId: 'D6' }
    ],
    connections: [
      { id: 'df_1', icomType: 'dataflow', sourceId: 'e_client', targetId: 'p1', label: 'Заявка и бриф' },
      { id: 'df_2', icomType: 'dataflow', sourceId: 'p1', targetId: 'p2', label: 'ТЗ проекта' },
      { id: 'df_3', icomType: 'dataflow', sourceId: 'p2', targetId: 'p3', label: '3D-кадры' },
      { id: 'df_4', icomType: 'dataflow', sourceId: 'p1', targetId: 'd1', label: 'Данные клиента' },
      { id: 'df_5', icomType: 'dataflow', sourceId: 'p2', targetId: 'd3', label: 'Файлы S3' },
      { id: 'df_6', icomType: 'dataflow', sourceId: 'p3', targetId: 'd4', label: 'Координаты пина' },
      { id: 'df_7', icomType: 'dataflow', sourceId: 'd4', targetId: 'p5', label: 'Финальная приемка' },
      { id: 'df_8', icomType: 'dataflow', sourceId: 'p5', targetId: 'e_sms', label: 'SMS-код' },
      { id: 'df_9', icomType: 'dataflow', sourceId: 'e_vendor', targetId: 'p4', label: 'Прайсы и артикулы' }
    ]
  },

  // ── 4. DFD Supporting Flows ──
  fig4_dfd_supporting: {
    id: 'fig4_dfd_supporting',
    name: '4. DFD: Поддерживающие потоки S3, аудита и шлюзов',
    type: 'dfd',
    desc: 'Хранение тяжелых файлов в S3, аудит сессий, СБП-эквайринг и интеграция со сторонними API',
    masterPage: {
      usedAt: 'ЛР3 ГУАП', rd: 'РД по моделированию', author: 'Энгельгардт К. А.',
      project: 'Samarov Studio IS', remarks: 0, revision: '2.0', status: 'work',
      reader: 'Белая Т. И.', context: 'DFD',
      node: 'DFD-2', title: 'Схема поддерживающих потоков S3, аудита, нотификаций и эквайринга',
      cnumber: '4', page: '4'
    },
    elements: [
      { id: 's_s3', type: 'dfd_store', x: 80, y: 180, width: 260, height: 60, name: 'S3 Object Storage\n(MinIO / Cloud S3)', storeId: 'S3' },
      { id: 's_audit', type: 'dfd_store', x: 470, y: 180, width: 260, height: 60, name: 'Журнал аудита доступа\nи сессий (Audit Engine)', storeId: 'LOG' },
      { id: 's_notify', type: 'dfd_entity', x: 860, y: 180, width: 240, height: 60, name: 'Сервисы нотификации\n(Telegram / SMS / Email)' },
      { id: 'p_pdf', type: 'dfd_process', x: 80, y: 420, width: 260, height: 70, name: 'Генератор PDF-документов\n(WeasyPrint / PDF/A)', procId: 'P.S1' },
      { id: 'p_acq', type: 'dfd_process', x: 470, y: 420, width: 260, height: 70, name: 'Платежный шлюз эквайринга\n(СБП / ЮKassa / 54-ФЗ)', procId: 'P.S2' },
      { id: 'p_sync', type: 'dfd_process', x: 860, y: 420, width: 240, height: 70, name: 'Синхронизатор каталогов\nпоставщиков (Web Scraping)', procId: 'P.S3' }
    ],
    connections: [
      { id: 'sup_1', icomType: 'dataflow', sourceId: 'p_pdf', targetId: 's_s3', label: 'Сохранение PDF актов' },
      { id: 'sup_2', icomType: 'dataflow', sourceId: 'p_acq', targetId: 's_audit', label: 'Фискальный чек и IP' },
      { id: 'sup_3', icomType: 'dataflow', sourceId: 'p_acq', targetId: 's_notify', label: 'Уведомление об оплате' }
    ]
  },

  // ── 5. DFD Detailed Pin Review & PEP ──
  fig5_dfd_pin_pep: {
    id: 'fig5_dfd_pin_pep',
    name: '5. DFD: Пин-ревью и подписание по ПЭП',
    type: 'dfd',
    desc: 'Детальный поток: установка пин-меток (x, y), проверка счетчика и генерация юридического акта по 63-ФЗ',
    masterPage: {
      usedAt: 'ЛР3 ГУАП', rd: 'РД по моделированию', author: 'Энгельгардт К. А.',
      project: 'Samarov Studio IS', remarks: 0, revision: '2.0', status: 'work',
      reader: 'Белая Т. И.', context: 'DFD',
      node: 'DFD-3', title: 'Детальная DFD процесса рецензирования рендеров и подписания по ПЭП',
      cnumber: '5', page: '5'
    },
    elements: [
      { id: 'p31', type: 'dfd_process', x: 60, y: 160, width: 220, height: 75, name: '3.1 Загрузка 3D-сцен\nи версионирование', procId: '3.1' },
      { id: 'p32', type: 'dfd_process', x: 380, y: 160, width: 220, height: 75, name: '3.2 Расстановка пин-меток\nзаказчиком (x, y)', procId: '3.2' },
      { id: 'p33', type: 'dfd_process', x: 700, y: 160, width: 220, height: 75, name: '3.3 Отработка замечаний\nдизайнером (Resolved)', procId: '3.3' },
      { id: 'p41', type: 'dfd_process', x: 380, y: 480, width: 220, height: 75, name: '4.1 Генерация акта КС-2\nи хэша SHA-256', procId: '4.1' },
      { id: 'p42', type: 'dfd_process', x: 700, y: 480, width: 220, height: 75, name: '4.2 Валидация SMS-кода\nи фиксация подписи ПЭП', procId: '4.2' },
      { id: 'st_pins', type: 'dfd_store', x: 540, y: 320, width: 220, height: 40, name: 'D_Pins Пин-метки', storeId: 'D_Pins' }
    ],
    connections: [
      { id: 'pp_1', icomType: 'dataflow', sourceId: 'p31', targetId: 'p32', label: '3D-кадры на ревью' },
      { id: 'pp_2', icomType: 'dataflow', sourceId: 'p32', targetId: 'st_pins', label: 'Координаты (x, y)' },
      { id: 'pp_3', icomType: 'dataflow', sourceId: 'st_pins', targetId: 'p33', label: 'Список замечаний' },
      { id: 'pp_4', icomType: 'dataflow', sourceId: 'p33', targetId: 'p41', label: 'Все пины устранены' },
      { id: 'pp_5', icomType: 'dataflow', sourceId: 'p41', targetId: 'p42', label: 'SMS-запрос ПЭП' }
    ]
  },

  // ── 6. IDEF1X Users & Projects (D1) ──
  fig6_idef1x_users_projects: {
    id: 'fig6_idef1x_users_projects',
    name: '6. IDEF1X: Пользователи, роли и проекты (D1)',
    type: 'idef1x',
    desc: 'Реляционная модель пользователей, профилей клиентов/команды и договоров в 3NF',
    masterPage: {
      usedAt: 'ЛР3 ГУАП', rd: 'РД по моделированию', author: 'Энгельгардт К. А.',
      project: 'Samarov Studio IS', remarks: 0, revision: '2.0', status: 'work',
      reader: 'Белая Т. И.', context: 'IDEF1X',
      node: 'IDEF1X-1', title: 'Логическая модель пользователей, ролей, договоров и проектов (D1)',
      cnumber: '6', page: '6'
    },
    elements: [
      { id: 'tb_users', type: 'idef1x_entity', x: 40, y: 140, width: 240, isDep: false, name: 'USERS (Пользователи)', pks: ['user_id: UUID (PK)'], attrs: ['email: VARCHAR(255)', 'password_hash: VARCHAR', 'role_id: INT (FK)', 'phone: VARCHAR(20)', 'created_at: TIMESTAMP'] },
      { id: 'tb_roles', type: 'idef1x_entity', x: 40, y: 420, width: 240, isDep: false, name: 'ROLES (Справочник ролей)', pks: ['role_id: INT (PK)'], attrs: ['role_name: VARCHAR(50)', 'permissions_mask: INT'] },
      { id: 'tb_clients', type: 'idef1x_entity', x: 420, y: 140, width: 260, isDep: true, name: 'CLIENT_PROFILES (Профили)', pks: ['client_id: UUID (PK)'], attrs: ['user_id: UUID (FK)', 'full_name: VARCHAR(150)', 'passport_data: ENCRYPTED', 'communication_pref: VARCHAR'] },
      { id: 'tb_team', type: 'idef1x_entity', x: 420, y: 420, width: 260, isDep: true, name: 'TEAM_PROFILES (Сотрудники)', pks: ['staff_id: UUID (PK)'], attrs: ['user_id: UUID (FK)', 'specialization: VARCHAR', 'hourly_rate: NUMERIC', 'is_lead: BOOLEAN'] },
      { id: 'tb_projects', type: 'idef1x_entity', x: 820, y: 240, width: 280, isDep: true, name: 'PROJECTS (Дизайн-проекты)', pks: ['project_id: UUID (PK)'], attrs: ['client_id: UUID (FK)', 'lead_arch_id: UUID (FK)', 'title: VARCHAR(200)', 'object_address: VARCHAR(255)', 'status: VARCHAR(50)', 'created_at: TIMESTAMP'] }
    ],
    connections: [
      { id: 'r6_1', icomType: 'rel_non', sourceId: 'tb_roles', targetId: 'tb_users', label: '1:N' },
      { id: 'r6_2', icomType: 'rel_ident', sourceId: 'tb_users', targetId: 'tb_clients', label: '1:1' },
      { id: 'r6_3', icomType: 'rel_ident', sourceId: 'tb_users', targetId: 'tb_team', label: '1:1' },
      { id: 'r6_4', icomType: 'rel_ident', sourceId: 'tb_clients', targetId: 'tb_projects', label: '1:N' },
      { id: 'r6_5', icomType: 'rel_non', sourceId: 'tb_team', targetId: 'tb_projects', label: '1:N' }
    ]
  },

  // ── 7. IDEF1X Stages & Estimates (D2, D4) ──
  fig7_idef1x_stages_estimates: {
    id: 'fig7_idef1x_stages_estimates',
    name: '7. IDEF1X: Стадии проектов и Smart-смета (D2, D4)',
    type: 'idef1x',
    desc: 'Графики стадий, задачи, ведомости комплектации и каталоги поставщиков в 3NF',
    masterPage: {
      usedAt: 'ЛР3 ГУАП', rd: 'РД по моделированию', author: 'Энгельгардт К. А.',
      project: 'Samarov Studio IS', remarks: 0, revision: '2.0', status: 'work',
      reader: 'Белая Т. И.', context: 'IDEF1X',
      node: 'IDEF1X-2', title: 'Логическая модель этапов, задач и Smart-сметы комплектации (D2, D4)',
      cnumber: '7', page: '7'
    },
    elements: [
      { id: 'tb_stages', type: 'idef1x_entity', x: 40, y: 140, width: 260, isDep: true, name: 'PROJECT_STAGES (Стадии)', pks: ['stage_id: UUID (PK)'], attrs: ['project_id: UUID (FK)', 'stage_type: VARCHAR(50)', 'stage_order: INT', 'deadline: DATE', 'status: VARCHAR(30)'] },
      { id: 'tb_tasks', type: 'idef1x_entity', x: 40, y: 440, width: 260, isDep: true, name: 'STAGE_TASKS (Задачи)', pks: ['task_id: UUID (PK)'], attrs: ['stage_id: UUID (FK)', 'assignee_id: UUID (FK)', 'title: VARCHAR(150)', 'is_completed: BOOLEAN'] },
      { id: 'tb_estimates', type: 'idef1x_entity', x: 440, y: 140, width: 260, isDep: true, name: 'ESTIMATES (Сметы)', pks: ['estimate_id: UUID (PK)'], attrs: ['project_id: UUID (FK)', 'version: INT', 'total_rub: NUMERIC(12,2)', 'is_approved: BOOLEAN'] },
      { id: 'tb_items', type: 'idef1x_entity', x: 440, y: 440, width: 260, isDep: true, name: 'ESTIMATE_ITEMS (Позиции)', pks: ['item_id: UUID (PK)'], attrs: ['estimate_id: UUID (FK)', 'supplier_id: UUID (FK)', 'product_name: VARCHAR(200)', 'quantity: NUMERIC', 'unit_price: NUMERIC'] },
      { id: 'tb_suppliers', type: 'idef1x_entity', x: 840, y: 280, width: 260, isDep: false, name: 'SUPPLIERS (Поставщики)', pks: ['supplier_id: UUID (PK)'], attrs: ['company_name: VARCHAR(150)', 'contact_phone: VARCHAR(30)', 'discount_rate: NUMERIC', 'api_url: VARCHAR(255)'] }
    ],
    connections: [
      { id: 'r7_1', icomType: 'rel_ident', sourceId: 'tb_stages', targetId: 'tb_tasks', label: '1:N' },
      { id: 'r7_2', icomType: 'rel_ident', sourceId: 'tb_estimates', targetId: 'tb_items', label: '1:N' },
      { id: 'r7_3', icomType: 'rel_non', sourceId: 'tb_suppliers', targetId: 'tb_items', label: '1:N' }
    ]
  },

  // ── 8. IDEF1X Renders & Pins (D3) ──
  fig8_idef1x_renders_pins: {
    id: 'fig8_idef1x_renders_pins',
    name: '8. IDEF1X: Графика, рендеры и пины (D3)',
    type: 'idef1x',
    desc: 'Версионирование 3D-графики, привязка файлов в S3 и координаты интерактивных пин-меток',
    masterPage: {
      usedAt: 'ЛР3 ГУАП', rd: 'РД по моделированию', author: 'Энгельгардт К. А.',
      project: 'Samarov Studio IS', remarks: 0, revision: '2.0', status: 'work',
      reader: 'Белая Т. И.', context: 'IDEF1X',
      node: 'IDEF1X-3', title: 'Логическая модель графических материалов, версий и пин-комментариев (D3)',
      cnumber: '8', page: '8'
    },
    elements: [
      { id: 'tb_sheets', type: 'idef1x_entity', x: 40, y: 180, width: 260, isDep: true, name: 'RENDER_SHEETS (Листы)', pks: ['sheet_id: UUID (PK)'], attrs: ['stage_id: UUID (FK)', 'room_name: VARCHAR(100)', 'sheet_order: INT'] },
      { id: 'tb_versions', type: 'idef1x_entity', x: 420, y: 180, width: 260, isDep: true, name: 'RENDER_VERSIONS (Версии)', pks: ['version_id: UUID (PK)'], attrs: ['sheet_id: UUID (FK)', 's3_url: VARCHAR(500)', 'version_num: INT', 'is_current: BOOLEAN', 'uploaded_at: TIMESTAMP'] },
      { id: 'tb_pins', type: 'idef1x_entity', x: 800, y: 180, width: 270, isDep: true, name: 'PIN_COMMENTS (Замечания)', pks: ['pin_id: UUID (PK)'], attrs: ['version_id: UUID (FK)', 'author_id: UUID (FK)', 'coord_x: FLOAT', 'coord_y: FLOAT', 'comment_text: TEXT', 'status: VARCHAR(30)'] },
      { id: 'tb_attach', type: 'idef1x_entity', x: 800, y: 480, width: 270, isDep: true, name: 'PIN_ATTACHMENTS (Вложения)', pks: ['attach_id: UUID (PK)'], attrs: ['pin_id: UUID (FK)', 'file_s3_url: VARCHAR(500)', 'file_type: VARCHAR(50)'] }
    ],
    connections: [
      { id: 'r8_1', icomType: 'rel_ident', sourceId: 'tb_sheets', targetId: 'tb_versions', label: '1:N' },
      { id: 'r8_2', icomType: 'rel_ident', sourceId: 'tb_versions', targetId: 'tb_pins', label: '1:N' },
      { id: 'r8_3', icomType: 'rel_ident', sourceId: 'tb_pins', targetId: 'tb_attach', label: '1:N' }
    ]
  },

  // ── 9. IDEF1X Acts, PEP & Audit (D5) ──
  fig9_idef1x_acts_pep_audit: {
    id: 'fig9_idef1x_acts_pep_audit',
    name: '9. IDEF1X: Акты КС-2, ПЭП и аудит (D5)',
    type: 'idef1x',
    desc: 'Юридические приемочные акты, хэширование SMS-кодов SHA-256 и сквозной журнал аудита',
    masterPage: {
      usedAt: 'ЛР3 ГУАП', rd: 'РД по моделированию', author: 'Энгельгардт К. А.',
      project: 'Samarov Studio IS', remarks: 0, revision: '2.0', status: 'work',
      reader: 'Белая Т. И.', context: 'IDEF1X',
      node: 'IDEF1X-4', title: 'Логическая модель юридических актов, подписей ПЭП и журнала аудита (D5)',
      cnumber: '9', page: '9'
    },
    elements: [
      { id: 'tb_acts', type: 'idef1x_entity', x: 40, y: 180, width: 260, isDep: true, name: 'ACCEPTANCE_ACTS (Акты)', pks: ['act_id: UUID (PK)'], attrs: ['stage_id: UUID (FK)', 'act_num: VARCHAR(50)', 'pdf_s3_url: VARCHAR(500)', 'status: VARCHAR(30)'] },
      { id: 'tb_pep', type: 'idef1x_entity', x: 420, y: 180, width: 270, isDep: true, name: 'PEP_SIGNATURES (Подписи)', pks: ['sig_id: UUID (PK)'], attrs: ['act_id: UUID (FK)', 'signer_id: UUID (FK)', 'sms_code_hash: VARCHAR(64)', 'signed_at: TIMESTAMP', 'ip_address: VARCHAR(45)'] },
      { id: 'tb_sms', type: 'idef1x_entity', x: 810, y: 180, width: 260, isDep: false, name: 'SMS_VERIFICATIONS (СМС-коды)', pks: ['verif_id: UUID (PK)'], attrs: ['phone: VARCHAR(20)', 'code_hash: VARCHAR(64)', 'expires_at: TIMESTAMP', 'is_used: BOOLEAN'] },
      { id: 'tb_audit', type: 'idef1x_entity', x: 420, y: 480, width: 270, isDep: false, name: 'AUDIT_EVENTS (Журнал аудита)', pks: ['event_id: UUID (PK)'], attrs: ['user_id: UUID (FK)', 'event_type: VARCHAR(50)', 'ip_address: VARCHAR(45)', 'timestamp: TIMESTAMP'] }
    ],
    connections: [
      { id: 'r9_1', icomType: 'rel_ident', sourceId: 'tb_acts', targetId: 'tb_pep', label: '1:1' },
      { id: 'r9_2', icomType: 'rel_non', sourceId: 'tb_sms', targetId: 'tb_pep', label: '1:N' },
      { id: 'r9_3', icomType: 'rel_non', sourceId: 'tb_pep', targetId: 'tb_audit', label: '1:N' }
    ]
  },

  // ── 10. IDEF1X Supervision & Defects (D6) ──
  fig10_idef1x_supervision: {
    id: 'fig10_idef1x_supervision',
    name: '10. IDEF1X: Журнал авторского надзора (D6)',
    type: 'idef1x',
    desc: 'Выезды на стройплощадку, карточки дефектов, фотофиксация нарушений и ответы прораба',
    masterPage: {
      usedAt: 'ЛР3 ГУАП', rd: 'РД по моделированию', author: 'Энгельгардт К. А.',
      project: 'Samarov Studio IS', remarks: 0, revision: '2.0', status: 'work',
      reader: 'Белая Т. И.', context: 'IDEF1X',
      node: 'IDEF1X-5', title: 'Логическая модель журнала авторского надзора и строительных дефектов (D6)',
      cnumber: '10', page: '10'
    },
    elements: [
      { id: 'tb_visits', type: 'idef1x_entity', x: 40, y: 180, width: 260, isDep: true, name: 'SUPERVISION_VISITS (Выезды)', pks: ['visit_id: UUID (PK)'], attrs: ['project_id: UUID (FK)', 'inspector_id: UUID (FK)', 'visit_date: DATE', 'general_notes: TEXT'] },
      { id: 'tb_defects', type: 'idef1x_entity', x: 420, y: 180, width: 260, isDep: true, name: 'SITE_DEFECTS (Нарушения)', pks: ['defect_id: UUID (PK)'], attrs: ['visit_id: UUID (FK)', 'title: VARCHAR(200)', 'severity: VARCHAR(30)', 'status: VARCHAR(30)', 'due_date: DATE'] },
      { id: 'tb_photos', type: 'idef1x_entity', x: 800, y: 180, width: 260, isDep: true, name: 'DEFECT_PHOTOS (Фотофиксация)', pks: ['photo_id: UUID (PK)'], attrs: ['defect_id: UUID (FK)', 'photo_s3_url: VARCHAR(500)', 'caption: VARCHAR(200)'] },
      { id: 'tb_responses', type: 'idef1x_entity', x: 420, y: 480, width: 260, isDep: true, name: 'CONTRACTOR_RESPONSES (Ответы)', pks: ['response_id: UUID (PK)'], attrs: ['defect_id: UUID (FK)', 'contractor_id: UUID (FK)', 'comment: TEXT', 'fixed_at: TIMESTAMP'] }
    ],
    connections: [
      { id: 'r10_1', icomType: 'rel_ident', sourceId: 'tb_visits', targetId: 'tb_defects', label: '1:N' },
      { id: 'r10_2', icomType: 'rel_ident', sourceId: 'tb_defects', targetId: 'tb_photos', label: '1:N' },
      { id: 'r10_3', icomType: 'rel_ident', sourceId: 'tb_defects', targetId: 'tb_responses', label: '1:N' }
    ]
  },

  // ── 11. IDEF3 Main Process Flow ──
  fig11_idef3_main_process: {
    id: 'fig11_idef3_main_process',
    name: '11. IDEF3: Сквозной процесс дизайн-проекта',
    type: 'idef3',
    desc: 'UOB 1.1..1.5: Сквозной путь от Smart-брифа и заключения договора до ПЭП-актирования',
    masterPage: {
      usedAt: 'ЛР3 ГУАП', rd: 'РД по моделированию', author: 'Энгельгардт К. А.',
      project: 'Samarov Studio IS', remarks: 0, revision: '2.0', status: 'work',
      reader: 'Белая Т. И.', context: 'IDEF3',
      node: 'IDEF3-1', title: 'Диаграмма IDEF3: сквозной сценарий ведения дизайн-проекта и подписания по ПЭП',
      cnumber: '11', page: '11'
    },
    elements: [
      { id: 'uob11', type: 'idef3_uob', x: 40, y: 180, width: 170, height: 85, name: 'Заполнить\nSmart-бриф на сайте', uobId: '1.1', status: 'Завершено' },
      { id: 'uob12', type: 'idef3_uob', x: 270, y: 180, width: 170, height: 85, name: 'Заключить договор\nи зафиксировать SLA', uobId: '1.2', status: 'Завершено' },
      { id: 'uob13', type: 'idef3_uob', x: 500, y: 180, width: 170, height: 85, name: 'Разработать 3D-сцены\nи загрузить в S3', uobId: '1.3', status: 'Выполняется' },
      { id: 'uob14', type: 'idef3_uob', x: 730, y: 180, width: 170, height: 85, name: 'Провести ревью\n(pin-point comments)', uobId: '1.4', status: 'Ожидание' },
      { id: 'j_xor1', type: 'idef3_junction', x: 960, y: 205, width: 36, height: 36, juncType: 'X' },
      { id: 'uob15a', type: 'idef3_uob', x: 930, y: 360, width: 170, height: 85, name: 'Утвердить этап\nи подписать по ПЭП', uobId: '1.5a', status: 'Ожидание' },
      { id: 'uob15b', type: 'idef3_uob', x: 700, y: 360, width: 170, height: 85, name: 'Доработать проект\nпо замечаниям', uobId: '1.5b', status: 'Ожидание' }
    ],
    connections: [
      { id: 'p11_1', icomType: 'precedence', sourceId: 'uob11', targetId: 'uob12' },
      { id: 'p11_2', icomType: 'precedence', sourceId: 'uob12', targetId: 'uob13' },
      { id: 'p11_3', icomType: 'precedence', sourceId: 'uob13', targetId: 'uob14' },
      { id: 'p11_4', icomType: 'precedence', sourceId: 'uob14', targetId: 'j_xor1' },
      { id: 'p11_5', icomType: 'precedence', sourceId: 'j_xor1', targetId: 'uob15a', label: 'Без замечаний' },
      { id: 'p11_6', icomType: 'precedence', sourceId: 'j_xor1', targetId: 'uob15b', label: 'Есть правки' },
      { id: 'p11_7', icomType: 'precedence', sourceId: 'uob15b', targetId: 'uob13', label: 'Возврат' }
    ]
  },

  // ── 12. IDEF3 Pin Review & SLA Loop ──
  fig12_idef3_pin_review: {
    id: 'fig12_idef3_pin_review',
    name: '12. IDEF3: Цикл пин-ревью и контроль лимита правок',
    type: 'idef3',
    desc: 'Алгоритм контроля SLA: жесткое ограничение бесплатных итераций (k ≤ 2) и оплата доп. кругов',
    masterPage: {
      usedAt: 'ЛР3 ГУАП', rd: 'РД по моделированию', author: 'Энгельгардт К. А.',
      project: 'Samarov Studio IS', remarks: 0, revision: '2.0', status: 'work',
      reader: 'Белая Т. И.', context: 'IDEF3',
      node: 'IDEF3-2', title: 'Диаграмма IDEF3: сценарий интерактивного пин-комментирования и контроля лимита правок',
      cnumber: '12', page: '12'
    },
    elements: [
      { id: 'uob21', type: 'idef3_uob', x: 40, y: 180, width: 170, height: 85, name: 'Загрузить рендер\nв Client Portal', uobId: '2.1', status: 'Завершено' },
      { id: 'uob22', type: 'idef3_uob', x: 270, y: 180, width: 170, height: 85, name: 'Расставить пин-метки\nс замечаниями (x, y)', uobId: '2.2', status: 'Завершено' },
      { id: 'uob23', type: 'idef3_uob', x: 500, y: 180, width: 170, height: 85, name: 'Зафиксировать пакет\nправок и круг ревизии', uobId: '2.3', status: 'Выполняется' },
      { id: 'j_xor2', type: 'idef3_junction', x: 730, y: 205, width: 36, height: 36, juncType: 'X' },
      { id: 'uob24a', type: 'idef3_uob', x: 830, y: 120, width: 190, height: 85, name: 'Контроль SLA: k ≤ 2\n(Бесплатный круг)', uobId: '2.4a', status: 'Ожидание' },
      { id: 'uob24b', type: 'idef3_uob', x: 830, y: 280, width: 190, height: 85, name: 'Лимит исчерпан: k > 2\n(Выставить счет на доп. круг)', uobId: '2.4b', status: 'Ожидание' }
    ],
    connections: [
      { id: 'p12_1', icomType: 'precedence', sourceId: 'uob21', targetId: 'uob22' },
      { id: 'p12_2', icomType: 'precedence', sourceId: 'uob22', targetId: 'uob23' },
      { id: 'p12_3', icomType: 'precedence', sourceId: 'uob23', targetId: 'j_xor2' },
      { id: 'p12_4', icomType: 'precedence', sourceId: 'j_xor2', targetId: 'uob24a', label: 'k ≤ 2' },
      { id: 'p12_5', icomType: 'precedence', sourceId: 'j_xor2', targetId: 'uob24b', label: 'k > 2' },
      { id: 'p12_6', icomType: 'precedence', sourceId: 'uob24a', targetId: 'uob21', label: 'Внесение правок' }
    ]
  },

  // ── Blank Template ──
  blank_idef0: {
    id: 'blank_idef0',
    name: 'Чистый бланк IDEF0',
    type: 'idef0_decomp',
    desc: 'Пустая мастер-страница со штампами по ГОСТ Р 50.1.028-2001',
    masterPage: {
      usedAt: 'ЛР3 ГУАП', rd: 'РД по моделированию', author: 'Энгельгардт К. А.',
      project: 'Samarov Studio IS', remarks: 0, revision: '2.0', status: 'work',
      reader: 'Белая Т. И.', context: 'НОВЫЙ ПРОЕКТ',
      node: 'A0', title: 'Новая диаграмма', cnumber: '0', page: '1'
    },
    elements: [],
    connections: []
  }
};

window.DIAGRAM_TEMPLATES = DIAGRAM_TEMPLATES;
