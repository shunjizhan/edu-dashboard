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
## 4) Layout设置
Layout主要包括侧边导航和Header，我们就直接用element UI的组件，在layout里面创建两个对应的component。

这里用到的css
```scss
.header {
  // 实现vertical align: center
  height: 100%;
  display: flex;
  align-items: center;

  // 让面包屑在左边，用户头像在右边
  justify-content: space-between;

  // link的图标vertical align: center
  .el-dropdown-link {
    display: flex;
    align-items: center;
  }
}
```

## 5) Login界面基本布局
用element UI的创建好login界面的view，用v-model绑定手机和password。

让login界面的表单（login-form）出现在正中间（上下和左右都是中间）
```scss
.login {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  .login-form {
    width: 300px;
  }
}
```

## 6) Login接口封装和使用
在service/user.ts里面封装了login的函数，这个接口需要的数据类型不是application/json,而是x-www-form-urlencoded,所以需要用到一个库qs来处理一下。

在login.vue里面使用登陆的函数登陆，如果成功的话跳转到原来的界面或者首页。
```ts
async onSubmit() {
  try {
    this.isLoginLoading = true;

    const { data } = await login(this.form);

    if (data.state !== 1) {     // 失败
      this.$message.error(data.message);   // this.$message是Vue.use(ElementUI)的时候注入的
    } else {
      // 在访问需要登录的页面的时候判断有没有登录状态（路由拦截器）
      // 跳转回原来页面或首页
      this.$router.push(this.$route.query.redirect as string || '/');

      this.$message.success('登录成功');
    }
  } catch (err) {
    console.log('登录失败', err);
  }

  // 结束登录按钮的 loading
  this.isLoginLoading = false;
},
```

## 7) 表单验证
element UI的form组件自带表单验证功能，只需要在data()里面添加上功能,然后

```ts
await (this.$refs.form as Form).validate();
```

## 8) 将登陆状态存入vuex
在vuex中加一个mutation，可以set当前的user以及把user存在localstorage里面，这样刷新界面以后还会保持登录状态。在登陆成功以后，就调用
```ts
this.$store.commit('setUser', userData);
```