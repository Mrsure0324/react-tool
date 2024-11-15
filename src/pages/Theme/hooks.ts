import { useMemo } from "react";

interface Props {
    isVip:boolean,
    level:number
}
export const useThemeConfig = (props:Props) => {

    const {
        isVip,
        level,
    } = props;

    const themeClassName = useMemo(() => {
        return `theme-user-${isVip? 'vip' : 'common'}-lv${level}`;
    },[isVip,level])

    return {
        themeClassName,
    }
}