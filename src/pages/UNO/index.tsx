import React, { useEffect, useMemo } from 'react'
import styles from './index.less'
import { Button, Modal, Form, Input, List, Card, Avatar, InputNumber, message, Space, Badge, Divider, Drawer, Table, Typography } from 'antd';
import { cloneDeep } from 'lodash';
import { PageContainer } from '@ant-design/pro-components';
import moment from 'moment';
import localforage from 'localforage'
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

    const data:any[] = useMemo(() => {
        const res = [];
        for(let key in props.result) {
            if(key !== 'date') {
                res.push({
                    point: props.result[key],
                    name: key
                })
            }
        }
        return res
    },[props.result])

    return (
        <>
            <List
                header={false}
                footer={false}
                bordered
                dataSource={data}
                renderItem={(item) => (
                    <List.Item>
                        <Typography.Text>{item?.name}</Typography.Text> 
                        {item.point > 0 && <Typography.Text style={{color:'red'}}>{item?.point}</Typography.Text>}
                        {item.point == 0 && <Typography.Text>{item?.point}</Typography.Text>}
                        {item.point < 0 && <Typography.Text style={{color:'green'}}>{item?.point}</Typography.Text>}
                    </List.Item>
                )}
            />
        </>
    )
}
let isInit = true;
const UNORoom:React.FC<any> = () => {

    const [players,setPlayers] = React.useState<PlayerProps[]>([]);
    const [winnerNum,setWinnerNum] = React.useState<number>(0);
    const [form] = Form.useForm();
    const [logs,setLogs] = React.useState<any[]>([]);
    const [pointDrawerOpen,setPointDrawerOpen] = React.useState<boolean>(false);
    const [computedLock,setComputedLock] = React.useState<boolean>(false);


    useEffect(() => {
        if(isInit) {
            localforage.getItem('players').then((res:any) => {
                setPlayers(res || [])
            });
            localforage.getItem('logs').then((res:any) => {
                setLogs(res || [])
            });
            isInit = false
        }
    },[])

    const computedUserPointTotal = (name:string) => {
        let count:number = 0;
        logs.forEach(item => {
            count += item[name] || 0
        });
        return Number(count || 0)
    }

    const dataSource = useMemo(() => {
        const newLogs = cloneDeep(logs);
        const totalInfo:any = {date: '总计'}
        players.forEach(item => {
            totalInfo[item.name] = computedUserPointTotal(item.name)
        })
        newLogs.push(totalInfo);
        return newLogs;
    },[logs,players])
    
    const columns:any = useMemo(() => {
        const res = players.map(item => {
            return {
                title: item.name,
                dataIndex: item.name,
                key: item.name,
                render(point:number) {
                    return (
                        <>
                            {Number(point) > 0 && <span style={{color:'red'}}>{`+${point}`}</span>}
                            {!Number(point) && `${0}`}
                            {Number(point) < 0 && <span style={{color:'green'}}>{`${point}`}</span>}
                            
                        </>
                    )
                }
            }
        });

        return [
            {
                title:'日期',
                dataIndex: 'date',
                key:'date',
                width: 180,
            },
            ...res,
            {
                title: '操作',
                width: 80,
                fixed: 'right',
                render(_:string,row:any,index:number) {
                    return (
                        <>
                            {index !== logs.length && <Button danger onClick={() => deleteLog(row,index)} type='link'>删除</Button>}
                        </>
                    )
                }
            }
        ]
    },[players]);

    const createRoom = () => {
        //缓存
        localforage.setItem('players',[])
        localforage.setItem('logs',[])
    }

    const deleteLog = (row:any,index:number) => {
        const info = cloneDeep(logs[index]);
        Modal.confirm({
            title: '警告',
            content: `你确定要删除吗？`,
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
                const newData = cloneDeep(logs);
                newData.splice(index,1);
                setLogs(newData);
            },
        })
    }

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
        let newData:PlayerProps[] = cloneDeep(players);
        newData = newData.map((item,index) => {
            return {
                name: item.name,
                description: item.description,
                avatar: item.avatar,
                point: 0,
                type: 'normal'
            }
        });
        console.log(newData);
        setPlayers(newData);
        setComputedLock(false)
    }

    const resultTurnLog = (result:ResultProps[]) => {
        const item:any = {};
        item.date = moment().format('YYYY-MM-DD h:mm:ss');
        result.forEach((player,playerInfo) => {
            item[player.name] = player.lastPoint;
        });
        return item;
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
        const newLog = resultTurnLog(result)
        newLogs.push(newLog);
        setLogs(newLogs);

        //缓存
        localforage.setItem('players',newData)
        localforage.setItem('logs',newLogs)

        //只能结算一次
        setComputedLock(true)
        // console.log(newLogs);
        Modal.info({
            width: '80%',
            icon: false,
            title: <>🏆🏆🏆结算页面🏆🏆🏆</>,
            content: <ResultContent result={newLog}></ResultContent>,
            okText: '确定',
            cancelText: '取消',
        });
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
                    lastPoint = baseRes - item?.point < 0 ? 0 : baseRes - item?.point;
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

    const getBadgeColor = (type:PlayerProps['type']) => {
        if(type === 'winner') {
            return 'red'
        } else if(type === 'loser') {
            return 'green'
        } else {
            return 'blue'
        }
    }

    return (
        <>
            <PageContainer title={'UNO计分器'} className={styles['box']} style={{ minHeight: '100vh'}}>
                <div className={styles['inner']}>
                    <Form form={form} layout='inline'>
                        <Form.Item rules={[{required: true, message:'你得起个名啊'}]} label="Player Name" name="name">
                            <Input maxLength={8}></Input>
                        </Form.Item>
                        <Form.Item>
                            <Space>
                            <Button onClick={addPlayer}>创建玩家</Button>
                            <Button onClick={createRoom}>重开房间</Button>
                            </Space>
                        </Form.Item>
                    </Form>
                    <Divider/>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        {
                            players.map((item,index) => {
                                return (
                                    <>  
                                        <Badge.Ribbon 
                                            key={index} 
                                            text={(
                                                <>
                                                    {item?.type === 'winner' && 'Winner 🤑'}
                                                    {item?.type === 'loser' && 'Loser 😭'}
                                                    {item?.type === 'normal' && 'Ready 😎'}
                                                </>
                                            )}  
                                            color={getBadgeColor(item?.type)}
                                        >
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
                        <Button color='success' disabled={computedLock} type='primary' onClick={computedGame}>结算本局</Button>
                        <Button color='success' type='primary' onClick={() => {setPointDrawerOpen(true)}}>记分板</Button>
                        <Button color='success' type='primary' onClick={() => {
                            restGame();
                        }}>新开一局</Button>
                    </Space>
                </div>
            </PageContainer>
            <Drawer title={'记分板'} width={1200} open={pointDrawerOpen} onClose={() => {setPointDrawerOpen(false)}}>
                <Table
                    dataSource={dataSource}
                    columns={columns}
                    pagination={false}
                />
            </Drawer>
        </>
    )
}
export default UNORoom