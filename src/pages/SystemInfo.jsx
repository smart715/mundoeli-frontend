import { DashboardLayout } from "@/layout";
import { crud } from "@/redux/crud/actions";
import { request } from "@/request";
import { Button, Form, Input, Layout, PageHeader, Image, message, Upload } from "antd";
import { UploadOutlined } from '@ant-design/icons';
import { EditorState } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { convertFromHTML } from 'draft-convert';
import { UPLOAD_URL } from '@/config/serverApiConfig';

const SystemInfo = () => {
    const entity = "systemInfo";
    const [form] = Form.useForm();
    const [, forceUpdate] = useState({});
    const dispatch = useDispatch();
    const [isUpdate, setIsUpdate] = useState(false);
    const [currentId, setCurrentId] = useState(false);
    const { is_admin: is_admin } = JSON.parse(localStorage?.auth)
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const [contentState, setContentState] = useState(null);
    const [editorCheckoutState, setEditorCheckoutState] = useState(EditorState.createEmpty());
    const [contentCheckoutState, setContentCheckoutState] = useState(null);
    const [imageUrl, setImageUrl] = useState('checkout_image.jpg');

    // To disable submit button at the beginning.
    useEffect(() => {
        (async () => {
            const { result } = await request.list({ entity });
            if (result?.length) {
                setIsUpdate(true);
                setCurrentId(result[0]?._id)
                form.setFieldsValue({ ...result[0] });

                setImageUrl(result[0]?.checkout_image);
                const rawContentState = (result[0]?.email_footer);
                if (rawContentState) {
                    const contentState = convertFromHTML(rawContentState);
                    const newEditorState = EditorState.createWithContent(contentState);
                    setEditorState(newEditorState);
                }
                const checkout_string = (result[0]?.checkout_string);
                if (checkout_string) {
                    const contentState = convertFromHTML(checkout_string);
                    const newEditorState = EditorState.createWithContent(contentState);
                    setEditorCheckoutState(newEditorState);
                }
            }
            else setIsUpdate(false)
        })()
        forceUpdate({});
    }, []);

    const onFinish = async (values) => {
        values.email_footer = (contentState);
        values.checkout_image = (imageUrl);
        values.checkout_string = (contentCheckoutState);
        if (isUpdate && currentId) {
            await request.update({ entity, id: currentId, jsonData: { ...values } });
        } else {
            const { result } = await request.create({ entity, jsonData: values })
            if (result) setCurrentId(result?._id)
        }
    };
    const handleContentStateChange = (contentState) => {
        setContentState(draftToHtml(contentState));
    };

    const handleEditorStateChange = (editorState) => {
        setEditorState(editorState);
    };

    const handleContentStateCheckoutChange = (contentCheckoutState) => {
        setContentCheckoutState(draftToHtml(contentCheckoutState));
    };

    const handleEditorStateCheckoutChange = (editorCheckoutState) => {
        setEditorCheckoutState(editorCheckoutState);
    };
    const handleUpload = async (file) => {
        const formData = new FormData();
        formData.append('_file', file);
        try {
            let res = await request.upload({ entity, jsonData: formData });
            setImageUrl(res.result);
        } catch (error) {
            message.error('Upload failed');
        }
    };

    return (
        <DashboardLayout>
            <PageHeader title="System Info" onBack={() => { window['history'].back() }}
            ></PageHeader>
            <Layout>
                <Form
                    onFinish={onFinish}
                    form={form}
                >
                    <div className="row">
                        <div className="col-6">
                            <h3>Tax Setting</h3>
                            <Form.Item
                                name={'tax_percent'}
                                label="Tax Percent"
                            >
                                <Input prefix="%" />
                            </Form.Item>
                            <h3>Checkout Setting</h3>

                            <Form.Item
                                name={'left_image'}
                                label="Left Image"
                            >
                                <Image src={`${UPLOAD_URL}admin/${imageUrl}`} height="200px" alt="Checkout Banner" />
                                &nbsp;&nbsp;&nbsp;
                                <Upload customRequest={({ file }) => handleUpload(file)}
                                    showUploadList={false}>
                                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                                </Upload>
                            </Form.Item>
                            <Form.Item
                                name={'checkout_string'}
                                label="Completed String"
                            >
                                <Editor
                                    editorState={editorCheckoutState}
                                    toolbarClassName="editor-toolbar"
                                    wrapperClassName="editor-wrapper"
                                    editorClassName="editor"
                                    onEditorStateChange={handleEditorStateCheckoutChange}
                                    onContentStateChange={handleContentStateCheckoutChange}
                                    spellCheck
                                    wrapperStyle={{ border: '1px solid #d9d9d9' }}
                                    editorStyle={{ minHeight: 120, maxHeight: 120, border: '1px solid #d9d9d9', margin: 12, borderWidth: 0.5, padding: 10, borderRadius: "2px", backgroundColor: 'white' }}
                                />
                            </Form.Item>

                        </div>
                        <div className="col-6">

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
                                <Editor
                                    editorState={editorState}
                                    toolbarClassName="editor-toolbar"
                                    wrapperClassName="editor-wrapper"
                                    editorClassName="editor"
                                    onEditorStateChange={handleEditorStateChange}
                                    onContentStateChange={handleContentStateChange}
                                    spellCheck
                                    wrapperStyle={{ border: '1px solid #d9d9d9' }}
                                    editorStyle={{ minHeight: 120, maxHeight: 120, border: '1px solid #d9d9d9', margin: 12, borderWidth: 0.5, padding: 10, borderRadius: "2px", backgroundColor: 'white' }}
                                />
                            </Form.Item> : null}

                            <Form.Item>
                                <Button type="primary" htmlType="submit" className="w-25 login-form-button">
                                    {isUpdate ? "Update" : "Save"}
                                </Button>
                            </Form.Item>
                        </div>
                    </div>
                </Form>
            </Layout>
        </DashboardLayout>
    );
}
export default SystemInfo;