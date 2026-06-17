var Store = (function() {
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

  function getState() {
    return state;
  }

  function setState(partialState) {
    for (var key in partialState) {
      if (partialState.hasOwnProperty(key)) {
        state[key] = partialState[key];
      }
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
    notify({ schedules: state.schedules });
    return newSchedule;
  }

  function updateSchedule(id, updates) {
    var index = state.schedules.findIndex(function(s) { return s.id === id; });
    if (index > -1) {
      state.schedules[index] = Object.assign({}, state.schedules[index], updates);
      notify({ schedules: state.schedules });
      return state.schedules[index];
    }
    return null;
  }

  function deleteSchedule(id) {
    var index = state.schedules.findIndex(function(s) { return s.id === id; });
    if (index > -1) {
      state.schedules.splice(index, 1);
      notify({ schedules: state.schedules });
      return true;
    }
    return false;
  }

  function getApprovalById(id) {
    return state.approvals.find(function(a) { return a.id === id; }) || null;
  }

  function updateApproval(id, updates) {
    var index = state.approvals.findIndex(function(a) { return a.id === id; });
    if (index > -1) {
      state.approvals[index] = Object.assign({}, state.approvals[index], updates);
      notify({ approvals: state.approvals });
      return state.approvals[index];
    }
    return null;
  }

  function getFilingById(id) {
    return state.filings.find(function(f) { return f.id === id; }) || null;
  }

  function getCycleRuleById(id) {
    return state.cycleRules.find(function(r) { return r.id === id; }) || null;
  }

  function updateCycleRule(id, updates) {
    var index = state.cycleRules.findIndex(function(r) { return r.id === id; });
    if (index > -1) {
      state.cycleRules[index] = Object.assign({}, state.cycleRules[index], updates);
      notify({ cycleRules: state.cycleRules });
      return state.cycleRules[index];
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
        
        occupancies.push({
          id: CommonUtils.generateId('occupancy'),
          type: 'rehearsal',
          title: rule.name + ' - 排练',
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          fleetId: rule.fleetId,
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
    for (var i = 0; i < state.routeConfigs.length; i++) {
      var config = state.routeConfigs[i];
      var match = true;
      
      for (var key in config.conditions) {
        if (config.conditions.hasOwnProperty(key)) {
          if (conditions[key] !== config.conditions[key]) {
            match = false;
            break;
          }
        }
      }
      
      if (match) {
        return config;
      }
    }
    return state.routeConfigs.find(function(c) { return c.isDefault; }) || null;
  }

  return {
    getState: getState,
    setState: setState,
    subscribe: subscribe,
    unsubscribe: unsubscribe,
    init: init,
    getSchedulesByDate: getSchedulesByDate,
    getScheduleById: getScheduleById,
    addSchedule: addSchedule,
    updateSchedule: updateSchedule,
    deleteSchedule: deleteSchedule,
    getApprovalById: getApprovalById,
    updateApproval: updateApproval,
    getFilingById: getFilingById,
    getCycleRuleById: getCycleRuleById,
    updateCycleRule: updateCycleRule,
    generateCycleOccupancies: generateCycleOccupancies,
    getRouteConfigByCondition: getRouteConfigByCondition
  };
})();
