import request from '@/utils/request';

export const getRoles = (data: any) => request({
  method: 'POST',
  url: '/boss/role/getRolePages',
  data,
});

export const deleteRole = (id: string | number) => request({
  method: 'DELETE',
  url: `/boss/role/${id}`,
});

export const createOrUpdate = (data: any) => request({
  method: 'POST',
  url: '/boss/role/saveOrUpdate',
  data,
});

export const getRoleById = (id: string | number) => request({
  method: 'GET',
  url: `/boss/role/${id}`,
});

export const getAllRoles = () => request({
  method: 'GET',
  url: '/boss/role/all',
});

export const allocateUserRoles = (data: any) => request({
  method: 'POST',
  url: '/boss/role/allocateUserRoles',
  data,
});

export const getUserRoles = (userId: string | number) => request({
  method: 'GET',
  url: `/boss/role/user/${userId}`,
});
