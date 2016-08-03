var nodejsPath = require("upath");
function parseConfig (config) {
    var cwd = process.cwd();
    var newConfig = JSON.parse(JSON.stringify(config));
    newConfig.rootPath = nodejsPath.normalize(config.rootPath);
    newConfig.basePath = nodejsPath.normalize(newConfig.rootPath + "/" + config.basePath);
    newConfig.mainJs = config.mainJs;
    newConfig.asncRequire = config.asncRequire;
    if(config.noMergePath){
        newConfig.noMergePath = [];
        config.noMergePath.forEach(function(value){
            newConfig.noMergePath.push(nodejsPath.normalize(newConfig.rootPath + "/" + value));
        });
    }
    if(config.movePath){
        newConfig.movePath = [];
        config.movePath.forEach(function(value){
            newConfig.movePath.push({
                src:nodejsPath.normalize(newConfig.rootPath + "/" + value.src),
                dest:nodejsPath.normalize(newConfig.rootPath + "/" + value.dest)
            });
        });
    }
    if(config.modulePath){
        newConfig.modulePath = config.modulePath;
        newConfig.reversionPath = {};
        for(var i in config.modulePath) {
            newConfig.reversionPath[nodejsPath.normalize(newConfig.basePath+"/"+config.modulePath[i])] = i;
        }
    }
    if(config.mainJsReplace){
        newConfig.mainJsReplace = config.mainJsReplace;
        newConfig.mainJsReplace.replaceFilePath = nodejsPath.normalize(newConfig.rootPath + "/" + newConfig.mainJsReplace.replaceFilePath)
        newConfig.mainJsReplace.mainJSPath = nodejsPath.normalize(newConfig.rootPath + "/" + newConfig.mainJsReplace.mainJSPath)
    }
    return newConfig;
}
module.exports = parseConfig;