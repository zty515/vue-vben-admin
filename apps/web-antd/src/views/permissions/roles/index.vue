<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { AccessControl } from '@vben/access';
import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteRole, getRoleDetail, getRoleList } from '#/api/roles';
import { $t } from '#/locales';

import { useColumns } from './data';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

interface SystemRole {
  [key: string]: any;
  id: string;
  name: string;
  permissions: string[];
  remark?: string;
  status: 0 | 1;
}

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: useColumns(),
    height: 'auto',
    keepSource: true,

    proxyConfig: {
      response: {
        result: 'list', // 告诉组件数据在 list 字段
        total: 'total', // 告诉组件总数在 total 字段
      },
      ajax: {
        query: async ({ page }, formValues) => {
          return await getRoleList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },

    toolbarConfig: {
      custom: false,
      export: false,
      refresh: false,
      search: false,
      zoom: false,
    },
  } as VxeTableGridOptions<SystemRole>,
});

function onActionClick(e: any) {
  switch (e.code) {
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
  }
}

/**
 * 将Antd的Modal.confirm封装为promise，方便在异步函数中调用。
 * @param content 提示内容
 * @param title 提示标题
 */
// function confirm(content: string, title: string) {
//   return new Promise((reslove, reject) => {
//     Modal.confirm({
//       content,
//       onCancel() {
//         reject(new Error('已取消'));
//       },
//       onOk() {
//         reslove(true);
//       },
//       title,
//     });
//   });
// }

/**
 * 状态开关即将改变
 * @param newStatus 期望改变的状态值
 * @param row 行数据
 * @returns 返回false则中止改变，返回其他值（undefined、true）则允许改变
 */
// async function onStatusChange(
//   newStatus: number,
//   row: SystemRole,
// ) {
//   const status: Recordable<string> = {
//     0: '禁用',
//     1: '启用',
//   };
//   try {
//     await confirm(
//       `你要将${row.name}的状态切换为 【${status[newStatus.toString()]}】 吗？`,
//       `切换状态`,
//     );
//     await updateRole(row.id, { status: newStatus });
//     return true;
//   } catch {
//     return false;
//   }
// }

function onEdit(row: SystemRole) {
  const hideLoading = message.loading({
    content: '加载中...',
    duration: 0,
    key: 'edit_loading',
  });

  // 调用接口获取详情
  getRoleDetail(row.id)
    .then((detail) => {
      hideLoading();
      // 打开抽屉并传递详情数据

      formDrawerApi.setData(detail).open();
    })
    .catch(() => {
      hideLoading();
      message.error('获取角色详情失败');
    });
}

function onDelete(row: SystemRole) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteRole(row.id)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.name]),
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => {
      hideLoading();
    });
}

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid table-title="角色列表">
      <template #toolbar-tools>
        <AccessControl :codes="['roles.store']" type="code">
          <Button type="primary" @click="onCreate">
            <Plus class="size-5" />
            {{ $t('ui.actionTitle.create', ['角色']) }}
          </Button>
        </AccessControl>
      </template>

      <template #operation="{ row }">
        <div class="flex justify-center gap-2">
          <Button
            type="link"
            size="small"
            @click="onActionClick({ code: 'edit', row })"
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            @click="onActionClick({ code: 'delete', row })"
          >
            删除
          </Button>
        </div>
      </template>
    </Grid>
  </Page>
</template>
