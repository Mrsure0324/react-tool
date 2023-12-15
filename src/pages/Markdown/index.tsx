// 导入React、react-markdown-editor-lite，以及一个你喜欢的Markdown渲染器
import React from 'react';
import { Remarkable } from 'remarkable';

import MdEditor from 'react-markdown-editor-lite';
// 导入编辑器的样式
import 'react-markdown-editor-lite/lib/index.css';

// 注册插件（如果有的话）
// MdEditor.use(YOUR_PLUGINS_HERE);

// 初始化Markdown解析器
const mdParser = new Remarkable();

mdParser.set({
    html: true,
    breaks: true
});

//异步解析
const asyncFormatText = (text:string) => {

    return new Promise((resolve,rejected) => {
        try {
            setTimeout(() => {
                resolve(text.replaceAll('${a}','1000w'))
            },2000)
        } catch(err) {
            rejected(err)
        }
    })

}

const renderHtml = async (text:string) => {
    const str:string = await asyncFormatText (text) as string;
    return mdParser.render(str)
}

// 完成！
function handleEditorChange({ html, text }:any) {
    console.log('handleEditorChange', html, text);
}
export default (props:any) => {
    return (
        <MdEditor style={{ height: '500px' }} renderHTML={renderHtml} onChange={handleEditorChange} />
    );
};