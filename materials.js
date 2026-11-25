"use strict";

const materialTypes = {
  article: ["Статья", "Статьи"],
  post: ["Пост", "Посты"],
  video: ["Видео", "Видео"],
  guide: ["Гайд", "Гайды"],
  course: ["Курс", "Курсы"],
  event: ["Событие", "События"]
};

const materialSeed = {
  "alexander-morozov": [
    {
      id: "workload", type: "article", title: "Как понять, что пора пересмотреть рабочую нагрузку",
      summary: "Три вопроса, которые помогают заметить перегрузку и выбрать, с чего начать разговор о работе.",
      body: "Иногда нагрузка растёт постепенно. Первая подсказка — задачи, на которые раньше хватало обычного рабочего дня, регулярно уходят в вечер. Полезно записать, какие дела сдвигались и что именно заняло освободившееся время.\n\nВторой вопрос — когда удаётся восстанавливаться? Сравните дни, после которых остаётся энергия на что-то ещё, и дни, после которых хочется только отложить следующий подъём. Важно найти конкретные различия в расписании.\n\nТретий вопрос — что реально можно изменить на этой неделе? Начните с одной договорённости. Например, обсудите, какие задачи можно перевести в следующий цикл или в какие часы вы отвечаете на сообщения.",
      date: "2026-11-18"
    },
    {
      id: "talk-about-boundaries", type: "post", title: "С чего начать разговор о границах",
      summary: "Попробуйте описать одну конкретную ситуацию и попросить об одном изменении.",
      body: "Вместо общей фразы про то, что вы постоянно перегружены, можно сказать: «Когда задача приходит вечером, я не успеваю завершить её к утру. Давайте согласовывать срок на следующий день». Такая формулировка даёт собеседнику понятную точку для ответа.",
      date: "2026-11-16"
    },
    {
      id: "video-introduction", type: "video", title: "Видеознакомство со специалистом",
      summary: "Место для короткого видео о формате работы, подходе и первой консультации.",
      body: "Видеознакомство помогает узнать, как проходит первая консультация и какие вопросы можно обсудить заранее. В редакторе можно добавить ссылку на видео или видеоотзыв.",
      date: "2026-11-14"
    },
    {
      id: "first-session-guide", type: "guide", title: "Чек-лист перед первой консультацией",
      summary: "Бесплатный текстовый гайд. Что можно обдумать до первой встречи и какие вопросы задать специалисту.",
      body: "1. Запишите, что побудило вас обратиться именно сейчас.\n2. Отметьте, что хотелось бы обсудить на первой встрече.\n3. Подготовьте вопросы о формате, длительности, стоимости и порядке переноса встречи.\n4. Если встреча онлайн, заранее проверьте связь и выберите место, где можно спокойно говорить.",
      date: "2026-11-12"
    },
    {
      id: "workweek-course", type: "course", title: "Рабочая неделя без постоянной спешки",
      summary: "Пример платного курса из трёх занятий о планировании нагрузки и разговоре о сроках.",
      body: "Занятие 1. Разбираем, из чего складывается рабочая неделя.\n\nЗанятие 2. Сравниваем план с фактической нагрузкой и выбираем одну перемену для эксперимента.\n\nЗанятие 3. Готовим разговор о приоритетах, сроках и доступности.",
      price: 1900, date: "2026-11-10"
    },
    {
      id: "webinar-priorities", type: "event", title: "Как обсуждать нагрузку и сроки",
      summary: "На примере рабочих ситуаций разберём, как говорить о приоритетах и предлагать выполнимые сроки.",
      body: "В программе короткая лекция, разбор ситуаций и вопросы участников. Продолжительность — 60 минут.",
      eventAt: "2026-12-12T19:00", eventKind: "Вебинар", eventFormat: "Онлайн", date: "2026-11-20"
    },
    {
      id: "workshop-week", type: "event", title: "Практикум по планированию недели",
      summary: "Участники разберут своё расписание и выберут одно изменение, которое смогут проверить на практике.",
      body: "Для практикума пригодится календарь с задачами за последнюю неделю. Продолжительность — 90 минут.",
      eventAt: "2026-12-19T12:00", eventKind: "Практикум", eventFormat: "Очно · Москва", date: "2026-11-19"
    }
  ]
};

