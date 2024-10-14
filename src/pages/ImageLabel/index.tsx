import React, { useEffect, useState } from 'react'
import SimpleImageLabel from 'simple-image-label'
import { Button, Input, Row, Col,Form } from 'antd';
import bg from '../../static/image/image2023-4-17_14-58-10.png'
import { debounce } from 'lodash';
export interface ImageLabelProps {
    
}

const ImageLabel:React.FC<ImageLabelProps> = (props) => {

    const {
        
    } = props;

    const [simpleImageLabel,setSimpleImageLabel] = useState();
    const [labels,setLabels] = useState([]);
    const [input, setInput] = useState('');
    const [showInfo,setShowInfo] = useState(false);
    const [activeLabel,setActiveLabel] = useState();
    const [form] = Form.useForm();

    const path = bg

    useEffect(() => {
        setSimpleImageLabel(new SimpleImageLabel({
            el: 'YourElementId',
            imageUrl: path,
            labels: labels,
            contextmenu: (e) => {
                console.log('contextmenu',e)
            },
            labelClick: (label) => {
                console.log('labelClick',label);
                setActiveLabel(label);
                setShowInfo(true);
            },
            error: (e) => {
                console.log('error',e)
            }
        }))
    },[]);

    const onValuesChange = () => {
        const values = form.getFieldsValue();
        // simpleImageLabel?.
    }
    
    return (
        <>
            <Row gutter={12}>
                <Col span={12}>
                    <div id="YourElementId"></div>
                </Col>
                <Col span={12}>
                    {
                        showInfo && (
                            <Form onValuesChange={debounce(onValuesChange,300)} form={form}>
                                <Form.Item name={'name'} label={'埋点名称'}>
                                    <Input></Input>
                                </Form.Item>
                                <Form.Item name={'id'} label={'图中序号'}>
                                    <Input></Input>
                                </Form.Item>
                                <Form.Item name={'desc'} label={'描述'}>
                                    <Input></Input>
                                </Form.Item>
                            </Form>
                        )
                    }
                </Col>
            </Row>
        </>
    )
}
export default ImageLabel