var Modal = (function() {
  var container = null;

  function init() {
    if (!container) {
      container = document.getElementById('modal-container');
    }
  }

  function getAllMasks() {
    init();
    if (!container) return [];
    return Array.prototype.slice.call(container.querySelectorAll('.modal-mask'));
  }

  function show(options) {
    init();
    if (!container) return null;

    options = options || {};

    var mask = document.createElement('div');
    mask.className = 'modal-mask';

    var content = document.createElement('div');
    content.className = 'modal-content';

    if (options.title) {
      var title = document.createElement('div');
      title.className = 'modal-title';
      title.textContent = options.title;
      content.appendChild(title);
    }

    if (options.content) {
      var body = document.createElement('div');
      body.className = 'modal-body';
      if (typeof options.content === 'string') {
        body.textContent = options.content;
      } else if (options.content instanceof Node) {
        body.appendChild(options.content);
      }
      content.appendChild(body);
    }

    var footer = document.createElement('div');
    footer.className = 'modal-footer';

    if (options.showCancel !== false) {
      var cancelBtn = document.createElement('button');
      cancelBtn.className = 'btn btn-secondary';
      cancelBtn.textContent = options.cancelText || '取消';
      cancelBtn.onclick = function() {
        if (options.onCancel) {
          options.onCancel();
        }
        hide(mask);
      };
      footer.appendChild(cancelBtn);
    }

    if (options.showConfirm !== false) {
      var confirmBtn = document.createElement('button');
      confirmBtn.className = 'btn btn-primary';
      confirmBtn.textContent = options.confirmText || '确定';
      confirmBtn.onclick = function() {
        if (options.onConfirm) {
          var result = options.onConfirm();
          if (result !== false) {
            hide(mask);
          }
        } else {
          hide(mask);
        }
      };
      footer.appendChild(confirmBtn);
    }

    content.appendChild(footer);
    mask.appendChild(content);

    mask.addEventListener('click', function(e) {
      if (e.target === mask && options.closeOnMaskClick !== false) {
        hide(mask);
      }
    });

    container.appendChild(mask);

    requestAnimationFrame(function() {
      mask.classList.add('show');
    });

    return mask;
  }

  function hide(mask) {
    init();
    var targetMask = mask;
    if (!targetMask) {
      var masks = getAllMasks();
      if (masks.length === 0) return;
      targetMask = masks[masks.length - 1];
    }
    if (!targetMask || !targetMask.classList) return;
    targetMask.classList.remove('show');
    setTimeout(function() {
      if (targetMask.parentNode) {
        targetMask.parentNode.removeChild(targetMask);
      }
    }, 300);
  }

  function hideAll() {
    var masks = getAllMasks();
    for (var i = masks.length - 1; i >= 0; i--) {
      (function(m) {
        m.classList.remove('show');
        setTimeout(function() {
          if (m.parentNode) {
            m.parentNode.removeChild(m);
          }
        }, 300);
      })(masks[i]);
    }
  }

  function alert(message, callback) {
    return show({
      title: '提示',
      content: message,
      showCancel: false,
      onConfirm: callback
    });
  }

  function confirm(message, onConfirm, onCancel) {
    return show({
      title: '确认',
      content: message,
      showCancel: true,
      onConfirm: onConfirm,
      onCancel: onCancel
    });
  }

  return {
    show: show,
    hide: hide,
    hideAll: hideAll,
    alert: alert,
    confirm: confirm
  };
})();
