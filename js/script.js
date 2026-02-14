(function ($) {
  "use strict";

  // init Isotope portfolio filter
  var initIsotope = function () {
    $('.grid').each(function () {
      var $buttonGroup = $('.button-group');
      var $checked = $buttonGroup.find('.is-checked');
      var filterValue = $checked.attr('data-filter');

      var $grid = $('.grid').isotope({
        itemSelector: '.portfolio-item',
        filter: filterValue
      });

      $grid.on('arrangeComplete', function () {
        AOS.refresh();
      });

      $buttonGroup.on('click', 'a', function (e) {
        e.preventDefault();
        filterValue = $(this).attr('data-filter');
        $grid.isotope({ filter: filterValue });
      });

      $buttonGroup.each(function (i, buttonGroup) {
        $(buttonGroup).on('click', 'a', function () {
          $(buttonGroup).find('.is-checked').removeClass('is-checked');
          $(this).addClass('is-checked');
        });
      });
    });
  }

  // Portfolio modal with likes & comments
  var portfolioData = JSON.parse(localStorage.getItem('portfolioData') || '{}');

  function savePortfolioData() {
    localStorage.setItem('portfolioData', JSON.stringify(portfolioData));
  }

  function getItemData(key) {
    if (!portfolioData[key]) portfolioData[key] = { likes: 0, liked: false, comments: [] };
    return portfolioData[key];
  }

  var currentItemKey = '';

  var initPortfolioModal = function () {
    var likeBtn = document.querySelector('.like-btn');
    var commentBtn = document.querySelector('.comment-btn');
    var commentSection = document.querySelector('.comment-section');
    var commentInput = document.querySelector('.comment-input');
    var commentSubmit = document.querySelector('.comment-submit');
    var commentList = document.querySelector('.comment-list');
    var likeCount = document.querySelector('.like-count');

    document.querySelectorAll('.image-link').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var src = this.getAttribute('href');
        currentItemKey = src;
        document.getElementById('modalImage').src = src;
        document.getElementById('modalImage').alt = this.getAttribute('title');
        document.getElementById('modalBg').style.backgroundImage = 'url(' + src + ')';
        document.getElementById('modalTitle').textContent = this.getAttribute('title');
        document.getElementById('modalCategory').textContent = this.getAttribute('data-category') || '';
        document.getElementById('modalDescription').textContent = this.getAttribute('data-description') || '';

        var igUrl = this.getAttribute('data-instagram') || '';
        if (igUrl) {
          commentBtn.onclick = function () { window.open(igUrl, '_blank'); };
          commentBtn.style.display = '';
        } else {
          commentBtn.onclick = null;
          commentBtn.style.display = 'none';
        }

        var data = getItemData(currentItemKey);
        likeCount.textContent = data.likes;
        likeBtn.classList.toggle('btn-primary', data.liked);
        likeBtn.classList.toggle('btn-outline-light', !data.liked);
        commentSection.style.display = 'none';
        renderComments(data.comments);

        new bootstrap.Modal(document.getElementById('portfolioModal')).show();
      });
    });

    likeBtn.addEventListener('click', function () {
      var data = getItemData(currentItemKey);
      if (data.liked) {
        data.likes--;
        data.liked = false;
      } else {
        data.likes++;
        data.liked = true;
      }
      likeCount.textContent = data.likes;
      this.classList.toggle('btn-primary', data.liked);
      this.classList.toggle('btn-outline-light', !data.liked);
      savePortfolioData();
    });

    commentBtn.addEventListener('click', function () {
      commentSection.style.display = commentSection.style.display === 'none' ? 'block' : 'none';
    });

    commentSubmit.addEventListener('click', function () {
      var text = commentInput.value.trim();
      if (!text) return;
      var data = getItemData(currentItemKey);
      data.comments.push({ text: text, date: new Date().toLocaleDateString(), approved: false });
      savePortfolioData();
      renderComments(data.comments);
      commentInput.value = '';

      var msg = document.querySelector('.comment-pending-msg');
      if (msg) msg.remove();
      msg = document.createElement('div');
      msg.className = 'comment-pending-msg text-center py-2';
      var pendingText = currentLang === 'ro'
        ? 'Mulțumim! Comentariul tău a fost trimis spre verificare și va fi publicat după aprobare.'
        : 'Thank you! Your comment has been sent for review and will be published after approval.';
      msg.innerHTML = '<small style="color: #aaffaa;">' + pendingText + '</small>';
      commentSection.appendChild(msg);
      setTimeout(function () { if (msg.parentNode) msg.remove(); }, 5000);
    });

    commentInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') commentSubmit.click();
    });

    function renderComments(comments) {
      commentList.innerHTML = '';
      var approvedComments = comments.filter(function (c) { return c.approved; });
      if (approvedComments.length === 0) {
        commentList.innerHTML = '<p class="text-muted small mb-0">No comments yet.</p>';
        return;
      }
      approvedComments.forEach(function (c) {
        var div = document.createElement('div');
        div.className = 'border-bottom py-2';
        div.innerHTML = '<small class="text-muted">' + c.date + '</small><p class="mb-0">' + c.text.replace(/</g, '&lt;') + '</p>';
        commentList.appendChild(div);
      });
    }
  }

  // Overlay Menu Navigation
  // Add new images here when adding photos to images/backgrounds/
  var menuBackgrounds = [
    'images/backgrounds/back_01.jpg',
    'images/backgrounds/back_02.jpg',
    'images/backgrounds/back_03.jpg',
    'images/backgrounds/back_04.jpg',
    'images/backgrounds/back_05.jpg'
  ];

  var overlayMenu = function () {
    if (!$('.nav-overlay').length) {
      return false;
    }

    var body = document.querySelector('body');
    var menu = document.querySelector('.menu-btn');
    var navOverlay = document.querySelector('.nav-overlay');

    menu.addEventListener('click', function () {
      if (!body.classList.contains('nav-active')) {
        var randomImg = menuBackgrounds[Math.floor(Math.random() * menuBackgrounds.length)];
        navOverlay.style.setProperty('--nav-bg-image', 'url(' + randomImg + ')');
      }
      body.classList.toggle('nav-active');
    });

    document.querySelectorAll('.nav__list-item a').forEach(function (link) {
      link.addEventListener('click', function () {
        body.classList.remove('nav-active');
        document.getElementById('menu-toggle').checked = false;
      });
    });
  }

  // Falling cakes on logo hover
  var initCakeRain = function () {
    var logo = document.querySelector('.main-logo');
    var cakes = ['🎂', '🧁', '🍰', '🍪', '🥐', '🍩', '🎀', '🍓'];
    var interval = null;

    logo.addEventListener('mouseenter', function () {
      interval = setInterval(function () {
        var particle = document.createElement('span');
        particle.className = 'cake-particle';
        particle.textContent = cakes[Math.floor(Math.random() * cakes.length)];
        var rect = logo.getBoundingClientRect();
        particle.style.left = (rect.left + Math.random() * rect.width) + 'px';
        particle.style.top = rect.bottom + 'px';
        particle.style.animationDuration = (2 + Math.random() * 3) + 's';
        document.body.appendChild(particle);
        particle.addEventListener('animationend', function () {
          particle.remove();
        });
      }, 150);
    });

    logo.addEventListener('mouseleave', function () {
      clearInterval(interval);
    });
  }


  // Language switching
  var currentLang = 'en';

  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('.lang-btn').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-lang') === lang);
    });

    document.querySelectorAll('[data-en]').forEach(function (el) {
      var val = el.getAttribute('data-' + lang);
      if (val) el.textContent = val;
    });

    document.querySelectorAll('[data-en-placeholder]').forEach(function (el) {
      var val = el.getAttribute('data-' + lang + '-placeholder');
      if (val) el.placeholder = val;
    });

    document.querySelectorAll('[data-en-title]').forEach(function (el) {
      var val = el.getAttribute('data-' + lang + '-title');
      if (val) el.setAttribute('title', val);
    });

    document.querySelectorAll('[data-en-desc]').forEach(function (el) {
      var val = el.getAttribute('data-' + lang + '-desc');
      if (val) el.setAttribute('data-description', val);
    });

    document.querySelectorAll('[data-en-category]').forEach(function (el) {
      var val = el.getAttribute('data-' + lang + '-category');
      if (val) el.setAttribute('data-category', val);
    });
  }

  var initLanguage = function () {
    var lang = localStorage.getItem('lang') || 'ro';
    setLanguage(lang);

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        setLanguage(this.getAttribute('data-lang'));
      });
    });
  }

  $(document).ready(function () {
    overlayMenu();
    initPortfolioModal();
    initCakeRain();

    initLanguage();

    AOS.init({
      duration: 600,
      once: true
    })
  });

  $(window).on('load', function () {
    initIsotope();
  });

})(jQuery);
