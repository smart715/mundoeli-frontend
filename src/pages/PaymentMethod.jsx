import { DashboardLayout, } from '@/layout';
import { DeleteOutlined, EditOutlined, SearchOutlined, } from '@ant-design/icons';
import { Button, Col, Form, Input, Layout, Modal, PageHeader, Popconfirm, Row, Table, Typography } from 'antd';
import { convertFromRaw, EditorState } from "draft-js";
import draftToHtml from "draftjs-to-html";
import { convertFromHTML } from 'draft-convert';

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { selectListItems } from '@/redux/crud/selectors';
import { useForm } from 'antd/lib/form/Form';
import { dateFormat } from './common';
import TextArea from 'antd/lib/input/TextArea';
import { Editor } from "react-draft-wysiwyg";
import { Content } from 'antd/lib/layout/layout';


const PaymentMethod = () => {
    const entity = "paymentMethod"
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [isUpdate, setIsUpdate] = useState(false);
    const showModal = () => {
        setCurrentId(new Date().valueOf())
        setIsModalVisible(true);
        setIsUpdate(false);
        if (formRef.current) formRef.current.resetFields();
    };
    const dispatch = useDispatch();

    const handleOk = () => {
        // handle ok button click here
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };
    const [createForm] = useForm();
    const [editingKey, setEditingKey] = useState('');
    const [currentId, setCurrentId] = useState('');
    const [currentItem, setCurrentItem] = useState({});
    const [filterData, setFilterData] = useState([]);
    const [userData, setUserData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const isEditing = (record) => record._id === editingKey;
    const editItem = (item) => {
        if (item) {
            setTimeout(() => {
                if (formRef.current) formRef.current.setFieldsValue(item);

                const rawContentState = (item?.method_description);
                if (rawContentState) {
                    const contentState = convertFromHTML(rawContentState);
                    const newEditorState = EditorState.createWithContent(contentState);
                    setEditorState(newEditorState);
                }
            }, 400);
            setCurrentId(item._id);
            setCurrentItem(item);
            setIsModalVisible(true);
            setIsUpdate(true);
        }
    }
    const deleteItem = (item) => {
        const id = item._id;
        dispatch(crud.delete({ entity, id }))
        setTimeout(() => {
            dispatch(crud.resetState());
            dispatch(crud.list({ entity }));
        }, 1000)
    }
    const columns = [
        {
            title: 'Method Name',
            dataIndex: 'method_name',
            width: '15%',
        },
        {
            title: 'Deduction',
            dataIndex: 'deduction',
            width: '15%',
        },
        // {
        //     title: 'Method Descritpion',
        //     dataIndex: 'method_description',
        //     width: '15%',
        //     render: (text) => {
        //         return <div dangerouslySetInnerHTML={{ __html: text }} style={{ whiteSpace: 'nowrap' }} />
        //     }
        // },
        {
            title: 'Created',
            dataIndex: 'created',
            width: '15%',
            render: (text) => {
                return dateFormat(text)
            }
        },
        {
            title: 'Actions',
            dataIndex: 'operation',
            width: "10%",
            align: 'center',
            render: (_, record) => {
                if (!record.primary)
                    return (
                        <>
                            <Typography.Link onClick={() => editItem(record)}>
                                <EditOutlined style={{ fontSize: "20px" }} />
                            </Typography.Link>

                            <Popconfirm title="Sure to delete?" onConfirm={() => deleteItem(record)}>
                                <DeleteOutlined style={{ fontSize: "20px" }} />
                            </Popconfirm>
                        </>
                    )
            },
        },

    ];
    const mergedColumns = columns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record) => ({
                record,
                inputType: col.dataIndex === 'age' ? 'number' : 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });
    const { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems);

    const { pagination, items } = listResult;
    useEffect(() => {
        const result = items.map((obj, index) => (
            { ...obj, key: index }
        ))
        if (result.length) {
            setFilterData(result)
            setIsLoading(false);
            setUserData(result)
        }

    }, [
        items, pagination
    ])

    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const [contentState, setContentState] = useState(null);
    const handleContentStateChange = (contentState) => {
        setContentState(draftToHtml(contentState));
    };

    const handleEditorStateChange = (editorState) => {
        setEditorState(editorState);
    };
    const onFinish = (values) => {

        values.method_description = (contentState);
        if (isUpdate && currentId) {
            const id = currentId;
            dispatch(crud.update({ entity, id, jsonData: values }));
        } else {
            dispatch(crud.create({ entity, jsonData: values }));
        }
        formRef.current.resetFields();
        dispatch(crud.resetState());
        dispatch(crud.list({ entity }));
        handleCancel()
        setEditorState('');
        setContentState('')
    };
    const formRef = useRef(null);
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    useEffect(() => {
        dispatch(crud.resetState());
        dispatch(crud.list({ entity }));
        document.title = "Product Types"
    }, []);
    useEffect(() => {
        const filteredData = userData.filter((record) => {
            return (
                (!searchText || record['method_name'].toString().toLowerCase().includes(searchText.toLowerCase()))
            );
        })
        setFilterData(filteredData);
    }, [searchText, userData]);
    return (

        <DashboardLayout>
            <PageHeader title="Payment Method" onBack={() => { window['history'].back() }}
                extra={
                    <Button onClick={showModal} type="primary">Create Method</Button>
                }
            ></PageHeader>
            <Layout>
                <Modal width="800px" title="Create Form" open={isModalVisible} onOk={handleOk} onCancel={handleCancel} footer={null}>
                    <>
                        <Form
                            form={createForm}
                            ref={formRef}
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
                                name="method_name"
                                label="Method Name"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name="deduction"
                                label="Deduction"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Input type='number' prefix="%" />
                            </Form.Item>
                            <Form.Item
                                name="method_description"
                                label="Method Description"
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
                                    editorStyle={{ minHeight: 200, maxHeight: 200, border: '1px solid #d9d9d9', margin: 12, borderWidth: 0.5, padding: 10, borderRadius: "2px", backgroundColor: '#d9d9d926' }}
                                />
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
                <Layout>
                    <Row gutter={24}>
                        <Col span={6}>
                            <Input
                                placeholder='Search'
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </Col>
                    </Row>
                    <Table
                        bordered
                        rowKey={(item) => item._id}
                        key={(item) => item._id}
                        dataSource={filterData}
                        columns={mergedColumns}
                        loading={isLoading}
                        rowClassName="editable-row"
                        pagination={{
                            total: filterData.length,
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                            defaultPageSize: 10, // Set the default page size
                        }}
                    />


                </Layout>
            </Layout>
        </DashboardLayout >
    );
};
export default PaymentMethod;