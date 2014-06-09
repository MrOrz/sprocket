require! {
  util
  path
}
require! {
  RequireState: './require_state'
}

module.exports = Collection

!function Collection
  @_nodes = {}
/*
 * Collection.prototype
 */
const {prototype} = Collection
/*
 * Public APIs
 */
prototype <<< {
  isStable:~
    ->
      for keyPath, vn of @_nodes when not vn.isStable
        return false
      true

  createNodeWith: (/* rawKeyPath */) ->
    const [keyPath, keyPathWithMin] = @_parseKeyPath it
    @_createNode keyPathWithMin || keyPath

  createNode: !(vinyl, errorHandler) ->
    const [keyPath, keyPathWithMin] = @_parseKeyPath vinyl.relative
    const fromNode = @_createNode keyPathWithMin || keyPath
    @_updateNode fromNode, vinyl

  updateNode: !(vinyl, errorHandler) ->
    const fromNode = @_findNodeAfterUpdated vinyl
    if fromNode
      @_updateNode fromNode, vinyl
    else
      errorHandler "[VinylNode.Collection] Can't update node (#{ vinyl.path })"

  finalizeNode: !(vinyl, errorHandler) ->
    const fromNode = @_findNodeAfterUpdated vinyl
    if fromNode
      @_finalizeNode fromNode, vinyl
    else
      errorHandler "[VinylNode.Collection] Can't finalize node (#{ vinyl.path })"

  generateEntries: (isProduction) ->
    const vinyls = {}

    for keyPath, node of @_nodes when node.hasDependencies
      const state = new RequireState!
      node.buildDependencies state, @
      const baseAndExtnames = RequireState.keyPath2BaseAndExtnames {
        keyPath
        isProduction
        extname: path.extname(node.vinyl.path)
      }

      if isProduction
        state.concatFile vinyls, baseAndExtnames
      else
        state.buildManifestFile vinyls, baseAndExtnames
    Object.keys vinyls .map -> vinyls[it]
}
/*
 * Private APIs
 */
const DIRECTIVE_REGEX = /^.*=\s*(require|include)(_self|_tree)?(\s+([\w\.\/-]+))?$/gm

function getEdgeCtor (constructor, importDirective, targetDirective)
  if '_tree' is targetDirective
    constructor.SuperNode
  else if '_self' is targetDirective and 'require' is importDirective
    constructor.Edge.Circular
  else
    constructor.Edge

prototype<<< {
  _parseKeyPath: (filepath) ->
    const [keyPath, firstExtname] = filepath.split '.'
    if 'min' is firstExtname
      [keyPath, "#{keyPath}__iLoveSprocket__min"]
    else
      [keyPath, void]

  _createNode: (keyPath) ->
    if @_nodes[keyPath]
      that
    else
      # console.log "insert path (#{ keyPath}) into nodes(#{ @_count})..."
      @_nodes[keyPath] = new @constructor.VinylNode keyPath

  _updateNode: !(fromNode, vinyl) ->
    fromNode <<< {vinyl}
    return if fromNode.dependencies 
    #
    const contents = vinyl.contents.toString!

    fromNode.dependencies = while DIRECTIVE_REGEX.exec contents
      const importDirective = that.1
      const Ctor = getEdgeCtor @constructor, importDirective, that.2

      new Ctor fromNode, 'require' is importDirective, {
        collection: @
        keyPath: that.4
      }

  _findNodeAfterUpdated: !(vinyl) ->
    const relativePaths = [vinyl.relative]
    relativePaths.push path.relative(vinyl.base, that) if vinyl.revOrigPath
    #
    for filepath in relativePaths
      const [keyPath, keyPathWithMin] = @_parseKeyPath filepath
      const fromNode = if keyPathWithMin and @_nodes[keyPathWithMin]
        that
      else
        @_nodes[keyPath]
      return fromNode if fromNode

  _finalizeNode: !(fromNode, vinyl) ->
    fromNode.isStable = true
    @_updateNode fromNode, vinyl
    # console.log @_count, @_stableCount
}