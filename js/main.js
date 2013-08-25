(function (window, document) {
	'use strict';

	// Lets define some constants
	var storageSize = 1*1024,
			storageMode = PERSISTENT,
			testFile = 'file.txt';

	// Reference to the FileSystem object
	var _fs;

	var initFS = function(bytes, mode) {

		var reqFS = function(grantedBytes) {
			// Taking care of the browser-specific prefix
			window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
			
			window.requestFileSystem(storageMode, grantedBytes, onInitFS, errorHandler);
		};

		var quotaReqError = function(e) {
			throw {
				name: 'Error',
				message: 'Storage quota request denied'
			};
		};

		if (mode == PERSISTENT) {
			if (navigator.webkitPersistentStorage) {
				navigator.webkitPersistentStorage.requestQuota(storageSize, reqFS(bytes), quotaReqError);
			}
			else {
				window.webkitStorageInfo.requestQuota(PERSISTENT, storageSize, reqFS(bytes), quotaReqError);
			}
		}
		else { // TEMPORARY
			reqFS(bytes);
		}
	};

	var errorHandler = function(e) {
		var msg = '';

	  switch (e.code) {
	    case FileError.QUOTA_EXCEEDED_ERR:
	      msg = 'QUOTA_EXCEEDED_ERR';
	      break;
	    case FileError.NOT_FOUND_ERR:
	      msg = 'NOT_FOUND_ERR';
	      break;
	    case FileError.SECURITY_ERR:
	      msg = 'SECURITY_ERR';
	      break;
	    case FileError.INVALID_MODIFICATION_ERR:
	      msg = 'INVALID_MODIFICATION_ERR';
	      break;
	    case FileError.INVALID_STATE_ERR:
	      msg = 'INVALID_STATE_ERR';
	      break;
	    default:
	      msg = 'Unknown Error';
	      break;
	  };

	  console.error('Error: ' + msg);
	}

	var onInitFS = function(fs) {
		_fs = fs;
		writeFile(testFile);		
	};

	var writeFile = function(filename) {
		_fs.root.getFile(filename, {create: true, exclusive: false}, function(fileEntry) {
			
			// Create a FileWriter object to write within the FileEntry
			fileEntry.createWriter(function(fileWriter) {
				
				fileWriter.onwriteend = function(e) {
					console.log('Write completed');
					console.log('isFile: ' + fileEntry.isFile);
					console.log('name: ' + fileEntry.name);
					console.log('fullPath: ' + fileEntry.fullPath);
				};

				fileWriter.onerror = function(e) {
					console.log('Write failed: ' + e.toString());
				};

				// Create a Blob and write it to filename
				var blob = new Blob(['test text'], {type: 'text/plain'});
				fileWriter.write(blob);
				
 			}, errorHandler);

			// Read the file we just created
			readFile(name);

		}, errorHandler);
	};

	var readFile = function(filename) {
		_fs.root.getFile(filename, {}, function(fileEntry) {
			
			// Get a File object representing the file
			fileEntry.file(function(file) {

				// Use FileREader to read its contents
				var reader = new FileReader();

				reader.onloadend = function(e) {
					console.log('Read completed');
					console.log(this.result);
				};

				reader.readAsText(file);
			}, errorHandler);
		}, errorHandler);
	};

	// Start it up!
	initFS(storageSize, storageMode);

})(this, document);