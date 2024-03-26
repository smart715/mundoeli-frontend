import { crud } from "@/redux/crud/actions";
import { selectFilteredItemsByParent, selectListItems, selectListsByEmergency, selectListsByMedical, selectReadItem } from "@/redux/crud/selectors";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Modal, Popconfirm, Row, Table, Tag, Typography } from "antd";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
const { role } = window.localStorage.auth ? JSON.parse(window.localStorage.auth) : {};


const MedicalDetail = (props) => {
    const entity = 'medicalDetail';
    const dispatch = useDispatch();
    const currentEmployeeId = props.parentId
    const [isBankModal, setIsBankModal] = useState(false);
    const formRef = useRef(null);
    const Columns = [
        {
            title: 'Type',
            dataIndex: 'type',
        },
        {
            title: 'Description',
            dataIndex: 'description',
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

                        </> : ""
                )

            },
        },
    ];
    const [currentId, setCurrentId] = useState('');
    const [isUpdate, setIsUpdate] = useState(false);

    const editBankModal = () => {
        setIsBankModal(true);
        setIsUpdate(false);
        // if (formRef) formRef.current.resetFields();
    }
    const editItem = (item) => {
        if (item) {
            setIsBankModal(true);
            setIsUpdate(true);
            setTimeout(() => {

                if (formRef.current) formRef.current.setFieldsValue(item);
                setCurrentId(item._id);
            }, 200);

        }
    }
    const deleteItem = (item) => {
        const id = item._id;


        const jsonData = { parent_id: currentEmployeeId }
        console.log(id, 'idididi')
        dispatch(crud.delete({ entity, id }))
        setTimeout(() => {
            dispatch(crud.listByMedical({ entity, jsonData }));
        }, 500)
    }
    const handleBankModal = () => {
        setIsBankModal(false)
    }
    const saveDetails = (values) => {
        const parentId = currentEmployeeId;
        if (currentId && parentId && isUpdate) {
            const id = currentId;
            const jsonData = { parent_id: parentId }
            values["parent_id"] = parentId;
            dispatch(crud.update({ entity, id, jsonData: values }));
            setIsBankModal(false)
            setTimeout(() => {
                dispatch(crud.listByMedical({ entity, jsonData }));
            }, 500)
        } else {
            const jsonData = { parent_id: parentId }
            const id = currentId;
            values["parent_id"] = parentId;
            dispatch(crud.create({ entity, id, jsonData: values }));
            setIsBankModal(false)
            setTimeout(() => {
                dispatch(crud.listByMedical({ entity, jsonData }));
            }, 500)
        }
    }
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    const { result: Items } = useSelector(selectListsByMedical);

    useEffect(() => {
        const id = currentEmployeeId;
        const jsonData = { parent_id: id }
        // dispatch(crud.resetState());
        console.log(id, jsonData, '3333333')
        dispatch(crud.listByMedical({ entity, jsonData }));
    }, []);
    const items = Items.items ? Items.items.filter(obj => obj.parent_id === currentEmployeeId) : [];
    console.log(items, 'medical sdfasdfsad')


    // const items = []
    // console.log(bankItems, 'ItemsItemsItemsItemsItems')
    return (

        <div className="whiteBox shadow">
            <Modal title="Emergency Contact Form" visible={isBankModal} onCancel={handleBankModal} footer={null}>
                <Form
                    ref={formRef}
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

                >
                    <Form.Item
                        name="type"
                        label="Type"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input.TextArea showCount maxLength={900} style={{ height: "80px" }} />
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

                        <Button type="ghost" onClick={handleBankModal}>
                            cancel
                        </Button>
                    </Form.Item>
                </Form>
                <>
                </>
            </Modal>
            <Row>
                <Col span={5}>
                    <h3 style={{ color: '#22075e', marginBottom: 5 }}>Medical Details</h3>
                </Col>
                <Col span={12}>
                    <Button type="primary" onClick={editBankModal}>Add</Button>
                </Col>
            </Row>
            <Table
                bordered
                rowKey={(item) => item._id}
                key={(item) => item._id}
                dataSource={items}
                columns={Columns}
                rowClassName="editable-row"


            />
        </div>
    );
}

export default MedicalDetail;