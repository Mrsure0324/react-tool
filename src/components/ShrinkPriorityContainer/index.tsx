import React, { isValidElement, ReactNode } from 'react';
import classNames from 'classnames';
import './index.scss';

type CssLength = number | string;

export type ShrinkPriorityContainerProps = {
  children: ReactNode;
  basis?: CssLength;
  minWidth?: CssLength;
  /**
   * 右侧优先的收缩基数（越大，越倾向先压右侧）
   */
  shrinkBase?: number;
  /**
   * 哪些 id 的子项受保护（不收缩）
   */
  protectedIds?: Set<number | string>;
  /**
   * 从 children 的数据中提取 id，用于匹配 protectedIds
   */
  getItemId?: (child: ReactNode, index: number) => number | string;
  /**
   * 点击子项时的回调
   */
  onItemClick?: (id: number | string) => void;
  className?: string;
};

export type ShrinkPriorityContainerItemProps = {
  id?: number | string;
  basis?: CssLength;
  minWidth?: CssLength;
  shrink?: number;
  /**
   * 让该项占据剩余空间（flex-grow: 1）
   */
  fill?: boolean;
  protected?: boolean;
  className?: string;
  onClick?: () => void;
  children?: ReactNode;
};

function toCssLength(value: CssLength | undefined, fallbackPx: number): string {
  if (value === undefined || value === null) return `${fallbackPx}px`;
  if (typeof value === 'number') return `${value}px`;
  return value;
}

const ShrinkPriorityContainerItem: React.FC<ShrinkPriorityContainerItemProps> = ({
  id,
  basis,
  minWidth,
  shrink,
  fill,
  protected: isProtected,
  className,
  onClick,
  children,
}) => {
  const style: React.CSSProperties = {
    // 默认 220px / 100px 与样式表中的 var(--basis/--min) 对应
    ['--basis' as any]: toCssLength(basis, 220),
    ['--min' as any]: toCssLength(minWidth, 100),
    ['--shrink' as any]: shrink ?? undefined,
    flexGrow: fill ? 1 : undefined,
  };
  return (
    <div
      className={classNames('spc-item', { protected: isProtected, fill }, className)}
      style={style}
      onClick={onClick}
      data-id={id}
    >
      {children}
    </div>
  );
};
ShrinkPriorityContainerItem.displayName = 'ShrinkPriorityContainerItem';

interface ShrinkPriorityContainerComponent
  extends React.FC<ShrinkPriorityContainerProps> {
  Item: React.FC<ShrinkPriorityContainerItemProps>;
}

const ShrinkPriorityContainerBase: React.FC<ShrinkPriorityContainerProps> = ({
  children,
  basis = 220,
  minWidth = 100,
  shrinkBase = 64,
  protectedIds,
  getItemId,
  onItemClick,
  className,
}) => {
  const childArray = React.Children.toArray(children);

  return (
    <div className={classNames('spc-row', className)}>
      {childArray.map((child, idx) => {
        const isItem =
          isValidElement(child) &&
          (child.type as any)?.displayName === 'ShrinkPriorityContainerItem';

        let resolvedId: number | string;
        if (
          isItem &&
          (child.props as ShrinkPriorityContainerItemProps).id !== undefined
        ) {
          resolvedId = (child.props as ShrinkPriorityContainerItemProps).id as
            | number
            | string;
        } else if (getItemId) {
          resolvedId = getItemId(child, idx);
        } else {
          resolvedId = idx;
        }

        const isProtected =
          (isItem && (child.props as ShrinkPriorityContainerItemProps).protected) ||
          (protectedIds ? protectedIds.has(resolvedId) : false);

        // 左到右收缩权重递增，右侧更大
        const shrinkWeight = Math.pow(Math.max(2, Math.min(16, shrinkBase)), idx);

        const itemProps: ShrinkPriorityContainerItemProps = {
          id: resolvedId,
          basis: (isItem && child.props.basis) ?? basis,
          minWidth: (isItem && child.props.minWidth) ?? minWidth,
          shrink: (isItem && child.props.shrink) ?? shrinkWeight,
          fill: isItem ? child.props.fill : undefined,
          protected: isProtected,
          className: isItem ? child.props.className : undefined,
          onClick:
            (isItem && child.props.onClick) ||
            (onItemClick
              ? () => {
                onItemClick(resolvedId);
              }
              : undefined),
          children: isItem ? child.props.children : child,
        };

        return <ShrinkPriorityContainerItem key={resolvedId} {...itemProps} />;
      })}
    </div>
  );
};

const ShrinkPriorityContainer = ShrinkPriorityContainerBase as ShrinkPriorityContainerComponent;
ShrinkPriorityContainer.Item = ShrinkPriorityContainerItem;

export default ShrinkPriorityContainer;


