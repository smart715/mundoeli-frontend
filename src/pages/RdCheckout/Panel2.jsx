import SelectAsync from "@/components/SelectAsync";
import { Button, message } from "antd";
import { useCallback, useState } from "react";
import banerImg from '../../style/panel_image.jpg';
import group19 from '../../style/Group 1 9.png'
import completeImg from '../../style/ELI COMPLETA 1.png'
import moneyPng from '../../style/Group 82.png'
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentItem } from "@/redux/checkout/selectors";
import { checkout } from "@/redux/checkout/actions";
import io from 'socket.io-client';
import { MinusOutlined } from "@ant-design/icons";
import { priceFormat, userId } from "../common";
import { BASE_URL } from "@/config/serverApiConfig";
const Panel2 = ({ assignedUser }) => {
    const [checkoutList, setCheckoutList] = useState([]);
    const [subTotal, setSubTotal] = useState(0);
    const [taxValue, setTaxValue] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [isCash, setIsCash] = useState(false);
    useEffect(() => {
        const socket = io(BASE_URL, {
            withCredentials: true
        });
        socket.on('message', (message) => {
            console.log(message);
        });
        socket.on('checkoutData', (checkout_data) => {
            if (checkout_data?.user_id === assignedUser) {
                setCheckoutList(checkout_data?.checkout)
                setSubTotal(checkout_data?.sub_total || 0);
                setTaxValue(checkout_data?.tax_value || 0);
                setTotalPrice(checkout_data?.total_price || 0);
                setIsCash(checkout_data?.isCash);
            } else {
                setCheckoutList([]);
            }
        });
        socket.emit('checkoutData', assignedUser);
        document.querySelector(".ant-layout-sider").hidden = true
        document.querySelector(".ant-layout-content").style.background = "lightgray";
        document.querySelector(".ant-layout").style.background = "lightgray";
    }, []);
    const divStyle = {
        style1: {
            background: "lightgray",
            height: '95vh',
            padding: '10px'
        }, style2: {
            height: '88vh',
            padding: '10px',
            background: 'white'
        }, style3: {
            background: checkoutList?.length ? 'white' : '#1b98f5',
            height: '88vh'
        },
        style4: {
            fontSize: '35px'
        }
    };
    return (
        <div className="col-12 d-flex w-100" style={divStyle.style1}>
            <div className="col-8" style={divStyle.style2}>
                <img src={banerImg} width={'100%'} height={'100%'} alt="" />
            </div>
            <div className="col-4 mx-10 position-relative p-10" style={divStyle.style3}>
                {checkoutList?.length ?
                    <>
                        <div className="h-225px overflow-auto">
                            {[...checkoutList].map((data, index) => {
                                return <>
                                    <div className='d-flex justify-content-sm-between mx-2 my-5' style={{ fontSize: '20px' }}>
                                        <span key={index} className="fw-bold" >
                                            {data?.product_name} x {data?.count}
                                        </span>
                                        <span className="fw-bolder">${data?.product_price}</span>
                                    </div>
                                </>
                            })}
                        </div>
                        <div className="h-50" style={{ marginTop: '17%' }}>
                            <div className='d-flex justify-content-sm-between mx-2 my-5'>
                                <span className="fw-bolder text" style={{ fontSize: '16px' }}>Sub Total</span>
                                <span className="fw-bolder text" style={{ fontSize: '20px' }}>${subTotal}</span>
                            </div>
                            <div className='d-flex justify-content-sm-between mx-2 my-5 fw-medium' style={{ fontSize: '16px' }}>
                                <span >ITBMS(TAXES)</span>
                                <span>${taxValue}</span>
                            </div>
                            <div className='d-flex justify-content-sm-between mx-2 my-5'>
                                <span className="text text-success fw-bolder" style={{ fontSize: '16px' }}>Total</span>
                                <span className="text text-success fw-bolder" style={{ fontSize: '20px' }}>${totalPrice}</span>
                            </div>

                            {isCash && <div style={{
                                background: '#3182CE'
                            }} className="rounded-2 p-2">
                                <p className="px-2 text text-white" style={{ fontSize: '16px', fontFamily: 'Inter' }}>You Paid With ${priceFormat(parseFloat(totalPrice) + 5)}</p>
                                <div className='d-flex mx-2 my-5 justify-content-sm-between' style={{ fontSize: '18px' }} >
                                    <span className="text text-white fw-bolder"><img src={moneyPng} /> Your Exchange</span>
                                    <span className="text text-white fw-bolder">$5</span>
                                </div>
                            </div>}
                        </div>
                    </>
                    :
                    <>
                        <div className="d-flex justify-content-center py-20">
                            <img src={group19} alt="" />
                        </div>
                        <div className="d-flex justify-content-center">
                            <h3 className="text-white f-35px" style={divStyle.style4}>
                                Bienvenido
                            </h3>
                        </div>
                        <div className="d-flex justify-content-center">
                            <img src={completeImg} alt="" className="position-absolute d-flex justify-content-center" style={{ bottom: 0, width: '65%' }} />
                        </div>
                    </>
                }
            </div>
        </div>
    );
}
export default Panel2;