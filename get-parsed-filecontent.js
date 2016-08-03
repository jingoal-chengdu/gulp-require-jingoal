var utils = require("./utils");
var nodejsPath = require("upath");
var uglifycss = require('uglifycss');

var md5HashManager = require('./utils').md5Hash;
var getFilePathByModuleName = require("./get-filepath-bymodulename"); // 根据模块名获取文件名
var getModuleNameByFileName = require("./get-modulename-by-filepath"); // 根据文件名获取模块名
var REG = require("./utils").REG;
var defineReg = REG.defineReg;

//获取添加模块名后的文件内容
function getParsedFile(fileName, config, fileDepModules) {
    /**
     * 先把require('ltpl!...') 换成 require('...')
     * 先把require('lcss!...') 换成 require('...')
     * 然后将模板文件 加上define包裹
     */
    var fileContent = utils.getFileContent(fileName);
    fileContent = fileContent.replace(/('|")ltpl!([^'"]+)\1/g, "'$2'");
    fileContent = fileContent.replace(/('|")lcss!([^'"]+)\1/g, "'$2'");
    var moduleName = getModuleNameByFileName(fileName, config) + "_" + md5HashManager.get(fileName);
    if (nodejsPath.extname(fileName) == '.tpl') {
        fileContent = "define('" + moduleName + "',function(){utils.loadTtpl(function(){/*loadText*" + fileContent + "loadTextEnd*/});});";
    } else if (nodejsPath.extname(fileName) == '.css') {
        fileContent = uglifycss.processString(
            fileContent,
            { 
                maxLineLen: 1000, 
                expandVars: true 
            }
        );
        fileContent = "define('" + moduleName + "',function(){utils.load_css(function(){/*loadText*" + fileContent + "loadTextEnd*/});});";
    } else {
        defineReg.lastIndex = 0;
        fileContent = fileContent.replace(defineReg, "define('" + moduleName + "',$1");
    }

    // 替换md5
    fileDepModules.syncModules.forEach(function (value) {
        var depfilepath = getFilePathByModuleName(nodejsPath.dirname(fileName), value, config);
        replaceMd5(value, md5HashManager.get(depfilepath));
    });
    fileDepModules.ayncModules.forEach(function (value) {
        var depfilepath = getFilePathByModuleName(nodejsPath.dirname(fileName), value, config);
        replaceMd5(value, md5HashManager.get(depfilepath));
    });
    function replaceMd5(moduleName, moduleMd5Hash) {
        if (moduleName.indexOf(".tpl") > -1) {
            moduleName = moduleName.replace(".tpl", "")
        }
        if (moduleName.indexOf(".css") > -1) {
            moduleName = moduleName.replace(".css", "")
        }
        var reg = new RegExp("('|\")" + moduleName + "\\1", "g");
        fileContent = fileContent.replace(reg, "\"" + moduleName + "_" + moduleMd5Hash + "\"");
    }
    //将所有处理后的模块内容都保存起来,有用
    utils.parsedFiles.set(moduleName, fileContent);
    return fileContent;
}

module.exports = getParsedFile;