import { crud } from "@/redux/crud/actions";
import { selectListsByEDocument, } from "@/redux/crud/selectors";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Avatar, Button, Col, Form, Image, Input, Modal, Popconfirm, Row, Table, Typography, } from "antd";


import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar_url } from '@/config/serverApiConfig';

const { role } = window.localStorage.auth ? JSON.parse(window.localStorage.auth) : {};

const EmployeeDocumentManage = (props) => {
    const entity = 'employeeDocument';
    const dispatch = useDispatch();
    const currentEmployeeId = props.parentId

    console.log(props.parentId, 'props', props)
    const [isModal, setIsModal] = useState(false);
    const RecurrentRef = useRef(null);

    const [currentFile, setCurrentFile] = useState()


    const Columns = [
        {
            title: 'Name',
            dataIndex: 'filename',
            render: (text) => {
                return text.split(".")[1] === 'pdf' ? <a target='_blank' href={Avatar_url + text}>{text}</a> : <Avatar size={64} src={<Image src={Avatar_url + text} />} />;
            }

        },
        {
            title: 'Date',
            dataIndex: 'created',
            render: (text) => {
                return formattedDateFunc(text)
            }
        },

        {
            title: 'Comments',
            dataIndex: 'comments',
        },
        {
            title: 'By',
            dataIndex: ['parent_id', 'name'],
        },

        {
            title: 'Actions',
            dataIndex: 'operation',
            width: "10%",
            align: 'center',
            render: (_, record) => {
                return (
                    role === 0 ?
                        <>
                            <Typography.Link onClick={() => editItem(record)}>
                                <EditOutlined style={{ fontSize: "20px" }} />
                            </Typography.Link>
                            <Popconfirm title="Sure to delete?" onConfirm={() => deleteItem(record)}>
                                <DeleteOutlined style={{ fontSize: "20px" }} />
                            </Popconfirm>
                        </> : ''
                )

            },
        },
    ];

    const [currentId, setCurrentId] = useState('');
    const [isUpdate, setIsUpdate] = useState(false);
    const [currentImage, setCurrentImage] = useState();
    const editModal = () => {
        setIsModal(true);
        setIsUpdate(false);
        if (RecurrentRef.current) RecurrentRef.current.resetFields();
    }
    const formattedDateFunc = (date) => {
        return new Date(date).toLocaleDateString()
    }

    const editItem = (item) => {
        if (item) {

            setIsModal(true);
            setIsUpdate(true);
            setCurrentImage(item.filename)
            setTaxesStatus(true)
            setTimeout(() => {
                setUnlimited(item.unlimited)
                if (RecurrentRef.current) {
                    RecurrentRef.current.resetFields();
                    RecurrentRef.current.setFieldsValue(item);
                    setTaxesStatus(item.taxes_flag)
                    setCurrentId(item._id);
                }
            }, 200);

        }
    }
    const deleteItem = (item) => {
        const id = item._id;
        if (id) {
            const jsonData = { parent_id: currentEmployeeId }
            dispatch(crud.delete({ entity, id }))
            setTimeout(() => {
                const updateData = documents.filter(row => row._id !== id);
                setDocuments(updateData);
                dispatch(crud.listByRecurrent({ entity, jsonData }));
            }, 500)
        }

    }
    const handleModal = () => {
        setIsModal(false)
    }
    const saveDetails = (values) => {

        if (!isUpdate) {

            const formData = new FormData();
            formData.append('file', currentFile, `${values.filename}.${currentFile.name.split(".")[1]}`);
            formData.append('parent_id', currentEmployeeId);
            formData.append('filename', values.filename);
            formData.append('comments', values.comments);
            dispatch(crud.upload({ entity, jsonData: formData }));
            const parentId = currentEmployeeId;
            const jsonData = { parent_id: parentId }
            setTimeout(() => {
                dispatch(crud.listByEDocument({ entity, jsonData }));
            }, 500)
        } else {
            const id = currentId;
            dispatch(crud.update({ entity, id, jsonData: { ...values, origin: currentImage } }));
            setTimeout(() => {
                dispatch(crud.listByEDocument({ entity, jsonData: { parent_id: currentEmployeeId } }));
            }, 500)
        }
        setIsModal(false)
    }
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    const [stores, setStores] = useState([]);
    const [documents, setDocuments] = useState([]);
    const { result: Documents } = useSelector(selectListsByEDocument);

    useEffect(() => {
        const id = currentEmployeeId;
        const jsonData = { parent_id: id }
        dispatch(crud.listByEDocument({ entity, jsonData }));
    }, []);
    const [unlimited, setUnlimited] = useState(false);
    const [taxesStatus, setTaxesStatus] = useState(false);
    useEffect(() => {

        if (Documents.items) {

            setDocuments(Documents.items)

        }
    }, [Documents])
    const UnlimitedStatus = (e) => {
        setUnlimited(e.target.checked)
    }
    const isTaxes = (e) => {
        setTaxesStatus(e.target.value)
    }


    const handleUpload = (e) => {
        e.preventDefault();

        const file = e.target.files[0];
        setCurrentFile(file);

        // const id = currentEmployeeId;

        // const formData = new FormData();
        // formData.append('avatar', file);
        // // formData.append('id', parent_id);
        // dispatch(crud.upload({ entity, jsonData: formData }));
        // message.info(`Uploading ${file.name}...`);
        // setTimeout(() => {
        //     dispatch(crud.read({ entity, id }));
        // }, 500)
    };
    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    return (
        <div className="whiteBox shadow">
            <Modal title="File" open={isModal} onCancel={handleModal} footer={null} width={700}>
                <Row gutter={24}>


                    <Col span={8}>
                        {!isUpdate &&

                            <Input
                                type='file'
                                name='file'
                                accept="image/*, application/pdf"
                                onChange={handleUpload}
                            />
                        }
                    </Col>
                    <Col>

                        <Form
                            ref={RecurrentRef}
                            name="basic"
                            labelCol={{
                                span: 8,
                            }}
                            wrapperCol={{
                                span: 16,
                            }}
                            onFinish={saveDetails}
                            onFinishFailed={onFinishFailed}
                            autoComplete="off"
                            initialValues={{
                                gender: 1,
                                civil_status: 3,
                                birthplace: "AU",

                            }}
                        >
                            <Form.Item
                                name="filename"
                                label="File Name"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Input width={1000} />
                            </Form.Item>
                            <Form.Item
                                name="comments"
                                label="Comments"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Input.TextArea />
                            </Form.Item>
                            <Form.Item
                                wrapperCol={{
                                    offset: 8,
                                    span: 16,
                                }}
                            >
                                {
                                    isUpdate ?
                                        <Button type="primary" htmlType="submit">
                                            Update
                                        </Button>
                                        : <Button type="primary" htmlType="submit">
                                            Save
                                        </Button>

                                }

                                <Button type="ghost" onClick={handleModal}>
                                    cancel
                                </Button>
                            </Form.Item>
                        </Form>

                    </Col>
                </Row>
                <>
                </>
            </Modal>
            <Row>
                <Col span={12}>
                    <button onClick={editModal}>Add File</button>
                </Col>
            </Row>
            <Table
                bordered
                rowKey={(item) => item._id}
                key={(item) => item._id}
                dataSource={documents || []}
                columns={Columns}
                rowClassName="editable-row"
            />
        </div>
    );
}
export default EmployeeDocumentManage;