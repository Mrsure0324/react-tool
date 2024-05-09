import React, { useState } from 'react';
import marked from 'marked';
import 'highlight.js/styles/github.css';
import hljs from 'highlight.js';

// 设置marked的选项，用于代码高亮
marked.setOptions({
    highlight: function (code, language) {
        const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
        return hljs.highlight(validLanguage, code).value;
    },
    langPrefix: 'hljs language-', // 用于CSS类前缀
});

type MarkdownEditorProps = {
    initialMarkdown?: string;
};

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ initialMarkdown = '' }) => {
    const [markdown, setMarkdown] = useState(initialMarkdown);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMarkdown(event.target.value);
    };

    const createMarkup = () => {
        return { __html: marked(markdown) };
    };

    return (
        <div>
            <textarea
                value={markdown}
                onChange={handleChange}
                rows={10}
                style={{ width: '100%' }}
            />
            <div dangerouslySetInnerHTML={createMarkup()} />
        </div>
    );
};

export default MarkdownEditor;