var CommonUtils = (function() {
  function generateId(prefix) {
    prefix = prefix || 'id';
    return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(deepClone);
    }
    var cloned = {};
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }

  function formatNumber(num, decimals) {
    decimals = decimals || 0;
    return Number(num).toFixed(decimals);
  }

  function debounce(fn, delay) {
    var timer = null;
    return function() {
      var context = this;
      var args = arguments;
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(function() {
        fn.apply(context, args);
      }, delay);
    };
  }

  function throttle(fn, delay) {
    var lastTime = 0;
    return function() {
      var context = this;
      var args = arguments;
      var now = Date.now();
      if (now - lastTime >= delay) {
        lastTime = now;
        fn.apply(context, args);
      }
    };
  }

  function showToast(message, duration) {
    duration = duration || 2000;
    var container = document.getElementById('toast-container');
    if (!container) return;

    var toast = document.createElement('div');
    toast.className = 'toast show';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(function() {
      toast.classList.remove('show');
      setTimeout(function() {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  }

  function createElement(tagName, className, attrs) {
    var el = document.createElement(tagName);
    if (className) {
      el.className = className;
    }
    if (attrs && typeof attrs === 'object') {
      for (var key in attrs) {
        if (attrs.hasOwnProperty(key)) {
          if (key === 'text') {
            el.textContent = attrs[key];
          } else if (key === 'html') {
            el.innerHTML = attrs[key];
          } else {
            el.setAttribute(key, attrs[key]);
          }
        }
      }
    }
    return el;
  }

  function removeElement(el) {
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }

  function addEvent(el, event, handler) {
    if (el && el.addEventListener) {
      el.addEventListener(event, handler, false);
    }
  }

  function removeEvent(el, event, handler) {
    if (el && el.removeEventListener) {
      el.removeEventListener(event, handler, false);
    }
  }

  function getQueryParam(name) {
    var search = window.location.search.substring(1);
    var params = search.split('&');
    for (var i = 0; i < params.length; i++) {
      var pair = params[i].split('=');
      if (pair[0] === name) {
        return decodeURIComponent(pair[1]);
      }
    }
    return null;
  }

  function storageSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('[Storage] Set error:', e);
      return false;
    }
  }

  function storageGet(key, defaultValue) {
    try {
      var value = localStorage.getItem(key);
      if (value === null) {
        return defaultValue;
      }
      return JSON.parse(value);
    } catch (e) {
      console.error('[Storage] Get error:', e);
      return defaultValue;
    }
  }

  function storageRemove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('[Storage] Remove error:', e);
      return false;
    }
  }

  return {
    generateId: generateId,
    deepClone: deepClone,
    formatNumber: formatNumber,
    debounce: debounce,
    throttle: throttle,
    showToast: showToast,
    createElement: createElement,
    removeElement: removeElement,
    addEvent: addEvent,
    removeEvent: removeEvent,
    getQueryParam: getQueryParam,
    storageSet: storageSet,
    storageGet: storageGet,
    storageRemove: storageRemove
  };
})();
