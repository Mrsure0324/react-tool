import styles from './index.module.scss';
import Shimmer from '../Shimmer';

interface ContentSkeletonProps {
  lineCount: number;
}

const ContentSkeleton = ({
  lineCount = 3
}: ContentSkeletonProps) => {

  // 动态生成mask样式
  const generateMaskStyle = () => {
    const lineHeight = 16; // 每行高度
    const lineGap = 8; // 行间距

    const maskRules = [];
    const webkitMaskRules = [];

    for (let i = 0; i < lineCount; i++) {
      const top = i * (lineHeight + lineGap);
      const width = i === lineCount - 1 ? '75%' : '100%';

      const rule = `linear-gradient(white, white) 0 ${top}px / ${width} ${lineHeight}px no-repeat`;
      maskRules.push(rule);
      webkitMaskRules.push(rule);
    }

    return {
      mask: maskRules.join(', '),
      WebkitMask: webkitMaskRules.join(', ')
    };
  };

  return <div className={styles['content-skeleton']}>
    <div className={styles['content-skeleton-inner']}>
      {
        Array.from({ length: lineCount }).map((_, index) => {
          const isLast = index === lineCount - 1;
          return (
            <div
              className={styles['content-skeleton-inner-item']}
              key={index}
              style={isLast ? { width: '75%' } : {}}
            >
            </div>
          );
        })
      }
      <div
        className={styles['shimmer-container']}
        style={generateMaskStyle()}
      >
        <Shimmer
          responsive={true}
          duration={1.6}
          borderRadius={4}
          angle={15} // 水平向右的扫光效果
        />
      </div>
    </div>
  </div>

}

export default ContentSkeleton;