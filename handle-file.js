var getModules = require("./get-modules");
var nodejsPath = require("upath");
var fs = require("fs");
var crypto = require('crypto');

var getFilePathByModuleName = require("./get-filepath-bymodulename");
var getParsedFile = require("./get-parsed-filecontent");
var removeRepeatModule = require("./remove-repeat-module");
var judgeIstoMerge = require("./judge-isto-merge");

function handleFile(fileName, sourcefile, config) {
    //获取所有模块
    var depModules = getModules(fileName, config);
    //获取添加模块名的文件内容
    var moduleContent = getParsedFile(fileName, config, depModules),
        depContent;//依赖的内容,如果是通过分析依赖递归调用这个文件的话

    //只把需要同步的模块合并过来
    depModules.syncModules.forEach(function (value) {
        //获取依赖文件的真是路径
        var depfilepath = getFilePathByModuleName(nodejsPath.dirname(fileName), value, config);
        moduleContent += ";" + handleFile(depfilepath, sourcefile, config).depContent;
    });
    /*
    depModules.ayncModules.forEach(function(value){//对于异步加载模块，只需要移动就好了
        handleFile(getFilePathByModuleName(nodejsPath.dirname(fileName),value),{type:"requireAync"});
    });
    */
    depContent = moduleContent;
    //如果是入口文件，就直接返回
    if (!judgeIstoMerge(fileName, sourcefile, config)) {
        depContent = "";
    }

    moduleContent = removeRepeatModule(moduleContent);
    return {
        moduleContent: moduleContent,
        depContent: depContent
    };
}
module.exports = handleFile;