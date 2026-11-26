"use strict";

const practices = [
  { id: "memory", kind: "Память", title: "Запомните порядок", description: "Повторите последовательность подсвеченных клеток.", run: runMemory },
  { id: "attention", kind: "Внимание", title: "Найдите лишнюю", description: "Найдите стрелку, которая смотрит в другую сторону.", run: runAttention },
  { id: "thinking", kind: "Мышление", title: "Поймайте закономерность", description: "Разгадайте правило и выберите, что будет дальше.", run: runThinking }
];

function practiceSection() {
  return `<section class="section practice-section" id="practice" aria-labelledby="practice-title">
    <div class="wrap">
      <div class="practice-intro"><h2 id="practice-title">Практикум</h2><p>Три короткие игры на память, внимание и мышление.</p></div>
      <div class="practice-options">${practices.map(item => `<button class="practice-option" type="button" data-practice="${item.id}" aria-label="${item.kind} · ${item.title}">
        <span class="practice-icon practice-icon--${item.id}" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        <span class="practice-kind">${item.kind}</span>
        <strong>${item.title}</strong><span class="practice-description">${item.description}</span>
      </button>`).join("")}</div>
    </div>
  </section>`;
}

function openPractice(id) {
  const item = practices.find(practice => practice.id === id);
  if (!item) return;
  const controller = new AbortController();
  dialog.classList.remove("material-editor");
  dialog.classList.add("practice-dialog");
  dialog.querySelector("h2").textContent = item.title;
  const body = dialog.querySelector("#dialog-body");
  dialog.addEventListener("close", () => {
    controller.abort();
    dialog.classList.remove("practice-dialog");
  }, { once: true });
  item.run(body, controller.signal);
  dialog.showModal();
}

function randomOrder(size, total) {
  const cells = Array.from({ length: total }, (_, index) => index);
  for (let i = 0; i < size; i += 1) {
    const next = i + Math.floor(Math.random() * (cells.length - i));
    [cells[i], cells[next]] = [cells[next], cells[i]];
  }
  return cells.slice(0, size);
}

function runMemory(body, signal) {
  let length = 3;
  let sequence = [];
  let matched = 0;
  let phase = "ready";
  let timer;
  body.innerHTML = `<p>Запомните порядок подсветки, затем нажмите на те же клетки. Начнём с трёх.</p>
    <div class="memory-grid" role="group" aria-label="Девять игровых клеток">${Array.from({ length: 9 }, (_, index) =>
      `<button type="button" data-cell="${index}" aria-label="Клетка ${index + 1}" disabled>${index + 1}</button>`).join("")}</div>
    <p class="memory-status" role="status">Когда будете готовы, начните раунд.</p>
    <button class="button dark" data-memory-start type="button">Начать раунд</button>`;
  const cells = [...body.querySelectorAll("[data-cell]")];
  const status = body.querySelector(".memory-status");
  const start = body.querySelector("[data-memory-start]");
  signal.addEventListener("abort", () => clearTimeout(timer), { once: true });

  function beginRound() {
    phase = "showing";
    sequence = randomOrder(length, 9);
    matched = 0;
    start.hidden = true;
    for (const cell of cells) {
      cell.disabled = true;
      cell.className = "";
    }
    status.textContent = "Запоминайте порядок.";
    status.setAttribute("tabindex", "-1");
    status.focus();

    function flash(index) {
      if (index === sequence.length) {
        phase = "recall";
        status.textContent = "Теперь повторите порядок.";
        for (const cell of cells) cell.disabled = false;
        cells[0].focus();
        return;
      }
      const cell = cells[sequence[index]];
      cell.classList.add("is-lit");
      status.textContent = `Сигнал ${index + 1} из ${length} · клетка ${sequence[index] + 1}`;
      timer = setTimeout(() => {
        cell.classList.remove("is-lit");
        timer = setTimeout(() => flash(index + 1), 225);
      }, 650);
    }

    timer = setTimeout(() => flash(0), 450);
  }

  start.addEventListener("click", beginRound, { signal });
  for (const cell of cells) cell.addEventListener("click", () => {
    if (phase !== "recall") return;
    const correct = Number(cell.dataset.cell) === sequence[matched];
    if (correct) {
      matched += 1;
      cell.classList.add("is-matched");
      cell.disabled = true;
      if (matched < length) {
        status.textContent = `Верно · ${matched} из ${length}`;
        cells.find(candidate => !candidate.disabled).focus();
        return;
      }
    }

    phase = "ready";
    for (const button of cells) button.disabled = true;
    start.hidden = false;
    if (!correct) {
      cell.classList.add("is-missed");
      status.textContent = `Совпало ${matched} из ${length}. Можно попробовать новую последовательность той же длины.`;
      start.textContent = "Попробовать ещё раз";
    } else if (length < 6) {
      length += 1;
      status.textContent = `Последовательность верная. В следующем раунде клеток будет ${length}.`;
      start.textContent = "Следующий раунд";
    } else {
      length = 3;
      status.textContent = "Получилось повторить последовательность из шести клеток!";
      start.textContent = "Сыграть снова";
    }
    start.focus();
  }, { signal });
}