const introductoryPosts = {
  "elena-volkova": ["Как подготовиться к сложному разговору", "Начните с одной ситуации, которую хотите обсудить.", "Попробуйте заранее записать, что именно произошло, как это на вас повлияло и о чём вы хотите попросить. Так проще вернуться к теме, если разговор уйдёт в сторону."],
  "andrey-sokolov": ["Как подготовиться к первой встрече со специалистом", "Возьмите с собой вопросы, которые важно успеть задать.", "Можно отметить, что изменилось в последние недели, какие ситуации вызывают больше всего трудностей и чего вы ждёте от встречи. Полный рассказ готовить заранее необязательно."],
  "maria-belyaeva": ["Первый разговор о семейной консультации", "Обсудите с близким, какую ситуацию вы хотели бы разобрать вместе.", "У каждого участника могут быть свои ожидания. Попробуйте сначала выслушать обе версии и договориться о вопросе, который стоит вынести на первую встречу."],
  "pavel-orlov": ["Что обсудить с психологом при смене профессии", "Проверьте, какой опыт вы хотите сохранить при переходе.", "Составьте два коротких списка. В первый запишите задачи, к которым хотелось бы возвращаться, во второй — условия, которые больше не подходят. Это поможет сформулировать критерии выбора."],
  "natalia-krylova": ["Что можно рассказать на первой консультации", "Начать можно с одного недавнего примера.", "Опишите обычный день и отметьте моменты, когда напряжение усиливается или становится легче. На встрече можно вместе уточнить детали, если сопоставить события самостоятельно трудно."]
};
for (const [personId, [title, summary, body]] of Object.entries(introductoryPosts)) {
  materialSeed[personId] = [{ id: "notes-for-first-meeting", type: "post", title, summary, body, date: "2026-11-18" }];
}

const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const rubles = new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 });
const dayFormat = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Moscow" });
const eventFormat = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Moscow" });
const eventTime = item => new Date(item.eventAt + "+03:00");
const storageKey = person => "aspp-materials-v1:" + person.id;
const builtinMaterials = person => materialSeed[person.id] ?? [];

function localMaterials(person) {
  if (!inBrowser) return [];
  try {
    const entries = JSON.parse(localStorage.getItem(storageKey(person)) || "[]");
    return Array.isArray(entries) ? entries.filter(item => item && Object.hasOwn(materialTypes, item.type) && /^local-[\w-]+$/.test(item.id)) : [];
  } catch {
    return [];
  }
}

function safeLink(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : "";
  } catch {
    return "";
  }
}

function mediaSource(value) {
  const safe = safeLink(value);
  if (!safe) return null;
  const url = new URL(safe);
  let id = "";
  if (url.hostname === "youtu.be") id = url.pathname.split("/")[1];
  if (["youtube.com", "www.youtube.com", "m.youtube.com", "www.youtube-nocookie.com"].includes(url.hostname)) {
    id = url.searchParams.get("v") || (url.pathname.match(/^\/(?:shorts|embed)\/([^/]+)\/?$/)?.[1] ?? "");
  }
  if (/^[\w-]{11}$/.test(id ?? "")) return { embed: "https://www.youtube-nocookie.com/embed/" + id };
  if (url.hostname === "rutube.ru") {
    id = url.pathname.match(/^\/(?:video|play\/embed)\/([a-f0-9]{32})\/?$/i)?.[1];
    if (id) return { embed: "https://rutube.ru/play/embed/" + id };
  }
  if (["vkvideo.ru", "vk.com"].includes(url.hostname)) {
    const parts = url.pathname.match(/^\/video(-?\d+)_(\d+)\/?$/);
    if (parts) return { embed: "https://vkvideo.ru/video_ext.php?oid=" + parts[1] + "&id=" + parts[2] };
  }
  return /\.(mp4|webm)$/i.test(url.pathname) ? { file: safe } : null;
}

function materialUrl(person, item) {
  const route = "/specialists/" + person.id + "/materials/" + item.id;
  return item.id.startsWith("local-") ? "#" + route : pageUrl(route);
}

