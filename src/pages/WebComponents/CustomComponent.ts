class UserCard extends HTMLParagraphElement {

    inputValue = ''

    static get observedAttributes() {
        return ['data-count','getInput'];
    }

    constructor() {
        super();
    }

    //  目前只是新建了一个自定义元素，并没有使用shadow dom,所以样式并不会做到隔绝
    connectedCallback() {
        console.log('首次被插入dom时触发');
        this.render();
    }
    disconnectedCallback() {
        console.log('从dom中删除的时候触发');
    }

    attributeChangedCallback() {
        console.log('当 custom element增加、删除、修改自身属性时，被调用');
        this.render();
    }

    getInputValue() {
        return this.inputValue
    }

    render() {

        this.innerHTML = ''

        const count = this.getAttribute('data-count');

        // title
        const title = document.createElement('div');
        title.setAttribute('class','title')
        title.innerHTML = `
            <div>User Card 自定义组件 ${count}</div>
        `;

        // Form
        const form = document.createElement('div');
        const input = document.createElement('input');
        const submit = document.createElement('button');
        submit.innerText = 'submit'
        input.addEventListener('change',(event:any) => {
            this.inputValue = event.target.value
        })
        form.append(input,submit);

        this.append(title,form);

    }


}

window.customElements.define('user-card', UserCard, {
    extends: 'p'
})