const arrowDirections = [
  ["↑", "вверх"], ["→", "вправо"], ["↓", "вниз"], ["←", "влево"]
];

function runAttention(body, signal) {
  const rounds = 5;
  let round = 0;
  let firstTry = 0;
  let oddIndex = -1;
  let misses = 0;
  body.innerHTML = `<p>В каждой сетке одна стрелка смотрит в другую сторону. Найдите её.</p>
    <p class="game-progress attention-progress"></p>
    <div class="attention-grid" role="group" aria-label="Клетки со стрелками"></div>
    <p class="game-status attention-status" role="status" tabindex="-1"></p>
    <button class="button dark" data-attention-next type="button" hidden>Следующий раунд</button>`;
  const grid = body.querySelector(".attention-grid");
  const progress = body.querySelector(".attention-progress");
  const status = body.querySelector(".attention-status");
  const next = body.querySelector("[data-attention-next]");

  function draw() {
    const common = Math.floor(Math.random() * arrowDirections.length);
    const different = (common + 1 + Math.floor(Math.random() * 3)) % arrowDirections.length;
    const lastIndex = oddIndex;
    oddIndex = Math.floor(Math.random() * 16);
    if (oddIndex === lastIndex) oddIndex = (oddIndex + 1) % 16;
    misses = 0;
    progress.textContent = `Раунд ${round + 1} из ${rounds}`;
    status.textContent = "Выберите одну стрелку.";
    next.hidden = true;
    grid.innerHTML = Array.from({ length: 16 }, (_, index) => {
      const [symbol, name] = arrowDirections[index === oddIndex ? different : common];
      return `<button type="button" data-arrow="${index}" aria-label="Клетка ${index + 1} · стрелка ${name}">${symbol}</button>`;
    }).join("");
  }

  grid.addEventListener("click", event => {
    const found = event.target.closest("[data-arrow]");
    if (!found) return;
    if (Number(found.dataset.arrow) !== oddIndex) {
      misses += 1;
      found.disabled = true;
      found.classList.add("is-missed");
      status.textContent = misses === 1 ? "Эта стрелка совпадает с большинством. Попробуйте ещё." : "Ищите стрелку с другим направлением.";
      (found.nextElementSibling?.matches(":enabled") ? found.nextElementSibling : grid.querySelector("button:enabled")).focus();
      return;
    }
    if (!misses) firstTry += 1;
    for (const button of grid.children) button.disabled = true;
    found.classList.add("is-matched");
    const complete = round + 1 === rounds;
    status.textContent = complete
      ? `Игра завершена. С первой попытки найдено ${firstTry} из ${rounds} стрелок.`
      : "Верно! Эта стрелка отличается.";
    next.textContent = complete ? "Сыграть снова" : "Следующий раунд";
    next.hidden = false;
    next.focus();
  }, { signal });
  next.addEventListener("click", () => {
    round += 1;
    if (round === rounds) {
      round = 0;
      firstTry = 0;
    }
    draw();
    grid.querySelector("button").focus();
  }, { signal });
  draw();
}

const thinkingPuzzles = [
  { series: ["2", "4", "8", "16"], options: ["24", "32", "30"], answer: "32", rule: "Каждое число вдвое больше предыдущего." },
  { series: ["1", "4", "9", "16"], options: ["20", "24", "25"], answer: "25", rule: "Это квадраты чисел от 1 до 5. Следующее число — 5 × 5." },
  { series: ["10", "8", "11", "9", "12"], options: ["13", "10", "9"], answer: "10", rule: "Шаги чередуются. Сначала вычитаем 2, затем прибавляем 3." },
  { series: ["3", "5", "8", "12"], options: ["17", "18", "16"], answer: "17", rule: "Прибавляется 2, затем 3, затем 4. Следующий шаг — прибавить 5." },
  { series: ["1", "1", "2", "3", "5"], options: ["7", "8", "10"], answer: "8", rule: "Каждое следующее число равно сумме двух предыдущих." },
  { series: ["2", "5", "11", "23"], options: ["46", "35", "47"], answer: "47", rule: "Удваиваем предыдущее число и прибавляем 1." }
];

