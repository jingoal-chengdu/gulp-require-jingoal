//格式化配置
var parseConfig = require("./parse-config.js");
//处理文件
var handleFile = require("./handle-file.js");
//格式化要合并的文件
//压缩文件
var UglifyJS = require("uglify-js");
var fs = require("fs");
//获取入口文件
//var mainJs = getModulePath(config.basePath, config.mainJs);
//处理入口文件，该合并合并，该移动移动
//fs.writeFile("d://data.txt",handFile(mainJs,{type:"enterFile"}));
//处理移动目录，把目录中所有模块文件进行命名

// through2 是一个对 node 的 transform streams 简单封装
var through = require('through2');
var gutil = require('gulp-util');
var nodejsPath = require('upath');
var PluginError = gutil.PluginError;
var md5HashManager = require('./utils').md5Hash;

// 插件级别函数 (处理文件)
function packFile(config) {
    var defaultConfig = {
        debug:true,
        showLog:true,
        minifyExclude:[]// 正则数组
    };

    if(typeof config == 'undefined') {
        throw new PluginError("gulp-require-jingoal", '必须指明详细的require配置文件');
        return;
    }
    //获取配置
    config = parseConfig(config);
    global.movedFiles = [];//已经移动过的文件,就不要在移动了
    // 创建一个让每个文件通过的 stream 通道
    return through.obj(function(file, enc, cb) {
    var extName = nodejsPath.extname(file.path);
        switch(extName){
            case ".js":{
                var filePath = nodejsPath.normalize(file.path);
                var moduleContent = handleFile(filePath,filePath,config).moduleContent;
                // 替换入口文件里面的入口js，加上md5
                if(config.mainJsReplace && !config.debug) {
                    if(filePath == config.mainJsReplace.mainJSPath) {
                        var replaceFilePath = config.mainJsReplace.replaceFilePath;
                        var indexHtmlContent = fs.readFileSync(replaceFilePath).toString();
                        indexHtmlContent = indexHtmlContent.replace(
                            config.mainJsReplace.replaceString, 
                            config.mainJsReplace.replaceString + "_" + md5HashManager.get(filePath) 
                        );
                        fs.writeFileSync(replaceFilePath, indexHtmlContent);
                    }
                }
                //console.log(file.path+"---"+"start");
                if(!config.debug) {
                    var skip = false;
                    config.minifyExclude.forEach(function(excludePath){
                        if(new RegExp(excludePath).test(file.path)) {
                            skip = true;
                        }
                    });
                    if(!skip) {
                        try{
                            moduleContent = minify_js(moduleContent);
                        }catch(e){
                            console.log("压缩文件" + filePath + "时出现错误，请检查错误，未能成功压缩", e.toString());
                        }
                    }
                }
                file.contents=new Buffer(moduleContent);
                var reg = new RegExp(nodejsPath.extname(file.path) + "$");
                var oldPath = file.path.replace(/\\/g, "/");
                file.path = file.path.replace(reg, "_"
                    + md5HashManager.get(oldPath)
                    + nodejsPath.extname(file.path));
                

                //console.log(file.path+"---"+"ok");
        }
    }
    cb(null,file);
  });
};
module.exports = packFile;
//压缩js的工具
function minify_js(content){
    //对于通过注释进行加载文本文件的地方的进行特殊处理
    content=content.replace(/\(function\s*\(\s*\)\s*{\s*(\/\*loadText\*[\s\S]+?\*\/)\s*\}\)/g,function(base,r1){
        return "(function(){eval(\"var a='a'\");"
        +r1+
        "eval(\"var a='a'\");})"
    });
    content = UglifyJS.minify(content,{
        fromString: true,
        mangle:false,
        output:{
            comments:function(node, comments){
                if(/loadText\*[\s\S]+/g.test(comments.value)){
                    return true;
                }
                return false;
            }
        }
    }).code;
    return content;
}
