'use strict';

var isSite = (window.location.href.indexOf('draggable.github.io') !== -1);
var isRTD = (window.location.href.indexOf('formeo.readthedocs.io') !== -1);

((window.gitter = {}).chat = {}).options = {
  room: 'draggable/formeo'
};

var getStyles = function() {
  var styles = [];
  var extStyles = [
    '//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.2.0/styles/monokai-sublime.min.css',
  ];
  for (var i = extStyles.length - 1; i >= 0; i--) {
    var style = document.createElement('link');
    style.appendChild(document.createTextNode(''));
    style.setAttribute('href', extStyles[i]);
    style.setAttribute('rel', 'stylesheet');
    style.setAttribute('type', 'text/css');
    document.head.appendChild(style);
    styles.push(style);
  }
  return styles;
};

var getScripts = function() {
  var scripts = [];
  var extScripts = [
    '//assets.codepen.io/assets/embed/ei.js'
  ];

  if (isSite || isRTD) {
    extScripts = extScripts.push('//sidecar.gitter.im/dist/sidecar.v1.js');
  }

  var i = (extScripts.length - 1);

  function readyState() {
    var script = this;
    if (!script.readyState || script.readyState === 'loaded' || script.readyState === 'complete') {
      script.onload = script.onreadystatechange = null;
      i--;
      if (i === -1) {
        // remove script after added
        for (i = scripts.length - 1; i >= 0; i--) {
          scripts[i].remove();
        }
      } else {
        getScript(i);
      }
    }
  }

  function getScript(i) {
    var script = document.createElement('script');
    script.appendChild(document.createTextNode(''));
    script.setAttribute('src', extScripts[i]);
    script.setAttribute('type', 'text/javascript');
    script.async = true;
    // Attach handlers for all browsers
    script.onload = script.onreadystatechange = readyState;
    // siteScript.parentNode.insertBefore(script, siteScript.nextSibling);
    scripts.push(script);
    document.head.appendChild(script);
  }

  getScript(i);

};

getStyles();
getScripts();

document.addEventListener('viewData', function() {
  var code = document.querySelector('.data-dialog code');
  window.hljs.highlightBlock(code);
}, false);

if (isSite) {
  (function(i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function() {
      (i[r].q = i[r].q || []).push(arguments);
    }, i[r].l = 1 * new Date();
    a = s.createElement(o),
      m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m);
  })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

  ga('create', 'UA-79014176-2', 'auto');
  ga('send', 'pageview');
}
