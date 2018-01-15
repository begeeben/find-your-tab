// polyfill Chrome API
var browserTabs;
console.log('background');
if (navigator.userAgent.includes('Chrome')) {
  browserTabs = {
    query: function (queryInfo) {
      return new Promise(function (resolve, reject) {
        chrome.tabs.query(queryInfo, resolve);
      });
    },
    remove: function (tabId) {
      return new Promise(function (resolve, reject) {
        chrome.tabs.remove(tabId, resolve);
      });
    },
    update: function (tabId, updateProperties) {
      return new Promise(function (resolve, reject) {
        chrome.tabs.update(tabId, updateProperties, resolve);
      });
    },
    onRemoved: chrome.tabs.onRemoved,
    onCreated: chrome.tabs.onCreated
  };
  browser = chrome;
} else {
  browserTabs = browser.tabs;
}

function updateCount(tabId, isOnRemoved) {
  browserTabs.query({})
  .then((tabs) => {
    let length = tabs.length;

    // onRemoved fires too early and the count is one too many.
    // see https://bugzilla.mozilla.org/show_bug.cgi?id=1396758
    if (isOnRemoved && tabId && tabs.map((t) => { return t.id; }).includes(tabId)) {
      length--;
    }

    browser.browserAction.setBadgeText({text: length.toString()});
    browser.browserAction.setBadgeBackgroundColor({'color': 'gray'});
  });
}


browserTabs.onRemoved.addListener(
  (tabId) => { updateCount(tabId, true);
});
browserTabs.onCreated.addListener(
  (tabId) => { updateCount(tabId, false);
});
updateCount();
