import React, { useState, useCallback } from 'react';
import { useJsonPatch } from '../../hooks/useJsonPatch';
import { JsonPatchError } from '../../types/jsonPatch';
import './index.less';

const INITIAL_DATA = {
  name: "John Doe",
  age: 30,
  email: "john@example.com",
  hobbies: ["reading", "gaming"],
  address: {
    city: "New York",
    country: "USA"
  },
  active: true
};

const JsonPatchDemo: React.FC = () => {
  const [selectedOperation, setSelectedOperation] = useState('add');
  const [newPath, setNewPath] = useState('');
  const [newValue, setNewValue] = useState('');
  const [fromPath, setFromPath] = useState('');
  const [testValue, setTestValue] = useState('');
  const [appendText, setAppendText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const jsonPatch = useJsonPatch({
    initialData: INITIAL_DATA,
    maxHistorySize: 50,
    enableValidation: true,
    onError: (error: JsonPatchError) => {
      setErrorMessage(error.message);
      console.error('JSON Patch 错误:', error);
    },
    onSuccess: () => {
      setErrorMessage('');
      clearForm();
    }
  });

  const clearForm = useCallback(() => {
    setNewPath('');
    setNewValue('');
    setFromPath('');
    setTestValue('');
    setAppendText('');
  }, []);

  const handleApplyOperation = useCallback(async () => {
    setErrorMessage('');

    let success = false;

    switch (selectedOperation) {
      case 'add':
        success = await jsonPatch.add(newPath, newValue);
        break;
      case 'remove':
        success = await jsonPatch.remove(newPath);
        break;
      case 'replace':
        success = await jsonPatch.replace(newPath, newValue);
        break;
      case 'move':
        success = await jsonPatch.move(fromPath, newPath);
        break;
      case 'copy':
        success = await jsonPatch.copy(fromPath, newPath);
        break;
      case 'test':
        success = await jsonPatch.test(newPath, testValue);
        break;
      case 'append':
        success = await jsonPatch.append(newPath, appendText);
        break;
      default:
        setErrorMessage('不支持的操作类型');
    }

    if (!success && !errorMessage) {
      setErrorMessage('操作执行失败');
    }
  }, [selectedOperation, newPath, newValue, fromPath, testValue, appendText, jsonPatch, errorMessage]);

  const handleGeneratePatch = useCallback(() => {
    const patch = jsonPatch.generatePatch();
    console.log('生成的补丁:', patch);
  }, [jsonPatch]);

  const setQuickExample = useCallback((operation: string, path: string, value?: string, from?: string) => {
    setSelectedOperation(operation);
    setNewPath(path);
    setNewValue(value || '');
    setFromPath(from || '');
    setTestValue(value || '');
  }, []);

  return (
    <div className="json-patch-demo">
      <div className="demo-header">
        <h1>JSON 补丁演示</h1>
        <p>RFC 6902 JSON 补丁操作的交互式演示</p>
      </div>

      <div className="demo-content">
        <div className="json-panels">
          <div className="json-panel">
            <h3>原始 JSON</h3>
            <pre className="json-display">
              {JSON.stringify(jsonPatch.originalData, null, 2)}
            </pre>
          </div>

          <div className="json-panel">
            <h3>当前 JSON</h3>
            <pre className="json-display">
              {JSON.stringify(jsonPatch.data, null, 2)}
            </pre>
          </div>
        </div>

        <div className="operations-panel">
          <h3>JSON 补丁操作</h3>

          {errorMessage && (
            <div className="error-message">
              {errorMessage}
            </div>
          )}

          <div className="operation-form">
            <div className="form-row">
              <label>操作类型:</label>
              <select
                value={selectedOperation}
                onChange={(e) => setSelectedOperation(e.target.value)}
              >
                <option value="add">add</option>
                <option value="remove">remove</option>
                <option value="replace">replace</option>
                <option value="move">move</option>
                <option value="copy">copy</option>
                <option value="test">test</option>
                <option value="append">append</option>
              </select>
            </div>

            <div className="form-row">
              <label>路径:</label>
              <input
                type="text"
                placeholder="/属性/路径"
                value={newPath}
                onChange={(e) => setNewPath(e.target.value)}
              />
            </div>

            {['add', 'replace'].includes(selectedOperation) && (
              <div className="form-row">
                <label>值 (JSON):</label>
                <input
                  type="text"
                  placeholder='"字符串" 或 42 或 {"键": "值"}'
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                />
              </div>
            )}

            {['move', 'copy'].includes(selectedOperation) && (
              <div className="form-row">
                <label>源路径:</label>
                <input
                  type="text"
                  placeholder="/源/路径"
                  value={fromPath}
                  onChange={(e) => setFromPath(e.target.value)}
                />
              </div>
            )}

            {selectedOperation === 'test' && (
              <div className="form-row">
                <label>测试值 (JSON):</label>
                <input
                  type="text"
                  placeholder='"期望值"'
                  value={testValue}
                  onChange={(e) => setTestValue(e.target.value)}
                />
              </div>
            )}

            {selectedOperation === 'append' && (
              <div className="form-row">
                <label>要追加的文本:</label>
                <input
                  type="text"
                  placeholder='要追加到现有字符串的文本'
                  value={appendText}
                  onChange={(e) => setAppendText(e.target.value)}
                />
              </div>
            )}

            <div className="form-actions">
              <button onClick={handleApplyOperation} className="apply-btn">
                应用操作
              </button>
              <button
                onClick={jsonPatch.undo}
                className="undo-btn"
                disabled={!jsonPatch.canUndo}
              >
                撤销上一步
              </button>
              <button
                onClick={jsonPatch.redo}
                className="redo-btn"
                disabled={!jsonPatch.canRedo}
              >
                重做
              </button>
              <button onClick={jsonPatch.reset} className="reset-btn">
                重置演示
              </button>
            </div>
          </div>

          <div className="patch-display">
            <h4>生成的补丁操作:</h4>
            <pre className="patch-json">
              {JSON.stringify(jsonPatch.operations, null, 2)}
            </pre>
            <button onClick={handleGeneratePatch} className="generate-btn">
              从比较生成补丁
            </button>
          </div>

          <div className="stats-display">
            <h4>操作统计:</h4>
            <div className="stats-info">
              <p>总操作数: {jsonPatch.operations.length}</p>
              <p>历史记录: {jsonPatch.history.length}</p>
              <p>可撤销: {jsonPatch.canUndo ? '是' : '否'}</p>
              <p>可重做: {jsonPatch.canRedo ? '是' : '否'}</p>
            </div>
          </div>
        </div>

        <div className="examples-panel">
          <h3>快速示例</h3>
          <div className="example-buttons">
            <button onClick={() => setQuickExample('replace', '/name', '"Jane Doe"')}>
              替换姓名
            </button>

            <button onClick={() => setQuickExample('add', '/hobbies/2', '"cooking"')}>
              添加爱好
            </button>

            <button onClick={() => setQuickExample('remove', '/age')}>
              删除年龄
            </button>

            <button onClick={() => setQuickExample('move', '/contact/email', '', '/email')}>
              移动邮箱
            </button>

            <button onClick={() => setQuickExample('test', '/active', 'true')}>
              测试激活状态
            </button>

            <button onClick={() => {
              setSelectedOperation('append');
              setNewPath('/name');
              setAppendText(' - Updated');
            }}>
              追加到姓名
            </button>

            <button onClick={() => setQuickExample('copy', '/backup/name', '', '/name')}>
              复制姓名
            </button>

            <button onClick={() => setQuickExample('add', '/metadata', '{"created": "2023-01-01", "version": 1}')}>
              添加元数据
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonPatchDemo;