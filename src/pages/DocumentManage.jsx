import { crud } from "@/redux/crud/actions";
import { selectListsByDocument, } from "@/redux/crud/selectors";
import { DeleteOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Modal, Popconfirm, Row, Table, } from "antd";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const { role } = window.localStorage.auth ? JSON.parse(window.localStorage.auth) : {};

const DocumentManage = (props) => {
    const entity = 'documentManage';
    const dispatch = useDispatch();
    const currentEmployeeId = props.parentId
    const [isModal, setIsModal] = useState(false);
    const RecurrentRef = useRef(null);

    const [currentFile, setCurrentFile] = useState()


    const Columns = [
        {
            title: 'Name',
            dataIndex: 'filename',

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

                            <Popconfirm title="Sure to delete?" onConfirm={() => deleteItem(record)}>
                                <DeleteOutlined style={{ fontSize: "20px" }} />
                            </Popconfirm>
                        </> : ''
                )

            },
        },
    ];

    const [isUpdate, setIsUpdate] = useState(false);

    const editModal = () => {
        setIsModal(true);
        setIsUpdate(false);
        if (RecurrentRef.current) RecurrentRef.current.resetFields();
    }
    const formattedDateFunc = (date) => {
        return new Date(date).toLocaleDateString()
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
        console.log(values, 'valu45345es', currentFile);
        const formData = new FormData();
        formData.append('file', currentFile, `${values.filename}.${currentFile.name.split(".")[1]}`);

        formData.append('parent_id', currentEmployeeId);
        formData.append('filename', values.filename);
        formData.append('comments', values.comments);
        dispatch(crud.upload({ entity, jsonData: formData }));


        const parentId = currentEmployeeId;
        const jsonData = { parent_id: parentId }
        setTimeout(() => {
            dispatch(crud.listByDocument({ entity, jsonData }));
        }, 500)
        setIsModal(false)
    }
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    const [documents, setDocuments] = useState([]);
    const { result: Documents } = useSelector(selectListsByDocument);


    useEffect(() => {
        const id = currentEmployeeId;
        const jsonData = { parent_id: id }
        dispatch(crud.listByDocument({ entity, jsonData }));
    }, []);
    useEffect(() => {

        if (Documents.items) {

            setDocuments(Documents.items)

        }
    }, [Documents])


    const handleUpload = (e) => {
        e.preventDefault();

        const file = e.target.files[0];
        setCurrentFile(file);
    };
    return (
        <div className="whiteBox shadow">
            <Modal title="File" open={isModal} onCancel={handleModal} footer={null} width={800}>
                <Row gutter={24}>
                    <Col span={8}>

                        <Input
                            type='file'
                            name='file'
                            onChange={handleUpload}
                        />
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
export default DocumentManage;