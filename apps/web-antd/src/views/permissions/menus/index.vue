<script lang="ts" setup>
import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { computed, ref } from 'vue';

import { AccessControl } from '@vben/access';
import { useVbenModal, VbenButton } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deletePermissionsApi,
  getPermissions,
  getPermissionsDetailApi,
} from '#/api/permissions';

import Formmenu from './Formmenu.vue';

interface RowType {
  id: number;
  pid: number;
  name: string;
  path: string;
  status: number;
  type: number;
  component?: string;
  meta?: {
    icon?: string;
    title?: string;
  };
  children?: RowType[];
}

async function getPermissionsApi() {
  try {
    const res = await getPermissions();
    parentOptions.value = res;
    return {
      items: res,
      total: res.length,
    };
  } catch (error) {
    console.error('获取数据失败:', error);
    message.error('获取数据失败');
    return {
      total: 0,
      items: [],
    };
  }
}

const gridOptions: VxeGridProps<RowType> = {
  columns: [
    { field: 'meta.title', minWidth: 300, title: '页面标题', treeNode: true },
    { field: 'name', title: '路由名称' },
    { field: 'path', title: '路径' },
    {
      field: 'action',
      slots: { default: 'action' },
      title: '操作',
      width: 200,
    },
  ],
  proxyConfig: {
    ajax: {
      query: async () => {
        return await getPermissionsApi();
      },
    },
    autoLoad: true,
    response: {
      result: 'items',
      total: 'total',
    },
  },
  treeConfig: {
    childrenField: 'children',
    showIcon: true,
  },
  pagerConfig: {
    enabled: true,
  },
  sortConfig: {
    multiple: true,
  },
};

const addMenuRef = ref<InstanceType<typeof Formmenu> | null>(null);
const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });
const currentEditDetail = ref<any>(null);

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    if (addMenuRef.value) {
      const result = await addMenuRef.value.handleSubmit(); // 调用子组件的提交方法
      if (result?.success) {
        // 提交成功，关闭弹窗并刷新表格
        modalApi.close();
        gridApi.reload();
        message.success(
          modalTitle.value === '编辑菜单' ? '编辑成功' : '添加成功',
        );
      } else {
        // 提交失败，不关闭弹窗，让用户修改
        console.warn('提交失败:', result?.error);
      }
    }
  },
  onCancel() {
    // 关闭时清空编辑记录
    currentEditRecord.value = null;
  },
});

const handleAdd = () => {
  currentEditRecord.value = null;
  modalTitle.value = '添加菜单';
  modalApi.open();
};

const handleEdit = async (row: RowType) => {
  try {
    // isLoadingDetail.value = true;
    modalTitle.value = '编辑菜单';

    // 调用详情接口
    const res = await getPermissionsDetailApi(row.id);

    if (res?.data?.code === 0) {
      // currentEditId.value = row.id;
      currentEditDetail.value = res.data.data; // 根据实际返回的数据结构调整
      modalApi.open();
    } else {
      message.error(res?.data?.message || '获取菜单详情失败');
    }
  } catch (error) {
    console.error('获取菜单详情失败:', error);
    message.error('获取菜单详情失败');
  } finally {
    // isLoadingDetail.value = false;
  }
};

const currentEditRecord = ref<null | RowType>(null);
const modalTitle = ref('添加菜单');
const currentType = ref<number | string>('');

// 获取上级菜单的选项（需要从API获取）
const parentOptions = ref();

// 表单组件
const formSchema = computed((): VbenFormSchema[] => {
  const isMenuOrDir = ['1', '2'].includes(String(currentType.value));
  const isMenuMethod = ['2', '3'].includes(String(currentType.value));

  return [
    {
      fieldName: 'type',
      component: 'Select',
      label: '菜单类型',
      componentProps: {
        allowClear: true,
        filterOption: true,
        options: [
          { label: '目录', value: '1' },
          { label: '菜单', value: '2' },
          { label: '按钮', value: '3' },
        ],
        placeholder: '请选择菜单类型',
        showSearch: true,
        onChange: (val: number | string) => {
          currentType.value = val;
        },
      },
      rules: 'required',
    },
    {
      fieldName: 'title',
      component: 'Input',
      label: '页面标题',
      rules: isMenuOrDir ? 'required' : undefined,
    },
    {
      fieldName: 'name',
      component: 'Input',
      label: '路由名称',
      rules: isMenuOrDir ? 'required' : undefined,
    },
    {
      fieldName: 'pid', // 修改字段名避免重复
      component: 'TreeSelect',
      label: '上级菜单',
      componentProps: {
        allowClear: true,
        filterOption: true,
        treeData: parentOptions.value,
        fieldNames: {
          children: 'children',
          label: 'name',
          value: 'id',
        },
        placeholder: '请选择上级权限',
        showSearch: false,
      },
    },
    {
      fieldName: 'path',
      component: 'Input',
      label: '路径',
      rules: isMenuOrDir ? 'required' : undefined,
    },
    {
      fieldName: 'component',
      component: 'Input',
      label: '组件路径',
      rules: String(currentType.value) === '2' ? 'required' : undefined,
      componentProps: {
        placeholder: '例如：/system/menu/index',
      },
    },
    {
      fieldName: 'icon',
      component: 'Input',
      label: '图标',
      rules: isMenuOrDir ? 'required' : undefined,
      componentProps: {
        placeholder: '例如：icon-name',
      },
    },
    {
      fieldName: 'status',
      component: 'RadioGroup',
      label: '状态',
      componentProps: {
        options: [
          { label: '启用', value: '1' },
          { label: '禁用', value: '2' },
        ],
      },
      defaultValue: '1',
    },

    {
      fieldName: 'api_method',
      component: 'Select',
      label: '请求方式',
      componentProps: {
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'DELETE', value: 'DELETE' },
        ],
      },
      rules: isMenuMethod ? 'required' : undefined,
    },

    {
      fieldName: 'api_route',
      component: 'Input',
      label: '后端接口名',
    },
  ];
});

// 删除菜单
const deletemenu = async (id: number) => {
  const res = await deletePermissionsApi(id);

  if (res?.data.code === 0) {
    message.success(res?.data.message);
    gridApi.reload();
  }
};
</script>

<template>
  <div class="w-full">
    <Grid>
      <template #toolbar-tools>
        <AccessControl :codes="['permissions.store']" type="code">
          <VbenButton @click="handleAdd">添加菜单</VbenButton>
        </AccessControl>
      </template>

      <template #action="{ row }">
        <AccessControl
          :codes="['permissions.update', 'permissions.destroy']"
          type="code"
        >
          <Button type="primary" size="small" @click="handleEdit(row)">
            编辑
          </Button>
          <Button
            danger
            style="margin-left: 8px"
            size="small"
            @click="deletemenu(row.id)"
          >
            删除
          </Button>
        </AccessControl>
      </template>
    </Grid>

    <Modal class="w-150" :title="modalTitle">
      <Formmenu
        ref="addMenuRef"
        :form-schema="formSchema"
        :edit-data="currentEditDetail"
      />
    </Modal>
  </div>
</template>