function runThinking(body, signal) {
  const rounds = 3;
  let order = randomOrder(rounds, thinkingPuzzles.length);
  let step = 0;
  let correct = 0;

  function draw(focus = false) {
    const puzzle = thinkingPuzzles[order[step]];
    if (!puzzle) {
      body.innerHTML = `<h3 class="game-result" tabindex="-1">Результат игры</h3>
        <p>Верных ответов: ${correct} из ${rounds}.</p>
        <div class="actions"><button class="button dark" type="button" data-thinking-next>Сыграть снова</button></div>`;
      body.querySelector(".game-result").focus();
      return;
    }
    body.innerHTML = `<p>Какое число должно быть следующим?</p>
      <p class="game-progress">Задача ${step + 1} из ${rounds}</p>
      <ol class="pattern-series" aria-label="Числовой ряд">${puzzle.series.map(value => `<li>${value}</li>`).join("")}<li aria-label="Неизвестное число">?</li></ol>
      <div class="pattern-options" role="group" aria-label="Варианты ответа">${puzzle.options.map(value =>
        `<button type="button" data-pattern-answer="${value}">${value}</button>`).join("")}</div>
      <p class="game-status thinking-status" role="status" tabindex="-1"></p>
      <button class="button dark" type="button" data-thinking-next hidden>${step + 1 === rounds ? "Показать результат" : "Следующая задача"}</button>`;
    if (focus) body.querySelector("[data-pattern-answer]").focus();
  }

  body.addEventListener("click", event => {
    const answer = event.target.closest("[data-pattern-answer]");
    const next = event.target.closest("[data-thinking-next]");
    if (answer) {
      const puzzle = thinkingPuzzles[order[step]];
      const ok = answer.dataset.patternAnswer === puzzle.answer;
      if (ok) correct += 1;
      for (const button of body.querySelectorAll("[data-pattern-answer]")) {
        button.disabled = true;
        if (button.dataset.patternAnswer === puzzle.answer) button.classList.add("is-matched");
      }
      if (!ok) answer.classList.add("is-missed");
      const status = body.querySelector(".thinking-status");
      status.textContent = `${ok ? "Верно. " : "Ответ — " + puzzle.answer + ". "}${puzzle.rule}`;
      body.querySelector("[data-thinking-next]").hidden = false;
      status.focus();
    } else if (next) {
      if (step === rounds) {
        order = randomOrder(rounds, thinkingPuzzles.length);
        step = 0;
        correct = 0;
      } else step += 1;
      draw(true);
    }
  }, { signal });
  draw();
}

"use strict";

