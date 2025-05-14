# Vue3版本的Ajax请求包装工具

封装了axios库。

请求后端时，要从sessionStorage、localStorage、Cookies 3个存储中读取Token

Token的名称在 window.tokenName 配置，如果为空，则默认为Token

请求时，携带的header头为上述的名称

## 1、使用方式

在package.json中引入包 

```js
"maque-request-ts": "^1.0.1"
```

或使用安装命令

```shell
npm install maque-request-ts
```

在需要调用的地方使用

```js
import requestWrap from "maque-request-ts";
```

然后调用即可

```js
function getBeijing() {
  //https://api.vvhan.com/api/60s
  requestWrap({url: "/api/one"}).then(res => {
    result.value = res;
  })
}
```

返回值说明：

默认只返回后端BodyVo中的data，如果你需要整个body返回，请增加参数 fullBack:true

```json
{url: "/api/one",fullBack:true}
```

如果是文件请求下载，也就是 responseType='blob' 时，也会返回整个body



## 2、注意说明

该库只依赖于Vue3,Element-Plus，所以项目必须要引入Element-Plus，并在Main.ts或main.js中进行初始化



## 3、Git地址

https://github.com/4color/maque-request-ts
