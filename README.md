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

## 1）共享全局样式变量
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

## 2）跨域
服务器端没有设置CORS，如果想要跨域的话可以自vue.config.js里面设置proxy。
```ts
devServer: {
  proxy: {
    // 把对/boss的请求转发到target
    '/boss': {
      target: 'http://eduboss.lagou.com',
      changeOrigin: true,   //  把请求头中的host配置为target
    },
    '/front': {
      target: 'http://edufront.lagou.com',
      changeOrigin: true,
    },
  },
},
```

## 3) 设置路由
很多组件都共享一些界面布局，比如footter，header，侧边导航等等，这些共享的布局我们就可以放到layout中，不同路径特定的组件就是layout的children。
```ts
// login和404不需要Layout，是一个单独的界面，其它的共享layout
const routes: Array<RouteConfig> = [
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: 'login' */ '@/views/login/index.vue'),
  },
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '',   // 默认子路由
        name: 'home',
        component: () => import(/* webpackChunkName: 'home' */ '@/views/home/index.vue'),
      },
      {
        path: '/role',
        name: 'role',
        component: () => import(/* webpackChunkName: 'role' */ '@/views/role/index.vue'),
      },
      // ...
    ],
  },
  {
    path: '*',
    name: '404',
    component: () => import(/* webpackChunkName: '404' */ '@/views/error-page/404.vue'),
  },
];
```
这样设置好以后，我们访问/role, /user等等，都会看到共同的layout布局 

