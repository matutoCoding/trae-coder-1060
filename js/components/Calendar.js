var Calendar = (function() {
  function create(options) {
    options = options || {};
    var currentDate = options.date ? new Date(options.date) : new Date();
    var selectedDate = options.selectedDate ? new Date(options.selectedDate) : null;
    var onDateSelect = options.onDateSelect || null;
    var scheduleData = options.scheduleData || {};

    var el = document.createElement('div');
    el.className = 'calendar';

    function render() {
      el.innerHTML = '';

      var header = document.createElement('div');
      header.className = 'calendar-header';

      var nav = document.createElement('div');
      nav.className = 'calendar-nav';

      var prevBtn = document.createElement('div');
      prevBtn.className = 'calendar-nav-btn';
      prevBtn.textContent = '‹';
      prevBtn.onclick = function() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        render();
      };
      nav.appendChild(prevBtn);

      var title = document.createElement('div');
      title.className = 'calendar-title';
      title.textContent = currentDate.getFullYear() + '年' + (currentDate.getMonth() + 1) + '月';
      nav.appendChild(title);

      var nextBtn = document.createElement('div');
      nextBtn.className = 'calendar-nav-btn';
      nextBtn.textContent = '›';
      nextBtn.onclick = function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        render();
      };
      nav.appendChild(nextBtn);

      header.appendChild(nav);

      var todayBtn = document.createElement('div');
      todayBtn.className = 'calendar-today-btn';
      todayBtn.textContent = '今天';
      todayBtn.onclick = function() {
        currentDate = new Date();
        selectedDate = new Date();
        render();
        if (onDateSelect) {
          onDateSelect(new Date());
        }
      };
      header.appendChild(todayBtn);

      el.appendChild(header);

      var weekdays = document.createElement('div');
      weekdays.className = 'calendar-weekdays';
      var weekdayNames = ['日', '一', '二', '三', '四', '五', '六'];
      weekdayNames.forEach(function(name) {
        var day = document.createElement('div');
        day.className = 'calendar-weekday';
        day.textContent = name;
        weekdays.appendChild(day);
      });
      el.appendChild(weekdays);

      var daysContainer = document.createElement('div');
      daysContainer.className = 'calendar-days';

      var year = currentDate.getFullYear();
      var month = currentDate.getMonth() + 1;
      var calendarDays = DateUtils.getCalendarDays(year, month);

      calendarDays.forEach(function(dayInfo) {
        var dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';

        if (!dayInfo.isCurrentMonth) {
          dayEl.classList.add('other-month');
        }

        if (DateUtils.isToday(dayInfo.date)) {
          dayEl.classList.add('today');
        }

        if (selectedDate && DateUtils.isSameDay(dayInfo.date, selectedDate)) {
          dayEl.classList.add('selected');
        }

        var dayNum = document.createElement('span');
        dayNum.textContent = dayInfo.day;
        dayEl.appendChild(dayNum);

        var dateKey = DateUtils.formatDate(dayInfo.date, 'YYYY-MM-DD');
        var daySchedules = scheduleData[dateKey];
        if (daySchedules && daySchedules.length > 0) {
          var dots = document.createElement('div');
          dots.className = 'calendar-day-dots';

          var types = [];
          daySchedules.forEach(function(s) {
            if (types.indexOf(s.type) === -1) {
              types.push(s.type);
            }
          });

          types.slice(0, 3).forEach(function(type) {
            var dot = document.createElement('span');
            dot.className = 'calendar-day-dot ' + type;
            dots.appendChild(dot);
          });

          dayEl.appendChild(dots);
        }

        dayEl.onclick = function() {
          selectedDate = new Date(dayInfo.date);
          render();
          if (onDateSelect) {
            onDateSelect(new Date(dayInfo.date));
          }
        };

        daysContainer.appendChild(dayEl);
      });

      el.appendChild(daysContainer);
    }

    render();

    el.getSelectedDate = function() {
      return selectedDate;
    };

    el.setScheduleData = function(data) {
      scheduleData = data;
      render();
    };

    el.setSelectedDate = function(date) {
      selectedDate = date ? new Date(date) : null;
      if (selectedDate) {
        currentDate = new Date(selectedDate);
      }
      render();
    };

    return el;
  }

  function render(container, options) {
    var calendar = create(options);
    container.appendChild(calendar);
    return calendar;
  }

  return {
    create: create,
    render: render
  };
})();
