// polyfill Chrome API
var browserTabs;
if (navigator.userAgent.includes('Chrome')) {
  browserTabs = {
    query: function (queryInfo) {
      return new Promise(function(resolve, reject) {
        chrome.tabs.query(queryInfo, resolve);
      });
    },
    remove: function (tabId) {
      return new Promise(function(resolve, reject) {
        chrome.tabs.remove(tabId, resolve);
      });
    },
    update: function (tabId, updateProperties) {
      return new Promise(function (resolve, reject) {
        chrome.tabs.update(tabId, updateProperties, resolve);
      });
    }
  };
} else {
  browserTabs = browser.tabs;
}

/**
 * listTabs to switch to
 */
function listTabs() {
  getCurrentWindowTabs().then((tabs) => {
    // console.log(tabs);
    let tabsList = document.getElementById('tabs-list');
    let currentTabs = document.createDocumentFragment();
    let counter = 0;

    tabsList.innerHTML = '';

    tabs.forEach((tab, index) => {
      let tabItem = document.createElement('li');

      let favicon = document.createElement('img');
      favicon.src = tab.favIconUrl;

      let tabLink = document.createElement('a');
      tabLink.textContent = tab.title || tab.id;
      tabLink.setAttribute('href', tab.id);
      tabLink.setAttribute('data-url', tab.url);
      tabLink.setAttribute('tabindex', index + 2);
      tabLink.classList.add('switch-tabs');
      if (tab.active) {
        tabLink.classList.add('current');
      }

      tabLink.insertBefore(favicon, tabLink.firstChild);
      tabItem.appendChild(tabLink);

      let tabClose = document.createElement('a');
      tabClose.setAttribute('href', tab.id);
      tabClose.classList.add('close');
      tabItem.appendChild(tabClose);

      currentTabs.appendChild(tabItem);

      counter += 1;
    });

    tabsList.appendChild(currentTabs);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    document.querySelector('.ripple').classList.add('opening');
  }, 200);
  listTabs();
});

function getCurrentWindowTabs() {
  return browserTabs.query({currentWindow: true});
}

function filterTabs(searchText) {
  searchText = searchText.toLowerCase();
  document.querySelectorAll('#tabs-list > li').forEach(node => {
    if (node.firstChild.textContent.toLowerCase().includes(searchText) || node.firstChild.dataset.url.includes(searchText)) {
      node.classList.remove('hide');
    } else {
      node.classList.add('hide');
    }
  });
}

document.querySelector('input#search-text').addEventListener('input', function (e) {
  filterTabs(e.target.value.trim());
});

document.addEventListener("click", (e) => {
  if (e.target.classList.contains('switch-tabs')) {
    var tabId = +e.target.getAttribute('href');
    browserTabs.query({
      currentWindow: true
    }).then((tabs) => {
      for (var tab of tabs) {
        if (tab.id === tabId) {
          browserTabs.update(tabId, {
              active: true
          });
          document.querySelector('a.switch-tabs.current').classList.remove('current');
          e.target.classList.add('current');
        }
      }
    });
  }

  else if (e.target.classList.contains('close')) {
    var tabId = +e.target.getAttribute('href');
    e.target.parentNode.classList.add('removing');
    setTimeout(() => {
      let next = e.target.parentNode.nextSibling;
      while(next) {
        next.classList.add('moving-up');
        next = next.nextSibling;
      }
    }, 100);
    setTimeout(() => {
      let removedItem = e.target.parentNode;
      let tabList = removedItem.parentNode;
      let nextItem = removedItem.nextSibling;
      let next = removedItem.nextSibling;
      tabList.removeChild(removedItem);
      while (next) {
        next.classList.remove('moving-up');
        next.classList.add('moved');
        next = next.nextSibling;
      }
      tabList.offsetHeight;
      next = nextItem;
      while (next) {
        next.classList.remove('moved');
        next = next.nextSibling;
      }
    }, 450);
    browserTabs.remove(tabId);
  }

  e.preventDefault();
});

// setTimeout(() => {
//   document.body.addEventListener('mouseleave', () => {
//     window.close();
//   });
// }, 500);

// //onRemoved listener. fired when tab is removed
// browserTabs.onRemoved.addListener((tabId, removeInfo) => {
//   console.log(`The tab with id: ${tabId}, is closing`);

//   if(removeInfo.isWindowClosing) {
//     console.log(`Its window is also closing.`);
//   } else {
//     console.log(`Its window is not closing`);
//   }
// });

// //onMoved listener. fired when tab is moved into the same window
// browserTabs.onMoved.addListener((tabId, moveInfo) => {
//   var startIndex = moveInfo.fromIndex;
//   var endIndex = moveInfo.toIndex;
//   console.log(`Tab with id: ${tabId} moved from index: ${startIndex} to index: ${endIndex}`);
// });
