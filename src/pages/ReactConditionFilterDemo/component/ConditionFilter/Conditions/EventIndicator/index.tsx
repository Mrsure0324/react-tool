import React from 'react'
import styles from './index.module.less'
import { Group } from '../../type'

export interface EventIndicatorProps {
    value: Group['group_value'],
    onChange: (value: Group['group_value']) => void,
    index: number
}

const EventIndicator:React.FC<EventIndicatorProps> = (props) => {

    const {
        value,
        onChange,
        index,
    } = props;

    const onChangeHandler = (value: Group['group_value']) => {
        onChange?.(value)
    }

    return (
        <>
            指标select
        </>
    )
}
export default EventIndicator