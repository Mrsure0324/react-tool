import React from 'react';
import Shimmer from '../../components/Shimmer';

/**
 * Loading页面 - 显示加载状态的页面
 * 包含一个带有高光动画效果的骨架屏
 */
const Loading: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        width: '800px',
        height: '800px',
        backgroundColor: 'rgb(232, 233, 236)',
      }}>
        <Shimmer
          responsive={true}
          duration={2.5}
        />
      </div>
    </div>
  );
};

export default Loading;