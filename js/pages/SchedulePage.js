var SchedulePage = (function() {
  var selectedDate = new Date();
  var filterType = 'all';
  var showBoard = false;
  var boardFilter = 'all';

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
      case 'ready': return '可执行';
      default: return status;
    }
  }

  function getStatusTagType(status) {
    switch (status) {
      case 'confirmed':
      case 'approved':
      case 'ready':
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

  function checkConflicts(fleetId, startTime, endTime, excludeId) {
    var schedules = Store.getState().schedules;
    var start = new Date(startTime).getTime();
    var end = new Date(endTime).getTime();
    var conflicts = [];

    schedules.forEach(function(s) {
      if (excludeId && s.id === excludeId) return;
      if (s.status === 'cancelled') return;
      if (s.fleetId !== fleetId) return;

      var sStart = new Date(s.startTime).getTime();
      var sEnd = new Date(s.endTime).getTime();
      if (start < sEnd && end > sStart) {
        conflicts.push({
          id: s.id,
          title: s.title,
          startTime: s.startTime,
          endTime: s.endTime,
          type: s.type
        });
      }
    });

    return conflicts;
  }

  function getFilingStatus(scheduleId) {
    var filings = Store.getState().filings;
    for (var i = 0; i < filings.length; i++) {
      if (filings[i].scheduleId === scheduleId) {
        return filings[i];
      }
    }
    return null;
  }

  function getApprovalStatus(schedule) {
    if (!schedule.approvalId) return { label: '未发起', type: 'default', done: false, missing: true };
    var approval = Store.getApprovalById(schedule.approvalId);
    if (!approval) return { label: '未发起', type: 'default', done: false, missing: true };
    switch (approval.status) {
      case 'approved': return { label: '审批通过', type: 'success', done: true, missing: false };
      case 'rejected': return { label: '已驳回', type: 'error', done: false, missing: false };
      case 'pending': return { label: '审批中', type: 'warning', done: false, missing: false };
      case 'draft': return { label: '草稿未提交', type: 'default', done: false, missing: false };
      default: return { label: approval.status, type: 'default', done: false, missing: false };
    }
  }

  function getAirspaceStatus(schedule) {
    var filing = getFilingStatus(schedule.id);
    if (!filing) return { label: '未报备', type: 'default', done: false, missing: true };
    switch (filing.status) {
      case 'approved': return { label: '空域通过', type: 'success', done: true, missing: false };
      case 'pending':
      case 'reviewing': return { label: '报备中', type: 'warning', done: false, missing: false };
      case 'rejected': return { label: '已驳回', type: 'error', done: false, missing: false };
      case 'draft': return { label: '草稿未提交', type: 'default', done: false, missing: false };
      default: return { label: filing.status, type: 'default', done: false, missing: false };
    }
  }

  function getTodoType(schedule) {
    var exec = getExecStatus(schedule);
    if (exec.ready) return 'ready';
    if (exec.conflicts && exec.conflicts.length > 0) return 'conflict';
    var a = getApprovalStatus(schedule);
    var f = getAirspaceStatus(schedule);
    if (!a.done && !f.done) return 'todo_both';
    if (!a.done) return 'todo_approval';
    if (!f.done) return 'todo_filing';
    return 'partial';
  }

  function getExecStatus(schedule) {
    if (schedule.status === 'cancelled') return { label: '已取消', type: 'error', ready: false };
    var a = getApprovalStatus(schedule);
    var f = getAirspaceStatus(schedule);
    var conflicts = schedule.fleetId ? checkConflicts(schedule.fleetId, schedule.startTime, schedule.endTime, schedule.id) : [];
    var hasConflict = conflicts.length > 0;

    if (a.done && f.done && !hasConflict) {
      return { label: '✓ 可执行', type: 'success', ready: true, conflicts: conflicts };
    }
    if (hasConflict) {
      return { label: '⚡ 档期冲突', type: 'error', ready: false, conflicts: conflicts };
    }
    var missing = [];
    if (!a.done) missing.push(a.label);
    if (!f.done) missing.push(f.label);
    return {
      label: '⚠ ' + missing.join(' + '),
      type: 'warning',
      ready: false,
      conflicts: conflicts,
      missing: missing
    };
  }

  function getRehearsalStatus(schedule) {
    if (!schedule.fleetId) return { label: '未安排机阵', done: false };
    var dateKey = DateUtils.formatDate(schedule.startTime, 'YYYY-MM-DD');
    var daySchedules = Store.getSchedulesByDate(dateKey);
    var rehearsals = daySchedules.filter(function(s) {
      return s.id !== schedule.id &&
             s.fleetId === schedule.fleetId &&
             s.type === 'rehearsal' &&
             s.status !== 'cancelled';
    });
    if (rehearsals.length > 0) {
      return { label: '已安排 ' + rehearsals.length + ' 场排练', done: true, count: rehearsals.length };
    }
    return { label: '未安排排练', done: false, count: 0 };
  }

  function goToApproval(scheduleId) {
    Modal.hideAll();
    setTimeout(function() {
      Router.navigate('approval');
    }, 150);
  }

  function goToFiling(scheduleId) {
    Modal.hideAll();
    setTimeout(function() {
      Router.navigate('filing');
    }, 150);
  }

  function renderExecutionBoard() {
    var state = Store.getState();
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    var futureLimit = new Date(now.getTime() + 90 * 24 * 3600 * 1000);

    var performances = state.schedules.filter(function(s) {
      if (s.type !== 'performance') return false;
      if (s.status === 'cancelled') return false;
      var endTime = new Date(s.endTime).getTime();
      return endTime >= now.getTime() && new Date(s.startTime).getTime() <= futureLimit.getTime();
    }).sort(function(a, b) {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });

    var filterTabs = [
      { key: 'all', label: '全部', count: performances.length },
      { key: 'ready', label: '可执行', count: 0 },
      { key: 'todo_approval', label: '待审批', count: 0 },
      { key: 'todo_filing', label: '待报备', count: 0 },
      { key: 'conflict', label: '有冲突', count: 0 }
    ];

    performances.forEach(function(p) {
      var todo = getTodoType(p);
      if (todo === 'ready') filterTabs[1].count++;
      else if (todo === 'todo_approval' || todo === 'todo_both') filterTabs[2].count++;
      else if (todo === 'todo_filing') filterTabs[3].count++;
      else if (todo === 'conflict') filterTabs[4].count++;
    });

    var filtered = performances;
    if (boardFilter !== 'all') {
      filtered = performances.filter(function(p) {
        var todo = getTodoType(p);
        if (boardFilter === 'todo_approval') return todo === 'todo_approval' || todo === 'todo_both';
        return todo === boardFilter;
      });
    }

    var stats = { ready: 0, partial: 0, conflict: 0 };
    performances.forEach(function(p) {
      var s = getExecStatus(p);
      if (s.ready) stats.ready++;
      else if (s.conflicts && s.conflicts.length > 0) stats.conflict++;
      else stats.partial++;
    });

    var wrapper = document.createElement('div');
    wrapper.className = 'route-config-card';
    wrapper.style.marginBottom = 'var(--spacing-md)';
    wrapper.style.padding = 'var(--spacing-md)';
    wrapper.style.background = 'linear-gradient(135deg, #1677ff 0%, #36bffa 100%)';
    wrapper.style.color = '#fff';

    var header = document.createElement('div');
    header.className = 'flex-between';
    header.style.marginBottom = 'var(--spacing-md)';
    header.innerHTML =
      '<div>' +
      '<div style="font-size:var(--font-size-lg);font-weight:var(--font-weight-semibold)">🎯 演出执行看板</div>' +
      '<div style="font-size:var(--font-size-sm);opacity:0.85">未来 90 天演出（含今日）</div>' +
      '</div>' +
      '<div class="grid-3" style="gap:12px;min-width:160px">' +
      '<div style="text-align:center;background:rgba(255,255,255,0.15);border-radius:var(--radius-sm);padding:6px 8px"><div style="font-weight:bold;font-size:18px">' + stats.ready + '</div><div style="font-size:10px;opacity:0.85">可执行</div></div>' +
      '<div style="text-align:center;background:rgba(255,255,255,0.15);border-radius:var(--radius-sm);padding:6px 8px"><div style="font-weight:bold;font-size:18px">' + stats.partial + '</div><div style="font-size:10px;opacity:0.85">待完善</div></div>' +
      '<div style="text-align:center;background:rgba(255,77,79,0.3);border-radius:var(--radius-sm);padding:6px 8px"><div style="font-weight:bold;font-size:18px">' + stats.conflict + '</div><div style="font-size:10px;opacity:0.85">有冲突</div></div>' +
      '</div>';
    wrapper.appendChild(header);

    var filterBar = document.createElement('div');
    filterBar.style.display = 'flex';
    filterBar.style.gap = '6px';
    filterBar.style.flexWrap = 'wrap';
    filterBar.style.marginBottom = 'var(--spacing-md)';
    filterTabs.forEach(function(tab) {
      var btn = document.createElement('span');
      btn.style.fontSize = '11px';
      btn.style.padding = '4px 10px';
      btn.style.borderRadius = '12px';
      btn.style.cursor = 'pointer';
      btn.style.border = '1px solid rgba(255,255,255,0.3)';
      btn.style.background = boardFilter === tab.key ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)';
      btn.textContent = tab.label + ' ' + tab.count;
      btn.onclick = function(e) {
        e.stopPropagation();
        boardFilter = tab.key;
        refreshPage(selectedDate);
      };
      filterBar.appendChild(btn);
    });
    wrapper.appendChild(filterBar);

    if (filtered.length === 0) {
      var empty = document.createElement('div');
      empty.style.textAlign = 'center';
      empty.style.padding = 'var(--spacing-lg) 0';
      empty.style.opacity = '0.7';
      empty.textContent = boardFilter === 'all' ? '暂无待执行演出' : '该分类下暂无演出';
      wrapper.appendChild(empty);
    } else {
      filtered.slice(0, 6).forEach(function(p) {
        var exec = getExecStatus(p);
        var a = getApprovalStatus(p);
        var f = getAirspaceStatus(p);
        var todo = getTodoType(p);

        var row = document.createElement('div');
        row.style.padding = '10px';
        row.style.marginBottom = '8px';
        row.style.background = 'rgba(255,255,255,0.12)';
        row.style.borderRadius = 'var(--radius-md)';

        var top = document.createElement('div');
        top.className = 'flex-between';
        top.style.marginBottom = '6px';
        top.style.cursor = 'pointer';
        top.onclick = function() {
          var d = new Date(p.startTime);
          selectedDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          showBoard = false;
          refreshPage(selectedDate);
          setTimeout(function() {
            showScheduleDetail(p);
          }, 200);
        };
        top.innerHTML =
          '<div style="font-weight:var(--font-weight-semibold);font-size:var(--font-size-base)">' + p.title + '</div>' +
          '<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:' +
            (exec.ready ? '#23c343' : (exec.conflicts && exec.conflicts.length > 0 ? '#f53f3f' : '#ff9a2e')) +
            ';color:#fff">' + exec.label + '</span>';
        row.appendChild(top);

        var mid = document.createElement('div');
        mid.className = 'flex-between';
        mid.style.fontSize = '11px';
        mid.style.opacity = '0.9';
        mid.innerHTML =
          '<div>📅 ' + DateUtils.formatDate(p.startTime, 'MM-DD ww') + ' ' +
            DateUtils.formatDate(p.startTime, 'HH:mm') + '-' + DateUtils.formatDate(p.endTime, 'HH:mm') + '</div>' +
          '<div>🚁 ' + (p.fleetName || '-') + '</div>';
        row.appendChild(mid);

        var tags = document.createElement('div');
        tags.style.marginTop = '6px';
        tags.style.fontSize = '10px';
        tags.style.display = 'flex';
        tags.style.flexWrap = 'wrap';
        tags.style.gap = '4px';
        var aTag = document.createElement('span');
        aTag.style.padding = '2px 6px';
        aTag.style.borderRadius = '8px';
        aTag.style.background = 'rgba(255,255,255,0.15)';
        aTag.innerHTML = (a.done ? '✓ ' : '○ ') + a.label;
        tags.appendChild(aTag);

        var fTag = document.createElement('span');
        fTag.style.padding = '2px 6px';
        fTag.style.borderRadius = '8px';
        fTag.style.background = 'rgba(255,255,255,0.15)';
        fTag.innerHTML = (f.done ? '✓ ' : '○ ') + f.label;
        tags.appendChild(fTag);

        if (exec.conflicts && exec.conflicts.length > 0) {
          var cTag = document.createElement('span');
          cTag.style.padding = '2px 6px';
          cTag.style.borderRadius = '8px';
          cTag.style.background = 'rgba(245,63,63,0.5)';
          cTag.textContent = '⚡ ' + exec.conflicts.length + '冲突';
          tags.appendChild(cTag);
        }
        row.appendChild(tags);

        var actions = document.createElement('div');
        actions.style.marginTop = '8px';
        actions.style.display = 'flex';
        actions.style.gap = '6px';
        actions.style.fontSize = '11px';

        if (todo === 'todo_approval' || todo === 'todo_both') {
          var apBtn = document.createElement('button');
          apBtn.className = 'btn btn-primary';
          apBtn.style.padding = '3px 10px';
          apBtn.style.fontSize = '11px';
          apBtn.style.minHeight = '24px';
          apBtn.textContent = '→ 去审批';
          apBtn.onclick = function(e) {
            e.stopPropagation();
            goToApproval(p.id);
          };
          actions.appendChild(apBtn);
        }
        if (todo === 'todo_filing' || todo === 'todo_both') {
          var fiBtn = document.createElement('button');
          fiBtn.className = 'btn btn-primary';
          fiBtn.style.padding = '3px 10px';
          fiBtn.style.fontSize = '11px';
          fiBtn.style.minHeight = '24px';
          fiBtn.style.background = '#13c2c2';
          fiBtn.style.borderColor = '#13c2c2';
          fiBtn.textContent = '→ 去报备';
          fiBtn.onclick = function(e) {
            e.stopPropagation();
            goToFiling(p.id);
          };
          actions.appendChild(fiBtn);
        }
        if (todo === 'conflict') {
          var cfBtn = document.createElement('button');
          cfBtn.className = 'btn btn-primary';
          cfBtn.style.padding = '3px 10px';
          cfBtn.style.fontSize = '11px';
          cfBtn.style.minHeight = '24px';
          cfBtn.style.background = '#f53f3f';
          cfBtn.style.borderColor = '#f53f3f';
          cfBtn.textContent = '→ 调整时间';
          cfBtn.onclick = function(e) {
            e.stopPropagation();
            var d = new Date(p.startTime);
            selectedDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            showBoard = false;
            refreshPage(selectedDate);
            setTimeout(function() {
              showScheduleEdit(p);
            }, 200);
          };
          actions.appendChild(cfBtn);
        }
        if (actions.children.length > 0) {
          row.appendChild(actions);
        }

        wrapper.appendChild(row);
      });

      if (filtered.length > 6) {
        var more = document.createElement('div');
        more.style.textAlign = 'center';
        more.style.paddingTop = '4px';
        more.style.fontSize = 'var(--font-size-sm)';
        more.style.opacity = '0.8';
        more.textContent = '还有 ' + (filtered.length - 6) + ' 场演出...';
        wrapper.appendChild(more);
      }
    }

    return wrapper;
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

    if (schedule.type === 'performance') {
      var exec = getExecStatus(schedule);
      var execBar = document.createElement('div');
      execBar.style.marginTop = '6px';
      execBar.style.fontSize = '11px';
      execBar.style.padding = '3px 8px';
      execBar.style.borderRadius = 'var(--radius-sm)';
      execBar.style.display = 'inline-block';
      if (exec.ready) {
        execBar.style.background = 'var(--color-success-bg)';
        execBar.style.color = 'var(--color-success)';
      } else if (exec.conflicts && exec.conflicts.length > 0) {
        execBar.style.background = 'var(--color-error-bg)';
        execBar.style.color = 'var(--color-error)';
      } else {
        execBar.style.background = 'var(--color-warning-bg)';
        execBar.style.color = 'var(--color-warning)';
      }
      execBar.textContent = exec.label;
      info.appendChild(execBar);
    }

    if (schedule.approvalId) {
      var approval = Store.getApprovalById(schedule.approvalId);
      if (approval && approval.totalSteps > 0) {
        var approvalBar = document.createElement('div');
        approvalBar.className = 'approval-progress';
        approvalBar.style.marginTop = 'var(--spacing-xs)';
        approvalBar.style.padding = '0';
        var percent = approval.totalSteps > 0 ? Math.round((approval.currentStep / approval.totalSteps) * 100) : 0;
        approvalBar.innerHTML =
          '<div class="approval-progress-text" style="margin-bottom:4px">' +
          '<span style="font-size:11px">审批进度</span>' +
          '<span style="font-size:11px">' + approval.currentStep + '/' + approval.totalSteps +
          ' · ' + getApprovalSimpleStatus(approval.status) + '</span>' +
          '</div>' +
          '<div class="approval-progress-bar" style="height:4px">' +
          '<div class="approval-progress-fill" style="width:' + percent + '%"></div>' +
          '</div>';
        info.appendChild(approvalBar);
      }
    }

    item.appendChild(info);

    item.onclick = function() {
      showScheduleDetail(schedule);
    };

    return item;
  }

  function getApprovalSimpleStatus(status) {
    switch (status) {
      case 'pending': return '审批中';
      case 'approved': return '已通过 ✓';
      case 'rejected': return '已驳回 ✗';
      case 'draft': return '草稿';
      default: return status;
    }
  }

  function getFleetDayAdjacents(schedule) {
    if (!schedule.fleetId) return [];
    var dateKey = DateUtils.formatDate(schedule.startTime, 'YYYY-MM-DD');
    var all = Store.getSchedulesByDate(dateKey);
    var list = [];
    all.forEach(function(s) {
      if (s.id === schedule.id) return;
      if (s.fleetId !== schedule.fleetId) return;
      if (s.status === 'cancelled') return;
      var s1 = new Date(schedule.startTime).getTime();
      var s2 = new Date(schedule.endTime).getTime();
      var e1 = new Date(s.startTime).getTime();
      var e2 = new Date(s.endTime).getTime();
      if (s1 < e2 && s2 > e1) {
        list.push({ schedule: s, relation: 'overlap' });
      } else {
        var gapMin = Math.min(Math.abs(s1 - e2), Math.abs(s2 - e1));
        if (gapMin / 60000 <= 120) {
          list.push({ schedule: s, relation: gapMin < 60000 ? 'tight' : 'adjacent' });
        }
      }
    });
    list.sort(function(a, b) {
      return new Date(a.schedule.startTime).getTime() - new Date(b.schedule.startTime).getTime();
    });
    return list;
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
    var displayStatus = schedule.status;
    if (schedule.type === 'performance') {
      var exec = getExecStatus(schedule);
      if (exec.ready) displayStatus = 'ready';
    }
    statusRow.querySelector('.detail-value').appendChild(
      Tag.create(getStatusLabel(displayStatus), getStatusTagType(displayStatus))
    );
    content.appendChild(statusRow);

    var timeRow = document.createElement('div');
    timeRow.className = 'detail-row';
    timeRow.innerHTML = '<div class="detail-label">时间</div><div class="detail-value">' +
      DateUtils.formatDate(schedule.startTime, 'YYYY-MM-DD HH:mm') + ' ~ ' +
      DateUtils.formatDate(schedule.endTime, 'HH:mm') + '</div>';
    content.appendChild(timeRow);

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

    if (schedule.type === 'performance') {
      var exec2 = getExecStatus(schedule);
      var a = getApprovalStatus(schedule);
      var f = getAirspaceStatus(schedule);
      var r = getRehearsalStatus(schedule);
      var hasConflict = exec2.conflicts && exec2.conflicts.length > 0;

      var approvalDivider = document.createElement('div');
      approvalDivider.className = 'divider';
      content.appendChild(approvalDivider);

      var execSummary = document.createElement('div');
      execSummary.style.padding = 'var(--spacing-sm) var(--spacing-md)';
      execSummary.style.borderRadius = 'var(--radius-md)';
      execSummary.style.marginBottom = 'var(--spacing-md)';
      if (exec2.ready) {
        execSummary.style.background = 'var(--color-success-bg)';
        execSummary.style.color = 'var(--color-success)';
        execSummary.innerHTML = '✅ ' + exec2.label + ' · 可正常执行';
      } else if (hasConflict) {
        execSummary.style.background = 'var(--color-error-bg)';
        execSummary.style.color = 'var(--color-error)';
        execSummary.innerHTML = '⚡ 档期存在 ' + exec2.conflicts.length + ' 处冲突，请调整时间';
      } else {
        execSummary.style.background = 'var(--color-warning-bg)';
        execSummary.style.color = 'var(--color-warning)';
        execSummary.innerHTML = '⚠️ 待完善：' + exec2.missing.join('、');
      }
      content.appendChild(execSummary);

      var checkTitle = document.createElement('div');
      checkTitle.style.fontWeight = 'var(--font-weight-medium)';
      checkTitle.style.marginBottom = 'var(--spacing-sm)';
      checkTitle.innerHTML = '📋 执行清单（点击卡片直达处理）';
      content.appendChild(checkTitle);

      function renderCheckItem(icon, title, status, done, onClick, btnText) {
        var row = document.createElement('div');
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.padding = 'var(--spacing-sm) var(--spacing-md)';
        row.style.marginBottom = 'var(--spacing-xs)';
        row.style.borderRadius = 'var(--radius-md)';
        row.style.background = done ? 'var(--color-success-bg)' : 'var(--color-bg-gray)';
        row.style.cursor = onClick ? 'pointer' : 'default';

        var info = document.createElement('div');
        info.style.flex = '1';
        info.innerHTML =
          '<div style="font-size:var(--font-size-sm);font-weight:var(--font-weight-medium);color:' +
            (done ? 'var(--color-success)' : 'var(--color-text)') + '">' +
            (done ? '✓ ' : '○ ') + icon + ' ' + title + '</div>' +
          '<div style="font-size:var(--font-size-xs);color:' +
            (done ? 'var(--color-success)' : 'var(--color-text-secondary)') + '">' + status + '</div>';
        row.appendChild(info);

        if (onClick && btnText) {
          var btn = document.createElement('button');
          btn.className = 'btn btn-primary';
          btn.style.padding = '4px 12px';
          btn.style.fontSize = '11px';
          btn.style.minHeight = '26px';
          btn.textContent = btnText;
          btn.onclick = function(e) {
            e.stopPropagation();
            onClick();
          };
          row.appendChild(btn);
        }

        if (onClick) {
          row.onclick = onClick;
        }

        return row;
      }

      content.appendChild(renderCheckItem(
        '📝',
        '表演审批',
        a.label,
        a.done,
        function() { goToApproval(schedule.id); },
        a.done ? null : (schedule.approvalId ? '继续审批' : '发起审批')
      ));

      content.appendChild(renderCheckItem(
        '✈️',
        '空域报备',
        f.label,
        f.done,
        function() { goToFiling(schedule.id); },
        f.done ? null : '去报备'
      ));

      content.appendChild(renderCheckItem(
        '⚡',
        '档期冲突检查',
        hasConflict ? ('存在 ' + exec2.conflicts.length + ' 处冲突') : '无冲突',
        !hasConflict,
        hasConflict ? function() {
          Modal.hide();
          setTimeout(function() { showScheduleEdit(schedule); }, 150);
        } : null,
        hasConflict ? '调整时间' : null
      ));

      content.appendChild(renderCheckItem(
        '🎯',
        '排练安排',
        r.label,
        r.done,
        r.done ? null : function() {
          Modal.hideAll();
          setTimeout(function() {
            Router.navigate('cycle');
          }, 150);
        },
        r.done ? null : '去安排'
      ));

      var quickActions = document.createElement('div');
      quickActions.style.display = 'flex';
      quickActions.style.gap = 'var(--spacing-sm)';
      quickActions.style.marginTop = 'var(--spacing-md)';
      var apBtn = document.createElement('button');
      apBtn.className = 'btn btn-primary';
      apBtn.style.flex = '1';
      apBtn.textContent = '📝 分支审批';
      apBtn.onclick = function() { goToApproval(schedule.id); };
      quickActions.appendChild(apBtn);
      var fiBtn = document.createElement('button');
      fiBtn.className = 'btn btn-primary';
      fiBtn.style.flex = '1';
      fiBtn.style.background = '#13c2c2';
      fiBtn.style.borderColor = '#13c2c2';
      fiBtn.textContent = '✈️ 报批登记';
      fiBtn.onclick = function() { goToFiling(schedule.id); };
      quickActions.appendChild(fiBtn);
      content.appendChild(quickActions);
    }

    if (schedule.approvalId) {
      var approval = Store.getApprovalById(schedule.approvalId);
      if (approval) {
        var divider1 = document.createElement('div');
        divider1.className = 'divider';
        content.appendChild(divider1);

        var approvalTitle = document.createElement('div');
        approvalTitle.style.fontWeight = 'var(--font-weight-medium)';
        approvalTitle.style.marginBottom = 'var(--spacing-sm)';
        approvalTitle.textContent = '� 审批流程进度';
        content.appendChild(approvalTitle);

        var flowEl = ApprovalFlow.create(approval.steps);
        content.appendChild(flowEl);
      }
    }

    var adjacents = schedule.fleetId ? getFleetDayAdjacents(schedule) : [];
    if (adjacents.length > 0) {
      var dividerAdj = document.createElement('div');
      dividerAdj.className = 'divider';
      content.appendChild(dividerAdj);

      var adjTitle = document.createElement('div');
      adjTitle.style.fontWeight = 'var(--font-weight-medium)';
      adjTitle.style.marginBottom = 'var(--spacing-sm)';
      adjTitle.innerHTML = '🚁 ' + schedule.fleetName + ' 当天相邻/冲突占用（' + adjacents.length + ' 条）';
      content.appendChild(adjTitle);

      adjacents.forEach(function(item) {
        var row = document.createElement('div');
        row.className = 'flex-between';
        row.style.padding = 'var(--spacing-sm) 0';
        row.style.borderBottom = '1px solid var(--color-border-light)';
        row.style.cursor = 'pointer';
        var colorTag = '';
        var label = '';
        if (item.relation === 'overlap') { colorTag = 'var(--color-error)'; label = '冲突'; }
        else if (item.relation === 'tight') { colorTag = 'var(--color-warning)'; label = '间隔<1h'; }
        else { colorTag = 'var(--color-text-tertiary)'; label = '间隔<2h'; }
        row.innerHTML =
          '<div>' +
          '<div style="font-weight:var(--font-weight-medium)">' + item.schedule.title + '</div>' +
          '<div style="font-size:var(--font-size-xs);color:var(--color-text-secondary)">' +
          getTypeLabel(item.schedule.type) + ' · ' +
          DateUtils.formatDate(item.schedule.startTime, 'HH:mm') + ' - ' +
          DateUtils.formatDate(item.schedule.endTime, 'HH:mm') +
          '</div>' +
          '</div>' +
          '<span style="color:' + colorTag + ';font-size:var(--font-size-xs)">' + label + '</span>';
        row.onclick = function() {
          Modal.hide();
          var d = new Date(item.schedule.startTime);
          selectedDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          refreshPage(selectedDate);
          setTimeout(function() { showScheduleDetail(item.schedule); }, 150);
        };
        content.appendChild(row);
      });
    }

    if (schedule.isFromCycle) {
      var divider3 = document.createElement('div');
      divider3.className = 'divider';
      content.appendChild(divider3);
      var tip3 = document.createElement('div');
      tip3.style.fontSize = 'var(--font-size-sm)';
      tip3.style.color = 'var(--color-text-tertiary)';
      tip3.textContent = '⚠️ 此排期由周期规则批量生成，编辑后将与规则解除关联';
      content.appendChild(tip3);
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
            Modal.hideAll();
            setTimeout(function() {
              refreshPage(selectedDate);
            }, 150);
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

        var conflicts = checkConflicts(fleetIdVal, newStart.toISOString(), newEnd.toISOString(), schedule.id);
        if (conflicts.length > 0) {
          showConflictDialog(conflicts, function(forceSave) {
            if (!forceSave) return;
            doSave(schedule, titleVal, fleetIdVal, fleet, newStart, newEnd, locationVal);
          });
          return false;
        }

        doSave(schedule, titleVal, fleetIdVal, fleet, newStart, newEnd, locationVal);
        return true;
      }
    });
  }

  function doSave(schedule, titleVal, fleetIdVal, fleet, newStart, newEnd, locationVal) {
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
    Modal.hideAll();
    var targetDate = new Date(
      newStart.getFullYear(),
      newStart.getMonth(),
      newStart.getDate()
    );
    setTimeout(function() {
      refreshPage(targetDate);
    }, 150);
  }

  function showConflictDialog(conflicts, callback) {
    var content = document.createElement('div');
    content.innerHTML = '<div style="color:var(--color-error);font-weight:var(--font-weight-semibold);margin-bottom:var(--spacing-md)">⚠️ 检测到 ' + conflicts.length + ' 个档期冲突</div>';

    conflicts.forEach(function(c) {
      var row = document.createElement('div');
      row.className = 'flex-between';
      row.style.padding = 'var(--spacing-sm) 0';
      row.style.borderBottom = '1px solid var(--color-border-light)';
      row.innerHTML =
        '<div>' +
        '<div style="font-weight:var(--font-weight-medium)">' + c.title + '</div>' +
        '<div style="font-size:var(--font-size-xs);color:var(--color-text-secondary)">' +
        getTypeLabel(c.type) + ' · ' +
        DateUtils.formatDate(c.startTime, 'MM-DD HH:mm') + ' ~ ' +
        DateUtils.formatDate(c.endTime, 'HH:mm') +
        '</div>' +
        '</div>' +
        '<span class="text-error" style="font-size:var(--font-size-sm)">冲突</span>';
      content.appendChild(row);
    });

    var tip = document.createElement('div');
    tip.className = 'text-secondary';
    tip.style.fontSize = 'var(--font-size-sm)';
    tip.style.marginTop = 'var(--spacing-md)';
    tip.textContent = '是否仍然强制保存？可能导致机阵资源重复占用。';
    content.appendChild(tip);

    Modal.show({
      title: '档期冲突',
      content: content,
      confirmText: '强制保存',
      cancelText: '取消',
      showCancel: true,
      onConfirm: function() {
        Modal.hideAll();
        setTimeout(function() { callback(true); }, 150);
        return true;
      },
      onCancel: function() {
        callback(false);
        return true;
      }
    });
  }

  function refreshPage(date) {
    if (date instanceof Date) {
      selectedDate = date;
    }
    var mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    mainContent.innerHTML = '';
    render(mainContent);
  }

  function render(container) {
    if (!selectedDate || !(selectedDate instanceof Date)) {
      selectedDate = new Date();
    }
    if (!filterType) {
      filterType = 'all';
    }

    var page = document.createElement('div');
    page.className = 'page-container';

    var pageHeader = document.createElement('div');
    pageHeader.className = 'page-header';
    pageHeader.innerHTML =
      '<div class="flex-between">' +
      '<div>' +
      '<div class="page-title">表演排期</div>' +
      '<div class="page-subtitle">查看和管理无人机表演与排练日程</div>' +
      '</div>' +
      '<span id="toggle-board-btn" class="section-title-extra" style="cursor:pointer;background:var(--color-primary);color:#fff;padding:4px 10px;border-radius:20px;font-size:12px;line-height:18px">' +
        (showBoard ? '收起看板' : '🎯 执行看板') + '</span>' +
      '</div>';
    page.appendChild(pageHeader);

    if (showBoard) {
      page.appendChild(renderExecutionBoard());
    }

    var calendarEl = Calendar.create({
      date: selectedDate,
      selectedDate: selectedDate,
      scheduleData: getScheduleMap(),
      onDateSelect: function(date) {
        selectedDate = date;
        var listTitle = document.querySelector('.section-title span');
        if (listTitle) {
          listTitle.textContent = DateUtils.formatDate(selectedDate, 'MM月DD日 ww') + ' 日程';
        }
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

    setTimeout(function() {
      var toggleBtn = document.getElementById('toggle-board-btn');
      if (toggleBtn) {
        toggleBtn.onclick = function() {
          showBoard = !showBoard;
          refreshPage(selectedDate);
        };
      }
      var addBtn = document.getElementById('add-schedule-btn');
      if (addBtn) {
        addBtn.onclick = function() {
          CommonUtils.showToast('新建排期功能开发中');
        };
      }
    }, 0);
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
    init: init,
    checkConflicts: checkConflicts,
    refreshPage: refreshPage,
    showScheduleDetail: showScheduleDetail,
    getExecStatus: getExecStatus,
    getApprovalStatus: getApprovalStatus,
    getAirspaceStatus: getAirspaceStatus
  };
})();
