var FilingPage = (function() {
  var activeTab = 'all';

  function getStatusLabel(status) {
    switch (status) {
      case 'draft': return '草稿';
      case 'pending': return '审批中';
      case 'reviewing': return '审核中';
      case 'approved': return '已通过';
      case 'rejected': return '已驳回';
      default: return status;
    }
  }

  function getStatusType(status) {
    switch (status) {
      case 'draft': return 'default';
      case 'pending':
      case 'reviewing': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  }

  function renderFilingItem(filing) {
    var item = document.createElement('div');
    item.className = 'filing-item';

    var header = document.createElement('div');
    header.className = 'filing-header';

    var title = document.createElement('div');
    title.className = 'filing-title';
    title.textContent = filing.performanceName;
    header.appendChild(title);

    var statusTag = Tag.create(getStatusLabel(filing.status), getStatusType(filing.status));
    header.appendChild(statusTag);

    item.appendChild(header);

    var location = document.createElement('div');
    location.className = 'filing-location';
    location.innerHTML = '<span>📍</span><span>' + filing.location + '</span>';
    item.appendChild(location);

    var time = document.createElement('div');
    time.className = 'filing-time';
    time.innerHTML = '<span>⏰</span><span>' +
      DateUtils.formatDate(filing.startTime, 'YYYY-MM-DD HH:mm') + ' ~ ' +
      DateUtils.formatDate(filing.endTime, 'HH:mm') + '</span>';
    item.appendChild(time);

    var footer = document.createElement('div');
    footer.className = 'filing-footer';

    var materials = document.createElement('div');
    materials.className = 'filing-materials';
    filing.materials.slice(0, 3).forEach(function(mat) {
      var tag = document.createElement('span');
      tag.className = 'filing-material-tag';
      tag.textContent = mat;
      materials.appendChild(tag);
    });
    if (filing.materials.length > 3) {
      var more = document.createElement('span');
      more.className = 'filing-material-tag';
      more.textContent = '+' + (filing.materials.length - 3);
      materials.appendChild(more);
    }
    footer.appendChild(materials);

    var authority = document.createElement('div');
    authority.className = 'text-secondary';
    authority.style.fontSize = 'var(--font-size-sm)';
    authority.textContent = filing.authority;
    footer.appendChild(authority);

    item.appendChild(footer);

    item.onclick = function() {
      showFilingDetail(filing);
    };

    return item;
  }

  function showFilingDetail(filing) {
    var content = document.createElement('div');

    var statusRow = document.createElement('div');
    statusRow.className = 'detail-row';
    statusRow.innerHTML = '<div class="detail-label">状态</div><div class="detail-value"></div>';
    statusRow.querySelector('.detail-value').appendChild(
      Tag.create(getStatusLabel(filing.status), getStatusType(filing.status))
    );
    content.appendChild(statusRow);

    if (filing.filingNumber) {
      var numRow = document.createElement('div');
      numRow.className = 'detail-row';
      numRow.innerHTML = '<div class="detail-label">报备号</div><div class="detail-value">' +
        filing.filingNumber + '</div>';
      content.appendChild(numRow);
    }

    var perfRow = document.createElement('div');
    perfRow.className = 'detail-row';
    perfRow.innerHTML = '<div class="detail-label">表演名称</div><div class="detail-value">' +
      filing.performanceName + '</div>';
    content.appendChild(perfRow);

    var locRow = document.createElement('div');
    locRow.className = 'detail-row';
    locRow.innerHTML = '<div class="detail-label">空域位置</div><div class="detail-value">' +
      filing.area + '</div>';
    content.appendChild(locRow);

    var altRow = document.createElement('div');
    altRow.className = 'detail-row';
    altRow.innerHTML = '<div class="detail-label">飞行高度</div><div class="detail-value">' +
      filing.altitude + '</div>';
    content.appendChild(altRow);

    var timeRow = document.createElement('div');
    timeRow.className = 'detail-row';
    timeRow.innerHTML = '<div class="detail-label">飞行时间</div><div class="detail-value">' +
      DateUtils.formatDate(filing.startTime, 'YYYY-MM-DD HH:mm') + '<br>' +
      '至 ' + DateUtils.formatDate(filing.endTime, 'YYYY-MM-DD HH:mm') + '</div>';
    content.appendChild(timeRow);

    var authRow = document.createElement('div');
    authRow.className = 'detail-row';
    authRow.innerHTML = '<div class="detail-label">审批单位</div><div class="detail-value">' +
      filing.authority + '</div>';
    content.appendChild(authRow);

    var applicantRow = document.createElement('div');
    applicantRow.className = 'detail-row';
    applicantRow.innerHTML = '<div class="detail-label">申请人</div><div class="detail-value">' +
      filing.applicant + '</div>';
    content.appendChild(applicantRow);

    if (filing.applyTime) {
      var applyRow = document.createElement('div');
      applyRow.className = 'detail-row';
      applyRow.innerHTML = '<div class="detail-label">申请时间</div><div class="detail-value">' +
        DateUtils.formatDate(filing.applyTime, 'YYYY-MM-DD HH:mm') + '</div>';
      content.appendChild(applyRow);
    }

    if (filing.approveTime) {
      var approveRow = document.createElement('div');
      approveRow.className = 'detail-row';
      approveRow.innerHTML = '<div class="detail-label">批复时间</div><div class="detail-value">' +
        DateUtils.formatDate(filing.approveTime, 'YYYY-MM-DD HH:mm') + '</div>';
      content.appendChild(approveRow);
    }

    var divider = document.createElement('div');
    divider.className = 'divider';
    content.appendChild(divider);

    var matTitle = document.createElement('div');
    matTitle.style.fontWeight = 'var(--font-weight-medium)';
    matTitle.style.marginBottom = 'var(--spacing-sm)';
    matTitle.textContent = '报备材料（' + filing.materials.length + ' 份）';
    content.appendChild(matTitle);

    filing.materials.forEach(function(mat, index) {
      var matItem = document.createElement('div');
      matItem.className = 'flex-between';
      matItem.style.padding = 'var(--spacing-sm) 0';
      matItem.innerHTML =
        '<span><span style="color: var(--color-primary); margin-right: 8px">📄</span>' + mat + '</span>' +
        '<span class="text-success" style="font-size: var(--font-size-sm)">已上传</span>';
      content.appendChild(matItem);
    });

    var canSubmit = filing.status === 'draft';
    var canEdit = filing.status === 'draft' || filing.status === 'rejected';

    Modal.show({
      title: filing.title,
      content: content,
      confirmText: canSubmit ? '提交审批' : (canEdit ? '编辑' : '关闭'),
      cancelText: canEdit ? '取消' : undefined,
      showCancel: canEdit && !canSubmit,
      onConfirm: function() {
        if (canSubmit) {
          submitFiling(filing.id);
        }
        return true;
      }
    });
  }

  function submitFiling(id) {
    var filing = Store.getFilingById(id);
    if (!filing) return;

    CommonUtils.showToast('已提交空域审批');
    renderFilingList();
  }

  function renderFilingList() {
    var listEl = document.getElementById('filing-content');
    if (!listEl) return;

    listEl.innerHTML = '';

    var filings = Store.getState().filings;
    var filtered = filings;

    if (activeTab !== 'all') {
      filtered = filings.filter(function(f) {
        return f.status === activeTab;
      });
    }

    if (filtered.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'empty';
      empty.innerHTML = '<div class="empty-icon">📋</div><div class="empty-text">暂无报批记录</div>';
      listEl.appendChild(empty);
      return;
    }

    filtered.forEach(function(filing) {
      var item = renderFilingItem(filing);
      listEl.appendChild(item);
    });
  }

  function render(container) {
    activeTab = 'all';

    var page = document.createElement('div');
    page.className = 'page-container';

    var pageHeader = document.createElement('div');
    pageHeader.className = 'page-header';
    pageHeader.innerHTML = '<div class="page-title">报批登记</div>' +
      '<div class="page-subtitle">空域审批报备与材料管理</div>';
    page.appendChild(pageHeader);

    var quickActions = document.createElement('div');
    quickActions.className = 'quick-actions';
    quickActions.innerHTML =
      '<div class="quick-action" id="filing-action-new">' +
      '<div class="quick-action-icon">📝</div>' +
      '<div class="quick-action-label">新建报备</div>' +
      '</div>' +
      '<div class="quick-action" id="filing-action-materials">' +
      '<div class="quick-action-icon">📁</div>' +
      '<div class="quick-action-label">材料管理</div>' +
      '</div>' +
      '<div class="quick-action" id="filing-action-template">' +
      '<div class="quick-action-icon">📋</div>' +
      '<div class="quick-action-label">模板库</div>' +
      '</div>' +
      '<div class="quick-action" id="filing-action-history">' +
      '<div class="quick-action-icon">📊</div>' +
      '<div class="quick-action-label">报备统计</div>' +
      '</div>';
    page.appendChild(quickActions);

    var statsGrid = document.createElement('div');
    statsGrid.className = 'grid-4';
    statsGrid.style.marginBottom = 'var(--spacing-md)';

    var stats = [
      { value: Store.getState().filings.length, label: '总报备', type: 'primary' },
      { value: Store.getState().filings.filter(function(f) { return f.status === 'pending' || f.status === 'reviewing'; }).length, label: '审批中', type: 'warning' },
      { value: Store.getState().filings.filter(function(f) { return f.status === 'approved'; }).length, label: '已通过', type: 'success' },
      { value: Store.getState().filings.filter(function(f) { return f.status === 'rejected'; }).length, label: '已驳回', type: 'error' }
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

    var filterTabs = document.createElement('div');
    filterTabs.className = 'filter-tabs';

    var filters = [
      { key: 'all', label: '全部' },
      { key: 'pending', label: '审批中' },
      { key: 'approved', label: '已通过' },
      { key: 'draft', label: '草稿' }
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
        renderFilingList();
      };
      filterTabs.appendChild(tab);
    });

    page.appendChild(filterTabs);

    var listTitle = document.createElement('div');
    listTitle.className = 'section-title';
    listTitle.innerHTML = '<span>报批记录</span>' +
      '<span class="section-title-extra" id="filing-new-btn">+ 新建</span>';
    page.appendChild(listTitle);

    var content = document.createElement('div');
    content.id = 'filing-content';
    page.appendChild(content);

    container.appendChild(page);

    document.getElementById('filing-action-new').onclick = function() {
      CommonUtils.showToast('新建报备功能开发中');
    };
    document.getElementById('filing-action-materials').onclick = function() {
      CommonUtils.showToast('材料管理功能开发中');
    };
    document.getElementById('filing-action-template').onclick = function() {
      CommonUtils.showToast('模板库功能开发中');
    };
    document.getElementById('filing-action-history').onclick = function() {
      CommonUtils.showToast('报备统计功能开发中');
    };
    document.getElementById('filing-new-btn').onclick = function() {
      CommonUtils.showToast('新建报备功能开发中');
    };

    renderFilingList();
  }

  function init() {
    Router.register('filing', render);
  }

  return {
    render: render,
    init: init
  };
})();
