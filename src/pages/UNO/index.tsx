import React from 'react'
import styles from './index.less'
import { Button, Modal, Form, Input, List, Card, Avatar, InputNumber, message, Space, Badge, Divider } from 'antd';
import { cloneDeep } from 'lodash';
import { PageContainer } from '@ant-design/pro-components';

export interface PlayerProps {
    description: string;
    name: string;
    avatar?: string;
    point: number;
    type: 'winner' | 'loser' | 'normal';
}

interface ResultProps {
    rank: number,
    name: string,
    lastPoint: number,
}

const ResultContent = (props: { result: ResultProps[]}) => {
    return (
        <>
            {JSON.stringify(props.result)}
        </>
    )
}

const UNORoom:React.FC<any> = () => {

    const [players,setPlayers] = React.useState<PlayerProps[]>([]);
    const [winnerNum,setWinnerNum] = React.useState<number>(0);
    const [form] = Form.useForm();
    const [logs,setLogs] = React.useState<ResultProps[][]>([]);

    const addPlayer = async () => {

        try {
            await form.validateFields();

            // 添加玩家
            const values = form.getFieldsValue();
            const newData = cloneDeep(players);
            newData.push({
                name: values.name,
                description: '',
                avatar: '',
                point: 0,
                type: 'normal'
            });
            setPlayers(newData);
            form.resetFields();
            message.success(<>
                {`热烈欢迎【${values.name}】同志加入游戏，祝您福如东海，寿比南山~`}
            </>);
        } catch (error) {
            // message.error('不起名你点鸡毛~')
        }
    }

    const deletePlayer = (index: number) => {

        const info = cloneDeep(players[index]);
        Modal.confirm({
            title: '警告',
            content: `你确定要删除【${info.name}】吗？`,
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
                const newData = cloneDeep(players);
                newData.splice(index,1);
                setPlayers(newData);
            },
        })
    }

    const changePlayerPoint = (index: number,value: number | null) => {

        if(value === null) return;

        const newData = cloneDeep(players);
        newData[index].point = value;
        setPlayers(newData);
    }

    const restGame = () => {
        setWinnerNum(0);
        const newData = cloneDeep(players);
        // newData.map((item,index) => {
        //     return {
        //         name: item.name,
        //         description: item.description,
        //         avatar: item.avatar,
        //         point: 0,
        //         type: 'normal'
        //     }
        // })
    }

    const computedGame = () => {



        const newData = cloneDeep(players);
        //按比分排序
        newData.sort((a,b) => a.point - b.point);
        // 算出前两名的分数
        const firstPoint = 0;
        const secondPoint = cloneDeep(newData[1])?.point;
        //标记胜负
        let count = 0 // 胜者数量
        newData.map((item,index) => {
            if(item?.point <= secondPoint) {
                item.type = 'winner';
                count++;
            } else {
                item.type = 'loser';
            }
        });
        setPlayers(newData);
        //计算结算结果
        const { result } = computedGameByPoint(newData,count);
        
        //插进计分板
        const newLogs = cloneDeep(logs);
        newLogs.push(result);
        setLogs(newLogs);

        console.log(result);
        // Modal.info({
        //     width: '80%',
        //     icon: false,
        //     title: <>🏆🏆🏆结算页面🏆🏆🏆</>,
        //     content: <ResultContent result={result}></ResultContent>,
        //     okText: '确定',
        //     cancelText: '取消',
        // });
    }

    const computedGameByPoint = (data:PlayerProps[],winnerCount:number) => {
        const winners = data.filter(item => item.type === 'winner');
        let loserTotal = 0;

        data?.forEach((item,index) => {
            if(item.type === 'loser') {
                loserTotal += item.point;
            }
        });

        const baseRes = loserTotal / winnerCount;

        const result = data.map((item,index) => {
            let lastPoint = baseRes;
            if(item.type === 'winner') {
                if(index === 0) {
                    winners?.forEach((item,index) => {
                        if(index !== 0) {
                            const diff = Math.min(item?.point,baseRes)
                            lastPoint = lastPoint + diff;
                        }
                    })
                } else {
                    lastPoint = baseRes - item?.point;
                }
            } else {
                lastPoint = - item?.point;
            }

            return  {
                rank: index+1,
                name: item?.name,
                lastPoint,
            }
        });


        return {
            result,
            plan: []
        };
    }

    return (
        <>
            <PageContainer title={'UNO计分器'} style={{backgroundColor: '#fff', minHeight: '100vh'}}>
                <Form form={form} layout='inline'>
                    <Form.Item rules={[{required: true, message:'你得起个名啊'}]} label="Player Name" name="name">
                        <Input maxLength={8}></Input>
                    </Form.Item>
                    <Form.Item>
                        <Button onClick={addPlayer}>New Player</Button>
                    </Form.Item>
                </Form>
                <Divider/>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {
                        players.map((item,index) => {
                            return (
                                <>
                                    <Badge.Ribbon  text={item?.type === 'winner' ? 'Winner 😎' : 'Loser 😭'}  color={item?.type === 'winner' ? 'red' : 'green'}>
                                        <Card title={item.name} size="small">
                                            <div className={styles['flex-between']}>
                                                <InputNumber addonBefore='-' width={50} min={0} value={item.point} onChange={(value) => changePlayerPoint(index,value)}></InputNumber>
                                                <Button danger type='link' onClick={() => deletePlayer(index)}>踢了</Button>
                                            </div>
                                        </Card>
                                    </Badge.Ribbon>
                                </>
                            )
                        })
                    }
                </Space>
                <Divider/>
                <Space>
                    <Button color='success' type='primary' onClick={computedGame}>结算本局</Button>
                </Space>
            </PageContainer>
        </>
    )
}
export default UNORoom