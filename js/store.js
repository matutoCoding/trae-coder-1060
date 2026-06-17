var Store = (function() {
  var STORAGE_KEY = 'drone_schedule_data_v1';

  var state = {
    currentPage: 'schedule',
    schedules: [],
    droneFleets: [],
    cycleRules: [],
    approvals: [],
    filings: [],
    routeConfigs: [],
    selectedDate: new Date(),
    filterType: 'all'
  };

  var listeners = {};

  function persist() {
    try {
      var data = {
        schedules: state.schedules,
        droneFleets: state.droneFleets,
        cycleRules: state.cycleRules,
        approvals: state.approvals,
        filings: state.filings,
        routeConfigs: state.routeConfigs
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('[Store] Persist failed:', e);
    }
  }

  function loadFromStorage() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var data = JSON.parse(raw);
        return data;
      }
    } catch (e) {
      console.error('[Store] Load failed:', e);
    }
    return null;
  }

  function getState() {
    return state;
  }

  function setState(partialState, shouldPersist) {
    for (var key in partialState) {
      if (partialState.hasOwnProperty(key)) {
        state[key] = partialState[key];
      }
    }
    if (shouldPersist !== false) {
      persist();
    }
    notify(partialState);
  }

  function subscribe(event, callback) {
    if (!listeners[event]) {
      listeners[event] = [];
    }
    listeners[event].push(callback);
    return function() {
      unsubscribe(event, callback);
    };
  }

  function unsubscribe(event, callback) {
    if (listeners[event]) {
      var index = listeners[event].indexOf(callback);
      if (index > -1) {
        listeners[event].splice(index, 1);
      }
    }
  }

  function notify(partialState) {
    for (var key in partialState) {
      if (partialState.hasOwnProperty(key) && listeners[key]) {
        listeners[key].forEach(function(callback) {
          try {
            callback(state[key], state);
          } catch (e) {
            console.error('[Store] Listener error:', e);
          }
        });
      }
    }
    if (listeners['*']) {
      listeners['*'].forEach(function(callback) {
        try {
          callback(state);
        } catch (e) {
          console.error('[Store] Listener error:', e);
        }
      });
    }
  }

  function init(mockData) {
    var stored = loadFromStorage();
    var data = stored || mockData || {};

    setState({
      schedules: data.schedules || [],
      droneFleets: data.droneFleets || [],
      cycleRules: data.cycleRules || [],
      approvals: data.approvals || [],
      filings: data.filings || [],
      routeConfigs: data.routeConfigs || []
    }, !stored);

    if (stored) {
      console.log('[Store] Loaded data from localStorage');
    } else {
      console.log('[Store] Initialized with mock data');
    }
  }

  function resetToDefault(mockData) {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    if (mockData) {
      setState({
        schedules: mockData.schedules || [],
        droneFleets: mockData.droneFleets || [],
        cycleRules: mockData.cycleRules || [],
        approvals: mockData.approvals || [],
        filings: mockData.filings || [],
        routeConfigs: mockData.routeConfigs || []
      });
    }
  }

  function getSchedulesByDate(date) {
    var targetDate = DateUtils.parseDate(date);
    if (!targetDate) return [];

    return state.schedules.filter(function(schedule) {
      return DateUtils.isSameDay(schedule.startTime, targetDate);
    }).sort(function(a, b) {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
  }

  function getScheduleById(id) {
    return state.schedules.find(function(s) { return s.id === id; }) || null;
  }

  function addSchedule(schedule) {
    var newSchedule = Object.assign({
      id: CommonUtils.generateId('schedule'),
      createdAt: new Date().toISOString()
    }, schedule);
    state.schedules.push(newSchedule);
    setState({ schedules: state.schedules });
    return newSchedule;
  }

  function addSchedulesBatch(schedules) {
    var newSchedules = schedules.map(function(s) {
      return Object.assign({
        id: CommonUtils.generateId('schedule'),
        createdAt: new Date().toISOString()
      }, s);
    });
    state.schedules = state.schedules.concat(newSchedules);
    setState({ schedules: state.schedules });
    return newSchedules;
  }

  function updateSchedule(id, updates) {
    var index = state.schedules.findIndex(function(s) { return s.id === id; });
    if (index > -1) {
      state.schedules[index] = Object.assign({}, state.schedules[index], updates);
      setState({ schedules: state.schedules });
      return state.schedules[index];
    }
    return null;
  }

  function deleteSchedule(id) {
    var index = state.schedules.findIndex(function(s) { return s.id === id; });
    if (index > -1) {
      state.schedules.splice(index, 1);
      setState({ schedules: state.schedules });
      return true;
    }
    return false;
  }

  function getApprovalById(id) {
    return state.approvals.find(function(a) { return a.id === id; }) || null;
  }

  function addApproval(approval) {
    var newApproval = Object.assign({
      id: CommonUtils.generateId('approval'),
      createdAt: new Date().toISOString()
    }, approval);
    state.approvals.push(newApproval);
    setState({ approvals: state.approvals });
    return newApproval;
  }

  function updateApproval(id, updates) {
    var index = state.approvals.findIndex(function(a) { return a.id === id; });
    if (index > -1) {
      state.approvals[index] = Object.assign({}, state.approvals[index], updates);
      setState({ approvals: state.approvals });
      return state.approvals[index];
    }
    return null;
  }

  function getFilingById(id) {
    return state.filings.find(function(f) { return f.id === id; }) || null;
  }

  function addFiling(filing) {
    var newFiling = Object.assign({
      id: CommonUtils.generateId('filing'),
      createdAt: new Date().toISOString()
    }, filing);
    state.filings.push(newFiling);
    setState({ filings: state.filings });
    return newFiling;
  }

  function updateFiling(id, updates) {
    var index = state.filings.findIndex(function(f) { return f.id === id; });
    if (index > -1) {
      state.filings[index] = Object.assign({}, state.filings[index], updates);
      setState({ filings: state.filings });
      return state.filings[index];
    }
    return null;
  }

  function getCycleRuleById(id) {
    return state.cycleRules.find(function(r) { return r.id === id; }) || null;
  }

  function updateCycleRule(id, updates) {
    var index = state.cycleRules.findIndex(function(r) { return r.id === id; });
    if (index > -1) {
      state.cycleRules[index] = Object.assign({}, state.cycleRules[index], updates);
      setState({ cycleRules: state.cycleRules });
      return state.cycleRules[index];
    }
    return null;
  }

  function getRouteConfigById(id) {
    return state.routeConfigs.find(function(r) { return r.id === id; }) || null;
  }

  function updateRouteConfig(id, updates) {
    var index = state.routeConfigs.findIndex(function(r) { return r.id === id; });
    if (index > -1) {
      state.routeConfigs[index] = Object.assign({}, state.routeConfigs[index], updates);
      setState({ routeConfigs: state.routeConfigs });
      return state.routeConfigs[index];
    }
    return null;
  }

  function generateCycleOccupancies(ruleId, startDate, endDate) {
    var rule = getCycleRuleById(ruleId);
    if (!rule) return [];

    var start = DateUtils.parseDate(startDate);
    var end = DateUtils.parseDate(endDate);
    if (!start || !end || start > end) return [];

    var occupancies = [];
    var current = new Date(start);

    while (current <= end) {
      var weekDay = current.getDay();
      var dayRules = rule.weekDays.filter(function(wd) { return wd.day === weekDay; });

      dayRules.forEach(function(dayRule) {
        var startTime = new Date(current);
        var startParts = dayRule.startTime.split(':');
        startTime.setHours(parseInt(startParts[0]), parseInt(startParts[1]), 0, 0);

        var endTime = new Date(current);
        var endParts = dayRule.endTime.split(':');
        endTime.setHours(parseInt(endParts[0]), parseInt(endParts[1]), 0, 0);

        var fleet = state.droneFleets.find(function(f) { return f.id === rule.fleetId; });

        occupancies.push({
          type: 'rehearsal',
          title: rule.name + ' - 排练',
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          fleetId: rule.fleetId,
          fleetName: fleet ? fleet.name : '',
          ruleId: ruleId,
          location: rule.location || '训练基地',
          status: 'confirmed',
          isFromCycle: true
        });
      });

      current.setDate(current.getDate() + 1);
    }

    return occupancies;
  }

  function getRouteConfigByCondition(conditions) {
    var matchedConfigs = [];

    for (var i = 0; i < state.routeConfigs.length; i++) {
      var config = state.routeConfigs[i];
      if (config.isDefault) continue;

      var match = true;
      var conditionCount = 0;

      for (var key in config.conditions) {
        if (config.conditions.hasOwnProperty(key)) {
          conditionCount++;
          if (conditions[key] !== config.conditions[key]) {
            match = false;
            break;
          }
        }
      }

      if (match && conditionCount > 0) {
        matchedConfigs.push({
          config: config,
          conditionCount: conditionCount
        });
      }
    }

    if (matchedConfigs.length > 0) {
      matchedConfigs.sort(function(a, b) {
        return b.conditionCount - a.conditionCount;
      });
      return matchedConfigs[0].config;
    }

    return state.routeConfigs.find(function(c) { return c.isDefault; }) || null;
  }

  return {
    getState: getState,
    setState: setState,
    subscribe: subscribe,
    unsubscribe: unsubscribe,
    init: init,
    resetToDefault: resetToDefault,
    getSchedulesByDate: getSchedulesByDate,
    getScheduleById: getScheduleById,
    addSchedule: addSchedule,
    addSchedulesBatch: addSchedulesBatch,
    updateSchedule: updateSchedule,
    deleteSchedule: deleteSchedule,
    getApprovalById: getApprovalById,
    addApproval: addApproval,
    updateApproval: updateApproval,
    getFilingById: getFilingById,
    addFiling: addFiling,
    updateFiling: updateFiling,
    getCycleRuleById: getCycleRuleById,
    updateCycleRule: updateCycleRule,
    getRouteConfigById: getRouteConfigById,
    updateRouteConfig: updateRouteConfig,
    generateCycleOccupancies: generateCycleOccupancies,
    getRouteConfigByCondition: getRouteConfigByCondition
  };
})();
