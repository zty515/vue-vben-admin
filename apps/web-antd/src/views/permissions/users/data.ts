import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridColumns } from '#/adapter/vxe-table';

// import type { SystemUserApi } from '#/api';
import { getRoleOptionstList } from '#/api/user';
import { $t } from '#/locales';
export function useFormSchema(id: any): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: '姓名',
      rules: 'required',
    },

    {
      component: 'Input',
      fieldName: 'account',
      label: '账号',
      rules: 'required',
    },
    {
      component: 'InputPassword',
      fieldName: 'password',
      label: '密码',
      dependencies: {
        triggerFields: ['id'],
        if: () => !id,
        rules: (values) => {
          return values.id ? '' : 'required';
        },
      },
      disabled: id,
    },
    {
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: getRoleOptionstList,
        mode: 'multiple',
        resultField: 'list',
        class: 'w-full',
        labelField: 'name',
        valueField: 'id',
      },
      fieldName: 'roles',
      label: '角色',
      rules: 'required',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('common.enabled'), value: 0 },
          { label: $t('common.disabled'), value: 1 },
        ],
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'status',
      label: '状态',
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.user.name'),
    },
    { component: 'Input', fieldName: 'id', label: $t('system.user.id') },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
      },
      fieldName: 'status',
      label: '状态',
    },

    {
      component: 'RangePicker',
      fieldName: 'createTime',
      label: '创建时间',
    },
  ];
}

export function useColumns(): VxeTableGridColumns {
  return [
    {
      field: 'name',
      title: '员工姓名',
    },
    {
      field: 'id',
      title: '员工ID',
    },
    {
      field: 'status',
      title: '状态',
      width: 100,
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
