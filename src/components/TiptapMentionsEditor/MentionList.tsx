import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import styles from './index.module.scss';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface MentionListProps {
  items: User[];
  command: (item: User) => void;
}

export interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const MentionList = forwardRef<MentionListRef, MentionListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command({
        ...item,
        label: item.name
      } as any);
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className={styles.mentionList}>
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            className={`${styles.mentionItem} ${index === selectedIndex ? styles.selected : ''}`}
            key={item.id}
            onClick={() => selectItem(index)}
            type="button"
          >
            <div className={styles.mentionAvatar}>
              {item.avatar || '👤'}
            </div>
            <div className={styles.mentionInfo}>
              <div className={styles.mentionName}>{item.name}</div>
              <div className={styles.mentionEmail}>{item.email}</div>
            </div>
          </button>
        ))
      ) : (
        <div className={styles.mentionEmpty}>No users found</div>
      )}
    </div>
  );
});

MentionList.displayName = 'MentionList';

export default MentionList; 