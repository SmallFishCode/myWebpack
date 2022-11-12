# A Webpack created by smallFish

# 1. 原型 与 Bundle

exports = {}
var a = 1 污染全局
自执行函数 IIFE

eval() 函数会将传入的字符串当做 JavaScript 代码进行执行。
mdn https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/eval

模拟 require

toDo: file ()
读取 file 当中的代码

依赖关系集合
整个大的 IIFE 函数
// 入口
// 产生 bundle.js

总结：

1. 收集依赖 => 生成依赖图（文件名为键名，将每个文件对应代码放到键值中）
2. ES6 转 ES5
3. 替换 require 与 exports

# 2. AST 与 模块分析

1. 安装依赖
   npm init -y 初始化踩坑 （npm 已经废弃 -g 命令）
   https://blog.csdn.net/qq_22182989/article/details/125241810

    - @babel/parser: 将 JS 代码转换成抽象语法树 npm i @babel/parser -S
    - @babel/traverse 遍历器,遍历抽象语法树
    - @babel/core 将 ES6 => ES5 核心源码
    - @babel/preset-env 预设

2. // Todo 有哪些 import 项（正则表达式 or AST 解析）
   // Todo ES6 => ES5
    - 读取文件 fs.readFileSync(file, 'utf-8')
    - 编译过程： 1. 代码字符串 => 对象 => 对象遍历解析 抽象过程 => 代码转换成对象的过程
    - 使用 traverse 遍历 AST 找到 import 结点，获取 url
    - 使用 path 获取到绝对路径
    - 收集到依赖图
3. ES6 => ES5 使用 babel 转换
    - return moduleInfo { file, deps, code }

# 3. 依赖分析 和 打包

1. 解析模块

    - 获取模块信息
    - 创建临时依赖数组 和 依赖图
    - 递归获取依赖 => 生成依赖图

2. 打包生成 bundle.js 文件