const people = [
  {
    id: "alexander-morozov", name: "Александр Морозов", role: "Психолог", city: "Москва", modes: ["Очно", "Онлайн"],
    topics: ["Тревога", "Профессиональное выгорание", "Жизненные перемены"], approach: "Когнитивно-поведенческий подход",
    bio: "Работаю со взрослыми, которые сталкиваются с перегрузкой, тревогой или переменами. На первых встречах мы уточняем запрос и договариваемся о целях. В дальнейшем разбираем повседневные ситуации и пробуем новые способы реагировать на них.",
    training: "Высшее образование по психологии и дополнительная подготовка по когнитивно-поведенческому консультированию.",
    service: "Индивидуальная консультация", duration: 60, fee: "5 000", article: "Как понять, что пора пересмотреть рабочую нагрузку"
  },
  {
    id: "elena-volkova", name: "Елена Волкова", role: "Психолог", city: "Санкт-Петербург", modes: ["Онлайн"],
    topics: ["Отношения", "Самооценка", "Личные границы"], approach: "Интегративный подход",
    bio: "Консультирую взрослых по вопросам близких отношений и личных границ. Вместе исследуем привычные сценарии общения и ищем способы говорить о своих потребностях.",
    training: "Высшее образование по психологии и повышение квалификации по психологическому консультированию.",
    service: "Индивидуальная консультация", duration: 50, fee: "4 500", article: "Как начать разговор о личных границах"
  },
  {
    id: "andrey-sokolov", name: "Андрей Соколов", role: "Врач-психотерапевт", city: "Москва", modes: ["Очно"],
    topics: ["Тревога", "Сон", "Адаптация"], approach: "Психотерапевтическое консультирование",
    bio: "Веду индивидуальный приём взрослых. На первичной встрече обсуждаем историю обращения, повседневные трудности и возможные форматы дальнейшей работы.",
    training: "Высшее медицинское образование и профессиональная подготовка по психотерапии.",
    service: "Первичная консультация", duration: 60, fee: "6 500", article: "Как подготовиться к первой встрече со специалистом"
  },
  {
    id: "maria-belyaeva", name: "Мария Беляева", role: "Психолог", city: "Казань", modes: ["Очно", "Онлайн"],
    topics: ["Семья", "Родительство", "Отношения"], approach: "Системный семейный подход",
    bio: "Работаю с парами и взрослыми. На встречах мы разбираем повторяющиеся конфликты и обсуждаем, какие изменения в общении возможны для каждого участника.",
    training: "Высшее образование по психологии и дополнительная подготовка по семейному консультированию.",
    service: "Семейная консультация", duration: 75, fee: "5 500", article: "Первый разговор о семейной консультации"
  },
  {
    id: "pavel-orlov", name: "Павел Орлов", role: "Психолог", city: "Санкт-Петербург", modes: ["Очно", "Онлайн"],
    topics: ["Карьера", "Стресс", "Жизненные перемены"], approach: "Психологическое консультирование",
    bio: "Помогаю взрослым с вопросами профессионального выбора и адаптации к изменениям. Мы обсуждаем приоритеты, доступные ресурсы и решения, которые можно проверить на практике.",
    training: "Высшее образование по психологии и дополнительная подготовка по консультированию взрослых.",
    service: "Индивидуальная консультация", duration: 60, fee: "4 800", article: "Что обсудить с психологом при смене профессии"
  },
  {
    id: "natalia-krylova", name: "Наталья Крылова", role: "Врач-психотерапевт", city: "Казань", modes: ["Очно", "Онлайн"],
    topics: ["Стресс", "Тревога", "Эмоциональная регуляция"], approach: "Психотерапевтическое консультирование",
    bio: "Работаю со взрослыми с жалобами на длительное напряжение и трудности в адаптации. Первую встречу посвящаем истории запроса и обсуждению планов дальнейшей работы.",
    training: "Высшее медицинское образование и профессиональная подготовка по психотерапии.",
    service: "Первичная консультация", duration: 60, fee: "6 000", article: "Что можно рассказать на первой консультации"
  }
];

const directions = [
  ["Образование", "Повышение квалификации, семинары и обмен практическим опытом."],
  ["Профессиональное сообщество", "Встречи, интервизии и сотрудничество специалистов."],
  ["Исследования", "Изучение и обсуждение современных методов психологической работы."],
  ["Социальные проекты", "Психологическое просвещение и инициативы для разных групп населения."],
  ["Корпоративная психология", "Сотрудничество с организациями в области благополучия сотрудников."],
  ["Публикации и медиа", "Профессиональные материалы, открытые лекции и дискуссии."]
];

const events = [
  ["Открытая лекция", "Этика первой консультации", "Обсуждение границ, ожиданий и договорённостей в начале работы.", "Онлайн"],
  ["Круглый стол", "Нагрузка и благополучие специалиста", "Разговор о профессиональных границах, поддержке коллег и организации практики.", "Москва"],
  ["Интервизия", "Разбор случаев в группе коллег", "Структурированное обсуждение практики в малой группе с соблюдением конфиденциальности.", "Онлайн"]
];

const inBrowser = typeof document !== "undefined";
const siteBase = inBrowser ? document.documentElement.dataset.siteBase ?? "" : ASPP_SITE_BASE;
const main = inBrowser ? document.querySelector("#main") : null;
const nav = inBrowser ? document.querySelector("#nav") : null;
const menu = inBrowser ? document.querySelector(".menu") : null;
const dialog = inBrowser ? document.querySelector("#dialog") : null;
const pageUrl = route => siteBase ? siteBase + route.slice(1) + (route === "/" ? "" : "/") : "#" + route;
const assetUrl = name => siteBase + "assets/" + name;
const demo = '<span class="demo-label">Демонстрационный профиль</span>';
const format = person => person.modes.map(mode => mode.toLocaleLowerCase("ru")).join(" и ");
const profileUrl = person => pageUrl("/specialists/" + person.id);
const label = text => '<p class="eyebrow">' + text + '</p>';
const tags = topics => '<ul class="tags">' + topics.map(topic => '<li>' + topic + '</li>').join("") + '</ul>';
const portrait = person => `<img src="${assetUrl(person.id + ".jpg")}" alt="Демонстрационный портрет">`;

