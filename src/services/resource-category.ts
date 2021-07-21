import request from '@/utils/request';

export const getResourceCategories = () => request({
  method: 'GET',
  url: '/boss/resource/category/getAll',
});
