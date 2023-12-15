class ShadowDiv extends HTMLElement {
    constructor() {
        super();

        var shadow = this.attachShadow({mode:'open'})

        var wrapper = document.createElement('div');
        wrapper.setAttribute('class','title');
        wrapper.innerText = 'Shadow Div Dom';

        var styleLink = document.createElement('style');
        styleLink.textContent = `
            .title {
                color: red
            }
        `

        shadow.appendChild(styleLink)
        shadow.appendChild(wrapper)
    }

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
    }

    render() {

    }
}

window.customElements.define('shadow-div',ShadowDiv)