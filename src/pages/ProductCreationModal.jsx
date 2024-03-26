import SelectAsync from "@/components/SelectAsync";
import { crud } from "@/redux/crud/actions";
import { request } from "@/request";
import history from "@/utils/history";
import { Button, Form, Input, Modal } from "antd";
import { useForm } from "antd/lib/form/Form";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";

const ProductCreationModal = ({ checkout = false, handleUpdatedInfo, productInfo = false, thirdParty = false, isModalVisible, setIsModalVisible, isUpdate, currentId, currentItem }) => {
    const formRef = useRef(null);
    const [_form] = useForm();
    const dispatch = useDispatch();
    const entity = checkout ? `checkoutProductLists` : "productCategories"
    const handleOk = () => {
        setIsModalVisible(false)
    };
    const onFinish = async (values) => {
        setIsModalVisible(false)
        if (isUpdate && currentId) {
            const id = currentId;
            dispatch(crud.update({ entity, id, jsonData: values }));
        } else {
            const { result } = await request.create({ entity, jsonData: values });
            if (thirdParty) handleUpdatedInfo(result)
            // dispatch(crud.create({ entity, jsonData: values }));
        }
        if (thirdParty) {
            setIsModalVisible(false);
        } else {
            dispatch(crud.list({ entity }));
            setIsModalVisible(false);
            checkout ?
                history.push('/product_list_checkout') :
                history.push('/product_list')
        }
    };
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    const handleCancel = () => {
        setIsModalVisible(false)

    }

    useEffect(() => {
        _form.setFieldsValue(currentItem)
    }, [currentItem, _form]);
    useEffect(() => {
        if (thirdParty && productInfo) {
            _form.setFieldsValue(productInfo)
        }
    }, [productInfo, thirdParty, _form])
    return (
        <Modal title="Create Form" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} footer={null}>
            <>
                <Form
                    ref={formRef}
                    form={_form}
                    name="basic"
                    labelCol={{
                        span: 8,
                    }}
                    wrapperCol={{
                        span: 16,
                    }}
                    initialValues={{
                        remember: true,
                    }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        name={checkout ? "product_name" : "category_name"}
                        label="Product name"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="product_price"
                        label="Price"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input prefix="$" />
                    </Form.Item>
                    <Form.Item
                        name="product_type"
                        label="Product Type"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <SelectAsync entity={`productTypes`} displayLabels={[`product_name`]} />
                    </Form.Item>
                    <Form.Item
                        wrapperCol={{
                            offset: 8,
                            span: 16,
                        }}
                    >
                        {
                            isUpdate ? <Button type="primary" htmlType="submit">
                                Update
                            </Button> :
                                <Button type="primary" htmlType="submit">
                                    Save
                                </Button>

                        }
                        <Button type="ghost" onClick={handleCancel}>
                            cancel
                        </Button>
                    </Form.Item>
                </Form>
            </>
        </Modal>
    );
}
export default ProductCreationModal;