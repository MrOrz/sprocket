module.exports = !(environment, src, dest) ->
  require! {
    'gulp-sass'
  }

  const options = do
    includePaths: environment.basePaths
    outputStyle: if environment.isProduction then 'compressed' else 'nested'
  src.pipe gulp-sass options
  .pipe dest
