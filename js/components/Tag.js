var Tag = (function() {
  function create(text, type) {
    type = type || 'default';
    var el = document.createElement('span');
    el.className = 'tag tag-' + type;
    el.textContent = text;
    return el;
  }

  function render(container, text, type) {
    var tag = create(text, type);
    container.appendChild(tag);
    return tag;
  }

  return {
    create: create,
    render: render
  };
})();
