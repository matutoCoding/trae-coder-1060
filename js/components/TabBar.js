var TabBar = (function() {
  var currentEl = null;
  var tabs = [];
  var activeKey = '';

  var defaultTabs = [
    { key: 'schedule', label: '表演排期', icon: '📅' },
    { key: 'cycle', label: '周期生成', icon: '🔄' },
    { key: 'approval', label: '分支审批', icon: '✅' },
    { key: 'filing', label: '报批登记', icon: '📋' }
  ];

  function render(options) {
    options = options || {};
    tabs = options.tabs || defaultTabs;
    activeKey = options.activeKey || tabs[0].key;

    var tabbar = document.getElementById('tabbar');
    if (!tabbar) return null;

    tabbar.innerHTML = '';

    tabs.forEach(function(tab) {
      var item = document.createElement('div');
      item.className = 'tabbar-item' + (tab.key === activeKey ? ' active' : '');
      item.dataset.key = tab.key;

      var icon = document.createElement('div');
      icon.className = 'tabbar-icon';
      icon.textContent = tab.icon || '';
      item.appendChild(icon);

      var label = document.createElement('div');
      label.className = 'tabbar-label';
      label.textContent = tab.label;
      item.appendChild(label);

      item.onclick = function() {
        setActive(tab.key);
        if (options.onChange) {
          options.onChange(tab.key);
        }
      };

      tabbar.appendChild(item);
    });

    currentEl = tabbar;
    return tabbar;
  }

  function setActive(key) {
    activeKey = key;
    if (currentEl) {
      var items = currentEl.querySelectorAll('.tabbar-item');
      items.forEach(function(item) {
        if (item.dataset.key === key) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }
    Store.setState({ currentPage: key });
    Router.navigate(key);
  }

  function getActive() {
    return activeKey;
  }

  return {
    render: render,
    setActive: setActive,
    getActive: getActive
  };
})();
