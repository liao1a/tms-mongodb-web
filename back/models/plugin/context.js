const log4js = require('@log4js-node/log4js-api')
const logger = log4js.getLogger('tms-mongodb-web')
const path = require('path')
const glob = require('glob')
const { PluginBase } = require('./base')

const RequiredProps = ['name', 'scope', 'title', 'description']

let _pluginsByName = new Map() // 插件名称到插件示例

let _dbProfiles = [] // 数据库插件简要描述
let _clProfiles = [] // 集合插件简要描述
let _docProfiles = [] // 文档插件简要描述

class Context {
  get dbPlugins() {
    return _dbProfiles
  }
  get clPlugins() {
    return _clProfiles
  }
  get docPlugins() {
    return _docProfiles
  }
  byName(name) {
    return _pluginsByName.get(name)
  }
}
/**
 * 检查插件信息是否设置正确
 *
 * @param {object} plugin
 */
function validatePlugin(plugin) {
  return plugin
    .validate()
    .then(() => {
      return true
    })
    .catch((reason) => {
      logger.warn(reason)
      return false
    })
}

Context.init = (function () {
  let _instance
  return async function (pluginConfig) {
    if (_instance) return _instance

    let { dir } = pluginConfig
    let absDir = path.resolve(process.cwd(), dir)
    logger.info(`从目录[${absDir}]读取插件文件`)
    let files = glob.sync(`${absDir}/*.js`)
    for (let i = 0, file; i < files.length; i++) {
      file = files[i]
      let { createPlugin } = require(file)
      if (!createPlugin || typeof createPlugin !== 'function') {
        logger.warn(
          `插件文件[${path.basename(file)}]不可用，没有导出[createPlugin]方法`
        )
        continue
      }
      let plugin = createPlugin(path.basename(file))
      if (!plugin || !(plugin instanceof PluginBase)) {
        logger.warn(`插件文件[${path.basename(file)}]不可用，未创建插件对象`)
        continue
      }
      if (plugin.disabled === true) {
        logger.warn(`插件文件[${plugin.file}]已禁用`)
        continue
      }
      let passed = await validatePlugin(plugin)
      if (passed) {
        if (_pluginsByName.has(plugin.name)) {
          logger.warn(
            `插件文件[${plugin.file}]不可用，已有同名插件[name=${plugin.name}]`
          )
          continue
        }
        let { name, scope } = plugin
        switch (scope) {
          case 'database':
            _dbProfiles.push(plugin.profile)
            break
          case 'collection':
            _clProfiles.push(plugin.profile)
            break
          case 'document':
            _docProfiles.push(plugin.profile)
            break
        }
        _pluginsByName.set(name, plugin)

        logger.info(`从文件[${plugin.file}]创建插件[name=${name}]`)
      }
    }

    _instance = new Context()

    return _instance
  }
})()

Context.ins = Context.init

module.exports = { Context }
