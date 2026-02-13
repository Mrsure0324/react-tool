import React, { useState, useCallback, useEffect, useRef } from 'react';
import './index.less';

interface SSEEvent {
  event: string;
  data?: any;
  eventIndex?: number;
}

interface DeltaEvent extends SSEEvent {
  event: 'delta';
  data: {
    patch: Array<{
      op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test' | 'append';
      path: string;
      value?: any;
      from?: string;
    }>;
    eventIndex: number;
  };
}

// 示例SSE事件流数据
const SAMPLE_SSE_DATA = `event:message
data:{"sseId":"0c391eae-6b68-4481-b735-f241c4897718","eventIndex":53,"content":"黄金故事。","timestamp":"1761211791409"}

event:message
data:{"sseId":"0c391eae-6b68-4481-b735-f241c4897718","eventIndex":54,"content":"\\n\\n<async-custom-component>\\n <wrapperId>toolu_bdrk_014g2KhL21PPhLDfHqgMubRk</wrapperId>\\n <start>Generating image</start>\\n <eventName>writingToolUse</eventName>\\n <end>Finished generating image</end>\\n</async-custom-component>\\n\\n\\n","timestamp":"1761211791499"}

event:delta
data:{"patch":[{"op":"add","path":"/extraInfo/writingToolUse","value":{"toolu_bdrk_014g2KhL21PPhLDfHqgMubRk":{"wrapperId":"toolu_bdrk_014g2KhL21PPhLDfHqgMubRk","start":"Generating image","end":"Finished generating image","totalCount":1,"completedCount":0,"extra":{},"data":{},"loading":true}}}],"eventIndex":55}

event:ping

event:ping

event:ping

event:delta
data:{"patch":[{"op":"add","path":"/extraInfo/writingToolUse/toolu_bdrk_014g2KhL21PPhLDfHqgMubRk/type","value":"subAgentWrapper"},{"op":"add","path":"/extraInfo/writingToolUse/toolu_bdrk_014g2KhL21PPhLDfHqgMubRk/data/result","value":{"type":"imageView","start":"","totalCount":1,"completedCount":0,"extra":{},"data":{},"loading":true}},{"op":"add","path":"/extraInfo/writingToolUse/toolu_bdrk_014g2KhL21PPhLDfHqgMubRk/data/icon","value":"https://wy-static.wenxiaobai.com/bot-capability/prod/sub_agent_image.png"}],"eventIndex":56}

event:delta
data:{"patch":[{"op":"add","path":"/extraInfo/writingToolUse/toolu_bdrk_014g2KhL21PPhLDfHqgMubRk/extra/tool_name","value":"generate_normal_image"},{"op":"add","path":"/extraInfo/writingToolUse/toolu_bdrk_014g2KhL21PPhLDfHqgMubRk/extra/instruction","value":"创建一个4格漫画故事"},{"op":"add","path":"/extraInfo/writingToolUse/toolu_bdrk_014g2KhL21PPhLDfHqgMubRk/extra/n","value":"4"}],"eventIndex":57}

event:ping

event:delta
data:{"patch":[{"op":"add","path":"/extraInfo/writingToolUse/toolu_bdrk_014g2KhL21PPhLDfHqgMubRk/data/content","value":[{"wrapperId":"subagent_think_682519747","start":"Thinking...","end":"Thinking completed","totalCount":1,"completedCount":0,"extra":{},"data":{},"loading":true}]}],"eventIndex":58}

event:delta
data:{"patch":[{"op":"add","path":"/extraInfo/writingToolUse/toolu_bdrk_014g2KhL21PPhLDfHqgMubRk/data/content/0/type","value":"markdownCollapse"},{"op":"add","path":"/extraInfo/writingToolUse/toolu_bdrk_014g2KhL21PPhLDfHqgMubRk/data/content/0/data/content","value":"The user wants me to generate a"}],"eventIndex":59}

event:delta
data:{"patch":[{"op":"append","path":"/extraInfo/writingToolUse/toolu_bdrk_014g2KhL21PPhLDfHqgMubRk/data/content/0/data/content","value":" 4-panel comic about"}],"eventIndex":60}

event:delta
data:{"patch":[{"op":"append","path":"/extraInfo/writingToolUse/toolu_bdrk_014g2KhL21PPhLDfHqgMubRk/data/content/0/data/content","value":" \\"Golden Troubles\\" using"}],"eventIndex":61}

event:delta
data:{"patch":[{"op":"append","path":"/extraInfo/writingToolUse/toolu_bdrk_014g2KhL21PPhLDfHqgMubRk/data/content/0/data/content","value":" the \\"comic\\" preset style. The task specifies:"}],"eventIndex":62}

event:delta
data:{"patch":[{"op":"append","path":"/extraInfo/writingToolUse/toolu_bdrk_014g2KhL21PPhLDfHqgMubRk/data/content/0/data/content","value":"\\n\\n1. Use the \\"comic\\" style"}],"eventIndex":63}

event:ping`;

