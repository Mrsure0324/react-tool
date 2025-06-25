import React from 'react';

/**
 * HTML编辑器消息类型
 * @description 定义了所有可能的消息类型
 */
export enum POST_MESSAGE_EVENT_TYPE_ENUM {
  SlideElementClicked = 'SLIDE_ELEMENT_CLICKED',
  SlideSaveImageClicked = 'SLIDE_SAVE_IMAGE_CLICKED',
  SlideCancelImageClicked = 'SLIDE_CANCEL_IMAGE_CLICKED',
  SlideCancelEdit = 'SLIDE_CANCEL_EDIT',
  SlideUpdateHtml = 'SLIDE_UPDATE_HTML',
  SlideEditMode = 'SLIDE_EDIT_MODE',
  SlideSaveTextContent = 'SLIDE_SAVE_TEXT_CONTENT',
  SlideSaveTextStyle = 'SLIDE_SAVE_TEXT_STYLE',
  SlideRefreshIframe = 'SLIDE_REFRESH_IFRAME',
  SlideCancelHoverEdit = 'SLIDE_CANCEL_HOVER_EDIT',
  SlideNext = 'SLIDE_NEXT',
  SlidePrev = 'SLIDE_PREV',
  SlideAddPopover = 'SLIDE_ADD_POPOVER',
  SlideDeleteElement = 'SLIDE_DELETE_ELEMENT',
  SlideModifytImgStyle = 'SLIDE_MODIFY_IMG_STYLE',
  SlideModifyPosition = 'SLIDßE_MODIFY_POSITION',
  SlideDuplicateElement = 'SLIDE_DUPLICATE_ELEMENT',
  SlideUndo = 'SLIDE_UNDO',
  SlideRedo = 'SLIDE_REDO',
  SlideUpdateUndoAndRedoStackLength = 'SLIDE_UPDATE_UNDO_AND_REDO_STACK_LENGTH',
  SlideDeleteElementUpdateHeight = 'SLIDE_DELETE_ELEMENT_UPDATE_HEIGHT'
}

/**
 * HTML编辑器消息载荷
 * @description 不同消息类型对应的数据结构
 */
export type HtmlEditorMessagePayload =
  | { isCanEditSlide: boolean }     // 编辑模式切换的载荷
  | { attrs: { text: string } }     // 文本内容保存的载荷
  | { attrs: { src: string } }      // 图片源地址的载荷
  | { attrs: { style: Record<string, any> } } // 样式相关的载荷
  | { elementType: string }         // 元素类型相关的载荷
  | Record<string, any>;            // 其他通用载荷类型

/**
 * HTML编辑器消息接口
 * @description 定义了消息的统一结构
 * @property {HtmlEditorMessageType} type - 消息类型
 * @property {HtmlEditorMessagePayload} [payload] - 可选的消息载荷
 */
export interface HtmlEditorMessage {
  type: POST_MESSAGE_EVENT_TYPE_ENUM;
  payload?: HtmlEditorMessagePayload;
}

/**
 * 向iframe中的html-editor脚本发送消息
 * @param iframeRef React的ref对象，指向iframe元素
 * @param type 消息类型，详见HtmlEditorMessageType
 * @param payload 需要传递的数据对象，详见HtmlEditorMessagePayload
 */
export function postMessageToHtmlEditor(
  iframeRef: React.RefObject<HTMLIFrameElement>,
  type: POST_MESSAGE_EVENT_TYPE_ENUM,
  payload?: HtmlEditorMessagePayload
) {
  if (iframeRef.current && iframeRef.current.contentWindow) {
    iframeRef.current.contentWindow.postMessage(
      { type, payload },
      '*' // 可以根据实际情况指定origin
    );
  } else {
    console.warn('iframe未加载或未找到');
  }
}
