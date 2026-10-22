/**
 * IDEF Builder - GOST Compliance Validator Engine
 * Automatic verification against rules of Р 50.1.028-2001 (IDEF0) and SADT standards
 */

class GostValidator {
  /**
   * Validate current diagram model and return list of issues
   * @param {DiagramModel} model
   * @returns {Array<{ type: 'err'|'warn'|'ok', title: string, desc: string, rule: string }>}
   */
  static validate(model) {
    const issues = [];
    const elements = model.elements || [];
    const connections = model.connections || [];
    const mp = model.masterPage || {};

    // ── 1. Master Page Completeness (Приложение А) ──
    if (!mp.author || mp.author.trim() === '' || mp.author.includes('ФИО')) {
      issues.push({
        type: 'warn',
        title: 'Не указан автор модели',
        desc: 'Поле «Автор» в штампе бланка обязательно для идентификации разработчика.',
        rule: 'Р 50.1.028-2001, Приложение А.2, п. 2'
      });
    }

    if (!mp.project || mp.project.trim() === '') {
      issues.push({
        type: 'warn',
        title: 'Не заполнено поле «Проект»',
        desc: 'В штампе должно быть указано наименование проекта или его шифр.',
        rule: 'Р 50.1.028-2001, Приложение А.2, п. 3'
      });
    }

    if (!mp.node || mp.node.trim() === '') {
      issues.push({
        type: 'err',
        title: 'Отсутствует шифр узла',
        desc: 'Поле «Узел» в подвале обязательно (например: A-0, A0, A1).',
        rule: 'Р 50.1.028-2001, Приложение А.2, п. 14'
      });
    }

    if (!mp.title || mp.title.trim() === '') {
      issues.push({
        type: 'err',
        title: 'Отсутствует заголовок диаграммы',
        desc: 'Поле «Заголовок» в нижнем штампе должно содержать имя родительского блока.',
        rule: 'Р 50.1.028-2001, Приложение А.2, п. 15'
      });
    }

    // ── 2. IDEF0 Specific Rules ──
    if (model.type === 'idef0_context') {
      const blocks = elements.filter(e => e.type === 'idef0_block');
      if (blocks.length !== 1) {
        issues.push({
          type: 'err',
          title: 'Нарушение контекстного уровня А-0',
          desc: `На контекстной диаграмме А-0 обязан быть ровно 1 блок (сейчас: ${blocks.length}).`,
          rule: 'Р 50.1.028-2001, п. 6.5'
        });
      }

      // Check ICOM coverage
      const hasInput = connections.some(c => c.icomType === 'input');
      const hasControl = connections.some(c => c.icomType === 'control');
      const hasOutput = connections.some(c => c.icomType === 'output');
      const hasMech = connections.some(c => c.icomType === 'mechanism');

      if (!hasControl) {
        issues.push({
          type: 'err',
          title: 'Отсутствует управляющая стрелка (Control)',
          desc: 'Каждый блок в IDEF0 обязан иметь как минимум одно управление сверху.',
          rule: 'Р 50.1.028-2001, п. 6.1, 6.3'
        });
      }
      if (!hasOutput) {
        issues.push({
          type: 'err',
          title: 'Отсутствует выходная стрелка (Output)',
          desc: 'Функция не имеет результата. Обязательна минимум одна стрелка справа.',
          rule: 'Р 50.1.028-2001, п. 6.1, 6.3'
        });
      }
    } else if (model.type === 'idef0_decomp') {
      const blocks = elements.filter(e => e.type === 'idef0_block');
      if (blocks.length < 3) {
        issues.push({
          type: 'warn',
          title: 'Недостаточно блоков на диаграмме декомпозиции',
          desc: `Рекомендуется не менее 3 блоков на листе (сейчас: ${blocks.length}).`,
          rule: 'Р 50.1.028-2001, п. 8.1 (Правило 3–6 блоков)'
        });
      } else if (blocks.length > 6) {
        issues.push({
          type: 'err',
          title: 'Превышен предел сложности декомпозиции',
          desc: `На диаграмме более 6 блоков (${blocks.length}). Нарушена читаемость модели.`,
          rule: 'Р 50.1.028-2001, п. 8.1 (Правило 3–6 блоков)'
        });
      }
    }

    // ── 3. Block Naming Semantics (п. 6.1, 6.3.а) ──
    const verbRegex = /(ть|ти|ся|чь|овать|ировать|еть|ить|ать|ять|управлять|вести|создать|разработать|проверить|формировать|согласовать|обеспечить)/i;
    elements.forEach(el => {
      if (el.type === 'idef0_block' || el.type === 'dfd_process') {
        const text = (el.name || '').toLowerCase();
        if (!verbRegex.test(text)) {
          issues.push({
            type: 'warn',
            title: `Неглагольное имя блока «${(el.name || '').split('\n')[0]}»`,
            desc: 'Имя функции должно быть глаголом или глагольным оборотом (например: «Управлять», «Разработать»).',
            rule: 'Р 50.1.028-2001, п. 6.1, 6.3.а'
          });
        }
      }
    });

    // ── 4. Arrow Label Semantics (п. 6.2, 6.3.д) ──
    const forbiddenWords = ['функция', 'вход', 'управление', 'выход', 'механизм', 'вызов'];
    connections.forEach(conn => {
      if (conn.label) {
        const lower = conn.label.toLowerCase();
        forbiddenWords.forEach(word => {
          if (lower.split(/\s+/).includes(word)) {
            issues.push({
              type: 'warn',
              title: `Недопустимое слово в метке стрелки: «${word}»`,
              desc: `В метках стрелок запрещено использовать технические термины ICOM: ${word}.`,
              rule: 'Р 50.1.028-2001, п. 6.3.д'
            });
          }
        });
      } else if (conn.icomType !== 'precedence') {
        issues.push({
          type: 'warn',
          title: 'Стрелка без наименования',
          desc: 'Все стрелки и их сегменты должны быть помечены существительными.',
          rule: 'Р 50.1.028-2001, п. 6.2'
        });
      }
    });

    // ── Positive summary if everything is good ──
    if (issues.length === 0) {
      issues.push({
        type: 'ok',
        title: 'Модель полностью соответствует ГОСТу',
        desc: 'Синтаксис ICOM, количество блоков, семантика наименований и штампы бланка соответствуют Р 50.1.028-2001.',
        rule: 'ГОСТ Р 50.1.028-2001'
      });
    }

    return issues;
  }
}

window.GostValidator = GostValidator;