function card(person, showTopics = false) {
  return `<article class="card">
    <div class="portrait"><a href="${profileUrl(person)}" tabindex="-1" aria-hidden="true">${portrait(person)}</a>${demo}</div>
    <div class="card-body">
      <p class="card-meta">${person.role} · ${person.city}</p>
      <h3>${person.name}</h3>
      ${showTopics ? `<p class="card-meta">${format(person)}</p>${tags(person.topics)}` : ""}
      <a class="link card-link" href="${profileUrl(person)}" aria-label="Открыть профиль — ${person.name}">Открыть профиль</a>
    </div>
  </article>`;
}

function home() {
  return `<section class="hero">
    <div class="wrap hero-grid">
      <div class="hero-copy">
        ${label("Профессиональное сообщество · с 2024 года")}
        <h1>Объединяем<br> профессионалов.<br> <em>Развиваем<br> психологию.</em></h1>
        <p>Ассоциация психологов и психотерапевтов. Пространство профессионального развития, научного поиска и сотрудничества.</p>
        <div class="actions"><a class="button gold" href="${pageUrl("/specialists")}">Найти специалиста</a><a class="button outline" href="#/join">Вступить в ассоциацию</a></div>
      </div>
      <figure class="hero-figure"><img src="${assetUrl("architecture.jpg")}" alt="Лестница в современном институте"><div class="orbits" aria-hidden="true"><i></i><i></i><i></i><i></i></div></figure>
    </div>
  </section>
  <section class="section" id="about">
    <div class="wrap">
      <div class="about-grid"><div>${label("Об ассоциации")}<h2>Психология как профессия, наука и ресурс развития общества</h2></div>
      <p>АСПП объединяет специалистов практической психологии и психотерапии. Миссия ассоциации — создавать условия для профессионального роста, развивать психологические методы и делать знания о психологии доступнее.</p></div>
      <div class="facts"><div><strong>2024</strong><span>Год основания</span></div><div><strong>Москва</strong><span>Место регистрации</span></div><div><strong>НКО</strong><span>Профессиональное объединение</span></div></div>
    </div>
  </section>
  <section class="section tinted" id="projects"><div class="wrap">
    <div class="section-head"><h2>Направления деятельности</h2></div>
    <div class="directions">${directions.map(([title, body]) => `<article><h3>${title}</h3><p>${body}</p></article>`).join("")}</div>
  </div></section>
  <section class="section"><div class="wrap">
    <div class="section-head split"><div>${label("Каталог АСПП")}<h2>Специалисты</h2><p>Примеры персональных страниц психологов и психотерапевтов.</p></div><a class="button outline" href="${pageUrl("/specialists")}">Смотреть каталог</a></div>
    <div class="cards">${people.slice(0, 3).map(person => card(person)).join("")}</div>
  </div></section>
  <section class="section tinted" id="events"><div class="wrap">
    <div class="section-head"><h2>Мероприятия</h2><p>Примеры форматов профессиональных встреч.</p></div>
    <div class="events">${events.map(([kind, title, desc, place], index) => `<article class="event"><span>${kind} · ${place}</span><div><h3>${title}</h3><p>${desc}</p></div><button class="button outline" data-dialog="event-${index}" aria-label="Подробнее — ${title}">Подробнее</button></article>`).join("")}</div>
  </div></section>
  <section class="section join" id="join"><div class="wrap">
    <div>${label("Членство в АСПП")}<h2>Станьте частью профессионального сообщества</h2></div>
    <div><p>Развивайте практику, обменивайтесь опытом и участвуйте в совместных проектах.</p><div class="actions"><button class="button gold" data-dialog="join">Как вступить</button></div></div>
  </div></section>
  <section class="section"><div class="wrap info-list">
    <div id="documents"><h3>Документы</h3>
    <details><summary>Устав и реквизиты</summary><p>Ассоциация специалистов психологов и психотерапевтов «Центр Прогрессивных Психотехнологий Развития». Москва · ОГРН 1247700018906. Копия устава появится в рабочей версии.</p></details>
    <details><summary>Членство и профессиональная этика</summary><p>Место для положения о членстве и этического кодекса после утверждения документов.</p></details></div>
    <div id="contacts"><h3>Контакты ассоциации</h3><p class="intro">Москва. Официальные каналы связи будут добавлены в рабочей версии сайта.</p></div>
  </div></section>
  ${practiceSection()}`;
}

