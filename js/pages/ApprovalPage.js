var ApprovalPage = (function() {
  var activeTab = 'pending';
  var currentView = 'list';

  function getStatusLabel(status) {
    switch (status) {
      case 'pending': return '审批中';
      case 'approved': return '已通过';
      case 'rejected': return '已拒绝';
      case 'draft': return '草稿';
      case 'cancelled': return '已取消';
      default: return status;
    }
  }

  function getStatusType(status) {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'draft': return 'default';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  }

  function getScaleLabel(scale) {
    switch (scale) {
      case 'small': return '小型';
      case 'medium': return '中型';
      case 'large': return '大型';
      default: return scale;
    }
  }

  function getProgressPercent(approval) {
    if (approval.totalSteps === 0) return 0;
    return Math.round((approval.currentStep / approval.totalSteps) * 100);
  }

  function renderApprovalItem(approval) {
    var item = document.createElement('div');
    item.className = 'approval-item';

    var header = document.createElement('div');
    header.className = 'approval-header';

    var title = document.createElement('div');
    title.className = 'approval-title';
    title.textContent = approval.title;
    header.appendChild(title);

    var statusTag = Tag.create(getStatusLabel(approval.status), getStatusType(approval.status));
    statusTag.className += ' approval-status';
    header.appendChild(statusTag);

    item.appendChild(header);

    var meta = document.createElement('div');
    meta.className = 'approval-meta';

    var scaleItem = document.createElement('div');
    scaleItem.className = 'approval-meta-item';
    scaleItem.innerHTML = '<span>📏</span><span>' + getScaleLabel(approval.scale) + '表演</span>';
    meta.appendChild(scaleItem);

    var locationItem = document.createElement('div');
    locationItem.className = 'approval-meta-item';
    locationItem.innerHTML = '<span>📍</span><span>' + approval.location + '</span>';
    meta.appendChild(locationItem);

    var submitterItem = document.createElement('div');
    submitterItem.className = 'approval-meta-item';
    submitterItem.innerHTML = '<span>👤</span><span>' + approval.submitter + '</span>';
    meta.appendChild(submitterItem);

    var timeItem = document.createElement('div');
    timeItem.className = 'approval-meta-item';
    if (approval.submitTime) {
      timeItem.innerHTML = '<span>⏰</span><span>' + DateUtils.getRelativeTime(approval.submitTime) + '</span>';
    } else {
      timeItem.innerHTML = '<span>⏰</span><span>未提交</span>';
    }
    meta.appendChild(timeItem);

    item.appendChild(meta);

    var progress = document.createElement('div');
    progress.className = 'approval-progress';

    var progressText = document.createElement('div');
    progressText.className = 'approval-progress-text';
    progressText.innerHTML = '<span>审批进度</span><span>' + approval.currentStep + '/' + approval.totalSteps + '</span>';
    progress.appendChild(progressText);

    var progressBar = document.createElement('div');
    progressBar.className = 'approval-progress-bar';
    var progressFill = document.createElement('div');
    progressFill.className = 'approval-progress-fill';
    progressFill.style.width = getProgressPercent(approval) + '%';
    progressBar.appendChild(progressFill);
    progress.appendChild(progressBar);

    item.appendChild(progress);

    item.onclick = function() {
      showApprovalDetail(approval);
    };

    return item;
  }

  function showApprovalDetail(approval) {
    var routeConfig = Store.getState().routeConfigs.find(function(r) {
      return r.id === approval.routeConfigId;
    });

    var content = document.createElement('div');

    var statusRow = document.createElement('div');
    statusRow.className = 'detail-row';
    statusRow.innerHTML = '<div class="detail-label">状态</div><div class="detail-value"></div>';
    statusRow.querySelector('.detail-value').appendChild(
      Tag.create(getStatusLabel(approval.status), getStatusType(approval.status))
    );
    content.appendChild(statusRow);

    var scaleRow = document.createElement('div');
    scaleRow.className = 'detail-row';
    scaleRow.innerHTML = '<div class="detail-label">规模</div><div class="detail-value">' +
      getScaleLabel(approval.scale) + ' (' + approval.scale + ')</div>';
    content.appendChild(scaleRow);

    var locationRow = document.createElement('div');
    locationRow.className = 'detail-row';
    locationRow.innerHTML = '<div class="detail-label">地点</div><div class="detail-value">' +
      approval.location + '</div>';
    content.appendChild(locationRow);

    var submitterRow = document.createElement('div');
    submitterRow.className = 'detail-row';
    submitterRow.innerHTML = '<div class="detail-label">提交人</div><div class="detail-value">' +
      approval.submitter + '</div>';
    content.appendChild(submitterRow);

    if (approval.submitTime) {
      var submitTimeRow = document.createElement('div');
      submitTimeRow.className = 'detail-row';
      submitTimeRow.innerHTML = '<div class="detail-label">提交时间</div><div class="detail-value">' +
        DateUtils.formatDate(approval.submitTime, 'YYYY-MM-DD HH:mm') + '</div>';
      content.appendChild(submitTimeRow);
    }

    if (routeConfig) {
      var routeRow = document.createElement('div');
      routeRow.className = 'detail-row';
      routeRow.innerHTML = '<div class="detail-label">审批流程</div><div class="detail-value">' +
        routeConfig.name + '</div>';
      content.appendChild(routeRow);
    }

    var divider = document.createElement('div');
    divider.className = 'divider';
    content.appendChild(divider);

    var flowTitle = document.createElement('div');
    flowTitle.style.fontWeight = 'var(--font-weight-medium)';
    flowTitle.style.marginBottom = 'var(--spacing-sm)';
    flowTitle.textContent = '审批流程';
    content.appendChild(flowTitle);

    var flowEl = ApprovalFlow.create(approval.steps);
    content.appendChild(flowEl);

    var canApprove = approval.status === 'pending' && approval.currentStep > 0;

    Modal.show({
      title: approval.title,
      content: content,
      confirmText: canApprove ? '审批' : '关闭',
      cancelText: canApprove ? '拒绝' : undefined,
      showCancel: canApprove,
      onConfirm: function() {
        if (canApprove) {
          approveApproval(approval.id);
        }
        return true;
      },
      onCancel: canApprove ? function() {
        rejectApproval(approval.id);
        return true;
      } : undefined
    });
  }

  function approveApproval(id) {
    var approval = Store.getApprovalById(id);
    if (!approval) return;

    var nextStep = approval.currentStep + 1;
    var newStatus = nextStep >= approval.totalSteps ? 'approved' : 'pending';

    var newSteps = approval.steps.map(function(step, index) {
      if (index === approval.currentStep - 1) {
        return Object.assign({}, step, {
          status: 'completed',
          approver: '当前用户',
          time: new Date().toISOString(),
          comment: '同意'
        });
      } else if (index === approval.currentStep) {
        return Object.assign({}, step, {
          status: newStatus === 'approved' ? 'completed' : 'active',
          approver: newStatus === 'approved' ? '自动完成' : null
        });
      }
      return step;
    });

    Store.updateApproval(id, {
      status: newStatus,
      currentStep: newStatus === 'approved' ? approval.totalSteps : nextStep,
      steps: newSteps
    });

    CommonUtils.showToast(newStatus === 'approved' ? '审批已通过' : '已通过，进入下一环节');
    renderApprovalList();
  }

  function rejectApproval(id) {
    var approval = Store.getApprovalById(id);
    if (!approval) return;

    var newSteps = approval.steps.map(function(step, index) {
      if (index === approval.currentStep - 1) {
        return Object.assign({}, step, {
          status: 'rejected',
          approver: '当前用户',
          time: new Date().toISOString(),
          comment: '不同意，请重新提交'
        });
      } else if (index >= approval.currentStep) {
        return Object.assign({}, step, { status: 'cancelled' });
      }
      return step;
    });

    Store.updateApproval(id, {
      status: 'rejected',
      steps: newSteps
    });

    CommonUtils.showToast('已拒绝');
    renderApprovalList();
  }

  function renderRouteConfigCard(config) {
    var card = document.createElement('div');
    card.className = 'route-config-card';

    var title = document.createElement('div');
    title.className = 'route-config-title';
    title.textContent = config.name;
    card.appendChild(title);

    var desc = document.createElement('div');
    desc.className = 'text-secondary';
    desc.style.fontSize = 'var(--font-size-sm)';
    desc.style.marginBottom = 'var(--spacing-md)';
    desc.textContent = config.description;
    card.appendChild(desc);

    if (Object.keys(config.conditions).length > 0) {
      var condTitle = document.createElement('div');
      condTitle.style.fontSize = 'var(--font-size-sm)';
      condTitle.style.color = 'var(--color-text-tertiary)';
      condTitle.style.marginBottom = 'var(--spacing-sm)';
      condTitle.textContent = '路由条件';
      card.appendChild(condTitle);

      for (var key in config.conditions) {
        if (config.conditions.hasOwnProperty(key)) {
          var cond = document.createElement('div');
          cond.className = 'route-condition';
          cond.innerHTML =
            '<div class="route-condition-label">' + getConditionLabel(key) + '</div>' +
            '<div class="route-condition-value">' + getConditionValue(key, config.conditions[key]) + '</div>' +
            '<div class="route-condition-arrow">›</div>';
          card.appendChild(cond);
        }
      }
    }

    var branches = document.createElement('div');
    branches.className = 'route-branches';

    config.steps.forEach(function(step, index) {
      var branch = document.createElement('div');
      branch.className = 'route-branch';

      var dot = document.createElement('div');
      dot.className = 'route-branch-dot';
      dot.textContent = index + 1;
      branch.appendChild(dot);

      var content = document.createElement('div');
      content.className = 'route-branch-content';

      var name = document.createElement('div');
      name.className = 'route-branch-title';
      name.textContent = step.name;
      content.appendChild(name);

      var role = document.createElement('div');
      role.className = 'route-branch-desc';
      role.textContent = '角色: ' + getRoleLabel(step.role);
      content.appendChild(role);

      branch.appendChild(content);
      branches.appendChild(branch);
    });

    card.appendChild(branches);

    card.onclick = function() {
      showRouteConfigDetail(config);
    };

    return card;
  }

  function getConditionLabel(key) {
    switch (key) {
      case 'scale': return '表演规模';
      case 'isSpecial': return '特殊场地';
      case 'location': return '场地类型';
      default: return key;
    }
  }

  function getConditionValue(key, value) {
    if (key === 'scale') {
      return getScaleLabel(value);
    }
    if (typeof value === 'boolean') {
      return value ? '是' : '否';
    }
    return value;
  }

  function getRoleLabel(role) {
    switch (role) {
      case 'project_manager': return '项目主管';
      case 'operation_director': return '运营总监';
      case 'general_manager': return '总经理';
      case 'civil_aviation': return '民航局';
      default: return role;
    }
  }

  function showRouteConfigDetail(config) {
    var content = document.createElement('div');

    var descRow = document.createElement('div');
    descRow.className = 'detail-row';
    descRow.innerHTML = '<div class="detail-label">说明</div><div class="detail-value">' +
      config.description + '</div>';
    content.appendChild(descRow);

    if (config.isDefault) {
      var defaultRow = document.createElement('div');
      defaultRow.className = 'detail-row';
      defaultRow.innerHTML = '<div class="detail-label">类型</div><div class="detail-value">默认流程</div>';
      content.appendChild(defaultRow);
    }

    var divider = document.createElement('div');
    divider.className = 'divider';
    content.appendChild(divider);

    var stepsTitle = document.createElement('div');
    stepsTitle.style.fontWeight = 'var(--font-weight-medium)';
    stepsTitle.style.marginBottom = 'var(--spacing-sm)';
    stepsTitle.textContent = '审批环节（共 ' + config.steps.length + ' 步）';
    content.appendChild(stepsTitle);

    config.steps.forEach(function(step, index) {
      var stepEl = document.createElement('div');
      stepEl.className = 'flex-between';
      stepEl.style.padding = 'var(--spacing-sm) 0';
      stepEl.innerHTML =
        '<span>' + (index + 1) + '. ' + step.name + '</span>' +
        '<span class="text-secondary">' + getRoleLabel(step.role) + '</span>';
      content.appendChild(stepEl);
    });

    Modal.show({
      title: config.name,
      content: content,
      confirmText: '关闭',
      showCancel: false
    });
  }

  function renderApprovalList() {
    var listEl = document.getElementById('approval-content');
    if (!listEl) return;

    listEl.innerHTML = '';

    var approvals = Store.getState().approvals;
    var filtered = approvals;

    if (activeTab !== 'all') {
      filtered = approvals.filter(function(a) {
        if (activeTab === 'pending') {
          return a.status === 'pending' || a.status === 'draft';
        }
        return a.status === activeTab;
      });
    }

    if (filtered.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'empty';
      empty.innerHTML = '<div class="empty-icon">📋</div><div class="empty-text">暂无审批记录</div>';
      listEl.appendChild(empty);
      return;
    }

    filtered.forEach(function(approval) {
      var item = renderApprovalItem(approval);
      listEl.appendChild(item);
    });
  }

  function renderRouteList() {
    var listEl = document.getElementById('approval-content');
    if (!listEl) return;

    listEl.innerHTML = '';

    var configs = Store.getState().routeConfigs;

    if (configs.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'empty';
      empty.innerHTML = '<div class="empty-icon">🔀</div><div class="empty-text">暂无路由配置</div>';
      listEl.appendChild(empty);
      return;
    }

    configs.forEach(function(config) {
      var card = renderRouteConfigCard(config);
      listEl.appendChild(card);
    });
  }

  function render(container) {
    activeTab = 'pending';
    currentView = 'list';

    var page = document.createElement('div');
    page.className = 'page-container';

    var pageHeader = document.createElement('div');
    pageHeader.className = 'page-header';
    pageHeader.innerHTML = '<div class="page-title">分支审批</div>' +
      '<div class="page-subtitle">表演报批流程与条件路由配置</div>';
    page.appendChild(pageHeader);

    var statsGrid = document.createElement('div');
    statsGrid.className = 'grid-4';
    statsGrid.style.marginBottom = 'var(--spacing-lg)';

    var stats = [
      { value: Store.getState().approvals.filter(function(a) { return a.status === 'pending'; }).length, label: '待审批', type: 'warning' },
      { value: Store.getState().approvals.filter(function(a) { return a.status === 'approved'; }).length, label: '已通过', type: 'success' },
      { value: Store.getState().approvals.filter(function(a) { return a.status === 'rejected'; }).length, label: '已拒绝', type: 'error' },
      { value: Store.getState().routeConfigs.length, label: '路由配置', type: 'primary' }
    ];

    stats.forEach(function(stat) {
      var card = document.createElement('div');
      card.className = 'stat-card';
      card.innerHTML =
        '<div class="stat-value ' + stat.type + '">' + stat.value + '</div>' +
        '<div class="stat-label">' + stat.label + '</div>';
      statsGrid.appendChild(card);
    });

    page.appendChild(statsGrid);

    var segmented = document.createElement('div');
    segmented.className = 'segmented';
    segmented.innerHTML =
      '<div class="segmented-item active" data-view="list">审批列表</div>' +
      '<div class="segmented-item" data-view="routes">条件路由</div>';
    page.appendChild(segmented);

    var filterTabs = document.createElement('div');
    filterTabs.className = 'filter-tabs';
    filterTabs.id = 'approval-filter-tabs';

    var filters = [
      { key: 'all', label: '全部' },
      { key: 'pending', label: '待审批' },
      { key: 'approved', label: '已通过' },
      { key: 'rejected', label: '已拒绝' }
    ];

    filters.forEach(function(f) {
      var tab = document.createElement('div');
      tab.className = 'filter-tab' + (activeTab === f.key ? ' active' : '');
      tab.dataset.key = f.key;
      tab.textContent = f.label;
      tab.onclick = function() {
        activeTab = f.key;
        filterTabs.querySelectorAll('.filter-tab').forEach(function(t) {
          t.classList.remove('active');
        });
        tab.classList.add('active');
        renderApprovalList();
      };
      filterTabs.appendChild(tab);
    });

    page.appendChild(filterTabs);

    var content = document.createElement('div');
    content.id = 'approval-content';
    page.appendChild(content);

    container.appendChild(page);

    var segItems = segmented.querySelectorAll('.segmented-item');
    segItems.forEach(function(item) {
      item.onclick = function() {
        segItems.forEach(function(i) { i.classList.remove('active'); });
        item.classList.add('active');
        currentView = item.dataset.view;

        var filterTabsEl = document.getElementById('approval-filter-tabs');
        if (currentView === 'routes') {
          filterTabsEl.style.display = 'none';
          renderRouteList();
        } else {
          filterTabsEl.style.display = 'flex';
          renderApprovalList();
        }
      };
    });

    renderApprovalList();
  }

  function init() {
    Router.register('approval', render);
  }

  return {
    render: render,
    init: init
  };
})();
