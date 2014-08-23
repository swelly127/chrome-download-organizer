/**
//Google analytics code
var _gaCode = 'UA-41728018-1';

var _gaq = _gaq || [];
_gaq.push(['_setAccount', _gaCode]);
_gaq.push(['_setCustomVar',
 4,
 'Version',
 getVersion()
 ]);
_gaq.push(['_trackPageview']);

(function() {
   var ga = document.createElement('script');
   ga.type = 'text/javascript';
   ga.async = true;
   ga.src = 'https://ssl.google-analytics.com/ga.js';
   var s = document.getElementsByTagName('script')[0];
   s.parentNode.insertBefore(ga, s);
})();
**/

// Debugs for me
function message(msg) {
    var status = document.getElementById('status');
    status.innerHTML = msg;
    setTimeout(function() {status.innerHTML = "";}, 1750);
}

// Gets version number
function getVersion() {
    var manifestData = chrome.app.getDetails();
    return manifestData.version;
}

var checkboxNames = ['preventDuplication', 'images', 'music', 'docs', 'arch'];

// Checks if filter is a checkbox
function isBox(key) {
  for (n in checkboxNames) {
    n = checkboxNames[n];
    if (key == n) { return true; }
  } return false;
}

// Adds a website filter
function addFilter() {
    var _url = document.getElementById('url').value;
    var _folder = document.getElementById('rename').value;
    console.log(_url);
    var data = {};
    data[_url] = _folder;
    if(document.getElementById('url').value==''){
        document.getElementById('url').style.backgroundColor = 'red';
        document.getElementById('url').style.opacity = '0.4';
        document.getElementById('url').focus();
        setTimeout(function() {
         document.getElementById('url').style.backgroundColor = '';
         document.getElementById('url').style.opacity = '1';
     }, 1750);
        document.getElementById('url').focus();
        return;
    }
    if(document.getElementById('rename').value==''){
        document.getElementById('rename').style.backgroundColor = 'red';
        document.getElementById('rename').style.opacity = '0.4';
        document.getElementById('rename').focus();
        setTimeout(function() {
         document.getElementById('rename').style.backgroundColor = '';
         document.getElementById('rename').style.opacity = '1';
     }, 1750);
        document.getElementById('rename').focus();
        return;
    }
    chrome.storage.local.set(data, function() {
                             // Notify that we saved.
                             message('Settings saved');
                             debugChanges(data, 'Set');
                         });

    document.getElementById('url').value='';
    document.getElementById('rename').value='';
    tableCreate();
    //saveStorage();
}

//Clear saved filters
function clearStorage() {
    // var data = new Array();
    if(document.getElementById('checkboxall').checked){
        chrome.storage.local.clear(function() {
                                   message('Settings saved');
                                   debugChanges(data, 'Local Set');
                               });
        chrome.storage.sync.clear(function() {
                                  message('Settings saved');
                                  debugChanges(data, 'Sync Set');
                              });
        for (n in checkboxNames) {
          document.getElementById('filtercheckbox.' + checkboxNames[n]).checked = false;
        }
        return;
    }

    chrome.storage.local.get(null, function(items) {
        for(key in items) {
          if(isBox(key)) { continue; }
          if(document.getElementById('checkbox' + key).checked){
            chrome.storage.local.remove(key, function() {
              console.log('removed ' + key);
              tableCreate();
            });
          }
        }
   });
    if (arguments[0] !== null){
        chrome.storage.local.remove(arguments[0], function() {
            console.log('removed ' + key);
            tableCreate();
        });
    }
    //saveStorage();
}


//Catches enter in the second box
function enterPress(e) {
    if (e.keyCode == 13) {
        document.getElementById('url').focus();
        addFilter();
        return false;
    }
}

// Creates a table
function tableCreate(){
    chrome.storage.local.get(null, function(storage) {
       var tblbody = document.getElementById('table');;
       tblbody.innerHTML = '';
       var tbl  = document.createElement('table');
       for(key in storage){
          if(isBox(key)) { continue; }
          var tr = tbl.insertRow();
          for(var j = 0; j < 3; j++) {
              if (j==3) {break;}
              var td = tr.insertCell();
              td.style.border='2px solid black';
              td.style.width='33%';
              if(j == 2){
                td.appendChild(document.createTextNode(key));
              }
              if(j == 1){
                td.appendChild(document.createTextNode(storage[key]))
              }
              if(j == 0) {
                //var removeButton = document.createElement('input');
                //removeButton.type = "button";
                //removeButton.id = "button" + key;
                //removeButton.value = "Remove";
                //removeButton.onClick=clearStorage(key);
                //removeButton.addEventListener('click', clearStorage(key));
                //td.appendChild(removeButton);

                var checkbox = document.createElement('input');
                checkbox.type = "checkbox";
                checkbox.name = "name";
                checkbox.value = "value";
                checkbox.id = "checkbox" + key;
                td.style.width='10%';
                td.appendChild(checkbox);
                td.appendChild(document.createTextNode("Remove"));
              }
          }
        }
        var tr = tbl.insertRow();
        var td = tr.insertCell();
        var checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.name = "name";
        checkbox.value = "value";
        checkbox.id = "checkboxall";
        checkbox.addEventListener('click', checkboxes);
        td.style.width='10%';
        td.style.border='2px solid black';
        td.appendChild(checkbox);
        td.innerHTML += "<b><u>Remove All</u></b>";
        var td = tr.insertCell();
        td.style.width='33%';
        td.style.border='2px solid black';
        td.appendChild(document.createTextNode(""));
        td.innerHTML = "<b><u>Folder Name:</u></b>";
        var td = tr.insertCell();
        td.style.width='33%';
        td.style.border='2px solid black';
        td.appendChild(document.createTextNode(""));
        td.innerHTML = "<b><u>URL:</u></b>";
        tblbody.appendChild(tbl);
    });
return
}

