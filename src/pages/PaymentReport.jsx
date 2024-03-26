import { DashboardLayout } from "@/layout";
import { Layout, PageHeader, Table, Button, Card } from "antd";
import { CompanyPicker, MonthlyPicker, YearlyPicker, priceFormat, WeeklyPicker } from "./common";
import { useCallback, useEffect, useState } from "react";
import { request } from "@/request";
import moment from "moment";
import _ from "lodash";

const SecondReportView = () => {
    const [selectedCompany, setSelectedCompany] = useState();
    const [selectedYear, setSelectedYear] = useState('2024');
    const [selectedWeek, setSelectedWeek] = useState('');
    const [paymentInfos, setPaymentInfos] = useState([]);
    const [initData, setInitData] = useState([]);
    const [reportColumn, setReportColumn] = useState([]);
    const [showTable, setShowTable] = useState(false)
    const [totalAmount, setTotalAmount] = useState(0)
    const { is_admin: is_admin } = JSON.parse(localStorage?.auth)
    const { company_id: company_id } = JSON.parse(localStorage?.auth)
    useEffect(() => {
        (async () => {
            const { result } = await request.list({ entity: 'paymentHistory' });
            setPaymentInfos(result);
        })()
    },
        []);
    useEffect(() => {
        setShowTable(false)
        setTotalAmount(0)

        setInitData([])
        if (is_admin == true || company_id == selectedCompany?._id) {
            setShowTable(true)
        }
        const filteredPayments = paymentInfos.filter(payment => {
            // Get the week and year of the payment creation date
            const paymentWeek = moment(payment.created).week();
            const paymentYear = moment(payment.created).year();

            // Check if the payment's week and year match the selected week and year
            if (paymentWeek === selectedWeek && paymentYear === selectedYear) {
                // Check if the payment's user_id's company_id matches the selected company
                if (payment?.user_id?.company_id === selectedCompany?._id) {
                    return true; // Payment matches the filter criteria
                }
            }
            return false; // Payment does not match the filter criteria
        });
        console.log('%cfrontend\src\pages\PaymentReport.jsx:56 filteredPayments', 'color: #007acc;', filteredPayments);
        let totalAmount = 0
        totalAmount = filteredPayments.map(payment => {
            return payment.sub_total
        });
        setTotalAmount(totalAmount)
        const processedPayments = filteredPayments.map(payment => {
            return payment.orders.map(order => {
                return {
                    date: moment(payment.created).format('YYYY-MM-DD'),
                    productName: order._id.product_name,
                    productPrice: order._id.product_price,
                    productType: order._id.product_type.product_name,
                    userName: payment.user_id.name
                };
            });

        });

        console.log('%cfrontend\src\pages\PaymentReport.jsx:56 processedPayments', 'color: #007acc;', processedPayments);
        if (selectedCompany && selectedYear && selectedWeek && processedPayments.length > 0) {
            const _reportColumn = [{
                title: 'Date',
                dataIndex: 'date',

            },
            {
                title: 'product Name',
                dataIndex: 'productType',
                width: 200
            }
                ,
            {
                title: 'product Name',
                dataIndex: 'productPrice',
                width: 200
            }
                ,
            {
                title: 'productType',
                dataIndex: 'productName',
                width: 200
            },
            {
                title: 'User',
                dataIndex: 'userName',
                width: 200
            }]

            setReportColumn(_reportColumn);
            setInitData(processedPayments[0]);
        }
    }, [
        selectedCompany, selectedYear, paymentInfos, selectedWeek
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
            <PageHeader title="Monthly Reports" onBack={() => { window['history'].back() }}
            ></PageHeader>
            <Layout>
                <div className="d-inline">
                    <YearlyPicker onChange={setSelectedYear} />
                    <WeeklyPicker onChange={setSelectedWeek} selectedYear={selectedYear} />
                    <CompanyPicker onChange={setSelectedCompany} />
                    <Button id="btnExport" onClick={handleClick}>Export</Button>
                    &nbsp;
                    &nbsp;
                    <Button type="primary">{totalAmount}</Button>
                </div>
                <div className="d-inline py-6 overflow-scroll h-450px">
                    {showTable ? <Table columns={reportColumn} dataSource={initData} rowKey={(item) => item.row_id} pagination={paginationConfig} /> : <>You can't access this company's data</>}
                </div>
            </Layout>
        </DashboardLayout>
    );
}


export default SecondReportView