import { useEffect, useState } from "react";
import './CustomComponent'
import './ShadowDom'
import { Button, Divider } from "antd";
import './index.less'

const WebComponents: React.FC = () => {

    const [count,setCount] = useState<number>(0)

    const addCount = () => {
        setCount(count + 1);
    }

    const getInput = () => {
        const userCard:any = document.getElementById('user-card')
        console.log(userCard?.inputValue)
    }
    
    return (
        <>
            <div id="web-components-wrapper">
                <p id="user-card" is="user-card" data-count={count} ></p>
                <Button onClick={addCount}>count + 1</Button>
                <Button onClick={getInput}>Get Input</Button>
                <Divider></Divider>
                <shadow-div></shadow-div>
            </div>
        </>
    );
};

export default WebComponents;
