import type { Recordable } from '@vben/types';

import { fullResponseClient, requestClient } from '#/api/request';

export namespace SystemRoleApi {
  export interface SystemRole {
    [key: string]: any;
    id: string;
    name: string;
    permissions: string[];
  }

  export interface RoleListResponse {
    list: SystemRole[];
    total: number;
  }
}

/**
 * 获取角色列表数据
 */
async function getShippingList(params: Recordable<any>) {
  return requestClient.get<SystemRoleApi.RoleListResponse>('/api/shippings', {
    params,
  });
}

async function createShipping(data: any) {
  return requestClient.post('/api/shippings', data);
}

async function updateShipping(id: number, data: any) {
  return requestClient.put(`/api/shippings/${id}`, data);
}
async function getCountryOptionstList() {
  return requestClient.get('/api/shippings/countries');
}

async function getShippingDetail(id: number) {
  return requestClient.get(`/api/shippings/${id}`);
}

async function batchDelete(data: any) {
  return fullResponseClient.post(`/api/shippings/batch_delete`, data);
}

async function updateShippingStatus(data: any) {
  return requestClient.post(`/api/shippings/batch_update`, data);
}

async function updateShippingDescription(data: any) {
  return requestClient.post(`/api/shippings/batch_update`, data);
}

async function addrate(data: any) {
  return requestClient.post(`/api/shippings/set_add_rate`, data);
}

export {
  addrate,
  batchDelete,
  createShipping,
  getCountryOptionstList,
  getShippingDetail,
  getShippingList,
  updateShipping,
  updateShippingDescription,
  updateShippingStatus,
};