let catalogLocation = pageUrl("/specialists");
if (inBrowser && siteBase) {
  try {
    const saved = sessionStorage.getItem("aspp-catalog") || "";
    if (saved.startsWith(catalogLocation + "?")) catalogLocation = saved;
  } catch { /* The catalog still opens when storage is unavailable. */ }
}

function breadcrumb(person) {
  return `<nav class="breadcrumb" aria-label="Путь к странице"><a href="${pageUrl("/")}">Главная</a><span aria-hidden="true">/</span>${person ? `<a href="${catalogLocation}">Специалисты</a><span aria-hidden="true">/</span><span aria-current="page">${person.name}</span>` : '<span aria-current="page">Специалисты</span>'}</nav>`;
}

function select(labelText, name, blank, options) {
  return `<label>${labelText}<select name="${name}"><option value="">${blank}</option>${options.map(option => `<option>${option}</option>`).join("")}</select></label>`;
}

function catalog() {
  return `<div class="wrap catalog-bottom">
  ${breadcrumb()}
  <div class="catalog-intro"><h1>Найти специалиста</h1><p class="intro">Поиск психологов и психотерапевтов на демонстрационных данных.</p></div>
  <form class="filters" role="search" aria-label="Фильтры специалистов">
    <label>Поиск<input type="search" name="q" placeholder="Имя или тема работы" autocomplete="off"></label>
    ${select("Город", "city", "Все города", ["Москва", "Санкт-Петербург", "Казань"])}
    ${select("Формат", "mode", "Любой формат", ["Онлайн", "Очно"])}
    ${select("Специальность", "role", "Все специальности", ["Психолог", "Врач-психотерапевт"])}
  </form>
  <div class="results-top"><p id="result-count" role="status"></p><button class="text-button" data-reset>Сбросить фильтры</button></div>
  <div id="results"></div>
  </div>`;
}

function profile(person) {
  const email = person.id + "@example.invalid";
  return `<div class="wrap">
    ${breadcrumb(person)}
    <section class="profile-hero"><div class="portrait">${portrait(person)}</div>
      <div class="profile-copy">${demo}<h1>${person.name}</h1>
      <p>${person.role} · ${person.approach}</p><p>${person.city} · ${format(person)}</p>
      <div class="actions"><button class="button gold" data-dialog="booking">Записаться на консультацию</button><a class="button outline" href="${profileUrl(person)}?section=materials">Публикации</a><a class="button outline" href="${profileUrl(person)}?section=profile-contacts">Контакты</a></div></div>
    </section>
    <div class="profile-grid">
      <div>
        <section class="profile-section"><h2>О специалисте</h2><p>${person.bio}</p></section>
        <section class="profile-section"><h2>С чем я работаю</h2>${tags(person.topics)}<p style="margin-top:12px">${person.approach}.</p></section>
        <section class="profile-section"><h2>Образование и квалификация</h2><p>${person.training}</p><details><summary>Документы об образовании</summary><p>В демонстрационной карточке представлены примеры сведений о квалификации.</p></details></section>
        <section class="profile-section"><h2>Услуги и стоимость</h2><div class="fee"><div><h3>${person.service}</h3><p>${person.duration} минут · ${format(person)}</p></div><strong>${person.fee} ₽</strong></div></section>
      </div>
      <aside class="contact" id="profile-contacts" tabindex="-1">
        <h2>Контакты</h2><p>${person.city} · ${format(person)}</p><p>Эл. почта · <span style="overflow-wrap:anywhere">${email}</span></p><small>Демонстрационный адрес</small>
        <p><button class="button outline" data-dialog="telegram">Связаться в Telegram</button></p>
        <details><summary>Сведения о членстве</summary><p>Демонстрационный статус членства. В рабочей версии здесь будет ссылка на официальный реестр АСПП.</p></details>
      </aside>
    </div>
    ${materialSections(person)}
  </div>`;
}

const normalize = value => value.toLocaleLowerCase("ru").replaceAll("ё", "е");
let selectedPerson;
let selectedMaterial;

