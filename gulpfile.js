//引入gulp及其插件模块
var gulp = require('gulp'); //gulp基本包
var autoprefixer = require('gulp-autoprefixer'); //css前缀处理
var cssnano = require('gulp-cssnano'); //css压缩
var uglify = require('gulp-uglify'); //压缩 JavaScript
var htmlmin = require('gulp-htmlmin'); //html压缩
var imagemin = require('gulp-imagemin'); //图片压缩
//注册样式编译任务
gulp.task('style', function() {
    gulp.src('src/styles/*.css')
        .pipe(autoprefixer({browsers: [
            "ie >= 8",
            "ie_mob >= 10",
            "ff >= 26",
            "chrome >= 30",
            "safari >= 6",
            "opera >= 23",
            "ios >= 5",
            "android >= 2.3",
            "bb >= 10"
        ]}))
        .pipe(cssnano())
        .pipe(gulp.dest('dist/styles'));
});
gulp.task('image', function() {
    gulp.src('src/images/*.*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/images'));
});
gulp.task('script', function() {
    gulp.src('src/scripts/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/scripts'));
});
gulp.task('html', function() {
    gulp.src('src/*.html')
        .pipe(htmlmin({
            collapseWhitespace: true,
            collapseBooleanAttributes: true,
            removeAttributeQuotes: true,
            removeComments: true,
            removeEmptyAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
        }))
        .pipe(gulp.dest('dist'));
});
//监听文档
gulp.task('serve', ['style', 'image', 'script', 'html'], function() {
    gulp.watch('src/styles/*.css', ['style']);
    gulp.watch('src/images/*.*', ['image']);
    gulp.watch('src/scripts/*.js', ['script']);
    gulp.watch('src/*.html', ['html']);
});
