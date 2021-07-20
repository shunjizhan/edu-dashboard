# Education Dashboard
## 杂
### 装饰器的使用（不建议在生产环境使用，有可能有重大改变）
```ts
function decorate (target) {
  target.x = true;
}

@decorate
class MyClass { ... }

console.log(MyClass.x)  // => true
```

### Vue with TS
想要ts的static analysis和vs code的提示，有两种方式
- Vue.extend(...)
- class API
我们这个项目主要用到第一种，因为装饰器还不是特别官方，可能会有重大改动

## 共享全局样式变量
如果要在组件中单独使用变量，必须要import
```html
<style lang="scss" scoped>
@import '~@/styles/variables.scss';

.text {
  color: $success-color;
}
</style>
```

想让组件更方便的使用全局变量，比如color，可以写在vue.config.js里面传入共享全局变量。