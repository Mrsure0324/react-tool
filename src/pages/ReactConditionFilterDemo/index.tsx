import React, {useState} from 'react'
import styles from './index.module.less'
import ConditionFilter from './component/ConditionFilter'
import mockData from './value.mock'

export interface ReactConditionFilterDemoProps {
    
}

const ReactConditionFilterDemo:React.FC<ReactConditionFilterDemoProps> = (props) => {

    const [value, setValue] = React.useState<any>(mockData);

    return (
        <>
            <ConditionFilter
                value={value}
                onChange={(value) => setValue(value)}
            />
        </>
    )
}
export default ReactConditionFilterDemo