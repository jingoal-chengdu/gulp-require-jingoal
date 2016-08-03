var fs = require("fs");
var vm = require("vm");
var nodejsPath = require("upath");

var utils = require("./utils");
var md5HashManager = require('./utils').md5Hash;

var getFilePathByModuleName = require("./get-filepath-bymodulename");

function getModules(fileName, config){
    var fileContent = utils.getFileContent(fileName);
    // 保存md5
    md5HashManager.set(fileName);
    //获取同步 require模块
    var requireReg = /require\s*\(\[([^\)\]]*)\]\s*,\s*function\s*\(/g,
        defineReg = /define\s*\(\[([^\)\]]*)\]\s*,\s*function\s*\(/g,
        ayncRequireReg = new RegExp(config.asncRequire + "\\s*\\(\\[([^\\)\\]]*)\\]\\s*,\\s*function\\s*\\(","g"),
        result,
        syncModules = [],
        defineModules = [],
        ayncModules = [];
    //获取同步模块
    syncModules = getModulesByReg(requireReg, fileContent);
    defineModules = getModulesByReg(defineReg, fileContent);
    syncModules= syncModules.concat(defineModules);
    //获取异步模块
    ayncModules = getModulesByReg(ayncRequireReg, fileContent);

    syncModules.forEach(function(value){
        var depfilepath = getFilePathByModuleName(nodejsPath.dirname(fileName), value, config);

        // 保存md5
        md5HashManager.set(depfilepath);
    });

    ayncModules.forEach(function(value){
        var depfilepath = getFilePathByModuleName(nodejsPath.dirname(fileName), value, config);
        
        // 保存md5
        md5HashManager.set(depfilepath);
    });
    return {
        syncModules:syncModules,
        ayncModules:ayncModules
    };

    //获取define模块
}

function getModulesByReg(reg, fileContent){
    var requireReg = /require\s*\(\[([^\)\]]*)\]\s*,\s*function\s*\(/g,
        result,
        modules = [],
        ayncModules = [];
    while(reg.lastIndex < fileContent.length){
        result = reg.exec(fileContent);
        if(!result){
            break;
        }else{
            modules = modules.concat(vm.runInNewContext("[" + result[1] + "]"));
        }
    }
    var appendModules = [];
    modules = modules.map(function(value){
        if(value.indexOf("!")>0){
            var temp = value.split("!");
            if(nodejsPath.extname(temp[1])==""){
                if(temp[0]=="ltpl"){
                    temp[1] = temp[1] + ".tpl";
                }
                if(temp[0]=="lcss"){
                    temp[1] = temp[1] + ".css";
                }
            }
            appendModules.push(temp[1]);
            return temp[0];
        }
        if(value=="module"){
            return false;
        }
        return value;
    });
    modules = modules.filter(function(value){
        return value !== false;
    });
    modules = modules.concat(appendModules);
    return modules;
}
module.exports = getModules;