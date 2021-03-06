module.exports = !(environment, src, dest) ->
  require! {
    'gulp-htmlhint'
    'gulp-minify-html'
  }

  src.=pipe gulp-htmlhint!
  .pipe gulp-htmlhint.reporter!
  #
  if environment.isProduction
    src.=pipe gulp-minify-html comments: true, spare: true
  #
  src.pipe dest
