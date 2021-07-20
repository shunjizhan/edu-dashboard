import axios from 'axios';
import store from '@/store';

const request = axios.create({

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

// 响应拦截器

export default request;
