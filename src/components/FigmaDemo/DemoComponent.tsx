import React from 'react';

export interface DemoComponentProps {
  className?: string;
  style?: React.CSSProperties;
}

export const DemoComponent: React.FC<DemoComponentProps> = ({ className, style }) => {
  return (
    <div className="demo-component" style={{"width":375,"height":200,"display":"flex","flexDirection":"column","backgroundColor":"rgba(255, 255, 255, 1)","borderRadius":12,"padding":20}}>
      <div className="header" style={{"width":"100%","height":40,"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":16}}>
        <span className="title" style={{"fontSize":18,"fontWeight":600,"color":"rgba(51, 51, 51, 1)"}}>示例组件</span>
        <div className="avatar" style={{"width":32,"height":32,"borderRadius":"50%","backgroundColor":"rgba(64, 169, 255, 1)"}} />
      </div>
      <div className="content" style={{"flex":1,"display":"flex","flexDirection":"column","gap":12}}>
        <span className="description" style={{"fontSize":14,"color":"rgba(102, 102, 102, 1)","lineHeight":"20px"}}>这是一个由 Figma 设计稿自动生成的 React 组件示例</span>
        <div className="button-group" style={{"display":"flex","gap":8}}>
          <div className="primary-button" style={{"padding":"8px 16px","backgroundColor":"rgba(64, 169, 255, 1)","borderRadius":6,"color":"white","fontSize":14,"fontWeight":500}}>主要按钮</div>
          <div className="secondary-button" style={{"padding":"8px 16px","border":"1px solid rgba(217, 217, 217, 1)","borderRadius":6,"color":"rgba(51, 51, 51, 1)","fontSize":14,"fontWeight":500}}>次要按钮</div>
        </div>
      </div>
    </div>
  );
};

export default DemoComponent;
