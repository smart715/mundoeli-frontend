import { request } from '@/request';
import { CiCircleOutlined, SearchOutlined, DeleteOutlined, IssuesCloseOutlined, LogoutOutlined, MinusCircleOutlined, MinusOutlined, PlusCircleOutlined, ScanOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Layout, Modal, PageHeader, Select, Input, notification, Row, Col } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import _, { filter } from 'lodash'

import { priceFormat, userId } from './common';
import { DashboardLayout } from '@/layout';
import history from '@/utils/history';
import CheckoutData from './RdCheckout/CheckoutData';
import { checkout } from '@/redux/checkout/actions';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { BASE_URL } from '@/config/serverApiConfig';

import { useForm } from 'antd/lib/form/Form';
import { crud } from '@/redux/crud/actions';

const CheckoutPage = () => {
    const [productCategories, setProductCategories] = useState([]);
    const [productLists, setProductLists] = useState([]);
    const [orderLists, setOrderLists] = useState([]);
    const [companyLists, setCompanyLists] = useState([]);
    const [finalOrders, setFinalOrders] = useState([]);
    const [editFinalOrderIdx, setEditFinalOrderIdx] = useState('');
    const [totalOrderPrice, setTotalOrderPrice] = useState(0);
    const [taxPercent, setTaxPercent] = useState(0);
    const [totalPriceWithTax, setTotalPriceWithTax] = useState(0);
    const [taxPrice, setTaxPrice] = useState(0);
    const [taxStatus, setTaxStatus] = useState(true);
    const [paymentMethodLists, setPaymentMethodLists] = useState([])
    const [isCashSelected, setIsCashSelected] = useState(true);
    const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(null);
    const [selectedCompanyIdx, setSelectedCompanyIdx] = useState(null);
    const [selectedProductTypeIdx, setSelectedProductTypeIdx] = useState(null);
    const [clickedIndex, setClickedIndex] = useState(null);
    const [methodDescription, setMethodDescription] = useState(null);
    const [primaryCompany, setPrimaryCompany] = useState(false);
    const [companyName, setCompanyName] = useState('');
    const [productName, setProductName] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderItem, setOrderItem] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [customerData, setCustomerData] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [pendingProductList, setPendingProductList] = useState([]);
    const [totalPaidAmount, setTotalPaidAmount] = useState(0);
    const [totalAllAmount, setTotalAllAmount] = useState(0);
    const [totalPredienteAmount, setTotalPredienteAmount] = useState(0);
    const [totalPreviousAmount, setTotalPreviousAmount] = useState(0);
    const [isPendingPayment, setIsPendingPayment] = useState(false);
    const [reservationList, setReservationList] = useState([]);
    const [cashAmount, setCashAmount] = useState(0);

    const handleSubmitFunc = (value) => {
        console.log("handleSubmitFunc", value);
        setReservationList(value);
        setIsPendingPayment(false);
    }
    const handleCloseFunc = (value) => {
        setIsPendingPayment(value)
        setReservationList([]);
    }
    const getCustomerData = async () => {
        const { result } = await request.list({ entity: `client` });

        setCustomerData(result || [])
        console.log("customerData", customerData);
    };

    useEffect(() => {
        if (selectedCustomerId && selectedCustomerId !== '') {
            handleProductList(selectedCustomerId)
        }
    }, [customerData, selectedCustomerId]);

    const handleProductList = async (customer_id) => {
        if (customer_id === '') return;
        const { result: reservations } = await request.listById({ entity: 'customerReversation', jsonData: { parent_id: customer_id, status: 1 } });
        const { result: paymentHistories } = await request.listById({ entity: 'paymentHistory', jsonData: { customer_id } });
        var total_amount = 0, pending_amount = 0, newPayments = [], prev_amount = 0;
        for (var i = 0; i < [...reservations].length; i++) {
            var obj = { ...reservations[i] };
            for (var j = 0; j < [...paymentHistories].length; j++) {
                var payObj = { ...paymentHistories[j] };
                for (var l = 0; l < payObj?.reservation?.length; l++) {
                    var _obj = payObj?.reservation[l];
                    if (obj?._id === _obj?.reserva_id?._id) {
                        // obj[`paid_amount`] = parseFloat(obj[`paid_amount`]) + parseFloat(_obj?.amount);
                        obj[`paid_amount`] = parseFloat(obj[`paid_amount`]);
                    }
                }

            }
            obj[`pending_amount`] = parseFloat(obj[`product_price`]) - parseFloat(obj[`paid_amount`])
            if (obj[`pending_amount`] > 0) {
                total_amount += parseFloat(obj?.product_price || 0) || 0
                pending_amount += parseFloat(obj?.product_price - obj?.paid_amount) || 0;
                prev_amount += parseFloat(obj?.paid_amount);
                newPayments.push({ ...obj })
            }
        }
        setPendingProductList([...newPayments])
        setTotalPreviousAmount(prev_amount)
        setTotalAllAmount(total_amount);
        setTotalPredienteAmount(pending_amount)

    }
    const getProductCategory = async () => {
        const { result } = await request.list({ entity: "productTypes" });
        setProductCategories(result || []);
        return result || [];
    }
    const getProductLists = async (type_id) => {
        const { result } = await request.listById({ entity: "checkoutProductLists", jsonData: { product_type: type_id } });
        setProductLists(result || [])
        setSelectedProductTypeIdx(type_id)
        return result || [];

    }
    const getCompanyLists = async (type_id) => {
        const { result } = await request.listById({ entity: "companyList", options: { orderBy: 'asc' } });
        setCompanyLists(result || [])
    }
    const getPaymentLists = async () => {
        const { result } = await request.listById({ entity: "paymentMethod", options: { orderBy: 'asc' } });
        setPaymentMethodLists(result || [])
        const methodId = result.reduce((primaryID, method) => {
            if (method.primary) {
                primaryID = method._id;
            }
            return primaryID;
        }, null);
        setSelectedPaymentMethodId(methodId);
    }
    const addToOrders = async (item) => {
        // if (primaryCompany) {
        if (item?.product_type?.company_name?.primary) {
            // setProductName(item.product_name)
            setOrderLists([...orderLists, item]);
        } else {
            setOrderItem(item)
            setIsModalOpen(true)
        }

    }
    const _minusToPendings = async (id) => {
        const index = _.findIndex(reservationList, (obj) => obj.reserva_id === id);
        if (index !== -1) {
            reservationList.splice(index, 1);
        }
        setReservationList([...reservationList]);
    }
    const _minusToOrders = async (id) => {
        const index = _.findIndex(orderLists, (obj) => obj._id === id);
        if (index !== -1) {
            orderLists.splice(index, 1);
        }
        setOrderLists([...orderLists]);
    }
    const getProductListsWithCompany = async (company_id, primary, company_name) => {
        setPrimaryCompany(primary)
        setCompanyName(company_name)
        const _categories = await getProductCategory();
        const filterProducts = _.filter(_categories, obj => obj?.company_name?._id === company_id)
        setProductCategories([...filterProducts]);
        setSelectedCompanyIdx(company_id)
    }
    const addTaxPercent = useCallback((checked) => {
        setTaxStatus(checked)
        if (checked) {
            const taxValue = priceFormat(parseFloat(taxPercent / 100) * totalOrderPrice);
            const updatedTotal = priceFormat(Number(taxValue) + Number(totalOrderPrice))
            setTaxPrice(taxValue)
            setTotalPriceWithTax(updatedTotal);
        } else {
            setTaxPrice('0.00');
            setTotalPriceWithTax(totalOrderPrice)
        }
    }, [taxPercent, totalOrderPrice])
    useEffect(() => {
        getProductCategory();
        getProductLists();
        getPaymentLists();
        getCompanyLists();
        addTaxPercent(true);
        getCustomerData();
        (async () => {
            const { result: taxInfo } = await request.list({ entity: "systemInfo" });
            if (taxInfo?.length) setTaxPercent(taxInfo[0]?.tax_percent)
            else setTaxPercent(0);
        })()

    }, []);
    useEffect(() => {
        const groupedOrders = _.groupBy(orderLists, '_id');
        var data = [], total_price = 0;
        console.log("groupedOrders", groupedOrders);
        for (var key in groupedOrders) {
            const count = groupedOrders[key].length;
            // const product_price = priceFormat(priceFormat(groupedOrders[key][0]?.product_price) * count);
            const product_price = priceFormat(groupedOrders[key][0]?.product_price);
            total_price += parseFloat(groupedOrders[key][0]?.product_price * count);
            const product_name = (groupedOrders[key][0]?.product_type?.product_name) + ' | ' + (groupedOrders[key][0]?.product_name);
            const product_description = (groupedOrders[key][0]?.description)
            data.push({ _id: key, count, product_price, product_name, product_description, reserva_id: -1 })
        }
        reservationList.map((payment) => {
            if (payment.amount > 0) {
                total_price += parseFloat(payment.amount);
                data.push({ _id: payment.reserva_id, count: '', product_price: payment.amount, product_name: payment.product_name, product_description: '', reserva_id: payment.reserva_id, amount: payment.amount, is_delivered: payment.is_delivered })
            }

        });
        const sortedData = _.sortBy([...data], 'product_name');
        setTotalOrderPrice(priceFormat(total_price));
        setFinalOrders([...data]);
        addTaxPercent(taxStatus);
        const socket = io(BASE_URL, {
            withCredentials: true
        });
        // setEditFinalOrderIdx('');
        console.log("finalOrders", finalOrders);
        const paymentMethodInfo = paymentMethodLists.find((method) => (method._id === selectedPaymentMethodId))
        socket.emit('checkoutData', { checkout: sortedData, user_id: userId(), sub_total: priceFormat(total_price), tax_status: taxStatus, tax_percent: taxPercent, cashAmount: cashAmount, isCash: isCashSelected, payment_method: paymentMethodInfo, is_paid: false });
    }, [orderLists, taxStatus, addTaxPercent, taxPrice, selectedPaymentMethodId, reservationList]);
    const handlePaymentMethod = (value) => {
        console.log(value)
        if (value) {
            const methodName = value.split(".")[0]
            const methodId = value.split(".")[1]
            setMethodDescription(value.split(".")[2])
            setSelectedPaymentMethodId(methodId);
            setCashAmount(0);
            if (methodName.toLowerCase() === 'cash') {
                setIsCashSelected(true);
            } else {
                setIsCashSelected(false);
            }
        }
    }
    const finishCheckout = async () => {
        console.log("totalOrderPrice", totalOrderPrice);
        if (Number(totalOrderPrice) === 0) {
            notification.config({
                duration: 2,
            });
            notification.error({
                message: `Please select the product.`,
            });
            return;
        }
        if (isCashSelected && Number(totalPriceWithTax) > Number(cashAmount)) {
            notification.config({
                duration: 2,
            });
            notification.error({
                message: `Paid amount must be bigger than Total amount.`,
            });
            return;
        }
        let bulkData = JSON.stringify([{
            orders: finalOrders.filter((order) => (order.reserva_id === -1)),
            isTax: taxStatus,
            sub_total: totalOrderPrice,
            tax_price: taxPrice,
            order_price: totalPriceWithTax,
            cash_amount: cashAmount,
            method_id: selectedPaymentMethodId,
            user_id: userId(),
            checkout: true,
        }]);
        if (selectedCustomerId !== '')
            bulkData = JSON.stringify([{
                orders: finalOrders.filter((order) => (order.reserva_id === -1)),
                reservation: finalOrders.filter((order) => (order.reserva_id !== -1)),
                isTax: taxStatus,
                sub_total: totalOrderPrice,
                tax_price: taxPrice,
                order_price: totalPriceWithTax,
                cash_amount: cashAmount,
                method_id: selectedPaymentMethodId,
                user_id: userId(),
                checkout: true,
                customer_id: selectedCustomerId
            }]);
        console.log('%cfrontend\src\pages\CheckoutPage.jsx:150 finalOrders', 'color: #007acc;', finalOrders);
        await request.upload({ entity: 'paymentHistory', jsonData: { bulkData } });

        const socket = io(BASE_URL, {
            withCredentials: true
        });
        socket.emit('checkoutData', { user_id: userId(), is_paid: true });
        setFinalOrders([]);
        setOrderLists([])
        setTotalOrderPrice(0);
        setTotalPriceWithTax(0);
        // setIsCashSelected(false)
        setMethodDescription('')
        setSelectedCustomerId('')
        setReservationList([]);
        setCashAmount(0);
    }
    const searchCategories = async (value) => {
        const _categories = await getProductLists();
        if (!value) setProductLists([..._categories])
        else {
            const _filtered = _.filter(_categories, obj => {
                return obj?.product_name.toLowerCase().includes(value.toLowerCase())
            });
            setProductLists([..._filtered]);
        }

    }
    const finishDescription = () => {
        orderItem.description = productDescription;
        setOrderLists([...orderLists, orderItem]);
        setProductDescription('');
        setIsModalOpen(false);
    }
    const handlePaidAmountChange = (e) => {

        const updatedValue = e.target.value;
        setCashAmount(updatedValue)

        const socket = io(BASE_URL, {
            withCredentials: true
        });
        const paymentMethodInfo = paymentMethodLists.find((method) => (method._id === selectedPaymentMethodId))
        socket.emit('checkoutData', { checkout: finalOrders, user_id: userId(), sub_total: priceFormat(totalOrderPrice), tax_status: taxStatus, tax_percent: taxPercent, cashAmount: updatedValue, isCash: isCashSelected, payment_method: paymentMethodInfo, is_paid: false });
    }
    const handleDoubleClick = (idx) => {
        setEditFinalOrderIdx(idx);
    }
    const handlePriceChange = (idx, updatedValue) => {
        console.log("-handlePriceChange", idx, updatedValue, orderLists);
        orderLists.map((obj) => {
            if (obj._id === idx) obj.product_price = updatedValue;
        })
        setOrderLists([...orderLists]);
    }
    return (
        <>
            <Modal
                title={'Please enter Product Details'}
                open={isModalOpen}
                onOk={() => setIsModalOpen(true)}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <div className=' mt-1'>Product : {orderItem.product_name}</div>
                <div className=' mt-1'>Company : {orderItem.product_type?.company_name?.company_name}</div>
                <div className=' mt-8'>Description</div>
                <Input type='text' value={productDescription} onChange={(e) => setProductDescription(e.target.value)}></Input>
                <Button onClick={finishDescription} type="primary" className="w-100 btn-color-info mt-3">Guardar</Button>

            </Modal>

            <NewPaymentModal isVisit={isPendingPayment} customerId={selectedCustomerId} handleSubmit={handleSubmitFunc} handleClose={handleCloseFunc} />

            <DashboardLayout>

                {/* <PageHeader title="Payments" onBack={() => { window['history'].back() }}
                ></PageHeader> */}
                <Layout className="h-100" style={{ minHight: "0px !important" }}>
                    <div className="d-flex row" style={{ backgroundColor: "#F2F2F2", height: "100vh", padding: "18px 18px 18px 28px" }}>
                        <div style={{ height: 'calc(100vh-10px)', backgroundColor: "#FFFFFF", boxShadow: "20px 22px 63px 3px rgba(0, 0, 0, 0.1)", width: "64%", padding: '10px' }}>

                            <div style={{ height: "40%", marginBottom: "auto" }}>
                                <div className="w-100 overflow-auto row px-4 py-4 flex-start" style={{ gridRowGap: '10px' }}>

                                    {[...productLists].sort((a, b) => { if (a.product_name < b.product_name) { return -1; } if (a.product_name > b.product_name) { return 1; } return 0; }).map((data, index) => {
                                        return <div className="text-center rounded mx-2 p-0 d-flex align-items-center justify-content-center " key={index} onClick={() => addToOrders(data)} style={{ cursor: 'pointer', width: '120px', background: '#2D2D2D26', height: "80px", flexDirection: 'column' }}>
                                            <p className="card-title text" style={{
                                                fontSize: "14px", fontFamily: "Inter !important",
                                                fontWeight: "600", marginTop: "auto"
                                            }}>{data?.product_name}</p>
                                            <p className="text-success" style={{
                                                fontSize: "14px", fontWeight: "600",
                                                fontFamily: "Inter !important", marginBottom: "auto"
                                            }}>${data?.product_price}</p>
                                        </div>
                                    })}
                                </div>
                            </div>
                            <div style={{ border: "1px solid #2D2D2D26" }}></div>
                            <div className="d-flex flex-column" style={{ height: '60%' }}>

                                <div className="h-auto overflow-auto row px-4 py-4 align-items-baseline">
                                    <div className="d-flex overflow-scroll" style={{ gap: "10px 30px", fontSize: '16px', flexWrap: 'wrap', width: 'calc(100% - 180px)' }}>
                                        {[...companyLists].map((data, index) => {
                                            return <div key={index} style={{ cursor: 'pointer', color: selectedCompanyIdx === data?._id ? '#1B84FF' : 'black' }} onClick={() => getProductListsWithCompany(data?._id, data?.primary, data?.company_name)}>
                                                <span>{data?.company_name}</span>
                                            </div>
                                        })}
                                    </div>
                                    <div className="d-flex flex-end mt-3 " style={{ width: '180px' }}>
                                        <input placeholder="search products here..." className="border" onChange={(e) => searchCategories(e.target.value)} name="" style={{ width: '170px' }} />
                                        <Button type="primary" shape="circle" icon={<SearchOutlined />} />
                                    </div>
                                </div>

                                <div className="w-100 overflow-scroll row px-4 py-4 flex-start align-content-sm-between" style={{ gridRowGap: '10px', marginBottom: "auto" }}>
                                    {[...productCategories].map((data, index) => {
                                        return <div className="text-center  rounded mx-2 d-flex align-items-center justify-content-center" key={index} style={{ cursor: 'pointer', width: '112px', background: "#2D2D2D26", height: '80px', color: selectedProductTypeIdx === data?._id ? '#1B84FF' : 'black' }} onClick={() => getProductLists(data?._id)} >
                                            <p className="card-title text py-4" style={{
                                                fontSize: "14px",
                                                fontFamily: "Inter !important", fontWeight: "600"
                                            }}>{data?.product_name}</p>
                                        </div>
                                    })}
                                </div>
                                <div style={{ border: "1px solid #2D2D2D26", marginTop: "auto", marginBottom: "5px" }}></div>
                                <div className="row" style={{ marginTop: "5px", marginBottom: "15px", alignItems: 'center' }}>
                                    <div className="col-6 d-flex" style={{ alignItems: 'center' }}>

                                        <Select style={{ minWidth: '150px', width: '200px' }}
                                            showSearch
                                            optionFilterProp="children"
                                            onChange={(customer_id) => setSelectedCustomerId(customer_id)}
                                            value={selectedCustomerId}
                                        >
                                            <Select.Option key='' value=''>No User</Select.Option>
                                            {customerData.map((optionField) => (
                                                <Select.Option
                                                    key={optionField[`_id`]}
                                                    value={optionField[`_id`]}
                                                >
                                                    {optionField[`name`]} | {optionField[`phone`]}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                        &nbsp;&nbsp;
                                        {pendingProductList.length > 0 ?
                                            <Button type="primary" size={'small'} onClick={() => { setIsPendingPayment(true); }}>
                                                reservation
                                            </Button>
                                            : ''
                                        }
                                    </div>
                                    <div className="col-6 justify-content-end d-flex">
                                        <Button onClick={() => { history.push('/payments') }} icon={<LogoutOutlined className="position-relative" style={{ top: "-2px" }} />} type="primary" size={'small'} danger>
                                            EXIT
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex flex-column" style={{ height: 'calc(100vh-10px)', backgroundColor: "#FFFFFF", boxShadow: "20px 22px 63px 3px rgba(0, 0, 0, 0.1)", width: "33%", marginLeft: "20px", padding: "10px" }}>
                            <div className="h-auto overflow-auto" style={{ maxHeight: "300px" }}>
                                {[...finalOrders.slice().reverse()].map((data, index) => {
                                    return (
                                        <div key={"orderDiv_" + index} className='d-flex justify-content-sm-between mx-2 my-5' style={{ fontWeight: 'bold', alignItems: 'center' }}>
                                            <span key={index}>
                                                <MinusOutlined key={index} className="mx-2" onClick={() => data.reserva_id !== -1 ? _minusToPendings(data?._id) : _minusToOrders(data?._id)} />
                                                {data?.product_name}&nbsp;
                                                {data.reserva_id === -1 ? <span className='badge badge-light-success'>x{data?.count}</span> : <span className='badge badge-light-danger'>Reserva</span>}

                                            </span>
                                            {
                                                editFinalOrderIdx === data?._id ?
                                                    <Form className='my-0 w-150px' name="cash_amount">
                                                        <Input type='number' prefix='$' defaultValue={priceFormat(data?.product_price)} onChange={(e) => handlePriceChange(data._id, e.target.value)} />
                                                    </Form>
                                                    :
                                                    <span onDoubleClick={() => { if (data.reserva_id === -1) handleDoubleClick(data._id) }}>${priceFormat(data?.product_price)}</span>
                                            }
                                        </div>
                                    )
                                })}
                            </div>
                            <div style={{ border: "1px solid #2D2D2D26" }}></div>
                            <div className="my-7" style={{ marginBottom: "auto", }}>
                                <div className="d-flex my-1">
                                    <div className="col-6 mx-5">
                                        <h6 className="text-success">Sub Total <Checkbox onChange={(e) => addTaxPercent(e.target.checked)} checked={taxStatus}>Tax</Checkbox></h6>
                                    </div>
                                    <div className="col-6 flex-end">
                                        <h6 className="text-success"> ${totalOrderPrice}</h6>
                                    </div>
                                </div>
                                <div className="d-flex my-1">
                                    <div className="col-6 mx-5">
                                        <h6>Taxes</h6>
                                    </div>
                                    <div className="col-6 flex-end">
                                        <h6> ${taxPrice}</h6>
                                    </div>
                                </div>
                                <div className="d-flex">
                                    <div className="col-6 mx-5">
                                        <h3>Total</h3>
                                    </div>
                                    <div className="col-6 flex-end">
                                        <h3 className='text'> ${totalPriceWithTax}</h3>
                                    </div>
                                </div>
                                {
                                    isCashSelected &&
                                    <div>
                                        <div style={{ border: "1px solid #2D2D2D26" }}></div>


                                        <div className="d-flex my-1">
                                            <div className="col-6 mx-5">
                                                <h3 className="">Payment</h3>
                                            </div>
                                            <div className="col-4 ">
                                                <Form
                                                    className='my-0'
                                                    name="cash_amount"
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message: 'Please input your currency name!',
                                                        },
                                                    ]}
                                                >
                                                    <Input type='number' prefix='$' onChange={handlePaidAmountChange} value={Number(cashAmount)} />
                                                </Form>
                                            </div>
                                        </div>
                                        <div className="d-flex">
                                            <div className="col-6 mx-5">
                                                <h3 className="my-1">Exchange</h3>
                                            </div>
                                            <div className="col-6 flex-end">
                                                <h3 className='text my-1'> ${priceFormat(cashAmount - totalPriceWithTax)}</h3>
                                            </div>
                                        </div>
                                        <div style={{ border: "1px solid #2D2D2D26" }}></div>
                                    </div>
                                }
                            </div>
                            <div style={{ marginTop: "auto", marginBottom: "10px" }}>
                                <div style={{ border: "1px solid #2D2D2D26" }}></div>
                                <div className="d-flex w-100 my-3" style={{ justifyContent: "space-between" }}>
                                    {[...paymentMethodLists].map((data, index) => {
                                        const buttonWidth = `${100 / (paymentMethodLists.length + 1)}%`;
                                        return (
                                            <button className="ant-btn  ant-btn-sm h-24px" onClick={() => handlePaymentMethod(data['method_name'] + "." + data['_id'] + "." + data['method_description'])} type="primary" key={index}
                                                style={{ color: 'white', background: selectedPaymentMethodId === data['_id'] ? '#3182CE' : '#F47621', minWidth: buttonWidth }}>
                                                {data?.method_name}</button>
                                        );
                                    })}
                                </div>
                                <Button onClick={finishCheckout} type="primary" className="w-100 btn-color-info">SAVE</Button>
                            </div>
                        </div>
                    </div>
                </Layout>

            </DashboardLayout >
        </>
    );
};
export default CheckoutPage


