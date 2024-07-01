export interface PlayerProps {
    description?: string;
    name: string;
    avatar?: string;
    point: number;
    type: 'winner' | 'loser' | 'normal';
}
export const defaultTeamPlayers:PlayerProps[] = [{
    name: 'Ye哥',
    point: 0,
    type: 'normal',
},{
    name: 'Sure',
    point: 0,
    type: 'normal',
},{
    name: '三金',
    point: 0,
    type: 'normal',
},{
    name: '苗苗',
    point: 0,
    type: 'normal',
},{
    name: '玥玥',
    point: 0,
    type: 'normal',
}]