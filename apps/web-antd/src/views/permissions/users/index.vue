<script lang="ts" setup>
// import type { SystemDeptApi, SystemUserApi } from '#/api';
import { onMounted, ref } from 'vue';

import { AccessControl } from '@vben/access';
import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteUser,
  getRoleOptionstList,
  getUserDetail,
  getUserList,
} from '#/api/user';
import { $t } from '#/locales';

import { useColumns } from './data';
import Form from './modules/form.vue';

interface SystemUser {
  [key: string]: any;
  id: string;
  name: string;
  account: string;
  created_at: string;
  status: 0 | 1;
}

interface SystemDept {
  [key: string]: any;
  id: string;
  name: string;
}

const optionList = ref<SystemDept[]>([]);

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

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
          return await getUserList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },

    toolbarConfig: {
      export: false,
    },
  },
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

function onEdit(row: SystemUser) {
  const hideLoading = message.loading({
    content: '加载中...',
    duration: 0,
    key: 'edit_loading',
  });

  // 调用接口获取详情
  getUserDetail(row.id)
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

function onDelete(row: SystemUser) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteUser(row.id)
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

async function loadOptionList() {
  try {
    const res = (await getRoleOptionstList()) as unknown as {
      list: SystemDept[];
    };
    optionList.value = res.list;
  } catch (error) {
    console.error('Failed to load department list:', error);
  }
}

onMounted(() => {
  loadOptionList();
});
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid table-title="员工列表">
      <template #toolbar-tools>
        <AccessControl :codes="['users.store']" type="code">
          <Button type="primary" @click="onCreate">
            <Plus class="size-5" />
            {{ $t('ui.actionTitle.create', ['员工']) }}
          </Button>
        </AccessControl>
      </template>

      <template #operation="{ row }">
        <div class="flex justify-center gap-2">
          <AccessControl :codes="['users.update', 'users.destroy']" type="code">
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
          </AccessControl>
        </div>
      </template>
    </Grid>
  </Page>
</template>
