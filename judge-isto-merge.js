var nodejsPath = require("upath");
var fs = require("fs");
var REG = require("./utils").REG;
var defineReg = REG.defineReg;
//分析文件名
/*
两个参数, 这个文件是通过那个文件分析来的,如果是public下面同级1级目录,当然要合并
*/
function isNoMergeFile(fileName,sourcefile,config){
	// tpl 里面虽然没有define模块，但是要合并
    if(nodejsPath.extname(fileName) == '.tpl') {
        return true;
    }
    if(nodejsPath.extname(fileName) == '.css') {
        return true;
    }
    /*
    两种种情况要直接移动
    在不能合并目录规则中,比如说public,除了在public里面的同1级目录里面的文件,也需要合并,其他public非1级目录里面的文件都不能合并
    没有define模块
    */
    var isToMerge = false;
    config.noMergePath.forEach(function(value){
        //如果是在public里面
        if(fileName.indexOf(value)==0){
            //并且和源文件不是同一个目录,就不需要移动
            if(sourcefile.indexOf(value)==0){
                var sourcePath = sourcefile.replace(value+"/","");
                var filePath = fileName.replace(value+"/","");
                sourcePath = sourcePath.substring(0,sourcePath.indexOf("/"));
                filePath = filePath.substring(0,filePath.indexOf("/"));
                //两个一样1级public目录,那么就要合并
                if(sourcePath == filePath) {
                    isToMerge = true;
                }
            }
        }else{//如果不在public 里面,那么就要合并
            isToMerge = true;
        }
    });
    if(isToMerge) { //如果要合并,但是没有define模块的话,就不能合并
        //没有define模块
        var fileContent = fs.readFileSync(fileName).toString();
        defineReg.lastIndex = 0;
        if(!defineReg.test(fileContent)){
            isToMerge = false;
        }
    }
    return isToMerge;
}
module.exports = isNoMergeFile;