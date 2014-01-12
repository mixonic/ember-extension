window.addEventListener('message', function(event) {
  if (event.data === 'debugger-client') {
    var port = event.ports[0];
    listenToPort(port);
  } else if (event.data.type) {
    chrome.extension.sendMessage(event.data);
  }
});

function listenToPort(port) {
  port.addEventListener('message', function(event) {
    chrome.extension.sendMessage(event.data);
  });

  chrome.extension.onMessage.addListener(function(message) {
    if (message.from === 'devtools') {
      port.postMessage(message);
    }
  });

  port.start();
}

// let ember-debug know that content script has executed
if (document.body) {
  document.body.dataset.emberExtension = 1;
}

// clear a possible previous Ember icon
chrome.extension.sendMessage({ type: 'resetEmberIcon' });

// inject JS into the page to check for an app on domready
var script = document.createElement('script');
script.type = "text/javascript";
script.text = "if (window.jQuery) window.jQuery(function(){"+
  "var version = window.Ember && window.Ember.VERSION;"+
  "if (version) {"+
    "var versions = {"+
      "ember: version,"+
      "jquery: jQuery.fn.jquery,"+
      "handlebars: Handlebars.VERSION"+
    "};"+
    "if (window.DS) versions.data = window.DS.VERSION;"+
    "window.postMessage({"+
      "type: 'emberVersion',"+
      "versions: versions"+
    "}, '*');"+
  "}"+
"});";
if (document.body) document.body.appendChild(script);
