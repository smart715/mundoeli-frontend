import { request } from "@/request";
import { CaretLeftOutlined, CaretRightOutlined } from "@ant-design/icons";
import { Select } from "antd"
import axios from "axios";
import _ from "lodash";
import moment from "moment";
import { useEffect, useState } from "react";
import { useSelector } from 'react-redux';


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
export function YearlyPicker({ onChange, defaultVaule }) {
    const [changedYear, setChangedYear] = useState(defaultVaule ? "Year " + defaultVaule : moment().year());

    useEffect(() => {
        if (onChange) onChange(changedYear);
    }, [
        changedYear, onChange
    ])
    const generateYearList = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = currentYear; year >= currentYear - 10; year--) {
            years.push(year);
        }
        return years;
    };
    const yearList = generateYearList();

    const handleYearChange = (value) => {
        setChangedYear(value);
        if (onChange) onChange(value);
    };
    return (
        <Select value={changedYear} onChange={handleYearChange}>
            {[...yearList].map((year) => {
                return (
                    <Select.Option
                        key={year}
                        value={year}
                    >{"Year " + year} </Select.Option>
                );
            })}
        </Select>
    );
}

export function MonthlyPicker({ onChange, defaultVaule }) {
    const [changedMonth, setChangedMonth] = useState(defaultVaule !== null ? defaultVaule : moment().month());

    useEffect(() => {
        if (onChange) onChange(changedMonth);
    }, [
        changedMonth, onChange
    ])
    const generateMonthList = () => {
        const months = [];
        for (let month = 1; month <= 12; month++) {
            months.push(moment().set('month', month - 1).format('MMMM'));
        }
        return months;
    };

    const monthList = generateMonthList();

    const handleMonthChange = (value) => {
        setChangedMonth(value)
        if (onChange) onChange(value);
    };

    return (
        <Select value={moment().set('month', changedMonth).format('MMMM')} onChange={handleMonthChange}>
            {monthList.map((month, index) => {
                return (
                    <Select.Option
                        key={index}
                        value={index}
                    >
                        {month}
                    </Select.Option>
                );
            })}
        </Select>
    );
}

