var MockData = (function() {
  var today = new Date();
  
  function getDateStr(daysOffset) {
    var d = new Date(today);
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString();
  }

  function setTime(dateStr, hours, minutes) {
    var d = new Date(dateStr);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  }

  var droneFleets = [
    {
      id: 'fleet_001',
      name: '银河战队',
      droneCount: 500,
      status: 'active',
      type: '表演级',
      baseLocation: '深圳训练基地',
      description: '主力表演机队，适用于大型商演',
      captain: '张伟',
      technicianCount: 8
    },
    {
      id: 'fleet_002',
      name: '星瀚编队',
      droneCount: 300,
      status: 'active',
      type: '中型',
      baseLocation: '北京训练基地',
      description: '中型表演机队，适合中型活动',
      captain: '李明',
      technicianCount: 5
    },
    {
      id: 'fleet_003',
      name: '晨曦小队',
      droneCount: 100,
      status: 'active',
      type: '小型',
      baseLocation: '上海训练基地',
      description: '小型表演机队，适合小型活动和彩排',
      captain: '王芳',
      technicianCount: 3
    },
    {
      id: 'fleet_004',
      name: '雷霆战队',
      droneCount: 800,
      status: 'maintenance',
      type: '超大型',
      baseLocation: '广州训练基地',
      description: '超大型表演机队，适用于重大活动',
      captain: '赵强',
      technicianCount: 12
    }
  ];

  var schedules = [
    {
      id: 'sch_001',
      type: 'performance',
      title: '深圳湾无人机灯光秀',
      startTime: setTime(getDateStr(0), 20, 0),
      endTime: setTime(getDateStr(0), 20, 30),
      fleetId: 'fleet_001',
      fleetName: '银河战队',
      location: '深圳湾体育中心',
      status: 'confirmed',
      client: '深圳市文旅局',
      scale: 'large',
      description: '深圳周末文化活动无人机表演',
      approvalId: 'app_001'
    },
    {
      id: 'sch_002',
      type: 'rehearsal',
      title: '银河战队 - 日常排练',
      startTime: setTime(getDateStr(0), 14, 0),
      endTime: setTime(getDateStr(0), 16, 0),
      fleetId: 'fleet_001',
      fleetName: '银河战队',
      location: '深圳训练基地',
      status: 'confirmed',
      isFromCycle: true,
      ruleId: 'rule_001'
    },
    {
      id: 'sch_003',
      type: 'rehearsal',
      title: '星瀚编队 - 日常排练',
      startTime: setTime(getDateStr(0), 9, 0),
      endTime: setTime(getDateStr(0), 11, 0),
      fleetId: 'fleet_002',
      fleetName: '星瀚编队',
      location: '北京训练基地',
      status: 'confirmed',
      isFromCycle: true,
      ruleId: 'rule_002'
    },
    {
      id: 'sch_004',
      type: 'performance',
      title: '万达广场开业庆典',
      startTime: setTime(getDateStr(2), 19, 30),
      endTime: setTime(getDateStr(2), 20, 0),
      fleetId: 'fleet_002',
      fleetName: '星瀚编队',
      location: '北京朝阳万达广场',
      status: 'pending',
      client: '万达集团',
      scale: 'medium',
      description: '商场开业庆典无人机表演',
      approvalId: 'app_002'
    },
    {
      id: 'sch_005',
      type: 'rehearsal',
      title: '晨曦小队 - 日常排练',
      startTime: setTime(getDateStr(2), 15, 0),
      endTime: setTime(getDateStr(2), 17, 0),
      fleetId: 'fleet_003',
      fleetName: '晨曦小队',
      location: '上海训练基地',
      status: 'confirmed',
      isFromCycle: true,
      ruleId: 'rule_003'
    },
    {
      id: 'sch_006',
      type: 'performance',
      title: '音乐节闭幕式',
      startTime: setTime(getDateStr(5), 21, 0),
      endTime: setTime(getDateStr(5), 21, 20),
      fleetId: 'fleet_001',
      fleetName: '银河战队',
      location: '上海世博公园',
      status: 'approved',
      client: '上海音乐节组委会',
      scale: 'large',
      description: '音乐节闭幕式无人机表演',
      approvalId: 'app_003'
    },
    {
      id: 'sch_007',
      type: 'occupied',
      title: '设备维护保养',
      startTime: setTime(getDateStr(1), 9, 0),
      endTime: setTime(getDateStr(1), 12, 0),
      fleetId: 'fleet_004',
      fleetName: '雷霆战队',
      location: '广州训练基地',
      status: 'confirmed',
      description: '季度设备维护保养'
    },
    {
      id: 'sch_008',
      type: 'performance',
      title: '企业年会表演',
      startTime: setTime(getDateStr(7), 20, 0),
      endTime: setTime(getDateStr(7), 20, 15),
      fleetId: 'fleet_003',
      fleetName: '晨曦小队',
      location: '杭州奥体中心',
      status: 'draft',
      client: '阿里巴巴',
      scale: 'small',
      description: '企业年会无人机表演',
      approvalId: 'app_004'
    },
    {
      id: 'sch_009',
      type: 'rehearsal',
      title: '银河战队 - 强化训练',
      startTime: setTime(getDateStr(4), 10, 0),
      endTime: setTime(getDateStr(4), 13, 0),
      fleetId: 'fleet_001',
      fleetName: '银河战队',
      location: '深圳训练基地',
      status: 'confirmed',
      isFromCycle: true,
      ruleId: 'rule_001'
    },
    {
      id: 'sch_010',
      type: 'performance',
      title: '国庆特别演出',
      startTime: setTime(getDateStr(15), 19, 0),
      endTime: setTime(getDateStr(15), 19, 30),
      fleetId: 'fleet_004',
      fleetName: '雷霆战队',
      location: '天安门广场',
      status: 'pending',
      client: '国庆活动组委会',
      scale: 'large',
      description: '国庆节大型无人机表演',
      approvalId: 'app_005'
    }
  ];

  var cycleRules = [
    {
      id: 'rule_001',
      name: '银河战队周训练计划',
      fleetId: 'fleet_001',
      fleetName: '银河战队',
      location: '深圳训练基地',
      status: 'active',
      weekDays: [
        { day: 1, startTime: '09:00', endTime: '11:00' },
        { day: 2, startTime: '14:00', endTime: '16:00' },
        { day: 3, startTime: '09:00', endTime: '11:00' },
        { day: 4, startTime: '14:00', endTime: '16:00' },
        { day: 5, startTime: '10:00', endTime: '13:00' }
      ],
      description: '每周一、三、五上午，二、四下午进行日常训练',
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'rule_002',
      name: '星瀚编队训练计划',
      fleetId: 'fleet_002',
      fleetName: '星瀚编队',
      location: '北京训练基地',
      status: 'active',
      weekDays: [
        { day: 1, startTime: '09:00', endTime: '11:00' },
        { day: 3, startTime: '14:00', endTime: '17:00' },
        { day: 5, startTime: '09:00', endTime: '12:00' }
      ],
      description: '每周一、三、五进行编队训练',
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'rule_003',
      name: '晨曦小队训练计划',
      fleetId: 'fleet_003',
      fleetName: '晨曦小队',
      location: '上海训练基地',
      status: 'active',
      weekDays: [
        { day: 2, startTime: '15:00', endTime: '17:00' },
        { day: 4, startTime: '15:00', endTime: '17:00' },
        { day: 6, startTime: '10:00', endTime: '12:00' }
      ],
      description: '每周二、四下午，周六上午进行训练',
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'rule_004',
      name: '雷霆战队强化训练',
      fleetId: 'fleet_004',
      fleetName: '雷霆战队',
      location: '广州训练基地',
      status: 'inactive',
      weekDays: [
        { day: 1, startTime: '08:00', endTime: '11:00' },
        { day: 2, startTime: '14:00', endTime: '17:00' },
        { day: 3, startTime: '08:00', endTime: '11:00' },
        { day: 4, startTime: '14:00', endTime: '17:00' },
        { day: 5, startTime: '08:00', endTime: '12:00' }
      ],
      description: '高强度每日训练计划（设备维护中暂不执行）',
      createdAt: '2024-01-01T00:00:00.000Z'
    }
  ];

  var approvals = [
    {
      id: 'app_001',
      title: '深圳湾无人机灯光秀',
      type: 'performance',
      scale: 'large',
      location: '深圳湾体育中心',
      status: 'approved',
      currentStep: 3,
      totalSteps: 3,
      submitter: '张伟',
      submitTime: setTime(getDateStr(-5), 10, 0),
      routeConfigId: 'route_large',
      steps: [
        { id: 1, name: '项目主管审批', status: 'completed', approver: '李经理', time: setTime(getDateStr(-4), 14, 30), comment: '同意，注意安全' },
        { id: 2, name: '运营总监审批', status: 'completed', approver: '王总监', time: setTime(getDateStr(-3), 9, 0), comment: '同意，做好应急预案' },
        { id: 3, name: '总经理审批', status: 'completed', approver: '张总', time: setTime(getDateStr(-2), 16, 0), comment: '同意' }
      ]
    },
    {
      id: 'app_002',
      title: '万达广场开业庆典',
      type: 'performance',
      scale: 'medium',
      location: '北京朝阳万达广场',
      status: 'pending',
      currentStep: 1,
      totalSteps: 2,
      submitter: '李明',
      submitTime: setTime(getDateStr(-1), 11, 0),
      routeConfigId: 'route_medium',
      steps: [
        { id: 1, name: '项目主管审批', status: 'active', approver: '李经理', time: null, comment: null },
        { id: 2, name: '运营总监审批', status: 'pending', approver: null, time: null, comment: null }
      ]
    },
    {
      id: 'app_003',
      title: '音乐节闭幕式',
      type: 'performance',
      scale: 'large',
      location: '上海世博公园',
      status: 'approved',
      currentStep: 3,
      totalSteps: 3,
      submitter: '王芳',
      submitTime: setTime(getDateStr(-10), 15, 0),
      routeConfigId: 'route_large',
      steps: [
        { id: 1, name: '项目主管审批', status: 'completed', approver: '李经理', time: setTime(getDateStr(-9), 10, 0), comment: '同意' },
        { id: 2, name: '运营总监审批', status: 'completed', approver: '王总监', time: setTime(getDateStr(-8), 14, 0), comment: '同意，注意与音乐节流程配合' },
        { id: 3, name: '总经理审批', status: 'completed', approver: '张总', time: setTime(getDateStr(-7), 9, 0), comment: '同意' }
      ]
    },
    {
      id: 'app_004',
      title: '企业年会表演',
      type: 'performance',
      scale: 'small',
      location: '杭州奥体中心',
      status: 'draft',
      currentStep: 0,
      totalSteps: 1,
      submitter: '王芳',
      submitTime: null,
      routeConfigId: 'route_small',
      steps: [
        { id: 1, name: '项目主管审批', status: 'pending', approver: null, time: null, comment: null }
      ]
    },
    {
      id: 'app_005',
      title: '国庆特别演出',
      type: 'performance',
      scale: 'large',
      location: '天安门广场',
      status: 'pending',
      currentStep: 2,
      totalSteps: 4,
      submitter: '赵强',
      submitTime: setTime(getDateStr(-7), 9, 0),
      routeConfigId: 'route_special',
      steps: [
        { id: 1, name: '项目主管审批', status: 'completed', approver: '李经理', time: setTime(getDateStr(-6), 14, 0), comment: '同意' },
        { id: 2, name: '运营总监审批', status: 'active', approver: '王总监', time: null, comment: null },
        { id: 3, name: '总经理审批', status: 'pending', approver: null, time: null, comment: null },
        { id: 4, name: '民航局审批', status: 'pending', approver: null, time: null, comment: null }
      ]
    },
    {
      id: 'app_006',
      title: '科技展开幕式',
      type: 'performance',
      scale: 'medium',
      location: '深圳会展中心',
      status: 'rejected',
      currentStep: 1,
      totalSteps: 2,
      submitter: '张伟',
      submitTime: setTime(getDateStr(-3), 10, 0),
      routeConfigId: 'route_medium',
      steps: [
        { id: 1, name: '项目主管审批', status: 'rejected', approver: '李经理', time: setTime(getDateStr(-2), 16, 0), comment: '档期冲突，无法安排' },
        { id: 2, name: '运营总监审批', status: 'cancelled', approver: null, time: null, comment: null }
      ]
    }
  ];

  var filings = [
    {
      id: 'filing_001',
      title: '深圳湾无人机灯光秀空域申请',
      scheduleId: 'sch_001',
      performanceName: '深圳湾无人机灯光秀',
      location: '深圳湾体育中心上空',
      area: '深圳湾公园至体育中心空域',
      altitude: '100-200米',
      startTime: setTime(getDateStr(0), 19, 0),
      endTime: setTime(getDateStr(0), 21, 0),
      status: 'approved',
      authority: '深圳市民航管理局',
      applicant: '张伟',
      applyTime: setTime(getDateStr(-7), 10, 0),
      approveTime: setTime(getDateStr(-3), 14, 0),
      materials: ['飞行计划书', '无人机资质证明', '安全应急预案', '活动批文'],
      filingNumber: 'SZ-UAV-2024-0618-001'
    },
    {
      id: 'filing_002',
      title: '万达广场开业庆典空域申请',
      scheduleId: 'sch_004',
      performanceName: '万达广场开业庆典',
      location: '北京朝阳万达广场上空',
      area: '万达广场周边1公里空域',
      altitude: '80-150米',
      startTime: setTime(getDateStr(2), 18, 0),
      endTime: setTime(getDateStr(2), 20, 30),
      status: 'pending',
      authority: '北京市民航管理局',
      applicant: '李明',
      applyTime: setTime(getDateStr(-1), 9, 0),
      approveTime: null,
      materials: ['飞行计划书', '无人机资质证明', '安全应急预案'],
      filingNumber: 'BJ-UAV-2024-0620-001'
    },
    {
      id: 'filing_003',
      title: '音乐节闭幕式空域申请',
      scheduleId: 'sch_006',
      performanceName: '音乐节闭幕式',
      location: '上海世博公园上空',
      area: '世博公园及黄浦江沿岸空域',
      altitude: '120-180米',
      startTime: setTime(getDateStr(5), 20, 0),
      endTime: setTime(getDateStr(5), 22, 0),
      status: 'approved',
      authority: '上海市民航管理局',
      applicant: '王芳',
      applyTime: setTime(getDateStr(-10), 14, 0),
      approveTime: setTime(getDateStr(-5), 10, 0),
      materials: ['飞行计划书', '无人机资质证明', '安全应急预案', '活动批文', '保险证明'],
      filingNumber: 'SH-UAV-2024-0623-001'
    },
    {
      id: 'filing_004',
      title: '国庆特别演出空域申请',
      scheduleId: 'sch_010',
      performanceName: '国庆特别演出',
      location: '天安门广场上空',
      area: '天安门广场及长安街沿线空域',
      altitude: '150-300米',
      startTime: setTime(getDateStr(15), 18, 0),
      endTime: setTime(getDateStr(15), 20, 0),
      status: 'reviewing',
      authority: '中国民用航空局',
      applicant: '赵强',
      applyTime: setTime(getDateStr(-5), 9, 0),
      approveTime: null,
      materials: ['飞行计划书', '无人机资质证明', '安全应急预案', '活动批文', '安保方案', '保险证明'],
      filingNumber: 'CAAC-UAV-2024-1001-001'
    },
    {
      id: 'filing_005',
      title: '企业年会空域申请',
      scheduleId: 'sch_008',
      performanceName: '企业年会表演',
      location: '杭州奥体中心上空',
      area: '奥体中心体育场空域',
      altitude: '60-100米',
      startTime: setTime(getDateStr(7), 19, 0),
      endTime: setTime(getDateStr(7), 21, 0),
      status: 'draft',
      authority: '杭州市民航管理局',
      applicant: '王芳',
      applyTime: null,
      approveTime: null,
      materials: ['飞行计划书'],
      filingNumber: null
    }
  ];

  var routeConfigs = [
    {
      id: 'route_large',
      name: '大型表演审批流程',
      isDefault: false,
      conditions: { scale: 'large' },
      description: '适用于大型无人机表演（500架以上）',
      steps: [
        { id: 1, name: '项目主管审批', role: 'project_manager' },
        { id: 2, name: '运营总监审批', role: 'operation_director' },
        { id: 3, name: '总经理审批', role: 'general_manager' }
      ]
    },
    {
      id: 'route_medium',
      name: '中型表演审批流程',
      isDefault: false,
      conditions: { scale: 'medium' },
      description: '适用于中型无人机表演（200-500架）',
      steps: [
        { id: 1, name: '项目主管审批', role: 'project_manager' },
        { id: 2, name: '运营总监审批', role: 'operation_director' }
      ]
    },
    {
      id: 'route_small',
      name: '小型表演审批流程',
      isDefault: false,
      conditions: { scale: 'small' },
      description: '适用于小型无人机表演（200架以下）',
      steps: [
        { id: 1, name: '项目主管审批', role: 'project_manager' }
      ]
    },
    {
      id: 'route_special',
      name: '重大活动审批流程',
      isDefault: false,
      conditions: { scale: 'large', isSpecial: true },
      description: '适用于重大活动和特殊场地表演',
      steps: [
        { id: 1, name: '项目主管审批', role: 'project_manager' },
        { id: 2, name: '运营总监审批', role: 'operation_director' },
        { id: 3, name: '总经理审批', role: 'general_manager' },
        { id: 4, name: '民航局审批', role: 'civil_aviation' }
      ]
    },
    {
      id: 'route_default',
      name: '默认审批流程',
      isDefault: true,
      conditions: {},
      description: '默认审批流程',
      steps: [
        { id: 1, name: '项目主管审批', role: 'project_manager' },
        { id: 2, name: '运营总监审批', role: 'operation_director' }
      ]
    }
  ];

  function getAll() {
    return {
      droneFleets: droneFleets,
      schedules: schedules,
      cycleRules: cycleRules,
      approvals: approvals,
      filings: filings,
      routeConfigs: routeConfigs
    };
  }

  return {
    getAll: getAll,
    droneFleets: droneFleets,
    schedules: schedules,
    cycleRules: cycleRules,
    approvals: approvals,
    filings: filings,
    routeConfigs: routeConfigs
  };
})();
