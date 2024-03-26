import { request } from "@/request";

const { crud } = require("@/redux/crud/actions");
const { Modal, Form, Input, Button } = require("antd");
const { useForm } = require("antd/lib/form/Form");
const { default: TextArea } = require("antd/lib/input/TextArea");
const { useRef, useState, useEffect } = require("react");
const { useDispatch } = require("react-redux");
const { useHistory } = require("react-router-dom/cjs/react-router-dom.min");

const CustomerModal = ({ setCustomerInfo, isEditWithReserva = false, isOpen, handleCustomerModal, isUpdate = false, customerInfo, parentId }) => {
    const dispatch = useDispatch();
    const entity = 'client'
    const history = useHistory();
    const formRef = useRef(null);
    const [customerForm] = useForm();
    const [currentId, setCurrentId] = useState('');
    const onFinish = async (values) => {
        if (isUpdate && currentId) {
            const id = currentId;
            const { result: response } = await (request.update({ entity, id, jsonData: { ...values } }));
            if (isEditWithReserva) {
                setCustomerInfo(response)
            } else {
                history.push(`/customer/details/${parentId}`)
            }
        } else {
            const { result } = await request.create({ entity, jsonData: { ...values } });
            if (result) {
                history.push(`/customer/details/${result?._id}`)
            }
        }
        customerForm.resetFields();
        dispatch(crud.listByCustomer({ entity, jsonData: { _id: parentId } }));
        handleCustomerModal()
    };
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    useEffect(() => {
        customerForm.resetFields();
        customerForm.setFieldsValue(customerInfo)
        setCurrentId(customerInfo?._id)
        if (!isUpdate) customerForm.resetFields();
    }, [customerInfo, customerForm, isOpen, isUpdate])
    return (
        <Modal title={isUpdate ? "Update Form" : "Create Form"} visible={isOpen} onCancel={handleCustomerModal} footer={null}>
            <>
                <Form
                    ref={formRef}
                    form={customerForm}
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
                        name="name"
                        label="name"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your name!',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="E-mail"
                        rules={[
                            {
                                type: 'email',
                                message: 'The input is not valid E-mail!',
                            },
                            {
                                required: true,
                                message: 'Please input your E-mail!',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="iguser"
                        label="IG user"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your IG user!',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="phone"
                        label="Phone Number"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your phone!',
                            },
                        ]}
                    >
                        <Input type='number' />
                    </Form.Item>

                    {isUpdate && <Form.Item
                        name="notes"
                        label="Notes"
                    >
                        <TextArea />
                    </Form.Item>}
                    {isUpdate && <Form.Item
                        name="address"
                        label="Address"
                    >
                        <Input />
                    </Form.Item>}
                    <Form.Item
                        wrapperCol={{
                            offset: 8,
                            span: 16,
                        }}
                    >
                        <Button type="primary" htmlType="submit">
                            Save
                        </Button>
                        <Button type="ghost" onClick={handleCustomerModal}>
                            cancel
                        </Button>
                    </Form.Item>
                </Form>
            </>
        </Modal>
    );
}
export default CustomerModal;
