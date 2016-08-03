var utils = require("./utils");
var REG = require("./utils").REG;
var parsedDefineReg = REG.parsedDefineReg;

//在这里去除重复模块
function removeRepeatModule(moduleContent){
    var modules = {};
    moduleContent = moduleContent.replace(parsedDefineReg, function(base,r1,r2){
        if(typeof modules[r1] == "undefined") {
            modules[r1] = 1;
        } else {
            modules[r1] = modules[r1]+1;
        }

        return base;
    });
    for(var module in modules) {
        if(modules[module]>1){
            for(var i=1;i<modules[module];i++){
                moduleContent = moduleContent.replace(utils.parsedFiles.get(module), "");
            }
        }

    }
    return moduleContent;
}
module.exports = removeRepeatModule;