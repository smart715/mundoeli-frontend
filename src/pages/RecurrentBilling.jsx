import { crud } from "@/redux/crud/actions";
import { selectCurrentItem, selectListsByCustomerStores, selectListsByRecurrent, } from "@/redux/crud/selectors";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Checkbox, Col, DatePicker, Form, Input, InputNumber, Modal, Popconfirm, Radio, Row, Select, Table, Typography } from "antd";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";


const RecurrentBilling = (props) => {
    const entity = 'recurrentInvoice';
    const dispatch = useDispatch();
    const currentEmployeeId = props.parentId
    const [isBankModal, setIsBankModal] = useState(false);
    const RecurrentRef = useRef(null);
    const bankColumns = [
        {
            title: 'Description',
            dataIndex: 'description',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            render: (_) => {
                return _ ? _.toFixed(2) : 0
            }
        },

        {
            title: 'Taxes',
            dataIndex: 'taxes',
            render: (text, record) => {
                return record.taxes_flag ? (record.amount * record.taxes) / 100 : 0
            }
        },
        {
            title: 'Frequency',
            dataIndex: 'frequency',
        },
        {
            title: 'Start',
            dataIndex: 'start_date',
            render: (text) => {
                return formattedDateFunc(text);
            }
        },
        {
            title: 'End',
            dataIndex: 'end_date',
            render: (text, record) => {

                return (record.unlimited ? "unlimited" : formattedDateFunc(text));
            }
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

                        <Popconfirm title="Sure to delete?" onConfirm={() => deleteItem(record)}>
                            <DeleteOutlined style={{ fontSize: "20px" }} />
                        </Popconfirm>
                    </>
                )

            },
        },
    ];
    const [currentId, setCurrentId] = useState('');
    const [isUpdate, setIsUpdate] = useState(false);

    const editBankModal = () => {
        setIsBankModal(true);
        setIsUpdate(false);
        if (RecurrentRef.current) RecurrentRef.current.resetFields();
    }
    const formattedDateFunc = (date) => {
        return new Date(date).toLocaleDateString()
    }
    const editItem = (item) => {
        if (item) {
            setIsBankModal(true);
            setIsUpdate(true);

            setTaxesStatus(true)
            setTimeout(() => {
                setUnlimited(item.unlimited)
                if (RecurrentRef.current) {
                    RecurrentRef.current.resetFields();
                    RecurrentRef.current.setFieldsValue({
                        start_date: moment(item.start_date),
                        end_date: moment(item.end_date),
                        description: item.description,
                        amount: item.amount,
                        frequency: item.frequency,
                        store: item.store._id,
                        taxes: item.taxes,
                        taxes_flag: item.taxes_flag
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
                const updateData = recurrents.filter(row => row._id !== id);
                setRecurrents(updateData);
                dispatch(crud.listByRecurrent({ entity, jsonData }));
            }, 500)
        }

    }
    const handleBankModal = () => {
        setIsBankModal(false)
    }
    const saveBankDetails = (values) => {
        values["unlimited"] = unlimited;
        values["start_date"] = formattedDateFunc(values["start_date"]);
        if (!unlimited) values["end_date"] = formattedDateFunc(values["end_date"]);
        const parentId = currentEmployeeId;
        if (currentId && parentId && isUpdate) {
            const id = currentId;
            const jsonData = { parent_id: parentId }
            values["parent_id"] = parentId;
            dispatch(crud.update({ entity, id, jsonData: values }));

            setIsBankModal(false)
            setTimeout(() => {
                dispatch(crud.listByRecurrent({ entity, jsonData }));
            }, 500)
        } else {
            const jsonData = { parent_id: parentId }
            const id = currentId;
            values["parent_id"] = parentId;

            dispatch(crud.create({ entity, jsonData: values }));
            setIsBankModal(false)
            setTimeout(() => {
                dispatch(crud.listByRecurrent({ entity, jsonData }));
            }, 500)
        }
    }
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    const [stores, setStores] = useState([]);
    const [recurrents, setRecurrents] = useState([]);
    const { result: Stores } = useSelector(selectListsByCustomerStores);
    const { result: Recurrents } = useSelector(selectListsByRecurrent);
    const { result: currentItem } = useSelector(selectCurrentItem)
    useEffect(() => {
        const storesOptions = Stores.items || [];

        if (storesOptions) {
            const stores = storesOptions.map(item => {
                return {
                    value: item._id,
                    label: item.store
                }
            })
            setStores(stores);
        } else {
            setStores([]);
        }

    }, [Stores])
    useEffect(() => {
        const recurrentOptions = Recurrents.items || [];
        recurrentOptions.map((obj, index) => {
            obj['key'] = index
        })
        if (recurrentOptions) {
            setRecurrents(recurrentOptions);
        } else {
            setStores([]);
        }

    }, [Recurrents])
    useEffect(() => {
        const id = currentEmployeeId;
        const jsonData = { parent_id: id }
        dispatch(crud.listByCustomerStores({ entity: "customerStores", jsonData: { parent_id: currentEmployeeId } }))
        dispatch(crud.listByRecurrent({ entity, jsonData }));
    }, []);
    const [unlimited, setUnlimited] = useState(false);
    const [taxesStatus, setTaxesStatus] = useState(false);

    const UnlimitedStatus = (e) => {
        setUnlimited(e.target.checked)
    }
    const isTaxes = (e) => {
        setTaxesStatus(e.target.value)
    }

    const generateInvoices = (item) => {

        const { start_date, end_date, frequency, amount, taxes, description, _id, parent_id, unlimited, taxes_flag } = item;
        const invoices = [];

        console.log(parent_id._id || parent_id, item, 'items,,,,');
        if (frequency === 0) {
            console.log(frequency, 'items,,,,');
            let currentDate = moment(start_date);
            invoices.push({
                start_date: currentDate.format('MM/DD/YYYY'),
                description: description,
                amount: amount + (taxes_flag ? (amount * taxes / 100) : 0),
                parent_id: parent_id._id || parent_id,
                recurrent_id: _id
            })
        }
        if (start_date && frequency > 0) {
            let currentDate = moment(start_date);
            var date = new Date(start_date);
            date.setMonth(date.getMonth() + 12);
            const end = !unlimited ? moment(end_date) : moment(date);
            while (currentDate.isSameOrBefore(end)) {
                // invoices.push(currentDate.format('MM/DD/YYYY'));

                invoices.push({
                    start_date: currentDate.format('MM/DD/YYYY'),
                    description: description,
                    amount: amount + (taxes_flag ? (amount * taxes / 100) : 0),
                    parent_id: parent_id._id || parent_id,
                    recurrent_id: _id
                })
                currentDate = currentDate.add(frequency, 'months');
            }

        }
        dispatch(crud.create({ entity: "invoiceHistory", jsonData: invoices }));
        setTimeout(() => {
            dispatch(crud.listByInvoice({ entity: "invoiceHistory", jsonData: { parent_id: currentEmployeeId } }))
        }, 1000);





    }
    useEffect(() => {
        console.log(currentItem, 'currentItemcurrentItemcurrentItem')
        if (currentItem && currentItem.hasOwnProperty("frequency")) {
            generateInvoices(currentItem);
        }
    }, [currentItem])

    const disabledDate = (current) => {
        return current && (current.year() < new Date().getFullYear() || (current.year() === new Date().getFullYear() && current.month() < new Date().getMonth()))
    }
    const disabledDate_ = (current) => {
        return current && (current.year() < new Date().getFullYear() || (current.year() === new Date().getFullYear() && current.month() < new Date().getMonth() + 1))
    }
    return (
        <div className="whiteBox shadow">
            <Modal title="Recurrent invoice" open={isBankModal} onCancel={handleBankModal} footer={null} width={1000}>
                <Form
                    ref={RecurrentRef}
                    name="basic"
                    labelCol={{
                        span: 8,
                    }}
                    wrapperCol={{
                        span: 16,
                    }}
                    onFinish={saveBankDetails}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                    initialValues={{
                        gender: 1,
                        civil_status: 3,
                        birthplace: "AU",

                    }}
                >
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                name="description"
                                label="Description"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Input.TextArea />
                            </Form.Item>
                            <Form.Item
                                name="amount"
                                label="Amount"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <InputNumber />
                            </Form.Item>
                            <Form.Item
                                name="taxes_flag"
                                label="Taxes"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Radio.Group value={isTaxes} onChange={isTaxes} options={[{
                                    label: "Yes",
                                    value: true
                                }, {
                                    label: "No",
                                    value: false
                                }]} />
                            </Form.Item>
                            {taxesStatus &&
                                <Form.Item
                                    name="taxes"
                                    label=" "
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <InputNumber />
                                </Form.Item>
                            }
                            <Form.Item
                                name="frequency"
                                label="Frequency"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <InputNumber />
                            </Form.Item>
                            <Form.Item
                                name="store"
                                label="Store"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Select
                                    showSearch
                                    placeholder="Select a person"
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={stores}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="start_date"

                                label="start"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <DatePicker disabledDate={disabledDate} format={"MM/DD/YYYY"} />
                            </Form.Item>

                            {!unlimited &&
                                <Form.Item
                                    name="end_date"

                                    label="End"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <DatePicker disabledDate={disabledDate} format={"MM/DD/YYYY"} />
                                </Form.Item>}
                            <Form.Item
                                name="unlimited"
                                label="Unlimited"
                            >
                                <Checkbox checked={unlimited} onChange={UnlimitedStatus} />
                            </Form.Item>
                        </Col>
                    </Row>
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
                <Col span={3}>
                    <h3 style={{ color: '#22075e', marginBottom: 5 }}>Recurrent Billing</h3>
                </Col>
                <Col span={12}>
                    <Button type="primary" onClick={editBankModal}>Add</Button>
                </Col>
            </Row>
            <Table
                bordered
                rowKey={(item) => item._id}
                key={(item) => item._id}
                dataSource={recurrents}
                columns={bankColumns}
                rowClassName="editable-row"
            />
        </div>
    );
}
export default RecurrentBilling;