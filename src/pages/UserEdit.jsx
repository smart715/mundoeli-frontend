import { request } from "@/request";
import { CompanyPicker } from "./common";

const { crud } = require("@/redux/crud/actions");
const { Modal, Form, Input, Button } = require("antd");
const { useForm } = require("antd/lib/form/Form");
const { default: TextArea } = require("antd/lib/input/TextArea");
const { useRef, useState, useEffect } = require("react");
const { useDispatch } = require("react-redux");
const { useHistory } = require("react-router-dom/cjs/react-router-dom.min");
const UserEdit = ({ }) => {
    const dispatch = useDispatch();
    const entity = 'admin'
    const history = useHistory();
    const formRef = useRef(null);
    const [customerForm] = useForm();
    const [currentId, setCurrentId] = useState('');
    const [userData, setUserData] = useState([]);
    const { id: id } = JSON.parse(localStorage?.auth)
    const onFinish = async (values) => {
        values['company_id'] = values['company']?._id;
        const id = currentId;
        const { result: response } = await (request.update({ entity, id, jsonData: { ...values } }));
        customerForm.resetFields();

        history.push(`/admin`)
    };
    const handleCustomerModal = () => {
        customerForm.resetFields();

    }
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    useEffect(async () => {
        const { id: id } = JSON.parse(localStorage?.auth)
        setCurrentId(id)
        const userData = await (request.list({ entity }));
        const filteredUser = userData.result.filter(user => {
            return user._id == id
        })
        setUserData(filteredUser)
        customerForm.resetFields();
    }, [])
    return (
        <div className="mt-6">
            <Form
                ref={formRef}
                form={customerForm}
                name="basic"
                labelCol={{
                    span: 4,
                }}
                wrapperCol={{
                    span: 8,
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
                    label="Name"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your name!',
                        },
                    ]}
                >
                    <Input defaultValue={userData[0]?.name} />
                </Form.Item>

                <Form.Item
                    name="password"
                    label="Password"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input.Password autoComplete="new-password" />

                </Form.Item>
                <Form.Item
                    name="company"
                    label="Company"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <CompanyPicker />
                </Form.Item>
                <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', }}>
                    <Form.Item
                        wrapperCol={{
                            offset: 6,
                            span: 8,
                        }}
                    >
                        <Button type="primary" htmlType="submit">
                            Save
                        </Button>
                        <Button type="ghost" onClick={handleCustomerModal}>
                            cancel
                        </Button>
                    </Form.Item>
                </div>
            </Form>
        </div>
    );
}
export default UserEdit;
