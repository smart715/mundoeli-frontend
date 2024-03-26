import { request } from "@/request";
import { CaretLeftOutlined, CaretRightOutlined } from "@ant-design/icons";
import axios from "axios";
import _ from "lodash";
import moment from "moment";
import { useEffect, useState } from "react";

export const priceFormat = function (value) {
    const price = parseFloat(value || 0).toFixed(2);
    return price || 0;
}
export const dateFormat = function (date) {
    return moment(new Date(date)).format('DD/MM/YY')

}
export const dateTimeFormat = function (date) {
    return moment(new Date(date)).format('DD/MM/YY HH:mm A')

}
export const userId = function () {
    const { id: currentUserId } = JSON.parse(localStorage.auth)
    return currentUserId;
}
export function YearlyPicker({ onChange }) {
    const defaultYear = moment().year();
    const [changedYear, setChangedYear] = useState(defaultYear);
    const nextHandle = () => {
        setChangedYear(changedYear + 1)
    }
    const prevHandle = () => {
        setChangedYear(changedYear - 1)
    }
    useEffect(() => {
        if (onChange) onChange(changedYear);
    }, [
        changedYear, onChange
    ])
    return (
        <div className="d-inline px-5">
            <CaretLeftOutlined onClick={prevHandle} />
            <span className="text text-black px-2">Year {changedYear}</span>
            <CaretRightOutlined onClick={nextHandle} />
        </div>
    );
}
export function MonthlyPicker({ onChange }) {
    const [defaultMonthNumber, setDefaultMonthNumber] = useState(moment().month());
    const defaultYear = moment().format('MMMM');
    const [changedYear, setChangedYear] = useState(defaultYear);
    const nextHandle = () => {
        if (defaultMonthNumber === 11) setDefaultMonthNumber(0);
        else setDefaultMonthNumber(defaultMonthNumber + 1)
    }
    const prevHandle = () => {
        if (defaultMonthNumber === 0) setDefaultMonthNumber(11);
        else setDefaultMonthNumber(defaultMonthNumber - 1)
    }
    useEffect(() => {
        setChangedYear(moment().set('month', defaultMonthNumber).format('MMMM'));
        if (onChange) onChange(defaultMonthNumber);
    }, [
        defaultMonthNumber, onChange
    ])
    return (
        <div className="d-inline px-5">
            <CaretLeftOutlined onClick={prevHandle} />
            <span className="text text-black px-2">{changedYear}</span>
            <CaretRightOutlined onClick={nextHandle} />
        </div>
    );
}


