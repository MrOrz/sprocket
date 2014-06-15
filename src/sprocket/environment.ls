require! {
  path
}
require! {
  SprocketRequireState: './vinyl_node/require_state'
}

const SUPPORTED_ANCESTORS = {
  javascripts: 'js'
  stylesheets: 'css'
}

SprocketEnvironment <<< {SUPPORTED_ANCESTORS}

module.exports = SprocketEnvironment
/*
 * SprocketEnvironment
 */
!function SprocketEnvironment (options)
  [@[key] = val for key, val of options || {}]
  @_isProduction = 'production' is process.env.NODE_ENV
  @_basePaths = []
/*
 * SprocketEnvironment.prototype
 */
const {prototype} = SprocketEnvironment

prototype<<< {
  isProduction:~
    -> @_isProduction

  basePaths:~
    #
    # HACK: 
    # returns a direct reference for gulp-sass.options.includePaths
    # since it is lazy evaluated during transforming state
    #
    -> @_basePaths

  addBasePath: ->
    const {_basePaths} = @
    [return false for basePath in _basePaths when basePath is it]
    !!_basePaths.push it
}
