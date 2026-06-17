(function() {
  function init() {
    console.log('[App] 无人机表演排期系统启动中...');

    Store.init(MockData.getAll());

    SchedulePage.init();
    CyclePage.init();
    ApprovalPage.init();
    FilingPage.init();

    renderNavBar('schedule');

    TabBar.render({
      activeKey: 'schedule',
      onChange: function(key) {
        renderNavBar(key);
      }
    });

    Router.navigate('schedule');

    console.log('[App] 系统初始化完成');
  }

  function renderNavBar(key) {
    var titles = {
      schedule: '表演排期',
      cycle: '周期生成',
      approval: '分支审批',
      filing: '报批登记'
    };
    NavBar.render({
      title: titles[key] || '',
      rightText: '⟲',
      rightAction: function() {
        Modal.confirm(
          '将清除所有本地修改，恢复为初始演示数据。确定要继续吗？',
          function() {
            Store.resetToDefault(MockData.getAll());
            CommonUtils.showToast('已重置为演示数据');
            Router.navigate(key);
            return true;
          }
        );
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
