(function () {
  'use strict';
  var WA_NUMBER = '62881024677099';
  var sections = Array.from(document.querySelectorAll('main > section[id]'));
  var labels = ['Beranda', 'Menu', 'Ruang', 'Cerita', 'Tentang kami', 'Lokasi', 'Saran'];
  var currentIndex = 0;
  var navbar = document.getElementById('navbar');
  var navMenu = document.getElementById('nav-menu');
  var navToggle = document.getElementById('nav-toggle');
  var mobile = window.matchMedia('(max-width: 1020px)');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.documentElement.classList.add('js');

  function closeNav(restoreFocus) {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Buka menu');
    document.body.classList.remove('nav-open');
    if (restoreFocus) navToggle.focus();
  }
  navToggle.addEventListener('click', function () {
    if (navMenu.classList.contains('open')) return closeNav(false);
    navMenu.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Tutup menu');
    document.body.classList.add('nav-open');
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && navMenu.classList.contains('open')) closeNav(true);
  });
  document.addEventListener('click', function (event) {
    if (!navbar.contains(event.target)) closeNav(false);
  });
  document.addEventListener('focusin', function (event) {
    if (!navbar.contains(event.target)) closeNav(false);
  });
  mobile.addEventListener('change', function () { closeNav(false); });

  var tabs = Array.from(document.querySelectorAll('.menu-tab'));
  function selectTab(selected, focus) {
    tabs.forEach(function (tab) {
      var active = tab === selected;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      var panel = document.getElementById('tab-' + tab.dataset.tab);
      panel.hidden = !active;
      panel.classList.toggle('active', active);
    });
    if (focus) selected.focus();
  }
  tabs.forEach(function (tab, index) {
    tab.id = 'menu-tab-' + tab.dataset.tab;
    tab.setAttribute('aria-controls', 'tab-' + tab.dataset.tab);
    var panel = document.getElementById('tab-' + tab.dataset.tab);
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
    tab.addEventListener('click', function () { selectTab(tab, false); });
    tab.addEventListener('keydown', function (event) {
      var next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        selectTab(tabs[next], true);
      }
    });
  });
  selectTab(tabs[0], false);

  var dots = document.getElementById('section-nav-dots');
  var up = document.getElementById('section-nav-up');
  var down = document.getElementById('section-nav-down');
  function navigate(target, record) {
    closeNav(false);
    if (record && window.location.hash !== '#' + target.id) {
      history.pushState(null, '', '#' + target.id);
    }
    target.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
    if (!target.hasAttribute('tabindex')) target.tabIndex = -1;
    target.focus({ preventScroll: true });
  }
  sections.forEach(function (section, index) {
    var dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'section-nav__dot';
    dot.setAttribute('aria-label', labels[index]);
    dot.setAttribute('aria-controls', section.id);
    dot.addEventListener('click', function () { navigate(section, true); });
    dots.appendChild(dot);
  });
  up.addEventListener('click', function () { if (currentIndex > 0) navigate(sections[currentIndex - 1], true); });
  down.addEventListener('click', function () { if (currentIndex < sections.length - 1) navigate(sections[currentIndex + 1], true); });
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (event) {
      var target = document.getElementById(anchor.hash.slice(1));
      if (!target || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      navigate(target, true);
    });
  });
  function trackSection() {
    currentIndex = 0;
    sections.forEach(function (section, index) {
      if (section.getBoundingClientRect().top <= navbar.offsetHeight + 120) currentIndex = index;
    });
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) currentIndex = sections.length - 1;
    up.disabled = currentIndex === 0;
    down.disabled = currentIndex === sections.length - 1;
    Array.from(dots.children).forEach(function (dot, index) {
      dot.classList.toggle('active', index === currentIndex);
      if (index === currentIndex) dot.setAttribute('aria-current', 'location');
      else dot.removeAttribute('aria-current');
    });
    navMenu.querySelectorAll('a').forEach(function (link) {
      if (link.hash === '#' + sections[currentIndex].id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { trackSection(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', trackSection);
  window.addEventListener('hashchange', function () {
    var target = document.getElementById(location.hash.slice(1));
    if (target) navigate(target, false);
  });
  trackSection();

  var form = document.getElementById('story-form');
  var storyText = document.getElementById('story-text');
  var nameInput = document.getElementById('story-name');
  var anonymous = document.getElementById('story-anonim');
  var note = document.getElementById('story-form-note');
  function formNote(message, error) {
    note.textContent = message;
    note.className = 'form-note' + (error ? ' form-note--error' : '');
    storyText.setAttribute('aria-invalid', String(!!error));
  }
  storyText.addEventListener('input', function () {
    document.getElementById('story-char-count').textContent = storyText.value.length;
    formNote('', false);
  });
  anonymous.addEventListener('change', function () { nameInput.disabled = anonymous.checked; });
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var text = storyText.value.trim();
    if (text.length < 20 || text.length > 500) {
      formNote('Tulis cerita sepanjang 20–500 karakter, ya.', true);
      storyText.focus();
      return;
    }
    var name = anonymous.checked ? 'Anonim' : (nameInput.value.trim() || 'Pelanggan Monolithic');
    var message = 'Halo Monolithic Kopi! Saya ingin berbagi cerita untuk website.\n\nNama: ' + name + '\n\nCerita:\n' + text + '\n\nSaya mengizinkan cerita ini ditampilkan di website setelah ditinjau.';
    var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(message);
    formNote('Lanjutkan dengan menekan Kirim di WhatsApp. Tulisanmu tetap ada di sini. Jika WhatsApp belum terbuka, ', false);
    var fallback = document.createElement('a');
    fallback.href = url;
    fallback.target = '_blank';
    fallback.rel = 'noopener noreferrer';
    fallback.textContent = 'buka lewat tautan ini.';
    note.appendChild(fallback);
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  var wall = document.getElementById('stories-wall');
  async function loadStories() {
    wall.setAttribute('aria-busy', 'true');
    wall.textContent = 'Memuat cerita…';
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 10000);
    try {
      var response = await fetch('data/stories.json', { signal: controller.signal });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      var stories = await response.json();
      if (!Array.isArray(stories) || stories.some(function (story) {
        return !story || typeof story.text !== 'string' || !story.text.trim() ||
          (story.name !== undefined && typeof story.name !== 'string') ||
          (story.date !== undefined && typeof story.date !== 'string');
      })) throw new Error('Invalid stories');
      wall.replaceChildren();
      if (!stories.length) wall.textContent = 'Belum ada cerita yang ditampilkan. Kamu bisa berbagi lewat formulir di atas.';
      stories.forEach(function (story) {
        var card = document.createElement('article');
        card.className = 'story-card';
        var text = document.createElement('p');
        text.className = 'story-card__text';
        text.textContent = story.text;
        var meta = document.createElement('div');
        meta.className = 'story-card__meta';
        var name = document.createElement('span');
        name.className = 'story-card__name';
        name.textContent = story.name || 'Anonim';
        var date = document.createElement('span');
        date.className = 'story-card__date';
        date.textContent = story.date || '';
        meta.append(name, date);
        card.append(text, meta);
        wall.appendChild(card);
      });
    } catch (error) {
      wall.textContent = 'Cerita belum bisa dimuat. Periksa koneksimu, lalu ';
      var retry = document.createElement('button');
      retry.type = 'button';
      retry.className = 'retry-link';
      retry.textContent = 'coba lagi';
      retry.addEventListener('click', loadStories);
      wall.appendChild(retry);
    } finally {
      clearTimeout(timeout);
      wall.setAttribute('aria-busy', 'false');
    }
  }
  loadStories();
})();
