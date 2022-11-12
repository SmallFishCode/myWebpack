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
