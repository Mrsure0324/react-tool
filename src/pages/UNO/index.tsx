import React, { useEffect, useMemo } from 'react'
import styles from './index.less'
import { Button, Modal, Form, Input, List, Card, Avatar, InputNumber, message, Space, Badge, Divider, Drawer, Table, Typography, Col, Row, FloatButton } from 'antd';
import { cloneDeep } from 'lodash';
import { PageContainer } from '@ant-design/pro-components';
import moment from 'moment';
import localforage from 'localforage'
import { bestWealthDistribution } from './tool';
import { PlayerProps, defaultTeamPlayers } from './config';
import { ToolOutlined } from '@ant-design/icons';

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
                style={{width:'100%'}}
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
    const [toolsDrawerOpen,setToolsDrawerOpen] = React.useState<boolean>(false);
    const [computedLock,setComputedLock] = React.useState<boolean>(true);
    const [totalInfo,setTotalInfo] = React.useState<any>({});

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
        // newLogs.push(totalInfo);
        setTotalInfo(totalInfo)
        return newLogs.reverse();
    },[logs,players])
    
    const columns:any = useMemo(() => {
        const res = players.map(item => {
            return {
                title: item.name,
                dataIndex: item.name,
                key: item.name,
                width: Math.max(Math.min(item.name?.length * 25,80), 70),
                render(text:number) {
                    const point = Math.round(text * 100) / 100;
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
                width: 100,
            },
            ...res,
            {
                title: '操作',
                width: 50,
                fixed: 'right',
                render(_:string,row:any,index:number) {
                    return (
                        <>
                            {index !== logs.length && <Button style={{paddingLeft: 0}} danger onClick={() => deleteLog(row,index)} type='link'>删除</Button>}
                        </>
                    )
                }
            }
        ]
    },[players,logs]);

    const createRoom = () => {
        //缓存
        localforage.setItem('players',[]);
        localforage.setItem('logs',[]);
        setLogs([]);
        setPlayers([]);
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
        item.date = moment().format('HH:mm:ss');
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
            icon: <></>,
            title: <><p>🏆🏆🏆结算页面🏆🏆🏆</p></>,
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

    const moneyAllocation = () => {
        
        const info = cloneDeep(totalInfo);
        delete info.date;
        const arr = [];
        for(let key in info) {
            arr.push({
                name: key,
                point: info[key],
            })
        }
        arr.sort((a,b) => b.point - a.point);
        const plans = bestWealthDistribution(arr);
        
        Modal.info({
            width: '80%',
            icon: <></>,
            title: <>{'结算方案'}</>,
            content: (<>
                {
                    plans.map(item => {
                        return (
                            <div style={{fontSize:'16px'}}>
                                <span>【{item?.loser}】</span> 
                                <span>输给</span> 
                                <span>【{item?.winner}】</span>
                                <span style={{color: 'red'}}>{Math.round(item?.amount * 10) / 10 / 10}</span>元
                            </div>
                        )
                    })
                }
            </>),
            okText: '确定',
            cancelText: '取消',
        });  
    }

    const loadDefaultTeam = () => {
        setPlayers(defaultTeamPlayers)
    }

    return (
        <>
            <div className={styles['box']}>
                <PageContainer title={false} className={styles.wrapper} style={{ minHeight: '100vh'}}>
                    {
                        players?.length > 0 && (
                            <>
                                <div className={styles['inner']}>
                                    <p style={{color: 'orange'}}>注：第一名以及并列第一，直接输入0即可</p>
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
                                                                    <InputNumber disabled={computedLock} addonBefore='-' width={50} min={0} value={item.point} onChange={(value) => changePlayerPoint(index,value)}></InputNumber>
                                                                    <Button danger type='link' onClick={() => deletePlayer(index)}>踢出房间</Button>
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
                                        <Button color='success' disabled={!computedLock} type='primary' onClick={() => {
                                            restGame();
                                        }}>新开一局</Button>
                                    </Space>
                                </div>
                            </>
                        )
                    }
                    {
                        players?.length <= 0 && (
                            <>
                                <div onClick={() => setToolsDrawerOpen(true)} className={styles['start-button']}></div>
                            </>
                        )
                    }
                </PageContainer>
            </div>
            <Drawer title={'记分板'} width={1200} open={pointDrawerOpen} onClose={() => {setPointDrawerOpen(false)}}>
                <Card title='分数总计：' size='small'>
                    <Row>
                        {
                            players.map((item,index) => {
                                const point = computedUserPointTotal(item.name);
                                let pointClass = 'normal';
                                if(point > 0) {
                                    pointClass = 'winner'
                                }
                                if(point < 0) {
                                    pointClass = 'loser'
                                }
                                return (
                                    <Col span={8}>
                                        <div className={`${styles['total-item']} ${styles[pointClass]}`}>
                                            {`${item.name}：${point}`}
                                        </div>
                                    </Col>
                                )
                            })
                        }
                    </Row>
                </Card>
                <br />
                <Table
                    scroll={{ y: 400,}}
                    dataSource={dataSource}
                    columns={columns}
                    pagination={false}
                    size='small'
                />
                <Divider/>
                <Button type='primary' onClick={moneyAllocation}>生成结算方案</Button>
                {/* <Divider /> */}
            </Drawer>
            <Drawer title='操作面板' placement={'bottom'} open={toolsDrawerOpen} onClose={() => setToolsDrawerOpen(false)}> 
                <Form form={form} >
                    <Form.Item rules={[{required: true, message:'你得起个名啊'}]} label="Player Name" name="name">
                        <Input maxLength={8}></Input>
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button onClick={addPlayer}>创建玩家</Button>
                            <Button onClick={createRoom}>重开房间</Button>
                            <Button onClick={loadDefaultTeam}>加载默认玩家</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Drawer>
            <FloatButton
                shape="circle"
                // type="primary"
                style={{ right: 12 }}
                icon={<ToolOutlined />}
                // description='GO!'
                onClick={() => setToolsDrawerOpen(true)}
            />
        </>
    )
}
export default UNORoom