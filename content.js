/* Applique les textes modifiés depuis /edit (si présents) sur les éléments [data-edit].
   Les textes par défaut restent dans le HTML : sans réseau, le site s'affiche normalement.
   Mini-balisage : *mot* = mot en italique accentué, retour à la ligne = <br>. */
(function () {
  function render(el, text) {
    el.textContent = '';
    text.split('\n').forEach(function (line, i) {
      if (i) el.appendChild(document.createElement('br'));
      line.split(/(\*[^*]+\*)/).forEach(function (part) {
        if (/^\*[^*]+\*$/.test(part)) {
          var em = document.createElement('em');
          em.textContent = part.slice(1, -1);
          el.appendChild(em);
        } else if (part) {
          el.appendChild(document.createTextNode(part));
        }
      });
    });
  }
  fetch('/api/content')
    .then(function (r) { return r.ok ? r.json() : {}; })
    .then(function (data) {
      Object.keys(data).forEach(function (key) {
        var el = document.querySelector('[data-edit="' + key + '"]');
        if (el && typeof data[key] === 'string' && data[key]) render(el, data[key]);
      });
    })
    .catch(function () {});
})();
