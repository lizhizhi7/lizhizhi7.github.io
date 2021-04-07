---
layout:     post
title:      Deno + WebAssembly
date:       2020-9-10
author:     Oliver Li
catalog:    true
tags:
    - TypeScript
    - Deno
    - WebAssembly
---

# Deno + WebAssembly

## 准备环境

*  [*Deno VSCode plugin*](https://marketplace.visualstudio.com/items?itemName=axetroy.vscode-deno) *from* [*axetroy*](https://github.com/axetroy)

* Runtime types `deno types > lib/lib.deno_runtime.d.ts`

* tsconfig need include types definition

  ```json
    {
      "compilerOptions": {
      "allowJs": true,
      "esModuleInterop": true,
      "lib": ["esnext"],
      "module": "esnext",
      "moduleResolution": "node",
      "noEmit": true,
      "pretty": true,
      "resolveJsonModule": true,
      "target": "esnext"
    },
    "include": [
      "./**/*.ts"
    ]
  }
  ```

> By default now, Visual Studio Code will be able type check your modules against the Deno runtime library in the same way Deno will.

* Intellisense for remote modules

The final piece of the puzzle is getting intellisense for remote modules. TypeScript language services will not go off and fetch remote modules for you, while Deno supports `import * as foo from "https://example.com/foo.ts"` perfectly well. Again, the good news is that we can tell TypeScript language services to look somewhere on the local file system for resources. While it won’t go fetch them for you, after you run your application in `deno` and the remote modules are fetched, they will be cached locally, and you can point TypeScript at that cache. The way this is accomplished is by using the `paths` compiler option. Deno defaults to a local cache that is the standard place for the cache files for an operating system. On MacOS this is `~/Library/Caches/deno` and on Linux it is `~/.cache/deno`. Details can be found in the [Deno user manual](https://deno.land/manual.html#linkingtothirdpartycode). The challenge is that TypeScript can only resolve the `paths` relative to the `baseUrl` compiler option. You will need to adjust your `tsconfig.json` again, adding `paths` and `baseUrl`:

```json
{
  "compilerOptions": {
    "allowJs": true,
    "baseUrl": ".",
    "esModuleInterop": true,
    "lib": ["esnext"],
    "module": "esnext",
    "moduleResolution": "node",
    "noEmit": true,
    "paths": {
      "http://*": ["../../Library/Caches/deno/deps/http/*"],
      "https://*": ["../../Library/Caches/deno/deps/https/*"],
    },
    "plugins": [ { "name": "deno_ls_plugin" } ],
    "pretty": true,
    "resolveJsonModule": true,
    "target": "esnext"
  },
  "include": [
    "./**/*.ts"
  ]
}
```

## 安装rust

由于我们正在用 Rust 编写函数，因此你还需要安装 Rust 语言编译器和工具。

- `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`

最后，ssvmup 工具可以自动执行构建过程并生成所有工件，以使你的 Deno 应用程序轻松调用 Rust 函数。同样，用一条命令就能安装 ssvmup 依赖项。

- `curl https://raw.githubusercontent.com/second-state/ssvmup/master/installer/init.sh -sSf | sh`

  > ssvmup 使用 wasm-bindgen 在 JavaScript 和 Rust 源代码之间自动生成“胶水”代码，以便它们可以使用自己的原生数据类型来通信。没有它，函数参数和返回值只能限制在 WebAssembly 原生支持的一些非常简单的类型上（如 32 位整数）。例如，如果没有 ssvmup 和 wasm-bindgen，你就无法使用字符串或数组。

https://github.com/second-state/ssvm-deno-starter