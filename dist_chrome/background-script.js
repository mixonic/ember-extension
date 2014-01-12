/*global chrome*/

function showAction(tabId, versions){
  chrome.pageAction.show(tabId);
  chrome.pageAction.setTitle({tabId: tabId, title: ""+
    "Ember "+versions.ember+"\n"+
    "Handlebars "+versions.handlebars+"\n"+
    "jQuery "+versions.jquery+
    (versions.data ? "\nEmber-Data "+versions.data : '')
  });
}

function hideAction(tabId){
  chrome.pageAction.hide(tabId);
}

chrome.extension.onMessage.addListener(function(request, sender) {
  if (!sender.tab) {
    // noop
  } else if (request && request.type === 'emberVersion') {
    showAction(sender.tab.id, request.versions);
  } else if (request && request.type === 'resetEmberIcon') {
    hideAction(sender.tab.id);
  } else {
    var port = ports[sender.tab.id];
    if (port) { port.postMessage(request); }
  }
});

var ports = {};

chrome.extension.onConnect.addListener(function(port) {
  var appId;

  port.onMessage.addListener(function(message) {
    if (message.appId) {
      appId = message.appId;

      ports[appId] = port;

      port.onDisconnect.addListener(function() {
        delete ports[appId];
      });
    } else if (message.from === 'devtools') {
      chrome.tabs.sendMessage(appId, message);
    }
  });
});
