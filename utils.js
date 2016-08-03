var fileCaches = {};
var parsedFiles = {};
var hashMd5 = {};
var utils = require("./utils");
var crypto = require('crypto');
var fs = require("fs");

module.exports = utils = {
    getFileContent: function(fileName){
        fileName = fileName.replace(/\\/g,"/");
        var fileContent = fs.readFileSync(fileName).toString();
        fileCaches[fileName] = fileContent;
        return fileContent;
    },
    REG: {
        defineReg : /define\s*\((\s*function\s*\(|\[[^\)\]]*\]\s*,\s*function\s*\()/g,
        parsedDefineReg : /define\('([^']+)',/g
    },
    parsedFiles: {
        set: function (moduleName, fileContent){
            parsedFiles[moduleName] = fileContent;
        },
        get: function (moduleName) {
            return parsedFiles[moduleName]; 
        }
    },
    md5Hash:{
        set: function(fileName){
            fileName = fileName.replace(/\\/g, "/");
            if(typeof hashMd5[fileName] == 'undefined') {
                var fileContent = utils.getFileContent(fileName);
                var hash = crypto.createHash('md5').update(fileContent).digest("hex");
                hashMd5[fileName] = hash;
            }
        },
        get: function(fileName){
            fileName = fileName.replace(/\\/g, "/");
            if(typeof hashMd5[fileName] == 'undefined') {
                this.set(fileName);
            }
            return hashMd5[fileName];
        }
    }
}