function materialCards(person, items) {
  if (!items.length) return '<p class="material-empty">Публикаций пока нет.</p>';
  return items.map(item => {
    const meta = item.type === "event" ? escapeHtml(item.eventKind) : materialTypes[item.type][0];
    const extra = item.type === "course" ? rubles.format(item.price) : item.type === "guide" ? "Бесплатно" : "";
    const action = { article: "Читать статью", post: "Читать пост", video: "Смотреть видео", guide: "Открыть гайд", course: "Смотреть программу", event: "О событии" }[item.type];
    return `<article class="material-card">
      <div class="material-meta"><span>${meta}</span>${extra ? '<span>' + extra + '</span>' : ''}
      ${item.id.startsWith("local-") ? '<span>Только в этом браузере</span>' : ''}</div>
      <h3><a href="${materialUrl(person, item)}">${escapeHtml(item.title)}</a></h3>
      <p>${escapeHtml(item.summary)}</p>
      <a class="link" href="${materialUrl(person, item)}" aria-label="${action} · ${escapeHtml(item.title)}">${action}</a>
    </article>`;
  }).join("");
}

function publicMaterials(person) {
  return [...localMaterials(person).filter(item => item.published), ...builtinMaterials(person)];
}

function upcomingEvents(items) {
  return items.filter(item => item.type === "event" && eventTime(item) > new Date())
    .sort((a, b) => eventTime(a) - eventTime(b));
}

function materialSections(person) {
  const items = publicMaterials(person);
  const upcoming = upcomingEvents(items);
  return `<section class="materials-section" id="materials" data-materials aria-labelledby="materials-title">
    <div class="material-heading"><div><h2 id="materials-title">Публикации и материалы</h2></div>
      <button class="button outline" type="button" data-material-editor>Открыть демо-редактор</button>
    </div>
    ${items.length ? `<div class="material-tabs" role="group" aria-label="Тип публикации">
      <button type="button" data-material-filter="all" aria-pressed="true">Все</button>
      ${Object.entries(materialTypes).filter(([type]) => items.some(item => item.type === type)).map(([type, [, name]]) => `<button type="button" data-material-filter="${type}" aria-pressed="false">${name}</button>`).join("")}
    </div>` : ""}
    <div class="material-cards">${materialCards(person, items)}</div>
    ${upcoming.length ? `<section class="event-schedule" id="schedule" aria-labelledby="schedule-title">
      <div class="section-head"><h2 id="schedule-title">Ближайшие события</h2><p>Расписание демонстрационного профиля</p></div>
      ${upcoming.map(item => `<article class="schedule-row">
        <div><time datetime="${escapeHtml(item.eventAt)}+03:00">${eventFormat.format(eventTime(item))} МСК</time>
          <p>${escapeHtml(item.eventKind)} · ${escapeHtml(item.eventFormat)}</p></div>
        <div><h3><a href="${materialUrl(person, item)}">${escapeHtml(item.title)}</a></h3><p>${escapeHtml(item.summary)}</p></div>
        <a class="button outline" href="${materialUrl(person, item)}" aria-label="Подробнее · ${escapeHtml(item.title)}">Подробнее</a>
      </article>`).join("")}
    </section>` : ""}
  </section>`;
}

function materialPage(person, item) {
  const link = escapeHtml(safeLink(item.link));
  const media = mediaSource(item.link);
  const lead = item.type === "event"
    ? `<p class="material-byline"><time datetime="${escapeHtml(item.eventAt)}+03:00">${eventFormat.format(eventTime(item))} МСК</time> · ${escapeHtml(item.eventFormat)}</p>`
    : `<p class="material-byline">${dayFormat.format(new Date(item.date + "T12:00:00+03:00"))}</p>`;
  let extra = "";
  if (item.type === "video") {
    if (media?.embed) extra = `<button class="video-tile" data-play-video type="button"><span aria-hidden="true">▶</span> Загрузить видео</button>`;
    else if (media?.file) extra = `<video class="material-video" controls preload="none" src="${escapeHtml(media.file)}"></video>`;
    else extra = '<p class="material-note">Демонстрационный пример. В редакторе можно добавить ролик или видеоотзыв.</p>';
  }
  if (item.type === "guide") extra = link
    ? `<a class="button dark" href="${link}" target="_blank" rel="noopener noreferrer">Открыть бесплатный гайд</a>`
    : '<button class="button dark" data-download-guide>Скачать гайд</button>';
  if (item.type === "course") extra = `<div class="purchase"><strong>${rubles.format(item.price)}</strong>${link
    ? `<a class="button dark" href="${link}" target="_blank" rel="noopener noreferrer">Перейти к оплате</a>`
    : '<button class="button dark" data-dialog="course">Купить курс</button>'}</div>`;
  if (item.type === "event") {
    if (eventTime(item) <= new Date()) extra = '<p class="material-note">Событие завершилось</p>';
    else extra = link
      ? `<a class="button dark" href="${link}" target="_blank" rel="noopener noreferrer">Зарегистрироваться</a>`
      : '<button class="button dark" data-dialog="event-registration">Зарегистрироваться</button>';
  }
  return `<div class="wrap article-page">
    <nav class="breadcrumb" aria-label="Путь к странице"><a href="${pageUrl("/")}">Главная</a><span aria-hidden="true">/</span><a href="${profileUrl(person)}">${escapeHtml(person.name)}</a><span aria-hidden="true">/</span><span aria-current="page">${materialTypes[item.type][0]}</span></nav>
    <article class="material-article">
      <div class="material-meta"><span>${materialTypes[item.type][0]}</span><span>${item.id.startsWith("local-") ? "Только в этом браузере" : "Демонстрационный материал"}</span></div>
      <h1>${escapeHtml(item.title)}</h1>
      <p class="article-summary">${escapeHtml(item.summary)}</p>
      <div class="article-author"><a href="${profileUrl(person)}">${escapeHtml(person.name)}</a>${lead}</div>
      <div class="article-text">${String(item.body ?? "").split(/\n\s*\n/).filter(Boolean).map(paragraph => "<p>" + escapeHtml(paragraph).replaceAll("\n", "<br>") + "</p>").join("")}</div>
      ${extra}
    </article>
  </div>`;
}

