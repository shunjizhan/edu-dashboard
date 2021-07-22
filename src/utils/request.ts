import axios from 'axios';
import { Message } from 'element-ui';
import qs from 'qs';

import store from '@/store';
import router from '@/router';

const request = axios.create({
  baseURL: '/api',    // 所有请求都会prepend上 /api
});

// 请求拦截器,可以在这里统一设置user token authorization
request.interceptors.request.use(config => {
  const res = { ...config };

  const { user } = store.state;
  if (user && user.access_token) {
    res.headers.Authorization = user.access_token;
  }

  return res;
}, Promise.reject);

let isRefreshing = false;         // 避免同时几个401导致重复刷新token
let requests: Array<any> = [];    // 存储刷新 token 期间过来的 401 请求
const flushRequests = () => {
  requests.forEach(cb => cb());
  requests = [];
};

function redirectLogin() {
  router.push({
    name: 'login',
    query: {
      redirect: router.currentRoute.fullPath,
    },
  });
}

function refreshToken() {
  // 为了刷新失败导致的无限循环，用axios.create()创建一个新的请求
  // 这样如果再一次401的话就不会再走响应拦截器，避免无限循环。
  return axios.create()({
    method: 'POST',
    baseURL: '/api',
    url: '/front/user/refresh_token',
    data: qs.stringify({
      // refresh_token 只能使用1次
      refreshtoken: store.state.user.refresh_token,
    }),
  });
}

const handleSuccess = (response: any): Promise<any> => {     // eslint-disable-line
  // (如果用的http状态码）状态码为 2xx 都会进入这里
  return response;
};

const handle401 = (error: any): Promise<any> => {    // eslint-disable-line
  console.log('handle401');
  // token 无效（没有提供 token、token 是无效的、token 过期了）
  // 如果有 refresh_token 则尝试使用 refresh_token 获取新的 access_token

  // 没有登录，直接退回登录界面
  if (!store.state.user) {
    redirectLogin();
    return Promise.reject(error);
  }

  // 刷新 token
  if (!isRefreshing) {
    isRefreshing = true;

    refreshToken().then(res => {
      console.log('refreshToken', res);
      if (!res.data.success) {
        throw new Error('刷新 Token 失败');
      }

      // 刷新 token 成功了, 重新存储user，并把之前401的请求重新发出去
      store.commit('setUser', JSON.parse(res.data.content));
      flushRequests();
    }).catch(newErr => {
      console.log(newErr);
      store.commit('setUser', null);
      redirectLogin();

      return Promise.reject(error);
    }).finally(() => {
      isRefreshing = false; // 重置刷新状态
    });
  }

  // 这里必须要返回一个Promise，以便401的catch之后，我们重新发了request，还能继续执行then
  return new Promise(resolve => {
    requests.push(() => {
      resolve(request(error.config));
    });
  });
};

type errMsgMap = {
  [key: number]: string
}

const handleError = async (error: any): Promise<any> => {    // (如果用的http状态码）超出 2xx 状态码都都执行这里
  if (error.response) {                 // 情况1：请求发出去收到响应了，但是状态码超出了 2xx 范围
    const { status } = error.response;

    const errMsg: errMsgMap = {
      400: '请求参数错误',
      403: '没有权限，请联系管理员',
      404: '请求资源不存在',
    };

    if (errMsg[status]) {               // eslint-disable-line
      Message.error(errMsg[status]);    // eslint-disable-line
    } else if (status >= 500) {
      Message.error('服务端错误，请联系管理员');
    } else if (status === 401) {
      return handle401(error);
    }
  } else if (error.request) {           // 情况2：请求发出去没有收到响应，比如网络超时
    Message.error('请求超时，请刷新重试');
  } else {                              // 情况3：其它未知错误，可能是连请求都没发出去
    Message.error(`请求失败：${error.message}`);
  }

  // 把请求失败的错误对象继续抛出，扔给上一个调用者
  return Promise.reject(error);
};

// 响应(response)拦截器
request.interceptors.response.use(handleSuccess, handleError);

export default request;
