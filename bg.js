function openOrFocusOptionsPage() {
	var optionsUrl = chrome.extension.getURL('options.html');
	chrome.tabs.query({}, function(extensionTabs) {
		var found = false;
		for (var i=0; i < extensionTabs.length; i++) {
			if (optionsUrl == extensionTabs[i].url) {
				found = true;
			//console.log("tab id: " + extensionTabs[i].id);
			chrome.tabs.update(extensionTabs[i].id, {"selected": true});
		}
	}
	if (found == false) {
		chrome.tabs.create({url: "options.html"});
	}
});
}
chrome.extension.onConnect.addListener(function(port) {
	var tab = port.sender.tab;
		// This will get called by the content script we execute in
		// the tab as a result of the user pressing the browser action.
		port.onMessage.addListener(function(info) {
			var max_length = 1024;
			if (info.selection.length > max_length)
				info.selection = info.selection.substring(0, max_length);
			openOrFocusOptionsPage();
		});
	});

// Called when the user clicks on the browser action icon.
chrome.browserAction.onClicked.addListener(function(tab) {
	openOrFocusOptionsPage();
});

chrome.downloads.onDeterminingFilename.addListener(function(item, suggest) {
	var current = item.url;
	var ifilename = item.filename;
	// alert("item url is: " + current);
	// alert("filename is: " + ifilename);
	var jfilename = item.filename;
	for (var i = 0; i < localStorage.length; ++i){
		// alert("key " + i + " is: " + localStorage.key(i));
		if((localStorage.key(i) == 'images') || (localStorage.key(i) == 'music') || (localStorage.key(i) == 'docs') || (localStorage.key(i) == 'arch') || (localStorage.key(i) == 'preventDuplication')) {
			continue;
		}
		if (current.indexOf(localStorage.key(i)) !== -1){
			// key is search term and value is folder name
			ifilename = localStorage[localStorage.key(i)] + '/' + item.filename;
		}
	}

	if((localStorage.music == 'true') && ((jfilename.indexOf('.mp3') !== -1) || (jfilename.indexOf('.wav') !== -1))) {
		ifilename = 'Music/' + ifilename;
	} else if((localStorage.images == 'true') && ((jfilename.indexOf('.jpg') !== -1) || (jfilename.indexOf('.png') !== -1))) {
		ifilename = 'Images/' + ifilename;
	} else if((localStorage.docs == 'true') && ((jfilename.indexOf('.doc') !== -1) || (jfilename.indexOf('.ppt') !== -1) || (jfilename.indexOf('.rtf') !== -1) || (jfilename.indexOf('.xls') !== -1) || (jfilename.indexOf('.pdf') !== -1) || (jfilename.indexOf('.txt') !== -1) || (jfilename.indexOf('.xls') !== -1))) {
		ifilename = 'Documents/' + ifilename;
	} else if((localStorage.arch == 'true') && ((jfilename.indexOf('.zip') !== -1) || (jfilename.indexOf('.rar') !== -1) || (jfilename.indexOf('.dmg') !== -1))) {
		ifilename = 'Archives/' + ifilename;
	} else {
		ifilename = 'Other/' + ifilename;
	}

	if (localStorage.preventDuplication == 'true') {
		suggest({filename: ifilename, conflictAction: 'overwrite'});
	} else {
		suggest({filename: ifilename, overwrite: false});
	};
});
