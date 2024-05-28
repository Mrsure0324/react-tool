import { 
    Group,
    GroupType,
    ConditionType,
    ChartType,
    IndexType,
    ChartConfig,
} from './component/ConditionFilter/type';

const ConditionGroups:Group[] =  [{
    group_name: '指标名称',
    relation: 'AND',
    group_type: GroupType.EventIndicator,
    group_value: {
        event: '111',
        computed: '2222'
    },
    filters: [{
        relation: 'OR',
        conditions: [{
            type:ConditionType.Attribute,
            value: 'event_indicator',
            name: '1111',
            operator: '='
        },{
            type:ConditionType.Behavior,
            user_handle: '',
        },{
            type:ConditionType.Behavior,
            user_handle: '',
        },]
    },{
        relation: 'OR',
        conditions: [{
            type:ConditionType.Attribute,
            value: 'event_indicator',
            name: '1111',
            operator: '='
        },{
            type:ConditionType.Behavior,
            user_handle: '',
        },]
    }]
}]

const ChartConfigData:ChartConfig = {
    name: '事件分析图表1',
    path: 'a/2/3',
    chartType: ChartType.Line,
    indexType: IndexType.AVG,
    style: {},
}

export default ConditionGroups
