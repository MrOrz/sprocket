module.exports = do
  getManifestFilepaths: (mimeType, keyPath) ->
    @manifest_filepaths[mimeType + keyPath] || []

  setManifestFilepaths: (mimeType, keyPath, filepaths) ->
    @manifest_filepaths[mimeType + keyPath] = filepaths
