// This class is taken from CreateReactApp:
// https://github.com/facebook/create-react-app/blob/f0a837c1f07ebd963ddbba2c2937d04fc1b79d40/packages/react-dev-utils/README.md#new-inlinechunkhtmlpluginhtmlwebpackplugin-htmlwebpackplugin-tests-regex
module.exports = class InlineChunkHtmlPlugin {
  constructor (htmlWebpackPlugin, tests) {
    this.htmlWebpackPlugin = htmlWebpackPlugin
    this.tests = tests
  }

  getInlinedTag (publicPath, assets, tag) {
    if (tag.tagName !== 'script' || !(tag.attributes && tag.attributes.src)) {
      return tag
    }
    const scriptName = publicPath
      ? tag.attributes.src.replace(publicPath, '')
      : tag.attributes.src
    if (!this.tests.some(test => scriptName.match(test))) {
      return tag
    }
    const asset = assets[scriptName]
    if (asset == null) {
      return tag
    }
    return { tagName: 'script', innerHTML: asset.source(), closeTag: true }
  }

  apply (compiler) {
    let publicPath = compiler.options.output.publicPath || ''
    if (publicPath && !publicPath.endsWith('/')) {
      publicPath += '/'
    }

    compiler.hooks.compilation.tap('InlineChunkHtmlPlugin', compilation => {
      const tagFunction = tag =>
        this.getInlinedTag(publicPath, compilation.assets, tag)

      const hooks = this.htmlWebpackPlugin.getHooks(compilation)
      hooks.alterAssetTagGroups.tap('InlineChunkHtmlPlugin', assets => {
        assets.headTags = assets.headTags.map(tagFunction)
        assets.bodyTags = assets.bodyTags.map(tagFunction)
      })

      // Still emit the runtime chunk for users who do not use our generated
      // index.html file.
      // hooks.afterEmit.tap('InlineChunkHtmlPlugin', () => {
      //   Object.keys(compilation.assets).forEach(assetName => {
      //     if (this.tests.some(test => assetName.match(test))) {
      //       delete compilation.assets[assetName];
      //     }
      //   });
      // });
    })
  }
}
