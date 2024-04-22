import { DashboardLayout } from "@/layout";
import { Layout, PageHeader, Table, Button, Card } from "antd";
import { CompanyPicker, PaymentMethodPicker, YearlyPicker, priceFormat, WeeklyPicker, primaryCompanyInfo } from "./common";
import { useCallback, useEffect, useState } from "react";
import { request } from "@/request";
import moment from "moment";
import _ from "lodash";
import { useSelector } from 'react-redux';

const SecondReportView = () => {
    const { is_admin, company_id } = useSelector((state) => state.auth);
    const [selectedCompany, setSelectedCompany] = useState(company_id);
    const [selectedMethod, setSelectedMethod] = useState();
    const [selectedYear, setSelectedYear] = useState('2024');
    const [selectedWeek, setSelectedWeek] = useState('');
    const [paymentInfos, setPaymentInfos] = useState([]);
    const [initData, setInitData] = useState([]);
    const [reportColumn, setReportColumn] = useState([]);
    const [showTable, setShowTable] = useState(false)
    const [totalAmount, setTotalAmount] = useState(0)
    const [primaryAmount, setPrimaryAmount] = useState(0)
    const [primaryCompany, setPrimaryCompany] = useState(0)
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        (async () => {
            const { result } = await request.list({ entity: 'paymentHistory' });
            setPaymentInfos(result);
            const { result: ret } = await request.listById({ entity: 'companyList', jsonData: { primary: true } });
            setPrimaryCompany(ret[0]);

            setIsLoading(false);
        })()
    },
        []);
    useEffect(() => {
        console.log("selectedCompany", selectedCompany);
        setShowTable(false)
        setTotalAmount(0)

        setInitData([])
        if (is_admin === true || company_id === selectedCompany?._id) {
            setShowTable(true)
        }

        console.log('%cfrontend\src\pages\PaymentReport.jsx:56 paymentInfos', 'color: #007acc;', paymentInfos);
        let totalAmount = 0;
        let primaryAmount = 0;
        let processedPayments = [].concat(...paymentInfos.map(payment => {
            const paymentWeek = moment(payment.created).isoWeek();
            const paymentYear = moment(payment.created).year();
            if (payment.orders)
                return payment.orders.filter(order =>
                    (selectedMethod?._id === '0' || payment?.method_id?._id === selectedMethod?._id) &&
                    paymentWeek === selectedWeek &&
                    paymentYear === selectedYear &&
                    order._id.product_type.company_name._id === selectedCompany?._id
                ).map(order => {
                    totalAmount += payment.order_price * order.product_price * order.count / payment.sub_total;
                    if (payment?.user_id?.company_id === primaryCompany._id) {
                        primaryAmount += (payment.order_price * order.product_price * order.count / payment.sub_total)
                            * (100 - (payment.method_id?.deduction ? payment.method_id?.deduction : 0)) / 100;
                    }
                    return {
                        date: moment(payment.created).format('DD/MM/YY hh:mm:ss A'),
                        productName: order._id.product_name,
                        productPrice: '$' + priceFormat(order.product_price),
                        productType: order._id.product_type.product_name,
                        customerName: 'P' + payment.payment_id + ' | ' + (payment.customer_id?.name ? payment.customer_id?.name : 'checkout'),
                        description: order.product_description || '',
                        deduction: payment.method_id?.method_name + "-$" + parseFloat(order.product_price * order.count * (payment.method_id?.deduction ? payment.method_id?.deduction : 0) / 100).toFixed(2),
                        mPayment: payment?.user_id?.company_id === primaryCompany._id ? '$' + parseFloat(order.product_price * order.count * (payment.method_id?.deduction ? 100 - payment.method_id?.deduction : 100) / 100).toFixed(2) : '$0.00',
                        userName: payment.user_id?.name
                    };
                });
        }));
        processedPayments = processedPayments.concat(...paymentInfos.map(payment => {
            if (payment.reservation)
                return payment.reservation.filter(reserver =>
                    (selectedMethod?._id === '0' || reserver?.reserva_id?.method?._id === selectedMethod?._id) &&
                    reserver?.reserva_id.status === 2 &&
                    moment(reserver.reserva_id.delivered_date).isoWeek() === selectedWeek &&
                    moment(reserver.reserva_id.delivered_date).year() === selectedYear &&
                    reserver.reserva_id.product_type.company_name._id === selectedCompany?._id
                ).map(reserver => {
                    totalAmount += reserver.amount;

                    if (payment?.user_id?.company_id === primaryCompany._id) {
                        primaryAmount += reserver.amount * (100 - (reserver.reserva_id.method.deduction ? reserver.reserva_id.method.deduction : 0)) / 100;
                    }
                    return {
                        date: moment(reserver.reserva_id.delivered_date).format('DD/MM/YY hh:mm:ss A'),
                        productName: reserver.reserva_id.product_name.category_name,
                        productPrice: '$' + priceFormat(reserver.reserva_id.product_price),
                        productType: reserver.reserva_id.product_type.product_name,
                        customerName: 'R' + reserver.reserva_id.reserva_id + ' - P' + payment.payment_id + ' | ' + payment.customer_id?.name,
                        description: reserver?.reserva_id?.notes || '',
                        deduction: reserver.reserva_id.method.method_name + "-$" + parseFloat(reserver.amount * (reserver.reserva_id.method.deduction ? reserver.reserva_id.method.deduction : 0) / 100).toFixed(2),
                        mPayment: payment?.user_id?.company_id === primaryCompany._id ? '$' + parseFloat(reserver.amount * (reserver.reserva_id.method.deduction ? 100 - reserver.reserva_id.method.deduction : 100) / 100).toFixed(2) : '$0.00',
                        userName: payment.user_id?.name
                    };
                });
        }));
        setTotalAmount(totalAmount)
        setPrimaryAmount(primaryAmount)

        console.log('%cfrontend\src\pages\PaymentReport.jsx:56 processedPayments', 'color: #007acc;', processedPayments);
        if (selectedCompany && selectedYear && selectedWeek) {
            const _reportColumn = [{
                title: 'Date',
                dataIndex: 'date',
                fixed: 'left',
                width: 200,
                render: (text) => (
                    <div style={{ whiteSpace: 'nowrap' }}>{text}</div>
                ),
            },
            {
                title: 'Type',
                dataIndex: 'productType',
                width: 200,
                render: (text) => (
                    <div style={{ whiteSpace: 'nowrap' }}>{text}</div>
                ),
            },
            {
                title: 'Product',
                dataIndex: 'productName',
                width: 200,
                render: (text) => (
                    <div style={{ whiteSpace: 'nowrap' }}>{text}</div>
                ),
            },
            {
                title: 'Customer',
                dataIndex: 'customerName',
                width: 200,
                render: (text) => (
                    <div style={{ whiteSpace: 'nowrap' }}>{text}</div>
                ),
            },
            {
                title: 'Description',
                dataIndex: 'description',
                width: 200,
                render: (text) => (
                    <div style={{ whiteSpace: 'nowrap' }}>{text}</div>
                ),
            },
            {
                title: 'Item Price',
                dataIndex: 'productPrice',
                width: 200,
                render: (text) => (
                    <div style={{ whiteSpace: 'nowrap' }}>{text}</div>
                ),
            },
            {
                title: 'Deduction',
                dataIndex: 'deduction',
                width: 200,
                render: (text) => (
                    <div style={{ whiteSpace: 'nowrap' }}>{text}</div>
                ),
            },
            {
                title: 'Payment',
                dataIndex: 'mPayment',
                width: 200,
                render: (text) => (
                    <div style={{ whiteSpace: 'nowrap' }}>{text}</div>
                ),
            },
            {
                title: 'User',
                dataIndex: 'userName',
                width: 200,
                render: (text) => (
                    <div style={{ whiteSpace: 'nowrap' }}>{text}</div>
                ),
            }
            ]

            setReportColumn(_reportColumn);
            setInitData(processedPayments);
        }
    }, [
        primaryCompany, selectedCompany, selectedMethod, selectedYear, paymentInfos, selectedWeek
    ]);
    const paginationConfig = {
        pageSize: 100,
        showSizeChanger: true,
    };
    const handleClick = (e) => {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
        const day = ('0' + currentDate.getDate()).slice(-2);
        const hours = ('0' + currentDate.getHours()).slice(-2);
        const minutes = ('0' + currentDate.getMinutes()).slice(-2);
        const seconds = ('0' + currentDate.getSeconds()).slice(-2);
        const milliseconds = ('00' + currentDate.getMilliseconds()).slice(-3);

        const fullDateString = `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;

        const table = document.querySelector(".ant-table-content > table");
        var tableHTML = table.outerHTML;
        var fileName = `paymentReport_${fullDateString}.xls`;
        var a = document.createElement('a');
        tableHTML = tableHTML.replace(/  /g, '').replace(/ /g, '%20'); // replaces spaces
        a.href = 'data:application/vnd.ms-excel,' + tableHTML;
        a.setAttribute('download', fileName);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
    return (
        <DashboardLayout>
            <PageHeader title="Mundoeli Weekly Reports" onBack={() => { window['history'].back() }}
            ></PageHeader>
            <Layout>
                <div className="d-inline">
                    <YearlyPicker onChange={setSelectedYear} />&nbsp;
                    <WeeklyPicker onChange={setSelectedWeek} selectedYear={selectedYear} />&nbsp;
                    <CompanyPicker onChange={setSelectedCompany} />&nbsp;
                    <PaymentMethodPicker onChange={setSelectedMethod} />&nbsp;
                    <Button id="btnExport" onClick={handleClick}>Export</Button>
                    &nbsp;
                    &nbsp;
                    <div style={{ float: 'right' }}>
                        <Button type="primary">Total Sales: ${totalAmount > 0 ? parseFloat(totalAmount)?.toFixed(2) : 0}</Button>
                        &nbsp;
                        <Button type="primary">Mundoeli Payment: ${primaryAmount > 0 ? parseFloat(primaryAmount)?.toFixed(2) : 0}</Button>
                    </div>
                </div>
                <div className="d-inline py-6 overflow-scroll h-450px">
                    {showTable ? <Table columns={reportColumn} dataSource={initData} rowKey={(item) => item.row_id} pagination={paginationConfig} loading={isLoading} /> : <>You can't access this company's data</>}
                </div>
            </Layout>
        </DashboardLayout>
    );
}


export default SecondReportView