import React, { useState } from 'react';
import { Button, Input, Table, Modal, Form, message, Space, Card } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './index.less';

interface Player {
  id: string;
  name: string;
  wins: number;
  losses: number;
  points: number;
}

interface Match {
  id: string;
  player1: string;
  player2: string;
  score1: number;
  score2: number;
  completed: boolean;
}

const BilliardsScore: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isAddPlayerModalVisible, setIsAddPlayerModalVisible] = useState(false);
  const [isAddScoreModalVisible, setIsAddScoreModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [scoreForm] = Form.useForm();

  // 添加选手
  const handleAddPlayer = (values: { name: string }) => {
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: values.name,
      wins: 0,
      losses: 0,
      points: 0,
    };
    setPlayers([...players, newPlayer]);
    setIsAddPlayerModalVisible(false);
    form.resetFields();
    generateMatches();
  };

  // 生成比赛对阵
  const generateMatches = () => {
    const newMatches: Match[] = [];
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        newMatches.push({
          id: `${i}-${j}`,
          player1: players[i].id,
          player2: players[j].id,
          score1: 0,
          score2: 0,
          completed: false,
        });
      }
    }
    setMatches(newMatches);
  };

  // 添加比分
  const handleAddScore = (values: { score1: number; score2: number }) => {
    const matchId = scoreForm.getFieldValue('matchId');
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    const newMatches = matches.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          score1: values.score1,
          score2: values.score2,
          completed: true,
        };
      }
      return m;
    });
    setMatches(newMatches);

    // 更新选手战绩
    const newPlayers = players.map(p => {
      if (p.id === match.player1) {
        return {
          ...p,
          wins: values.score1 > values.score2 ? p.wins + 1 : p.wins,
          losses: values.score1 < values.score2 ? p.losses + 1 : p.losses,
          points: p.points + values.score1,
        };
      }
      if (p.id === match.player2) {
        return {
          ...p,
          wins: values.score2 > values.score1 ? p.wins + 1 : p.wins,
          losses: values.score2 < values.score1 ? p.losses + 1 : p.losses,
          points: p.points + values.score2,
        };
      }
      return p;
    });
    setPlayers(newPlayers);

    setIsAddScoreModalVisible(false);
    scoreForm.resetFields();
    message.success('比分已更新');
  };

  // 删除选手
  const handleDeletePlayer = (playerId: string) => {
    setPlayers(players.filter(p => p.id !== playerId));
    setMatches(matches.filter(m => m.player1 !== playerId && m.player2 !== playerId));
  };

  // 表格列定义
  const playerColumns = [
    {
      title: '选手名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '胜场',
      dataIndex: 'wins',
      key: 'wins',
    },
    {
      title: '负场',
      dataIndex: 'losses',
      key: 'losses',
    },
    {
      title: '得分',
      dataIndex: 'points',
      key: 'points',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Player) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeletePlayer(record.id)}
        />
      ),
    },
  ];

  const matchColumns = [
    {
      title: '选手1',
      dataIndex: 'player1',
      key: 'player1',
      render: (id: string) => players.find(p => p.id === id)?.name || '-',
    },
    {
      title: '选手2',
      dataIndex: 'player2',
      key: 'player2',
      render: (id: string) => players.find(p => p.id === id)?.name || '-',
    },
    {
      title: '比分',
      key: 'score',
      render: (record: Match) => 
        record.completed ? `${record.score1} - ${record.score2}` : '未完成',
    },
    {
      title: '操作',
      key: 'action',
      render: (record: Match) => (
        <Button
          type="link"
          onClick={() => {
            scoreForm.setFieldsValue({ matchId: record.id });
            setIsAddScoreModalVisible(true);
          }}
          disabled={record.completed}
        >
          添加比分
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <Card title="台球循环赛计分器" className={styles.card}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div className={styles.header}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsAddPlayerModalVisible(true)}
            >
              添加选手
            </Button>
          </div>

          <Table
            dataSource={players}
            columns={playerColumns}
            rowKey="id"
            pagination={false}
          />

          <Table
            dataSource={matches}
            columns={matchColumns}
            rowKey="id"
            pagination={false}
            title={() => '比赛对阵'}
          />
        </Space>
      </Card>

      <Modal
        title="添加选手"
        open={isAddPlayerModalVisible}
        onCancel={() => setIsAddPlayerModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAddPlayer}>
          <Form.Item
            name="name"
            label="选手名称"
            rules={[{ required: true, message: '请输入选手名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              确定
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="添加比分"
        open={isAddScoreModalVisible}
        onCancel={() => setIsAddScoreModalVisible(false)}
        footer={null}
      >
        <Form form={scoreForm} onFinish={handleAddScore}>
          <Form.Item name="matchId" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="score1"
            label="选手1得分"
            rules={[{ required: true, message: '请输入得分' }]}
          >
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item
            name="score2"
            label="选手2得分"
            rules={[{ required: true, message: '请输入得分' }]}
          >
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              确定
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BilliardsScore; 