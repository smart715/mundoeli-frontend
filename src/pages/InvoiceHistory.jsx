import * as XLSX from 'xlsx';
import { crud } from "@/redux/crud/actions";
import { selectListsByCustomerStores, selectListsByInvoice, selectListsByRecurrent, } from "@/redux/crud/selectors";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Checkbox, Col, DatePicker, Form, Input, InputNumber, Modal, Popconfirm, Radio, Row, Select, Table, Typography } from "antd";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";


const InvoiceHistory = (props) => {
    const entity = 'invoiceHistory';
    const dispatch = useDispatch();
    const currentEmployeeId = props.parentId
    const [isModal, setIsModal] = useState(false);
    const RecurrentRef = useRef(null);
    const Columns = [
        {
            title: 'Date',
            dataIndex: 'start_date',
            render: (text) => {
                return (formattedDateFunc(text));
            }
        },
        {
            title: 'Description',
            dataIndex: ['recurrent_id', 'description'],
        },

        {
            title: 'Amount',
            dataIndex: 'amount',
            render: (_) => {
                return _ ? _.toFixed(2) : 0
            }
        },
        {
            title: 'Details',
            dataIndex: 'details',
        },

        {
            title: 'Actions',
            dataIndex: 'operation',
            width: "10%",
            align: 'center',
            render: (_, record) => {
                return (

                    <>
                        <Typography.Link onClick={() => editItem(record)}>
                            <EditOutlined style={{ fontSize: "20px" }} />
                        </Typography.Link>

                        {/* <Popconfirm title="Sure to delete?" onConfirm={() => deleteItem(record)}>
                            <DeleteOutlined style={{ fontSize: "20px" }} />
                        </Popconfirm> */}
                    </>
                )

            },
        },
    ];
    const [currentId, setCurrentId] = useState('');
    const [isUpdate, setIsUpdate] = useState(false);

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

            setTaxesStatus(true)
            setTimeout(() => {
                setUnlimited(item.unlimited)
                if (RecurrentRef.current) {
                    RecurrentRef.current.resetFields();
                    RecurrentRef.current.setFieldsValue({
                        amount: item.amount,
                        details: item.details
                    });
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
                const updateData = Invoices.filter(row => row._id !== id);
                setInvoices(updateData);
                dispatch(crud.listByRecurrent({ entity, jsonData }));
            }, 500)
        }

    }
    const handleModal = () => {
        setIsModal(false)
    }
    const saveDetails = (values) => {
        const parentId = currentEmployeeId;
        if (currentId && parentId && isUpdate) {
            const id = currentId;
            const jsonData = { parent_id: parentId }
            dispatch(crud.update({ entity, id, jsonData: values }));
            setIsModal(false)
            setTimeout(() => {
                dispatch(crud.listByInvoice({ entity, jsonData }));
            }, 500)
        } else {
            const jsonData = { parent_id: parentId }
            const id = currentId;
            values["parent_id"] = parentId;
            dispatch(crud.create({ entity, id, jsonData: values }));
            setIsModal(false)
            setTimeout(() => {
                dispatch(crud.listByInvoice({ entity, jsonData }));
            }, 500)
        }
    }
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    const [stores, setStores] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const { result: Invoices } = useSelector(selectListsByInvoice);


    useEffect(() => {
        const id = currentEmployeeId;
        const jsonData = { parent_id: id }
        dispatch(crud.listByInvoice({ entity, jsonData }));
    }, []);
    const [unlimited, setUnlimited] = useState(false);
    const [taxesStatus, setTaxesStatus] = useState(false);
    useEffect(() => {

        if (Invoices.items) {

            const filterData = Invoices.items.filter(obj => new Date(obj.start_date).getMonth() <= new Date().getMonth() && new Date(obj.start_date).getFullYear() <= new Date().getFullYear());
            // console.log(filterData, 'ddfilterData')
            setInvoices(filterData)

        }
    }, [Invoices])
    const UnlimitedStatus = (e) => {
        setUnlimited(e.target.checked)
    }
    const isTaxes = (e) => {
        setTaxesStatus(e.target.value)
    }

    const exportToExcel = () => {

        const _invoices = invoices.map(obj => ({
            date: obj.start_date,
            amount: obj.amount,
            details: obj.details
        }))
        const worksheet = XLSX.utils.json_to_sheet(_invoices);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        XLSX.writeFile(workbook, 'table.xlsx');
    }
    return (
        <div className="whiteBox shadow">
            <Modal title="Recurrent invoice" open={isModal} onCancel={handleModal} footer={null} width={1000}>
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
                        name="amount"
                        label="Amount"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <InputNumber width={1000} />
                    </Form.Item>
                    <Form.Item
                        name="details"
                        label="Details"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input.TextArea />
                    </Form.Item>
                    {/* <Row gutter={24}>
                        <Col span={24}>


                        </Col>

                    </Row> */}
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
                <>
                </>
            </Modal>
            <Row>
                <Col span={3}>
                    <h3 style={{ color: '#22075e', marginBottom: 5 }}>Invoice History</h3>
                </Col>
                <Col span={12}>

                    <button onClick={exportToExcel}>Export to Excel</button>

                </Col>
            </Row>
            <Table
                bordered
                rowKey={(item) => item._id}
                key={(item) => item._id}
                dataSource={invoices || []}
                columns={Columns}
                rowClassName="editable-row"
            />
        </div>
    );
}
export default InvoiceHistory;