// Сайт-портфолио — поведение: меню, аккордеоны, слайдер «Что сделаем», переключатель цен, цели Метрики.
(function () {
  'use strict';

  // ---- меню на телефоне и планшете ----
  var menu = document.getElementById('menu');
  var burger = document.querySelector('.header__burger');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) menu.querySelector('.menu__close').focus();
  }
  if (menu && burger) {
    burger.addEventListener('click', function () { setMenu(true); });
    menu.querySelector('.menu__close').addEventListener('click', function () { setMenu(false); burger.focus(); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
  }

  // ---- аккордеоны ----
  document.querySelectorAll('.acc__head').forEach(function (btn) {
    var body = btn.closest('.acc').querySelector('.acc__body');
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      body.hidden = !open;
    });
  });

  // ---- слайдер «Что сделаем» ----
  // Разметка — список 01–04 (так он и показан на телефоне). С 768 CSS прячет неактивные пункты,
  // а скрипт кладёт слова каждого пункта в ленту кадров слева. Лента едет снизу вверх, текст гаснет.
  // Сдвиг в процентах от высоты кадра — высота нигде не зашита числом.
  var slider = document.querySelector('[data-slider]');
  if (slider) {
    var items = slider.querySelectorAll('.svc');
    var list = slider.querySelector('.svc-list');
    var track = slider.querySelector('.services__track');
    var dots = slider.querySelectorAll('.dots button');
    var current = 0;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    items.forEach(function (item) {
      var frame = document.createElement('div');
      frame.className = 'services__frame';
      // узор как в хиро + крупный значок направления (иллюстраций пока нет — Дмитрий, 09.10)
      var NS = 'http://www.w3.org/2000/svg';
      var bg = document.createElementNS(NS, 'svg'); bg.setAttribute('class', 'frame__pattern'); bg.setAttribute('aria-hidden', 'true');
      var rect = document.createElementNS(NS, 'rect'); rect.setAttribute('width', '100%'); rect.setAttribute('height', '100%'); rect.setAttribute('fill', 'url(#hero-tile)');
      bg.appendChild(rect); frame.appendChild(bg);
      var ic = document.createElementNS(NS, 'svg'); ic.setAttribute('class', 'frame__icon'); ic.setAttribute('aria-hidden', 'true');
      var use = document.createElementNS(NS, 'use'); use.setAttribute('href', '#' + (item.dataset.icon || 'p-site'));
      ic.appendChild(use); frame.appendChild(ic);
      item.querySelectorAll('.svc__words li').forEach(function (w) {
        var p = document.createElement('p'); p.textContent = w.textContent; frame.appendChild(p);
      });
      track.appendChild(frame);
    });
    function show(i) {
      items.forEach(function (it, k) { it.classList.toggle('is-active', k === i); });
      dots.forEach(function (d, k) { d.setAttribute('aria-current', String(k === i)); });
    }
    function go(i) {
      i = (i + items.length) % items.length;
      if (i === current) return;
      current = i;
      track.style.transform = 'translateY(' + (-100 * i) + '%)';
      if (reduce) { show(i); return; }
      list.classList.add('is-fading');
      setTimeout(function () { show(i); list.classList.remove('is-fading'); }, 300);
    }
    slider.querySelector('[data-prev]').addEventListener('click', function () { go(current - 1); });
    slider.querySelector('[data-next]').addEventListener('click', function () { go(current + 1); });
    dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); }); });
  }

  // ---- переключатель цен ----
  var planBtns = document.querySelectorAll('[data-plan]');
  planBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var plan = btn.dataset.plan;
      planBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      document.querySelectorAll('[data-plan-set]').forEach(function (set) {
        set.hidden = set.dataset.planSet !== plan;
        if (!set.hidden) set.scrollLeft = 0;
      });
      reachGoal('price_' + plan);
    });
  });

  // ---- цели Метрики: клики по Telegram ----
  // Счётчик подключается при запуске (после cookie-баннера). Пока его нет — вызов просто пропускается.
  var METRIKA_ID = null; // номер счётчика вписать при запуске

  // ---- cookie-согласие: Метрика грузится только после «Согласиться» (09.10) ----
  // Пока METRIKA_ID не вписан, окно не показывается. Посмотреть окно заранее: адрес с #cookie-test.
  var KEY = 'cookie-consent';
  function getConsent() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setConsent(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function loadMetrika() {
    if (!METRIKA_ID || window.ym) return;
    (function (m, e, t, r, i, k, a) { m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); }; m[i].l = 1 * new Date(); k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, a.parentNode.insertBefore(k, a); })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
    window.ym(METRIKA_ID, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: true });
  }
  var banner = document.getElementById('cookie');
  function showBanner() { if (banner) banner.hidden = false; }
  if (banner) {
    banner.querySelectorAll('[data-cookie]').forEach(function (b) {
      b.addEventListener('click', function () {
        var yes = b.dataset.cookie === 'yes';
        var was = getConsent();
        setConsent(yes ? 'yes' : 'no');
        banner.hidden = true;
        if (yes) loadMetrika();
        else if (was === 'yes') location.reload(); // отзыв согласия: выгрузить уже запущенную Метрику
      });
    });
  }
  document.querySelectorAll('[data-cookie-settings]').forEach(function (b) { b.addEventListener('click', showBanner); });
  var consent = getConsent();
  if (consent === 'yes') loadMetrika();
  else if ((METRIKA_ID && consent !== 'no') || location.hash === '#cookie-test') showBanner();

  function reachGoal(name) {
    if (METRIKA_ID && typeof window.ym === 'function') window.ym(METRIKA_ID, 'reachGoal', name);
  }
  document.querySelectorAll('[data-goal]').forEach(function (a) {
    a.addEventListener('click', function () { reachGoal('tg_click'); reachGoal(a.dataset.goal); });
  });
})();
