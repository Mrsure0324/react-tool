import React, {useMemo, useState} from 'react'
import styles from './index.module.less'
import {Select} from 'antd'
export interface ThemeProps {
    
}

export enum ThemeClassName {
    'theme-user-vip-lv1',
    'theme-user-vip-lv2',
    'theme-user-common-lv1',
    'theme-user-common-lv2',
}

const Theme:React.FC<ThemeProps> = (props) => {

    const {
        
    } = props;

    const [theme, setTheme] = React.useState('theme-user-vip')

    console.log(ThemeClassName);

    const tabOptions = ['LV1','LV2','LV3','LV4','LV5','LV6','LV7','LV8','LV9','LV10'];
    const [currentTab,setCurrent] = useState<string>('LV1'); 
    const currentTabsOptions = useMemo(() => {
        const index = tabOptions.indexOf(currentTab);
        if (index === -1) {
            return [];
        }

        const start = index - 2;
        const end = index + 3;

        console.log(start,end);

        const result = [];
        for (let i = start; i < end; i++) {
            result.push(tabOptions[i] || '');
        }

        return result;
    },[currentTab])

    return (
        <>
            <Select 
                value={theme}
                onChange={(value) => {
                    setTheme(value)
                }}
                options={[{
                    value: 'theme-user-vip',
                    label: 'VIP',
                },{
                    value: 'theme-user-common',
                    label: 'Common',
                }]}
            />
            <div className={styles[theme]}>
                <div className={styles.tab} >
                    <div className={styles.tabInner} >
                        {
                            currentTabsOptions.map((item,index) => {
                                return (
                                    <div className={`${styles.tabItem} ${styles[`tabItem-${index+1}`]}`} key={index} onClick={() => setCurrent(item)}>{item}</div>
                                )
                            })
                        }
                    </div>
                </div>
                <div className={`${styles.module1} ${styles.module}`}></div>
                <div className={`${styles.module2} ${styles.module}`}></div>
                <div className={`${styles.module3} ${styles.module}`}></div>
                <div className={`${styles.module4} ${styles.module}`}></div>
                <div className={`${styles.module5} ${styles.module}`}></div>
                
            </div>
        </>
    )
}
export default Theme