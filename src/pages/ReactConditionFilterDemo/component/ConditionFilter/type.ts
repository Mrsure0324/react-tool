export interface ConditionFilterProps {
    value: Group[],
    onChange: (value: Group[]) => void,
    canSort?: boolean
}

export interface Group {
    group_name: string;
    group_value: (
        EventIndicatorGroupValue 
    );
    group_type?: GroupType;
    relation: relation;
    filters: Filters[];
}

export interface Filters {
    relation: relation;
    conditions: (
        AttributeCondition |
        BehaviorCondition
    )[];
}

type relation = 'AND' | 'OR'

/** Group 类型枚举 **/
export enum GroupType {
    EventIndicator="EventIndicator",
    Subdivide='Subdivide'
}

/** Condition 类型枚举 **/
export enum ConditionType {
    Attribute = "Attribute",
    Behavior = "Behavior" 
}

/** 属性过滤ConditionValue **/
type AttributeCondition = {
    name: string,
    value: string | number
    operator: string,
    type:ConditionType.Attribute
}

/** 行为圈选ConditionValue **/
type BehaviorCondition = {
    user_handle: string,
    event?: string,
    compute?: string,
    operator?: string,
    value?: string | number,
    date?: [string,string],
    type:ConditionType.Behavior
}

/** 事件指标GroupValue **/
type EventIndicatorGroupValue = {
    event: string,
    computed: string,
}

export enum ChartType {
    Line = "Line",
    Bar = "Bar",
    Pie = "Pie"
    //....
}

export enum IndexType {
    'SUM'='SUM',
    'AVG'='AVG',
    'MAX'='MAX',
    'MIN'='MIN',
}

export interface DataTypesPickerProps {
    date:[string,string],
    dateType: 'hover' | 'day' | 'week' | 'month' | 'year',
    rangeType: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'last90days' | 'last180days' | 'last365days' | 'custom',
}

export interface ChartConfig {
    name: string;
    chartType: ChartType;
    indexTypes: IndexType[];
    dateConfig: DataTypesPickerProps;
}

export interface DashboardChartConfig {
    id: string;
    config: ChartConfig
}



import type {
    Layout
} from "react-grid-layout";

export interface DashboardConfig {
    name: string, //看板名称
    id?: string, // 看板id
    layoutType?: 1 | 2 | 3, // 布局类型
    layouts?: Layout[], // 布局信息
}

