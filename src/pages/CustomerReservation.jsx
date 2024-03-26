import SelectAsync from "@/components/SelectAsync";
import { crud } from "@/redux/crud/actions";
import { selectListsByCustomerContact, } from "@/redux/crud/selectors";
import { request } from "@/request";
import { CheckOutlined, CloseCircleOutlined, DeliveredProcedureOutlined, EditOutlined, FundViewOutlined, MinusCircleOutlined, PlusCircleOutlined, } from "@ant-design/icons";
import { Button, Checkbox, Col, Dropdown, Form, Input, Modal, Pagination, Row, Select, Table, Upload, message } from "antd";
import TextArea from "antd/lib/input/TextArea";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import EditReservationModal from "./EditReservationModal";
import ProductCreationModal from "./ProductCreationModal";
import { sendEmailWithCreation } from "./common";
import PageLoader from '@/components/PageLoader';
import history from "@/utils/history";

const CustomerReservation = ({ parentId: currentCustomerId, isClicked, onIsClickNewReservaChange, customerInfo, setReversationInfo }) => {
    const { id: currentUserId } = JSON.parse(localStorage.auth)
    const entity = 'customerReversation';
    const dispatch = useDispatch();
    const [isEdit, setIsEdit] = useState(false);
    const formRef = useRef(null);
    const [paymentMethodLists, setPaymentMethodLists] = useState([])
    const getPaymentLists = async () => {
        const { result } = await request.listById({ entity: "paymentMethod" });
        setPaymentMethodLists(result || [])
    }
    const handleMenuClick = ({ key }, record) => {
        if (key === `1`) {
            editItem(record)
        } else if (key === `2`) {
            cancelItem(record)
        } else if (key === `3`) {
            deliveredItem(record)
        } else {
            logViewItem(record)
        }
    };
    const _items = [
        {
            label: 'Edit',
            key: 1,
            icon: <EditOutlined />,
        },
        {
            label: 'Cancel',
            key: 2,
            icon: <CloseCircleOutlined />,
        },
        {
            label: 'Delivered',
            key: 3,
            icon: <DeliveredProcedureOutlined />,
        },
        {
            label: 'View Log',
            key: 4,
            icon: <FundViewOutlined />,
        },
    ];
    const Columns = [
        {
            title: 'Id',
            dataIndex: 'reserva_id',
            render: (id, record) => {
                return <label onClick={() => editItem(record)} >R{id}</label>
            }
        },
        {
            title: 'Product',
            dataIndex: ['product_name', `category_name`],
        },
        {
            title: 'Date',
            dataIndex: 'created',
            render: (date) => {
                return moment(new Date(date)).format('DD/MM/YY')
            }
        },
        {
            title: 'Total',
            dataIndex: 'product_price',
            render: (price) => {
                return (parseFloat(price) || 0).toFixed(2)
            }
        },
        {
            title: 'Paid',
            dataIndex: 'paid_amount',
            render: (paid_amount) => {
                return (parseFloat(paid_amount) || 0).toFixed(2)
            }
        },
        {
            title: 'Pending',
            render: (_, obj) => {
                return (parseFloat(obj?.product_price || 0) - parseFloat(obj?.paid_amount || 0)).toFixed(2)
            }
        },
        {
            title: 'Company',
            dataIndex: [`company_name`, `company_name`]
        },
        {
            title: 'Notes',
            dataIndex: 'notes',
        },
        {
            title: 'Status',
            dataIndex: 'is_preventa',
            render: (status, record) => {
                if (record?.status == -1) {
                    return <span className='badge badge-light-danger'>Cancelled</span>
                } else if (record?.status === 2) {
                    return <span className='badge badge-light-warning'>Delivered</span>
                }
                else {
                    if ((status)) {
                        return <span className='badge badge-light-info'>Preventa</span>
                    } else {

                        return <span className='badge badge-light-success'>Active</span>
                    }
                }
            }
        },
        {
            title: 'Actions',
            render: (_, record) => {
                return (
                    <>
                        <Dropdown.Button menu={{ items: _items, onClick: (item) => handleMenuClick(item, record) }}>
                            Action
                        </Dropdown.Button>
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
                return moment(new Date(created)).format('DD/MM/YY')
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
    const deliveredItem = (item) => {
        setDetectSaveData(!detectSaveData)
        dispatch(crud.update({ entity, id: item?._id, jsonData: { status: 2 } }));
        dispatch(crud.create({ entity: 'logHistory', jsonData: { log_id: item?._id, where_: `reserva`, description: "Delivered", user_id: currentUserId } }))
        setTimeout(() => {
            const jsonData = { parent_id: currentCustomerId }
            dispatch(crud.listByCustomerContact({ entity, jsonData }))

        }, 500);
    }
    const handleCancel = () => {
        setDetectSaveData(!detectSaveData)
        if (currentId) {
            const id = currentId;

            const jsonData = { status: -1 }
            dispatch(crud.create({ entity: `logHistory`, jsonData: { description: cancelCommit, log_id: id, where_: "reserva", user_id: currentUserId } }))
            dispatch(crud.update({ entity, id, jsonData }));

            setTimeout(() => {
                const jsonData = { parent_id: currentCustomerId }
                dispatch(crud.listByCustomerContact({ entity, jsonData }))
                setIsCancelModal(false)
            }, [500])
        }
    }
    const [currentId, setCurrentId] = useState('');
    const [isUpdate, setIsUpdate] = useState(false);
    const [parentInfo, setParentInfo] = useState({ name: 33 });
    const [cancelCommit, setCancelCommit] = useState(``);
    const [logHistories, setLogHistories] = useState([]);
    const [customerReservation, setCustomerReservation] = useState([]);
    const [selectedRecord, setSelectedRecord] = useState({});

    const [reserveStatus, setReserveStatus] = useState(false)
    const [emailFooter, setEmailFooter] = useState('')
    const [detectSaveData, setDetectSaveData] = useState(false)
    useEffect(() => {
        if (isClicked) editForm();

        (async () => {
            const { result: companyInfo } = await request.list({ entity: 'companyList' });
            form.setFieldsValue({ company_name: companyInfo[0]?._id })
        })()

        setParentInfo(customerInfo);
        return () => {
            onIsClickNewReservaChange(false)
        }
    }, [isClicked, onIsClickNewReservaChange, customerInfo]);

    const editForm = () => {
        setIsEdit(true);
        setIsUpdate(false);
    }
    const editItem = (item) => {
        setIsEditReserva(true);
        setSelectedRecord(item)
        getPaymentHistories(item)
        setCurrentId(item?._id)
        _editForm.setFieldsValue({ ...item, product_name: item.product_name._id, product_type: item.product_type._id, pending_amount: (item.product_price - item.paid_amount) })
    }
    const logViewItem = async (item) => {

        const currentId = item?._id;
        const jsonData = { log_id: currentId, where_: "reserva" }
        const { result: logData } = await request.listById({ entity: "logHistory", jsonData });
        setLogHistories(logData)
        setIsLogHistory(true)
    }
    const handleBankModal = () => {
        setIsEdit(false)
        setIsEditReserva(false)
    }
    const saveData = async (values) => {
        setReserveStatus(true)
        const parentId = currentCustomerId;
        const { reversations: reservations } = values;
        const reservationsWithParentId = reservations.map((obj) => {
            obj.parent_id = parentId;
            obj.company_name = productType[0]?.company_name?._id;
            obj.user_id = currentUserId;
            obj.is_preventa = obj.is_preventa || false;
            return obj
        });
        const formData = new FormData();
        formData.append('_file', imageUrl);
        formData.append('bulkData', JSON.stringify(reservationsWithParentId));
        const preventMailInfo = [], activeMailInfo = [];
        for (var i = 0; i < reservations.length; i++) {
            var obj = { ...reservations[i] }, reserva_obj = reservations[i];
            for (var j = 0; j < productCategories.length; j++) {
                var product_obj = productCategories[j]
                if (reserva_obj?.product_name === product_obj?._id) {
                    obj['product_info'] = product_obj;
                }
            }
            if (obj?.is_preventa) {
                preventMailInfo.push(obj);
            } else {
                activeMailInfo.push(obj);
            }
        }
        preventMailInfo.length && await sendEmailWithCreation(preventMailInfo, 'preventa', customerInfo);
        activeMailInfo.length && await sendEmailWithCreation(activeMailInfo, 'active', customerInfo);
        dispatch(crud.upload({ entity, jsonData: formData }));
        setDetectSaveData(true)
        setTimeout(() => {
            dispatch(crud.listByCustomerContact({ entity, jsonData: { parent_id: parentId } }));
            setDetectSaveData(false)
            setIsEdit(false)
            setReserveStatus(false)
        }, 500);
    }
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    const [paginations, setPaginations] = useState({ current: 0, count: 0, total: 0, page: 0 });


    useEffect(() => {
        (async () => {
            const { result: items, pagination } = await request.listById({ entity, jsonData: { parent_id: currentCustomerId } });
            const { result } = await request.list({ entity: `logHistory` });
            for (var i = 0; i < items.length; i++) {
                items[i][`reservation_id`] = `R${i + 1}`
                for (var j = 0; j < result.length; j++) {
                    if (items[i].status === -1 && items[i]._id === result[j].log_id) {
                        console.log(items[i].status === -1, items[i]._id === result[j].log_id);
                        items[i][`notes`] = result[j][`description`];
                    }
                }
            }
            items.sort((a, b) => b.reserva_id - a.reserva_id)
            setReversationInfo([...items]);
            setCustomerReservation([...items]);
            setPaginations(pagination);
        })()
        getPaymentLists()
    }, [detectSaveData]);
    const [form] = Form.useForm();
    const [_editForm] = Form.useForm();
    const [totalPaidAmount, setTotalPaidAmount] = useState(0);
    const [totalAllAmount, setTotalAllAmount] = useState(0);
    const [totalPredienteAmount, setTotalPredienteAmount] = useState(0);
    const [isCancelModal, setIsCancelModal] = useState(false)
    const [isLogHistory, setIsLogHistory] = useState(false);
    const [fileList, setFileList] = useState([
    ]);
    const [productCategories, setProductCategories] = useState([]);
    const [originProductCategories, setOriginProductCategories] = useState([]);
    const [originProductTypes, setOriginProductTypes] = useState([]);

    const [newCategory, setNewCategory] = useState(``);
    const [isEditReserva, setIsEditReserva] = useState(false)
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [productObj, setProductObj] = useState(false);
    const [currentFile, setCurrentFile] = useState();
    const onChange = ({ fileList: newFileList }) => {
        console.log(newFileList)
        setCurrentFile(newFileList[0]?.originFileObj)
        setFileList(newFileList);
    };
    const onPreview = async (file) => {
        console.log(file, `1111`);
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
    const getProductCategories = async () => {
        const { result } = await request.list({ entity: `productCategories` });
        setOriginProductCategories(result);
        setProductCategories(result);

    };
    const saveCategory = async (index) => {
        if (!(form.getFieldsValue()?.reversations && form.getFieldsValue()?.reversations[index].product_type)) {
            return message.warning("Please select Type.")
        }
        if (newCategory) {
            const { reversations } = form.getFieldsValue();
            setProductObj({ ...reversations[index], category_name: newCategory })
            setIsModalVisible(true)
        }

    }
    const handleSearch = (values) => {
        setNewCategory(values)
    }
    const [paymentHistories, setPaymentHistories] = useState([])
    const getPaymentHistories = async (item) => {
        const { result } = await request.listById({ entity: 'paymentHistory', jsonData: { reserva_id: item?._id } });
        setPaymentHistories(result || [])
    }


    useEffect(async () => {
        const { result } = await request.list({ entity: 'systemInfo' });
        setEmailFooter(result[0]?.email_footer)

        const id = currentCustomerId;
        const jsonData = { parent_id: id }
        dispatch(crud.listByCustomerContact({ entity, jsonData }));
        getProductCategories();
        document.title = "CustomerDetails"
    }, []);

    const [productType, setProductType] = useState('')
    const handleCompanyType = async (value) => {
        const { result } = await request.list({ entity: `productTypes` });

        setOriginProductTypes(result)
        const productTypes = result.filter((obj) => {
            if (obj?._id === value) {
                return obj;
            }
        })
        setProductType(productTypes);

        const productList = originProductCategories.filter((obj) => {
            if (obj?.product_type?._id === value) {
                return obj;
            }
        })
        console.log(productList, `productList`);
        setProductCategories(productList);
    }
    const handlePriceChange = (newValue, index) => {
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
    }
    const handlePaidChange = (newValue, index) => {
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
    }
    const [checked, setChecked] = useState(false);
    const Footer = useCallback(() => {
        const pages = paginations
        const { current, count, total, page } = pages
        const currentPage = current || page;
        const totalSize = total || count;
        return (
            <>
                Showing {customerReservation.length ? ((currentPage - 1) * 10 + 1) : 0} to {currentPage * 10 > (totalSize) ? (totalSize) : currentPage * 10} of {totalSize} entries
            </>
        );
    }, [paginations, customerReservation])
    const paginationChange = useCallback((page) => {
        setPaginations({ ...page, })
    }, [])
    const inputRef = useRef(null);
    const [imageUrl, setImageUrl] = useState('')

    function loadBlobImageSrc(blob) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (data) => {
                resolve(data.target.result);
            };
            reader.readAsDataURL(blob);
        });
    }

    document.body.addEventListener("paste", (event) => {
        const clipboardData = event.clipboardData || event.originalEvent.clipboardData;
        const imageItem = [...clipboardData.items].find((item) =>
            item.type.includes("image/")
        );

        if (!imageItem) {
            console.log("No image items in clipboard");
            return;
        }

        const blob = imageItem.getAsFile();

        if (blob === null) {
            console.log("Can not get image data from clipboard item");
            return;
        }

        loadBlobImageSrc(blob).then((src) => {
            setImageUrl(src);
        });
    });


    return (

        <div className="whiteBox shadow">

            <Modal title="New Reserva" visible={isEdit} onCancel={handleBankModal} footer={null} width={1000} >
                {
                    !reserveStatus ? <Form
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
                            name: parentInfo?.name,
                            email: parentInfo?.email,
                            iguser: parentInfo?.iguser
                        }}
                    >
                        <Row>
                            <Col span={5}>
                                <Form.Item
                                    name={'name'}
                                    label="Name"
                                    wrapperCol={24}
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Input disabled />
                                </Form.Item>
                            </Col>
                            <Col span={1}></Col>

                            <Col span={5}>
                                <Form.Item
                                    name={'email'}
                                    label="Email"
                                    wrapperCol={24}
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Input disabled />
                                </Form.Item>
                            </Col>
                            <Col span={1}></Col>
                            <Col span={5}>
                                <Form.Item
                                    name={'iguser'}
                                    label="IG"
                                    wrapperCol={24}
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Input disabled />
                                </Form.Item>
                            </Col>
                            <Col span={1}></Col>

                            <Col span={5}>
                                <Form.Item
                                    name={'company_name'}
                                    label="Company Name"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <div className="ant-input ant-input-disabled" style={{ minHeight: '30px' }} > {productType[0]?.company_name?.company_name}</div>
                                </Form.Item>
                            </Col>

                        </Row>
                        <div className="opacity-25 bg-dark rounded h-1px w-100 mb-5 mt-5" style={{ "backgroundColor": "rgb(43 43 43)" }}></div>
                        <Row>
                            <Col span={4}><span style={{ color: 'red' }}>*</span> Product Type</Col>
                            <Col span={4}><span style={{ color: 'red' }}>*</span> Product</Col>
                            <Col span={3}><span style={{ color: 'red' }}>*</span>  Price</Col>
                            <Col span={3}>Preventa</Col>
                            <Col span={3}>Notes</Col>
                            <Col span={4}>Methods</Col>
                            <Col span={3}>action</Col>
                            <Form.List name="reversations" initialValue={[{}]}>
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(({ key, name, ...restField }, index) => (
                                            <Row key={key} style={{ display: 'flex', justifyContent: 'space-around', width: '100%', height: '35px' }} >
                                                <Col span={4}>
                                                    <Form.Item
                                                        name={[name, `product_type`]}
                                                        rules={[
                                                            {
                                                                required: true,
                                                            },
                                                        ]}
                                                    >

                                                        <SelectAsync entity={'productTypes'} displayLabels={['product_name']} onChange={handleCompanyType} />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4}>

                                                    <Form.Item

                                                        {...restField}
                                                        name={[name, `product_name`]}
                                                        rules={[
                                                            {
                                                                required: true,
                                                            },
                                                        ]}

                                                    >
                                                        <Select
                                                            onSearch={handleSearch}
                                                            showSearch
                                                            notFoundContent={<Button type="primary" onClick={(e) => saveCategory(index)}>
                                                                <CheckOutlined />
                                                            </Button>}
                                                            optionFilterProp="children"
                                                            onChange={(value) => {
                                                                const { category_name, product_price } = productCategories.find((obj) => {
                                                                    if (obj._id === value) {
                                                                        return obj
                                                                    }
                                                                })
                                                                var formData = form.getFieldsValue();
                                                                if (formData) {
                                                                    formData['reversations'][index][`payment_name`] = category_name;
                                                                    formData['reversations'][index][`product_price`] = product_price;
                                                                    form.setFieldsValue(formData)
                                                                    handlePriceChange(product_price, index);
                                                                    handlePaidChange(formData['reversations'][index][`paid_amount`], index)
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
                                                </Col>
                                                <Col span={3}>
                                                    <Form.Item

                                                        {...restField}
                                                        name={[name, `product_price`]}
                                                        rules={[
                                                            {
                                                                required: true,
                                                            },
                                                        ]}
                                                        onChange={(e) => {
                                                            const newValue = e.target.value;
                                                            handlePriceChange(newValue, index)

                                                        }}
                                                    >
                                                        <Input prefix="$" />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={2}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, `is_preventa`]}
                                                        valuePropName="checked"
                                                    >
                                                        <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)}>Yes</Checkbox>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={3}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, `notes`]}
                                                    >
                                                        <Input />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4}>
                                                    <Form.Item name={[name, `method`]} rules={[
                                                        {
                                                            required: true,
                                                        },
                                                    ]}>
                                                        <Select
                                                        >
                                                            {[...paymentMethodLists].map((data) => {
                                                                return (
                                                                    <Select.Option
                                                                        value={data?._id}
                                                                    >{data?.method_name} </Select.Option>
                                                                );
                                                            })}
                                                        </Select>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={3}>
                                                    <Form.Item

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
                                                        <PlusCircleOutlined onClick={() => add()} />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        ))}
                                        <div className="opacity-25 bg-dark rounded h-1px w-100 mb-5 mt-5" style={{ "backgroundColor": "rgb(43 43 43)" }}></div>
                                        <Row gutter={24} style={{ display: 'flex', justifyContent: 'space-around', width: '80%' }}>
                                            {fields.map(({ key, name, ...restField }, index) => (
                                                <React.Fragment key={key}>
                                                    <Col span={6}>

                                                        <Form.Item
                                                            {...restField}
                                                            wrapperCol={24}
                                                            name={[name, 'payment_name']}
                                                            label={!index && "Product"}
                                                        >
                                                            <label>{form?.getFieldsValue()?.reversations && form?.getFieldsValue()?.reversations[index]?.payment_name}</label>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={6}>

                                                        <Form.Item
                                                            {...restField}
                                                            name={[name, 'paid_amount']}
                                                            label={!index && "Paid"}
                                                            onChange={(e) => {
                                                                const newValue = e.target.value;
                                                                handlePaidChange(newValue, index)
                                                            }}
                                                            rules={[
                                                                {
                                                                    validator: ({ field }, paid_amount,) => {
                                                                        const formValues = form.getFieldsValue();
                                                                        const total_price = formValues?.reversations[index]?.total_price;
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
                                                    <Col span={6}>

                                                        <Form.Item
                                                            {...restField}
                                                            name={[name, 'total_amount']}
                                                            label={!index && "Total"}
                                                        >
                                                            <label>${(form.getFieldsValue()?.reversations && (form.getFieldsValue()?.reversations[index]?.total_price || 0))}</label>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={6}>

                                                        <Form.Item
                                                            {...restField}
                                                            name={[name, 'Pending']}
                                                            label={!index && "Pending"}
                                                        >
                                                            <label>${(form.getFieldsValue()?.reversations && (form.getFieldsValue()?.reversations[index]?.prediente || 0))}</label>
                                                        </Form.Item>
                                                    </Col>
                                                </React.Fragment>
                                            ))}
                                        </Row>
                                        <Row style={{ width: `20%`, height: '100%' }}>
                                            {imageUrl == '' ?
                                                <Upload
                                                    width="100%" height='100%'
                                                    listType="picture-card"
                                                    fileList={fileList}
                                                    onChange={onChange}
                                                    onPreview={onPreview}
                                                >
                                                    {fileList.length < 1 && '+ Upload'}
                                                </Upload>
                                                : <img src={imageUrl} onChange={onChange} onPaste={onChange} width="70%" height='100%' alt='' />}
                                        </Row>
                                    </>
                                )}
                            </Form.List>
                        </Row>
                        <Row style={{ display: `flex`, justifyContent: 'space-around', width: '80%' }}>
                            <Col span={6}>
                                <h3>Total Payment</h3>
                            </Col>
                            <Col span={6}>
                                <h3>${totalPaidAmount.toFixed(2)}</h3>
                            </Col>
                            <Col span={6}>
                                <h3>${totalAllAmount.toFixed(2)}</h3>
                            </Col>
                            <Col span={6}>
                                <h3>${totalPredienteAmount.toFixed(2)}</h3>
                            </Col>
                        </Row>
                        <div className="opacity-25 bg-dark rounded h-1px w-100 mb-5 mt-5" style={{ "backgroundColor": "rgb(43 43 43)" }}></div>
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
                    </Form> : <PageLoader />
                }

            </Modal>
            <Modal title={`Please input your comment before cancel.`} onOk={handleCancel} onCancel={() => setIsCancelModal(false)} visible={isCancelModal}>
                <Form >
                    <Form.Item>
                        <TextArea onChange={(e) => setCancelCommit(e?.target?.innerHTML)} />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal title={`Log History`} footer={null} onCancel={() => setIsLogHistory(false)} visible={isLogHistory}>
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
                dataSource={customerReservation || []}
                columns={Columns}
                rowClassName="editable-row"
                pagination={{
                    total: customerReservation.length,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    defaultPageSize: 10, // Set the default page size
                }}
                onChange={paginationChange}
            />
            <EditReservationModal setDetectSaveData={setDetectSaveData} detectSaveData={detectSaveData} isEditReserva={isEditReserva} setIsEditReserva={(value) => { setIsEditReserva(value) }} customerInfo={customerInfo} currentItem={selectedRecord} currentCustomerId={currentCustomerId} />
            <ProductCreationModal productInfo={productObj} thirdParty={true} isModalVisible={isModalVisible} setIsModalVisible={(value) => {
                setIsModalVisible(value);
                getProductCategories();
                form.resetFields([`product_type`, `product_name`])
            }} />

        </div>
    );
}
export default CustomerReservation;