import { DashboardLayout } from "@/layout";
import { crud } from "@/redux/crud/actions";
import { request } from "@/request";
import { Button, Form, Input, Layout, PageHeader } from "antd";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const SystemInfo = () => {
    const entity = "systemInfo";
    const [form] = Form.useForm();
    const [, forceUpdate] = useState({});
    const dispatch = useDispatch();
    const [isUpdate, setIsUpdate] = useState(false);
    const [currentId, setCurrentId] = useState(false);
    const { is_admin: is_admin } = JSON.parse(localStorage?.auth)

    // To disable submit button at the beginning.
    useEffect(() => {
        (async () => {
            const { result } = await request.list({ entity });
            if (result?.length) {
                setIsUpdate(true);
                setCurrentId(result[0]?._id)
                form.setFieldsValue({ ...result[0] });
            }
            else setIsUpdate(false)
        })()
        forceUpdate({});
    }, []);

    const onFinish = async (values) => {
        if (isUpdate && currentId) {
            await request.update({ entity, id: currentId, jsonData: { ...values } });
        } else {
            const { result } = await request.create({ entity, jsonData: values })
            if (result) setCurrentId(result?._id)
        }
    };
    return (
        <DashboardLayout>
            <PageHeader title="System Info" onBack={() => { window['history'].back() }}
            ></PageHeader>
            <Layout>
                <div className="row">
                    <div className="col-6">
                        <Form
                            onFinish={onFinish}
                            form={form}
                        >
                            <h3>Tax Setting</h3>
                            <Form.Item
                                name={'tax_percent'}
                                label="Tax Percent"
                            >
                                <Input prefix="%" />
                            </Form.Item>
                            <h3>SMTP Setting</h3>
                            <Form.Item
                                name={'smtp_host'}
                                label="SMTP Host"
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name={'smtp_port'}
                                label="SMTP Port"
                            >
                                <Input prefix="port" />
                            </Form.Item>
                            <Form.Item
                                name={'smtp_user'}
                                label="SMTP User"
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name={'smtp_pass'}
                                label="SMTP Pass"
                            >
                                <Input />
                            </Form.Item>
                            {is_admin ? <Form.Item
                                name={'email_footer'}
                                label="Email Footer"
                            >
                                <Input />
                            </Form.Item> : null}

                            <Form.Item>
                                <Button type="primary" htmlType="submit" className="w-25 login-form-button">
                                    {isUpdate ? "Update" : "Save"}
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </div>
            </Layout>
        </DashboardLayout>
    );
}
export default SystemInfo;