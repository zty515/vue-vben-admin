<script lang="ts" setup>
// import type { DataNode } from 'antdv-next/dist/tree';

// import type { SystemUserApi } from '#/api/system/user';
import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
// import { getMenuList } from '#/api/system/menu';
import { createUser, getRoleOptionstList, updateUser } from '#/api/user';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

interface SystemUser {
  [key: string]: any;
  id: string;
  name: string;
  account: string;
  created_at: string;
  status: 0 | 1;
}

const formData = ref<SystemUser>();
const id = ref();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(id.value),
  showDefaultActions: false,
});

interface SystemDept {
  [key: string]: any;
  id: string;
  name: string;
}

const optionList = ref<SystemDept[]>([]);
const loadingPermissions = ref(false);

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    (id.value ? updateUser(id.value, values) : createUser(values))
      .then(() => {
        emits('success');
        drawerApi.close();
      })
      .catch(() => {
        drawerApi.unlock();
      });
  },

  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<SystemUser>();
      formApi.resetForm();

      if (data) {
        formData.value = data;
        id.value = data.id;

        await nextTick();
        formApi.updateSchema(useFormSchema(id.value));
      } else {
        id.value = undefined;
      }

      if (optionList.value.length === 0) {
        await loadPermissions();
      }
      // Wait for Vue to flush DOM updates (form fields mounted)
      await nextTick();
      if (data) {
        formApi.setValues(data);
      }
    }
  },
});

async function loadPermissions() {
  loadingPermissions.value = true;
  try {
    const res = (await getRoleOptionstList()) as unknown as {
      list: SystemDept[];
    };
    optionList.value = res.list;
  } finally {
    loadingPermissions.value = false;
  }
}

const getDrawerTitle = computed(() => {
  return formData.value?.id
    ? $t('common.edit', $t('system.user.name'))
    : $t('common.create', $t('system.user.name'));
});
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form />
  </Drawer>
</template>
<style lang="css" scoped>
:deep(.ant-tree-title) {
  .tree-actions {
    @apply ml-5 hidden;
  }
}

:deep(.ant-tree-title:hover) {
  .tree-actions {
    @apply ml-5 flex flex-auto justify-end;
  }
}
</style>
