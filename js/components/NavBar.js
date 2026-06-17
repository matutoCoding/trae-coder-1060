var NavBar = (function() {
  var currentEl = null;

  function render(options) {
    options = options || {};
    var navbar = document.getElementById('navbar');
    if (!navbar) return null;

    navbar.innerHTML = '';

    if (options.showBack) {
      var leftEl = document.createElement('div');
      leftEl.className = 'navbar-left';
      leftEl.textContent = '‹ 返回';
      leftEl.onclick = function() {
        if (options.onBack) {
          options.onBack();
        } else {
          Router.goBack();
        }
      };
      navbar.appendChild(leftEl);
    }

    var titleEl = document.createElement('div');
    titleEl.className = 'navbar-title';
    titleEl.textContent = options.title || '';
    navbar.appendChild(titleEl);

    if (options.rightText || options.rightAction) {
      var rightEl = document.createElement('div');
      rightEl.className = 'navbar-right';
      rightEl.textContent = options.rightText || '';
      if (options.rightAction) {
        rightEl.onclick = options.rightAction;
      }
      navbar.appendChild(rightEl);
    }

    currentEl = navbar;
    return navbar;
  }

  function setTitle(title) {
    if (currentEl) {
      var titleEl = currentEl.querySelector('.navbar-title');
      if (titleEl) {
        titleEl.textContent = title;
      }
    }
  }

  return {
    render: render,
    setTitle: setTitle
  };
})();
