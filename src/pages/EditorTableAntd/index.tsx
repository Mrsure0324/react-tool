// import {
//     EditableProTable,
//     ProCard,
//     ProFormField,
// } from '@ant-design/pro-components';
// import { Button } from 'antd';
// import React, { useEffect, useState } from 'react';
// import {
//     DataSourceType,
//     columns
// } from './config'
// import mockData from './mock'



// export default () => {

//     const [data,setData] = useState<DataSourceType[]>([]);
//     const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);

//     useEffect(() => {
//         setData(mockData?.data?.modelDTOS);
//     },[])

//     useEffect(() => {
//         setEditableRowKeys(
//             data.map((item:DataSourceType) => {
//                 return item?.id
//             })
//         )
//     },[data])

//     return (
//         <>
//             <EditableProTable<DataSourceType>
//                 rowKey='id'
//                 value={data}
//                 columns={columns}
//                 recordCreatorProps={{
//                     newRecordType: 'dataSource',
//                     record: (index) => ({
//                         id: Date.now().toString() + index,
//                         "modelName": "cupidatat non",
//                         "datasourceId": "irure",
//                         "dbName": "in in",
//                         "tableName": "et nostrud aute consequat",
//                         "columnName": "enim Lorem occaecat non aute",
//                         "description": "non Lorem in",
//                         "responsor": "nulla dolor dolor et Lorem"
//                     }),
//                 }}
//                 editable={{
//                     type: 'multiple',
//                     editableKeys,
//                     onChange: setEditableRowKeys,
//                     actionRender: (row, config, defaultDoms) => {
//                         return [defaultDoms.delete];
//                     },
//                     onValuesChange: (record, recordList) => {
//                         setData(recordList);
//                     },
//                 }}
//             />
//         </>
//     );
// };
import type {
    ActionType,
    EditableFormInstance,
    ProColumns,
    ProFormInstance,
} from '@ant-design/pro-components';

import {
    EditableProTable,
    ProCard,
    ProForm,
    ProFormDependency,
    ProFormDigit,
} from '@ant-design/pro-components';
import { Form, Input, Button } from 'antd';
import React, { useRef, useState } from 'react';

type DataSourceType = {
    id: React.Key;
    associate?: string;
    questionsNum?: number;
    type?: string;
    fraction?: number;
    scoringMethod?: string;
};

const defaultData: DataSourceType[] = [
    {
        id: 624748504,
        associate: '题库名称一',
        questionsNum: 10,
        type: 'multiple',
        scoringMethod: 'continuous',
        fraction: 20,
    },
    {
        id: 624691229,
        associate: '题库名称二',
        questionsNum: 10,
        scoringMethod: 'continuous',
        type: 'radio',
        fraction: 20,
    },
    {
        id: 624748503,
        associate: '题库名称三',
        questionsNum: 10,
        type: 'judge',
        scoringMethod: 'continuous',
        fraction: 20,
    },
    {
        id: 624691220,
        associate: '题库名称四',
        questionsNum: 10,
        scoringMethod: 'continuous',
        type: 'vacant',
        fraction: 20,
    },
];

export default () => {
    const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() => []);
    // const formRef = useRef<ProFormInstance<any>>();
    // const formRef = useRef<ProFormInstance<any>>();
    const actionRef = useRef<ActionType>();
    const editableFormRef = useRef<EditableFormInstance>();
    const columns: ProColumns<DataSourceType>[] = [
        {
            title: '关联题库',
            dataIndex: 'associate',
            valueType: 'text',
            ellipsis: true,
        },
        {
            title: '题型',
            key: 'type',
            dataIndex: 'type',
            valueType: 'select',
            valueEnum: {
                multiple: { text: '多选题', status: 'Default' },
                radio: { text: '单选题', status: 'Warning' },
                vacant: {
                    text: '填空题',
                    status: 'Error',
                },
                judge: {
                    text: '判断题',
                    status: 'Success',
                },
            },
        },
        {
            title: '题数',
            dataIndex: 'questionsNum',
            valueType: 'digit',
        },
        {
            title: '计分方式',
            dataIndex: 'scoringMethod',
            valueType: 'select',
            request: async () => [
                {
                    value: 'discrete',
                    label: '离散型',
                },
                {
                    value: 'continuous',
                    label: '连续型',
                },
            ],
            fieldProps: (_, { rowIndex }) => {
                return {
                    onSelect: () => {
                        // 每次选中重置参数
                        editableFormRef.current?.setRowData?.(rowIndex, { fraction: [] });
                    },
                };
            },
        },
        {
            title: '分值',
            width: 150,
            dataIndex: 'fraction',
            valueType: (record) => {
                const scoringMethod = record?.scoringMethod;
                if (scoringMethod === 'discrete') return 'select';
                return 'digit';
            },
            fieldProps: {
                mode: 'multiple',
            },
            request: async () =>
                ['A', 'B', 'D', 'E', 'F'].map((item, index) => ({
                    label: item,
                    value: index,
                })),
        },
        {
            title: '操作',
            valueType: 'option',
            render: (_, row) => [
                <a
                    key="delete"
                    onClick={() => {
                        const tableDataSource = formRef.current?.getFieldValue(
                            'table',
                        ) as DataSourceType[];
                        formRef.current?.setFieldsValue({
                            table: tableDataSource.filter((item) => item.id !== row?.id),
                        });
                    }}
                >
                    移除
                </a>,
                <a
                    key="edit"
                    onClick={() => {
                        actionRef.current?.startEditable(row.id);
                    }}
                >
                    编辑
                </a>,
            ],
        },
    ];

    const  [form] = Form.useForm();



    return (
        <ProCard>
            <div
                style={{
                    maxWidth: 800,
                    margin: 'auto',
                }}
            >
                <Form<{
                    table: DataSourceType[];
                }>
                    // formRef={formRef}
                    form={form}
                    initialValues={{
                        table: defaultData,
                    }}
                    onFinish={(values) => {
                        console.log('onFinish', values);
                    }}
                >
                    <Form.Item name={'test1'} >
                        <Input></Input>
                    </Form.Item>
                    <EditableProTable<DataSourceType>
                        rowKey="id"
                        scroll={{
                            x: true,
                        }}
                        editableFormRef={editableFormRef}
                        controlled
                        actionRef={actionRef}
                        formItemProps={{
                            label: '题库编辑',
                            rules: [
                                {
                                    validator: async (_, value) => {
                                        if (value.length < 1) {
                                            throw new Error('请至少添加一个题库');
                                        }

                                        if (value.length > 5) {
                                            throw new Error('最多可以设置五个题库');
                                        }
                                    },
                                },
                            ],
                        }}
                        maxLength={10}
                        name="table"
                        columns={columns}
                        recordCreatorProps={{
                            record: (index) => {
                                return { id: index + 1 };
                            },
                        }}
                        editable={{
                            type: 'multiple',
                            editableKeys,
                            onChange: setEditableRowKeys,
                        }}
                    />
                </Form>
                <Button type='primary' onClick={() => {
                    const values = form?.getFieldsValue();
                    console.log(values)
                }}>Submit</Button>
            </div>
        </ProCard>
    );
};