import request from '@/utils/request';
import qs from 'qs';

interface LoginData {
  phone: string
  password: string
}

export const login = (data: LoginData) => request({
  method: 'POST',
  url: '/front/user/login',
  data: qs.stringify(data),   // axios 默认发送的是 application/json 格式的数据

  // headers: { 'content-type': 'application/x-www-form-urlencoded' },
  // 上一行可以省略：
  // 如果 data 是普通对象，则 Content-Type 是 application/json
  // 如果 data 是 qs.stringify(data) 转换之后的数据：key=value&key=value，则 Content-Type 会被设置为 application/x-www-form-urlencoded
  // 如果 data 是 FormData 对象，则 Content-Type 是 multipart/form-data
});

export const getUserInfo = () => request({
  method: 'GET',
  url: '/front/user/getInfo',
});

export const getUserPages = (data: any) => request({
  method: 'POST',
  url: '/boss/user/getUserPages',
  data,
});

export const forbidUser = (userId: string | number) => request({
  method: 'POST',
  url: '/boss/user/forbidUser',
  params: {
    userId,
  },
});