function renderResults(syncUrl = true) {
  const filters = main.querySelector(".filters");
  if (!filters) return;
  const data = new FormData(filters);
  const words = normalize(data.get("q")).trim().split(/\s+/).filter(Boolean);
  const result = people.filter(person => {
    const searchable = normalize([person.name, person.role, person.approach, ...person.topics].join(" "));
    return words.every(word => searchable.includes(word))
      && (!data.get("city") || person.city === data.get("city"))
      && (!data.get("mode") || person.modes.includes(data.get("mode")))
      && (!data.get("role") || person.role === data.get("role"));
  });
  const count = result.length;
  main.querySelector("#result-count").textContent = `Найдено специалистов: ${count}`;
  main.querySelector("#results").innerHTML = count
    ? `<div class="cards">${result.map(person => card(person, true)).join("")}</div>`
    : '<div class="empty"><h3>Специалисты не найдены</h3><p>Попробуйте изменить запрос или убрать фильтры.</p><button class="button outline" data-reset>Сбросить фильтры</button></div>';
  const params = new URLSearchParams();
  for (const [key, value] of data) if (value.trim()) params.set(key, value.trim());
  main.querySelector(".results-top [data-reset]").hidden = !params.size;
  catalogLocation = pageUrl("/specialists") + (params.size ? "?" + params : "");
  if (siteBase) {
    try { sessionStorage.setItem("aspp-catalog", catalogLocation); } catch { /* Optional browser storage. */ }
  }
  if (syncUrl) history.replaceState(null, "", catalogLocation);
}

function setMenu(open) {
  menu.setAttribute("aria-expanded", String(open));
  nav.classList.toggle("open", open);
}

function focusSection(id) {
  const section = document.getElementById(id);
  if (!section) return;
  section.setAttribute("tabindex", "-1");
  section.focus({ preventScroll: true });
  section.scrollIntoView();
}

function trackHeroLight() {
  const figure = main.querySelector(".hero-figure");
  const motion = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  const rings = [...figure.querySelectorAll(".orbits i")].map((element, index) => ({
    element, index, scale: Number(getComputedStyle(element).getPropertyValue("--ring-scale")),
    distance: null, animation: null
  }));
  const triggerRadius = 10;

  function pluck(ring) {
    ring.animation?.cancel();
    const frames = Array.from({ length: 29 }, (_, index) => {
      const time = index / 28;
      const wave = Math.sin(time * 8 * Math.PI) * (1 - time) ** 2;
      return {
        transform: `rotate(${wave * 5}deg) scale(${1 + wave * .04}, ${1 - wave * .038})`,
        borderColor: `rgba(255, 240, 217, ${.62 + Math.abs(wave) * .38})`
      };
    });
    ring.animation = ring.element.animate(frames, { duration: 780 - ring.index * 90 });
  }

  figure.addEventListener("pointermove", event => {
    if (!motion.matches || event.pointerType === "touch") return;
    const bounds = figure.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    let nearest = null;

    for (const ring of rings) {
      const radius = ring.element.offsetWidth / 2;
      const distance = Math.hypot(x - ring.element.offsetLeft - radius, y - ring.element.offsetTop) - radius * ring.scale;
      const wasAway = ring.distance === null || Math.abs(ring.distance) > triggerRadius;
      const crossed = ring.distance !== null && distance * ring.distance < 0;
      if (wasAway && (Math.abs(distance) <= triggerRadius || crossed)) {
        if (!nearest || Math.abs(distance) < Math.abs(nearest.distance)) nearest = ring;
      }
      ring.distance = distance;
    }
    if (nearest) pluck(nearest);
  });

  function resetDistances() {
    for (const ring of rings) ring.distance = null;
  }
  figure.addEventListener("pointerleave", resetDistances);
  figure.addEventListener("pointercancel", resetDistances);
}

