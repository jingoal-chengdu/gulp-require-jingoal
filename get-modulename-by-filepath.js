function fileNameToModuleName(fileName,config){
    var moduleName = fileName.substring(0,fileName.lastIndexOf("."));
    if(moduleName.indexOf(config.basePath) === 0){
        moduleName = moduleName.replace(config.basePath+"/", "");
    }else{
        for(var i in config.reversionPath){
            if(moduleName.indexOf(i)==0){
                moduleName = moduleName.replace(i, config.reversionPath[i]);
                break;
            }
        }
    }
    return moduleName;
}
module.exports = fileNameToModuleName;