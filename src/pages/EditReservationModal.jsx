import moment from "moment";
import CustomerModal from "./CustomerModal";
import ProductCreationModal from "./ProductCreationModal";
import { sendEmailWithCreation, priceFormat, dateFormat } from "./common";
const { default: SelectAsync } = require("@/components/SelectAsync");
const { crud } = require("@/redux/crud/actions");
const { request } = require("@/request");
const { CheckOutlined, EditFilled, PlusCircleOutlined } = require("@ant-design/icons");
const { Button, Form, Table, Statistic, Col, Row, Input, Checkbox, Select, Modal, message } = require("antd");
const { useForm } = require("antd/lib/form/Form");
const { useEffect, useState, useCallback } = require("react");
const { useDispatch } = require("react-redux");
const { id: currentUserId } = JSON.parse(localStorage.auth)

const EditReservationModal = ({ setDetectSaveData, detectSaveData, currentItem, customerInfo, currentCustomerId, isEditReserva, setIsEditReserva }) => {
    const paymentHistoryColumn = [
        {
            title: 'Payment Id',
            dataIndex: 'payment_id',
            render: (id) => {
                return `R${id}`
            }
        },
        {
            title: 'Date',
            dataIndex: 'created',
            render: (created) => {
                return moment(new Date(created)).format('DD/MM/YY HH:mm A')
            }
        },
        {
            title: 'Total',
            dataIndex: 'amount',
        },
        {
            title: 'User',
            dataIndex: [`user_id`, `name`]
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (status) => {

                if (status === -1) {
                    return <span className='badge badge-light-danger'>Cancelled</span>
                } else if (status === 1) {
                    return <span className='badge badge-light-success'>Active</span>
                } else {
                    return <span className='badge badge-light-primary'>Completed</span>
                }
            }
        },

    ];
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const [isCustomerUpdate, setIsCustomerUpdate] = useState(false);
    const [productCategories, setProductCategories] = useState([]);
    const [originProductCategories, setOriginProductCategories] = useState([]);
    const [newCategory, setNewCategory] = useState(``);
    const [paymentHistories, setPaymentHistories] = useState([])
    const [currentId, setCurrentId] = useState(``);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [productObj, setProductObj] = useState(false);
    const [isPreventa, setIsPreventa] = useState(false);
    const [productTypes, setProductTypes] = useState([]);
    const [_editForm] = useForm();
    const [isTax, setIsTax] = useState(false);
    const [taxPercent, setTaxPercent] = useState(0);

    const handleBankModal = () => {
        setIsEditReserva(false)
    }
    const editedDataSave = async (values) => {
        const id = currentId;
        if (currentId) {
            console.log("-", currentItem, currentId, values, customerInfo, 'currentId');
            console.log(isPreventa, !values?.is_preventa);
            if (isPreventa && !values?.is_preventa) {
                const mailInfo = [];
                for (var i = 0; i < productCategories.length; i++) {
                    const obj = productCategories[i];
                    if (values?.product_name) {
                        mailInfo.push({ ...values, product_info: obj });
                    }
                }
                await sendEmailWithCreation(mailInfo, 'active_from_preventa', customerInfo)
            }
            dispatch(crud.update({ entity: `customerReversation`, id, jsonData: values }));

            let descriptionStr = "Edited";
            if (currentItem?.product_price !== values?.product_price)
                descriptionStr = "Price Edited $" + priceFormat(currentItem.product_price) + " - $" + priceFormat(values?.product_price);
            await request.create({ entity: 'logHistory', jsonData: { log_id: id, where_: `reserva`, description: descriptionStr, user_id: currentUserId } })

            dispatch(crud.listByCustomerContact({ entity: `customerReversation`, jsonData: { parent_id: currentCustomerId } }));
            setIsEditReserva(false);
            setDetectSaveData(!detectSaveData);
        }
    }
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    const editCustomer = () => {
        setIsOpen(true)
        setIsCustomerUpdate(true)
    }
    const handleCustomerModal = () => {
        setIsOpen(false)
    }
    const setCustomerInfo = (value) => {
        console.log(_editForm.getFieldsValue(), value);
        _editForm.setFieldsValue(value)
    }
    const getProductCategories = async () => {
        const { result } = await request.list({ entity: `productCategories` });
        setProductCategories(result)
        setOriginProductCategories(result);
    };
    const getProductTypes = async () => {
        const { result } = await request.list({ entity: `productTypes` });
        setProductTypes(result)
    };
    const saveCategory = async (index) => {
        if (!_editForm.getFieldsValue()?.product_type) {
            return message.warning("Please select type.");
        }
        if (newCategory) {
            setProductObj({ ..._editForm.getFieldsValue(), category_name: newCategory, product_price: null });
            setIsModalVisible(true)
            // await request.create({ entity: `productCategories`, jsonData: { category_name: newCategory } });
            // getProductCategories();
        }

    }
    const handleSearch = (values) => {
        setNewCategory(values)
    }
    const getPaymentHistories = async (item) => {
        const { result } = await request.listById({ entity: 'paymentHistory', jsonData: { 'reservation.reserva_id': item?._id } });

        const paymentHistories = result.map(column => ({
            ...column,
            amount: priceFormat(column.reservation.find(item => item._id === item?._id)?.amount || 0)
        }));
        setPaymentHistories(paymentHistories || [])
    }

    useEffect(() => {
        (async () => {
            const { result: taxInfo } = await request.list({ entity: "systemInfo" });
            if (taxInfo?.length) setTaxPercent(taxInfo[0]?.tax_percent)
            else setTaxPercent(0);
        })()

    }, []);
    useEffect(() => {
        (async () => {
            getPaymentHistories(currentItem)
            await getProductTypes();
            await getProductCategories();
            setCurrentId(currentItem?._id);
            setIsPreventa(currentItem?.is_preventa)
            _editForm.setFieldsValue(
                {
                    ...currentItem,
                    product_name: currentItem?.product_name?._id,
                    product_type: currentItem?.product_type?._id,
                    pending_amount: isTax ? (currentItem?.product_price - currentItem?.paid_amount + currentItem?.product_price * taxPercent / 100) : currentItem?.product_price - currentItem?.paid_amount,
                    tax_price: isTax ? (currentItem?.product_price * taxPercent / 100) : 0,
                    total_amount: isTax ? (parseFloat(currentItem?.product_price) + currentItem?.product_price * taxPercent / 100) : currentItem?.product_price,
                });
            const filteredProduct = [...originProductCategories.filter(obj => { if (currentItem?.product_type?._id == obj?.product_type?._id) return obj })]
            setProductCategories([...filteredProduct])
        })()
    }, [isEditReserva, currentItem, _editForm]);
    const handleProductType = (value) => {
        const productList = originProductCategories.filter((obj) => {
            if (obj?.product_type?._id === value) {
                return obj;
            }
        })
        const selectedProductType = productTypes.find((obj) => (obj?._id === value))

        setProductCategories(productList);
        // if (productList.length > 0)
        //     _editForm.setFieldsValue({ product_name: productList[0]?._id })
        _editForm.setFieldsValue({ company_name: selectedProductType?.company_name })

    }

    const addTaxPercent = useCallback((checked) => {
        setIsTax(checked)
        const getFormData = _editForm.getFieldsValue();
        getFormData['pending_amount'] = checked ? (getFormData['product_price'] - getFormData['paid_amount'] + getFormData['product_price'] * taxPercent / 100) : (getFormData['product_price'] - getFormData['paid_amount']);
        getFormData['tax_price'] = checked ? (getFormData['product_price'] * taxPercent / 100) : 0;
        getFormData['total_amount'] = checked ? (parseFloat(getFormData['product_price']) + getFormData['product_price'] * taxPercent / 100) : getFormData['product_price'];
        _editForm.setFieldsValue(getFormData)
    }, [taxPercent])
    const [checked, setChecked] = useState(false);
    return (
        <>
            <Modal title={<>Edit Reserve
                <span style={{ float: 'right', margin: '0px 20px', fontSize: 'large' }}> R{currentItem.reserva_id} | {dateFormat(currentItem.created)}</span>

            </>} open={isEditReserva} onCancel={handleBankModal} footer={null} width={1000}>
                <Form
                    className="ant-advanced-search-form"
                    form={_editForm}
                    name="basic"
                    layout="vertical"
                    wrapperCol={{
                        span: 24,
                    }}
                    onFinish={editedDataSave}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                    initialValues={{
                        name: customerInfo?.name,
                        email: customerInfo?.email,
                        iguser: customerInfo?.iguser
                    }}
                >
                    <Row style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                        <Form.Item
                            style={{ width: `24%` }}
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
                        <Form.Item
                            style={{ width: `24%` }}
                            name={'email'}
                            label="Email"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                        >
                            <Input disabled prefix={<EditFilled onClick={editCustomer} />} />
                        </Form.Item>
                        <Form.Item
                            style={{ width: `24%` }}
                            name={'iguser'}
                            label="IG"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                        >
                            <Input disabled prefix={<EditFilled onClick={editCustomer} />} />
                        </Form.Item>
                        <Form.Item
                            style={{ width: `24%` }}
                            name={'company_name'}
                            label="Company"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                        >
                            <SelectAsync disabled entity={`companyList`} displayLabels={[`company_name`]} />
                        </Form.Item>
                    </Row>
                    <Row style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                        <Form.Item
                            style={{ width: '20%' }}
                            wrapperCol={24}
                            label="Product Type"
                            name={`product_type`}
                            rules={[
                                {
                                    required: true
                                }
                            ]}
                        >
                            <SelectAsync onChange={handleProductType} entity={`productTypes`} displayLabels={['product_name']} />
                        </Form.Item>
                        <Form.Item
                            style={{ width: '20%' }}
                            wrapperCol={24}
                            label="Product"
                            name={`product_name`}
                        >
                            <Select
                                onSearch={(value) => setNewCategory(value)}
                                showSearch
                                optionFilterProp="children"
                                notFoundContent={<Button type="primary" onClick={(e) => {
                                    saveCategory()
                                }}>
                                    <PlusCircleOutlined />
                                </Button>}
                                onChange={(value) => {
                                    const { product_price } = productCategories.find((obj) => {
                                        if (obj._id === value) {
                                            return obj
                                        }
                                    })
                                    var getFormData = _editForm.getFieldsValue();
                                    if (getFormData) {
                                        getFormData[`product_price`] = product_price;
                                        getFormData['pending_amount'] = isTax ? (parseFloat(product_price) - getFormData['paid_amount'] + product_price * taxPercent / 100) : (parseFloat(product_price) - getFormData['paid_amount']);
                                        getFormData['tax_price'] = isTax ? (product_price * taxPercent / 100) : 0;
                                        getFormData['total_amount'] = isTax ? (parseFloat(product_price) + product_price * taxPercent / 100) : product_price;
                                        _editForm.setFieldsValue(getFormData)
                                    }
                                }}
                            >
                                {[...productCategories].map((optionField) => (
                                    <Select.Option
                                        key={optionField[`_id`]}
                                        value={optionField[`_id`]}
                                    >
                                        {optionField[`category_name`]}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            style={{ width: '20%' }}
                            wrapperCol={24}
                            label="Price"
                            name={`product_price`}
                            rules={[
                                {
                                    required: true,
                                    validator: ({ field }, product_price,) => {
                                        const getFormData = _editForm.getFieldsValue();
                                        getFormData['pending_amount'] = isTax ? (parseFloat(product_price) - getFormData['paid_amount'] + product_price * taxPercent / 100) : (product_price - getFormData['paid_amount']);
                                        getFormData['tax_price'] = isTax ? (product_price * taxPercent / 100) : 0;
                                        getFormData['total_amount'] = isTax ? (parseFloat(product_price) + product_price * taxPercent / 100) : product_price;
                                        _editForm.setFieldsValue(getFormData)
                                        if (parseFloat(getFormData['paid_amount'] || 0) > parseFloat(product_price || 0)) {
                                            return Promise.reject('Paid amount cannot be greater than total price');

                                        }
                                        return Promise.resolve();
                                    },
                                }
                            ]}
                        >
                            <Input prefix="$" />
                        </Form.Item>
                        <Form.Item
                            // wrapperCol={24}
                            label="Tax"
                            name={`is_tax`}
                            valuePropName="checked"
                            style={{ width: '5%' }}
                        >
                            <Checkbox checked={isTax} onChange={(e) => addTaxPercent(e.target.checked)}></Checkbox>
                        </Form.Item>
                        <Form.Item
                            // wrapperCol={24}
                            label="Preventa"
                            name={`is_preventa`}
                            valuePropName="checked"
                            style={{ width: '5%' }}
                        >
                            <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)}></Checkbox>
                        </Form.Item>
                        <Form.Item
                            style={{ width: '25%' }}
                            wrapperCol={24}
                            label="Notes"
                            name={`notes`}
                        >
                            <Input />
                        </Form.Item>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <h2>Payment Details</h2>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={5}>
                            <Form.Item name={`product_price`}>
                                <Statistic title="Subtotal Amount" prefix={`$`} formatter={value => priceFormat(value)} />
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            {
                                isTax &&
                                <Form.Item name={`tax_price`}>
                                    <Statistic title="Tax Amount" prefix={`$`} formatter={value => priceFormat(value)} />
                                </Form.Item>
                            }
                        </Col>
                        <Col span={5}>
                            <Form.Item name={`total_amount`}>
                                <Statistic title="Total Amount" prefix={`$`} formatter={value => priceFormat(value)} />
                            </Form.Item>
                        </Col>
                        <Col span={5}>
                            <Form.Item name={`paid_amount`}>
                                <Statistic title="Paid Amount" prefix={`$`} formatter={value => priceFormat(value)} />
                            </Form.Item>
                        </Col>
                        <Col span={5}>
                            <Form.Item name={`pending_amount`}>
                                <Statistic title="Pending Amount" prefix={`$`} formatter={value => priceFormat(value)} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <h2>Payment History</h2>
                        </Col>
                    </Row>
                    <Table
                        bordered
                        rowKey={(item) => item._id}
                        key={(item) => item._id}
                        dataSource={paymentHistories || []}
                        columns={paymentHistoryColumn}
                        rowClassName="editable-row"
                    />

                    <Form.Item
                        className="mt-5"
                        wrapperCol={{
                            offset: 8,
                            span: 16,
                        }}
                    >
                        <Button type="primary" htmlType="submit">
                            Save
                        </Button>
                        &nbsp;
                        <Button type="ghost" onClick={handleBankModal}>
                            cancel
                        </Button>
                    </Form.Item>
                </Form>

            </Modal >
            <ProductCreationModal thirdParty={true} productInfo={productObj} isModalVisible={isModalVisible} setIsModalVisible={(value) => {
                setIsModalVisible(value);
                getProductCategories();
                _editForm.resetFields([`product_type`, `product_name`])
            }} />
            <CustomerModal setCustomerInfo={setCustomerInfo} isEditWithReserva={true} isUpdate={isCustomerUpdate} isOpen={isOpen} parentId={currentCustomerId} handleCustomerModal={handleCustomerModal} customerInfo={customerInfo} />
        </>

    );
}
export default EditReservationModal