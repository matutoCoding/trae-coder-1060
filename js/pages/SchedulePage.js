var SchedulePage = (function() {
  var selectedDate = new Date();
  var filterType = 'all';
  var calendarEl = null;

  function getScheduleMap() {
    var schedules = Store.getState().schedules;
    var map = {};
    schedules.forEach(function(s) {
      var dateKey = DateUtils.formatDate(s.startTime, 'YYYY-MM-DD');
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(s);
    });
    return map;
  }

  function getTypeLabel(type) {
    switch (type) {
      case 'performance': return '表演';
      case 'rehearsal': return '排练';
      case 'occupied': return '占用';
      default: return '其他';
    }
  }

  function getTypeTagType(type) {
    switch (type) {
      case 'performance': return 'primary';
      case 'rehearsal': return 'info';
      case 'occupied': return 'warning';
      default: return 'default';
    }
  }

  function getStatusLabel(status) {
    switch (status) {
      case 'confirmed': return '已确认';
      case 'pending': return '待确认';
      case 'approved': return '已审批';
      case 'draft': return '草稿';
      case 'cancelled': return '已取消';
      default: return status;
    }
  }

  function getStatusTagType(status) {
    switch (status) {
      case 'confirmed':
      case 'approved':
        return 'success';
      case 'pending': return 'warning';
      case 'draft': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  }

  function getDuration(start, end) {
    var startDate = new Date(start);
    var endDate = new Date(end);
    var minutes = (endDate - startDate) / (1000 * 60);
    return DateUtils.formatDuration(minutes);
  }

  function renderScheduleItem(schedule) {
    var item = document.createElement('div');
    item.className = 'schedule-item';

    var typeBar = document.createElement('div');
    typeBar.className = 'schedule-type-bar ' + schedule.type;
    item.appendChild(typeBar);

    var timeDiv = document.createElement('div');
    timeDiv.className = 'schedule-time';

    var timeText = document.createElement('div');
    timeText.className = 'schedule-time-text';
    timeText.textContent = DateUtils.formatDate(schedule.startTime, 'HH:mm');
    timeDiv.appendChild(timeText);

    var duration = document.createElement('div');
    duration.className = 'schedule-time-duration';
    duration.textContent = getDuration(schedule.startTime, schedule.endTime);
    timeDiv.appendChild(duration);

    item.appendChild(timeDiv);

    var info = document.createElement('div');
    info.className = 'schedule-info';

    var title = document.createElement('div');
    title.className = 'schedule-title';
    title.textContent = schedule.title;
    info.appendChild(title);

    var desc = document.createElement('div');
    desc.className = 'schedule-desc';

    var typeTag = Tag.create(getTypeLabel(schedule.type), getTypeTagType(schedule.type));
    desc.appendChild(typeTag);

    if (schedule.fleetName) {
      var fleet = document.createElement('span');
      fleet.textContent = '🚁 ' + schedule.fleetName;
      desc.appendChild(fleet);
    }

    if (schedule.location) {
      var loc = document.createElement('span');
      loc.textContent = '📍 ' + schedule.location;
      desc.appendChild(loc);
    }

    info.appendChild(desc);
    item.appendChild(info);

    item.onclick = function() {
      showScheduleDetail(schedule);
    };

    return item;
  }

  function showScheduleDetail(schedule) {
    var content = document.createElement('div');

    var typeRow = document.createElement('div');
    typeRow.className = 'detail-row';
    typeRow.innerHTML = '<div class="detail-label">类型</div><div class="detail-value"></div>';
    typeRow.querySelector('.detail-value').appendChild(
      Tag.create(getTypeLabel(schedule.type), getTypeTagType(schedule.type))
    );
    content.appendChild(typeRow);

    var statusRow = document.createElement('div');
    statusRow.className = 'detail-row';
    statusRow.innerHTML = '<div class="detail-label">状态</div><div class="detail-value"></div>';
    statusRow.querySelector('.detail-value').appendChild(
      Tag.create(getStatusLabel(schedule.status), getStatusTagType(schedule.status))
    );
    content.appendChild(statusRow);

    var timeRow = document.createElement('div');
    timeRow.className = 'detail-row';
    timeRow.innerHTML = '<div class="detail-label">时间</div><div class="detail-value">' +
      DateUtils.formatDate(schedule.startTime, 'YYYY-MM-DD HH:mm') + ' ~ ' +
      DateUtils.formatDate(schedule.endTime, 'HH:mm') + '</div>';
    content.appendChild(timeRow);

    var durationRow = document.createElement('div');
    durationRow.className = 'detail-row';
    durationRow.innerHTML = '<div class="detail-label">时长</div><div class="detail-value">' +
      getDuration(schedule.startTime, schedule.endTime) + '</div>';
    content.appendChild(durationRow);

    if (schedule.fleetName) {
      var fleetRow = document.createElement('div');
      fleetRow.className = 'detail-row';
      fleetRow.innerHTML = '<div class="detail-label">机阵</div><div class="detail-value">' +
        schedule.fleetName + '</div>';
      content.appendChild(fleetRow);
    }

    if (schedule.location) {
      var locRow = document.createElement('div');
      locRow.className = 'detail-row';
      locRow.innerHTML = '<div class="detail-label">地点</div><div class="detail-value">' +
        schedule.location + '</div>';
      content.appendChild(locRow);
    }

    if (schedule.client) {
      var clientRow = document.createElement('div');
      clientRow.className = 'detail-row';
      clientRow.innerHTML = '<div class="detail-label">客户</div><div class="detail-value">' +
        schedule.client + '</div>';
      content.appendChild(clientRow);
    }

    if (schedule.description) {
      var descRow = document.createElement('div');
      descRow.className = 'detail-row';
      descRow.innerHTML = '<div class="detail-label">描述</div><div class="detail-value">' +
        schedule.description + '</div>';
      content.appendChild(descRow);
    }

    if (schedule.isFromCycle) {
      var divider = document.createElement('div');
      divider.className = 'divider';
      content.appendChild(divider);
      var tip = document.createElement('div');
      tip.style.fontSize = 'var(--font-size-sm)';
      tip.style.color = 'var(--color-text-tertiary)';
      tip.textContent = '⚠️ 此排期由周期规则批量生成，编辑后将与规则解除关联';
      content.appendChild(tip);
    }

    Modal.show({
      title: schedule.title,
      content: content,
      confirmText: '编辑',
      cancelText: '删除',
      showCancel: true,
      onConfirm: function() {
        showScheduleEdit(schedule);
        return true;
      },
      onCancel: function() {
        Modal.confirm(
          '确定要删除此排期吗？删除后无法恢复。',
          function() {
            Store.deleteSchedule(schedule.id);
            CommonUtils.showToast('已删除');
            refreshPage();
            return true;
          }
        );
        return false;
      }
    });
  }

  function showScheduleEdit(schedule) {
    var content = document.createElement('div');

    var titleItem = document.createElement('div');
    titleItem.className = 'form-item';
    titleItem.innerHTML =
      '<label class="form-label">排期名称</label>' +
      '<input type="text" class="form-input" id="edit-title" value="' + (schedule.title || '') + '">';
    content.appendChild(titleItem);

    var fleets = Store.getState().droneFleets;
    var fleetOptions = fleets.map(function(f) {
      return '<option value="' + f.id + '"' + (f.id === schedule.fleetId ? ' selected' : '') + '>' + f.name + '</option>';
    }).join('');

    var fleetItem = document.createElement('div');
    fleetItem.className = 'form-item';
    fleetItem.innerHTML =
      '<label class="form-label">机阵</label>' +
      '<select class="form-select" id="edit-fleet">' + fleetOptions + '</select>';
    content.appendChild(fleetItem);

    var startStr = DateUtils.formatDate(schedule.startTime, 'YYYY-MM-DD');
    var startTimeStr = DateUtils.formatDate(schedule.startTime, 'HH:mm');
    var endTimeStr = DateUtils.formatDate(schedule.endTime, 'HH:mm');

    var dateItem = document.createElement('div');
    dateItem.className = 'form-item';
    dateItem.innerHTML =
      '<label class="form-label">日期</label>' +
      '<input type="date" class="form-input" id="edit-date" value="' + startStr + '">';
    content.appendChild(dateItem);

    var startTimeItem = document.createElement('div');
    startTimeItem.className = 'form-item';
    startTimeItem.innerHTML =
      '<label class="form-label">开始时间</label>' +
      '<input type="time" class="form-input" id="edit-start" value="' + startTimeStr + '">';
    content.appendChild(startTimeItem);

    var endTimeItem = document.createElement('div');
    endTimeItem.className = 'form-item';
    endTimeItem.innerHTML =
      '<label class="form-label">结束时间</label>' +
      '<input type="time" class="form-input" id="edit-end" value="' + endTimeStr + '">';
    content.appendChild(endTimeItem);

    var locationItem = document.createElement('div');
    locationItem.className = 'form-item';
    locationItem.innerHTML =
      '<label class="form-label">地点</label>' +
      '<input type="text" class="form-input" id="edit-location" value="' + (schedule.location || '') + '">';
    content.appendChild(locationItem);

    Modal.show({
      title: '编辑排期',
      content: content,
      confirmText: '保存',
      cancelText: '取消',
      showCancel: true,
      onConfirm: function() {
        var titleVal = document.getElementById('edit-title').value.trim();
        var fleetIdVal = document.getElementById('edit-fleet').value;
        var dateVal = document.getElementById('edit-date').value;
        var startVal = document.getElementById('edit-start').value;
        var endVal = document.getElementById('edit-end').value;
        var locationVal = document.getElementById('edit-location').value.trim();

        if (!titleVal) {
          CommonUtils.showToast('请输入排期名称');
          return false;
        }
        if (!dateVal || !startVal || !endVal) {
          CommonUtils.showToast('请选择完整时间');
          return false;
        }

        var fleet = fleets.find(function(f) { return f.id === fleetIdVal; });
        var startParts = startVal.split(':');
        var endParts = endVal.split(':');
        var dateParts = dateVal.split('-');

        var newStart = new Date(
          parseInt(dateParts[0]),
          parseInt(dateParts[1]) - 1,
          parseInt(dateParts[2]),
          parseInt(startParts[0]),
          parseInt(startParts[1]),
          0, 0
        );
        var newEnd = new Date(
          parseInt(dateParts[0]),
          parseInt(dateParts[1]) - 1,
          parseInt(dateParts[2]),
          parseInt(endParts[0]),
          parseInt(endParts[1]),
          0, 0
        );

        if (newEnd <= newStart) {
          CommonUtils.showToast('结束时间需晚于开始时间');
          return false;
        }

        Store.updateSchedule(schedule.id, {
          title: titleVal,
          fleetId: fleetIdVal,
          fleetName: fleet ? fleet.name : '',
          startTime: newStart.toISOString(),
          endTime: newEnd.toISOString(),
          location: locationVal,
          isFromCycle: false
        });

        CommonUtils.showToast('保存成功');
        refreshPage();
        return true;
      }
    });
  }

  function refreshPage() {
    var mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    mainContent.innerHTML = '';
    render(mainContent);
  }

  function render(container) {
    selectedDate = new Date();
    filterType = 'all';

    var page = document.createElement('div');
    page.className = 'page-container';

    var pageHeader = document.createElement('div');
    pageHeader.className = 'page-header';
    pageHeader.innerHTML = '<div class="page-title">表演排期</div>' +
      '<div class="page-subtitle">查看和管理无人机表演与排练日程</div>';
    page.appendChild(pageHeader);

    calendarEl = Calendar.create({
      date: selectedDate,
      selectedDate: selectedDate,
      scheduleData: getScheduleMap(),
      onDateSelect: function(date) {
        selectedDate = date;
        renderScheduleList();
      }
    });
    page.appendChild(calendarEl);

    var filterTabs = document.createElement('div');
    filterTabs.className = 'filter-tabs';

    var filters = [
      { key: 'all', label: '全部' },
      { key: 'performance', label: '表演' },
      { key: 'rehearsal', label: '排练' },
      { key: 'occupied', label: '占用' }
    ];

    filters.forEach(function(f) {
      var tab = document.createElement('div');
      tab.className = 'filter-tab' + (filterType === f.key ? ' active' : '');
      tab.textContent = f.label;
      tab.onclick = function() {
        filterType = f.key;
        filterTabs.querySelectorAll('.filter-tab').forEach(function(t) {
          t.classList.remove('active');
        });
        tab.classList.add('active');
        renderScheduleList();
      };
      filterTabs.appendChild(tab);
    });

    page.appendChild(filterTabs);

    var listTitle = document.createElement('div');
    listTitle.className = 'section-title';
    listTitle.innerHTML = '<span>' + DateUtils.formatDate(selectedDate, 'MM月DD日 ww') + ' 日程</span>' +
      '<span class="section-title-extra" id="add-schedule-btn">+ 新增</span>';
    page.appendChild(listTitle);

    var scheduleList = document.createElement('div');
    scheduleList.id = 'schedule-list';
    page.appendChild(scheduleList);

    container.appendChild(page);

    renderScheduleList();

    var addBtn = document.getElementById('add-schedule-btn');
    if (addBtn) {
      addBtn.onclick = function() {
        CommonUtils.showToast('新建排期功能开发中');
      };
    }
  }

  function renderScheduleList() {
    var listEl = document.getElementById('schedule-list');
    if (!listEl) return;

    listEl.innerHTML = '';

    var daySchedules = Store.getSchedulesByDate(selectedDate);

    if (filterType !== 'all') {
      daySchedules = daySchedules.filter(function(s) {
        return s.type === filterType;
      });
    }

    if (daySchedules.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'empty';
      empty.innerHTML = '<div class="empty-icon">📭</div><div class="empty-text">当日暂无排期</div>';
      listEl.appendChild(empty);
      return;
    }

    daySchedules.forEach(function(schedule) {
      var item = renderScheduleItem(schedule);
      listEl.appendChild(item);
    });
  }

  function init() {
    Router.register('schedule', render);
  }

  return {
    render: render,
    init: init
  };
})();
