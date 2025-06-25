import React, { useState, useEffect } from 'react';
import Split from 'react-split';
import { Button, Form, Input, InputNumber, Select, Space, Switch, message, ColorPicker } from 'antd';
import { POST_MESSAGE_EVENT_TYPE_ENUM, postMessageToHtmlEditor } from '../../utils/htmlEditor';
import styles from './HtmlEditorDebugger.module.less';

const ALL_TYPES: POST_MESSAGE_EVENT_TYPE_ENUM[] = [
  POST_MESSAGE_EVENT_TYPE_ENUM.SlideElementClicked,
  POST_MESSAGE_EVENT_TYPE_ENUM.SlideSaveImageClicked, 
  POST_MESSAGE_EVENT_TYPE_ENUM.SlideCancelImageClicked,
  POST_MESSAGE_EVENT_TYPE_ENUM.SlideCancelEdit,
  POST_MESSAGE_EVENT_TYPE_ENUM.SlideUpdateHtml,
  POST_MESSAGE_EVENT_TYPE_ENUM.SlideEditMode,
  POST_MESSAGE_EVENT_TYPE_ENUM.SlideSaveTextContent,
  POST_MESSAGE_EVENT_TYPE_ENUM.SlideSaveTextStyle,
  POST_MESSAGE_EVENT_TYPE_ENUM.SlideRefreshIframe,
  POST_MESSAGE_EVENT_TYPE_ENUM.SlideCancelHoverEdit,
  POST_MESSAGE_EVENT_TYPE_ENUM.SlideNext,
  POST_MESSAGE_EVENT_TYPE_ENUM.SlidePrev,
  POST_MESSAGE_EVENT_TYPE_ENUM.SlideAddPopover,
  POST_MESSAGE_EVENT_TYPE_ENUM.SlideDeleteElement,
  POST_MESSAGE_EVENT_TYPE_ENUM.SlideModifytImgStyle,
  POST_MESSAGE_EVENT_TYPE_ENUM.SlideModifyPosition,
  POST_MESSAGE_EVENT_TYPE_ENUM.SlideDuplicateElement,
  POST_MESSAGE_EVENT_TYPE_ENUM.SlideUndo,
  POST_MESSAGE_EVENT_TYPE_ENUM.SlideRedo,
  POST_MESSAGE_EVENT_TYPE_ENUM.SlideUpdateUndoAndRedoStackLength,
  POST_MESSAGE_EVENT_TYPE_ENUM.SlideDeleteElementUpdateHeight
];

const PAYLOAD_MAP: Record<string, any> = {
  [POST_MESSAGE_EVENT_TYPE_ENUM.SlideEditMode]: { isCanEditSlide: true },
  [POST_MESSAGE_EVENT_TYPE_ENUM.SlideSaveTextContent]: { attrs: { text: '测试文本' } },
  [POST_MESSAGE_EVENT_TYPE_ENUM.SlideSaveImageClicked]: { attrs: { src: 'https://placekitten.com/200/300' } },
  [POST_MESSAGE_EVENT_TYPE_ENUM.SlideCancelImageClicked]: {},
  [POST_MESSAGE_EVENT_TYPE_ENUM.SlideCancelEdit]: {},
  [POST_MESSAGE_EVENT_TYPE_ENUM.SlideSaveTextStyle]: { attrs: { style: { color: '#f40', fontWeight: 'bold' } } },
  [POST_MESSAGE_EVENT_TYPE_ENUM.SlideDeleteElement]: { elementType: 'text' },
  [POST_MESSAGE_EVENT_TYPE_ENUM.SlideModifytImgStyle]: { attrs: { style: { width: '100px', height: '100px' } } },
  [POST_MESSAGE_EVENT_TYPE_ENUM.SlideModifyPosition]: { attrs: { style: { transformX: 10, transformY: 20 } } },
  [POST_MESSAGE_EVENT_TYPE_ENUM.SlideDuplicateElement]: {},
  [POST_MESSAGE_EVENT_TYPE_ENUM.SlideUndo]: {},
  [POST_MESSAGE_EVENT_TYPE_ENUM.SlideRedo]: {},
  [POST_MESSAGE_EVENT_TYPE_ENUM.SlideRefreshIframe]: {},
};

interface HtmlEditorDebuggerProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
}

const styleOptions = [
  { label: '字体颜色', value: 'color' },
  { label: '字体加粗', value: 'fontWeight' },
  { label: '字体大小', value: 'fontSize' },
  // 可扩展更多样式
];

