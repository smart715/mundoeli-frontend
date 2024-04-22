import SelectAsync from "@/components/SelectAsync";
import { Button, message } from "antd";
import { useCallback, useState } from "react";
import group19 from '../../style/Eli_label.png'
import completeImg from '../../style/Eli.png'
import moneyPng from '../../style/dollar_card.png'
import EliWithIcon from '../../style/EliWithIcon.png'
import shortEliAvatar from '../../style/shortEliAvatar.png'
import starImg from '../../style/Star.png'
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentItem } from "@/redux/checkout/selectors";
import { checkout } from "@/redux/checkout/actions";
import io from 'socket.io-client';
import { MinusOutlined } from "@ant-design/icons";
import { priceFormat, userId } from "../common";
import { BASE_URL, UPLOAD_URL } from "@/config/serverApiConfig";
import { request } from "@/request";
const Panel2 = ({ assignedUser }) => {
    const [checkoutList, setCheckoutList] = useState([]);
    const [subTotal, setSubTotal] = useState(0);
    const [taxValue, setTaxValue] = useState(0);
    const [taxStatus, setTaxStatus] = useState(true);
    const [totalPrice, setTotalPrice] = useState(0);
    const [cashAmount, setCashAmount] = useState(0);
    const [isCash, setIsCash] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState();
    const [isPaid, setIsPaid] = useState(false);

    const [imageUrl, setImageUrl] = useState('checkout_image.jpg');
    const [thankString, setThankString] = useState('');
    let paid_flag = false;
    useEffect(() => {
        (async () => {
            const { result } = await request.list({ entity: 'systemInfo' });
            if (result?.length) {
                console.log("request[0]?.checkout_string", result[0]?.checkout_string, result);
                setThankString(result[0]?.checkout_string);
                setImageUrl(result[0]?.checkout_image);
            }
            const socket = io(BASE_URL, {
                withCredentials: true
            });
            socket.on('message', (message) => {
                console.log(message);
            });
            socket.on('checkoutData', (checkout_data) => {
                if (checkout_data?.user_id === assignedUser) {
                    console.log('%cfrontend\src\pages\rd_checkout.jsx:1371 socket recieved', 'color: #007acc;', checkout_data);
                    const tax_status = checkout_data?.tax_status;
                    const tax_percent = checkout_data?.tax_percent;
                    const sub_total = checkout_data?.sub_total || 0;
                    let tax_value = 0;
                    let total_price = sub_total;
                    setTaxStatus(tax_status);
                    if (tax_status) {
                        tax_value = priceFormat(parseFloat(tax_percent / 100) * sub_total);
                        total_price = priceFormat(Number(tax_value) + Number(sub_total))
                    }

                    if (paid_flag) {
                        if (!checkout_data?.is_paid && subTotal !== checkout_data?.sub_total && Number(checkout_data?.sub_total) > 0) {
                            paid_flag = checkout_data?.is_paid;
                            setIsPaid(checkout_data?.is_paid || false);
                            setCheckoutList(checkout_data?.checkout)
                            setSubTotal(sub_total);
                            setTaxValue(tax_value);
                            setTotalPrice(total_price);
                            setCashAmount(checkout_data?.cashAmount || 0);
                            setIsCash(checkout_data?.isCash);
                            setPaymentMethod(checkout_data?.payment_method);
                            console.log('canceled');

                        }

                    } else {
                        paid_flag = checkout_data?.is_paid;
                        setIsPaid(checkout_data?.is_paid || false);
                        setCheckoutList(checkout_data?.checkout)
                        setSubTotal(sub_total);
                        setTaxValue(tax_value);
                        setTotalPrice(total_price);
                        setCashAmount(checkout_data?.cashAmount || 0);
                        setIsCash(checkout_data?.isCash);
                        setPaymentMethod(checkout_data?.payment_method);
                    }
                } else {
                    setCheckoutList([]);
                }
            });
            socket.emit('checkoutData', assignedUser);
            document.querySelector(".ant-layout-sider").hidden = true
            document.querySelector(".ant-layout-content").style.background = "lightgray";
            document.querySelector(".ant-layout").style.background = "lightgray";
        })()
    }, []);

    useEffect(() => {
        let timeout;
        if (isPaid) {
            timeout = setTimeout(() => {
                setIsPaid(false);
                setIsCash(true);
            }, 10000);
        }

        return () => {
            clearTimeout(timeout);
        };
    }, [isPaid]);
    const divStyle = {
        style1: {
            background: "lightgray",
            height: '95vh',
            padding: '10px'
        }, style2: {
            height: '88vh',
            padding: isCash ? '10px' : '0px',
            background: 'white'
        }, style3: {
            background: checkoutList?.length ? 'white' : '#1b98f5',
            height: '88vh'
        }
    };
    return (
        isPaid ?
            <div className="col-12 d-flex w-100" style={divStyle.style1}>
                <div className="col-12" style={{ height: '88vh', background: 'white' }}>
                    <div className="overflow-auto" style={{ background: '#157DB2' }}>
                        <div className="d-flex justify-content-center py-10">
                            <img src={shortEliAvatar} alt="" />
                        </div>
                    </div>
                    <div className="overflow-auto" >
                        <div className="d-flex justify-content-center py-5">
                            <img src={starImg} alt="" />
                        </div>
                        <div className="d-flex justify-content-center py-5 px-5">
                            <div className="" style={{ padding: '30px', fontSize: 'large' }}
                                dangerouslySetInnerHTML={{ __html: thankString }}
                            >
                            </div>

                        </div>
                    </div>
                </div>
            </div >
            :
            <div className="col-12 d-flex w-100" style={divStyle.style1}>
                <div className="col-8" style={divStyle.style2}>
                    {isCash ?
                        <img src={UPLOAD_URL + 'admin/' + imageUrl} width={'100%'} height={'100%'} alt="" /> :
                        <div>
                            <div className="overflow-auto" style={{ background: '#157DB2' }}>
                                <div className="d-flex justify-content-center py-10">
                                    <img src={EliWithIcon} alt="" />
                                </div>
                            </div>

                            <div className="d-flex justify-content-center py-10 px-5">
                                <div className="" style={{ padding: '30px', fontSize: 'large' }}
                                    dangerouslySetInnerHTML={{ __html: paymentMethod?.method_description }}
                                >
                                </div>

                            </div>


                        </div>
                    }
                </div>
                <div className="col-4 mx-10 position-relative py-3 px-5" style={divStyle.style3}>
                    {checkoutList?.length ?
                        <div className="d-flex flex-column h-100">
                            <div className="overflow-auto" style={{ marginBottom: "auto" }}>
                                {[...checkoutList].map((data, index) => {
                                    return <>
                                        <div key={"div_" + index} className='d-flex justify-content-sm-between mx-2 my-5' style={{ fontSize: '16px' }}>
                                            <span key={index} className="fw-bold" >
                                                {data?.product_name} x {data?.count}
                                            </span>
                                            <span className="fw-bolder">${data?.product_price}</span>
                                        </div>
                                    </>
                                })}
                            </div>
                            <div className="" style={{ marginTop: "auto", marginBottom: "5px" }}>

                                {taxStatus &&
                                    <div style={{ border: "1px solid #2D2D2D26" }}></div>
                                }
                                {taxStatus &&
                                    <div className='d-flex justify-content-sm-between mx-2 my-5'>
                                        <span className="fw-bolder text" style={{ fontSize: '16px' }}>Sub Total</span>
                                        <span className="fw-bolder text" style={{ fontSize: '20px' }}>${subTotal}</span>
                                    </div>
                                }
                                {taxStatus &&
                                    <div className='d-flex justify-content-sm-between mx-2 my-5 fw-medium' style={{ fontSize: '16px' }}>
                                        <span >I.T.B.M.S</span>
                                        <span>${taxValue}</span>
                                    </div>
                                }

                                <div style={{ border: "1px solid #2D2D2D26" }}></div>
                                <div className='d-flex justify-content-sm-between mx-2 my-5'>
                                    <span className="text text-success fw-bolder" style={{ fontSize: '16px' }}>Total</span>
                                    <span className="text text-success fw-bolder" style={{ fontSize: '20px' }}>${totalPrice}</span>
                                </div>

                                {isCash && <div style={{
                                    background: '#3182CE',
                                }} className="rounded-2 p-2">
                                    <p className="px-2 text text-white" style={{ fontSize: '16px', fontFamily: 'Inter' }}>
                                        Usted ha pagado con ${priceFormat(parseFloat(cashAmount))}</p>
                                    <div className='d-flex mx-2 my-5 justify-content-sm-between' style={{ fontSize: '18px' }} >
                                        <span className="text text-white fw-bolder"><img src={moneyPng} /> Su cambio es</span>
                                        <span className="text text-white fw-bolder">${parseFloat(cashAmount - totalPrice) > 0 ? priceFormat(cashAmount - totalPrice) : '0.00'}</span>
                                    </div>
                                </div>}
                            </div>
                        </div>
                        :
                        <>
                            <div className="d-flex justify-content-center py-20">
                                <img src={group19} alt="" />
                            </div>
                            <div className="d-flex justify-content-center">
                                <h3 className="text-white f-35px" style={{ fontSize: '35px' }}>
                                    Bienvenido
                                </h3>
                            </div>
                            <div className="d-flex justify-content-center">
                                <img src={completeImg} alt="" className="position-absolute d-flex justify-content-center" style={{ bottom: 0, height: '60%' }} />
                            </div>
                        </>
                    }
                </div>
            </div>
    );
}
export default Panel2;