function refreshMaterials(person) {
  main.querySelector("[data-materials]").outerHTML = materialSections(person);
}

function editMaterials(person, id = "") {
  const items = localMaterials(person);
  const item = items.find(entry => entry.id === id) ?? {};
  dialog.classList.add("material-editor");
  dialog.querySelector("h2").textContent = id ? "Редактировать материал" : "Редактор профиля";
  dialog.querySelector("#dialog-body").innerHTML = `
    <p class="intro">Демо-режим. Материалы сохраняются на этом устройстве и видны только в этом браузере.</p>
    ${items.length ? `<div class="editor-list">${items.map(entry => `<div><button type="button" class="text-button" data-edit-material="${entry.id}">${escapeHtml(entry.title)}</button><small>${entry.published ? "В ленте" : "Черновик"}</small></div>`).join("")}
      ${id ? '<button type="button" class="text-button" data-edit-material="">Создать новый</button>' : ""}</div>` : ""}
    <form class="editor-form">
      <label>Тип материала<select name="type">${Object.entries(materialTypes).map(([type, [name]]) => `<option value="${type}"${item.type === type ? " selected" : ""}>${name}</option>`).join("")}</select></label>
      <label>Заголовок<input name="title" maxlength="115" required value="${escapeHtml(item.title)}"></label>
      <label>Краткое описание<textarea name="summary" rows="2" maxlength="250" required>${escapeHtml(item.summary)}</textarea></label>
      <label>Текст материала<textarea name="body" rows="5" maxlength="20000">${escapeHtml(item.body)}</textarea></label>
      <label data-field="link"><span data-link-label>Ссылка</span><input name="link" type="url" value="${escapeHtml(item.link)}" placeholder="https://"></label>
      <label data-field="price">Цена, ₽<input name="price" type="number" min="1" max="10000000" step="1" value="${escapeHtml(item.price)}"></label>
      <fieldset data-field="event"><legend>Расписание</legend>
        <label>Дата и время (МСК)<input name="eventAt" type="datetime-local" value="${escapeHtml(item.eventAt)}"></label>
        <label>Вид события<select name="eventKind">${["Вебинар", "Лекция", "Практикум", "Встреча"].map(kind => `<option${item.eventKind === kind ? " selected" : ""}>${kind}</option>`).join("")}</select></label>
        <label>Формат и место<input name="eventFormat" maxlength="80" placeholder="Онлайн или адрес площадки" value="${escapeHtml(item.eventFormat)}"></label>
      </fieldset>
      <p data-editor-status role="status"></p>
      <div class="actions"><button class="button dark" name="action" value="publish">Опубликовать в демо-ленте</button><button class="button outline" name="action" value="draft">${item.published ? "Снять с публикации" : "Сохранить черновик"}</button></div>
    </form>`;
  const form = dialog.querySelector(".editor-form");

  function updateFields() {
    const type = form.elements.type.value;
    const labels = { video: "Ссылка на YouTube, VK Видео, Rutube или MP4/WebM", guide: "Ссылка на файл (если есть)", course: "Ссылка на страницу оплаты (если есть)", event: "Ссылка на регистрацию (если есть)" };
    for (const [key, shown] of Object.entries({ link: Boolean(labels[type]), price: type === "course", event: type === "event" })) {
      const field = form.querySelector('[data-field="' + key + '"]');
      field.hidden = !shown;
      for (const input of field.querySelectorAll("input, select")) input.disabled = !shown;
    }
    form.querySelector("[data-link-label]").textContent = labels[type] ?? "Ссылка";
    form.elements.link.setCustomValidity("");
    form.elements.link.required = type === "video";
    form.elements.price.required = type === "course";
    form.elements.eventAt.required = form.elements.eventFormat.required = type === "event";
    form.elements.body.required = type === "article" || type === "post" || (type === "guide" && !form.elements.link.value.trim());
  }

  form.elements.type.addEventListener("change", updateFields);
  form.elements.link.addEventListener("input", updateFields);
  updateFields();
  form.addEventListener("submit", event => {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(form));
    const normalizedLink = safeLink(fields.link);
    const status = form.querySelector("[data-editor-status]");
    if (!fields.title.trim() || !fields.summary.trim() || (form.elements.body.required && !fields.body.trim())) {
      status.textContent = "Заполните обязательные поля текстом.";
      return;
    }
    if ((fields.link && !normalizedLink) || (fields.type === "video" && !mediaSource(normalizedLink))) {
      form.elements.link.setCustomValidity("Укажите действительную HTTPS-ссылку поддерживаемого формата.");
      form.elements.link.reportValidity();
      return;
    }
    const saved = {
      id: item.id ?? "local-" + (globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)),
      type: fields.type, title: fields.title.trim(), summary: fields.summary.trim(),
      body: fields.body.trim(), date: item.date ?? new Date().toISOString().slice(0, 10),
      published: event.submitter?.value === "publish"
    };
    if (normalizedLink) saved.link = normalizedLink;
    if (fields.type === "course") saved.price = Number(fields.price);
    if (fields.type === "event") {
      if (!fields.eventFormat.trim()) {
        status.textContent = "Укажите формат или место проведения.";
        return;
      }
      Object.assign(saved, {eventAt: fields.eventAt, eventKind: fields.eventKind, eventFormat: fields.eventFormat.trim()});
    }
    try {
      const all = localMaterials(person);
      localStorage.setItem(storageKey(person), JSON.stringify([saved, ...all.filter(entry => entry.id !== saved.id)]));
    } catch {
      status.textContent = "Сохранение в браузере недоступно. Проверьте настройки хранилища.";
      return;
    }
    refreshMaterials(person);
    editMaterials(person, saved.id);
    dialog.querySelector("[data-editor-status]").textContent = saved.published ? "Материал появился в локальной ленте." : "Черновик сохранён.";
  });
  if (!dialog.open) dialog.showModal();
}

