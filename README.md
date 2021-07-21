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

## 9) 校验界面访问权限
路由设置里面的meta可以随意加数据，我们为需要login才能访问的界面加上requireLogin：true，然后在**全局前置守卫**里面判断是否放行，如果没有登录则跳转回登录界面。
在路由这里可以拿到store是因为直接在上面`import store from '@/store';`
```ts
// 全局前置守卫：任何界面的访问都要经过这里。
router.beforeEach((to, from, next) => {
  // to.matched是整个路由的链的数组，包括子路由和副路由
  if (to.matched.some(x => x.meta.requireLogin)) {
    if (!store.state.user) {
      next({ name: 'login' });    // 跳转
    } else {
      next();   // 放行
    }
  } else {
    next();     // 放行
  }
});
```

## 10) 展示用户信息
封装一个getUserInfo的接口，需要传入当然用户的token。在header component里面调用一下，拿到用户数据并且展示。

同时我们设置了一个默认的头像，因为是动态绑定，需要用require传进来。
```html
<el-avatar
  :src="userInfo.portrait || require('../../assets/default-avatar.png')"
></el-avatar>
```

## 11) 统一设置auth token
如果每个reques都要加上Authorization: xxx就会很麻烦，我们可以用请求拦截器来统一设置token。在用用户登陆的情况下，给request自动加上Authorization。
```ts
request.interceptors.request.use(config => {
  const res = { ...config };

  const { user } = store.state;
  if (user && user.access_token) {
    res.headers.Authorization = user.access_token;
  }

  return res;
}, Promise.reject);
```

## 12) 用户退出
这里比较tricky的是我们给`<el-dropdown-item>`设置click事件的时候，不能直接`@click="handleLogOut"`，因为这是一个组件，不是一个原生的DOM，而且内部也没有继续处理@click。所以我们需要把click事件handler注册给这个component的根节点：`@click.native="handleLogOut"`

Logout的逻辑很简单，就是清空store里面的user（mutation里面同时会清空localstorage），然后在redirect到login界面

## 13) 处理token过期的问题
token一般都有一个过期时间(login的时候会返回一个expires_in),目的是为了安全性，就算有人拿到了token，也不能长时间使用。（这个动机有点类似于鼓励用户经常换密码）

这里可以用到**响应(response)拦截器**。request返回401包含几种情况：没有提供token，token无效，token过期，所以我们可以在响应拦截器里面判断如果返回401，并且登陆的时候返回了refreshToken的话，就尝试重新刷新token。

为了刷新失败导致的无限循环，一个巧妙的办法就是不要用我们配置好的request发请求，而是用axios.create()创建一个新的请求，这样如果再一次401的话就不会再走响应拦截器，避免无限循环。
```ts
axios.create()({
  method: 'POST',
  url: '/front/user/refresh_token',
  data: qs.stringify({
    // refresh_token 只能使用1次
    refreshtoken: store.state.user.refresh_token,
  }),
})
```

为了防止几个请求同时401，重复的刷新token (refreshToken只能使用一次，之后的会fail），我们可以加一个flag: `isRefreshing`，这样保证只有一次refreshToken的POST请求在执行。同时，我们把几个401的请求包装进cb存起来，在refreshToken成功了以后的then()中，再重新调用这些cb。

需要注意的一点是，这里的handleErr() => handle401()必须要返回一个promise，resolve掉后来重新发送的requests。因为我们最终是想拿到data，然后存起来：
```ts
// 存用户data
async loadUserInfo() {
  const { data } = await getUserInfo(); 
  this.userInfo = data.content;
}
```

成功的流程：
```
request (200)
=> .then()
=> 存用户data
```

失败的流程：
```
request (401)
=> .catch()
  => handleErr()
  => handle401()
  => refreshToken()
  => res = new request()
  => resolve(res)
=> .then()
=> 存用户data
```

所以我们的handle401中,对于每一个失败的401，存的cb必须是带resolve的，以便之后的then()继续执行。
```ts
// 错误，仅仅重新request不够，还要resolve重新拿到的结果
return requests.push(() => {
  request(error.config);
});

// 正确
return new Promise(resolve => {
  requests.push(() => {
    resolve(request(error.config));
  });
});
```

**这个例子生动的解释了promise的链式调用的好处，之前不理解为什么catch了以后还需要继续then()，现在知道了原来是可以在catch()里面重新请求，然后再把结果继续传递。**

## 14) 菜单管理
权限管理 => 菜单管理包含两个界面：
- 展示界面：是一个table展示了所有的菜单
- 新建/编辑界面：这两个界面几乎一样，所以公用一个组件，用isEdit的prop来区分。

其它的没啥特别的，就是先包装了所有需要的接口，然后用v-model绑定各种数据，然后绑定event handlers

## 15）资源管理
资源管理界面跟上面的菜单管理很类似，就是从api接口拿数据，然后跟table绑定。

有两点不太一样：分页和搜索功能。

分页：
这里要用到elementUI里面提供的`<el-pagination>`来处理分页，主要就是两个handler来处理换页和改变每页显示的数量，实现也很简单，就是把this.form里关于分页的data改变一下，然后重新拿数据（会自动把this.form作为参数）。

搜索：搜索功能其实也是一个form，绑定了数据以后，按搜索按钮就会重新拿数据，并且自动把绑定的数据作为参数（所以就是个纯后端搜索）

还有一点需要注意,对于async function的调用，可以不加await，这样就不会等待，但是也会执行不会报错。
如果几个async function可以并行，就不需要await
```ts
created() {
  this.loadResources();
  this.loadResourceCategories();
},
```