const SSEJsonPatchPlayground: React.FC = () => {
  const [sseInput, setSSEInput] = useState('');
  const [parsedEvents, setParsedEvents] = useState<SSEEvent[]>([]);
  const [deltaEvents, setDeltaEvents] = useState<DeltaEvent[]>([]);
  const [currentData, setCurrentData] = useState<any>({});
  const [currentEventIndex, setCurrentEventIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1000); // ms
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 解析SSE事件流
  const parseSSEStream = useCallback((sseText: string) => {
    try {
      const lines = sseText.split('\n');
      const events: SSEEvent[] = [];
      let currentEvent: Partial<SSEEvent> = {};

      for (const line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine === '') {
          // 空行表示一个事件结束
          if (currentEvent.event) {
            events.push(currentEvent as SSEEvent);
          }
          currentEvent = {};
        } else if (trimmedLine.startsWith('event:')) {
          currentEvent.event = trimmedLine.substring(6).trim();
        } else if (trimmedLine.startsWith('data:')) {
          const dataStr = trimmedLine.substring(5).trim();
          try {
            currentEvent.data = JSON.parse(dataStr);
            if (currentEvent.data?.eventIndex !== undefined) {
              currentEvent.eventIndex = currentEvent.data.eventIndex;
            }
          } catch {
            currentEvent.data = dataStr;
          }
        }
      }

      // 处理最后一个事件
      if (currentEvent.event) {
        events.push(currentEvent as SSEEvent);
      }

      setParsedEvents(events);

      // 提取delta事件
      const deltas = events.filter(
        (e): e is DeltaEvent => e.event === 'delta' && e.data?.patch
      );
      setDeltaEvents(deltas);
      setError(null);

      return deltas;
    } catch (err: any) {
      setError(`解析失败: ${err.message}`);
      return [];
    }
  }, []);

  // 应用单个patch操作
  const applyPatch = useCallback((data: any, patch: any[]) => {
    let result = JSON.parse(JSON.stringify(data));

    for (const operation of patch) {
      try {
        const { op, path, value, from } = operation;
        const pathParts = path.split('/').filter((p: string) => p !== '');

        switch (op) {
          case 'add': {
            // 确保路径存在
            let current = result;
            for (let i = 0; i < pathParts.length - 1; i++) {
              const part = pathParts[i];
              if (current[part] === undefined || current[part] === null) {
                // 检查下一个部分是否是数组索引
                const nextPart = pathParts[i + 1];
                const isNextPartArrayIndex = /^\d+$/.test(nextPart) || nextPart === '-';
                current[part] = isNextPartArrayIndex ? [] : {};
              }
              current = current[part];
            }

            const lastPart = pathParts[pathParts.length - 1];
            if (Array.isArray(current) && lastPart === '-') {
              current.push(value);
            } else {
              current[lastPart] = value;
            }
            break;
          }

          case 'append': {
            // 追加字符串
            let current = result;
            for (let i = 0; i < pathParts.length - 1; i++) {
              current = current[pathParts[i]];
            }
            const lastPart = pathParts[pathParts.length - 1];
            if (typeof current[lastPart] === 'string') {
              current[lastPart] += value;
            } else {
              current[lastPart] = String(value);
            }
            break;
          }

          case 'replace': {
            let current = result;
            for (let i = 0; i < pathParts.length - 1; i++) {
              current = current[pathParts[i]];
            }
            const lastPart = pathParts[pathParts.length - 1];
            current[lastPart] = value;
            break;
          }

          case 'remove': {
            let current = result;
            for (let i = 0; i < pathParts.length - 1; i++) {
              current = current[pathParts[i]];
            }
            const lastPart = pathParts[pathParts.length - 1];
            if (Array.isArray(current)) {
              current.splice(parseInt(lastPart), 1);
            } else {
              delete current[lastPart];
            }
            break;
          }

          default:
            console.warn(`不支持的操作类型: ${op}`);
        }
      } catch (err) {
        console.error('应用patch失败:', operation, err);
      }
    }

    return result;
  }, []);

  // 播放/暂停
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  }, [isPlaying]);

  // 重置
  const reset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCurrentData({});
    setCurrentEventIndex(-1);
    setIsPlaying(false);
  }, []);

  // 上一步
  const previousStep = useCallback(() => {
    if (currentEventIndex > 0) {
      // 重新应用到上一步
      let data = {};
      for (let i = 0; i < currentEventIndex - 1; i++) {
        data = applyPatch(data, deltaEvents[i].data.patch);
      }
      setCurrentData(data);
      setCurrentEventIndex(currentEventIndex - 1);
    }
  }, [currentEventIndex, deltaEvents, applyPatch]);

  // 下一步
  const nextStep = useCallback(() => {
    if (currentEventIndex < deltaEvents.length - 1) {
      const nextIndex = currentEventIndex + 1;
      const newData = applyPatch(currentData, deltaEvents[nextIndex].data.patch);
      setCurrentData(newData);
      setCurrentEventIndex(nextIndex);
    } else {
      // 播放结束
      setIsPlaying(false);
    }
  }, [currentEventIndex, deltaEvents, currentData, applyPatch]);

  // 自动播放效果
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentEventIndex(prev => {
          const nextIndex = prev + 1;
          if (nextIndex >= deltaEvents.length) {
            setIsPlaying(false);
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return prev;
          }

          setCurrentData(data => {
            return applyPatch(data, deltaEvents[nextIndex].data.patch);
          });

          return nextIndex;
        });
      }, playSpeed);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [isPlaying, playSpeed, deltaEvents, applyPatch]);

  // 解析按钮
  const handleParse = useCallback(() => {
    reset();
    parseSSEStream(sseInput);
  }, [sseInput, parseSSEStream, reset]);

  // 加载示例数据
  const loadSampleData = useCallback(() => {
    setSSEInput(SAMPLE_SSE_DATA);
    reset();
    parseSSEStream(SAMPLE_SSE_DATA);
  }, [parseSSEStream, reset]);

  return (
    <div className="sse-json-patch-playground">
      <div className="playground-header">
        <h1>📡 SSE事件流 JSON Patch 调试工具</h1>
        <p>解析SSE事件流中的delta事件，按节奏应用JSON Patch操作</p>
      </div>

      <div className="playground-content">
        {/* 左侧：输入和控制 */}
        <div className="input-panel">
          <div className="input-section">
            <h3>📥 SSE事件流输入</h3>
            <textarea
              className="sse-input"
              placeholder="粘贴SSE事件流数据...&#10;&#10;例如:&#10;event:message&#10;data:{&quot;content&quot;:&quot;hello&quot;}&#10;&#10;event:delta&#10;data:{&quot;patch&quot;:[{&quot;op&quot;:&quot;add&quot;,&quot;path&quot;:&quot;/name&quot;,&quot;value&quot;:&quot;test&quot;}]}"
              value={sseInput}
              onChange={(e) => setSSEInput(e.target.value)}
              rows={15}
            />
            <div className="button-group">
              <button onClick={loadSampleData} className="sample-btn">
                📋 加载示例数据
              </button>
              <button onClick={handleParse} className="parse-btn">
                🔍 解析事件流
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          {deltaEvents.length > 0 && (
            <div className="control-section">
              <h3>🎮 播放控制</h3>

              <div className="stats">
                <div className="stat-item">
                  <span className="stat-label">总事件:</span>
                  <span className="stat-value">{parsedEvents.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Delta事件:</span>
                  <span className="stat-value">{deltaEvents.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">当前进度:</span>
                  <span className="stat-value">
                    {currentEventIndex + 1} / {deltaEvents.length}
                  </span>
                </div>
              </div>

              <div className="speed-control">
                <label>播放速度 (ms):</label>
                <input
                  type="number"
                  value={playSpeed}
                  onChange={(e) => setPlaySpeed(Math.max(100, parseInt(e.target.value) || 1000))}
                  min="100"
                  step="100"
                />
              </div>

              <div className="control-buttons">
                <button onClick={reset} className="control-btn reset">
                  🔄 重置
                </button>
                <button
                  onClick={previousStep}
                  className="control-btn"
                  disabled={currentEventIndex < 0}
                >
                  ⏮ 上一步
                </button>
                <button onClick={togglePlay} className="control-btn play">
                  {isPlaying ? '⏸ 暂停' : '▶️ 播放'}
                </button>
                <button
                  onClick={nextStep}
                  className="control-btn"
                  disabled={currentEventIndex >= deltaEvents.length - 1}
                >
                  ⏭ 下一步
                </button>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${deltaEvents.length > 0 ? ((currentEventIndex + 1) / deltaEvents.length) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
          )}

          {deltaEvents.length > 0 && (
            <div className="events-section">
              <h3>📋 Delta事件列表</h3>
              <div className="events-list">
                {deltaEvents.map((event, index) => (
                  <div
                    key={index}
                    className={`event-item ${index === currentEventIndex ? 'active' : ''} ${index < currentEventIndex ? 'completed' : ''}`}
                  >
                    <div className="event-header">
                      <span className="event-number">#{index + 1}</span>
                      <span className="event-index">EventIndex: {event.data.eventIndex}</span>
                      <span className="patch-count">{event.data.patch.length} 操作</span>
                    </div>
                    <div className="event-operations">
                      {event.data.patch.map((op, opIndex) => (
                        <div key={opIndex} className="operation-item">
                          <span className={`op-type op-${op.op}`}>{op.op}</span>
                          <span className="op-path">{op.path}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右侧：数据展示 */}
        <div className="data-panel">
          <div className="data-section">
            <h3>📊 当前数据状态</h3>
            <div className="data-info">
              <span>步骤: {currentEventIndex + 1} / {deltaEvents.length || 0}</span>
            </div>
            <pre className="json-display">
              {JSON.stringify(currentData, null, 2)}
            </pre>
          </div>

          {currentEventIndex >= 0 && deltaEvents[currentEventIndex] && (
            <div className="data-section">
              <h3>🔧 当前操作详情</h3>
              <pre className="json-display patch-display">
                {JSON.stringify(deltaEvents[currentEventIndex].data.patch, null, 2)}
              </pre>
            </div>
          )}

          {parsedEvents.length > 0 && (
            <div className="data-section">
              <h3>📝 所有事件</h3>
              <div className="all-events-count">
                总计: {parsedEvents.length} 个事件
              </div>
              <div className="events-summary">
                {Object.entries(
                  parsedEvents.reduce((acc, event) => {
                    acc[event.event] = (acc[event.event] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([eventType, count]) => (
                  <div key={eventType} className="event-type-stat">
                    <span className="event-type">{eventType}:</span>
                    <span className="event-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SSEJsonPatchPlayground;

