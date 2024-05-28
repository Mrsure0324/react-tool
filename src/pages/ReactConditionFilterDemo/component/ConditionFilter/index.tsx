import React, {useState} from 'react'
import styles from './index.module.less'
import { ConditionFilterProps, Group, GroupType } from './type';
import { Button, Input } from 'antd';
import { cloneDeep } from 'lodash';
import {
    EventIndicator
} from './Conditions'
const GroupNameRender = (props:{
    name: string,
    onChange?: (name: string) => void,
}) => {

    const [isEditor,setIsEditor] = useState(false);

    return (
        <>
            {
                isEditor ? (
                    <>
                        <Input value={props.name} onChange={(e) => {
                            props.onChange && props.onChange(e.target.value);
                        }}/>
                        
                    </>
                ) : (
                    <span> { props.name }</span>
                )
            }
            <Button type='link' onClick={() => {setIsEditor(!isEditor)}}>编辑</Button>
        </>
    )
}

const SwitchGroupRender = ({
    type,
    value,
    index,
}:{
    type?:GroupType
    value: Group['group_value'],
    index: number
}) => {
    switch(type) {
        case GroupType.EventIndicator: return (
            <EventIndicator 
                value={value}
                index={index}
            />
        )
        case GroupType.Subdivide: return '筛选明细'
        default: return <></>
    }
}

const GroupRender = (props:{
    value: Group,
    onChange?: (value: Group) => void,
    index?:number
}) => {

    const {
        value,
        onChange,
        index,
    } = props;

    return (
        <>
            <GroupNameRender 
                name={value.group_name} 
                onChange={(name) => {
                    onChange?.({
                        ...value,
                        group_name: name
                    })
                }}
            />
            <SwitchGroupRender 
                type={value?.group_type} 
                value={value?.group_value}
                index={index}
            />
        </>
    )
}

const ConditionFilter = (props:ConditionFilterProps) => {

    const {
        value=[],
        onChange,
        canSort=false
    } = props;

    const onChangeHandler = (item:Group,index:number) => {
        const newData:Group[] = cloneDeep(value);
        newData[index] = item;
        onChange?.(newData);
    }


    return (
        <div className={styles['condition-filter-box']}>
            {
                (value || []).map((item:Group, index:number) => {
                    return (
                        <>
                            <GroupRender 
                                onChange={(value) => onChangeHandler(value,index)} 
                                value={item} 
                                index={index}
                            />
                        </>
                    )
                })
            }
        </div>
    )
}
export default ConditionFilter