export function WeeklyPicker({ onChange, selectedYear }) {
    const [defaultWeek, setDefaultWeek] = useState(moment().isoWeek());
    const [defaultYear, setDefaultYear] = useState(moment().year());
    const [changedWeek, setChangedWeek] = useState('');
    useEffect(() => {
        if (selectedYear) {
            setDefaultYear(selectedYear);
        }
    }, [selectedYear]);


    useEffect(() => {
        const startDate = moment().year(defaultYear).isoWeek(defaultWeek).startOf('isoWeek');
        const endDate = moment().year(defaultYear).isoWeek(defaultWeek).endOf('isoWeek');
        setChangedWeek(`Week-${startDate.isoWeek()}  (${startDate.format('MMM Do')} - ${endDate.format('MMM Do, YYYY')})  `);
        if (onChange) onChange(defaultWeek, defaultYear);
    }, [defaultWeek, defaultYear, onChange]);

    const generateWeekList = () => {
        const weeks = [];
        const totalWeeks = moment(defaultYear, "YYYY").isoWeeksInYear();
        for (let weekNum = 1; weekNum <= totalWeeks; weekNum++) {
            const startDate = moment().year(defaultYear).isoWeek(weekNum).startOf('isoWeek');
            const endDate = moment().year(defaultYear).isoWeek(weekNum).endOf('isoWeek');
            if (startDate.isBefore(moment()))
                weeks.push(`Week-${startDate.isoWeek()}  (${startDate.format('MMM Do')} - ${endDate.format('MMM Do, YYYY')})  `);
        }
        return weeks;
    };

    const weekList = generateWeekList();
    const handleWeekChange = (value) => {
        setDefaultWeek(value + 1)
        if (onChange) onChange(defaultWeek, defaultYear);
    };
    return (
        <Select value={changedWeek} onChange={handleWeekChange}>
            {weekList.map((week, index) => {
                return (
                    <Select.Option
                        key={index}
                        value={index}
                    >
                        {week}
                    </Select.Option>
                );
            })}
        </Select>
    );
}
export function CompanyPicker({ onChange = false, defaultVaule = null }) {
    const { is_admin, is_primary_company, company_id } = useSelector((state) => state.auth);
    const [companyList, setCompanyList] = useState([]);
    const [initIndex, setInitIndex] = useState(0);
    const [companycount, setCompanyCount] = useState(0);
    const [selectedCompanyObj, setSelectedCompanyObj] = useState({});
    useEffect(() => {
        (async () => {
            let { result } = await request.list({ entity: "CompanyList", options: { orderBy: 'asc' } });
            const defaultObj = result.find(company => company._id === defaultVaule);
            result = result.filter((company) => (is_admin || company._id === company_id))
            setCompanyCount(result?.length)
            setCompanyList(result);
            setSelectedCompanyObj(defaultObj ? defaultObj : result[initIndex]);
            if (onChange) onChange(defaultObj ? defaultObj : result[initIndex]);
        })()
    },
        []);
    // useEffect(() => {
    //     setSelectedCompanyObj(selectedCompanyObj);
    //     if (onChange) onChange(selectedCompanyObj);
    // }, [
    //     companyList, selectedCompanyObj, onChange
    // ])

    const handleCompanyChange = (value) => {
        const selectedObj = companyList.find(company => company._id === value);
        if (selectedObj) {
            setSelectedCompanyObj(selectedObj)
            if (onChange) onChange(selectedObj);
        }
        // onChange(companyList.find(company => company._id === value))
    };

    return (
        <Select value={selectedCompanyObj?._id} onChange={handleCompanyChange}>
            {[...companyList].map((data) => {
                return (
                    <Select.Option
                        key={data?._id}
                        value={data?._id}
                    >{data?.company_name} </Select.Option>
                );
            })}
        </Select>
    );
}

