import React from 'react'
import { useState, useEffect } from 'react'
import styles from './index.module.less'
// import '/node_modules/react-grid-layout/css/styles.css'
// import '/node_modules/react-resizable/css/styles.css'
import GridLayout from "react-grid-layout";
import type {
    Layout
} from "react-grid-layout"
import useResizeObserver from '../useResizeObsever'
import { throttle, debounce } from 'lodash'
import { Button } from 'antd'


export interface DemoProps {
    
}

const Demo:React.FC<DemoProps> = (props) => {

    const {
        
    } = props;
    const [width, changeWidth] = useState(2000);
    const { eleRef } = useResizeObserver<HTMLDivElement>(
        throttle((ele) => {
            changeWidth(ele.clientWidth)
        }, 200),
        []
    )
    const maxCol = 24
    const wComputed = (col=3, n: number) => {
        return col / n 
    }
    const arr = [3,2,3,1]
    const layout:Layout[] = [
        { i: "a", x: 0, y: 0, w: wComputed(maxCol,3), maxW: wComputed(maxCol,3), minW: wComputed(maxCol,3), h: 4 },
        { i: "b", x: 0, y: 1, w: wComputed(maxCol,2), maxW: wComputed(maxCol,2), minW: wComputed(maxCol,2),h: 4 },
        { i: "c", x: 0, y: 2, w: wComputed(maxCol,1), maxW: wComputed(maxCol,1), minW: wComputed(maxCol,1),h: 4 },
        { i: "d", x: 1, y: 0, w: wComputed(maxCol,3), maxW: wComputed(maxCol,3), minW: wComputed(maxCol,3),h: 4 },
        { i: "f", x: 2, y: 0, w: wComputed(maxCol,3), maxW: wComputed(maxCol,3), minW: wComputed(maxCol,3),h: 4 },
    ];

    const items = [{
        type: '柱状图',
        name: '报表1',
        config: {},
    },{
        type: '柱状图',
        name: '报表2',
        config: {},
    },{
        type: '柱状图',
        name: '报表3',
        config: {},
    }]

    return (
        <>
            <Button>新增模块</Button>
            <div ref={eleRef} className={styles['layout-box']}>
                
                <GridLayout
                    className='layout'
                    layout={layout}
                    cols={maxCol}
                    rowHeight={30}
                    width={width}
                >
                    <div className={styles.item} key="a">1/3 a</div>
                    <div className={styles.item} key="b">1/2 b</div>
                    <div className={styles.item} key="c">1 c</div>
                    <div className={styles.item} key="d">1/3 d</div>
                    <div className={styles.item} key="f">1/3 f</div>
                </GridLayout>
            </div>
        </>
    )
}
export default Demo