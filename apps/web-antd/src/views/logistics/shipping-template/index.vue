<script lang="ts" setup>
import type { UploadChangeParam } from 'ant-design-vue';

import { computed, h, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';

import {
  Button,
  Input,
  InputNumber,
  message,
  Modal,
  Space,
  Upload,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  addrate,
  batchDelete,
  getShippingDetail,
  getShippingList,
  updateShippingDescription,
  updateShippingStatus,
} from '#/api/shipping';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const accessStore = useAccessStore();

const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${accessStore.accessToken}`,
}));

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['createTime', ['startTime', 'endTime']]],
    schema: useGridFormSchema(),
    submitOnChange: false,
    showCollapseButton: false,
  },
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
        query: async (
          { page }: { page: { currentPage: number; pageSize: number } },
          formValues: any,
        ) => {
          return await getShippingList({
            page: page.currentPage,
            limit: page.pageSize,
            ...formValues,
          });
        },
      },
    },

    toolbarConfig: {
      custom: false,
      export: false,
      refresh: true,
      search: false,
      zoom: false,
    },
  },
});

function onRefresh() {
  gridApi.query();
}

const showImportErrors = (errorList: { reason: string; row: number }[]) => {
  // 将错误列表转换成 HTML 字符串，用 <br/> 换行，或者直接用 <ul> 列表展示
  const errorHtml = errorList
    .map((err) => `<div>第 ${err.row}行： ${err.reason}</div>`)
    .join('');

  Modal.error({
    title: '导入失败，请检查以下错误：',
    content: h('div', { innerHTML: errorHtml }), // 如果你用的是 JSX/TSX；如果是 template 写法见下方
    width: 500,
    okText: '知道了',
  });
};

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

// 导入
const handleChange = (info: UploadChangeParam) => {
  if (info.file.status !== 'uploading') {
    console.warn(info.file, info.fileList);
  }
  if (info.file.status === 'done') {
    if (info.file.response.data.fails.length === 0) {
      message.success(`${info.file.name} 上传成功`);
      onRefresh();
    } else {
      showImportErrors(info.file.response.data.fails);
      onRefresh();
    }
  } else if (info.file.status === 'error') {
    message.error(`${info.file.name} file upload failed.`);
  }
};

const fileList = ref([]);

// 创建新的物流模板
function onCreate() {
  formModalApi.setData(null).open();
}

function onEdit(row: any) {
  const hideLoading = message.loading({
    content: '加载中...',
    duration: 0,
    key: 'edit_loading',
  });

  // 调用接口获取详情
  getShippingDetail(row.id)
    .then((detail) => {
      hideLoading();

      formModalApi.setData(detail).open();
    })
    .catch(() => {
      hideLoading();
      message.error('获取详情失败');
    });
}

function onActionClick(e: any) {
  switch (e.code) {
    case 'edit': {
      onEdit(e.row);
      break;
    }
  }
}

function getSelectedIds() {
  const records = gridApi.grid.getCheckboxRecords();
  return records.map((record) => record.id);
}

function onBatchDelete() {
  const ids = getSelectedIds();
  if (ids.length === 0) {
    message.warning('请选择要删除的物流模板');
  } else {
    Modal.confirm({
      title: '删除确认',
      content: `确定要删除这${ids.length}个物流模板吗？`,
      onOk: async () => {
        // TODO: 调用删除接口
        const res = await batchDelete({
          ids,
        });
        if (res.data.code === 0) {
          message.success('删除成功');
          onRefresh();
        }
      },
    });
  }
}

async function onBatchEnable() {
  const ids = getSelectedIds();
  if (ids.length === 0) {
    message.warning('请至少选择一条数据');
    return;
  }
  try {
    await updateShippingStatus({ ids, status: 1, type: 1 });
    message.success('批量启用成功');
    onRefresh();
  } catch {
    message.error('批量启用失败');
  }
}

// 批量停用
async function onBatchDisable() {
  const ids = getSelectedIds();
  if (ids.length === 0) {
    message.warning('请至少选择一条数据');
    return;
  }
  try {
    await updateShippingStatus({ ids, status: 0, type: 1 });
    message.success('批量停用成功');
    onRefresh();
  } catch {
    message.error('批量停用失败');
  }
}

// 批量修改限制说明
function onBatchUpdateDescription() {
  const ids = getSelectedIds();
  if (ids.length === 0) {
    message.warning('请至少选择一条数据');
    return;
  }

  const descriptionValue = ref(''); // 用于存储输入框的值

  Modal.confirm({
    title: '批量修改限制说明',
    content: h('div', { style: { marginTop: '16px' } }, [
      h(Input.TextArea, {
        rows: 4,
        placeholder: '请输入限制说明',
        onChange: (e: ChangeEvent) => {
          descriptionValue.value = e.target.value; // onChange 的参数直接就是输入的字符串值
        },
      }),
    ]),
    okText: '确认修改',
    cancelText: '取消',
    onOk: async () => {
      if (!descriptionValue.value.trim()) {
        message.warning('说明内容不能为空');
      }
      try {
        // 调用后端接口，请根据实际 API 要求调整参数结构
        await updateShippingDescription({
          ids,
          description: descriptionValue.value,
          type: 2,
        });
        message.success('批量修改成功');
        onRefresh();
      } catch {
        message.error('批量修改失败');
      }
    },
  });
}

function setRate() {
  const rate = ref(0);

  Modal.confirm({
    title: '设置加价系数',
    content: h('div', { style: { marginTop: '16px' } }, [
      h(InputNumber, {
        style: { width: '100%' },
        placeholder: '请输入加价系数',
        min: 0,
        onInput: (val) => {
          rate.value = Number(val);
        },
      }),
    ]),
    okText: '确认修改',
    cancelText: '取消',
    onOk: async () => {
      if (!rate.value) {
        message.warning('加价系数不能为空');
      }
      try {
        await addrate({ rate: rate.value });
        message.success('修改成功');
        onRefresh();
      } catch {
        message.error('修改失败');
      }
    },
  });
}
</script>
<template>
  <Page auto-content-height>
    <FormModal @success="onRefresh" />
    <Grid table-title="物流模板列表">
      <template #toolbar-tools>
        <Space>
          <Button> 下载物流配置模板 </Button>

          <Upload
            v-model:file-list="fileList"
            name="file"
            action="/api/shippings/import"
            :headers="uploadHeaders"
            :show-upload-list="false"
            @change="handleChange"
          >
            <Button> 导入物流表格 </Button>
          </Upload>

          <Button type="primary" @click="onCreate">
            <Plus class="size-5" />
            {{ $t('ui.actionTitle.create', '物流模板') }}
          </Button>

          <Button @click="onBatchDelete"> 批量删除 </Button>

          <Button @click="onBatchEnable"> 批量启用 </Button>
          <Button danger @click="onBatchDisable" style="margin-left: 8px">
            批量停用
          </Button>

          <Button @click="onBatchUpdateDescription" style="margin-left: 8px">
            批量修改说明
          </Button>

          <Button @click="setRate"> 设置加价系数 </Button>
        </Space>
      </template>
      <template #operation="{ row }">
        <Button
          type="link"
          size="small"
          @click="onActionClick({ code: 'edit', row })"
        >
          编辑
        </Button>
      </template>
    </Grid>
  </Page>
</template>