export function WeeklyPicker({ onChange, selectedYear }) {
    const [defaultWeek, setDefaultWeek] = useState(moment().week());
    const [defaultYear, setDefaultYear] = useState(moment().year());
    const [changedWeek, setChangedWeek] = useState('');
    useEffect(() => {
        if (selectedYear) {
            setDefaultYear(selectedYear);
        }
    }, [selectedYear]);

    const nextHandle = () => {
        const nextWeek = defaultWeek === moment().weeksInYear() ? 1 : defaultWeek + 1;
        setDefaultWeek(nextWeek);
    }

    const prevHandle = () => {
        const prevWeek = defaultWeek === 1 ? moment().weeksInYear() : defaultWeek - 1;
        setDefaultWeek(prevWeek);
    }

    useEffect(() => {
        const startDate = moment().year(defaultYear).week(defaultWeek).startOf('week');
        const endDate = moment().year(defaultYear).week(defaultWeek).endOf('week');
        setChangedWeek(`Week-${startDate.week()}  (${startDate.format('MMM Do')} - ${endDate.format('MMM Do, YYYY')})  `);
        if (onChange) onChange(defaultWeek, defaultYear);
    }, [defaultWeek, defaultYear, onChange]);

    return (
        <div className="d-inline px-5">
            <CaretLeftOutlined onClick={prevHandle} />
            <span className="text text-black px-2">{changedWeek}</span>
            <CaretRightOutlined onClick={nextHandle} />
        </div>
    );
}
export function CompanyPicker({ onChange = false }) {
    const [companyList, setCompanyList] = useState([]);
    const [initIndex, setInitIndex] = useState(0);
    const [companycount, setCompanyCount] = useState(0);
    const [selectedCompanyObj, setSelectedCompanyObj] = useState({});
    useEffect(() => {
        (async () => {
            const { result } = await request.list({ entity: "CompanyList" });
            console.log(result, '33333')
            setCompanyCount(result?.length)
            setCompanyList(result);
        })()
    },
        []);
    useEffect(() => {
        setSelectedCompanyObj(companyList[initIndex]);
        if (onChange) onChange(companyList[initIndex]);
    }, [
        companyList, initIndex, onChange
    ])
    const nextHandle = () => {
        if (initIndex === companycount - 1)
            setInitIndex(0)
        else
            setInitIndex(initIndex + 1);
    }
    const prevHandle = () => {
        if (initIndex === 0)
            setInitIndex(companycount - 1)
        else
            setInitIndex(initIndex - 1);
    }
    return (
        <div className="d-inline px-5">
            <CaretLeftOutlined onClick={prevHandle} />
            <span className="text text-black px-2">{selectedCompanyObj?.company_name}</span>
            <CaretRightOutlined onClick={nextHandle} />
        </div>
    );
}
export async function primaryCompanyInfo() {
    const { result } = await request.listById({ entity: 'companyList', jsonData: { primary: true } });
    return result[0];
}
export async function sendEmailWithCreation(data, type, customerInfo, emailFooter) {
    console.log(customerInfo, 'customerInfo');
    var subject = "Confirmación de Reserva ⭐";
    let text = '';
    if (type === 'active') {
        var proudct_tds = '';
        for (var i = 0; i < data.length; i++) {
            const obj = data[i];
            proudct_tds += `<tr>
                <td style="
    border: 1px solid;
">${obj?.product_info?.product_type?.product_name}  -  ${obj?.product_info?.category_name}</td>
                <td style="
    border: 1px solid;
">${obj?.product_info?.product_price}</td>
                <td style="
    border: 1px solid;
">${obj?.paid_amount}</td></tr>
            `
        }
        text = `
            <h3>Hola ${customerInfo?.name}</h3>
            <label>Te hemos reservado un producto en la tienda:</label><br /> <br />
            <table style="
    text-align: center;
    border: 1px solid grey;
    width: 400px;
    border-collapse: collapse;
    padding: 20px;
">
                <thead>
                    <th style="
    border: 1px solid;
">Producto</th>
                    <th style="
    border: 1px solid;
">Valor</th>
                    <th style="
    border: 1px solid;
">Abono</th>
                </thead>
                <tbody>
                    ${proudct_tds}
                </tbody>
            </table>`
        text += ` <br /> <br />Usted cuenta con 60 días para retirar el producto. Cuando realice el pago restante <br />
                 podrá retirar el producto en <a href="https://www.mundoeli.com/contacto/">nuestra tienda física</a> o coordinar un servicio de envío.<br />
                Para más información puede escribir al Whatsapp <a href="https://web.whatsapp.com/send?l=es&phone=50763911319">50763911319</a>.<br />
                ${emailFooter == undefined ? '' : emailFooter}`
    } else if (type === 'preventa') {
        var proudct_tds = '';
        for (var i = 0; i < data.length; i++) {
            const obj = data[i];
            proudct_tds += `<tr>
                <td style="
    border: 1px solid;
">${obj?.product_info?.product_type?.product_name}  -  ${obj?.product_info?.category_name}</td>
                <td style="
    border: 1px solid;
">${obj?.product_info?.product_price}</td>
                <td style="
    border: 1px solid;
">${obj?.paid_amount}</td></tr>
            `
        }
        text = `
            <h3>Hola ${customerInfo?.name}</h3>
            <label>Te hemos creado una reserva con los siguientes datos:</label><br /> <br />
            <table style="
    text-align: center;
    border: 1px solid grey;
    width: 400px;
    border-collapse: collapse;
    padding: 20px;
">
                <thead>
                    <th style="
    border: 1px solid;
">Producto</th>
                    <th style="
    border: 1px solid;
">Valor</th>
                    <th style="
    border: 1px solid;
">Abono</th>
                </thead>
                <tbody>
                    ${proudct_tds}
                </tbody>
            </table>`
        text += ` <br /> <br />Cuando el producto esté en la tienda te notificaremos por esta vía para que puedas <br />
                 retirar el producto en <a href="https://www.mundoeli.com/contacto/">nuestra tienda física</a> o coordinar un servicio de envío.<br />
                Para más información puede escribir al Whatsapp <a href="https://web.whatsapp.com/send?l=es&phone=50763911319">50763911319</a>.<br />
               ${emailFooter == undefined ? '' : emailFooter}`
    } else if (type === 'active_from_preventa') {
        subject = "Producto listo para retirar 😜";
        var proudct_tds = '';
        for (var i = 0; i < data.length; i++) {
            const obj = data[i];
            proudct_tds += `<tr>
                <td style="
    border: 1px solid;
">${obj?.product_info?.product_type?.product_name}  -  ${obj?.product_info?.category_name}</td>
                <td style="
    border: 1px solid;
">${obj?.product_info?.product_price}</td>
                <td style="
    border: 1px solid;
">${obj?.paid_amount}</td></tr>
            `
        }
        text = `
            <h3>Hola ${customerInfo?.name}</h3>
            <label>Ya tenemos disponible el siguiente producto para retirar:</label><br /> <br />
            <table style="
    text-align: center;
    border: 1px solid grey;
    width: 400px;
    border-collapse: collapse;
    padding: 20px;
">
                <thead>
                    <th style="
    border: 1px solid;
">Producto</th>
                    <th style="
    border: 1px solid;
">Valor</th>
                    <th style="
    border: 1px solid;
">Abono</th>
                </thead>
                <tbody>
                    ${proudct_tds}
                </tbody>
            </table>`
        text += `<br /> <br />CUsted cuenta con 60 días para retirar el producto. Cuando realice el pago restante <br />
                 podrá retirar el producto en <a href="https://www.mundoeli.com/contacto/" target="_blank">nuestra tienda física</a> o coordinar un servicio de envío.<br />
                Para más información puede escribir al Whatsapp <a href="https://web.whatsapp.com/send?l=es&phone=50763911319">50763911319</a>.<br />
                ${emailFooter == undefined ? '' : emailFooter}`
    } else if (type === 'to_delivered') {
        subject = "Pedido completado 😃";
        var proudct_tds = '';
        for (var i = 0; i < data.length; i++) {
            const obj = data[i];
            proudct_tds += `<tr>
                <td style="
    border: 1px solid;
">${obj?.product_type?.product_name}  -  ${obj?.product_name?.category_name}</td>
                <td style="
    border: 1px solid;
">${obj?.product_price}</td>
                <td style="
    border: 1px solid;
">${obj?.paid_amount}</td></tr>
            `
        }
        text = `
            <h3>Hola ${customerInfo?.name}</h3>
            <label>La siguiente orden ha sido completada o programada para envío.</label><br /> <br />
            <label>Productos:</label>
            <table style="
    text-align: center;
    border: 1px solid grey;
    width: 400px;
    border-collapse: collapse;
    padding: 20px;
">
                <thead>
                    <th style="
    border: 1px solid;
">Producto</th>
                    <th style="
    border: 1px solid;
">Valor</th>
                    <th style="
    border: 1px solid;
">Abono</th>
                </thead>
                <tbody>
                    ${proudct_tds}
                </tbody>
            </table>`
        text += `<br /> <br />CPara más información puede escribir al Whatsapp <a href="https://web.whatsapp.com/send?l=es&phone=50763911319">50763911319</a>.<br />
           ${emailFooter == undefined ? '' : emailFooter}`
    }
    const result = await axios.post('/send-email', {
        subject, text, to: customerInfo?.email,
    }, {
        withCredentials: true
    });
}