<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';

import { computed, nextTick, reactive, ref, watch } from 'vue';

import { useVbenForm } from '#/adapter/form';
import { postPermissions, putPermissionsApi } from '#/api/permissions';

interface Props {
  formSchema?: VbenFormSchema[];
  editData?: any | null;
  loading?: boolean; // 加载状态
}

const props = withDefaults(defineProps<Props>(), {
  formSchema: () => [],
  editData: null,
});
const isEdit = ref(false);
const setFormValues = (data: any) => {
  if (data && data.id) {
    formApi.setValues({
      type: String(data.type),
      title: data.title,
      name: data.name,
      pid: data.pid,
      path: data.path,
      component: data.component,
      icon: data.icon,
      status: String(data.status || '1'),
      api_method: data.api_method,
      api_route: data.api_route,
    });
  }
};

const resetForm = () => {
  formApi.resetForm();
  // 设置默认值
  formApi.setValues({
    status: '1',
  });
};

watch(
  () => props.editData,
  async (newData) => {
    if (newData && newData.id) {
      isEdit.value = true;
      // 等待 nextTick 确保 formApi 已就绪
      await nextTick();
      setFormValues(newData);
    } else {
      isEdit.value = false;
      await nextTick();
      resetForm();
    }
  },
  { immediate: true, deep: true },
);

const handleSubmit = async () => {
  try {
    // 使用 formApi.validate() 而不是 formRef.value?.validate()
    const valid = await formApi.validate();
    const formData = await formApi.getValues();

    if (valid.valid) {
      const res = await (isEdit.value && props.editData?.id
        ? putPermissionsApi(props.editData.id, formData)
        : postPermissions(formData));
      return res?.data?.code === 0
        ? { success: true }
        : { success: false, error: res?.data?.message || '操作失败' };
    }
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};

const [Form, formApi] = useVbenForm(
  reactive({
    commonConfig: {
      // 所有表单项
      componentProps: {
        class: 'w-full',
      },
    },
    layout: 'horizontal',
    schema: computed(() => props.formSchema),
    showDefaultActions: false,
  }),
);

defineExpose({
  handleSubmit,
});
</script>
<template>
  <div>
    <Form />
  </div>
</template>