function handleMaterialsClick(target) {
  const filter = target.closest("[data-material-filter]");
  if (filter && selectedPerson) {
    const type = filter.dataset.materialFilter;
    for (const button of filter.parentElement.children) button.setAttribute("aria-pressed", String(button === filter));
    main.querySelector(".material-cards").innerHTML = materialCards(selectedPerson, publicMaterials(selectedPerson).filter(item => type === "all" || item.type === type));
  }
  if (target.closest("[data-material-editor]") && selectedPerson) editMaterials(selectedPerson);
  const edit = target.closest("[data-edit-material]");
  if (edit && selectedPerson) editMaterials(selectedPerson, edit.dataset.editMaterial);
  const play = target.closest("[data-play-video]");
  if (play && selectedMaterial) {
    const { embed } = mediaSource(selectedMaterial.link) ?? {};
    if (!embed) return;
    const frame = document.createElement("iframe");
    frame.className = "material-video";
    frame.src = embed;
    frame.title = selectedMaterial.title;
    frame.allow = "encrypted-media; picture-in-picture; fullscreen";
    frame.allowFullscreen = true;
    play.replaceWith(frame);
  }
  if (target.closest("[data-download-guide]") && selectedMaterial?.type === "guide") {
    const url = URL.createObjectURL(new Blob([selectedMaterial.title + "\n\n" + selectedMaterial.body], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.download = selectedMaterial.id + ".txt";
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
