import React, { useState } from 'react';
import { useJsonPatch } from '../hooks/useJsonPatch';
import { JsonPatchError } from '../types/jsonPatch';

/**
 * 简单的 JSON Patch 使用示例
 * 展示如何在其他组件中使用 useJsonPatch hook
 */
const JsonPatchExample: React.FC = () => {
  const [message, setMessage] = useState('');

  const jsonPatch = useJsonPatch({
    initialData: {
      user: {
        name: 'Alice',
        age: 25,
        preferences: {
          theme: 'dark',
          language: 'zh-CN'
        }
      },
      settings: {
        notifications: true,
        autoSave: false
      }
    },
    onError: (error: JsonPatchError) => {
      setMessage(`错误: ${error.message}`);
    },
    onSuccess: (operation, result) => {
      setMessage(`成功应用操作: ${operation.op} ${operation.path}`);
    }
  });

  const handleUpdateUserName = async () => {
    await jsonPatch.replace('/user/name', 'Bob');
  };

  const handleToggleNotifications = async () => {
    const current = jsonPatch.getValueByPath('/settings/notifications');
    await jsonPatch.replace('/settings/notifications', !current);
  };

  const handleAddHobby = async () => {
    // 如果 hobbies 数组不存在，先创建它
    if (!jsonPatch.pathExists('/user/hobbies')) {
      await jsonPatch.add('/user/hobbies', []);
    }

    const hobbies = jsonPatch.getValueByPath('/user/hobbies') || [];
    await jsonPatch.replace('/user/hobbies', [...hobbies, 'reading']);
  };

  const handleBatchUpdate = async () => {
    // 批量应用多个操作
    const patch = [
      { op: 'replace' as const, path: '/user/age', value: 26 },
      { op: 'add' as const, path: '/user/email', value: 'alice@example.com' },
      { op: 'replace' as const, path: '/settings/autoSave', value: true }
    ];

    await jsonPatch.applyPatch(patch);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>JSON Patch Hook 使用示例</h2>

      {message && (
        <div style={{
          padding: '10px',
          marginBottom: '20px',
          backgroundColor: message.startsWith('错误') ? '#f8d7da' : '#d4edda',
          color: message.startsWith('错误') ? '#721c24' : '#155724',
          borderRadius: '4px'
        }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h3>当前数据</h3>
          <pre style={{
            backgroundColor: '#f8f9fa',
            padding: '15px',
            borderRadius: '4px',
            fontSize: '14px',
            overflow: 'auto'
          }}>
            {JSON.stringify(jsonPatch.data, null, 2)}
          </pre>
        </div>

        <div>
          <h3>操作</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={handleUpdateUserName}
              style={{ padding: '10px', borderRadius: '4px', border: 'none', backgroundColor: '#007bff', color: 'white' }}
            >
              更新用户名为 Bob
            </button>

            <button
              onClick={handleToggleNotifications}
              style={{ padding: '10px', borderRadius: '4px', border: 'none', backgroundColor: '#28a745', color: 'white' }}
            >
              切换通知设置
            </button>

            <button
              onClick={handleAddHobby}
              style={{ padding: '10px', borderRadius: '4px', border: 'none', backgroundColor: '#17a2b8', color: 'white' }}
            >
              添加爱好
            </button>

            <button
              onClick={handleBatchUpdate}
              style={{ padding: '10px', borderRadius: '4px', border: 'none', backgroundColor: '#6f42c1', color: 'white' }}
            >
              批量更新
            </button>

            <button
              onClick={async () => {
                // 演示自动创建路径功能 - 即使 extra 对象不存在也能成功
                await jsonPatch.addWithPath('/extra/nested/deep/value', 'Auto-created path!');
              }}
              style={{ padding: '10px', borderRadius: '4px', border: 'none', backgroundColor: '#fd7e14', color: 'white' }}
            >
              自动创建路径 (/extra/nested/deep/value)
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={jsonPatch.undo}
                disabled={!jsonPatch.canUndo}
                style={{
                  padding: '10px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: jsonPatch.canUndo ? '#ffc107' : '#6c757d',
                  color: jsonPatch.canUndo ? '#212529' : 'white',
                  opacity: jsonPatch.canUndo ? 1 : 0.5
                }}
              >
                撤销
              </button>

              <button
                onClick={jsonPatch.redo}
                disabled={!jsonPatch.canRedo}
                style={{
                  padding: '10px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: jsonPatch.canRedo ? '#6f42c1' : '#6c757d',
                  color: 'white',
                  opacity: jsonPatch.canRedo ? 1 : 0.5
                }}
              >
                重做
              </button>

              <button
                onClick={jsonPatch.reset}
                style={{ padding: '10px', borderRadius: '4px', border: 'none', backgroundColor: '#dc3545', color: 'white' }}
              >
                重置
              </button>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h4>统计信息</h4>
            <ul style={{ fontSize: '14px', color: '#6c757d' }}>
              <li>总操作数: {jsonPatch.operations.length}</li>
              <li>历史记录: {jsonPatch.history.length}</li>
              <li>可撤销: {jsonPatch.canUndo ? '是' : '否'}</li>
              <li>可重做: {jsonPatch.canRedo ? '是' : '否'}</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>应用的操作</h3>
        <pre style={{
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '4px',
          fontSize: '13px',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          {JSON.stringify(jsonPatch.operations, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default JsonPatchExample;
