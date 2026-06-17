var Router = (function() {
  var routes = {};
  var currentRoute = null;
  var historyStack = [];
  var containerId = 'main-content';

  function register(path, handler) {
    routes[path] = handler;
  }

  function navigate(path, params) {
    if (currentRoute !== path) {
      historyStack.push({ path: currentRoute, params: null });
    }
    currentRoute = path;
    render(path, params);
    Store.setState({ currentPage: path });
  }

  function goBack() {
    if (historyStack.length > 0) {
      var prev = historyStack.pop();
      if (prev.path) {
        currentRoute = prev.path;
        render(currentRoute, prev.params);
        Store.setState({ currentPage: currentRoute });
      }
    }
  }

  function render(path, params) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var handler = routes[path];
    if (handler && typeof handler === 'function') {
      try {
        container.innerHTML = '';
        handler(container, params);
      } catch (e) {
        console.error('[Router] Render error:', e);
        container.innerHTML = '<div class="empty"><div class="empty-icon">⚠️</div><div class="empty-text">页面加载失败</div></div>';
      }
    } else {
      container.innerHTML = '<div class="empty"><div class="empty-icon">📄</div><div class="empty-text">页面不存在</div></div>';
    }
  }

  function getCurrentRoute() {
    return currentRoute;
  }

  function init(options) {
    if (options && options.containerId) {
      containerId = options.containerId;
    }
  }

  return {
    register: register,
    navigate: navigate,
    goBack: goBack,
    getCurrentRoute: getCurrentRoute,
    init: init,
    render: render
  };
})();
