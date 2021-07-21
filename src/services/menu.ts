import request from '@/utils/request';

export const createOrUpdateMenu = (data: any) => request({
  method: 'POST',
  url: '/boss/menu/saveOrUpdate',
  data,
});

export const getEditMenuInfo = (id: string | number = -1) => request({
  method: 'GET',
  url: '/boss/menu/getEditMenuInfo',
  params: {
    id,
  },
});

export const getAllMenus = () => request({
  method: 'GET',
  url: '/boss/menu/getAll',
});

export const deleteMenu = (id: number) => request({
  method: 'DELETE',
  url: `/boss/menu/${id}`,
});

export const getMenuNodeList = () => request({
  method: 'GET',
  url: '/boss/menu/getMenuNodeList',
});

export const allocateRoleMenus = (data: any) => request({
  method: 'POST',
  url: '/boss/menu/allocateRoleMenus',
  data,
});

export const getRoleMenus = (roleId: string | number) => request({
  method: 'GET',
  url: '/boss/menu/getRoleMenus',
  params: { // axios 会把 params 转换为 key=value&key=value 的数据格式放到 url 后面(以?分割)
    roleId,
  },
});
