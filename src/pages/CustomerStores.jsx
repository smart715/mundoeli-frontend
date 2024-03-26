import { crud } from "@/redux/crud/actions";
import { selectListsByCustomerStores } from "@/redux/crud/selectors";
import { DeleteOutlined, EditOutlined, EyeOutlined, } from "@ant-design/icons";
import { Button, Checkbox, Col, Form, Input, InputNumber, Modal, Popconfirm, Radio, Row, Table, TimePicker, Typography } from "antd";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { request } from "@/request";
import SelectAsync from "@/components/SelectAsync";
const { role } = window.localStorage.auth ? JSON.parse(window.localStorage.auth) : {};

const compare = (a, b) => {
    if (a.primary && !b.primary) {
        return -1; // a comes before b
    } else if (!a.primary && b.primary) {
        return 1; // b comes before a
    } else {
        return 0; // no change in order
    }
};
const CustomerStores = (props) => {
    const entity = 'customerStores';
    const dispatch = useDispatch();
    const currentEmployeeId = props.parentId
    const [isBankModal, setIsBankModal] = useState(false);
    const formRef = useRef(null);
    const [insumos, setInsumos] = useState(false);

    const [labourBilling, setLabourBilling] = useState(0);
    const [productBilling, setProductBilling] = useState(0);
    const [otherBilling, setOtherBilling] = useState(0);
    const [listItems, setListItems] = useState([]);
    const [employeeDatas, setEmployeeDatas] = useState([]);
    const [assignedEmployees, setAssignedEmployees] = useState([])
    useEffect(() => {
        console.log(labourBilling + productBilling + otherBilling);
        if (formRef.current) {
            formRef.current.setFieldsValue({
                billing: (labourBilling || 0) + (productBilling || 0) + (otherBilling || 0)
            })
        }
    }, [
        labourBilling, productBilling, otherBilling
    ])
    const bankColumns = [
        {
            title: 'Store',
            dataIndex: 'store',
        },
        {
            title: 'Employees',
            dataIndex: 'employees',
            render: (_, record) => {
                const { employees_ } = record
                return <label onClick={() => showEmployees(employees_)}>{_}</label>
            }
        },
        {
            title: 'Location',
            dataIndex: 'location',
        },
        {
            title: 'Waze Location',
            dataIndex: 'waze_location',
        },
        {
            title: 'Billing',
            dataIndex: 'billing',
        },
        {
            title: 'Products',
            dataIndex: 'products',
            render: (text, record) => (
                <Typography.Link onClick={() => showProducts(record.products)}>
                    <EyeOutlined style={{ fontSize: "20px" }} />
                </Typography.Link>
            ),
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
    const employeeColumns = [
        {
            title: "Name",
            dataIndex: "name"
        },
        {
            title: "Hours",
            dataIndex: "hours"
        },
        {
            title: "Salary",
            dataIndex: "salary"
        },
        {
            title: "Contract",
            dataIndex: "contract"

        },
        {
            title: "Hrs/sem",
            dataIndex: "hr_week"
        },
    ]
    const [currentId, setCurrentId] = useState('');
    const [isUpdate, setIsUpdate] = useState(false);

    const editBankModal = () => {
        setLabourBilling(0);
        setProductBilling(0);
        setOtherBilling(0)
        setIsUpdate(false);
        setIsBankModal(true);
        if (formRef.current) formRef.current.resetFields();

    }
    const getFormattedHours = (days) => {
        const dayLabels = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'];
        const hours = [];

        for (let i = 0; i < days.length; i++) {
            if (!days[i]) continue
            const [start, end] = days[i];

            if (start === end) {
                hours.push(dayLabels[i] + ' ' + new Date(start).getHours());
            } else if (i === 0 || start !== days[i - 1][0] || end !== days[i - 1][1]) {
                hours.push(dayLabels[i] + '( ' + new Date(start).getHours() + '-' + new Date(end).getHours() + ')');
            }
        }
        return hours.join(', ');
    }
    const getTotalWeekHours = (days) => {
        let totalHours = 0;

        for (const day of days) {
            const startTime = day[0];
            const endTime = day[1];

            const startHour = parseInt(startTime);
            const endHour = parseInt(endTime);

            const hours = endHour - startHour;
            totalHours += hours;
        }
        return totalHours;

    }
    const editItem = (item) => {
        if (item) {
            setIsBankModal(true);
            setIsUpdate(true);
            setTimeout(() => {
                formRef.current.resetFields();
                if (item.hasOwnProperty('insumos') && item.insumos) {
                    setInsumos(true)
                } else {
                    setInsumos(false)
                }
                item.routes = item.routes ? item.routes._id : undefined;
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
        setListItems(listItems.filter(list => list._id !== id))
        setTimeout(() => {
            dispatch(crud.listByCustomerStores({ entity, jsonData }));
        }, 500)
    }
    const handleBankModal = () => {
        setIsBankModal(false)
    }
    const saveBankDetails = (values) => {
        const parentId = currentEmployeeId;
        console.log(currentId, parentId, isUpdate, 'currentId && parentId && isUpdate')
        if (isUpdate) {
            const id = currentId;
            const jsonData = { parent_id: parentId }
            values["parent_id"] = parentId;
            dispatch(crud.update({ entity, id, jsonData: values }));
            setIsBankModal(false)
            setTimeout(() => {
                dispatch(crud.listByCustomerStores({ entity, jsonData }));
            }, 500)
        } else {
            const jsonData = { parent_id: parentId }
            values["parent_id"] = parentId;
            dispatch(crud.create({ entity, jsonData: values }));
            setIsBankModal(false)
            setTimeout(() => {
                dispatch(crud.listByCustomerStores({ entity, jsonData }));
            }, 500)
        }
    }
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    const { result: Items } = useSelector(selectListsByCustomerStores);
    const showEmployees = (data) => {
        setIsModal(true)

        console.log(data, assignedEmployees)
        const lists = []
        data.map((item, index) => {
            const { contract, store, employee } = item;
            const obj = {
                key: index,
                name: employee ? employee.name : '',
                hours: getFormattedHours(
                    [
                        store.monday ? [store.monday[0], store.monday[1]] : "",
                        store.tuesday ? [store.tuesday[0], store.tuesday[1]] : "",
                        store.wednesday ? [store.wednesday[0], store.wednesday[1]] : "",
                        store.thursday ? [store.thursday[0], store.thursday[1]] : "",
                        store.friday ? [store.friday[0], store.friday[1]] : "",
                        store.saturday ? [store.saturday[0], store.saturday[1]] : "",
                        store.sunday ? [store.sunday[0], store.sunday[1]] : "",
                    ]
                ),
                salary: contract ? contract.sal_monthly : 0,
                contract: contract ? `${contract.start_date}-${contract.end_date}` : '',
            }
            if (assignedEmployees) {
                assignedEmployees.map(position => {
                    const { contract: p_contract, employee: p_employee, store: p_store } = position;
                    if (contract && employee && store && p_contract && p_employee && p_store && contract._id === p_contract._id && employee._id === p_employee._id && store._id === p_store._id) {
                        obj.hr_week = position.hr_week || 0;
                    }
                })
            }
            lists.push(obj);
        })
        setEmployeeDatas(lists)
    }
    useEffect(() => {

        async function init() {
        }
        init();
        const id = currentEmployeeId;
        const jsonData = { parent_id: id }
        dispatch(crud.listByCustomerStores({ entity, jsonData }));
    }, []);

    useEffect(() => {
        async function init() {
            const { result: assignedEmployees } = await request.list({ entity: "assignedEmployee" });
            // const { result: customerStores } = await request.list({ entity: "customerStores", parent_id: currentEmployeeId });
            const items = Items.items || [];
            items.sort(compare);
            items.map(item => {
                const { _id: store_id } = item
                item['employees_'] = [];
                assignedEmployees.map(obj => {
                    const { store } = obj
                    if (store) {
                        const { _id: store_id1 } = store;
                        if (store_id === store_id1) {
                            item['employees_'].push(obj)
                        }
                    }
                })
                item['employees'] = item['employees_'].length
            })
            setListItems(items);
            setAssignedEmployees(assignedEmployees);
        }

        init();

    }, [
        Items
    ])
    const [isProducts, setIsProducts] = useState(false);
    const [isModal, setIsModal] = useState(false);
    const [products, setProducts] = useState("");
    const handleProducts = () => {
        setIsProducts(false)
    }
    const cancelModal = () => {
        setIsModal(false)
    }
    const showProducts = (products) => {
        setIsProducts(true);
        setProducts(products || "")
    }

    return (

        <div className="whiteBox shadow">
            <Modal title="Products" visible={isProducts} onCancel={handleProducts} footer={null}>
                <h3>{products}</h3>
            </Modal>
            <Modal title="Employees" visible={isModal} onCancel={cancelModal} footer={null} width={1000}>
                <Table
                    columns={employeeColumns}
                    dataSource={employeeDatas || []}

                />
            </Modal>
            <Modal title="Create Form" visible={isBankModal} onCancel={handleBankModal} footer={null} width={1000}>
                <Form
                    ref={formRef}
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
                >

                    <Row gutter={24}>
                        <Col span={13}>
                            <Form.Item
                                name="store"
                                label="Store Name"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name="location"
                                label="Location"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name="waze_location"
                                label="Waze Location"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name="routes"
                                label="Routes"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <SelectAsync entity={'routes'} displayLabels={['routes']}></SelectAsync>
                            </Form.Item>
                            <Form.Item
                                name="billing"
                                label="Billing"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Input type="number" readOnly style={{ background: 'lightgrey' }} />
                            </Form.Item>
                            <Form.Item
                                name="labour_billing"
                                label="Labour Billing"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <InputNumber onChange={(e) => setLabourBilling(e)} type="number" />
                            </Form.Item>
                            <Form.Item
                                name="product_billing"
                                label="Product Billing"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <InputNumber onChange={(e) => setProductBilling(e)} type="number" />
                            </Form.Item>
                            <Form.Item
                                name="other_billing"
                                label="Other Billing"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <InputNumber onChange={(e) => setOtherBilling(e)} type="number" />
                            </Form.Item>

                        </Col>
                        <Col span={11}>
                            <Form.Item
                                name="status"
                                label="Status"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Radio.Group options={[

                                    {
                                        label: "Active",
                                        value: 0
                                    },

                                    {
                                        label: "Inactive",
                                        value: 1
                                    }
                                ]} />
                            </Form.Item>
                            <Form.Item
                                name="inspection"
                                label="Monthly inspections"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <InputNumber type="number" />
                            </Form.Item>


                            <Form.Item
                                name="insumos"
                                label="Insumos"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Radio.Group
                                    options={[
                                        {
                                            value: true,
                                            label: "Yes"
                                        },
                                        {
                                            value: false,
                                            label: "No"
                                        },
                                    ]}

                                    onChange={(e) => { console.log(e.target.value); setInsumos(e.target.value) }}
                                />
                            </Form.Item>
                            {insumos &&
                                <>
                                    {/* <Form.Item
                                        name="visit_value"
                                        label="Visits"
                                        rules={[
                                            {
                                                required: true,
                                            },
                                        ]}
                                    >
                                        <Input type='number' />
                                    </Form.Item> */}
                                    <Form.Item
                                        name="deliver"
                                        label="Monthly deliver"
                                        rules={[
                                            {
                                                required: true,
                                            },
                                        ]}
                                    >
                                        <Input type='number' />
                                    </Form.Item>
                                </>
                            }

                            {insumos &&
                                <Form.Item
                                    name="products"
                                    label="Products"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Input.TextArea />
                                </Form.Item>}
                            <Form.Item
                                name="spec"
                                label="Specs"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Input.TextArea />
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
                    <h3 style={{ color: '#22075e', marginBottom: 5 }}>Stores</h3>
                </Col>
                <Col span={12}>
                    <Button type="primary" onClick={editBankModal}>Add</Button>
                </Col>
            </Row>
            <Table
                bordered
                rowKey={(item) => item._id}
                key={(item) => item._id}
                dataSource={listItems || []}
                columns={bankColumns}
                rowClassName="editable-row"


            />
        </div>
    );
}

export default CustomerStores;