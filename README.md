# Education Dashboard
这是一个用vue+TS实现的课程管理的dashboard。

部署界面：https://edu-dashboard.vercel.app/#/

## 实现过程
### 0) 准备
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

### 1）共享全局样式变量
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

### 2）跨域
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

### 3) 设置路由
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
### 4) Layout设置
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

### 5) Login界面基本布局
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

### 6) Login接口封装和使用
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

### 7) 表单验证
element UI的form组件自带表单验证功能，只需要在data()里面添加上功能,然后

```ts
await (this.$refs.form as Form).validate();
```

### 8) 将登陆状态存入vuex
在vuex中加一个mutation，可以set当前的user以及把user存在localstorage里面，这样刷新界面以后还会保持登录状态。在登陆成功以后，就调用
```ts
this.$store.commit('setUser', userData);
```

### 9) 校验界面访问权限
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

### 10) 展示用户信息
封装一个getUserInfo的接口，需要传入当然用户的token。在header component里面调用一下，拿到用户数据并且展示。

同时我们设置了一个默认的头像，因为是动态绑定，需要用require传进来。
```html
<el-avatar
  :src="userInfo.portrait || require('../../assets/default-avatar.png')"
></el-avatar>
```

### 11) 统一设置auth token
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

### 12) 用户退出
这里比较tricky的是我们给`<el-dropdown-item>`设置click事件的时候，不能直接`@click="handleLogOut"`，因为这是一个组件，不是一个原生的DOM，而且内部也没有继续处理@click。所以我们需要把click事件handler注册给这个component的根节点：`@click.native="handleLogOut"`

Logout的逻辑很简单，就是清空store里面的user（mutation里面同时会清空localstorage），然后在redirect到login界面

### 13) 处理token过期的问题
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

### 14) 菜单管理
权限管理 => 菜单管理包含两个界面：
- 展示界面：是一个table展示了所有的菜单
- 新建/编辑界面：这两个界面几乎一样，所以公用一个组件，用isEdit的prop来区分。

其它的没啥特别的，就是先包装了所有需要的接口，然后用v-model绑定各种数据，然后绑定event handlers

### 15）资源管理
资源管理界面跟上面的菜单管理很类似，就是从api接口拿数据，然后跟table绑定。

有两点不太一样：分页和搜索功能。

**分页：**
这里要用到elementUI里面提供的`<el-pagination>`来处理分页，主要就是两个handler来处理换页和改变每页显示的数量，实现也很简单，就是把this.form里关于分页的data改变一下，然后重新拿数据（会自动把this.form作为参数）。

**搜索：**
搜索功能其实也是一个form，绑定了数据以后，按搜索按钮就会重新拿数据，并且自动把绑定的数据作为参数（所以就是个纯后端搜索）

还有一点需要注意,对于async function的调用，可以不加await，这样就不会等待，但是也会执行不会报错。
如果几个async function可以并行，就不需要await
```ts
created() {
  this.loadResources();
  this.loadResourceCategories();
},
```

### 16) 角色管理
角色管理主界面也是一个一样的table，跟之前没什么大的区别。
每个角色需要有一个分配资源和分配菜单的界面，里面主要是用树形图选择需要的资源，这里直接用到elementUI的树形图，没有太多特别的，就是调树形图的API。

**父子组件通信：**
可以通过子组件emit一个自定义事件，父组件监听这个事件来实现。
```html
<create-or-edit
  v-if="dialogVisible"
  :role-id="roleId"
  :is-edit="isEdit"
  @success="onSuccess"
  @cancel="dialogVisible = false"
/>

<!-- create-or-edit 里面 -->
<el-button @click="$emit('cancel')">取消</el-button>
```
注意这里需要传入一个`v-if="dialogVisible"`,这样保证每次弹出对话框都会重新创建组件（而不仅仅是隐藏和显示），这样内部的created()才会重新被调用，拿到需要的数据

**组件与路由解耦：**
我们在组件里面可以用this.$route.params拿到路由参数，但是如果我们想让组件结构，可以把参数作为prop传进来，这样这个组件不作为路由组件也可以使用。

