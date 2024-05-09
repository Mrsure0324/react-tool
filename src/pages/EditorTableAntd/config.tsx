
import type { ProColumns, ProFieldValueTypeWithFieldProps } from '@ant-design/pro-components';

export type DataSourceType = {
    id: string
    modelName: string,
    datasourceId: string,
    dbName: string,
    tableName: string,
    columnName: string,
    description: string,
    responsor: string
};

export const columns: ProColumns<DataSourceType>[] = [{
    title: '模型名称',
    dataIndex: 'modelName',
    formItemProps: () => {
        return {
            rules: [{ required: true, message: '此项为必填项' }],
        };
    },
    fieldProps: (form, { rowKey, rowIndex }) => {
        return {
            maxLength: 100,
        }
    }

},{
    title: '库名',
    dataIndex: 'dbName',
    valueType: 'select',
    formItemProps: () => {
        return {
            rules: [{ required: true, message: '此项为必填项' }],
        };
    },
    fieldProps: (form, { rowKey, rowIndex }) => {
        return {
            maxLength: 100,
        }
    }

}, {
    title: '操作',
    valueType: 'option',
    width: 250,
    render: () => {
        return null;
    },
},]