module.exports = function(environment, src, dest){
  var gulpHtmlhint, gulpMinifyHtml;
  gulpHtmlhint = require('gulp-htmlhint');
  gulpMinifyHtml = require('gulp-minify-html');
  src = src.pipe(gulpHtmlhint()).pipe(gulpHtmlhint.reporter());
  if (environment.isProduction) {
    src = src.pipe(gulpMinifyHtml({
      comments: true,
      spare: true
    }));
  }
  src.pipe(dest);
};