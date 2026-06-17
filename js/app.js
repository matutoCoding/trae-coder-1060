(function() {
  function init() {
    console.log('[App] 无人机表演排期系统启动中...');

    Store.init(MockData.getAll());

    SchedulePage.init();
    CyclePage.init();
    ApprovalPage.init();
    FilingPage.init();

    NavBar.render({
      title: '表演排期'
    });

    TabBar.render({
      activeKey: 'schedule',
      onChange: function(key) {
        var titles = {
          schedule: '表演排期',
          cycle: '周期生成',
          approval: '分支审批',
          filing: '报批登记'
        };
        NavBar.render({
          title: titles[key] || ''
        });
      }
    });

    Router.navigate('schedule');

    console.log('[App] 系统初始化完成');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
