var DateUtils = (function() {
  var WEEK_DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  var WEEK_DAYS_SHORT = ['日', '一', '二', '三', '四', '五', '六'];

  function padZero(num) {
    return num < 10 ? '0' + num : '' + num;
  }

  function formatDate(date, format) {
    if (!date) return '';
    if (typeof date === 'string' || typeof date === 'number') {
      date = new Date(date);
    }
    if (isNaN(date.getTime())) return '';

    format = format || 'YYYY-MM-DD';

    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var weekDay = date.getDay();

    return format
      .replace(/YYYY/g, year)
      .replace(/MM/g, padZero(month))
      .replace(/DD/g, padZero(day))
      .replace(/HH/g, padZero(hours))
      .replace(/mm/g, padZero(minutes))
      .replace(/ss/g, padZero(seconds))
      .replace(/ww/g, WEEK_DAYS[weekDay])
      .replace(/w/g, WEEK_DAYS_SHORT[weekDay]);
  }

  function parseDate(dateStr) {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return dateStr;
    
    if (typeof dateStr === 'number') {
      return new Date(dateStr);
    }

    var str = String(dateStr).replace(/-/g, '/');
    var date = new Date(str);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  }

  function isSameDay(date1, date2) {
    var d1 = parseDate(date1);
    var d2 = parseDate(date2);
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear()
      && d1.getMonth() === d2.getMonth()
      && d1.getDate() === d2.getDate();
  }

  function isToday(date) {
    return isSameDay(date, new Date());
  }

  function addDays(date, days) {
    var d = parseDate(date);
    if (!d) return null;
    d.setDate(d.getDate() + days);
    return d;
  }

  function addMonths(date, months) {
    var d = parseDate(date);
    if (!d) return null;
    var originalDay = d.getDate();
    d.setMonth(d.getMonth() + months);
    if (d.getDate() !== originalDay) {
      d.setDate(0);
    }
    return d;
  }

  function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  function getFirstDayOfMonth(date) {
    var d = parseDate(date);
    if (!d) return null;
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  function getLastDayOfMonth(date) {
    var d = parseDate(date);
    if (!d) return null;
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
  }

  function getWeekDay(date) {
    var d = parseDate(date);
    if (!d) return '';
    return WEEK_DAYS[d.getDay()];
  }

  function getWeekDayShort(date) {
    var d = parseDate(date);
    if (!d) return '';
    return WEEK_DAYS_SHORT[d.getDay()];
  }

  function diffDays(date1, date2) {
    var d1 = parseDate(date1);
    var d2 = parseDate(date2);
    if (!d1 || !d2) return 0;
    var timeDiff = d1.getTime() - d2.getTime();
    return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  }

  function getCalendarDays(year, month) {
    var days = [];
    var firstDay = new Date(year, month - 1, 1);
    var lastDay = new Date(year, month, 0);
    var totalDays = lastDay.getDate();
    var firstWeekDay = firstDay.getDay();

    var prevMonthLastDay = new Date(year, month - 1, 0).getDate();
    for (var i = firstWeekDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 2, prevMonthLastDay - i),
        day: prevMonthLastDay - i,
        isCurrentMonth: false
      });
    }

    for (var j = 1; j <= totalDays; j++) {
      days.push({
        date: new Date(year, month - 1, j),
        day: j,
        isCurrentMonth: true
      });
    }

    var remainingDays = 42 - days.length;
    for (var k = 1; k <= remainingDays; k++) {
      days.push({
        date: new Date(year, month, k),
        day: k,
        isCurrentMonth: false
      });
    }

    return days;
  }

  function isInRange(date, startDate, endDate) {
    var d = parseDate(date);
    var s = parseDate(startDate);
    var e = parseDate(endDate);
    if (!d || !s || !e) return false;
    return d.getTime() >= s.getTime() && d.getTime() <= e.getTime();
  }

  function formatDuration(minutes) {
    if (!minutes || minutes <= 0) return '0分钟';
    var hours = Math.floor(minutes / 60);
    var mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return hours + '小时' + mins + '分钟';
    } else if (hours > 0) {
      return hours + '小时';
    } else {
      return mins + '分钟';
    }
  }

  function getRelativeTime(date) {
    var d = parseDate(date);
    if (!d) return '';
    
    var now = new Date();
    var diff = now.getTime() - d.getTime();
    var seconds = Math.floor(diff / 1000);
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
    var days = Math.floor(hours / 24);

    if (seconds < 60) {
      return '刚刚';
    } else if (minutes < 60) {
      return minutes + '分钟前';
    } else if (hours < 24) {
      return hours + '小时前';
    } else if (days < 7) {
      return days + '天前';
    } else {
      return formatDate(d, 'MM-DD');
    }
  }

  return {
    padZero: padZero,
    formatDate: formatDate,
    parseDate: parseDate,
    isSameDay: isSameDay,
    isToday: isToday,
    addDays: addDays,
    addMonths: addMonths,
    getDaysInMonth: getDaysInMonth,
    getFirstDayOfMonth: getFirstDayOfMonth,
    getLastDayOfMonth: getLastDayOfMonth,
    getWeekDay: getWeekDay,
    getWeekDayShort: getWeekDayShort,
    diffDays: diffDays,
    getCalendarDays: getCalendarDays,
    isInRange: isInRange,
    formatDuration: formatDuration,
    getRelativeTime: getRelativeTime,
    WEEK_DAYS: WEEK_DAYS,
    WEEK_DAYS_SHORT: WEEK_DAYS_SHORT
  };
})();
