var ApprovalFlow = (function() {
  function create(steps) {
    steps = steps || [];

    var el = document.createElement('div');
    el.className = 'approval-flow';

    function getStatusText(status) {
      switch (status) {
        case 'completed': return '✓';
        case 'active': return '';
        case 'pending': return '';
        case 'rejected': return '✕';
        case 'cancelled': return '—';
        default: return '';
      }
    }

    function render() {
      el.innerHTML = '';

      var stepsContainer = document.createElement('div');
      stepsContainer.className = 'approval-flow-steps';

      steps.forEach(function(step, index) {
        var stepEl = document.createElement('div');
        stepEl.className = 'approval-flow-step ' + (step.status || 'pending');

        var indicator = document.createElement('div');
        indicator.className = 'approval-flow-step-indicator';
        indicator.textContent = step.status === 'completed' ? '✓' : (index + 1);
        stepEl.appendChild(indicator);

        var line = document.createElement('div');
        line.className = 'approval-flow-step-line';
        stepEl.appendChild(line);

        var content = document.createElement('div');
        content.className = 'approval-flow-step-content';

        var title = document.createElement('div');
        title.className = 'approval-flow-step-title';
        title.textContent = step.name;
        content.appendChild(title);

        if (step.approver) {
          var desc = document.createElement('div');
          desc.className = 'approval-flow-step-desc';
          desc.textContent = step.approver;
          content.appendChild(desc);
        }

        if (step.comment) {
          var comment = document.createElement('div');
          comment.className = 'approval-flow-step-desc';
          comment.style.color = 'var(--color-text-secondary)';
          comment.style.marginTop = '4px';
          comment.textContent = '\"' + step.comment + '\"';
          content.appendChild(comment);
        }

        if (step.time) {
          var time = document.createElement('div');
          time.className = 'approval-flow-step-time';
          time.textContent = DateUtils.formatDate(step.time, 'MM-DD HH:mm');
          content.appendChild(time);
        }

        stepEl.appendChild(content);
        stepsContainer.appendChild(stepEl);
      });

      el.appendChild(stepsContainer);
    }

    render();

    el.setSteps = function(newSteps) {
      steps = newSteps || [];
      render();
    };

    return el;
  }

  function render(container, steps) {
    var flow = create(steps);
    container.appendChild(flow);
    return flow;
  }

  return {
    create: create,
    render: render
  };
})();
