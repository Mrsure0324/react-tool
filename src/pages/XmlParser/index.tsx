import React, { useState } from 'react';
import { Card, Input, Button, Tabs, message } from 'antd';
import { parse, parseResultToJSON } from 'forgiving-xml-parser';
import { simplify, parse as txmlParse } from 'txml';
import { fromXML } from 'from-xml';
import styles from './index.less';

const { TextArea } = Input;

const XmlParserDemo: React.FC = () => {
  const [xmlInput, setXmlInput] = useState<string>(`

    # 测试开始

<writing-tool-use>
  <start>正在思考</start>
  
  <toolName>canvas.create</toolName>
  <title>2025年8月6日 新闻综述</title>
  <content>

# 2025年8月6日 新闻综述

## 技术新闻

- 人工智能发展：最新的AI模型在自然语言处理方面取得了重大突破。
- 量子计算：IBM发布了新一代量子处理器，计算能力提升50%。
- 区块链技术：以太坊2.0升级完成，交易速度大幅提升。

## 经济新闻

- 全球股市：美股三大指数创历史新高，科技股领涨。
- 加密货币：比特币突破7万美元关口，市场情绪乐观。
- 央行政策：美联储维持利率不变，市场预期年内降息。
\`\`\`
## 科技动态
\`\`\`

  </content>
  <end>已思考 3s</end>
</writing-tool-use>

<writing-tool-use>
  <toolName>canvas.update</toolName>
  <title>更新文档</title>
  <content>
  ### 测试update
  </content>
  <contents>
    <item>
      <old>

- 电动汽车：特斯拉发布新款Model S，续航里程达600公里。
- 太空探索：SpaceX成功发射第100颗Starlink卫星。
- 5G网络：中国5G用户数突破10亿，网络覆盖率达95%。

## 健康医疗

- 新冠疫苗：新型mRNA疫苗进入三期临床试验阶段。
- 基因治疗：CRISPR技术在遗传病治疗方面取得重大进展。
- 远程医疗：AI辅助诊断系统准确率达到95%以上。

  </old>
  <new>

##### new string

  </new>
    </item>
    <item>
      <old>

- 电动汽车：特斯拉发布新款Model S，续航里程达600公里。
- 太空探索：SpaceX成功发射第100颗Starlink卫星。
- 5G网络：中国5G用户数突破10亿，网络覆盖率达95%。

## 健康医疗

- 新冠疫苗：新型mRNA疫苗进入三期临床试验阶段。
- 基因治疗：CRISPR技术在遗传病治疗方面取得重大进展。
- 远程医疗：AI辅助诊断系统准确率达到95%以上。

  </old>
  <new>

##### new string

  </new>
    </item>
  </contents>
</writing-tool-use>

# 测试结束

`);
  const [parseResult, setParseResult] = useState<string>('');

  // 使用 Forgiving XML Parser 解析
  const parseWithForgiving = () => {
    try {
      const result = parseResultToJSON(
        parse(xmlInput),
        {
          allowNodeNotClose: true,
          allowTagNameHasSpace: true,
          ignoreTagNameCaseEqual: true,
        } as any
      );
      setParseResult(JSON.stringify(result, null, 2));
    } catch (error) {
      message.error('Forgiving XML Parser 解析失败: ' + (error as Error).message);
    }
  };

  // 使用 tXml 解析
  const parseWithTxml = () => {
    try {
      const result = simplify(txmlParse(xmlInput));
      setParseResult(JSON.stringify(result, null, 2));
    } catch (error) {
      message.error('tXml 解析失败: ' + (error as Error).message);
    }
  };

  // 使用 from-xml 解析
  const parseWithFromXml = () => {
    try {
      const result = fromXML(xmlInput);
      setParseResult(JSON.stringify(result, null, 2));
    } catch (error) {
      message.error('from-xml 解析失败: ' + (error as Error).message);
    }
  };

  return (
    <Card title="XML 解析器示例" className={styles.container}>
      <div className={styles.content}>
        <TextArea
          value={xmlInput}
          onChange={(e) => setXmlInput(e.target.value)}
          placeholder="请输入 XML"
          className={styles.input}
          rows={10}
        />
        <div className={styles.buttonGroup}>
          <Button type="primary" onClick={parseWithForgiving}>
            使用 Forgiving XML Parser 解析
          </Button>
          <Button onClick={parseWithTxml}>使用 tXml 解析</Button>
          <Button onClick={parseWithFromXml}>使用 from-xml 解析</Button>
        </div>
        <TextArea
          value={parseResult}
          placeholder="解析结果"
          className={styles.output}
          rows={10}
          readOnly
        />
      </div>
    </Card>
  );
};

export default XmlParserDemo; 