function render(moveFocus = true) {
  const hashRoute = location.hash.startsWith("#/") ? location.hash.slice(1) : "";
  const hostedRoute = siteBase && location.pathname.startsWith(siteBase)
    ? "/" + location.pathname.slice(siteBase.length).replace(/index\.html$/, "").replace(/\/$/, "")
    : "/";
  const [path, query] = (hashRoute || hostedRoute + location.search).split("?");
  const params = new URLSearchParams(query);
  const match = path.match(/^\/specialists\/([a-z-]+)(?:\/materials\/([a-z0-9-]+))?$/);
  const catalogPage = path === "/specialists";
  const homeSections = ["about", "practice", "projects", "events", "join", "documents", "contacts"];
  const homeSection = homeSections.find(section => path === "/" + section);
  selectedPerson = match ? people.find(person => person.id === match[1]) : undefined;
  selectedMaterial = match?.[2] && selectedPerson
    ? publicMaterials(selectedPerson).find(item => item.id === match[2])
    : null;
  const sameProfile = selectedPerson && main.querySelector(".profile-hero") && main.dataset.person === selectedPerson.id;
  main.dataset.person = selectedPerson?.id || "";
  for (const anchor of nav.querySelectorAll("a")) {
    const current = anchor.hash === "#" + path
      || (siteBase && anchor.pathname === pageUrl(path))
      || (match && anchor.getAttribute("href") === pageUrl("/specialists"));
    if (current) anchor.setAttribute("aria-current", "page");
    else anchor.removeAttribute("aria-current");
  }
  setMenu(false);
  if (selectedMaterial) {
    main.innerHTML = materialPage(selectedPerson, selectedMaterial);
    document.title = selectedMaterial.title + " — " + selectedPerson.name + " · АСПП";
  } else if (selectedPerson && !match[2]) {
    if (!sameProfile) main.innerHTML = profile(selectedPerson);
    document.title = selectedPerson.name + " — АСПП";
  } else if (catalogPage) {
    main.innerHTML = catalog();
    const filters = main.querySelector(".filters");
    for (const [name, value] of params) {
      if (["q", "city", "mode", "role"].includes(name)) {
        const field = filters.elements.namedItem(name);
        field.value = value;
        if (field instanceof HTMLSelectElement && field.selectedIndex < 0) field.selectedIndex = 0;
      }
    }
    renderResults(false);
    document.title = "Каталог специалистов — АСПП";
  } else if (path === "/" || homeSection) {
    if (!main.querySelector(".hero")) {
      main.innerHTML = home();
      trackHeroLight();
    }
    document.title = "АСПП — Ассоциация психологов и психотерапевтов";
  } else {
    main.innerHTML = `<div class="wrap section"><h1>Страница не найдена</h1><div class="actions"><a class="button dark" href="${pageUrl("/specialists")}">К каталогу специалистов</a></div></div>`;
    document.title = "Страница не найдена — АСПП";
  }

  const section = homeSection || (selectedPerson && ["profile-contacts", "materials", "schedule"].includes(params.get("section")) ? params.get("section") : null);
  if (section) focusSection(section);
  else {
    window.scrollTo(0, 0);
    if (moveFocus) main.focus({ preventScroll: true });
  }
}

const messages = {
  privacy: ["Конфиденциальность", "Игры и фильтры работают в браузере. Результаты игр хранятся только до закрытия окна."],
  join: ["Вступление в АСПП", "В рабочей версии здесь появятся условия членства, список документов и способ подачи заявки."],
  booking: ["Запись на консультацию", "В рабочей версии здесь будет способ согласовать время со специалистом. Демонстрационная запись не отправляется."],
  course: ["Покупка курса", "Это демонстрационный курс. Оплата и выдача доступа не подключены."],
  "event-registration": ["Регистрация на событие", "Это демонстрационное событие. Регистрация откроется после подключения формы организатора."],
  telegram: ["Связь в Telegram", "Вымышленный профиль. В рабочей версии эта кнопка будет вести на контакт специалиста."]
};

function showDialog(key) {
  const event = key.startsWith("event-") && events[Number(key.slice(6))];
  const message = event ? [event[1], event[2] + " Это пример мероприятия без регистрации."] : messages[key];
  if (!message) return;
  dialog.classList.remove("material-editor");
  dialog.querySelector("h2").textContent = message[0];
  const paragraph = document.createElement("p");
  paragraph.textContent = message[1];
  dialog.querySelector("#dialog-body").replaceChildren(paragraph);
  dialog.showModal();
}

if (inBrowser) {
  menu.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  main.addEventListener("input", event => {
    if (event.target.closest(".filters")) renderResults();
  });
  main.addEventListener("submit", event => {
    if (event.target.matches(".filters")) {
      event.preventDefault();
      renderResults();
    }
  });
  document.addEventListener("click", event => {
    handleMaterialsClick(event.target);
    const practice = event.target.closest("[data-practice]");
    if (practice) openPractice(practice.dataset.practice);
    const action = event.target.closest("[data-dialog]");
    if (action) showDialog(action.dataset.dialog);
    if (event.target.closest("[data-reset]")) {
      const filters = main.querySelector(".filters");
      filters.reset();
      renderResults();
      filters.elements.q.focus();
    }
    const link = event.target.closest('a[href^="#/"]');
    if (link && link.hash === location.hash && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      render();
    }
  });
  document.querySelector(".skip").addEventListener("click", event => {
    event.preventDefault();
    main.focus();
    main.scrollIntoView();
  });
  window.addEventListener("hashchange", () => render());
  render(false);
}
