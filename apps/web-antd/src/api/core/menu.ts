import type { RouteRecordStringComponent } from '@vben/types';

import { requestClient } from '#/api/request';

interface MenuResponse {
  list: RouteRecordStringComponent[]; // 明确声明有 list 属性
  [key: string]: any;
}

/**
 * 获取用户所有菜单
 */
export async function getAllMenusApi() {
  return requestClient.get<MenuResponse>('/api/user_permissions');
}