//sync back
function restoreStorage() {
    chrome.storage.sync.get(null, function(items) {
        console.log(JSON.stringify(items))
       chrome.storage.local.set(items, function() {});
    });
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
  for(key in changes) {
    if(isBox(key)) {
        document.getElementById('filtercheckbox.' + key).checked = changes[key].newValue;
    }
    if((namespace == 'local') && (changes[key].newValue == null)) {
        localStorage.removeItem(key);
        chrome.storage.sync.remove(key, function() {});
    } else if((namespace == 'local') && (changes[key].newValue !== null)){
      var data = {};
      data[key] = changes[key].newValue;
      chrome.storage.sync.set(data , function(){});
      localStorage[key] = changes[key].newValue;
    } else if((namespace == 'sync') && (changes[key].newValue == null)) {
       localStorage.removeItem(key);
       chrome.storage.local.remove(key, function() {});
    } else if((namespace == 'sync') && (changes[key].newValue !== null)){
      var data = {};
      data[key] = changes[key].newValue;
      chrome.storage.local.set(data , function() {});
      localStorage[key] = changes[key].newValue;
      console.log("Added " + key +':'+changes[key].newValue + 'localstorage now ' + localStorage[key]);
    }
   // valueChanged(changes["images"].newValue);
  }
  debugChanges(changes, 'onChanged ' + namespace);
  tableCreate();
  message("Filters Saved");
});

// For debugging purposes:
function debugChanges(changes, namespace) {
    for (key in changes) {
      console.log(namespace + ' Storage change: key='+key+' value='+JSON.stringify(changes[key]));
    }
}

//Sets filters based on checkboxes
function checkboxes() {
    console.log("checkboxes");
    if(document.getElementById('checkboxall').checked) {
      chrome.storage.local.get(null, function(storage) {
        for(key in storage) {
          if(isBox(key)) { continue; }
          document.getElementById('checkbox' + key).checked = true;
       }
     });
    }

    chrome.storage.local.set({images: document.getElementById('filtercheckbox.images').checked})
    chrome.storage.local.set({music: document.getElementById('filtercheckbox.music').checked})
    chrome.storage.local.set({docs: document.getElementById('filtercheckbox.docs').checked})
    chrome.storage.local.set({arch: document.getElementById('filtercheckbox.arch').checked})
    chrome.storage.local.set({preventDuplication: document.getElementById('filtercheckbox.preventDuplication').checked})

    //saveStorage();
}


// Restores table state to saved value from localStorage.
function restoreOptions() {
    tableCreate();
    restoreStorage();
    document.getElementById('version').innerHTML += getVersion();
    chrome.storage.sync.get(null, function(items) {
      for (n in checkboxNames) {
        n = checkboxNames[n];
        document.getElementById('filtercheckbox.' + n).checked = localStorage[n] == "true";
      }
      /**
      localStorage.images = items.images;
      localStorage.music = items.music;
      localStorage.docs = items.docs;
      localStorage.arch = items.arch;
      document.getElementById('filtercheckbox.images').checked = localStorage.images;
      document.getElementById('filtercheckbox.music').checked = items.music;
      document.getElementById('filtercheckbox.docs').checked = items.docs;
      document.getElementById('filtercheckbox.arch').checked = items.arch;
      **/
   });

}


document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('#add').addEventListener('click', addFilter);
document.querySelector('#clear').addEventListener('click', clearStorage);
document.getElementById('rename').addEventListener('keyup', enterPress);
document.getElementById('url').addEventListener('keyup', enterPress);
for (n in checkboxNames) {
  document.getElementById('filtercheckbox.' + checkboxNames[n]).addEventListener('click', checkboxes);
}

// Downloads section:
// COPIED FROM CHROME SOURCE CODE - INCOMPLETE
/**
document.getElementById('downloadLocationChangeButton').addEventListener('click', function(event) {
  chrome.send('selectDownloadLocation');
});

Preferences.getInstance().addEventListener('download.default_directory',
    onDefaultDownloadDirectoryChanged_.bind(this));

function onDefaultDownloadDirectoryChanged_(event) {
      $('rename').value = event.value.value;
      $('download-location-label').classList.toggle('disabled', event.value.disabled);
      $('downloadLocationChangeButton').disabled = event.value.disabled;
  }
**/
