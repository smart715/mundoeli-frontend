import { request } from '@/request';
import { CiCircleOutlined, SearchOutlined, DeleteOutlined, IssuesCloseOutlined, LogoutOutlined, MinusCircleOutlined, MinusOutlined, PlusCircleOutlined, ScanOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Layout, Modal, PageHeader, Select, Input } from 'antd';
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
const CheckoutPage = () => {
    const [productCategories, setProductCategories] = useState([]);
    const [productLists, setProductLists] = useState([]);
    const [orderLists, setOrderLists] = useState([]);
    const [companyLists, setCompanyLists] = useState([]);
    const [finalOrders, setFinalOrders] = useState([]);
    const [totalOrderPrice, setTotalOrderPrice] = useState(0);
    const [taxPercent, setTaxPercent] = useState(0);
    const [totalPriceWithTax, setTotalPriceWithTax] = useState(0);
    const [taxPrice, setTaxPrice] = useState(0);
    const [taxStatus, setTaxStatus] = useState(false);
    const [paymentMethodLists, setPaymentMethodLists] = useState([])
    const [isCashSelected, setIsCashSelected] = useState(false);
    const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(null);
    const [clickedIndex, setClickedIndex] = useState(null);
    const [methodDescription, setMethodDescription] = useState(null);
    const [primaryCompany, setPrimaryCompany] = useState(false);
    const [companyName, setCompanyName] = useState('');
    const [productName, setProductName] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderItem, setOrderItem] = useState('');
    const [productDescription, setProductDescription] = useState('');

    const getProductCategory = async () => {
        const { result } = await request.list({ entity: "productTypes" });
        setProductCategories(result || []);
        return result || [];
    }
    const getProductLists = async (type_id) => {
        const { result } = await request.listById({ entity: "checkoutProductLists", jsonData: { product_type: type_id } });
        setProductLists(result || [])
        return result || [];

    }
    const getCompanyLists = async (type_id) => {
        const { result } = await request.listById({ entity: "companyList" });
        setCompanyLists(result || [])
    }
    const getPaymentLists = async () => {
        const { result } = await request.listById({ entity: "paymentMethod" });
        setPaymentMethodLists(result || [])
    }
    const addToOrders = async (item) => {
        if (primaryCompany) {
            setProductName(item.product_name)
            setIsModalOpen(true)
            setOrderItem(item)
        } else {
            setOrderLists([...orderLists, item]);
        }

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
        setClickedIndex(company_id)
    }
    const addTaxPercent = useCallback((checked) => {
        setTaxStatus(checked)
        if (checked) {
            const taxValue = priceFormat(priceFormat(taxPercent / 100) * totalOrderPrice);
            const updatedTotal = priceFormat(parseFloat(taxValue) + parseFloat(totalOrderPrice))
            setTaxPrice(taxValue)
            setTotalPriceWithTax(updatedTotal);
        } else {
            setTaxPrice(0);
            setTotalPriceWithTax(totalOrderPrice)
        }
    }, [taxPercent, totalOrderPrice])
    useEffect(() => {
        getProductCategory();
        getProductLists();
        getPaymentLists();
        getCompanyLists();
        (async () => {
            const { result: taxInfo } = await request.list({ entity: "systemInfo" });
            if (taxInfo?.length) setTaxPercent(taxInfo[0]?.tax_percent)
            else setTaxPercent(0);
        })()

    }, []);
    useEffect(() => {
        const groupedOrders = _.groupBy(orderLists, '_id');
        var data = [], total_price = 0;
        for (var key in groupedOrders) {
            const count = groupedOrders[key].length;
            const product_price = priceFormat(priceFormat(groupedOrders[key][0]?.product_price) * count);
            total_price += parseFloat(product_price);
            const product_name = (groupedOrders[key][0]?.product_name)
            const product_description = (groupedOrders[key][0]?.description)
            data.push({ _id: key, count, product_price, product_name, product_description })
        }
        const sortedData = _.sortBy([...data], 'product_name');
        setTotalOrderPrice(priceFormat(total_price));
        setFinalOrders([...data]);
        addTaxPercent(taxStatus);
        const socket = io(BASE_URL, {
            withCredentials: true
        });
        socket.emit('checkoutData', { checkout: sortedData, user_id: userId(), sub_total: priceFormat(total_price), tax_value: taxPrice, total_price: totalPriceWithTax, isCash: isCashSelected });
    }, [orderLists, taxStatus, addTaxPercent, taxPrice, isCashSelected]);
    const handlePaymentMethod = (value) => {
        console.log(value)
        if (value) {
            const methodName = value.split(".")[0]
            const methodId = value.split(".")[1]
            setMethodDescription(value.split(".")[2])
            setSelectedPaymentMethodId(methodId);
            if (methodName.toLowerCase() === 'cash') {
                setIsCashSelected(true);
            } else {
                setIsCashSelected(false);
            }
        }
    }
    const finishCheckout = async () => {
        const bulkData = JSON.stringify([{
            orders: finalOrders,
            isTax: taxStatus,
            order_price: totalPriceWithTax,
            tax_price: taxPrice,
            sub_total: totalOrderPrice,
            method_id: selectedPaymentMethodId,
            user_id: userId(),
            checkout: true,
        }]);
        console.log('%cfrontend\src\pages\CheckoutPage.jsx:150 finalOrders', 'color: #007acc;', finalOrders);
        await request.upload({ entity: 'paymentHistory', jsonData: { bulkData } });
        setFinalOrders([]);
        setOrderLists([])
        setTotalOrderPrice(0);
        setTotalPriceWithTax(0);
        setIsCashSelected(false)
        setMethodDescription('')
    }
    const searchCategories = async (value) => {
        const _categories = await getProductLists();
        if (!value) setProductLists([..._categories])
        else {
            const _filtered = _.filter(_categories, obj => { return obj?.product_name.includes(value) });
            setProductLists([..._filtered]);
        }

    }
    const finishDescription = () => {
        orderItem.description = productDescription;
        setOrderLists([...orderLists, orderItem]);
        setProductDescription('');
        setIsModalOpen(false);
    }
    return (
        <>
            <Modal
                title={'Please enter Product Details'}
                visible={isModalOpen}
                onOk={() => setIsModalOpen(true)}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <div className=' mt-1'>Product : {productName}</div>
                <div className=' mt-1'>Company : {companyName}</div>
                <div className=' mt-8'>Description</div>
                <Input type='text' value={productDescription} onChange={(e) => setProductDescription(e.target.value)}></Input>
                <Button onClick={finishDescription} type="primary" className="w-100 btn-color-info mt-3">Guardar</Button>

            </Modal>
            <DashboardLayout>

                <PageHeader title="Payments" onBack={() => { window['history'].back() }}
                ></PageHeader>
                <Layout className="h-100" style={{ minHight: "0px !important" }}>
                    <div className="d-flex row" style={{ backgroundColor: "#F2F2F2", height: "87%", padding: "18px 18px 18px 28px" }}>
                        <div style={{ backgroundColor: "#FFFFFF", boxShadow: "20px 22px 63px 3px rgba(0, 0, 0, 0.1)", width: "47%" }}>

                            <div className="h-25 w-100 overflow-auto row px-4 py-4 flex-start">

                                {[...productLists].sort((a, b) => a.product_price - b.product_price).map((data, index) => {
                                    return <div className="text-center rounded mx-2 p-0 d-flex align-items-center justify-content-center " key={index} onClick={() => addToOrders(data)} style={{ width: '120px', background: '#2D2D2D26', height: "80px", flexDirection: 'column' }}>
                                        <p className="card-title text" style={{
                                            fontSize: "14px",
                                            fontFamily: "Inter !important", fontWeight: "600",
                                        }}>{data?.product_name}</p>
                                        <p className="text-success" style={{ fontSize: "14px", fontWeight: "600", fontFamily: "Inter !important" }}>${data?.product_price}</p>
                                    </div>
                                })}
                            </div>
                            <div style={{ border: "1px solid #2D2D2D26" }}></div>

                            <div className="h-30 overflow-auto row px-4 py-4 align-items-baseline">
                                <div className="d-flex  h-30px overflow-scroll w-75" style={{ gap: "31px" }}>
                                    {[...companyLists].map((data, index) => {
                                        return <div key={index} style={{ cursor: 'pointer', color: clickedIndex === data?._id ? '#1B84FF' : 'black' }} onClick={() => getProductListsWithCompany(data?._id, data?.primary, data?.company_name)}>
                                            <span>{data?.company_name}</span>
                                        </div>
                                    })}
                                </div>
                                <div className="d-flex flex-end mt-3  w-25" >
                                    <input placeholder="search products here..." className="border" onChange={(e) => searchCategories(e.target.value)} name="" />
                                    <Button type="primary" shape="circle" icon={<SearchOutlined />} />
                                </div>
                            </div>

                            <div className="w-100 overflow-auto row px-4 py-4 flex-start align-content-sm-between h-25">
                                {[...productCategories].map((data, index) => {
                                    return <div className="text-center  rounded mx-2 d-flex align-items-center justify-content-center" key={index} style={{ width: '112px', background: "#2D2D2D26", height: '80px' }}>
                                        <p onClick={() => getProductLists(data?._id)} className="card-title text py-4" style={{
                                            fontSize: "14px",
                                            fontFamily: "Inter !important", fontWeight: "600"
                                        }}>{data?.product_name}</p>
                                    </div>
                                })}
                            </div>
                            <div className="w-100 overflow-auto row px-4 py-4 flex-start align-content-sm-between h-25">
                                {/* {methodDescription} */}
                            </div>
                            <div style={{ border: "1px solid #2D2D2D26" }}></div>
                            <div className="row" style={{ marginTop: "60px" }}>
                                <div className="col-6">
                                    <Button type="primary" size={'small'}>
                                        SCAN BARCODE
                                    </Button>
                                </div>
                                <div className="col-6 justify-content-end d-flex">
                                    <Button onClick={() => { history.push('/payments') }} icon={<LogoutOutlined className="position-relative" style={{ top: "-2px" }} />} type="primary" size={'small'} danger>
                                        EXIT
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div style={{ height: 'fit-content', backgroundColor: "#FFFFFF", boxShadow: "20px 22px 63px 3px rgba(0, 0, 0, 0.1)", width: "50%", marginLeft: "20px", paddingBottom: "50px" }}>
                            <div className="h-100px overflow-auto">
                                {[...finalOrders.slice().reverse()].map((data, index) => {
                                    return <>
                                        <div className='d-flex justify-content-sm-between mx-2 my-5'>
                                            <span key={index}>
                                                <MinusOutlined key={index} className="mx-2" onClick={() => _minusToOrders(data?._id)} />
                                                {data?.product_name} x {data?.count}
                                            </span>
                                            <span>${data?.product_price}</span>
                                        </div>
                                    </>
                                })}
                            </div>
                            <div style={{ border: "1px solid #2D2D2D26" }}></div>
                            <div className="my-7" style={{ height: '500px' }}>
                                <div className="d-flex my-7">
                                    <div className="col-6 mx-5">
                                        <h6 className="text-success">Sub Total <Checkbox onChange={(e) => addTaxPercent(e.target.checked)}>Tax</Checkbox></h6>
                                    </div>
                                    <div className="col-6 flex-end">
                                        <h6 className="text-success"> ${totalOrderPrice}</h6>
                                    </div>
                                </div>
                                <div className="d-flex my-7">
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
                                        <h3 className='text'> ${isCashSelected ? parseFloat(totalPriceWithTax) + 5 : totalPriceWithTax || 0}</h3>
                                    </div>
                                </div>
                                {
                                    isCashSelected &&
                                    <div className="d-flex">
                                        <div className="col-6 mx-5">
                                            <h3>Exchange</h3>
                                        </div>
                                        <div className="col-6 flex-end">
                                            <h3 className='text'> ${5}</h3>
                                        </div>
                                    </div>
                                }
                            </div>
                            <div style={{ border: "1px solid #2D2D2D26" }}></div>
                            <div className="d-flex h-50px w-100 my-3">
                                {[...paymentMethodLists].map((data, index) => {
                                    return (
                                        <div onClick={() => handlePaymentMethod(data['method_name'] + "." + data['_id'] + "." + data['method_description'])} type="primary" key={index}
                                            style={{ color: 'white', background: selectedPaymentMethodId === data['_id'] ? '#1B84FF' : 'grey' }}
                                            className="w-auto mx-2 d-inline btn">{data?.method_name}</div>
                                    );
                                })}
                            </div>
                            <Button onClick={finishCheckout} type="primary" className="w-100 btn-color-info">SAVE</Button>
                        </div>
                    </div>
                </Layout>

            </DashboardLayout >
        </>
    );
};
export default CheckoutPage