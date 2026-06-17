var CyclePage = (function() {
  var activeTab = 'fleets';
  var selectedRuleId = null;

  function getFleetStatusLabel(status) {
    switch (status) {
      case 'active': return '运行中';
      case 'maintenance': return '维护中';
      case 'inactive': return '已停用';
      default: return status;
    }
  }

  function getFleetStatusType(status) {
    switch (status) {
      case 'active': return 'success';
      case 'maintenance': return 'warning';
      case 'inactive': return 'default';
      default: return 'default';
    }
  }

  function getWeekDayName(day) {
    var days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[day] || '';
  }

  function renderFleetCard(fleet) {
    var card = document.createElement('div');
    card.className = 'resource-card';

    var header = document.createElement('div');
    header.className = 'resource-header';

    var icon = document.createElement('div');
    icon.className = 'resource-icon';
    icon.textContent = '🚁';
    header.appendChild(icon);

    var info = document.createElement('div');
    info.className = 'resource-info';

    var name = document.createElement('div');
    name.className = 'resource-name';
    name.textContent = fleet.name;
    info.appendChild(name);

    var meta = document.createElement('div');
    meta.className = 'resource-meta';
    meta.innerHTML = '<span>' + fleet.type + '</span><span>' + fleet.baseLocation + '</span>';
    info.appendChild(meta);

    header.appendChild(info);

    var statusTag = Tag.create(getFleetStatusLabel(fleet.status), getFleetStatusType(fleet.status));
    header.appendChild(statusTag);

    card.appendChild(header);

    var stats = document.createElement('div');
    stats.className = 'resource-stats';

    var stat1 = document.createElement('div');
    stat1.className = 'resource-stat';
    stat1.innerHTML = '<div class="resource-stat-value">' + fleet.droneCount + '</div>' +
      '<div class="resource-stat-label">无人机数</div>';
    stats.appendChild(stat1);

    var stat2 = document.createElement('div');
    stat2.className = 'resource-stat';
    stat2.innerHTML = '<div class="resource-stat-value">' + fleet.technicianCount + '</div>' +
      '<div class="resource-stat-label">技术人员</div>';
    stats.appendChild(stat2);

    var stat3 = document.createElement('div');
    stat3.className = 'resource-stat';
    stat3.innerHTML = '<div class="resource-stat-value">' + (fleet.captain || '-') + '</div>' +
      '<div class="resource-stat-label">队长</div>';
    stats.appendChild(stat3);

    card.appendChild(stats);

    card.onclick = function() {
      showFleetDetail(fleet);
    };

    return card;
  }

  function showFleetDetail(fleet) {
    var content = document.createElement('div');

    var typeRow = document.createElement('div');
    typeRow.className = 'detail-row';
    typeRow.innerHTML = '<div class="detail-label">类型</div><div class="detail-value">' +
      fleet.type + '</div>';
    content.appendChild(typeRow);

    var statusRow = document.createElement('div');
    statusRow.className = 'detail-row';
    statusRow.innerHTML = '<div class="detail-label">状态</div><div class="detail-value"></div>';
    statusRow.querySelector('.detail-value').appendChild(
      Tag.create(getFleetStatusLabel(fleet.status), getFleetStatusType(fleet.status))
    );
    content.appendChild(statusRow);

    var countRow = document.createElement('div');
    countRow.className = 'detail-row';
    countRow.innerHTML = '<div class="detail-label">无人机数</div><div class="detail-value">' +
      fleet.droneCount + ' 架</div>';
    content.appendChild(countRow);

    var techRow = document.createElement('div');
    techRow.className = 'detail-row';
    techRow.innerHTML = '<div class="detail-label">技术人员</div><div class="detail-value">' +
      fleet.technicianCount + ' 人</div>';
    content.appendChild(techRow);

    var captainRow = document.createElement('div');
    captainRow.className = 'detail-row';
    captainRow.innerHTML = '<div class="detail-label">队长</div><div class="detail-value">' +
      fleet.captain + '</div>';
    content.appendChild(captainRow);

    var locationRow = document.createElement('div');
    locationRow.className = 'detail-row';
    locationRow.innerHTML = '<div class="detail-label">基地</div><div class="detail-value">' +
      fleet.baseLocation + '</div>';
    content.appendChild(locationRow);

    var descRow = document.createElement('div');
    descRow.className = 'detail-row';
    descRow.innerHTML = '<div class="detail-label">描述</div><div class="detail-value">' +
      fleet.description + '</div>';
    content.appendChild(descRow);

    Modal.show({
      title: fleet.name,
      content: content,
      confirmText: '关闭',
      showCancel: false
    });
  }

  function renderRuleCard(rule) {
    var card = document.createElement('div');
    card.className = 'rule-card';

    var header = document.createElement('div');
    header.className = 'rule-header';

    var headerLeft = document.createElement('div');
    headerLeft.style.flex = '1';

    var title = document.createElement('div');
    title.className = 'rule-title';
    title.textContent = rule.name;
    headerLeft.appendChild(title);

    var desc = document.createElement('div');
    desc.className = 'rule-desc';
    desc.textContent = rule.fleetName + ' · ' + rule.location;
    headerLeft.appendChild(desc);

    header.appendChild(headerLeft);

    var statusTag = Tag.create(rule.status === 'active' ? '启用中' : '已停用',
      rule.status === 'active' ? 'success' : 'default');
    header.appendChild(statusTag);

    card.appendChild(header);

    var scheduleTags = document.createElement('div');
    scheduleTags.className = 'rule-schedule';

    rule.weekDays.forEach(function(wd) {
      var tag = document.createElement('span');
      tag.className = 'rule-time-tag';
      tag.textContent = getWeekDayName(wd.day) + ' ' + wd.startTime + '-' + wd.endTime;
      scheduleTags.appendChild(tag);
    });

    card.appendChild(scheduleTags);

    var footer = document.createElement('div');
    footer.className = 'rule-footer';

    var weekCount = document.createElement('div');
    weekCount.className = 'text-secondary';
    weekCount.style.fontSize = 'var(--font-size-sm)';
    weekCount.textContent = '每周 ' + rule.weekDays.length + ' 次训练';
    footer.appendChild(weekCount);

    var switchEl = document.createElement('div');
    switchEl.className = 'switch' + (rule.status === 'active' ? ' active' : '');
    switchEl.innerHTML = '<div class="switch-handle"></div>';
    switchEl.onclick = function(e) {
      e.stopPropagation();
      toggleRuleStatus(rule.id);
    };
    footer.appendChild(switchEl);

    card.appendChild(footer);

    card.onclick = function() {
      showRuleDetail(rule);
    };

    return card;
  }

  function toggleRuleStatus(ruleId) {
    var rule = Store.getCycleRuleById(ruleId);
    if (!rule) return;

    var newStatus = rule.status === 'active' ? 'inactive' : 'active';
    Store.updateCycleRule(ruleId, { status: newStatus });

    CommonUtils.showToast(rule.name + ' 已' + (newStatus === 'active' ? '启用' : '停用'));
    renderRuleList();
  }

  function showRuleDetail(rule) {
    var content = document.createElement('div');

    var fleetRow = document.createElement('div');
    fleetRow.className = 'detail-row';
    fleetRow.innerHTML = '<div class="detail-label">机阵</div><div class="detail-value">' +
      rule.fleetName + '</div>';
    content.appendChild(fleetRow);

    var locationRow = document.createElement('div');
    locationRow.className = 'detail-row';
    locationRow.innerHTML = '<div class="detail-label">地点</div><div class="detail-value">' +
      rule.location + '</div>';
    content.appendChild(locationRow);

    var statusRow = document.createElement('div');
    statusRow.className = 'detail-row';
    statusRow.innerHTML = '<div class="detail-label">状态</div><div class="detail-value"></div>';
    statusRow.querySelector('.detail-value').appendChild(
      Tag.create(rule.status === 'active' ? '启用中' : '已停用',
        rule.status === 'active' ? 'success' : 'default')
    );
    content.appendChild(statusRow);

    var descRow = document.createElement('div');
    descRow.className = 'detail-row';
    descRow.innerHTML = '<div class="detail-label">说明</div><div class="detail-value">' +
      rule.description + '</div>';
    content.appendChild(descRow);

    var divider = document.createElement('div');
    divider.className = 'divider';
    content.appendChild(divider);

    var scheduleTitle = document.createElement('div');
    scheduleTitle.style.fontWeight = 'var(--font-weight-medium)';
    scheduleTitle.style.marginBottom = 'var(--spacing-sm)';
    scheduleTitle.textContent = '训练时段';
    content.appendChild(scheduleTitle);

    rule.weekDays.forEach(function(wd) {
      var item = document.createElement('div');
      item.className = 'flex-between';
      item.style.padding = 'var(--spacing-sm) 0';
      item.innerHTML = '<span class="text-secondary">' + getWeekDayName(wd.day) + '</span>' +
        '<span>' + wd.startTime + ' - ' + wd.endTime + '</span>';
      content.appendChild(item);
    });

    Modal.show({
      title: rule.name,
      content: content,
      confirmText: '批量生成',
      cancelText: '关闭',
      onConfirm: function() {
        showGenerateModal(rule);
        return false;
      }
    });
  }

  function showGenerateModal(rule) {
    var content = document.createElement('div');

    var formItem1 = document.createElement('div');
    formItem1.className = 'form-item';
    formItem1.innerHTML = '<label class="form-label">开始日期</label>' +
      '<input type="date" class="form-input" id="gen-start-date" value="' +
      DateUtils.formatDate(new Date(), 'YYYY-MM-DD') + '">';
    content.appendChild(formItem1);

    var formItem2 = document.createElement('div');
    formItem2.className = 'form-item';
    formItem2.innerHTML = '<label class="form-label">结束日期</label>' +
      '<input type="date" class="form-input" id="gen-end-date" value="' +
      DateUtils.formatDate(DateUtils.addDays(new Date(), 30), 'YYYY-MM-DD') + '">';
    content.appendChild(formItem2);

    var previewArea = document.createElement('div');
    previewArea.id = 'gen-preview-area';
    content.appendChild(previewArea);

    function updatePreview() {
      var startDate = document.getElementById('gen-start-date').value;
      var endDate = document.getElementById('gen-end-date').value;

      if (!startDate || !endDate) return;

      var occupancies = Store.generateCycleOccupancies(rule.id, startDate, endDate);
      var preview = document.getElementById('gen-preview-area');

      if (occupancies.length === 0) {
        preview.innerHTML = '<div class="empty" style="padding: var(--spacing-lg) 0">' +
          '<div class="empty-icon" style="font-size: 32px">📅</div>' +
          '<div class="empty-text">该时间段内没有排期</div></div>';
        return;
      }

      var previewHtml = '<div class="generate-preview">' +
        '<div class="generate-preview-title">📊 预生成 ' + occupancies.length + ' 条排期</div>' +
        '<div class="generate-preview-list">';

      occupancies.slice(0, 5).forEach(function(occ) {
        previewHtml += '<div class="generate-preview-item">' +
          '<span>' + DateUtils.formatDate(occ.startTime, 'MM-DD ww') + '</span>' +
          '<span class="text-secondary">' + DateUtils.formatDate(occ.startTime, 'HH:mm') +
          ' - ' + DateUtils.formatDate(occ.endTime, 'HH:mm') + '</span>' +
          '</div>';
      });

      if (occupancies.length > 5) {
        previewHtml += '<div class="generate-preview-item" style="justify-content: center; color: var(--color-text-tertiary)">' +
          '... 还有 ' + (occupancies.length - 5) + ' 条</div>';
      }

      previewHtml += '</div></div>';
      preview.innerHTML = previewHtml;
    }

    var modal = Modal.show({
      title: '批量生成排期',
      content: content,
      confirmText: '确认生成',
      cancelText: '取消',
      onConfirm: function() {
        var startDate = document.getElementById('gen-start-date').value;
        var endDate = document.getElementById('gen-end-date').value;

        if (!startDate || !endDate) {
          CommonUtils.showToast('请选择日期范围');
          return false;
        }

        var occupancies = Store.generateCycleOccupancies(rule.id, startDate, endDate);

        occupancies.forEach(function(occ) {
          Store.addSchedule(occ);
        });

        CommonUtils.showToast('成功生成 ' + occupancies.length + ' 条排期');
        return true;
      }
    });

    setTimeout(function() {
      updatePreview();
      var startInput = document.getElementById('gen-start-date');
      var endInput = document.getElementById('gen-end-date');
      if (startInput) startInput.onchange = updatePreview;
      if (endInput) endInput.onchange = updatePreview;
    }, 100);
  }

  function renderFleetList() {
    var listEl = document.getElementById('cycle-content');
    if (!listEl) return;

    listEl.innerHTML = '';

    var fleets = Store.getState().droneFleets;

    if (fleets.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'empty';
      empty.innerHTML = '<div class="empty-icon">🚁</div><div class="empty-text">暂无机阵资源</div>';
      listEl.appendChild(empty);
      return;
    }

    fleets.forEach(function(fleet) {
      var card = renderFleetCard(fleet);
      listEl.appendChild(card);
    });
  }

  function renderRuleList() {
    var listEl = document.getElementById('cycle-content');
    if (!listEl) return;

    listEl.innerHTML = '';

    var rules = Store.getState().cycleRules;

    if (rules.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'empty';
      empty.innerHTML = '<div class="empty-icon">📋</div><div class="empty-text">暂无周期规则</div>';
      listEl.appendChild(empty);
      return;
    }

    rules.forEach(function(rule) {
      var card = renderRuleCard(rule);
      listEl.appendChild(card);
    });
  }

  function render(container) {
    activeTab = 'fleets';

    var page = document.createElement('div');
    page.className = 'page-container';

    var pageHeader = document.createElement('div');
    pageHeader.className = 'page-header';
    pageHeader.innerHTML = '<div class="page-title">周期生成</div>' +
      '<div class="page-subtitle">管理机阵资源和周期排练规则</div>';
    page.appendChild(pageHeader);

    var quickActions = document.createElement('div');
    quickActions.className = 'quick-actions';
    quickActions.innerHTML =
      '<div class="quick-action" id="action-fleet">' +
      '<div class="quick-action-icon">🚁</div>' +
      '<div class="quick-action-label">机阵管理</div>' +
      '</div>' +
      '<div class="quick-action" id="action-rule">' +
      '<div class="quick-action-icon">📅</div>' +
      '<div class="quick-action-label">周期规则</div>' +
      '</div>' +
      '<div class="quick-action" id="action-generate">' +
      '<div class="quick-action-icon">⚡</div>' +
      '<div class="quick-action-label">批量生成</div>' +
      '</div>' +
      '<div class="quick-action" id="action-stats">' +
      '<div class="quick-action-icon">📊</div>' +
      '<div class="quick-action-label">占用统计</div>' +
      '</div>';
    page.appendChild(quickActions);

    var segmented = document.createElement('div');
    segmented.className = 'segmented';
    segmented.innerHTML =
      '<div class="segmented-item active" data-tab="fleets">机阵资源</div>' +
      '<div class="segmented-item" data-tab="rules">周期规则</div>';
    page.appendChild(segmented);

    var content = document.createElement('div');
    content.id = 'cycle-content';
    page.appendChild(content);

    container.appendChild(page);

    var items = segmented.querySelectorAll('.segmented-item');
    items.forEach(function(item) {
      item.onclick = function() {
        items.forEach(function(i) { i.classList.remove('active'); });
        item.classList.add('active');
        activeTab = item.dataset.tab;
        if (activeTab === 'fleets') {
          renderFleetList();
        } else {
          renderRuleList();
        }
      };
    });

    document.getElementById('action-fleet').onclick = function() {
      activeTab = 'fleets';
      items.forEach(function(i) { i.classList.remove('active'); });
      items[0].classList.add('active');
      renderFleetList();
    };

    document.getElementById('action-rule').onclick = function() {
      activeTab = 'rules';
      items.forEach(function(i) { i.classList.remove('active'); });
      items[1].classList.add('active');
      renderRuleList();
    };

    document.getElementById('action-generate').onclick = function() {
      var rules = Store.getState().cycleRules.filter(function(r) { return r.status === 'active'; });
      if (rules.length > 0) {
        showGenerateModal(rules[0]);
      } else {
        CommonUtils.showToast('暂无启用的周期规则');
      }
    };

    document.getElementById('action-stats').onclick = function() {
      CommonUtils.showToast('占用统计功能开发中');
    };

    renderFleetList();
  }

  function init() {
    Router.register('cycle', render);
  }

  return {
    render: render,
    init: init
  };
})();