const HtmlEditorDebugger: React.FC<HtmlEditorDebuggerProps> = ({ iframeRef }) => {
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [formDisabled, setFormDisabled] = useState(false);

  // 监听iframe消息，回显文案和样式
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // 这里可以加安全校验，比如 event.origin
      if (
        event.data?.type === POST_MESSAGE_EVENT_TYPE_ENUM.SlideElementClicked &&
        event.data?.payload
      ) {
        const { text, style, elementType } = event.data.payload.attrs || {};
        console.log('event.data.payload.attrs', event.data.payload.attrs);
        // 判断是否可操作
        if (!event.data.payload.attrs) {
          form.resetFields();
          setFormDisabled(true);
          return;
        }
        setFormDisabled(false);
        // 回显文案
        if (text !== undefined) {
          form.setFieldsValue({ text });
        }
        // 回显样式
        if (style) {
          form.setFieldsValue({
            color: style.color,
            fontFamily: style.fontFamily,
            fontWeight: style.fontWeight === "400" ? "normal" : style.fontWeight === "700" ? "bold" : style.fontWeight,
            fontSize: style.fontSize ? parseInt(style.fontSize, 10) : undefined,
            textDecoration: style.textDecoration,
            fontStyle: style.fontStyle,
            textAlign: style.textAlign,
            objectFit: style.objectFit,
          });
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [form]);

  // 进入编辑模式
  const handleEditMode = (checked: boolean) => {
    postMessageToHtmlEditor(iframeRef, POST_MESSAGE_EVENT_TYPE_ENUM.SlideEditMode, { isCanEditSlide: checked });
    setEditMode(checked);
  };

  // 提交文案
  const onTextFinish = (values: any) => {
    postMessageToHtmlEditor(iframeRef, POST_MESSAGE_EVENT_TYPE_ENUM.SlideSaveTextContent, { attrs: { text: values.text } });
    message.success('文案已发送');
  };

  // 提交样式
  const onStyleFinish = (values: any) => {
    postMessageToHtmlEditor(iframeRef, POST_MESSAGE_EVENT_TYPE_ENUM.SlideSaveTextStyle, { attrs: { style: values } });
    message.success('样式已发送');
  };

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <Switch
        checked={editMode}
        checkedChildren="退出编辑"
        unCheckedChildren="进入编辑"
        onChange={handleEditMode}
        style={{ position: 'absolute', left: 24, top: 24, zIndex: 10 }}
      />
      <Split
        sizes={editMode ? [25, 75] : [0, 100]}
        minSize={[editMode ? 240 : 0, 320]}
        maxSize={[400, Infinity]}
        expandToMin={true}
        gutterSize={6}
        direction="horizontal"
        style={{ display: 'flex', height: '100vh' }}
      >
        {/* 左侧调试面板 */}
        <div style={{ background: '#fafbfc', padding: 16, overflow: 'auto', display: editMode ? 'block' : 'none' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form layout="vertical" form={form} disabled={formDisabled}>
              <Form.Item label="文案内容" name="text">
                <Input
                  placeholder="请输入要修改的文案"
                  disabled={formDisabled}
                  onChange={e => {
                    postMessageToHtmlEditor(
                      iframeRef,
                      POST_MESSAGE_EVENT_TYPE_ENUM.SlideSaveTextContent,
                      { attrs: { text: e.target.value } }
                    );
                  }}
                />
              </Form.Item>
              <Form.Item label="字体颜色" name="color">
                <ColorPicker
                  disabled={formDisabled}
                  value={form.getFieldValue('color')}
                  onChange={(_, hex) => {
                    form.setFieldsValue({ color: hex });
                    postMessageToHtmlEditor(
                      iframeRef,
                      POST_MESSAGE_EVENT_TYPE_ENUM.SlideSaveTextStyle,
                      { attrs: { style: { ...form.getFieldsValue(), color: hex } } }
                    );
                  }}
                  showText
                />
              </Form.Item>
              <Form.Item label="字体" name="fontFamily">
                <Select
                  disabled={formDisabled}
                  onChange={value => {
                    postMessageToHtmlEditor(
                      iframeRef,
                      POST_MESSAGE_EVENT_TYPE_ENUM.SlideSaveTextStyle,
                      { attrs: { style: { ...form.getFieldsValue(), fontFamily: value } } }
                    );
                  }}
                >
                  <Select.Option value='"Noto Sans SC", sans-serif'>思源黑体</Select.Option>
                  <Select.Option value='"Arial", sans-serif'>Arial</Select.Option>
                  <Select.Option value='"Microsoft YaHei", sans-serif'>微软雅黑</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="字体加粗" name="fontWeight">
                <Select
                  disabled={formDisabled}
                  onChange={value => {
                    postMessageToHtmlEditor(
                      iframeRef,
                      POST_MESSAGE_EVENT_TYPE_ENUM.SlideSaveTextStyle,
                      { attrs: { style: { ...form.getFieldsValue(), fontWeight: value } } }
                    );
                  }}
                >
                  <Select.Option value="normal">正常</Select.Option>
                  <Select.Option value="bold">加粗</Select.Option>
                  <Select.Option value="400">400</Select.Option>
                  <Select.Option value="700">700</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="字体大小" name="fontSize">
                <InputNumber
                  min={12}
                  max={100}
                  style={{ width: '100%' }}
                  disabled={formDisabled}
                  onChange={value => {
                    postMessageToHtmlEditor(
                      iframeRef,
                      POST_MESSAGE_EVENT_TYPE_ENUM.SlideSaveTextStyle,
                      { attrs: { style: { ...form.getFieldsValue(), fontSize: value + 'px' } } }
                    );
                  }}
                />
              </Form.Item>
              <Form.Item label="装饰线" name="textDecoration">
                <Select
                  disabled={formDisabled}
                  onChange={value => {
                    postMessageToHtmlEditor(
                      iframeRef,
                      POST_MESSAGE_EVENT_TYPE_ENUM.SlideSaveTextStyle,
                      { attrs: { style: { ...form.getFieldsValue(), textDecoration: value } } }
                    );
                  }}
                >
                  <Select.Option value="none">无</Select.Option>
                  <Select.Option value="underline">下划线</Select.Option>
                  <Select.Option value="line-through">删除线</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="字体样式" name="fontStyle">
                <Select
                  disabled={formDisabled}
                  onChange={value => {
                    postMessageToHtmlEditor(
                      iframeRef,
                      POST_MESSAGE_EVENT_TYPE_ENUM.SlideSaveTextStyle,
                      { attrs: { style: { ...form.getFieldsValue(), fontStyle: value } } }
                    );
                  }}
                >
                  <Select.Option value="normal">正常</Select.Option>
                  <Select.Option value="italic">斜体</Select.Option>
                  <Select.Option value="oblique">倾斜</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="对齐方式" name="textAlign">
                <Select
                  disabled={formDisabled}
                  onChange={value => {
                    postMessageToHtmlEditor(
                      iframeRef,
                      POST_MESSAGE_EVENT_TYPE_ENUM.SlideSaveTextStyle,
                      { attrs: { style: { ...form.getFieldsValue(), textAlign: value } } }
                    );
                  }}
                >
                  <Select.Option value="left">左对齐</Select.Option>
                  <Select.Option value="center">居中</Select.Option>
                  <Select.Option value="right">右对齐</Select.Option>
                  <Select.Option value="start">start</Select.Option>
                  <Select.Option value="end">end</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="图片填充" name="objectFit">
                <Select
                  disabled={formDisabled}
                  onChange={value => {
                    postMessageToHtmlEditor(
                      iframeRef,
                      POST_MESSAGE_EVENT_TYPE_ENUM.SlideSaveTextStyle,
                      { attrs: { style: { ...form.getFieldsValue(), objectFit: value } } }
                    );
                  }}
                >
                  <Select.Option value="fill">填充</Select.Option>
                  <Select.Option value="contain">contain</Select.Option>
                  <Select.Option value="cover">cover</Select.Option>
                  <Select.Option value="none">none</Select.Option>
                  <Select.Option value="scale-down">scale-down</Select.Option>
                </Select>
              </Form.Item>
            </Form>

            <Button onClick={() => postMessageToHtmlEditor(iframeRef, POST_MESSAGE_EVENT_TYPE_ENUM.SlideUndo, {})}>撤销</Button>
            <Button onClick={() => postMessageToHtmlEditor(iframeRef, POST_MESSAGE_EVENT_TYPE_ENUM.SlideRedo, {})}>重做</Button>
            <Button onClick={() => postMessageToHtmlEditor(iframeRef, POST_MESSAGE_EVENT_TYPE_ENUM.SlideRefreshIframe, {})}>刷新</Button>
          </Space>
        </div>
        {/* 右侧iframe区域 */}
        <div style={{ width: '100%', height: '100%', background: '#fff' }}>
          {/* 这里放你的iframe或主内容 */}
          {/* <iframe ref={iframeRef} ... /> */}
        </div>
      </Split>
    </div>
  );
};

export default HtmlEditorDebugger; 