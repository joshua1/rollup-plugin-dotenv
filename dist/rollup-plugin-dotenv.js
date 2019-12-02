'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex
}

var fs = _interopDefault(require('fs'))
var path = _interopDefault(require('path'))
var dotenv = _interopDefault(require('dotenv'))
var replace = _interopDefault(require('rollup-plugin-replace'))

function _extends() {
  _extends =
    Object.assign ||
    function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key]
          }
        }
      }

      return target
    }

  return _extends.apply(this, arguments)
}

const mapKeys = (mapper, obj) =>
  Object.keys(obj).reduce((acc, key) => {
    acc[mapper(key)] = obj[key]
    return acc
  }, {})
const mapValues = (mapper, obj) =>
  Object.keys(obj).reduce((acc, key) => {
    acc[key] = mapper(obj[key])
    return acc
  }, {})
const pick = (props, obj) =>
  props.reduce((acc, prop) => {
    acc[prop] = obj[prop]
    return acc
  }, {})
const pipe = (...funcs) =>
  funcs.reduceRight((piped, next) => (...args) => piped(next(...args)))
const shallowMergeAll = objs => Object.assign({}, ...objs)

const withDefaults = ({ cwd = '.', envKey = 'NODE_ENV' } = {}) => ({
  cwd: path.resolve(process.cwd(), cwd),
  envKey,
})

function dotenvPlugin(inputOptions) {
  const _withDefaults = withDefaults(inputOptions),
    cwd = _withDefaults.cwd,
    envKey = _withDefaults.envKey

  return _extends(
    {},
    replace(
      pipe(
        priorities =>
          [...priorities]
            .reverse()
            .map(dotenvFile => path.join(cwd, dotenvFile))
            .filter(fs.existsSync)
            .map(dotenvFile => fs.readFileSync(dotenvFile))
            .map(dotenv.parse),
        shallowMergeAll,
        envVars =>
          shallowMergeAll([
            envVars,
            pick(
              Object.keys(envVars).filter(
                key => process.env[key] !== undefined,
              ),
              process.env,
            ),
          ]),
        envVars => mapKeys(key => `process.env.${key}`, envVars),
        envVars => mapValues(value => JSON.stringify(value), envVars),
      )([
        `.env.${process.env[envKey]}.local`,
        `.env.${process.env[envKey]}`,
        '.env',
      ]),
    ),
    {
      name: 'dotenv',
    },
  )
}

exports.default = dotenvPlugin
