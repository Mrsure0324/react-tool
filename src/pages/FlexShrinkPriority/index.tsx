import React, { useMemo, useState } from 'react';
import './index.less';
import ShrinkPriorityContainer from '@/components/ShrinkPriorityContainer';

/**
 * 测试页面：从左到右排列，视口变窄时优先压缩最右侧，当其到达最小宽度后再依次向左压缩
 *
 * 关键点：
 * - 使用 flex 布局，所有 item 仅允许收缩（flex-grow:0; flex-shrink:>0）
 * - 通过为更靠右的元素设置更大的 flex-shrink 权重，实现“先压右，再压左”
 * - 设置 min-width 下限，右侧项触达下限后，左侧才开始继续收缩
 */
const FlexShrinkPriorityPage: React.FC = () => {
  const SPC = ShrinkPriorityContainer as unknown as {
    Item: React.FC<any>;
  } & typeof ShrinkPriorityContainer;
  const [basis, setBasis] = useState<number>(220); // 期望宽度
  const [minWidth, setMinWidth] = useState<number>(100); // 最小宽度
  const [shrinkBase, setShrinkBase] = useState<number>(8); // 收缩权重的底数（越大越优先压右）
  const [protectedIds, setProtectedIds] = useState<Set<number | string>>(new Set()); // 受保护（不收缩）的项
  const [nextId, setNextId] = useState<number>(1);
  const [texts, setTexts] = useState<Array<{ id: number; text: string }>>([
    { id: 1, text: '示例：点击任意卡片可切换保护状态' },
    { id: 2, text: '支持自由添加文字容器' },
    { id: 3, text: '右侧优先收缩，更先到达最小宽度' }
  ]);
  const [newText, setNewText] = useState<string>('');

  const toggleProtected = (id: number | string) => {
    setProtectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addTextContainer = () => {
    const content = (newText || '').trim();
    if (!content) return;
    const id = nextId + 1;
    setTexts(prev => [...prev, { id, text: content }]);
    setNextId(id);
    setNewText('');
  };

  const removeLast = () => {
    setTexts(prev => prev.slice(0, Math.max(0, prev.length - 1)));
  };

  /**
   * 生成从左到右的收缩权重，使得最右侧最大。
   * 例如 5 个时 => [1, 8, 64, 512, 4096] （当底数为 8）
   */
  const shrinkWeights = useMemo(() => {
    const base = Math.max(2, Math.min(16, shrinkBase));
    return texts.map((_, idx) => Math.pow(base, idx)); // 左到右递增
  }, [texts, shrinkBase]);

  return (
    <div className="flex-priority-page">
      <div className="title">Flex 右侧优先收缩演示</div>
      <div className="desc">窗口变窄时：最右侧先收缩，触达最小宽度后再向左依次收缩。</div>

      <div className="toolbar">
        <label>
          期望宽度(px)
          <input
            type="number"
            min={60}
            max={600}
            value={basis}
            onChange={(e) => setBasis(Number(e.target.value || 220))}
          />
        </label>
        <label>
          最小宽度(px)
          <input
            type="number"
            min={40}
            max={400}
            value={minWidth}
            onChange={(e) => setMinWidth(Number(e.target.value || 100))}
          />
        </label>
        <label>
          收缩底数
          <input
            type="number"
            min={2}
            max={16}
            value={shrinkBase}
            onChange={(e) => setShrinkBase(Number(e.target.value || 8))}
          />
        </label>
        <label className="add-box">
          文字
          <input
            type="text"
            placeholder="输入要添加的文字"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addTextContainer();
            }}
          />
        </label>
        <button onClick={addTextContainer} title="添加一个文字容器">
          添加容器
        </button>
        <button onClick={removeLast} title="删除最后一个容器">
          删除最后
        </button>
        <button
          onClick={() => setProtectedIds(new Set())}
          title="清除所有受保护项"
        >
          清空保护
        </button>
      </div>

      <div className="demo-container">
        <ShrinkPriorityContainer>
          <SPC.Item id={1} fill>
            <div className="title-line">
              <span className="text">{'示例：点击任意卡片可切换保护状态撒来得及啊流口水久等啦会计书到啦科技手打立卡'}</span>
            </div>
          </SPC.Item>
          <SPC.Item id={2} >
            <div className="title-line">
              <span className="text">{'支持自由添加文换保护状态撒来得及啊流口水久等啦会计书到啦科技手打立卡字容器'}</span>
            </div>
          </SPC.Item>
        </ShrinkPriorityContainer>
      </div>
    </div>
  );
};

export default FlexShrinkPriorityPage;