const NewPaymentModal = ({ isVisit, customerId, handleSubmit, handleClose }) => {
    const dispatch = useDispatch();
    const { id: currentUserId } = JSON.parse(localStorage.auth)
    const [newPayment] = useForm();
    const [productCategories, setProductCategories] = useState([]);
    const [totalPaidAmount, setTotalPaidAmount] = useState(0);
    const [totalAllAmount, setTotalAllAmount] = useState(0);
    const [totalPredienteAmount, setTotalPredienteAmount] = useState(0);
    const [totalPreviousAmount, setTotalPreviousAmount] = useState(0);
    const [originProductCategories, setOriginProductCategories] = useState([]);
    const [productList, setProductList] = useState([]);
    const [checked, setChecked] = useState(false);
    useEffect(() => {
        if (isVisit && customerId) {
            getProductCategories();
            newPayment.resetFields();
            handleProductList(customerId);
        }
    }, [isVisit]);

    const saveData = (values) => {
        console.log("saveData", values);
        const result = Object.values(values).filter(obj => typeof obj === `object`);
        console.log(result);
        if (customerId) {
            const saveData = result.map((obj) => {
                return {
                    reserva_id: obj?._id,
                    amount: obj?.paid_amount || 0,
                    product_name: obj?.product_type + ' | ' + obj?.payment_name || '',
                    product_price: obj?.total_amount || 0,
                    is_delivered: obj?.is_delivered || false,
                    count: 1,
                    product_description: ''
                }
            })
            handleSubmit(saveData);
        }
    }
    const onFinishFailed = () => { }

    const getProductCategories = async () => {
        const { result } = await request.list({ entity: `productCategories` });
        setOriginProductCategories(result)
        setProductCategories(result || [])
    };
    const handleProductList = async (customer_id) => {
        const { result: reservations } = await request.listById({ entity: `customerReversation`, jsonData: { parent_id: customer_id, status: 1 } });
        const { result: paymentHistories } = await request.listById({ entity: 'paymentHistory', jsonData: { customer_id } });
        var total_amount = 0, pending_amount = 0, newPayments = [], prev_amount = 0;
        for (var i = 0; i < [...reservations].length; i++) {
            var obj = { ...reservations[i] };
            for (var j = 0; j < [...paymentHistories].length; j++) {
                var payObj = { ...paymentHistories[j] };
                for (var l = 0; l < payObj?.reservation?.length; l++) {
                    var _obj = payObj?.reservation[l];
                    if (obj?._id === _obj?.reserva_id?._id) {
                        // obj[`paid_amount`] = parseFloat(obj[`paid_amount`]) + parseFloat(_obj?.amount);
                        obj[`paid_amount`] = parseFloat(obj[`paid_amount`]);
                    }
                }

            }
            obj[`pending_amount`] = parseFloat(obj[`product_price`]) - parseFloat(obj[`paid_amount`])
            if (obj[`pending_amount`] > 0) {
                total_amount += parseFloat(obj?.product_price || 0) || 0
                pending_amount += parseFloat(obj?.product_price - obj?.paid_amount) || 0;
                prev_amount += parseFloat(obj?.paid_amount);
                newPayments.push({ ...obj })
            }
        }
        console.log(newPayments);
        setTotalPreviousAmount(prev_amount)
        setProductList([...newPayments])
        setTotalAllAmount(total_amount);
        setTotalPredienteAmount(pending_amount)

    }
    return (
        <>
            <Modal title={`Pending Payments`} open={isVisit} onCancel={() => handleClose(false)} width={800} footer={null}>
                <Form
                    className="ant-advanced-search-form"
                    form={newPayment}
                    name="basic"
                    layout="vertical"
                    wrapperCol={{
                        span: 16,
                    }}
                    onFinish={saveData}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Row >

                        {productList.map((obj, name) => (
                            <>
                                <Row className='bold-form' key={obj._id} style={{ display: 'flex', justifyContent: "space-around", width: '100%' }}>
                                    <Col span={5}>
                                        <Form.Item
                                            wrapperCol={24}
                                            name={[name, 'product_type']}
                                            label={!name && "Type"}
                                            initialValue={obj?.product_type?.product_name}
                                        >
                                            <label>{obj?.product_type?.product_name}</label>
                                        </Form.Item>
                                    </Col>
                                    <Col span={5}>
                                        <Form.Item
                                            wrapperCol={24}
                                            name={[name, 'payment_name']}
                                            label={!name && "Product"}
                                            initialValue={obj?.product_name?.category_name}
                                        >
                                            <label>{obj?.product_name?.category_name}</label>
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item
                                            name={[name, 'paid_amount']}
                                            label={!name && "Paid"}
                                            onChange={(e) => {
                                                const newValue = e.target.value;
                                                console.log(newValue, `newValue`);
                                                if (newValue) {
                                                    const pending_amount = parseFloat(obj?.product_price || 0) - parseFloat(newValue) - parseFloat(obj?.paid_amount || 0);
                                                    productList[name][`pending_amount`] = pending_amount;
                                                    setProductList([...productList]);
                                                    var tota_prediente = 0;
                                                    for (var i = 0; i < [...productList].length; i++) {
                                                        var _obj = { ...productList[i] };
                                                        tota_prediente += parseFloat(_obj?.pending_amount || 0)
                                                    }
                                                    setTotalPredienteAmount(tota_prediente);

                                                    const formData = newPayment.getFieldsValue();
                                                    const result = Object.values(formData).filter(obj => typeof obj === `object`);
                                                    var sumPaidAmount = 0;
                                                    result.map((obj) => {
                                                        sumPaidAmount += parseFloat(obj?.paid_amount) || 0
                                                    });
                                                    setTotalPaidAmount(sumPaidAmount);
                                                } else {
                                                    productList[name][`pending_amount`] = false;
                                                    setProductList([...productList])
                                                }
                                            }}
                                            rules={[
                                                {
                                                    validator: ({ field }, paid_amount,) => {
                                                        const pending_amount = obj?.pending_amount;
                                                        console.log(pending_amount, `pending_amount`);
                                                        if (pending_amount < 0) {
                                                            return Promise.reject(`You can't enter that amount`);
                                                        }
                                                        return Promise.resolve();
                                                    },
                                                }
                                            ]}
                                        >
                                            <Input prefix="$" />
                                        </Form.Item>
                                    </Col >
                                    <Col span={3}>
                                        <Form.Item
                                            name={[name, 'total_amount']}
                                            label={!name && "Total"}
                                            initialValue={obj?.product_price}
                                        >
                                            <label>${priceFormat(obj?.product_price)}</label>
                                        </Form.Item>
                                    </Col>
                                    <Col span={3}>
                                        <Form.Item
                                            name={[name, 'prediente']}
                                            label={!name && "Pending"}
                                        >
                                            <label>${priceFormat(obj?.pending_amount) || 0.00}</label>
                                        </Form.Item>
                                        <Form.Item
                                            name={[name, '_id']}
                                            style={{ display: `none` }}
                                            initialValue={obj?._id}
                                        >
                                            <Input value={obj?._id} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        {obj?.pending_amount === 0 ?
                                            <Form.Item
                                                name={[name, `is_delivered`]}
                                                label={!name && "Delivered"}
                                                valuePropName="checked"
                                            >
                                                <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)}></Checkbox>
                                            </Form.Item> : null}
                                    </Col>
                                    {
                                        productList.length === name + 1 && (
                                            <>
                                                <Col span={10}>
                                                    Total Payment
                                                </Col>
                                                <Col span={4}>
                                                    ${priceFormat(totalPaidAmount) || 0.00}
                                                </Col>
                                                <Col span={3}>
                                                    ${priceFormat(totalAllAmount) || 0.00}
                                                </Col>
                                                <Col span={3}>
                                                    ${priceFormat(totalPredienteAmount) || 0.00}
                                                </Col>
                                                <Col span={4}>
                                                </Col>
                                            </>
                                        )
                                    }
                                </Row >
                            </>
                        ))}
                    </Row>

                    <Form.Item
                        className='mt-6'
                        wrapperCol={{
                            offset: 8,
                            span: 16,
                        }}
                    >
                        <Button type="primary" htmlType="submit">
                            Save
                        </Button>
                        &nbsp;
                        <Button type="ghost" onClick={() => { handleClose(false) }}>
                            cancel
                        </Button>
                    </Form.Item>
                </Form>
            </Modal >
        </>

    );
};
