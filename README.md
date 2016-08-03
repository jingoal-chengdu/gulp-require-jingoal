### 使用方法
/*requirejs 打包*/
var pack = require("gulp-require-jingoal");
gulp.task('requirejs',function () {
    gulp.src('../static/**/*.*').pipe(pack('static')).pipe(gulp.dest('../dest/static'))
    gulp.src('../public/**/*.*').pipe(pack('static')).pipe(gulp.dest('../dest/public'));
});
### 一些约定

* 必须有根目录的概念
* 所有的依赖必须是字符串的形式，不能以变量的形式出现 比如：require([depPath]); 这里的depPath 就是动态变量，打包工具是分析不出来的