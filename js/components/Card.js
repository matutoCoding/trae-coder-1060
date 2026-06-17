var Card = (function() {
  function create(options) {
    options = options || {};
    var el = document.createElement('div');
    el.className = 'card';

    if (options.title || options.extra) {
      var header = document.createElement('div');
      header.className = 'card-header';

      if (options.title) {
        var title = document.createElement('div');
        title.className = 'card-title';
        title.textContent = options.title;
        header.appendChild(title);
      }

      if (options.extra) {
        var extra = document.createElement('div');
        extra.className = 'card-extra';
        if (typeof options.extra === 'string') {
          extra.textContent = options.extra;
        } else if (options.extra instanceof Node) {
          extra.appendChild(options.extra);
        }
        header.appendChild(extra);
      }

      el.appendChild(header);
    }

    var body = document.createElement('div');
    body.className = 'card-body';
    el.appendChild(body);

    el.getBody = function() {
      return body;
    };

    return el;
  }

  function render(container, options) {
    var card = create(options);
    container.appendChild(card);
    return card;
  }

  return {
    create: create,
    render: render
  };
})();
