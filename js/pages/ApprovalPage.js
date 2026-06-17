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

    if (approval.scheduleId) {
      var schedule = Store.getScheduleById(approval.scheduleId);
      if (schedule) {
        var divider0 = document.createElement('div');
        divider0.className = 'divider';
        content.appendChild(divider0);

        var schedTitle = document.createElement('div');
        schedTitle.style.fontWeight = 'var(--font-weight-medium)';
        schedTitle.style.marginBottom = 'var(--spacing-sm)';
        schedTitle.textContent = '📅 关联演出排期';
        content.appendChild(schedTitle);

        var schedCard = document.createElement('div');
        schedCard.style.padding = 'var(--spacing-sm) var(--spacing-md)';
        schedCard.style.background = 'var(--color-bg-gray)';
        schedCard.style.borderRadius = 'var(--radius-md)';
        schedCard.style.marginBottom = 'var(--spacing-sm)';
        schedCard.style.cursor = 'pointer';
        schedCard.innerHTML =
          '<div style="font-weight:var(--font-weight-medium);margin-bottom:4px">' + schedule.title + '</div>' +
          '<div style="font-size:var(--font-size-xs);color:var(--color-text-secondary)">' +
          '📅 ' + DateUtils.formatDate(schedule.startTime, 'MM-DD HH:mm') + '-' +
          DateUtils.formatDate(schedule.endTime, 'HH:mm') +
          ' · 🚁 ' + (schedule.fleetName || '-') +
          ' · 📍 ' + (schedule.location || '-') +
          '</div>';
        schedCard.onclick = function() {
          Modal.hideAll();
          setTimeout(function() {
            Router.navigate('schedule');
            var d = new Date(schedule.startTime);
            var targetDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            setTimeout(function() {
              SchedulePage.refreshPage(targetDate);
              setTimeout(function() {
                var s = Store.getScheduleById(schedule.id);
                if (s) {
                  SchedulePage.showScheduleDetail(s);
                }
              }, 200);
            }, 150);
          }, 150);
        };
        content.appendChild(schedCard);

        var schedBtn = document.createElement('button');
        schedBtn.className = 'btn btn-primary';
        schedBtn.style.width = '100%';
        schedBtn.style.marginBottom = 'var(--spacing-md)';
        schedBtn.textContent = '→ 查看排期详情';
        schedBtn.onclick = schedCard.onclick;
        content.appendChild(schedBtn);
      }
    }

    var divider = document.createElement('div');
    divider.className = 'divider';
    content.appendChild(divider);

    var flowTitle = document.createElement('div');
    flowTitle.style.fontWeight = 'var(--font-weight-medium)';
    flowTitle.style.marginBottom = 'var(--spacing-sm)';
    flowTitle.textContent = '📐 审批流程';
    content.appendChild(flowTitle);

    var flowEl = ApprovalFlow.create(approval.steps);
    content.appendChild(flowEl);

    var canApprove = approval.status === 'pending' && approval.currentStep > 0;
    var isDraft = approval.status === 'draft';
    var isRejected = approval.status === 'rejected';

    if (isRejected && approval.scheduleId) {
      var resubmitDivider = document.createElement('div');
      resubmitDivider.className = 'divider';
      content.appendChild(resubmitDivider);

      var tip = document.createElement('div');
      tip.className = 'text-error';
      tip.style.fontSize = 'var(--font-size-sm)';
      tip.style.padding = 'var(--spacing-sm) var(--spacing-md)';
      tip.style.background = 'var(--color-error-bg)';
      tip.style.borderRadius = 'var(--radius-md)';
      tip.style.marginBottom = 'var(--spacing-sm)';
      tip.textContent = '⚠️ 此审批已被驳回，可前往排期详情调整后重新发起';
      content.appendChild(tip);
    }

    Modal.show({
      title: approval.title,
      content: content,
      confirmText: isDraft ? '提交审批' : (canApprove ? '同意' : '关闭'),
      cancelText: isDraft ? '取消' : (canApprove ? '拒绝' : undefined),
      showCancel: isDraft || canApprove,
      onConfirm: function() {
        if (isDraft) {
          submitDraftApproval(approval);
        } else if (canApprove) {
          approveApproval(approval.id);
        }
        return true;
      },
      onCancel: isDraft ? undefined : (canApprove ? function() {
        rejectApproval(approval.id);
        return true;
      } : undefined)
    });
  }

  function submitDraftApproval(approval) {
    var matchedRoute = Store.getRouteConfigByCondition({
      scale: approval.scale,
      isSpecial: approval.isSpecial === true
    });

    if (!matchedRoute) {
      CommonUtils.showToast('未匹配到审批流程，请先配置路由');
      return;
    }

    var initialSteps = matchedRoute.steps.map(function(step, index) {
      return {
        id: step.id,
        name: step.name,
        role: step.role,
        status: index === 0 ? 'active' : 'pending',
        approver: null,
        time: null,
        comment: null
      };
    });

    Store.updateApproval(approval.id, {
      status: 'pending',
      routeConfigId: matchedRoute.id,
      submitTime: new Date().toISOString(),
      currentStep: 1,
      totalSteps: initialSteps.length,
      steps: initialSteps
    });

    if (approval.scheduleId) {
      Store.updateSchedule(approval.scheduleId, { status: 'pending' });
    }

    CommonUtils.showToast('已提交，自动匹配「' + matchedRoute.name + '」');
    Modal.hideAll();
    setTimeout(refreshPage, 150);
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

    if (approval.scheduleId) {
      if (newStatus === 'approved') {
        Store.updateSchedule(approval.scheduleId, { status: 'approved' });
      } else {
        Store.updateSchedule(approval.scheduleId, { status: 'pending' });
      }
    }

    CommonUtils.showToast(newStatus === 'approved' ? '审批已通过' : '已通过，进入下一环节');
    Modal.hideAll();
    setTimeout(refreshPage, 150);
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

    if (approval.scheduleId) {
      Store.updateSchedule(approval.scheduleId, { status: 'confirmed' });
    }

    CommonUtils.showToast('已拒绝');
    Modal.hideAll();
    setTimeout(refreshPage, 150);
  }

  function showCreateApproval() {
    var schedules = Store.getState().schedules.filter(function(s) {
      return s.type === 'performance' && !s.approvalId;
    });

    if (schedules.length === 0) {
      CommonUtils.showToast('暂无可发起的表演排期');
      return;
    }

    var content = document.createElement('div');

    content.innerHTML =
      '<div class="form-item">' +
      '<label class="form-label">选择表演排期</label>' +
      '<select class="form-select" id="create-approval-schedule">' +
      schedules.map(function(s) {
        return '<option value="' + s.id + '">' + s.title + ' (' + DateUtils.formatDate(s.startTime, 'MM-DD HH:mm') + ' · ' + s.fleetName + ')</option>';
      }).join('') +
      '</select>' +
      '</div>' +
      '<div class="form-item">' +
      '<label class="form-label">表演规模</label>' +
      '<select class="form-select" id="create-approval-scale">' +
      '<option value="small">小型</option>' +
      '<option value="medium" selected>中型</option>' +
      '<option value="large">大型</option>' +
      '</select>' +
      '</div>' +
      '<div class="form-item">' +
      '<label class="form-label">特殊场地（天安门/机场/军事区等）</label>' +
      '<select class="form-select" id="create-approval-special">' +
      '<option value="false" selected>否</option>' +
      '<option value="true">是</option>' +
      '</select>' +
      '</div>' +
      '<div class="form-item">' +
      '<label class="form-label">提交人</label>' +
      '<input type="text" class="form-input" id="create-approval-submitter" value="当前用户">' +
      '</div>' +
      '<div id="create-approval-preview" style="padding:var(--spacing-md);background:var(--color-bg-gray);border-radius:var(--radius-md);margin-top:var(--spacing-md);">' +
      '<div style="font-size:var(--font-size-sm);color:var(--color-text-secondary)">选择规模和场地后可预览匹配的审批链</div>' +
      '</div>';

    Modal.show({
      title: '发起表演审批',
      content: content,
      confirmText: '提交审批',
      cancelText: '取消',
      showCancel: true,
      onConfirm: function() {
        var scheduleId = document.getElementById('create-approval-schedule').value;
        var scale = document.getElementById('create-approval-scale').value;
        var isSpecial = document.getElementById('create-approval-special').value === 'true';
        var submitter = document.getElementById('create-approval-submitter').value.trim();

        if (!scheduleId) {
          CommonUtils.showToast('请选择表演排期');
          return false;
        }
        if (!submitter) {
          CommonUtils.showToast('请输入提交人');
          return false;
        }

        var selectedSchedule = Store.getScheduleById(scheduleId);
        if (!selectedSchedule) {
          CommonUtils.showToast('排期不存在');
          return false;
        }

        var matchedRoute = Store.getRouteConfigByCondition({
          scale: scale,
          isSpecial: isSpecial
        });
        if (!matchedRoute) {
          CommonUtils.showToast('未匹配到审批流程');
          return false;
        }

        var initialSteps = matchedRoute.steps.map(function(step, index) {
          return {
            id: step.id,
            name: step.name,
            role: step.role,
            status: index === 0 ? 'active' : 'pending',
            approver: null,
            time: null,
            comment: null
          };
        });

        var approval = {
          title: selectedSchedule.title + ' - 表演报批',
          scale: scale,
          isSpecial: isSpecial,
          location: selectedSchedule.location || '未知地点',
          submitter: submitter,
          status: 'pending',
          routeConfigId: matchedRoute.id,
          submitTime: new Date().toISOString(),
          currentStep: 1,
          totalSteps: initialSteps.length,
          steps: initialSteps,
          scheduleId: scheduleId
        };

        var created = Store.addApproval(approval);

        Store.updateSchedule(scheduleId, {
          status: 'pending',
          approvalId: created.id
        });

        CommonUtils.showToast('已提交，匹配「' + matchedRoute.name + '」');
        Modal.hideAll();
        setTimeout(refreshPage, 150);
        return true;
      }
    });

    setTimeout(function() {
      var scaleEl = document.getElementById('create-approval-scale');
      var specialEl = document.getElementById('create-approval-special');
      var previewEl = document.getElementById('create-approval-preview');
      if (scaleEl) scaleEl.onchange = updatePreview;
      if (specialEl) specialEl.onchange = updatePreview;
      function updatePreview() {
        if (!previewEl) return;
        var sc = document.getElementById('create-approval-scale').value;
        var sp = document.getElementById('create-approval-special').value === 'true';
        var matched = Store.getRouteConfigByCondition({ scale: sc, isSpecial: sp });
        if (matched) {
          previewEl.innerHTML = '<div style="font-size:var(--font-size-sm)">✅ 匹配：<b>' + matched.name + '</b>（' + matched.steps.length + ' 步）</div>';
          var html = '<div style="margin-top:8px;font-size:12px;color:var(--color-text-secondary)">';
          matched.steps.forEach(function(st, i) {
            html += '<div style="padding:2px 0">' + (i + 1) + '. ' + st.name + '（' + getRoleLabel(st.role) + '）</div>';
          });
          html += '</div>';
          previewEl.innerHTML += html;
        } else {
          previewEl.innerHTML = '<div class="text-error">⚠️ 未匹配</div>';
        }
      }
      updatePreview();
    }, 50);
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
      confirmText: '编辑',
      cancelText: '关闭',
      showCancel: true,
      onConfirm: function() {
        showRouteConfigEdit(config);
        return true;
      }
    });
  }

  function showRouteConfigEdit(config) {
    var content = document.createElement('div');

    var nameItem = document.createElement('div');
    nameItem.className = 'form-item';
    nameItem.innerHTML =
      '<label class="form-label">规则名称</label>' +
      '<input type="text" class="form-input" id="route-edit-name" value="' + (config.name || '') + '">';
    content.appendChild(nameItem);

    var descItem = document.createElement('div');
    descItem.className = 'form-item';
    descItem.innerHTML =
      '<label class="form-label">描述</label>' +
      '<input type="text" class="form-input" id="route-edit-desc" value="' + (config.description || '') + '">';
    content.appendChild(descItem);

    var condTitle = document.createElement('div');
    condTitle.className = 'form-label';
    condTitle.textContent = '路由条件';
    content.appendChild(condTitle);

    var scaleItem = document.createElement('div');
    scaleItem.className = 'form-item';
    var curScale = config.conditions.scale || '';
    scaleItem.innerHTML =
      '<label class="form-label">表演规模</label>' +
      '<select class="form-select" id="route-edit-scale">' +
      '<option value="">不限制</option>' +
      '<option value="small"' + (curScale === 'small' ? ' selected' : '') + '>小型</option>' +
      '<option value="medium"' + (curScale === 'medium' ? ' selected' : '') + '>中型</option>' +
      '<option value="large"' + (curScale === 'large' ? ' selected' : '') + '>大型</option>' +
      '</select>';
    content.appendChild(scaleItem);

    var specialItem = document.createElement('div');
    specialItem.className = 'form-item';
    var curSpecial = config.conditions.isSpecial === true;
    specialItem.innerHTML =
      '<label class="form-label">特殊场地</label>' +
      '<select class="form-select" id="route-edit-special">' +
      '<option value="">不限制</option>' +
      '<option value="true"' + (curSpecial ? ' selected' : '') + '>是（需民航局审批）</option>' +
      '<option value="false"' + (!curSpecial && config.conditions.hasOwnProperty('isSpecial') ? ' selected' : '') + '>否</option>' +
      '</select>';
    content.appendChild(specialItem);

    var stepsTitle = document.createElement('div');
    stepsTitle.className = 'form-label';
    stepsTitle.innerHTML =
      '审批环节 <span class="text-secondary" style="font-weight: normal">(当前 ' + config.steps.length + ' 步)</span>' +
      '<span class="section-title-extra" id="route-add-step" style="cursor:pointer">+ 添加环节</span>';
    content.appendChild(stepsTitle);

    var stepsContainer = document.createElement('div');
    stepsContainer.id = 'route-steps-container';
    content.appendChild(stepsContainer);

    var stepTemplates = config.steps.map(function(step) {
      return { name: step.name, role: step.role };
    });

    function renderSteps() {
      stepsContainer.innerHTML = '';
      stepTemplates.forEach(function(st, idx) {
        var row = document.createElement('div');
        row.className = 'flex';
        row.style.gap = 'var(--spacing-sm)';
        row.style.alignItems = 'center';
        row.style.marginBottom = 'var(--spacing-sm)';
        row.innerHTML =
          '<span style="color: var(--color-text-tertiary);width:20px">' + (idx + 1) + '</span>' +
          '<input type="text" class="form-input step-name" style="flex:1" placeholder="环节名称" value="' + st.name + '">' +
          '<select class="form-select step-role" style="width:140px">' +
          '<option value="project_manager"' + (st.role === 'project_manager' ? ' selected' : '') + '>项目主管</option>' +
          '<option value="operation_director"' + (st.role === 'operation_director' ? ' selected' : '') + '>运营总监</option>' +
          '<option value="general_manager"' + (st.role === 'general_manager' ? ' selected' : '') + '>总经理</option>' +
          '<option value="civil_aviation"' + (st.role === 'civil_aviation' ? ' selected' : '') + '>民航局</option>' +
          '</select>' +
          '<span class="text-error" style="cursor:pointer;padding:0 8px" data-idx="' + idx + '">✕</span>';
        stepsContainer.appendChild(row);
      });

      stepsContainer.querySelectorAll('[data-idx]').forEach(function(el) {
        el.onclick = function() {
          var idx = parseInt(el.dataset.idx);
          stepTemplates.splice(idx, 1);
          renderSteps();
        };
      });
    }
    renderSteps();

    Modal.show({
      title: '编辑审批流程',
      content: content,
      confirmText: '保存',
      cancelText: '取消',
      showCancel: true,
      onConfirm: function() {
        var nameVal = document.getElementById('route-edit-name').value.trim();
        var descVal = document.getElementById('route-edit-desc').value.trim();
        var scaleVal = document.getElementById('route-edit-scale').value;
        var specialVal = document.getElementById('route-edit-special').value;

        if (!nameVal) {
          CommonUtils.showToast('请输入规则名称');
          return false;
        }

        var stepInputs = stepsContainer.querySelectorAll('.step-name');
        var roleInputs = stepsContainer.querySelectorAll('.step-role');
        var newSteps = [];
        for (var i = 0; i < stepInputs.length; i++) {
          var n = stepInputs[i].value.trim();
          if (!n) {
            CommonUtils.showToast('请填写所有审批环节名称');
            return false;
          }
          newSteps.push({
            id: i + 1,
            name: n,
            role: roleInputs[i].value
          });
        }

        if (newSteps.length === 0) {
          CommonUtils.showToast('请至少添加一个审批环节');
          return false;
        }

        var newConditions = {};
        if (scaleVal) newConditions.scale = scaleVal;
        if (specialVal) newConditions.isSpecial = specialVal === 'true';

        Store.updateRouteConfig(config.id, {
          name: nameVal,
          description: descVal,
          conditions: newConditions,
          steps: newSteps
        });

        CommonUtils.showToast('保存成功');
        Modal.hideAll();
        setTimeout(refreshPage, 150);
        return true;
      }
    });

    setTimeout(function() {
      var addBtn = document.getElementById('route-add-step');
      if (addBtn) {
        addBtn.onclick = function() {
          stepTemplates.push({ name: '', role: 'project_manager' });
          renderSteps();
        };
      }
    }, 50);
  }

  function refreshPage() {
    var mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    mainContent.innerHTML = '';
    render(mainContent);
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

    var testCard = document.createElement('div');
    testCard.className = 'route-config-card';
    testCard.style.border = '2px dashed var(--color-primary)';
    testCard.style.background = 'var(--color-primary-bg)';

    var testHeader = document.createElement('div');
    testHeader.className = 'flex-between';
    testHeader.style.marginBottom = 'var(--spacing-md)';
    testHeader.innerHTML =
      '<div style="font-weight:var(--font-weight-semibold)">🧪 测试路由匹配测试</div>' +
      '<span class="section-title-extra" id="test-route-btn">开始测试</span>';
    testCard.appendChild(testHeader);

    var testDesc = document.createElement('div');
    testDesc.className = 'text-secondary';
    testDesc.style.fontSize = 'var(--font-size-sm)';
    testDesc.textContent = '选择表演规模和场地，验证系统会自动选择哪条审批链（多条件优先匹配）';
    testCard.appendChild(testDesc);

    listEl.appendChild(testCard);

    var configs = Store.getState().routeConfigs;

    configs.forEach(function(config) {
      var card = renderRouteConfigCard(config);
      listEl.appendChild(card);
    });

    setTimeout(function() {
      var btn = document.getElementById('test-route-btn');
      if (btn) {
        btn.onclick = showRouteMatchTest;
      }
    }, 0);
  }

  function showRouteMatchTest() {
    var content = document.createElement('div');

    content.innerHTML =
      '<div class="form-item">' +
      '<label class="form-label">表演规模</label>' +
      '<select class="form-select" id="test-scale">' +
      '<option value="small">小型</option>' +
      '<option value="medium">中型</option>' +
      '<option value="large" selected>大型</option>' +
      '</select>' +
      '</div>' +
      '<div class="form-item">' +
      '<label class="form-label">特殊场地（天安门/机场等需民航局审批）</label>' +
      '<select class="form-select" id="test-special">' +
      '<option value="false" selected>否（普通场地）</option>' +
      '<option value="true">是（特殊场地）</option>' +
      '</select>' +
      '</div>' +
      '<div id="test-result" style="padding:var(--spacing-lg);background:var(--color-bg-gray);border-radius:var(--radius-md);text-align:center"></div>';

    Modal.show({
      title: '条件路由匹配测试',
      content: content,
      confirmText: '关闭',
      showCancel: false
    });

    setTimeout(function() {
      var s1 = document.getElementById('test-scale');
      var s2 = document.getElementById('test-special');
      if (s1) s1.onchange = calcMatch;
      if (s2) s2.onchange = calcMatch;
      calcMatch();
    }, 50);
  }

  function calcMatch() {
    var s1 = document.getElementById('test-scale');
    var s2 = document.getElementById('test-special');
    var res = document.getElementById('test-result');
    if (!s1 || !s2 || !res) return;
    var cond = {
      scale: document.getElementById('test-scale').value,
      isSpecial: document.getElementById('test-special').value === 'true'
    };
    var matched = Store.getRouteConfigByCondition(cond);
    if (matched) {
      var html = '<div style="font-size:var(--font-size-lg);font-weight:var(--font-weight-semibold);color:var(--color-primary);margin-bottom:var(--spacing-sm)">✅ 匹配：' + matched.name + '</div>';
      html += '<div class="text-secondary" style="font-size:var(--font-size-sm);margin-bottom:var(--spacing-md)">' + matched.description + '</div>';
      html += '<div style="text-align:left">';
      matched.steps.forEach(function (step, idx) {
        html += '<div class="flex-between" style="padding:var(--spacing-xs)0;border-bottom:1px solid var(--color-border-light)">' +
          '<span>' + (idx + 1) + '. ' + step.name + '</span>' +
          '<span class="text-secondary">' + getRoleLabel(step.role) + '</span>' +
          '</div>';
      });
      html += '</div>';
      html += '<div class="text-tertiary" style="font-size:var(--font-size-xs);margin-top:var(--spacing-md)">条件数: ' + Object.keys(matched.conditions).length + ' 个</div>';
      document.getElementById('test-result').innerHTML = html;
    } else {
      document.getElementById('test-result').innerHTML = '<div class="text-error">未匹配到任何流程</div>';
    }
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

    var sectionTitle = document.createElement('div');
    sectionTitle.className = 'section-title';
    sectionTitle.id = 'approval-section-title';
    sectionTitle.innerHTML = '<span>审批列表</span><span class="section-title-extra" id="create-approval-btn">+ 发起审批</span>';
    page.appendChild(sectionTitle);

    var content = document.createElement('div');
    content.id = 'approval-content';
    page.appendChild(content);

    setTimeout(function() {
      var btn = document.getElementById('create-approval-btn');
      if (btn) btn.onclick = showCreateApproval;
    }, 0);

    container.appendChild(page);

    var segItems = segmented.querySelectorAll('.segmented-item');
    segItems.forEach(function(item) {
      item.onclick = function() {
        segItems.forEach(function(i) { i.classList.remove('active'); });
        item.classList.add('active');
        currentView = item.dataset.view;

        var filterTabsEl = document.getElementById('approval-filter-tabs');
        var sectionTitleEl = document.getElementById('approval-section-title');
        if (currentView === 'routes') {
          if (filterTabsEl) filterTabsEl.style.display = 'none';
          if (sectionTitleEl) sectionTitleEl.style.display = 'none';
          renderRouteList();
        } else {
          if (filterTabsEl) filterTabsEl.style.display = 'flex';
          if (sectionTitleEl) sectionTitleEl.style.display = 'flex';
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
