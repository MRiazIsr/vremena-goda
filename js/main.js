/* ==========================================================================
   «Времена года» — скрипты сайта
   ========================================================================== */
(() => {
  'use strict';

  /* ===== НАСТРОЙКИ ======================================================
     formEmail — почта, на которую приходят заявки с сайта.
     Отправка идёт через бесплатный сервис formsubmit.co: после первой
     заявки на эту почту придёт письмо «Activate Form» — нажмите кнопку
     в нём один раз, и дальше заявки будут приходить автоматически.
     Пока поле пустое, форма предлагает отправить заявку в WhatsApp.
     ===================================================================== */
  const CONFIG = {
    formEmail: '390699@mail.ru',
    whatsapp: '79114590699',
    phone: '+7 (4012) 39-06-99',
    phoneHref: 'tel:+74012390699',
    extraTours: ['Индивидуальная программа', 'Другое / нужна консультация'],
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Год в подвале ---------- */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---------- Шапка: фон при прокрутке ---------- */
  const header = $('#header');
  const onScroll = () => header.classList.toggle('is-solid', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('load', onScroll);
  window.addEventListener('hashchange', onScroll);

  /* ---------- Мобильное меню ---------- */
  const burger = $('.burger');
  const nav = $('#nav');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    nav.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('menu-open', open);
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a, button')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  window.matchMedia('(min-width: 981px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* ---------- Подсветка текущего пункта меню ---------- */
  const navLinks = $$('.nav__list a');
  if ('IntersectionObserver' in window) {
    const byId = new Map(navLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const link = byId.get(entry.target.id);
        if (!link) return;
        navLinks.forEach((a) => {
          const on = a === link;
          a.classList.toggle('is-current', on);
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    byId.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- Слайдер на главном экране ---------- */
  const slides = $$('.hero__slide');
  const dotsWrap = $('.hero__dots');
  const caption = $('.hero__caption');
  let current = 0;
  let timer = null;

  const loadSlide = (slide) => {
    if (slide && slide.dataset.bg) {
      slide.style.backgroundImage = `url('${slide.dataset.bg}')`;
      delete slide.dataset.bg;
    }
  };
  const dots = slides.map((slide, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'hero__dot';
    dot.setAttribute('aria-label', `Слайд ${i + 1}: ${slide.dataset.caption}`);
    dot.addEventListener('click', () => { goTo(i); restart(); });
    dotsWrap.appendChild(dot);
    return dot;
  });
  function goTo(i) {
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    dots[current].removeAttribute('aria-current');
    current = (i + slides.length) % slides.length;
    loadSlide(slides[current]);
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
    dots[current].setAttribute('aria-current', 'true');
    caption.textContent = slides[current].dataset.caption || '';
    loadSlide(slides[(current + 1) % slides.length]); // подгружаем следующий заранее
  }
  function restart() {
    clearInterval(timer);
    if (!reduceMotion && slides.length > 1) timer = setInterval(() => goTo(current + 1), 6500);
  }
  if (slides.length) {
    goTo(0);
    restart();
    document.addEventListener('visibilitychange', () => (document.hidden ? clearInterval(timer) : restart()));
  }

  /* ---------- Фильтр направлений ---------- */
  const filters = $$('.filter');
  const cards = $$('.tour-card');
  filters.forEach((btn) => btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    filters.forEach((b) => {
      const on = b === btn;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    cards.forEach((card) => { card.hidden = f !== 'all' && card.dataset.cat !== f; });
  }));

  /* ---------- Списки направлений в формах ---------- */
  const tourNames = [...new Set($$('.tour-card [data-tour]').map((b) => b.dataset.tour).concat(CONFIG.extraTours))];
  $$('[data-tour-select]').forEach((select) => {
    select.add(new Option('Выберите направление', ''));
    tourNames.forEach((name) => select.add(new Option(name, name)));
  });

  /* ---------- Окно заявки ---------- */
  const modal = $('#request-modal');
  const modalForm = $('form', modal);
  $$('[data-open-request]').forEach((btn) => btn.addEventListener('click', () => {
    setMenu(false);
    if (typeof modal.showModal !== 'function') { location.hash = '#contacts'; return; }
    const select = $('select[name="tour"]', modalForm);
    select.value = tourNames.includes(btn.dataset.tour) ? btn.dataset.tour : '';
    const status = $('.form-status', modalForm);
    status.className = 'form-status';
    status.textContent = '';
    modal.showModal();
    setTimeout(() => $('input[name="name"]', modalForm).focus(), 50);
  }));
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.closest('[data-close]')) modal.close();
  });

  /* ---------- Маска телефона ---------- */
  const formatPhone = (value) => {
    let d = value.replace(/\D/g, '');
    if (!d) return '';
    if (d[0] === '8') d = '7' + d.slice(1);
    if (d[0] !== '7') d = '7' + d;
    const p = d.slice(1, 11);
    let out = '+7';
    if (p.length) out += ' (' + p.slice(0, 3);
    if (p.length >= 3) out += ')';
    if (p.length > 3) out += ' ' + p.slice(3, 6);
    if (p.length > 6) out += '-' + p.slice(6, 8);
    if (p.length > 8) out += '-' + p.slice(8, 10);
    return out;
  };
  $$('[data-phone]').forEach((input) => {
    input.addEventListener('input', (e) => {
      if (e.inputType && e.inputType.startsWith('delete')) return;
      input.value = formatPhone(input.value);
    });
    input.addEventListener('focus', () => { if (!input.value) input.value = '+7 ('; });
    input.addEventListener('blur', () => {
      input.value = input.value.replace(/\D/g, '').length <= 1 ? '' : formatPhone(input.value);
    });
  });

  /* ---------- Отправка заявок ---------- */
  const whatsappLink = (data) => {
    const lines = [
      'Здравствуйте! Заявка с сайта «Времена года».',
      `Имя: ${data.name || ''}`,
      `Телефон: ${data.phone || ''}`,
      data.tour ? `Направление: ${data.tour}` : '',
      data.dates ? `Даты: ${data.dates}` : '',
      data.comment ? `Комментарий: ${data.comment}` : '',
    ].filter(Boolean);
    return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  async function sendRequest(data) {
    if (!CONFIG.formEmail) {
      const err = new Error('Почта для заявок не настроена');
      err.code = 'not-configured';
      throw err;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${CONFIG.formEmail}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          'Имя': data.name,
          'Телефон': data.phone,
          'Направление': data.tour || 'не выбрано',
          'Даты и состав': data.dates || '—',
          'Комментарий': data.comment || '—',
          _subject: `Заявка с сайта «Времена года»${data.tour ? ': ' + data.tour : ''}`,
          _template: 'table',
          _captcha: 'false',
        }),
        signal: controller.signal,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || String(json.success) !== 'true') throw new Error(json.message || `HTTP ${res.status}`);
    } finally {
      clearTimeout(timeout);
    }
  }

  const validate = (form) => {
    let ok = true;
    const name = form.elements.name;
    const phone = form.elements.phone;
    const consent = form.elements.consent;
    const mark = (el, bad) => { el.closest('.field, .consent').classList.toggle('is-invalid', bad); if (bad) ok = false; };
    mark(name, !name.value.trim());
    mark(phone, phone.value.replace(/\D/g, '').length !== 11);
    mark(consent, !consent.checked);
    return ok;
  };

  $$('[data-request-form]').forEach((form) => {
    form.addEventListener('input', (e) => {
      const wrap = e.target.closest('.is-invalid');
      if (wrap) wrap.classList.remove('is-invalid');
    });
    form.addEventListener('change', (e) => {
      const wrap = e.target.closest('.is-invalid');
      if (wrap) wrap.classList.remove('is-invalid');
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = $('.form-status', form);
      status.className = 'form-status';
      status.textContent = '';

      if (!validate(form)) {
        status.className = 'form-status is-err';
        status.textContent = 'Пожалуйста, укажите имя, телефон полностью и подтвердите согласие на обработку данных.';
        return;
      }

      const data = Object.fromEntries(new FormData(form));
      const submit = $('button[type="submit"]', form);
      const label = submit.textContent;

      if (data._honey) { form.reset(); return; } // спам-бот

      submit.disabled = true;
      submit.textContent = 'Отправляем…';
      try {
        await sendRequest(data);
        status.className = 'form-status is-ok';
        status.textContent = 'Спасибо! Заявка отправлена. Мы свяжемся с вами в рабочее время — с 9:00 до 18:00.';
        form.reset();
      } catch (err) {
        status.className = 'form-status is-err';
        const intro = err.code === 'not-configured'
          ? 'Онлайн-отправка заявок скоро заработает.'
          : 'Не удалось отправить заявку через сайт.';
        status.innerHTML = `${intro} Пожалуйста, <a href="${whatsappLink(data)}" target="_blank" rel="noopener">отправьте её в WhatsApp</a> — текст уже заполнен — или позвоните: <a href="${CONFIG.phoneHref}">${CONFIG.phone}</a>.`;
      } finally {
        submit.disabled = false;
        submit.textContent = label;
      }
    });
  });

  /* ---------- Галерея: просмотр фото ---------- */
  const lightbox = $('#lightbox');
  const shots = $$('.gallery__item button');
  const lbImg = $('img', lightbox);
  const lbCap = $('figcaption', lightbox);
  let shot = 0;
  const showShot = (i) => {
    shot = (i + shots.length) % shots.length;
    const btn = shots[shot];
    const thumb = $('img', btn);
    lbImg.onerror = () => { lbImg.onerror = null; lbImg.src = thumb.src; };
    lbImg.src = btn.dataset.full;
    lbImg.alt = thumb.alt;
    lbCap.textContent = $('span', btn).textContent;
  };
  if (typeof lightbox.showModal === 'function') {
    shots.forEach((btn, i) => btn.addEventListener('click', () => { showShot(i); lightbox.showModal(); }));
    $('.lightbox__prev', lightbox).addEventListener('click', () => showShot(shot - 1));
    $('.lightbox__next', lightbox).addEventListener('click', () => showShot(shot + 1));
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.closest('[data-close]')) lightbox.close();
    });
    lightbox.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') showShot(shot - 1);
      if (e.key === 'ArrowRight') showShot(shot + 1);
    });
    let touchX = null;
    lightbox.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) showShot(shot + (dx < 0 ? 1 : -1));
      touchX = null;
    });
  }

  /* ---------- Уведомление о cookie ---------- */
  const cookie = $('#cookie');
  let cookieOk = false;
  try { cookieOk = localStorage.getItem('vg-cookie-ok') === '1'; } catch (_) { /* приватный режим */ }
  if (!cookieOk) cookie.hidden = false;
  $('[data-cookie-ok]').addEventListener('click', () => {
    cookie.hidden = true;
    try { localStorage.setItem('vg-cookie-ok', '1'); } catch (_) { /* приватный режим */ }
  });

  /* ---------- Плавное появление блоков ---------- */
  const reveals = $$('.reveal');
  $$('.features .reveal').forEach((el, i) => { el.style.transitionDelay = `${(i % 3) * 90}ms`; });
  if ('IntersectionObserver' in window && !reduceMotion) {
    const ro = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); ro.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => ro.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }
})();
