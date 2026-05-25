import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridColumns } from '#/adapter/vxe-table';

import { z } from '#/adapter/form';
import { getCountryOptionstList } from '#/api/shipping';

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: '物流渠道名称',
    },

    {
      component: 'ApiSelect',
      fieldName: 'country_id',
      label: '送达国家',
      componentProps: {
        allowClear: true,
        api: getCountryOptionstList,

        resultField: 'list',
        class: 'w-full',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return option.label?.toLowerCase().includes(input.toLowerCase());
        },
      },
    },

    {
      component: 'Select',
      fieldName: 'status',
      label: '启用状态',
      componentProps: {
        allowClear: true,
        options: [
          {
            label: '启用',
            value: 1,
          },
          {
            label: '禁用',
            value: 0,
          },
        ],
      },
    },

    {
      component: 'Input',
      fieldName: 'min_day',
      label: '最小时效',
    },
    {
      component: 'Input',
      fieldName: 'max_day',
      label: '最大时效',
    },
    {
      component: 'RangePicker',
      fieldName: 'updated_at',
      label: '更新时间',
      componentProps: {
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
      },
    },
  ];
}

const transportTypeMap: Record<number, string> = {
  1: '空运',
  2: '海运',
  3: '陆运',
};

const formatTransportType = ({ cellValue }: { cellValue: number }) => {
  return transportTypeMap[cellValue] || '未知';
};

// 表格列
export function useColumns(): VxeTableGridColumns {
  return [
    {
      type: 'checkbox',
    },
    {
      field: 'id',
      title: '渠道id',
      width: 120,
    },
    {
      field: 'name',
      title: '渠道名称（客户端展示名称）',
      width: 200,
    },

    {
      field: 'country_name',
      title: '国家',
    },
    {
      field: 'transport_type',
      title: '运输方式',
      width: 120,
      formatter: formatTransportType,
    },
    {
      field: 'min_day',
      title: '时效天',
      width: 120,
      formatter: ({ row }) => {
        return `${row.min_day}—${row.max_day}`;
      },
    },
    {
      field: 'tax_type',
      title: '关税形式',
      width: 120,
      formatter: ({ row }) => {
        return row.tax_type === 1 ? '包税' : '不包税';
      },
    },
    {
      field: 'min_weight',
      title: '重量区间KG',
      width: 120,
      formatter: ({ row }) => {
        return `${row.min_weight}—${row.max_weight}`;
      },
    },
    {
      field: 'price',
      title: '单价 RMB/KG',
      width: 120,
    },
    {
      field: 'continue_weight_price',
      title: '续重单价 RMB/KG',
      width: 120,
    },
    {
      field: 'handling_price',
      title: '处理费 RMB/件',
      width: 120,
    },
    {
      field: 'surcharge_price',
      title: '附加费 RMB/件',
      width: 120,
    },
    {
      field: 'sort',
      title: '展示权重',
      width: 120,
    },
    {
      field: 'updated_at',
      title: '更新时间',
      width: 150,
    },
    {
      field: 'staus',
      title: '启用状态',
      width: 120,
    },
    {
      field: 'over_surcharge_price',
      title: '超大件费 RMB/件/KG',
      width: 120,
    },
    {
      field: 'description',
      title: '限制说明',
      width: 120,
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

/**
 * 获取编辑表单的字段配置。如果没有使用多语言，可以直接export一个数组常量
 */
export function useSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: '物流渠道名称',
      rules: z
        .string()
        .min(2, '物流渠道名称长度不能少于2')
        .max(20, '物流渠道名称长度不能超过20'),
    },

    {
      component: 'Select',
      fieldName: 'line',
      label: '线路',
      componentProps: {
        options: [
          { label: 'FedEx', value: 'FedEx' },
          { label: 'UPS', value: 'UPS' },
          { label: 'USPS', value: 'USPS' },
          { label: '海运', value: '海运' },
          { label: '空派', value: '空派' },
          { label: 'EMS', value: 'EMS' },
          { label: 'E-Packet', value: 'E-Packet' },
        ],
        class: 'w-full',
      },
      rules: 'required',
    },

    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: '已启用', value: 1 },
          { label: '已禁用', value: 0 },
        ],
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'status',
      label: '是否启用',
      rules: 'required',
    },

    {
      component: 'ApiSelect',
      fieldName: 'country_id',
      label: '国家',
      componentProps: {
        allowClear: true,
        api: getCountryOptionstList,

        resultField: 'list',
        class: 'w-full',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return option.label?.toLowerCase().includes(input.toLowerCase());
        },
      },
      rules: 'required',
    },
    {
      component: 'Select',
      fieldName: 'transport_type',
      label: '运输方式',
      componentProps: {
        options: [
          { label: '空运', value: 1 },
          { label: '海运', value: 2 },
          { label: '陆运', value: 3 },
        ],
        class: 'w-full',
      },
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'min_day',
      label: '最小时效天',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'max_day',
      label: '最大时效天',
      rules: 'required',
    },

    {
      component: 'Select',
      fieldName: 'tariff_type',
      label: '关税类型',
      componentProps: {
        options: [
          { label: '包税', value: '1' },
          { label: '不包税', value: '2' },
        ],
        class: 'w-full',
      },
      rules: 'required',
    },
    {
      component: 'InputNumber',
      fieldName: 'min_weight',
      label: '最小重量(kg)',
      rules: 'required',
      componentProps: {
        style: 'width: 100%',
        min: 0,
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'max_weight',
      label: '最大重量(kg)',
      rules: 'required',
      componentProps: {
        style: 'width: 100%',
        min: 0,
      },
    },

    {
      component: 'Select',
      fieldName: 'billing_type',
      label: '计费类型',
      componentProps: {
        options: [
          { label: '固定价格', value: 1 },
          { label: '重量计费', value: 2 },
        ],
        class: 'w-full',
      },
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'price',
      label: '运费人民币',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'continue_weight_price',
      label: '续重运费人民币',
    },
    {
      component: 'Input',
      fieldName: 'handling_price',
      label: '处理费人民币',
    },
    {
      component: 'Input',
      fieldName: 'surcharge_price',
      label: '附加费人民币',
    },
    {
      component: 'InputNumber',
      fieldName: 'over_length',
      label: '超大件最长单边限制',
      componentProps: {
        style: 'width: 100%',
        min: 0,
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'over_deputy_length',
      label: '超大件次长单边限制',
      componentProps: {
        style: 'width: 100%',
        min: 0,
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'over_perimeter_length',
      label: '超大件周长限制:公式:最长边+2×(另外两边之和)',
      componentProps: {
        style: 'width: 100%',
        min: 0,
      },
    },
    {
      component: 'Input',
      fieldName: 'over_surcharge_price',
      label: '超大件附加费用',
    },
    {
      component: 'Input',
      fieldName: 'description',
      label: '限制说明',
    },
    {
      component: 'InputNumber',
      fieldName: 'sort',
      label: '权重',
      componentProps: {
        style: 'width: 100%',
        min: 0,
      },
    },
    {
      component: 'Input',
      fieldName: 'applicable_prods',
      label: '适用产品',
    },
  ];
}
