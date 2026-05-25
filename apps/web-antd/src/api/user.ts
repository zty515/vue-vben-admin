import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemUserApi {
  export interface SystemUser {
    [key: string]: any;
    id: string;
    name: string;
    permissions: string[];
    remark?: string;
    status: 0 | 1;
  }
}

/**
 * 获取用户列表数据
 */
async function getUserList(params: Recordable<any>) {
  return requestClient.get<Array<SystemUserApi.SystemUser>>('/api/users', {
    params,
  });
}

/**
 * 创建用户
 * @param data 用户数据
 */
async function createUser(data: Omit<SystemUserApi.SystemUser, 'id'>) {
  return requestClient.post('/api/users', data);
}

/**
 * 更新用户
 *
 * @param id 用户 ID
 * @param data 用户数据
 */
async function updateUser(
  id: string,
  data: Omit<SystemUserApi.SystemUser, 'id'>,
) {
  return requestClient.put(`/api/users/${id}`, data);
}

/**
 * 删除用户
 * @param id 用户 ID
 */
async function deleteUser(id: string) {
  return requestClient.delete(`/api/users/${id}`);
}

async function getUserDetail(id: string) {
  return requestClient.get<SystemUserApi.SystemUser>(`/api/users/${id}`);
}

//
async function getRoleOptionstList() {
  return requestClient.get<Array<SystemUserApi.SystemUser>>(
    '/api/roles/options',
  );
}

export {
  createUser,
  deleteUser,
  getRoleOptionstList,
  getUserDetail,
  getUserList,
  updateUser,
};
