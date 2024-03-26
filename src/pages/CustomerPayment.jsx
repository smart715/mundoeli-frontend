import SelectAsync from "@/components/SelectAsync";
import { crud } from "@/redux/crud/actions";
import { selectListsByCustomerContact, } from "@/redux/crud/selectors";
import { request } from "@/request";
import { CheckOutlined, CloseCircleOutlined, CloseSquareOutlined, EditOutlined, EyeOutlined, FolderViewOutlined, MinusCircleOutlined, PlusCircleOutlined, } from "@ant-design/icons";
import { Button, Checkbox, Col, Dropdown, Form, Input, Modal, Row, Space, Table, Typography, Upload, message } from "antd";
import TextArea from "antd/lib/input/TextArea";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
const handleMenuClick = (e) => {
    message.info('Click on menu item.');
    console.log('click', e);
};
const items = [
    {
        label: 'Edit',
        key: '1',
        icon: <EditOutlined />
    },
    {
        label: 'Cancel',
        key: '2',
        icon: <CloseSquareOutlined />
    },
    {
        label: 'Delivered',
        key: '3',
        icon: <CheckOutlined />
    },
];
const menuProps = {
    items,
    onClick: handleMenuClick,
};
const CustomerPayment = ({ parentId: currentCustomerId, isClicked, onIsClickNewReservaChange, customerInfo, setReversationInfo }) => {
    const { id: currentUserId } = JSON.parse(localStorage.auth)

    const entity = 'customerReversation';
    const dispatch = useDispatch();

    const [isEdit, setIsEdit] = useState(false);
    const formRef = useRef(null);
    const Columns = [
        {
            title: 'Payment Id',
            dataIndex: '_payment_id',
        },
        {
            title: 'Date',
            dataIndex: 'created',
            render: (date) => {
                return new Date(date).toLocaleDateString();
            }
        },
        {
            title: 'Product',
            dataIndex: ['product_name', `category_name`],
            render: (product, obj) => {
                return `${product} | $${obj?.paid_amount}`
            }
        },
        {
            title: 'Total',
            dataIndex: 'product_price',
            render: (product_price) => {
                return `$${product_price}`
            }
        },
        {
            title: 'User',
            dataIndex: [`user_id`, `name`],

        },
        {
            title: 'Status',
            dataIndex: 'payment_status',
            render: (payment_status) => {
                if (payment_status == -1) {
                    return <span className='badge badge-light-danger'>Cancelled</span>
                } else {
                    return <span className='badge badge-light-success'>Completed</span>
                }
            }
        },
        {
            title: 'Actions',
            render: (_, record) => {
                return (
                    <>
                        {
                            record?.payment_status == 1 ?
                                <Typography.Link onClick={() => cancelItem(record)}>
                                    <CloseCircleOutlined style={{ fontSize: "20px" }} />
                                </Typography.Link> :
                                <Typography.Link onClick={() => logViewItem(record)}>
                                    <EyeOutlined style={{ fontSize: "20px" }} />
                                </Typography.Link>
                        }

                    </>
                )

            }
        },
    ];
    const logColumns = [
        {
            title: 'Date',
            dataIndex: 'created',
            render: (created) => {
                return new Date(created).toLocaleDateString();
            }
        },
        {
            title: 'Description',
            dataIndex: 'description',
        },
        {
            title: 'User',
            dataIndex: [`user_id`, `name`]

        },

    ];
    const cancelItem = (item) => {
        setIsCancelModal(true);
        setCurrentId(item?._id)
    }
    const [currentId, setCurrentId] = useState('');
    const [isUpdate, setIsUpdate] = useState(false);
    const [parentInfo, setParentInfo] = useState({ name: 33 });
    const [cancelCommit, setCancelCommit] = useState(``);
    const [isLogHistory, setIsLogHistory] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState([])
    useEffect(() => {
        setParentInfo(customerInfo);
        return () => {
            onIsClickNewReservaChange(false)
        }
    }, [onIsClickNewReservaChange, customerInfo])
    const handleBankModal = () => {
        setIsEdit(false)
    }
    const saveData = (values) => {
        const parentId = currentCustomerId;
        const { reversations } = values;
        const reversationsWithParentId = reversations.map((obj) => {
            obj.parent_id = parentId;
            obj.user_id = currentUserId;
            return obj
        })
        dispatch(crud.create({ entity, jsonData: reversationsWithParentId }));
        dispatch(crud.listByCustomerContact({ entity, jsonData: { parent_id: parentId } }));
        setIsEdit(false)
    }
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    const [paginations, setPaginations] = useState({ current: 0, count: 0, total: 0, page: 0 });
    useEffect(() => {
        const id = currentCustomerId;
        const jsonData = { parent_id: id }
        dispatch(crud.listByCustomerContact({ entity, jsonData }));
    }, []);

    useEffect(() => {
        (async () => {
            const { result, pagination } = await request.listById({ entity, jsonData: { parent_id: currentCustomerId } });
            const paymentInfo = [...result.map((obj, index) => { return { ...obj, _payment_id: `P${index + 1}` } })]
            setPaymentInfo(paymentInfo)
            setReversationInfo(paymentInfo);
            setPaginations(pagination)
        })()
    }, [])
    const compare = (a, b) => {
        if (a.primary && !b.primary) {
            return -1; // a comes before b
        } else if (!a.primary && b.primary) {
            return 1; // b comes before a
        } else {
            return 0; // no change in order
        }
    };
    items.sort(compare);
    const [form] = Form.useForm();
    const [totalPaidAmount, setTotalPaidAmount] = useState(0);
    const [totalAllAmount, setTotalAllAmount] = useState(0);
    const [totalPredienteAmount, setTotalPredienteAmount] = useState(0);
    const [isCancelModal, setIsCancelModal] = useState(false)
    const [logHistories, setLogHistories] = useState([]);

    const [fileList, setFileList] = useState([
    ]);
    const onChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };
    const onPreview = async (file) => {
        let src = file.url;
        if (!src) {
            src = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(file.originFileObj);
                reader.onload = () => resolve(reader.result);
            });
        }
        const image = new Image();
        image.src = src;
        const imgWindow = window.open(src);
        imgWindow?.document.write(image.outerHTML);
    };
    const handleCancel = () => {
        if (currentId) {
            const id = currentId;
            const { id: user_id } = JSON.parse(localStorage.auth)

            const jsonData = { payment_status: -1 }
            dispatch(crud.create({ entity: `logHistory`, jsonData: { description: cancelCommit, log_id: id, where_: 'payment', user_id } }))
            dispatch(crud.update({ entity, id, jsonData }));

            setTimeout(() => {
                const jsonData = { parent_id: currentCustomerId }
                dispatch(crud.listByCustomerContact({ entity, jsonData }))
            }, [500])
        }
    }
    const logViewItem = async (item) => {

        const currentId = item?._id;
        const jsonData = { log_id: currentId, where_: `payment` }
        const { result: logData } = await request.listById({ entity: "logHistory", jsonData });
        setLogHistories(logData)
        setIsLogHistory(true)
    }
    const Footer = useCallback(() => {
        const pages = paginations
        const { current, count, total, page } = pages
        const currentPage = current || page;
        const totalSize = total || count;
        return (
            <>
                Showing {paymentInfo.length ? ((currentPage - 1) * 10 + 1) : 0} to {currentPage * 10 > (totalSize) ? (totalSize) : currentPage * 10} of {totalSize} entries
            </>
        );
    }, [paginations, paymentInfo])
    const paginationChange = useCallback((page) => {
        setPaginations({ ...page, })
    }, [])

    return (

        <div className="whiteBox shadow">
            <Modal title="New Reserva" visible={isEdit} onCancel={handleBankModal} footer={null} width={1000}>
                <Form
                    className="ant-advanced-search-form"
                    form={form}
                    ref={formRef}
                    name="basic"
                    layout="vertical"
                    wrapperCol={{
                        span: 16,
                    }}
                    onFinish={saveData}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                    initialValues={{
                        name: customerInfo?.name,
                        email: customerInfo?.email,
                        iguser: customerInfo?.iguser
                    }}
                >
                    <Row>
                        <Col span={8}>
                            <Form.Item
                                name={'name'}
                                label="Name"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Input disabled />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name={'email'}
                                label="Email"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Input disabled />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name={'iguser'}
                                label="IG"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Input disabled />
                            </Form.Item>
                        </Col>
                        <Form.List name="reversations">
                            {(fields, { add, remove }) => (
                                console.log(fields),
                                <>
                                    {fields.map(({ key, name, ...restField }, index) => (
                                        console.log(restField, 'restField'),

                                        <Space
                                            key={key}
                                            style={{
                                                display: 'flex',
                                                // marginBottom: 8,
                                            }}
                                            align="baseline"
                                        >
                                            <Form.Item
                                                {...restField}
                                                wrapperCol={24}
                                                label={'Product Type'}
                                                name={[name, `product_type`]}
                                                rules={[
                                                    {
                                                        required: true,
                                                    },
                                                ]}
                                            >
                                                <SelectAsync entity={'productCategories'} displayLabels={['category_name']}></SelectAsync>
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, `product_name`]}
                                                label="Product"
                                                rules={[
                                                    {
                                                        required: true,
                                                    },
                                                ]}
                                                onChange={(e) => {
                                                    const newValue = e.target.value;
                                                    var formData = form.getFieldsValue();
                                                    if (formData) {
                                                        formData['reversations'][index][`payment_name`] = newValue;
                                                        form.setFieldsValue(formData)
                                                    }
                                                }}
                                            >
                                                <Input />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, `product_price`]}
                                                label="Price"
                                                rules={[
                                                    {
                                                        required: true,
                                                    },
                                                ]}
                                                onChange={(e) => {
                                                    const newValue = e.target.value;

                                                    var formData = form.getFieldsValue();
                                                    if (formData) {
                                                        formData['reversations'][index][`total_price`] = newValue;
                                                        formData['reversations'][index][`prediente`] = (newValue || 0) - (formData['reversations'][index][`paid_amount`] || 0);
                                                        const reversations = formData?.reversations;

                                                        console.log(reversations, '222');
                                                        var total_paid_amount = 0, total_amount = 0, tota_prediente = 0;
                                                        for (var i = 0; reversations && i < reversations.length; i++) {
                                                            var obj = reversations[i];
                                                            total_paid_amount += parseFloat(obj?.paid_amount || 0);
                                                            total_amount += parseFloat(obj?.total_price || 0);
                                                            tota_prediente += parseFloat(obj?.prediente || 0)
                                                        }
                                                        setTotalPaidAmount(total_paid_amount || 0)
                                                        setTotalAllAmount(total_amount || 0)
                                                        setTotalPredienteAmount(tota_prediente || 0)
                                                        form.setFieldsValue(formData);
                                                    }
                                                }}
                                            >
                                                <Input />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, `is_presale`]}
                                                label="Presale"
                                                valuePropName="checked"
                                            >
                                                <Checkbox value={true} />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, `notes`]}
                                                label="Notes"
                                            >
                                                <Input />
                                            </Form.Item>
                                            <Form.Item
                                                label={`action`}
                                            >
                                                <MinusCircleOutlined onClick={() => {
                                                    remove(name)
                                                    const formData = form?.getFieldsValue();
                                                    if (formData) {
                                                        const reversations = formData?.reversations;
                                                        var total_paid_amount = 0, total_amount = 0, tota_prediente = 0;
                                                        for (var i = 0; reversations && i < reversations.length; i++) {
                                                            var obj = reversations[i];
                                                            total_paid_amount += parseFloat(obj?.paid_amount || 0);
                                                            total_amount += parseFloat(obj?.total_price || 0);
                                                            tota_prediente += parseFloat(obj?.prediente || 0)
                                                        }
                                                        setTotalPaidAmount(total_paid_amount || 0)
                                                        setTotalAllAmount(total_amount || 0)
                                                        setTotalPredienteAmount(tota_prediente || 0)
                                                    };
                                                }} />
                                            </Form.Item>
                                        </Space>

                                    ))}
                                    <Form.Item label={` `}>
                                        <PlusCircleOutlined onClick={() => { add() }} />
                                    </Form.Item>

                                    <Row gutter={24} wrap>
                                        {fields.map(({ key, name, ...restField }, index) => (
                                            <>
                                                <Col span={4}>
                                                    <Form.Item
                                                        name={[name, 'payment_name']}
                                                        label="Payment"
                                                    >
                                                        <label>{form.getFieldsValue()?.reversations[index]?.payment_name}</label>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4}>
                                                    <Form.Item
                                                        name={[name, 'paid_amount']}
                                                        label="Paid"
                                                        onChange={(e) => {
                                                            const newValue = e.target.value;
                                                            var formData = form.getFieldsValue();
                                                            if (formData) {
                                                                formData['reversations'][index][`prediente`] = formData['reversations'][index][`product_price`] - newValue;

                                                                const reversations = formData[`reversations`];
                                                                var total_paid_amount = 0, total_amount = 0, tota_prediente = 0;
                                                                for (var i = 0; reversations && i < reversations.length; i++) {
                                                                    var obj = reversations[i];
                                                                    total_paid_amount += parseFloat(obj?.paid_amount || 0);
                                                                    total_amount += parseFloat(obj?.total_price || 0);
                                                                    tota_prediente += parseFloat(obj?.prediente || 0)
                                                                }
                                                                setTotalPaidAmount(total_paid_amount || 0)
                                                                setTotalAllAmount(total_amount || 0)
                                                                setTotalPredienteAmount(tota_prediente || 0)
                                                                form.setFieldsValue(formData)
                                                            }
                                                        }}
                                                        rules={[
                                                            {
                                                                validator: ({ field }, paid_amount,) => {
                                                                    const formValues = form.getFieldsValue();
                                                                    const total_price = formValues?.reversations[index]?.total_price;
                                                                    console.log(typeof total_price, 'total_price,paid_amount', typeof paid_amount);
                                                                    if (parseFloat(paid_amount || 0) > parseFloat(total_price || 0)) {
                                                                        return Promise.reject('Paid amount cannot be greater than total price');

                                                                    }
                                                                    return Promise.resolve();
                                                                },
                                                            }
                                                        ]}
                                                    >
                                                        <Input />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4}>
                                                    <Form.Item
                                                        name={[name, 'total_amount']}
                                                        label="Total"
                                                    >
                                                        <label>${form.getFieldsValue()?.reversations[index]?.total_price || 0}</label>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4}>
                                                    <Form.Item
                                                        name={[name, 'prediente']}
                                                        label="Pending"
                                                    >
                                                        <label>${form.getFieldsValue()?.reversations[index]?.prediente || 0}</label>
                                                    </Form.Item>
                                                </Col>
                                                {!index ? <Col span={8}>
                                                    <Upload
                                                        action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                                                        listType="picture-card"
                                                        fileList={fileList}
                                                        onChange={onChange}
                                                        onPreview={onPreview}
                                                    >
                                                        {fileList.length < 1 && '+ Upload'}
                                                    </Upload>
                                                </Col> : <Col span={8}></Col>}
                                            </>
                                        ))}

                                    </Row>
                                </>
                            )}
                        </Form.List>
                    </Row>
                    <Row>
                        <Col span={4}>
                            Total Payment
                        </Col>
                        <Col span={4}>
                            ${totalPaidAmount}
                        </Col>
                        <Col span={4}>
                            ${totalAllAmount}
                        </Col>
                        <Col span={4}>
                            ${totalPredienteAmount}
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

            </Modal>
            <Modal title={`Please input your comment before cancel.`} onOk={handleCancel} onCancel={() => setIsCancelModal(false)} visible={isCancelModal}>
                <Form>
                    <Form.Item>
                        <TextArea onChange={(e) => setCancelCommit(e?.target?.innerHTML)} />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal title={`Log History`} onCancel={() => setIsLogHistory(false)} visible={isLogHistory}>
                <Table
                    bordered
                    rowKey={(item) => item._id}
                    key={(item) => item._id}
                    dataSource={logHistories || []}
                    columns={logColumns}
                    rowClassName="editable-row"
                />
            </Modal>
            <Table
                bordered
                rowKey={(item) => item._id}
                key={(item) => item._id}
                dataSource={paymentInfo || []}
                columns={Columns}
                rowClassName="editable-row"
                onChange={paginationChange}
                pagination={{
                    total: paymentInfo.length,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    defaultPageSize: 10, // Set the default page size
                }}
            />
        </div>
    );
}

export default CustomerPayment;
