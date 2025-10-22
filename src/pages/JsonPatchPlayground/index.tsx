import React, { useState, useCallback, useMemo } from 'react';
import {
  applyJsonPatch,
  applyJsonPatchOperation,
  generateJsonPatch,
  validateJsonPatch,
  getValueByPath,
  pathExists,
  appendString,
  JsonPatchOperation,
  JsonPatchResult
} from '../../utils/jsonPatch';
import './index.less';

// 预设的示例数据
const SAMPLE_DATA = {};


const JsonPatchPlayground: React.FC = () => {
  const [currentData, setCurrentData] = useState(SAMPLE_DATA);
  const [originalData] = useState(SAMPLE_DATA);
  const [patchOperations, setPatchOperations] = useState<JsonPatchOperation[]>([]);
  const [currentOperation, setCurrentOperation] = useState<JsonPatchOperation>({
    op: 'add',
    path: '',
    value: ''
  });
  const [batchOperations, setBatchOperations] = useState<string>('');
  const [result, setResult] = useState<JsonPatchResult | null>(null);
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'compare'>('single');

  // 应用单个操作
  const applySingleOperation = useCallback(() => {
    let result: JsonPatchResult;

    // 处理append操作
    if (currentOperation.op === 'append') {
      result = appendString(currentData, currentOperation.path, currentOperation.value || '');
    } else {
      result = applyJsonPatchOperation(currentData, currentOperation);
    }

    setResult(result);

    if (result.success && result.data) {
      setCurrentData(result.data);
      setPatchOperations(prev => [...prev, currentOperation]);
      // 清空当前操作
      setCurrentOperation({
        op: 'add',
        path: '',
        value: ''
      });
    }
  }, [currentData, currentOperation]);

  // 应用批量操作
  const applyBatchOperations = useCallback(() => {
    try {
      const operations: JsonPatchOperation[] = JSON.parse(batchOperations);
      const result = applyJsonPatch(currentData, operations);
      setResult(result);

      if (result.success && result.data) {
        setCurrentData(result.data);
        setPatchOperations(prev => [...prev, ...operations]);
        setBatchOperations('');
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: {
          message: `JSON解析错误: ${error.message}`,
          code: 'JSON_PARSE_ERROR'
        }
      });
    }
  }, [currentData, batchOperations]);

  // 重置数据
  const resetData = useCallback(() => {
    setCurrentData(SAMPLE_DATA);
    setPatchOperations([]);
    setResult(null);
    setBatchOperations('');
  }, []);

  // 生成补丁
  const generatePatch = useCallback(() => {
    const patch = generateJsonPatch(originalData, currentData);
    setBatchOperations(JSON.stringify(patch, null, 2));
    setActiveTab('batch');
  }, [originalData, currentData]);


  // 验证当前操作
  const operationValidation = useMemo(() => {
    if (!currentOperation.path) return null;
    return validateJsonPatch([currentOperation], currentData);
  }, [currentOperation, currentData]);

  // 检查路径是否存在
  const pathExistsResult = useMemo(() => {
    if (!currentOperation.path) return null;
    return pathExists(currentData, currentOperation.path);
  }, [currentOperation.path, currentData]);

  // 获取路径当前值
  const currentPathValue = useMemo(() => {
    if (!currentOperation.path) return null;
    return getValueByPath(currentData, currentOperation.path);
  }, [currentOperation.path, currentData]);

  return (
    <div className="json-patch-playground">
      <div className="playground-header">
        <h1>🔧 JSON Patch 调试工具</h1>
        <p>基于 RFC 6902 标准的 JSON Patch 操作演示和调试工具</p>
        <div className="header-actions">
          <button onClick={resetData} className="reset-btn">
            🔄 重置数据
          </button>
          <button onClick={generatePatch} className="generate-btn">
            📋 生成补丁
          </button>
        </div>
      </div>

      <div className="playground-content">
        {/* 左侧：数据展示 */}
        <div className="data-panel">
          <div className="data-section">
            <h3>📄 原始数据</h3>
            <pre className="json-display original">
              {JSON.stringify(originalData, null, 2)}
            </pre>
          </div>

          <div className="data-section">
            <h3>📝 当前数据</h3>
            <pre className="json-display current">
              {JSON.stringify(currentData, null, 2)}
            </pre>
          </div>

          <div className="data-section">
            <h3>📊 应用的操作</h3>
            <div className="operations-count">
              总计: {patchOperations.length} 个操作
            </div>
            <pre className="json-display operations">
              {JSON.stringify(patchOperations, null, 2)}
            </pre>
          </div>
        </div>

        {/* 右侧：操作面板 */}
        <div className="control-panel">
          {/* 标签页 */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'single' ? 'active' : ''}`}
              onClick={() => setActiveTab('single')}
            >
              🎯 单个操作
            </button>
            <button
              className={`tab ${activeTab === 'batch' ? 'active' : ''}`}
              onClick={() => setActiveTab('batch')}
            >
              📦 批量操作
            </button>
            <button
              className={`tab ${activeTab === 'compare' ? 'active' : ''}`}
              onClick={() => setActiveTab('compare')}
            >
              🔍 对比分析
            </button>
          </div>

          {/* 单个操作面板 */}
          {activeTab === 'single' && (
            <div className="single-operation-panel">
              <h3>单个操作配置</h3>

              <div className="form-group">
                <label>操作类型:</label>
                <select
                  value={currentOperation.op}
                  onChange={(e) => setCurrentOperation(prev => ({
                    ...prev,
                    op: e.target.value as JsonPatchOperation['op']
                  }))}
                >
                  <option value="add">add - 添加</option>
                  <option value="remove">remove - 删除</option>
                  <option value="replace">replace - 替换</option>
                  <option value="move">move - 移动</option>
                  <option value="copy">copy - 复制</option>
                  <option value="test">test - 测试</option>
                  <option value="append">append - 追加字符串</option>
                </select>
              </div>

              <div className="form-group">
                <label>路径 (JSON Pointer):</label>
                <input
                  type="text"
                  placeholder="/user/name"
                  value={currentOperation.path}
                  onChange={(e) => setCurrentOperation(prev => ({
                    ...prev,
                    path: e.target.value
                  }))}
                />
                {currentOperation.path && (
                  <div className="path-info">
                    <span className={`path-status ${pathExistsResult ? 'exists' : 'not-exists'}`}>
                      {pathExistsResult ? '✅ 路径存在' : '❌ 路径不存在'}
                    </span>
                    {pathExistsResult && (
                      <span className="current-value">
                        当前值: {JSON.stringify(currentPathValue)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {['add', 'replace', 'test'].includes(currentOperation.op) && (
                <div className="form-group">
                  <label>值 (JSON格式):</label>
                  <textarea
                    placeholder='"字符串" 或 123 或 {"key": "value"} 或 ["item1", "item2"]'
                    value={currentOperation.value || ''}
                    onChange={(e) => setCurrentOperation(prev => ({
                      ...prev,
                      value: e.target.value
                    }))}
                    rows={3}
                  />
                </div>
              )}

              {['move', 'copy'].includes(currentOperation.op) && (
                <div className="form-group">
                  <label>源路径:</label>
                  <input
                    type="text"
                    placeholder="/source/path"
                    value={currentOperation.from || ''}
                    onChange={(e) => setCurrentOperation(prev => ({
                      ...prev,
                      from: e.target.value
                    }))}
                  />
                </div>
              )}

              {operationValidation && (
                <div className="validation-error">
                  ❌ {operationValidation.message}
                </div>
              )}

              <button
                onClick={applySingleOperation}
                disabled={!!operationValidation}
                className="apply-btn"
              >
                🚀 应用操作
              </button>

            </div>
          )}

          {/* 批量操作面板 */}
          {activeTab === 'batch' && (
            <div className="batch-operation-panel">
              <h3>批量操作配置</h3>

              <div className="form-group">
                <label>JSON Patch 数组:</label>
                <textarea
                  placeholder='[{"op": "add", "path": "/newField", "value": "newValue"}]'
                  value={batchOperations}
                  onChange={(e) => setBatchOperations(e.target.value)}
                  rows={10}
                  className="batch-textarea"
                />
              </div>

              <button
                onClick={applyBatchOperations}
                disabled={!batchOperations.trim()}
                className="apply-btn"
              >
                🚀 应用批量操作
              </button>

            </div>
          )}

          {/* 对比分析面板 */}
          {activeTab === 'compare' && (
            <div className="compare-panel">
              <h3>对比分析</h3>

              <div className="compare-stats">
                <div className="stat-item">
                  <span className="stat-label">数据变化:</span>
                  <span className="stat-value">
                    {JSON.stringify(originalData) === JSON.stringify(currentData) ? '无变化' : '已修改'}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">操作总数:</span>
                  <span className="stat-value">{patchOperations.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">数据大小:</span>
                  <span className="stat-value">
                    {JSON.stringify(currentData).length} 字符
                  </span>
                </div>
              </div>

              <div className="operation-breakdown">
                <h4>操作类型统计:</h4>
                {Object.entries(
                  patchOperations.reduce((acc, op) => {
                    acc[op.op] = (acc[op.op] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([op, count]) => (
                  <div key={op} className="operation-stat">
                    <span className="op-name">{op}:</span>
                    <span className="op-count">{count}</span>
                  </div>
                ))}
              </div>

              <button onClick={generatePatch} className="generate-btn">
                📋 生成完整补丁
              </button>
            </div>
          )}

          {/* 结果显示 */}
          {result && (
            <div className={`result-panel ${result.success ? 'success' : 'error'}`}>
              <h4>{result.success ? '✅ 操作成功' : '❌ 操作失败'}</h4>
              {result.error && (
                <div className="error-details">
                  <p><strong>错误信息:</strong> {result.error.message}</p>
                  {result.error.code && (
                    <p><strong>错误代码:</strong> {result.error.code}</p>
                  )}
                </div>
              )}
              {result.success && result.appliedOperations && (
                <div className="success-details">
                  <p><strong>应用的操作:</strong> {result.appliedOperations.length} 个</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JsonPatchPlayground;
