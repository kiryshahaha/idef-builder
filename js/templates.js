/**
 * IDEF Builder - Standard Methodology Templates Library
 * 5 Canonical Templates with filling guidelines:
 * 1. IDEF0: Контекстная диаграмма (А-0)
 * 2. IDEF0: Диаграмма декомпозиции (А0)
 * 3. DFD: Диаграмма потоков данных (Level 1)
 * 4. IDEF1X: Информационная модель данных (ER)
 * 5. IDEF3: Диаграмма процессов и сценариев (PFDD)
 */

const DIAGRAM_TEMPLATES = {
  // ── 1. IDEF0 A-0 Context Diagram ──
  fig1_idef0_context: {
    id: 'fig1_idef0_context',
    name: '1. IDEF0: Контекстная диаграмма (А-0)',
    type: 'idef0_context',
    desc: 'Границы системы, цель, точка зрения и ICOM-интерфейсы: Входы (I), Управления (C), Выходы (O), Механизмы (M)',
    width: 1200,
    height: 820,
    masterPage: {
      usedAt: 'Организация / Учебное заведение',
      rd: 'ГОСТ Р 50.1.028-2001',
      author: 'Фамилия И. О.',
      project: 'Проектируемая система / ИС',
      remarks: 0,
      revision: '1.0',
      date1: new Date().toLocaleDateString('ru-RU'),
      date2: new Date().toLocaleDateString('ru-RU'),
      date3: new Date().toLocaleDateString('ru-RU'),
      time1: '10:00',
      time2: '11:00',
      time3: '12:00',
      status: 'work',
      reader: 'Эксперт / Проверяющий',
      readerDate: new Date().toLocaleDateString('ru-RU'),
      context: 'TOP',
      node: 'A-0',
      title: 'Выполнять основную функцию системы (Глагол или отглагольное существительное)',
      cnumber: '1',
      page: '1',
      frameStyle: 'gost'
    },
    elements: [
      {
        id: 'block_0',
        type: 'idef0_block',
        x: 370,
        y: 270,
        width: 440,
        height: 230,
        name: 'ВЫПОЛНЯТЬ ОСНОВНУЮ ФУНКЦИЮ СИСТЕМЫ\n\n(Формулируется глаголом в неопределенной форме\nили отглагольным существительным, п. 6.1 ГОСТ Р 50.1.028-2001.\nОпределяет глобальную цель и границы всей системы)',
        nodeCode: 'A-0'
      },
      {
        id: 'note_purpose',
        type: 'idef0_purpose',
        x: 40,
        y: 110,
        width: 280,
        height: 75,
        name: 'Цель: Фиксация границ системы, внешних интерфейсов и регламентации ключевой деятельности.'
      },
      {
        id: 'note_viewpoint',
        type: 'idef0_viewpoint',
        x: 40,
        y: 195,
        width: 280,
        height: 60,
        name: 'Точка зрения: Системный аналитик / Руководитель проекта'
      }
    ],
    connections: [
      {
        id: 'c_i1',
        icomType: 'input',
        label: 'ВХОД (Input): сырье, исходные данные или запросы клиентов (что преобразуется функцией)',
        p1: { x: 10, y: 340 },
        p2: { x: 370, y: 340 }
      },
      {
        id: 'c_i2',
        icomType: 'input',
        label: 'Первичные документы, заявки и файлы заказов',
        p1: { x: 10, y: 430 },
        p2: { x: 370, y: 430 }
      },
      {
        id: 'c_c1',
        icomType: 'control',
        label: 'УПРАВЛЕНИЕ (Control): законы, стандарты, ГОСТы и регламенты (правила выполнения функции)',
        p1: { x: 480, y: 90 },
        p2: { x: 480, y: 270 }
      },
      {
        id: 'c_c2',
        icomType: 'control',
        label: 'План проекта, бюджетные ограничения и технические требования',
        p1: { x: 700, y: 90 },
        p2: { x: 700, y: 270 }
      },
      {
        id: 'c_o1',
        icomType: 'output',
        label: 'ВЫХОД (Output): готовый продукт, оказанная услуга или результат обработки',
        p1: { x: 810, y: 340 },
        p2: { x: 1190, y: 340 }
      },
      {
        id: 'c_o2',
        icomType: 'output',
        label: 'Отчетная документация, финансовые акты и аналитика',
        p1: { x: 810, y: 430 },
        p2: { x: 1190, y: 430 }
      },
      {
        id: 'c_m1',
        icomType: 'mechanism',
        label: 'МЕХАНИЗМ (Mechanism): персонал, специалисты и исполнители (кто выполняет работу)',
        p1: { x: 480, y: 775 },
        p2: { x: 480, y: 500 }
      },
      {
        id: 'c_m2',
        icomType: 'mechanism',
        label: 'Информационная система, базы данных, сервера и оборудование (ресурсы)',
        p1: { x: 700, y: 775 },
        p2: { x: 700, y: 500 }
      }
    ]
  },

  // ── 2. IDEF0 A0 Decomposition ──
  fig2_idef0_decomp: {
    id: 'fig2_idef0_decomp',
    name: '2. IDEF0: Диаграмма декомпозиции (А0)',
    type: 'idef0_decomp',
    desc: 'Диагональное разбиение функции А-0 на 3–6 подпроцессов: А1, А2, А3, А4, дуги ICOM и обратная связь (Feedback loop)',
    width: 1200,
    height: 820,
    masterPage: {
      usedAt: 'Организация / Учебное заведение',
      rd: 'ГОСТ Р 50.1.028-2001',
      author: 'Фамилия И. О.',
      project: 'Проектируемая система / ИС',
      remarks: 0,
      revision: '1.0',
      date1: new Date().toLocaleDateString('ru-RU'),
      date2: new Date().toLocaleDateString('ru-RU'),
      date3: new Date().toLocaleDateString('ru-RU'),
      time1: '10:00',
      time2: '11:00',
      time3: '12:00',
      status: 'work',
      reader: 'Эксперт / Проверяющий',
      readerDate: new Date().toLocaleDateString('ru-RU'),
      context: 'A-0',
      node: 'A0',
      title: 'Декомпозиция функционального блока А-0 на подпроцессы А1–А4',
      cnumber: '2',
      page: '2',
      frameStyle: 'gost'
    },
    elements: [
      {
        id: 'blk_a1',
        type: 'idef0_block',
        x: 60,
        y: 140,
        width: 220,
        height: 110,
        nodeCode: 'A1',
        name: 'Принять и зарегистрировать\nвходные данные / заказ\n(Первичный сбор и валидация)'
      },
      {
        id: 'blk_a2',
        type: 'idef0_block',
        x: 340,
        y: 280,
        width: 220,
        height: 110,
        nodeCode: 'A2',
        name: 'Выполнить основную\nобработку и вычисления\n(Основная стадия процесса)'
      },
      {
        id: 'blk_a3',
        type: 'idef0_block',
        x: 620,
        y: 420,
        width: 220,
        height: 110,
        nodeCode: 'A3',
        name: 'Проверить качество\nи согласовать результат\n(Контроль и верификация)'
      },
      {
        id: 'blk_a4',
        type: 'idef0_block',
        x: 900,
        y: 560,
        width: 220,
        height: 110,
        nodeCode: 'A4',
        name: 'Сформировать отчетность\nи передать результат\n(Финальная сдача заказчику)'
      }
    ],
    connections: [
      { id: 'd_i1', icomType: 'input', label: 'Входные запросы и исходные материалы', p1: { x: 10, y: 175 }, p2: { x: 60, y: 175 } },
      { id: 'd_f1', icomType: 'output', label: 'Зарегистрированные и проверенные данные', p1: { x: 280, y: 180, side: 'right' }, p2: { x: 340, y: 350, side: 'left' } },
      { id: 'd_f2', icomType: 'output', label: 'Проект решения для экспертизы', p1: { x: 560, y: 320, side: 'right' }, p2: { x: 620, y: 450, side: 'left' } },
      { id: 'd_f3', icomType: 'output', label: 'Утвержденный результат', p1: { x: 840, y: 460, side: 'right' }, p2: { x: 900, y: 590, side: 'left' } },
      { id: 'd_loop', icomType: 'control', label: 'Замечания и возврат на доработку (обратная связь)', p1: { x: 680, y: 530, side: 'bottom' }, p2: { x: 450, y: 390, side: 'bottom' } },
      { id: 'd_c1', icomType: 'control', label: 'Регламент приема', p1: { x: 140, y: 90 }, p2: { x: 140, y: 140 } },
      { id: 'd_c2', icomType: 'control', label: 'Стандарты обработки', p1: { x: 420, y: 90 }, p2: { x: 420, y: 280 } },
      { id: 'd_c3', icomType: 'control', label: 'Критерии контроля качества', p1: { x: 700, y: 90 }, p2: { x: 700, y: 420 } },
      { id: 'd_c4', icomType: 'control', label: 'Правила сдачи и закрытия', p1: { x: 980, y: 90 }, p2: { x: 980, y: 560 } },
      { id: 'd_o1', icomType: 'output', label: 'Готовый продукт / результат услуги', p1: { x: 1120, y: 595 }, p2: { x: 1190, y: 595 } },
      { id: 'd_o2', icomType: 'output', label: 'Итоговая отчетность и акты', p1: { x: 1120, y: 635 }, p2: { x: 1190, y: 635 } },
      { id: 'd_m1', icomType: 'mechanism', label: 'Оператор приема', p1: { x: 170, y: 775 }, p2: { x: 170, y: 250 } },
      { id: 'd_m2', icomType: 'mechanism', label: 'Инженеры и ИС', p1: { x: 450, y: 775 }, p2: { x: 450, y: 390 } },
      { id: 'd_m3', icomType: 'mechanism', label: 'Отдел контроля качества', p1: { x: 730, y: 775 }, p2: { x: 730, y: 530 } },
      { id: 'd_m4', icomType: 'mechanism', label: 'Менеджер сдачи проекта', p1: { x: 1010, y: 775 }, p2: { x: 1010, y: 670 } }
    ]
  },

  // ── 3. DFD Level 1 Data Flow Diagram ──
  fig3_dfd_level1: {
    id: 'fig3_dfd_level1',
    name: '3. DFD: Диаграмма потоков данных',
    type: 'dfd',
    desc: 'Моделирование движения информации: внешние сущности (источники/приемники), функциональные процессы P1–P3 и накопители D1–D3',
    width: 1280,
    height: 840,
    masterPage: {
      title: 'DFD — Схема потоков данных системы',
      dfdSubtitle: 'Внешние сущности (источники и приемники), процессы обработки данных P1–P3, накопители D1–D3',
      dfdLegend: 'Прямоугольник — внешняя сущность (источник/приемник); скруглённый прямоугольник — процесс преобразования данных; открытый прямоугольник (D) — накопитель (хранилище данных); стрелки — потоки передаваемых данных.',
      dfdNote: 'Накопители данных D обеспечивают асинхронное хранение состояния; стрелки от процесса к накопителю означают запись, от накопителя к процессу — чтение.',
      dfdFooterMeta: 'Методология Гейна-Сарсона / Йордона | Пример заполнения DFD | 2026',
      frameStyle: 'dfd'
    },
    elements: [
      {
        id: 'dfd_ent_1',
        type: 'dfd_entity',
        x: 40,
        y: 160,
        width: 180,
        height: 75,
        name: 'ВНЕШНЯЯ СУЩНОСТЬ\n(Клиент / Пользователь)\n[Источник запросов]'
      },
      {
        id: 'dfd_proc_1',
        type: 'dfd_process',
        x: 290,
        y: 155,
        width: 230,
        height: 85,
        procId: 'P1',
        name: 'Прием запроса и первичная\nпроверка формата данных'
      },
      {
        id: 'dfd_store_1',
        type: 'dfd_store',
        x: 290,
        y: 350,
        width: 230,
        height: 60,
        storeId: 'D1',
        name: 'Журнал входящих запросов\n(Таблица транзакций / Очередь)'
      },
      {
        id: 'dfd_proc_2',
        type: 'dfd_process',
        x: 590,
        y: 340,
        width: 240,
        height: 85,
        procId: 'P2',
        name: 'Основная бизнес-логика\nи аналитические расчеты'
      },
      {
        id: 'dfd_store_2',
        type: 'dfd_store',
        x: 590,
        y: 165,
        width: 240,
        height: 60,
        storeId: 'D2',
        name: 'Основная база данных сущностей\n(Справочники и профили)'
      },
      {
        id: 'dfd_proc_3',
        type: 'dfd_process',
        x: 910,
        y: 340,
        width: 240,
        height: 85,
        procId: 'P3',
        name: 'Формирование отчета\nи отправка уведомлений'
      },
      {
        id: 'dfd_store_3',
        type: 'dfd_store',
        x: 910,
        y: 510,
        width: 240,
        height: 60,
        storeId: 'D3',
        name: 'Архив сформированных отчетов\n(Хранилище документов / S3)'
      },
      {
        id: 'dfd_ent_2',
        type: 'dfd_entity',
        x: 910,
        y: 160,
        width: 180,
        height: 75,
        name: 'ВНЕШНЯЯ СУЩНОСТЬ\n(Оператор / Получатель)\n[Интерфейс / Админ]'
      }
    ],
    connections: [
      { id: 'dfd_c1', icomType: 'dataflow', label: '1. Запрос с входными параметрами', p1: { x: 220, y: 195 }, p2: { x: 290, y: 195 } },
      { id: 'dfd_c2', icomType: 'dataflow', label: '2. Запись новой транзакции', p1: { x: 405, y: 240 }, p2: { x: 405, y: 350 } },
      { id: 'dfd_c3', icomType: 'dataflow', label: '3. Чтение транзакции в обработку', p1: { x: 520, y: 380 }, p2: { x: 590, y: 380 } },
      { id: 'dfd_c4', icomType: 'dataflow', label: '4. Справочные данные и профиль', p1: { x: 670, y: 225 }, p2: { x: 670, y: 340 } },
      { id: 'dfd_c5', icomType: 'dataflow', label: '5. Обновление состояния сущности', p1: { x: 750, y: 340 }, p2: { x: 750, y: 225 } },
      { id: 'dfd_c6', icomType: 'dataflow', label: '6. Рассчитанный результат', p1: { x: 830, y: 380 }, p2: { x: 910, y: 380 } },
      { id: 'dfd_c7', icomType: 'dataflow', label: '7. Сохранение архивной копии', p1: { x: 1030, y: 425 }, p2: { x: 1030, y: 510 } },
      { id: 'dfd_c8', icomType: 'dataflow', label: '8. Итоговый отчет и уведомление', p1: { x: 1000, y: 340 }, p2: { x: 1000, y: 235 } }
    ]
  },

  // ── 4. IDEF1X Entity Relationship Model ──
  fig4_idef1x: {
    id: 'fig4_idef1x',
    name: '4. IDEF1X: Информационная модель данных (ER)',
    type: 'idef1x',
    desc: 'Реляционная структура данных (NIST FIPS PUB 184): независимые и зависимые сущности, первичные (PK) и внешние (FK) ключи, мощности связей',
    width: 1280,
    height: 840,
    masterPage: {
      usedAt: 'Beeline Business',
      rd: 'NIST FIPS PUB 184',
      author: 'Энгельгардт К. А.',
      project: 'Beeline Business',
      remarks: 0,
      revision: '1.0',
      date1: '08.10.2026',
      date2: '08.10.2026',
      date3: '08.10.2026',
      status: 'work',
      title: 'IDEF1X — команды, ключи повторов и аудит',
      dfdSubtitle: 'IDEF1X: сплошная — идентифицирующая (зависимая сущность со скруглённым блоком); штриховая — неидентифицирующая; точка у потомка — 0..*, Z — 0..1, P — 1..* (Z/P заменяют точку); ромб у родителя — необязательная связь',
      dfdFooterMeta: 'Beeline Business | ЛР3 | IDEF1X | Лист 7',
      frameStyle: 'idef1x'
    },
    elements: [
      {
        id: 'idef1x_parent',
        type: 'idef1x_entity',
        x: 60,
        y: 180,
        width: 290,
        height: 180,
        name: 'РОДИТЕЛЬСКАЯ СУЩНОСТЬ\n(Независимая таблица)',
        isDep: false,
        pks: ['PK  parent_id : Integer  -- Первичный ключ'],
        attrs: [
          '    code : Varchar(50)   -- Уникальный код',
          '    name : Varchar(150)  -- Наименование',
          '    created_at : DateTime -- Дата регистрации',
          '    is_active : Boolean  -- Флаг активности'
        ]
      },
      {
        id: 'idef1x_child_dep',
        type: 'idef1x_entity',
        x: 480,
        y: 180,
        width: 320,
        height: 210,
        name: 'ЗАВИСИМАЯ СУЩНОСТЬ\n(Идентифицируемая связь)',
        isDep: true,
        pks: [
          'PK  item_id : Integer   -- Собственный ключ',
          'PK  FK  parent_id : Integer -- Часть составного PK'
        ],
        attrs: [
          '    title : Varchar(100) -- Заголовок записи',
          '    quantity : Integer   -- Количество элементов',
          '    price : Decimal(12,2) -- Стоимость позиции',
          '    status : Varchar(20) -- Текущий статус'
        ]
      },
      {
        id: 'idef1x_lookup',
        type: 'idef1x_entity',
        x: 910,
        y: 180,
        width: 290,
        height: 160,
        name: 'СПРАВОЧНИК КАТЕГОРИЙ\n(Справочная таблица)',
        isDep: false,
        pks: ['PK  category_id : Integer -- Первичный ключ'],
        attrs: [
          '    cat_code : Varchar(30) -- Системный код',
          '    cat_title : Varchar(100) -- Название категории',
          '    description : Text    -- Описание'
        ]
      },
      {
        id: 'idef1x_non_dep',
        type: 'idef1x_entity',
        x: 480,
        y: 490,
        width: 320,
        height: 200,
        name: 'СВЯЗАННЫЙ ДОКУМЕНТ\n(Неидентифицируемая связь)',
        isDep: false,
        pks: ['PK  doc_id : Integer    -- Первичный ключ'],
        attrs: [
          'FK  parent_id : Integer   -- Внешний ключ в не-PK',
          'FK  category_id : Integer -- Ссылка на категорию',
          '    doc_number : String   -- Номер документа',
          '    doc_date : Date       -- Дата составления'
        ]
      }
    ],
    connections: [
      {
        id: 'rel_1',
        icomType: 'rel_ident',
        label: 'Идентифицирующая связь (1 к N, PK предка входит в составной PK потомка)',
        cardinality: 'dot',
        p1: { x: 350, y: 270, side: 'right' },
        p2: { x: 480, y: 270, side: 'left' }
      },
      {
        id: 'rel_2',
        icomType: 'rel_non',
        label: 'Неидентифицирующая связь (1 к N, FK размещен в неключевых атрибутах)',
        cardinality: 'dot',
        p1: { x: 205, y: 360, side: 'bottom' },
        p2: { x: 480, y: 580, side: 'left' }
      },
      {
        id: 'rel_3',
        icomType: 'rel_opt',
        label: 'Необязательная связь (0..1 к N, ромб указывает на возможность NULL)',
        cardinality: 'dot',
        p1: { x: 1055, y: 340, side: 'bottom' },
        p2: { x: 800, y: 580, side: 'right' }
      }
    ]
  },

  // ── 5. IDEF3 Process Flow Diagram (PFDD) ──
  fig5_idef3: {
    id: 'fig5_idef3',
    name: '5. IDEF3: Диаграмма процессов и сценариев (PFDD)',
    type: 'idef3',
    desc: 'Описание сценария выполнения процессов: единицы работы (UOB), перекрестки ветвления и слияния (AND, OR, XOR) и связи предшествования',
    width: 1280,
    height: 840,
    masterPage: {
      usedAt: 'Beeline Business',
      rd: 'IEEE 1320.2 / IDEF3',
      author: 'Энгельгардт К. А.',
      project: 'Beeline Business',
      remarks: 0,
      revision: '1.0',
      date1: '08.10.2026',
      date2: '08.10.2026',
      date3: '08.10.2026',
      status: 'work',
      title: 'IDEF3 — дневное планирование и публикация',
      dfdSubtitle: 'UOB — единица поведения; X в круге — взаимоисключающая развилка (XOR)',
      dfdNote: 'Повтор того же ключа возвращает сохранённый результат. Отказ, конфликт или отказ в проверке завершаются без частичной публикации.',
      dfdFooterMeta: 'Beeline Business | ЛР3 | IDEF3 | Сценарий 1 | 08.10.2026',
      frameStyle: 'idef3'
    },
    elements: [
      {
        id: 'uob_1',
        type: 'idef3_uob',
        x: 50,
        y: 340,
        width: 200,
        height: 95,
        uobId: '1.1',
        name: 'Инициировать сценарий\nи проверить условия старта\n[UOB 1.1 — Начало]'
      },
      {
        id: 'junc_and_split',
        type: 'idef3_junction',
        x: 290,
        y: 365,
        width: 48,
        height: 48,
        juncType: 'and',
        name: '&'
      },
      {
        id: 'uob_2a',
        type: 'idef3_uob',
        x: 380,
        y: 210,
        width: 210,
        height: 95,
        uobId: '1.2',
        name: 'Параллельный поток А:\nТехническая обработка данных\n[UOB 1.2 — Поток А]'
      },
      {
        id: 'uob_2b',
        type: 'idef3_uob',
        x: 380,
        y: 470,
        width: 210,
        height: 95,
        uobId: '1.3',
        name: 'Параллельный поток Б:\nФинансовая проверка и аудит\n[UOB 1.3 — Поток Б]'
      },
      {
        id: 'junc_and_join',
        type: 'idef3_junction',
        x: 640,
        y: 365,
        width: 48,
        height: 48,
        juncType: 'and',
        name: '&'
      },
      {
        id: 'junc_xor_split',
        type: 'idef3_junction',
        x: 730,
        y: 365,
        width: 48,
        height: 48,
        juncType: 'xor',
        name: 'X'
      },
      {
        id: 'uob_ok',
        type: 'idef3_uob',
        x: 830,
        y: 230,
        width: 220,
        height: 95,
        uobId: '1.4',
        name: 'Успешный исход:\nУтвердить и завершить процесс\n[UOB 1.4 — Успех]'
      },
      {
        id: 'uob_err',
        type: 'idef3_uob',
        x: 830,
        y: 470,
        width: 220,
        height: 95,
        uobId: '1.5',
        name: 'Исключительный исход:\nОформить отказ и направить на доработку\n[UOB 1.5 — Отказ]'
      }
    ],
    connections: [
      { id: 'p_1', icomType: 'precedence', label: 'Старт', p1: { x: 250, y: 387 }, p2: { x: 290, y: 387 } },
      { id: 'p_2a', icomType: 'precedence', label: 'Поток А', p1: { x: 338, y: 375 }, p2: { x: 380, y: 257 } },
      { id: 'p_2b', icomType: 'precedence', label: 'Поток Б', p1: { x: 338, y: 400 }, p2: { x: 380, y: 517 } },
      { id: 'p_3a', icomType: 'precedence', label: 'Завершен А', p1: { x: 590, y: 257 }, p2: { x: 640, y: 375 } },
      { id: 'p_3b', icomType: 'precedence', label: 'Завершен Б', p1: { x: 590, y: 517 }, p2: { x: 640, y: 400 } },
      { id: 'p_4', icomType: 'precedence', label: 'Оба готовы (&)', p1: { x: 688, y: 389 }, p2: { x: 730, y: 389 } },
      { id: 'p_ok', icomType: 'precedence', label: 'Условие: Данные валидны', p1: { x: 778, y: 375 }, p2: { x: 830, y: 277 } },
      { id: 'p_err', icomType: 'precedence', label: 'Условие: Обнаружены ошибки', p1: { x: 778, y: 400 }, p2: { x: 830, y: 517 } }
    ]
  },

    // ── Лист 1.2: Заказчик (Клиент) ──
  samarov_idef0_client: {
    "version": "1.0",
    "standard": "GOST R 50.1.028-2001",
    "id": "samarov_idef0_client",
    "name": "Лист 1.2: Заказчик (Клиент)",
    "type": "idef0_decomp",
    "width": 1520,
    "height": 760,
    "masterPage": {
      "usedAt": "ГУАП, Кафедра № 43",
      "rd": "ГОСТ Р 50.1.028-2001",
      "author": "Энгельгардт К. А.",
      "project": "ИС «Samarov Studio»",
      "remarks": 0,
      "revision": "1.0",
      "date1": "22.10.2026",
      "date2": "22.10.2026",
      "date3": "22.10.2026",
      "time1": "10:00",
      "time2": "11:00",
      "time3": "12:00",
      "status": "work",
      "reader": "Белая Т. И.",
      "readerDate": "22.10.2026",
      "context": "A-0",
      "node": "A0",
      "title": "IDEF0: Декомпозиция деятельности актора «Заказчик (Клиент)»",
      "cnumber": "1.2",
      "page": "1.2",
      "frameStyle": "academic",
      "dfdSubtitle": "Функциональная декомпозиция на узлы A1–A4 в целевой модели процессов студии",
      "dfdLegend": "ГУАП | Кафедра № 43 | Дисциплина: Проектирование программных систем | Преподаватель: доц. Белая Т. И.",
      "dfdFooterMeta": "Студент: Энгельгардт К. А., гр. 4434 | ИС «Samarov Studio» | Лист 1.2",
      "caption": "Диаграмма IDEF0 (A0): декомпозиция функциональных задач — Заказчик (Клиент)"
    },
    "elements": [
      {
        "id": "blk_a1",
        "type": "idef0_block",
        "x": 80,
        "y": 140,
        "width": 230,
        "height": 85,
        "nodeCode": "A1",
        "name": "Заполнение Smart-брифа\nи заключение договора"
      },
      {
        "id": "blk_a2",
        "type": "idef0_block",
        "x": 420,
        "y": 240,
        "width": 230,
        "height": 85,
        "nodeCode": "A2",
        "name": "Согласование вариантов\nперепланировки и зонирования"
      },
      {
        "id": "blk_a3",
        "type": "idef0_block",
        "x": 760,
        "y": 340,
        "width": 240,
        "height": 85,
        "nodeCode": "A3",
        "name": "Интерактивное пин-ревью\n3D-визуализаций интерьера"
      },
      {
        "id": "blk_a4",
        "type": "idef0_block",
        "x": 1110,
        "y": 440,
        "width": 240,
        "height": 85,
        "nodeCode": "A4",
        "name": "Приемка рабочего альбома,\nподписание актов по ПЭП"
      }
    ],
    "connections": [
      {
        "id": "c_1",
        "icomType": "input",
        "label": "Потребность и БТИ",
        "points": [
          {
            "x": 40,
            "y": 160
          },
          {
            "x": 80,
            "y": 160
          }
        ]
      },
      {
        "id": "c_2",
        "icomType": "input",
        "label": "Аванс (30%)",
        "points": [
          {
            "x": 40,
            "y": 190
          },
          {
            "x": 80,
            "y": 190
          }
        ]
      },
      {
        "id": "c_3",
        "icomType": "output",
        "label": "Договор и бриф",
        "points": [
          {
            "x": 310,
            "y": 180
          },
          {
            "x": 360,
            "y": 180
          },
          {
            "x": 360,
            "y": 260
          },
          {
            "x": 420,
            "y": 260
          }
        ]
      },
      {
        "id": "c_4",
        "icomType": "output",
        "label": "Утвержденная планировка",
        "points": [
          {
            "x": 650,
            "y": 280
          },
          {
            "x": 700,
            "y": 280
          },
          {
            "x": 700,
            "y": 360
          },
          {
            "x": 760,
            "y": 360
          }
        ]
      },
      {
        "id": "c_5",
        "icomType": "output",
        "label": "Утвержденные 3D-сцены",
        "points": [
          {
            "x": 1000,
            "y": 380
          },
          {
            "x": 1050,
            "y": 380
          },
          {
            "x": 1050,
            "y": 460
          },
          {
            "x": 1110,
            "y": 460
          }
        ]
      },
      {
        "id": "c_6",
        "icomType": "output",
        "label": "Пин-замечания (k ≤ 2)",
        "points": [
          {
            "x": 1000,
            "y": 360
          },
          {
            "x": 1030,
            "y": 360
          },
          {
            "x": 1030,
            "y": 310
          },
          {
            "x": 790,
            "y": 310
          },
          {
            "x": 790,
            "y": 340
          }
        ]
      },
      {
        "id": "c_7",
        "icomType": "control",
        "label": "Пожелания к стилю",
        "points": [
          {
            "x": 190,
            "y": 85
          },
          {
            "x": 190,
            "y": 140
          }
        ]
      },
      {
        "id": "c_8",
        "icomType": "control",
        "label": "Сценарии жизни семьи",
        "points": [
          {
            "x": 530,
            "y": 85
          },
          {
            "x": 530,
            "y": 240
          }
        ]
      },
      {
        "id": "c_9",
        "icomType": "control",
        "label": "Регламент правок (SLA)",
        "points": [
          {
            "x": 880,
            "y": 85
          },
          {
            "x": 880,
            "y": 340
          }
        ]
      },
      {
        "id": "c_10",
        "icomType": "control",
        "label": "Условия сдачи (63-ФЗ)",
        "points": [
          {
            "x": 1230,
            "y": 85
          },
          {
            "x": 1230,
            "y": 440
          }
        ]
      },
      {
        "id": "c_11",
        "icomType": "output",
        "label": "Подписанный договор",
        "points": [
          {
            "x": 310,
            "y": 160
          },
          {
            "x": 1440,
            "y": 160
          }
        ]
      },
      {
        "id": "c_12",
        "icomType": "output",
        "label": "Согласованный план",
        "points": [
          {
            "x": 650,
            "y": 260
          },
          {
            "x": 1440,
            "y": 260
          }
        ]
      },
      {
        "id": "c_13",
        "icomType": "output",
        "label": "Принятые рендеры",
        "points": [
          {
            "x": 1000,
            "y": 400
          },
          {
            "x": 1440,
            "y": 400
          }
        ]
      },
      {
        "id": "c_14",
        "icomType": "output",
        "label": "Подписанный итоговый акт и оплата",
        "points": [
          {
            "x": 1350,
            "y": 480
          },
          {
            "x": 1440,
            "y": 480
          }
        ]
      },
      {
        "id": "c_15",
        "icomType": "mechanism",
        "label": "Smart-бриф ИС",
        "points": [
          {
            "x": 150,
            "y": 600
          },
          {
            "x": 150,
            "y": 225
          }
        ]
      },
      {
        "id": "c_16",
        "icomType": "mechanism",
        "label": "Вьюер чертежей ЛК",
        "points": [
          {
            "x": 490,
            "y": 600
          },
          {
            "x": 490,
            "y": 325
          }
        ]
      },
      {
        "id": "c_17",
        "icomType": "mechanism",
        "label": "Модуль пин-меток",
        "points": [
          {
            "x": 840,
            "y": 600
          },
          {
            "x": 840,
            "y": 425
          }
        ]
      },
      {
        "id": "c_18",
        "icomType": "mechanism",
        "label": "Сервис ПЭП и эквайринг",
        "points": [
          {
            "x": 1190,
            "y": 600
          },
          {
            "x": 1190,
            "y": 525
          }
        ]
      }
    ],
    "desc": "Декомпозиция А1–А4 целевой модели процессов «Samarov Studio» (Лист 1.2: Заказчик (Клиент))"
  },

  // ── Лист 2.2: Руководитель студии / Арт-директор (Глен Самаров) ──
  samarov_idef0_art_director: {
    "version": "1.0",
    "standard": "GOST R 50.1.028-2001",
    "id": "samarov_idef0_art_director",
    "name": "Лист 2.2: Руководитель студии / Арт-директор (Глен Самаров)",
    "type": "idef0_decomp",
    "width": 1520,
    "height": 760,
    "masterPage": {
      "usedAt": "ГУАП, Кафедра № 43",
      "rd": "ГОСТ Р 50.1.028-2001",
      "author": "Энгельгардт К. А.",
      "project": "ИС «Samarov Studio»",
      "remarks": 0,
      "revision": "1.0",
      "date1": "22.10.2026",
      "date2": "22.10.2026",
      "date3": "22.10.2026",
      "time1": "10:00",
      "time2": "11:00",
      "time3": "12:00",
      "status": "work",
      "reader": "Белая Т. И.",
      "readerDate": "22.10.2026",
      "context": "A-0",
      "node": "A0",
      "title": "IDEF0: Декомпозиция деятельности актора «Руководитель студии / Арт-директор (Глен Самаров)»",
      "cnumber": "2.2",
      "page": "2.2",
      "frameStyle": "academic",
      "dfdSubtitle": "Функциональная декомпозиция на узлы A1–A4 в целевой модели процессов студии",
      "dfdLegend": "ГУАП | Кафедра № 43 | Дисциплина: Проектирование программных систем | Преподаватель: доц. Белая Т. И.",
      "dfdFooterMeta": "Студент: Энгельгардт К. А., гр. 4434 | ИС «Samarov Studio» | Лист 2.2",
      "caption": "Диаграмма IDEF0 (A0): декомпозиция функциональных задач — Руководитель студии / Арт-директор (Глен Самаров)"
    },
    "elements": [
      {
        "id": "blk_a1",
        "type": "idef0_block",
        "x": 80,
        "y": 140,
        "width": 240,
        "height": 85,
        "nodeCode": "A1",
        "name": "Проведение первичных переговоров\nи онлайн-консультаций"
      },
      {
        "id": "blk_a2",
        "type": "idef0_block",
        "x": 420,
        "y": 240,
        "width": 240,
        "height": 85,
        "nodeCode": "A2",
        "name": "Утверждение творческой концепции\nи функционального зонирования"
      },
      {
        "id": "blk_a3",
        "type": "idef0_block",
        "x": 760,
        "y": 340,
        "width": 240,
        "height": 85,
        "nodeCode": "A3",
        "name": "Арт-дирекшн 3D-визуализаций\nи качества рабочих чертежей"
      },
      {
        "id": "blk_a4",
        "type": "idef0_block",
        "x": 1110,
        "y": 440,
        "width": 240,
        "height": 85,
        "nodeCode": "A4",
        "name": "Ведение авторского надзора\nи контроль устранения брака"
      }
    ],
    "connections": [
      {
        "id": "c_1",
        "icomType": "input",
        "label": "Заявка на консультацию",
        "points": [
          {
            "x": 40,
            "y": 160
          },
          {
            "x": 80,
            "y": 160
          }
        ]
      },
      {
        "id": "c_2",
        "icomType": "input",
        "label": "Запрос на полный проект",
        "points": [
          {
            "x": 40,
            "y": 190
          },
          {
            "x": 80,
            "y": 190
          }
        ]
      },
      {
        "id": "c_3",
        "icomType": "output",
        "label": "Заключенный договор",
        "points": [
          {
            "x": 320,
            "y": 180
          },
          {
            "x": 370,
            "y": 180
          },
          {
            "x": 370,
            "y": 260
          },
          {
            "x": 420,
            "y": 260
          }
        ]
      },
      {
        "id": "c_4",
        "icomType": "output",
        "label": "Утвержденный эскиз",
        "points": [
          {
            "x": 660,
            "y": 280
          },
          {
            "x": 710,
            "y": 280
          },
          {
            "x": 710,
            "y": 360
          },
          {
            "x": 760,
            "y": 360
          }
        ]
      },
      {
        "id": "c_5",
        "icomType": "output",
        "label": "Выпущенный дизайн-бук",
        "points": [
          {
            "x": 1000,
            "y": 380
          },
          {
            "x": 1050,
            "y": 380
          },
          {
            "x": 1050,
            "y": 460
          },
          {
            "x": 1110,
            "y": 460
          }
        ]
      },
      {
        "id": "c_6",
        "icomType": "output",
        "label": "Корректировка стилистики",
        "points": [
          {
            "x": 1000,
            "y": 360
          },
          {
            "x": 1030,
            "y": 360
          },
          {
            "x": 1030,
            "y": 310
          },
          {
            "x": 600,
            "y": 310
          },
          {
            "x": 600,
            "y": 325
          }
        ]
      },
      {
        "id": "c_7",
        "icomType": "control",
        "label": "Стандарты консультаций",
        "points": [
          {
            "x": 200,
            "y": 85
          },
          {
            "x": 200,
            "y": 140
          }
        ]
      },
      {
        "id": "c_8",
        "icomType": "control",
        "label": "Авторский стиль студии",
        "points": [
          {
            "x": 540,
            "y": 85
          },
          {
            "x": 540,
            "y": 240
          }
        ]
      },
      {
        "id": "c_9",
        "icomType": "control",
        "label": "Строительные нормы и ГОСТ",
        "points": [
          {
            "x": 880,
            "y": 85
          },
          {
            "x": 880,
            "y": 340
          }
        ]
      },
      {
        "id": "c_10",
        "icomType": "control",
        "label": "Регламент авторского надзора",
        "points": [
          {
            "x": 1230,
            "y": 85
          },
          {
            "x": 1230,
            "y": 440
          }
        ]
      },
      {
        "id": "c_11",
        "icomType": "output",
        "label": "PDF-резюме консультации",
        "points": [
          {
            "x": 320,
            "y": 160
          },
          {
            "x": 1440,
            "y": 160
          }
        ]
      },
      {
        "id": "c_12",
        "icomType": "output",
        "label": "Утвержденная концепция",
        "points": [
          {
            "x": 660,
            "y": 260
          },
          {
            "x": 1440,
            "y": 260
          }
        ]
      },
      {
        "id": "c_13",
        "icomType": "output",
        "label": "Финальный комплект проекта",
        "points": [
          {
            "x": 1000,
            "y": 400
          },
          {
            "x": 1440,
            "y": 400
          }
        ]
      },
      {
        "id": "c_14",
        "icomType": "output",
        "label": "Электронный журнал надзора и тикеты прорабу",
        "points": [
          {
            "x": 1350,
            "y": 480
          },
          {
            "x": 1440,
            "y": 480
          }
        ]
      },
      {
        "id": "c_15",
        "icomType": "mechanism",
        "label": "Календарь онлайн-записи",
        "points": [
          {
            "x": 160,
            "y": 600
          },
          {
            "x": 160,
            "y": 225
          }
        ]
      },
      {
        "id": "c_16",
        "icomType": "mechanism",
        "label": "Studio Workspace",
        "points": [
          {
            "x": 500,
            "y": 600
          },
          {
            "x": 500,
            "y": 325
          }
        ]
      },
      {
        "id": "c_17",
        "icomType": "mechanism",
        "label": "Вьюер проектных файлов ИС",
        "points": [
          {
            "x": 840,
            "y": 600
          },
          {
            "x": 840,
            "y": 425
          }
        ]
      },
      {
        "id": "c_18",
        "icomType": "mechanism",
        "label": "Мобильный модуль надзора",
        "points": [
          {
            "x": 1190,
            "y": 600
          },
          {
            "x": 1190,
            "y": 525
          }
        ]
      }
    ],
    "desc": "Декомпозиция А1–А4 целевой модели процессов «Samarov Studio» (Лист 2.2: Руководитель студии / Арт-директор (Глен Самаров))"
  },

  // ── Лист 3.2: Ведущий архитектор-дизайнер ──
  samarov_idef0_lead_architect: {
    "version": "1.0",
    "standard": "GOST R 50.1.028-2001",
    "id": "samarov_idef0_lead_architect",
    "name": "Лист 3.2: Ведущий архитектор-дизайнер",
    "type": "idef0_decomp",
    "width": 1520,
    "height": 760,
    "masterPage": {
      "usedAt": "ГУАП, Кафедра № 43",
      "rd": "ГОСТ Р 50.1.028-2001",
      "author": "Энгельгардт К. А.",
      "project": "ИС «Samarov Studio»",
      "remarks": 0,
      "revision": "1.0",
      "date1": "22.10.2026",
      "date2": "22.10.2026",
      "date3": "22.10.2026",
      "time1": "10:00",
      "time2": "11:00",
      "time3": "12:00",
      "status": "work",
      "reader": "Белая Т. И.",
      "readerDate": "22.10.2026",
      "context": "A-0",
      "node": "A0",
      "title": "IDEF0: Декомпозиция деятельности актора «Ведущий архитектор-дизайнер»",
      "cnumber": "3.2",
      "page": "3.2",
      "frameStyle": "academic",
      "dfdSubtitle": "Функциональная декомпозиция на узлы A1–A4 в целевой модели процессов студии",
      "dfdLegend": "ГУАП | Кафедра № 43 | Дисциплина: Проектирование программных систем | Преподаватель: доц. Белая Т. И.",
      "dfdFooterMeta": "Студент: Энгельгардт К. А., гр. 4434 | ИС «Samarov Studio» | Лист 3.2",
      "caption": "Диаграмма IDEF0 (A0): декомпозиция функциональных задач — Ведущий архитектор-дизайнер"
    },
    "elements": [
      {
        "id": "blk_a1",
        "type": "idef0_block",
        "x": 80,
        "y": 140,
        "width": 240,
        "height": 85,
        "nodeCode": "A1",
        "name": "Выезд на замеры и построение\nцифрового обмерного плана"
      },
      {
        "id": "blk_a2",
        "type": "idef0_block",
        "x": 420,
        "y": 240,
        "width": 240,
        "height": 85,
        "nodeCode": "A2",
        "name": "Разработка планировочных решений\nи функционального зонирования"
      },
      {
        "id": "blk_a3",
        "type": "idef0_block",
        "x": 760,
        "y": 340,
        "width": 240,
        "height": 85,
        "nodeCode": "A3",
        "name": "Постановка ТЗ визуализатору\nи контроль сборки 3D-сцен"
      },
      {
        "id": "blk_a4",
        "type": "idef0_block",
        "x": 1110,
        "y": 440,
        "width": 240,
        "height": 85,
        "nodeCode": "A4",
        "name": "Обработка пин-замечаний\nи выпуск чистового альбома"
      }
    ],
    "connections": [
      {
        "id": "c_1",
        "icomType": "input",
        "label": "БТИ и доступ на объект",
        "points": [
          {
            "x": 40,
            "y": 160
          },
          {
            "x": 80,
            "y": 160
          }
        ]
      },
      {
        "id": "c_2",
        "icomType": "input",
        "label": "Smart-бриф",
        "points": [
          {
            "x": 40,
            "y": 190
          },
          {
            "x": 80,
            "y": 190
          }
        ]
      },
      {
        "id": "c_3",
        "icomType": "output",
        "label": "Обмерный план в CAD",
        "points": [
          {
            "x": 320,
            "y": 180
          },
          {
            "x": 370,
            "y": 180
          },
          {
            "x": 370,
            "y": 260
          },
          {
            "x": 420,
            "y": 260
          }
        ]
      },
      {
        "id": "c_4",
        "icomType": "output",
        "label": "Утвержденная планировка",
        "points": [
          {
            "x": 660,
            "y": 280
          },
          {
            "x": 710,
            "y": 280
          },
          {
            "x": 710,
            "y": 360
          },
          {
            "x": 760,
            "y": 360
          }
        ]
      },
      {
        "id": "c_5",
        "icomType": "output",
        "label": "Пакет 3D-рендеров в S3",
        "points": [
          {
            "x": 1000,
            "y": 380
          },
          {
            "x": 1050,
            "y": 380
          },
          {
            "x": 1050,
            "y": 460
          },
          {
            "x": 1110,
            "y": 460
          }
        ]
      },
      {
        "id": "c_6",
        "icomType": "output",
        "label": "Правки по пин-меткам (k ≤ 2)",
        "points": [
          {
            "x": 1110,
            "y": 490
          },
          {
            "x": 740,
            "y": 490
          },
          {
            "x": 740,
            "y": 400
          },
          {
            "x": 760,
            "y": 400
          }
        ]
      },
      {
        "id": "c_7",
        "icomType": "control",
        "label": "Инструкция по лазерному обмеру",
        "points": [
          {
            "x": 200,
            "y": 85
          },
          {
            "x": 200,
            "y": 140
          }
        ]
      },
      {
        "id": "c_8",
        "icomType": "control",
        "label": "Эргономика и СНиП",
        "points": [
          {
            "x": 540,
            "y": 85
          },
          {
            "x": 540,
            "y": 240
          }
        ]
      },
      {
        "id": "c_9",
        "icomType": "control",
        "label": "Мудборды и референсы ТЗ",
        "points": [
          {
            "x": 880,
            "y": 85
          },
          {
            "x": 880,
            "y": 340
          }
        ]
      },
      {
        "id": "c_10",
        "icomType": "control",
        "label": "Регламент SLA и чек-лист",
        "points": [
          {
            "x": 1230,
            "y": 85
          },
          {
            "x": 1230,
            "y": 440
          }
        ]
      },
      {
        "id": "c_11",
        "icomType": "output",
        "label": "Чертеж фактических обмеров",
        "points": [
          {
            "x": 320,
            "y": 160
          },
          {
            "x": 1440,
            "y": 160
          }
        ]
      },
      {
        "id": "c_12",
        "icomType": "output",
        "label": "Варианты планировок клиенту",
        "points": [
          {
            "x": 660,
            "y": 260
          },
          {
            "x": 1440,
            "y": 260
          }
        ]
      },
      {
        "id": "c_13",
        "icomType": "output",
        "label": "ТЗ чертежнику и комплектатору",
        "points": [
          {
            "x": 1000,
            "y": 350
          },
          {
            "x": 1440,
            "y": 350
          }
        ]
      },
      {
        "id": "c_14",
        "icomType": "output",
        "label": "Чистовой 3D-альбом для сдачи",
        "points": [
          {
            "x": 1350,
            "y": 480
          },
          {
            "x": 1440,
            "y": 480
          }
        ]
      },
      {
        "id": "c_15",
        "icomType": "mechanism",
        "label": "Лазерный дальномер Leica",
        "points": [
          {
            "x": 160,
            "y": 600
          },
          {
            "x": 160,
            "y": 225
          }
        ]
      },
      {
        "id": "c_16",
        "icomType": "mechanism",
        "label": "AutoCAD / ArchiCAD",
        "points": [
          {
            "x": 500,
            "y": 600
          },
          {
            "x": 500,
            "y": 325
          }
        ]
      },
      {
        "id": "c_17",
        "icomType": "mechanism",
        "label": "3D-визуализатор (исполнитель)",
        "points": [
          {
            "x": 840,
            "y": 600
          },
          {
            "x": 840,
            "y": 425
          }
        ]
      },
      {
        "id": "c_18",
        "icomType": "mechanism",
        "label": "Модуль рецензирования ИС",
        "points": [
          {
            "x": 1190,
            "y": 600
          },
          {
            "x": 1190,
            "y": 525
          }
        ]
      }
    ],
    "desc": "Декомпозиция А1–А4 целевой модели процессов «Samarov Studio» (Лист 3.2: Ведущий архитектор-дизайнер)"
  },

  // ── Лист 4.2: Архитектор-проектировщик (чертежник) ──
  samarov_idef0_draftsman: {
    "version": "1.0",
    "standard": "GOST R 50.1.028-2001",
    "id": "samarov_idef0_draftsman",
    "name": "Лист 4.2: Архитектор-проектировщик (чертежник)",
    "type": "idef0_decomp",
    "width": 1520,
    "height": 760,
    "masterPage": {
      "usedAt": "ГУАП, Кафедра № 43",
      "rd": "ГОСТ Р 50.1.028-2001",
      "author": "Энгельгардт К. А.",
      "project": "ИС «Samarov Studio»",
      "remarks": 0,
      "revision": "1.0",
      "date1": "22.10.2026",
      "date2": "22.10.2026",
      "date3": "22.10.2026",
      "time1": "10:00",
      "time2": "11:00",
      "time3": "12:00",
      "status": "work",
      "reader": "Белая Т. И.",
      "readerDate": "22.10.2026",
      "context": "A-0",
      "node": "A0",
      "title": "IDEF0: Декомпозиция деятельности актора «Архитектор-проектировщик (чертежник)»",
      "cnumber": "4.2",
      "page": "4.2",
      "frameStyle": "academic",
      "dfdSubtitle": "Функциональная декомпозиция на узлы A1–A4 в целевой модели процессов студии",
      "dfdLegend": "ГУАП | Кафедра № 43 | Дисциплина: Проектирование программных систем | Преподаватель: доц. Белая Т. И.",
      "dfdFooterMeta": "Студент: Энгельгардт К. А., гр. 4434 | ИС «Samarov Studio» | Лист 4.2",
      "caption": "Диаграмма IDEF0 (A0): декомпозиция функциональных задач — Архитектор-проектировщик (чертежник)"
    },
    "elements": [
      {
        "id": "blk_a1",
        "type": "idef0_block",
        "x": 80,
        "y": 140,
        "width": 240,
        "height": 85,
        "nodeCode": "A1",
        "name": "Разработка архитектурно-строительных\nпланов (монтаж/демонтаж)"
      },
      {
        "id": "blk_a2",
        "type": "idef0_block",
        "x": 420,
        "y": 240,
        "width": 240,
        "height": 85,
        "nodeCode": "A2",
        "name": "Проектирование инженерных сетей\n(электрика, сантехника, климат)"
      },
      {
        "id": "blk_a3",
        "type": "idef0_block",
        "x": 760,
        "y": 340,
        "width": 240,
        "height": 85,
        "nodeCode": "A3",
        "name": "Построение разверток стен\nи привязка чистовых материалов"
      },
      {
        "id": "blk_a4",
        "type": "idef0_block",
        "x": 1110,
        "y": 440,
        "width": 240,
        "height": 85,
        "nodeCode": "A4",
        "name": "Сборка альбома (19 листов),\nнормоконтроль и экспорт в ИС"
      }
    ],
    "connections": [
      {
        "id": "c_1",
        "icomType": "input",
        "label": "Утвержденный план",
        "points": [
          {
            "x": 40,
            "y": 160
          },
          {
            "x": 80,
            "y": 160
          }
        ]
      },
      {
        "id": "c_2",
        "icomType": "input",
        "label": "Инженерные точки",
        "points": [
          {
            "x": 40,
            "y": 190
          },
          {
            "x": 80,
            "y": 190
          }
        ]
      },
      {
        "id": "c_3",
        "icomType": "output",
        "label": "Кладочный план стен",
        "points": [
          {
            "x": 320,
            "y": 180
          },
          {
            "x": 370,
            "y": 180
          },
          {
            "x": 370,
            "y": 260
          },
          {
            "x": 420,
            "y": 260
          }
        ]
      },
      {
        "id": "c_4",
        "icomType": "output",
        "label": "Планы коммуникаций",
        "points": [
          {
            "x": 660,
            "y": 280
          },
          {
            "x": 710,
            "y": 280
          },
          {
            "x": 710,
            "y": 360
          },
          {
            "x": 760,
            "y": 360
          }
        ]
      },
      {
        "id": "c_5",
        "icomType": "output",
        "label": "Развертки помещений",
        "points": [
          {
            "x": 1000,
            "y": 380
          },
          {
            "x": 1050,
            "y": 380
          },
          {
            "x": 1050,
            "y": 460
          },
          {
            "x": 1110,
            "y": 460
          }
        ]
      },
      {
        "id": "c_6",
        "icomType": "output",
        "label": "Коллизии коммуникаций",
        "points": [
          {
            "x": 1110,
            "y": 490
          },
          {
            "x": 740,
            "y": 490
          },
          {
            "x": 740,
            "y": 310
          },
          {
            "x": 660,
            "y": 310
          }
        ]
      },
      {
        "id": "c_7",
        "icomType": "control",
        "label": "СП 54.13330 (Здания жилые)",
        "points": [
          {
            "x": 200,
            "y": 85
          },
          {
            "x": 200,
            "y": 140
          }
        ]
      },
      {
        "id": "c_8",
        "icomType": "control",
        "label": "ПУЭ (Электроустановки)",
        "points": [
          {
            "x": 540,
            "y": 85
          },
          {
            "x": 540,
            "y": 240
          }
        ]
      },
      {
        "id": "c_9",
        "icomType": "control",
        "label": "Спецификации материалов",
        "points": [
          {
            "x": 880,
            "y": 85
          },
          {
            "x": 880,
            "y": 340
          }
        ]
      },
      {
        "id": "c_10",
        "icomType": "control",
        "label": "ГОСТ 21.501 (СПДС)",
        "points": [
          {
            "x": 1230,
            "y": 85
          },
          {
            "x": 1230,
            "y": 440
          }
        ]
      },
      {
        "id": "c_11",
        "icomType": "output",
        "label": "Чертежи перегородок и проемов",
        "points": [
          {
            "x": 320,
            "y": 160
          },
          {
            "x": 1440,
            "y": 160
          }
        ]
      },
      {
        "id": "c_12",
        "icomType": "output",
        "label": "Планы электрики и сантехники",
        "points": [
          {
            "x": 660,
            "y": 260
          },
          {
            "x": 1440,
            "y": 260
          }
        ]
      },
      {
        "id": "c_13",
        "icomType": "output",
        "label": "Ведомость отделки стен и узлы",
        "points": [
          {
            "x": 1000,
            "y": 350
          },
          {
            "x": 1440,
            "y": 350
          }
        ]
      },
      {
        "id": "c_14",
        "icomType": "output",
        "label": "Готовый рабочий альбом (19 листов PDF)",
        "points": [
          {
            "x": 1350,
            "y": 480
          },
          {
            "x": 1440,
            "y": 480
          }
        ]
      },
      {
        "id": "c_15",
        "icomType": "mechanism",
        "label": "AutoCAD Architecture",
        "points": [
          {
            "x": 160,
            "y": 600
          },
          {
            "x": 160,
            "y": 225
          }
        ]
      },
      {
        "id": "c_16",
        "icomType": "mechanism",
        "label": "Revit MEP / Инж. модули",
        "points": [
          {
            "x": 500,
            "y": 600
          },
          {
            "x": 500,
            "y": 325
          }
        ]
      },
      {
        "id": "c_17",
        "icomType": "mechanism",
        "label": "Библиотека блоков мебели",
        "points": [
          {
            "x": 840,
            "y": 600
          },
          {
            "x": 840,
            "y": 425
          }
        ]
      },
      {
        "id": "c_18",
        "icomType": "mechanism",
        "label": "Файловый репозиторий ИС",
        "points": [
          {
            "x": 1190,
            "y": 600
          },
          {
            "x": 1190,
            "y": 525
          }
        ]
      }
    ],
    "desc": "Декомпозиция А1–А4 целевой модели процессов «Samarov Studio» (Лист 4.2: Архитектор-проектировщик (чертежник))"
  },

  // ── Лист 5.2: Менеджер по комплектации ──
  samarov_idef0_procurement_manager: {
    "version": "1.0",
    "standard": "GOST R 50.1.028-2001",
    "id": "samarov_idef0_procurement_manager",
    "name": "Лист 5.2: Менеджер по комплектации",
    "type": "idef0_decomp",
    "width": 1520,
    "height": 760,
    "masterPage": {
      "usedAt": "ГУАП, Кафедра № 43",
      "rd": "ГОСТ Р 50.1.028-2001",
      "author": "Энгельгардт К. А.",
      "project": "ИС «Samarov Studio»",
      "remarks": 0,
      "revision": "1.0",
      "date1": "22.10.2026",
      "date2": "22.10.2026",
      "date3": "22.10.2026",
      "time1": "10:00",
      "time2": "11:00",
      "time3": "12:00",
      "status": "work",
      "reader": "Белая Т. И.",
      "readerDate": "22.10.2026",
      "context": "A-0",
      "node": "A0",
      "title": "IDEF0: Декомпозиция деятельности актора «Менеджер по комплектации»",
      "cnumber": "5.2",
      "page": "5.2",
      "frameStyle": "academic",
      "dfdSubtitle": "Функциональная декомпозиция на узлы A1–A4 в целевой модели процессов студии",
      "dfdLegend": "ГУАП | Кафедра № 43 | Дисциплина: Проектирование программных систем | Преподаватель: доц. Белая Т. И.",
      "dfdFooterMeta": "Студент: Энгельгардт К. А., гр. 4434 | ИС «Samarov Studio» | Лист 5.2",
      "caption": "Диаграмма IDEF0 (A0): декомпозиция функциональных задач — Менеджер по комплектации"
    },
    "elements": [
      {
        "id": "blk_a1",
        "type": "idef0_block",
        "x": 80,
        "y": 140,
        "width": 240,
        "height": 85,
        "nodeCode": "A1",
        "name": "Составление базовой ведомости\nматериалов, мебели и сантехники"
      },
      {
        "id": "blk_a2",
        "type": "idef0_block",
        "x": 420,
        "y": 240,
        "width": 240,
        "height": 85,
        "nodeCode": "A2",
        "name": "Мониторинг цен, остатков\nи получение коммерческих предложений"
      },
      {
        "id": "blk_a3",
        "type": "idef0_block",
        "x": 760,
        "y": 340,
        "width": 240,
        "height": 85,
        "nodeCode": "A3",
        "name": "Организация выкрасов, образцов\nи очное согласование на объекте"
      },
      {
        "id": "blk_a4",
        "type": "idef0_block",
        "x": 1110,
        "y": 440,
        "width": 240,
        "height": 85,
        "nodeCode": "A4",
        "name": "Формирование счетов, подбор\nаналогов и контроль поставок"
      }
    ],
    "connections": [
      {
        "id": "c_1",
        "icomType": "input",
        "label": "Рендеры и развертки",
        "points": [
          {
            "x": 40,
            "y": 160
          },
          {
            "x": 80,
            "y": 160
          }
        ]
      },
      {
        "id": "c_2",
        "icomType": "input",
        "label": "Бюджет заказчика",
        "points": [
          {
            "x": 40,
            "y": 190
          },
          {
            "x": 80,
            "y": 190
          }
        ]
      },
      {
        "id": "c_3",
        "icomType": "output",
        "label": "Первичный перечень артикулов",
        "points": [
          {
            "x": 320,
            "y": 180
          },
          {
            "x": 370,
            "y": 180
          },
          {
            "x": 370,
            "y": 260
          },
          {
            "x": 420,
            "y": 260
          }
        ]
      },
      {
        "id": "c_4",
        "icomType": "output",
        "label": "Верифицированные КП",
        "points": [
          {
            "x": 660,
            "y": 280
          },
          {
            "x": 710,
            "y": 280
          },
          {
            "x": 710,
            "y": 360
          },
          {
            "x": 760,
            "y": 360
          }
        ]
      },
      {
        "id": "c_5",
        "icomType": "output",
        "label": "Утвержденные образцы",
        "points": [
          {
            "x": 1000,
            "y": 380
          },
          {
            "x": 1050,
            "y": 380
          },
          {
            "x": 1050,
            "y": 460
          },
          {
            "x": 1110,
            "y": 460
          }
        ]
      },
      {
        "id": "c_6",
        "icomType": "output",
        "label": "Запрос аналога (нет на складе)",
        "points": [
          {
            "x": 1110,
            "y": 490
          },
          {
            "x": 740,
            "y": 490
          },
          {
            "x": 740,
            "y": 310
          },
          {
            "x": 660,
            "y": 310
          }
        ]
      },
      {
        "id": "c_7",
        "icomType": "control",
        "label": "Бюджетный лимит позиций",
        "points": [
          {
            "x": 200,
            "y": 85
          },
          {
            "x": 200,
            "y": 140
          }
        ]
      },
      {
        "id": "c_8",
        "icomType": "control",
        "label": "Сроки производства фабрик",
        "points": [
          {
            "x": 540,
            "y": 85
          },
          {
            "x": 540,
            "y": 240
          }
        ]
      },
      {
        "id": "c_9",
        "icomType": "control",
        "label": "Требования авторского надзора",
        "points": [
          {
            "x": 880,
            "y": 85
          },
          {
            "x": 880,
            "y": 340
          }
        ]
      },
      {
        "id": "c_10",
        "icomType": "control",
        "label": "График строительных работ",
        "points": [
          {
            "x": 1230,
            "y": 85
          },
          {
            "x": 1230,
            "y": 440
          }
        ]
      },
      {
        "id": "c_11",
        "icomType": "output",
        "label": "Сводная спецификация разделов",
        "points": [
          {
            "x": 320,
            "y": 160
          },
          {
            "x": 1440,
            "y": 160
          }
        ]
      },
      {
        "id": "c_12",
        "icomType": "output",
        "label": "Каталожные ссылки поставщиков",
        "points": [
          {
            "x": 660,
            "y": 260
          },
          {
            "x": 1440,
            "y": 260
          }
        ]
      },
      {
        "id": "c_13",
        "icomType": "output",
        "label": "Акты утверждения выкрасов",
        "points": [
          {
            "x": 1000,
            "y": 350
          },
          {
            "x": 1440,
            "y": 350
          }
        ]
      },
      {
        "id": "c_14",
        "icomType": "output",
        "label": "Интерактивная Smart-смета и счета",
        "points": [
          {
            "x": 1350,
            "y": 480
          },
          {
            "x": 1440,
            "y": 480
          }
        ]
      },
      {
        "id": "c_15",
        "icomType": "mechanism",
        "label": "Модуль спецификаций ИС",
        "points": [
          {
            "x": 160,
            "y": 600
          },
          {
            "x": 160,
            "y": 225
          }
        ]
      },
      {
        "id": "c_16",
        "icomType": "mechanism",
        "label": "Поставщики (внешн. контрагенты)",
        "points": [
          {
            "x": 500,
            "y": 600
          },
          {
            "x": 500,
            "y": 325
          }
        ]
      },
      {
        "id": "c_17",
        "icomType": "mechanism",
        "label": "Шоурумы и образцы фабрик",
        "points": [
          {
            "x": 840,
            "y": 600
          },
          {
            "x": 840,
            "y": 425
          }
        ]
      },
      {
        "id": "c_18",
        "icomType": "mechanism",
        "label": "Smart-смета Client Portal",
        "points": [
          {
            "x": 1190,
            "y": 600
          },
          {
            "x": 1190,
            "y": 525
          }
        ]
      }
    ],
    "desc": "Декомпозиция А1–А4 целевой модели процессов «Samarov Studio» (Лист 5.2: Менеджер по комплектации)"
  }
};

// Global Export for script inclusion
window.DIAGRAM_TEMPLATES = DIAGRAM_TEMPLATES;
