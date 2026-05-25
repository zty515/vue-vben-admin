import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridColumns } from '#/adapter/vxe-table';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: '角色名称',
      rules: 'required',
    },
    // {
    //   component: 'RadioGroup',
    //   componentProps: {
    //     buttonStyle: 'solid',
    //     options: [
    //       { label: $t('common.enabled'), value: 1 },
    //       { label: $t('common.disabled'), value: 0 },
    //     ],
    //     optionType: 'button',
    //   },
    //   defaultValue: 1,
    //   fieldName: 'status',
    //   label: '状态',
    // },

    {
      component: 'Input',
      fieldName: 'permissions',
      formItemClass: 'items-start',
      label: '授权',
      modelPropName: 'modelValue',
    },
  ];
}

export function useColumns(): VxeTableGridColumns {
  return [
    {
      field: 'name',
      title: '角色名称',
    },
    {
      field: 'id',
      title: '角色ID',
    },

    {
      field: 'created_at',
      title: '创建时间',
    },
    {
      align: 'center',
      slots: {
        default: 'operation', // 指定插槽名称
      },
      field: 'operation',
      fixed: 'right',
      title: '操作',
      width: 130,
    },
  ];
}
