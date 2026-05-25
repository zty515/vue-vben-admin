import type { Recordable, RouteRecordStringComponent } from '@vben/types';

import { fullResponseClient, requestClient } from '#/api/request';

interface MenuResponse {
  list: RouteRecordStringComponent[]; // 明确声明有 list 属性
  [key: string]: any;
}

/**
 * 获取用户菜单列表
 */
export async function getPermissions() {
  return requestClient.get<MenuResponse>('/api/permissions');
}

export async function postPermissions(data) {
  return fullResponseClient.post('/api/permissions', data);
}

/**
 * 删除用户菜单列表
 *
 */
export async function deletePermissionsApi(id: number) {
  return fullResponseClient.delete(`/api/permissions/${id}`);
}

/**
 * 获取用户菜单列表详情
 *
 */
export async function getPermissionsDetailApi(id: number) {
  return fullResponseClient.get(`/api/permissions/${id}`);
}

// 修改用户菜单列表
export async function putPermissionsApi(id: number, data) {
  return fullResponseClient.put(`/api/permissions/${id}`, data);
}

// 获取权限树
export async function getMenuList(params: Recordable<any>) {
  return requestClient.get<MenuResponse>('/api/permissions/tree', { params });
}
