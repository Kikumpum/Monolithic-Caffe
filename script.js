(function () {
  'use strict';

  var WA_NUMBER = '62881024677099';
  var SECTIONS = ['#hero', '#menu', '#experience', '#benchmark', '#cerita', '#owner', '#lokasi', '#saran'];
  var currentIndex = 0;

  // Mobile nav toggle
  var navToggle = document.getElementById('nav-toggle');
  var navMenu = document.getElementById('nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      var isOpen = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.classList.toggle('nav-open', isOpen);
    });

    navMenu.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
      });
    });
  }

  // Menu tabs
  var tabs = document.querySelectorAll('.menu-tab');
  var panels = document.querySelectorAll('.menu-panel');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.dataset.tab;

      tabs.forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });

      panels.forEach(function (panel) {
        panel.classList.remove('active');
      });

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      var panel = document.getElementById('tab-' + target);
      if (panel) {
        panel.classList.add('active');
      }
    });
  });

  function getNavHeight() {
    var navbar = document.getElementById('navbar');
    return navbar ? navbar.offsetHeight : 72;
  }

  function scrollToSection(index) {
    if (index < 0 || index >= SECTIONS.length) return;

    var target = document.querySelector(SECTIONS[index]);
    if (!target) return;

    currentIndex = index;
    var top = target.getBoundingClientRect().top + window.scrollY - getNavHeight();
    window.scrollTo({ top: top, behavior: 'smooth' });
    updateSectionNav();
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;

      var target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      var idx = SECTIONS.indexOf(href);
      if (idx !== -1) currentIndex = idx;
      var top = target.getBoundingClientRect().top + window.scrollY - getNavHeight();
      window.scrollTo({ top: top, behavior: 'smooth' });
      updateSectionNav();
    });
  });

  // Section navigator (sidebar dots + arrows)
  var sectionNav = document.getElementById('section-nav');
  var navUp = document.getElementById('section-nav-up');
  var navDown = document.getElementById('section-nav-down');
  var dotsContainer = document.getElementById('section-nav-dots');
  var sectionLabels = ['Beranda', 'Menu', 'Ruang', 'Referensi', 'Cerita', 'Owner', 'Lokasi', 'Saran & Cerita'];

  function updateSectionNav() {
    if (!navUp || !navDown) return;

    navUp.disabled = currentIndex <= 0;
    navDown.disabled = currentIndex >= SECTIONS.length - 1;

    if (dotsContainer) {
      dotsContainer.querySelectorAll('.section-nav__dot').forEach(function (dot, i) {
        var isActive = i === currentIndex;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }
  }

  function initSectionNav() {
    if (!sectionNav || !dotsContainer || window.innerWidth < 769) return;

    dotsContainer.innerHTML = '';
    SECTIONS.forEach(function (id, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'section-nav__dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', sectionLabels[i] || ('Section ' + (i + 1)));
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.addEventListener('click', function () {
        scrollToSection(i);
      });
      dotsContainer.appendChild(dot);
    });

    if (navUp) {
      navUp.addEventListener('click', function () {
        scrollToSection(currentIndex - 1);
      });
    }

    if (navDown) {
      navDown.addEventListener('click', function () {
        scrollToSection(currentIndex + 1);
      });
    }

    updateSectionNav();
  }

  // Track active section on scroll (throttled)
  var scrollTicking = false;

  function onScrollUpdate() {
    var navHeight = getNavHeight();
    var scrollPos = window.scrollY + navHeight + 120;
    var newIndex = 0;

    SECTIONS.forEach(function (id, i) {
      var el = document.querySelector(id);
      if (el && el.offsetTop <= scrollPos) {
        newIndex = i;
      }
    });

    if (newIndex !== currentIndex) {
      currentIndex = newIndex;
      updateSectionNav();
    }

    scrollTicking = false;
  }

  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(onScrollUpdate);
    }
  }, { passive: true });

  // Navbar shadow on scroll (throttled)
  var navbar = document.getElementById('navbar');
  var navShadowTicking = false;

  if (navbar) {
    window.addEventListener('scroll', function () {
      if (!navShadowTicking) {
        navShadowTicking = true;
        requestAnimationFrame(function () {
          navbar.style.boxShadow = window.scrollY > 20
            ? '0 1px 12px rgba(28, 26, 23, 0.04)'
            : 'none';
          navShadowTicking = false;
        });
      }
    }, { passive: true });
  }

  // Falling leaves — lighter on mobile, off on small screens via CSS
  function initFallingLeaves() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 769) return;

    var container = document.getElementById('falling-leaves');
    if (!container) return;

    var leafCount = window.innerWidth < 1024 ? 8 : 12;
    var colors = ['#6F8F72', '#3F5F46', '#8FA892'];

    for (var i = 0; i < leafCount; i++) {
      var leaf = document.createElement('span');
      leaf.className = 'falling-leaf' + (i % 3 === 0 ? ' falling-leaf--alt' : '');

      var size = 10 + Math.random() * 10;
      var left = Math.random() * 100;
      var duration = 14 + Math.random() * 12;
      var delay = Math.random() * duration;
      var drift = (Math.random() - 0.5) * 100;
      var rotate = 180 + Math.random() * 360;
      var opacity = 0.18 + Math.random() * 0.2;

      leaf.style.setProperty('--leaf-size', size + 'px');
      leaf.style.setProperty('--leaf-left', left + '%');
      leaf.style.setProperty('--leaf-duration', duration + 's');
      leaf.style.setProperty('--leaf-delay', '-' + delay + 's');
      leaf.style.setProperty('--leaf-drift', drift + 'px');
      leaf.style.setProperty('--leaf-rotate', rotate + 'deg');
      leaf.style.setProperty('--leaf-opacity', opacity.toFixed(2));
      leaf.style.setProperty('--leaf-color', colors[i % colors.length]);

      container.appendChild(leaf);
    }
  }

  initSectionNav();
  initFallingLeaves();
  initStoryForm();
  loadStories();
  updateSectionNav();

  // Customer story form → WhatsApp
  function initStoryForm() {
    var form = document.getElementById('story-form');
    var storyText = document.getElementById('story-text');
    var charCount = document.getElementById('story-char-count');
    var formNote = document.getElementById('story-form-note');
    var anonimCheck = document.getElementById('story-anonim');

    if (!form || !storyText) return;

    storyText.addEventListener('input', function () {
      if (charCount) {
        charCount.textContent = storyText.value.length;
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var text = storyText.value.trim();
      var nameInput = document.getElementById('story-name');
      var name = nameInput ? nameInput.value.trim() : '';
      var isAnonim = anonimCheck && anonimCheck.checked;

      if (text.length < 20) {
        showFormNote(formNote, 'Cerita minimal 20 karakter ya.', 'error');
        storyText.focus();
        return;
      }

      var displayName = isAnonim ? 'Anonim' : (name || 'Pelanggan Monolithic');
      var message = 'Halo Monolithic Kopi! Saya ingin berbagi cerita untuk website:\n\n' +
        'Nama: ' + displayName + '\n\n' +
        'Cerita:\n' + text + '\n\n' +
        '_Mohon ditinjau untuk ditampilkan di website._';

      var waUrl = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(message);

      showFormNote(formNote, 'Membuka WhatsApp... kirim pesan untuk menyelesaikan.', 'success');

      window.open(waUrl, '_blank', 'noopener,noreferrer');

      setTimeout(function () {
        showFormNote(formNote, 'Cerita terkirim! Akan tampil di website setelah kami setujui.', 'success');
        form.reset();
        if (charCount) charCount.textContent = '0';
      }, 800);
    });
  }

  function showFormNote(el, msg, type) {
    if (!el) return;
    el.textContent = msg;
    el.className = 'form-note form-note--' + type;
  }

  // Load approved stories from JSON
  function loadStories() {
    var wall = document.getElementById('stories-wall');
    if (!wall) return;

    fetch('data/stories.json')
      .then(function (res) {
        if (!res.ok) throw new Error('Gagal memuat');
        return res.json();
      })
      .then(function (stories) {
        renderStories(wall, stories);
      })
      .catch(function () {
        wall.innerHTML = '<p class="stories-wall__empty">Belum ada cerita ditampilkan. Jadilah yang pertama berbagi!</p>';
      });
  }

  function renderStories(container, stories) {
    if (!stories || !stories.length) {
      container.innerHTML = '<p class="stories-wall__empty">Belum ada cerita ditampilkan. Jadilah yang pertama berbagi!</p>';
      return;
    }

    container.innerHTML = stories.map(function (story) {
      var name = escapeHtml(story.name || 'Anonim');
      var text = escapeHtml(story.text || '');
      var date = escapeHtml(story.date || '');
      return '<article class="story-card">' +
        '<p class="story-card__text">' + text + '</p>' +
        '<div class="story-card__meta">' +
          '<span class="story-card__name">' + name + '</span>' +
          (date ? '<span class="story-card__date">' + date + '</span>' : '') +
        '</div>' +
      '</article>';
    }).join('');
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();