这样我们需要在router里面设置，把路由参数作为prop传给组件。
```ts
{
  path: '/role/:roleId/alloc-menu',
  name: 'alloc-menu',
  component: () => import(/* webpackChunkName: 'alloc-menu' */ '@/views/role/alloc-menu.vue'),
  props: true,       // 将路由路径参数映射到组件的 props 数据中
},
```

### 17) 用户管理
跟之前的差不多

### 18）课程管理: 主界面和查看/编辑界面
**::v-deep**
让css作用得更深，到子组件,可以用到`::v-deep`
```html
<style lang="scss" scoped>
::v-deep .avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  ...
}
</style>
```

**上传组件**
我们想实现的上传组件核心的用法是
```html
<course-image
  v-model="course.courseListImg"
  :limit="5"
/>
```
这里的v-model的本质其实是父子组件通信：
- 它会给子组件传递一个名字叫 value 的数据（Props)
- 默认监听 input 事件，修改绑定的数据（自定义事件） 

所以父组件通过value传入（默认的）url，子组件（上传组件）上传成功之后，我们可以用$emit input事件来告诉父组件上传好的文件url，从而更新courseListImg。这样就实现了双向绑定。
```ts
this.$emit('input', url);
```

texteditor组件也是一样的原理： 
```html
<text-editor v-model="course.description" />
```

```ts
initEditor() {
  const editor = new E(this.$refs.editor as any);
  editor.config.onchange = (value: string) => {
    this.$emit('input', value);     // 通知父组件
  };
  // ...
}
```

**上传响应事件：progress**
HTML5 新增了上传响应事件：progress。我们可以在uploadCourseImage接口传入一个cb，处理上传进度。

```ts
const handleUploadProgress = (e: any) => {
  this.percentage = Math.floor((e.loaded / e.total) * 100);
};

const { data } = await uploadCourseImage(fd, handleUploadProgress);
```
### 19）课程管理: 课程内容的查看和编辑


### 20) 打包部署
首先`yarn build`打包，实际是运行vue-cli提供的打包script。

打包好的dist目录有两种启动方法：
- 如果打包的时候把publicPath配置为一个相对的值，可以直接用打开dist/index.html
- 或者用serve这个服务： `yarn add serve -g && serve -s dist`，serve会启动一个静态的web服务器。

但是devServer里面的proxy只对于yarn serve有效(毕竟是在vue.config.js的devServer里面设置的)，只对devServer有效，所以这里我们需要手写一个proxy的服务。

准备：因为vercel的要求，我们把request里面所有的请求都加上/api

**本地proxy测试：**
本地一个express的proxy测试，会发现dist已经可以运行了。
```ts
const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// 托管了 dist 目录，当访问 / 的时候，默认会返回托管目录中的 index.html 文件
app.use(express.static(path.join(__dirname, '../dist')));

app.use('/api/boss', createProxyMiddleware({
  target: 'http://eduboss.lagou.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '',
  },
}));

app.use('/api/front', createProxyMiddleware({
  target: 'http://edufront.lagou.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '',
  },
}));

app.listen(3030, () => {
  console.log('running...');
});
```

**部署到vercel：**
vercel上可以部署[`serverless funtions`](https://vercel.com/docs/serverless-functions/introduction),我们可以类似上面的本地proxy服务器，首先在vercel.json里面设置routes，把请求指向一个serverless function
```json
{
  "routes": [
    {
      "src": "/api/boss/(.*)",
      "dest": "/api/proxy"
    },
    {
      "src": "/api/front/(.*)",
      "dest": "/api/proxy"
    }
  ]
}
```
这样把请求指向了根目录下的`api/proxy.js`:
```ts
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (req, res) => {
  let target = '';

  // 处理代理目标地址
  if (req.url.includes('/api/front')) {
    target = 'http://edufront.lagou.com';
  } else if (req.url.startsWith('/api/boss')) {
    target = 'http://eduboss.lagou.com';
  }

  // 创建代理对象并转发请求
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: {
      // 通过路径重写，去除请求路径中的 /api
      // 例如 /api/boss/xxx 将被转发到 http://eduboss.lagou.com/boss/xxx
      '^/api': '',
    },
  })(req, res);
};
```

