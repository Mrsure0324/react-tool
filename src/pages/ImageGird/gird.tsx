import { Image } from 'antd';
import styles from './index.module.scss';
import cn from 'classnames';


interface ImageGridProps {
  images: string[];
  maxCount?: number;
  className?: string;
  width?: number;
}

const ImageGrid = ({
  images = [],
  maxCount = 9,
  className,
  width = 50,
}: ImageGridProps) => {
  const displayImages = images.slice(0, maxCount);
  const count = displayImages.length;
  const remainingCount = images.length - maxCount;
  const hasMore = remainingCount > 0;

  const getGridClassName = () => {
    if (count === 1) return styles.single;
    if (count === 2) return styles.double;
    if (count === 3) return styles.triple;
    if (count === 4) return styles.quad;
    return styles.default;
  };

  const getImageClassName = () => {
    if (count === 1) return styles.single;
    if (count === 2) return styles.double;
    return styles.multiple;
  };

  return (
    <Image.PreviewGroup
      items={images.map(img => ({ src: img }))}
    >
      <div
        style={{ width: `${width}%` }}
        className={cn(styles.imageGrid, getGridClassName(), className)}
      >
        {displayImages.map((img, index) => {
          const isLastImage = index === displayImages.length - 1;
          const shouldShowOverlay = isLastImage && hasMore;
          return (
            <div key={index} className={styles.imageContainer}>
              <Image
                src={img}
                className={cn(styles.image, getImageClassName())}
                preview={{
                  mask: <div></div>
                }}
                placeholder={
                  <div className={styles.placeholder}>
                    加载中...
                  </div>
                }
              />
              {shouldShowOverlay && (
                <div className={styles.overlay}>
                  +{remainingCount}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Image.PreviewGroup>
  );
};

export default ImageGrid;