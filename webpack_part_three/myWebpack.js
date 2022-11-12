const fs = require('fs') // node 的文件操作模块
const path = require('path') // node 的路径操作模块
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const babel = require('@babel/core')

// Todo ES6 => ES5

/**
 * 分析单独模块
 * @param {*} file
 */

function getModuleInfo(file) {
	// 1. 读取文件
	const body = fs.readFileSync(file, 'utf-8')
	// console.log('body:', body)

	// Todo 有哪些 import 项 （正则表达式 or AST解析）
	// 转换 AST 抽象语法树
	// 1. 代码字符串 => 对象 => 对象遍历解析
	// 编译过程 parser => traverse => babel
	const ast = parser.parse(body, {
		sourceType: 'module', // ESModule 代码组织关系
	})
	// console.log('ast:', ast)

	const deps = {}
	traverse(ast, {
		// visited
		ImportDeclaration({ node }) {
			// 遇到 import 结点时会调用
			// console.log('import:', node)
			const dirname = path.dirname(file) // 计算当前文件的路径 入口文件绝对路径作为相对路径
			const abspath = './' + path.join(dirname, node.source.value)
			// console.log('abspath:', abspath)
			deps[node.source.value] = abspath
		},
	})

	// ES6 => ES5 使用 babel 转换
	const { code } = babel.transformFromAst(ast, null, {
		presets: ['@babel/preset-env'],
	})

	const moduleInfo = { file, deps, code }
	return moduleInfo
}

// const info = getModuleInfo('./src/index.js')
// console.log('info:', info)

/**
 * 解析模块
 */
function parseModules(file) {
	const entry = getModuleInfo(file)
	const temp = [entry] // 临时依赖数组
	const depsGraph = {}

	// 获取依赖
	getDeps(temp, entry)

	// 构造依赖图
	temp.forEach((info) => {
		depsGraph[info.file] = {
			deps: info.deps,
			code: info.code,
		}
	})

	return depsGraph
}

/**
 * 递归获取依赖
 */
function getDeps(temp, { deps }) {
	Object.keys(deps).forEach((key) => {
		const child = getModuleInfo(deps[key])
		temp.push(child)
		getDeps(temp, child)
	})
}

// 测试
// const result = parseModules('./src/index.js')
// console.log('result:', result)

/**
 * 打包出 bundle 文件
 */
function bundle(file) {
	const depsGraph = JSON.stringify(parseModules(file))
	return `(function (graph) {
		function require(file) {
			function absRequire(relPath) {
				return require(graph[file].deps[relPath])
			}
			var exports = {}
			;(function (require, exports, code) {
				eval(code)
			})(absRequire, exports, graph[file].code)
			return exports
		}

		require('${file}')
	})(${depsGraph})`
}

const bundleContent = bundle('./src/index.js')
// console.log('bundleContent:', bundleContent)

// 创建 dist 文件夹
!fs.existsSync('./dist') && fs.mkdirSync('./dist')
fs.writeFileSync('./dist/bundle.js', bundleContent)
