var Modal = (function() {
  var container = null;

  function init() {
    if (!container) {
      container = document.getElementById('modal-container');
    }
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
    if (!mask) return;
    mask.classList.remove('show');
    setTimeout(function() {
      if (mask.parentNode) {
        mask.parentNode.removeChild(mask);
      }
    }, 300);
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
    alert: alert,
    confirm: confirm
  };
})();