export function PaymentMethodPicker({ onChange = false, defaultVaule = null }) {
    const [methodList, setMethodList] = useState([]);
    const [selectedMethodObj, setSelectedMethodObj] = useState({});
    useEffect(() => {
        (async () => {
            let { result } = await request.list({ entity: "PaymentMethod", options: { orderBy: 'asc' } });
            let defaultObj = result.find(method => method._id === defaultVaule);
            let methodList = [{ _id: "0", method_name: "All Method" }]
            result.map((method) => (methodList.push({ _id: method._id, method_name: method.method_name })))
            // methodList.push(result);
            if (defaultVaule === null) defaultObj = methodList[0];
            setMethodList(methodList);
            setSelectedMethodObj(defaultObj ? defaultObj : methodList[0]);
            if (onChange) onChange(defaultObj ? defaultObj : methodList[0]);
        })()
    },
        []);

    const handleCompanyChange = (value) => {
        const selectedObj = methodList.find(method => method._id === value);
        if (selectedObj) {
            setSelectedMethodObj(selectedObj)
            if (onChange) onChange(selectedObj);
        }
        // onChange(companyList.find(company => company._id === value))
    };

    return (
        <Select value={selectedMethodObj?._id} onChange={handleCompanyChange}>
            {[...methodList].map((data) => {
                return (
                    <Select.Option
                        key={data?._id}
                        value={data?._id}
                    >{data?.method_name} </Select.Option>
                );
            })}
        </Select>
    );
}
export async function primaryCompanyInfo() {
    const { result } = await request.listById({ entity: 'companyList', jsonData: { primary: true } });
    return result[0];
}
export async function sendEmailWithCreation(data, type, customerInfo) {
    console.log("---sendEmailWithCreation", customerInfo, data);
    return;
    const { result: ret } = await request.list({ entity: 'systemInfo' });
    const emailFooter = ret[0]?.email_footer;
    var subject = "Confirmación de Reserva ⭐";
    let text = '';
    if (type === 'active') {
        var proudct_tds = '';
        for (var i = 0; i < data.length; i++) {
            const obj = data[i];

            if (obj.product_info)
                proudct_tds += `<tr>
                <td style="border: 1px solid;">${obj?.product_info?.product_type?.product_name}  -  ${obj?.product_info?.category_name}</td>
                <td style="border: 1px solid;">$${priceFormat(obj?.product_info?.product_price)}</td>
                <td style="border: 1px solid;">$${priceFormat(obj?.paid_amount)}</td></tr>`
            else
                proudct_tds += `<tr>
                <td style="border: 1px solid;">${obj?.product_type?.product_name}  -  ${obj?.product_name?.category_name}</td>
                <td style="border: 1px solid;">$${priceFormat(obj?.product_price)}</td>
                <td style="border: 1px solid;">$${priceFormat(obj?.paid_amount)}</td></tr>`
        }
        text = `
            <h3>Hola ${customerInfo?.name}</h3>
            <label>Te hemos reservado un producto en la tienda:</label><br /> <br />
            <table style="text-align: center;border: 1px solid grey;    width: 400px;    border-collapse: collapse;    padding: 20px;">
                <thead>
                    <th style="border: 1px solid;">Producto</th><th style="border: 1px solid;">Valor</th>
                    <th style="border: 1px solid;">Abono</th>
                </thead>
                <tbody>
                    ${proudct_tds}
                </tbody>
            </table>`
        text += `<br /> *Los precios de esta tabla no reflejan los ITBMS.`;
        text += `<br /> <br />Usted cuenta con 60 días para retirar el producto. Cuando realice el pago restante podrá retirar el producto en <a href="https://www.mundoeli.com/contacto/" target="_blank">nuestra tienda física</a> o coordinar un servicio de envío.<br /><br />
                Para más información puede escribir al Whatsapp <a href="https://web.whatsapp.com/send?l=es&phone=50763911319">50763911319</a>.<br />
                ${emailFooter == undefined ? '' : emailFooter}`
    } else if (type === 'preventa') {
        var proudct_tds = '';
        for (var i = 0; i < data.length; i++) {
            const obj = data[i];
            if (obj.product_info)
                proudct_tds += `<tr>
                <td style="border: 1px solid;">${obj?.product_info?.product_type?.product_name}  -  ${obj?.product_info?.category_name}</td>
                <td style="border: 1px solid;">$${priceFormat(obj?.product_info?.product_price)}</td>
                <td style="border: 1px solid;">$${priceFormat(obj?.paid_amount)}</td></tr>`
            else
                proudct_tds += `<tr>
                <td style="border: 1px solid;">${obj?.product_type?.product_name}  -  ${obj?.product_name?.category_name}</td>
                <td style="border: 1px solid;">$${priceFormat(obj?.product_price)}</td>
                <td style="border: 1px solid;">$${priceFormat(obj?.paid_amount)}</td></tr>`
        }
        text = `
            <h3>Hola ${customerInfo?.name}</h3>
            <label>Te hemos creado una reserva con los siguientes datos:</label><br /> <br />
            <table style="text-align: center;    border: 1px solid grey;    width: 400px;    border-collapse: collapse;    padding: 20px;">
                <thead>
                    <th style="border: 1px solid;">Producto</th>
                    <th style="border: 1px solid;">Valor</th>
                    <th style="border: 1px solid;">Abono</th>
                </thead>
                <tbody>
                    ${proudct_tds}
                </tbody>
            </table>`
        text += `<br /> *Los precios de esta tabla no reflejan los ITBMS.`;
        text += ` <br /> <br />Cuando el producto esté en la tienda te notificaremos por esta vía para que puedas retirar el producto en <a href="https://www.mundoeli.com/contacto/">nuestra tienda física</a> o coordinar un servicio de envío.<br /><br />
                Para más información puede escribir al Whatsapp <a href="https://web.whatsapp.com/send?l=es&phone=50763911319">50763911319</a>.<br />
               ${emailFooter == undefined ? '' : emailFooter}`
    } else if (type === 'active_from_preventa') {
        subject = "Producto listo para retirar 😜";
        var proudct_tds = '';
        for (var i = 0; i < data.length; i++) {
            const obj = data[i];

            if (obj.product_info)
                proudct_tds += `<tr>
                <td style="border: 1px solid;">${obj?.product_info?.product_type?.product_name}  -  ${obj?.product_info?.category_name}</td>
                <td style="border: 1px solid;">$${priceFormat(obj?.product_info?.product_price)}</td>
                <td style="border: 1px solid;">$${priceFormat(obj?.paid_amount)}</td></tr>  `
            else
                proudct_tds += `<tr>
                <td style="border: 1px solid;">${obj?.product_type?.product_name}  -  ${obj?.product_name?.category_name}</td>
                <td style="border: 1px solid;">$${priceFormat(obj?.product_price)}</td>
                <td style="border: 1px solid;">$${priceFormat(obj?.paid_amount)}</td></tr>`

        }
        text = `            <h3>Hola ${customerInfo?.name}</h3>
            <label>Ya tenemos disponible el siguiente producto para retirar:</label><br /> <br />
            <table style="text-align: center;    border: 1px solid grey;    width: 400px;    border-collapse: collapse;    padding: 20px;">
                <thead>
                    <th style="border: 1px solid;">Producto</th>
                    <th style="border: 1px solid;">Valor</th>
                    <th style="border: 1px solid;">Abono</th>
                </thead>
                <tbody>
                    ${proudct_tds}
                </tbody>
            </table>`
        text += `<br /> *Los precios de esta tabla no reflejan los ITBMS.`;
        text += `<br /> <br />Usted cuenta con 60 días para retirar el producto. Cuando realice el pago restante podrá retirar el producto en <a href="https://www.mundoeli.com/contacto/" target="_blank">nuestra tienda física</a> o coordinar un servicio de envío.<br /><br />
                Para más información puede escribir al Whatsapp <a href="https://web.whatsapp.com/send?l=es&phone=50763911319">50763911319</a>.<br />
                ${emailFooter == undefined ? '' : emailFooter}`
    } else if (type === 'to_delivered') {
        subject = "Pedido completado 😃";
        var proudct_tds = '';
        for (var i = 0; i < data.length; i++) {
            const obj = data[i];
            if (obj.product_info)
                proudct_tds += `<tr>
                <td style="border: 1px solid;">${obj?.product_info?.product_type?.product_name}  -  ${obj?.product_info?.category_name}</td>
                <td style="border: 1px solid;">$${priceFormat(obj?.product_info?.product_price)}</td>
                <td style="border: 1px solid;">$${priceFormat(obj?.paid_amount)}</td></tr>`
            else
                proudct_tds += `<tr>
                <td style="border: 1px solid;">${obj?.product_type?.product_name}  -  ${obj?.product_name?.category_name}</td>
                <td style="border: 1px solid;">$${priceFormat(obj?.product_price)}</td>
                <td style="border: 1px solid;">$${priceFormat(obj?.paid_amount)}</td></tr>`
        }
        text = `
            <h3>Hola ${customerInfo?.name}</h3>
            <label>La siguiente orden ha sido completada o programada para envío.</label><br /> <br />
            <label>Productos:</label>
            <table style="text-align: center;    border: 1px solid grey;    width: 400px;    border-collapse: collapse;    padding: 20px;">
                <thead>
                    <th style="border: 1px solid;">Producto</th>
                    <th style="border: 1px solid;">Valor</th>
                    <th style="border: 1px solid;">Abono</th>
                </thead>
                <tbody>
                    ${proudct_tds}
                </tbody>
            </table>`
        text += `<br /> *Los precios de esta tabla no reflejan los ITBMS.`;
        text += `<br /> <br />Para más información puede escribir al Whatsapp <a href="https://web.whatsapp.com/send?l=es&phone=50763911319">50763911319</a>.<br />
           ${emailFooter == undefined ? '' : emailFooter}`
    }
    const result = await axios.post('/send-email', {
        subject, text, to: customerInfo?.email,
    }, {
        withCredentials: true
    });
}