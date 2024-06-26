import { DashboardLayout } from "@/layout";
import { Layout, PageHeader, Table, Button } from "antd";
import { CompanyPicker, YearlyPicker, priceFormat } from "./common";
import { useCallback, useEffect, useState } from "react";
import { request } from "@/request";
import moment from "moment";
import _ from "lodash";

const FirstReportView = () => {
    const [selectedCompany, setSelectedCompany] = useState();
    const [selectedYear, setSelectedYear] = useState();
    const [paymentInfos, setPaymentInfos] = useState([]);
    const [initData, setInitData] = useState([])
    const [showTable, setShowTable] = useState(false)
    const { is_admin: is_admin } = JSON.parse(localStorage?.auth)
    const { company_id: company_id } = JSON.parse(localStorage?.auth)
    const [isLoading, setIsLoading] = useState(true);
    const [totalAmount, setTotalAmount] = useState(0)
    useEffect(() => {
        (async () => {
            const { result } = await request.list({ entity: 'paymentHistory' });
            setPaymentInfos(result);
        })()
    },
        []);
    const getPaymentObjWithDate = useCallback((date_str, selectedCompany) => {
        var amount = 0, count = 0;
        const customisedPaymentInfo = customisePaymentInfos(paymentInfos)
        for (var i = 0; i < customisedPaymentInfo?.length; i++) {
            var obj = customisedPaymentInfo[i];
            const payment_created = moment(new Date(obj?.created)).format('YYYY-MM-DD');
            if (obj?.company_name === selectedCompany?._id && payment_created === date_str) {
                amount += parseFloat(obj?.amount) * 1;
                count++;
            }
        }
        return [amount, count];
    }, [paymentInfos]);
    const customisePaymentInfos = (_paymentInfos) => {
        console.log("paymentInfos", _paymentInfos);
        var arr = [];
        for (var i = 0; i < _paymentInfos?.length; i++) {
            var obj = _paymentInfos[i];
            if (obj?.status === 1) {
                if (obj?.orders) {
                    var _arr = obj?.orders;
                    for (var _i = 0; _i < _arr?.length; _i++) {
                        arr.push({
                            amount: priceFormat(_arr[_i]?.product_price) * _arr[_i]?.count,
                            count: _arr[_i]?.count,
                            company_name: _arr[_i]?._id?.product_type?.company_name?._id,
                            created: obj?.created
                        })
                    }
                }
                if (obj?.reservation) {
                    var __arr = obj?.reservation;
                    for (var i_ = 0; i_ < __arr?.length; i_++) {
                        if (__arr[i_]?.reserva_id?.status === 2)
                            arr.push({
                                amount: priceFormat(__arr[i_]?.amount),
                                count: 1,
                                company_name: __arr[i_]?.reserva_id?.product_type?.company_name?._id,
                                created: obj?.created
                            })
                    }
                }
            }
        }
        return arr;
    }
    const getTotalAmount = (data) => {
        var amount = 0;
        for (const key in data) {
            if (Object.hasOwnProperty.call(data, key)) {
                const element = data[key];
                if (key.includes('day_')) {
                    amount += element;
                }
            }
        }
        return amount;
    }
    useEffect(() => {
        setShowTable(false)
        if (is_admin == true || company_id == selectedCompany?._id) {
            setShowTable(true)
        }
        if (selectedCompany && selectedYear) {
            var obj = {}, reportData = [];
            for (var i = 0; i < 12; i++) {
                var monthName = moment().set('months', i).format('MMMM');
                obj[`month_name`] = monthName;
                obj['total_count'] = 0;
                obj['total_amount'] = 0;
                for (var j = 0; j < 31; j++) {
                    const date_str = moment(new Date(`${selectedYear}-${i + 1}-${j + 1}`)).format('YYYY-MM-DD');
                    obj[`day_${j + 1}_amount`] = getPaymentObjWithDate(date_str, selectedCompany)[0];
                    obj[`day_${j + 1}_count`] = getPaymentObjWithDate(date_str, selectedCompany)[1];
                    obj['total_count'] += obj[`day_${j + 1}_count`];
                    obj['total_amount'] += obj[`day_${j + 1}_amount`];
                    obj[`day_${j + 1}`] = `${obj[`day_${j + 1}_count`]} / $${priceFormat(obj[`day_${j + 1}_amount`])}`;
                };
                obj['row_id'] = i;
                reportData.push(obj);
                obj = {};
            }
            const _obj = {};
            let total_amount = 0;
            for (var _j = 0; _j < 31; _j++) {
                _obj[`day_${_j + 1}`] = `${_.sumBy(reportData, `day_${_j + 1}_count`)} / $${priceFormat(_.sumBy(reportData, `day_${_j + 1}_amount`))}`
                total_amount += _.sumBy(reportData, `day_${_j + 1}_amount`);
            }
            setTotalAmount(total_amount);
            // reportData.push({
            //     month_name: "Total",
            //     row_id: reportData.length,
            //     total_count: _.sumBy(reportData, 'total_count'),
            //     total_amount: _.sumBy(reportData, 'total_amount'),
            //     ..._obj
            // })
            reportData.map((obj) => {
                obj.total_amount = `${obj['total_count']} / $${priceFormat(obj['total_amount'])}`;
                return obj;
            })
            setIsLoading(false);
            setInitData(reportData);
        }
    }, [
        selectedCompany, getPaymentObjWithDate, selectedYear, paymentInfos
    ]);
    var reportColumn = [
        {
            title: 'Month',
            dataIndex: 'month_name',
            width: 150,
            fixed: 'left',
            render: (text) => (
                <div style={{ whiteSpace: 'nowrap' }}>{text}</div>
            ),
        },
        {
            title: 'Total',
            dataIndex: 'total_amount',
            width: 150,
            render: (text) => (
                <div style={{ whiteSpace: 'nowrap' }}>{text}</div>
            ),
        }
    ]
    for (var i = 0; i < 31; i++) {
        reportColumn.push({
            title: i + 1,
            dataIndex: `day_${i + 1}`,
            render: (text) => (
                <div style={{ whiteSpace: 'nowrap' }}>{text}</div>
            ),
        });
    }
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
        var fileName = `first_report_${fullDateString}.xls`;
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
            <PageHeader title="Annual Sales Report" onBack={() => { window['history'].back() }}
            ></PageHeader>
            <Layout>
                <div className="d-inline">
                    <YearlyPicker onChange={setSelectedYear} />&nbsp;
                    <CompanyPicker onChange={setSelectedCompany} />&nbsp;
                    <Button id="btnExport" onClick={handleClick}>Export</Button>
                    <div style={{ float: 'right' }}>
                        <Button type="primary">Total Sales: ${totalAmount > 0 ? parseFloat(totalAmount)?.toFixed(2) : 0}</Button>
                    </div>
                </div>
                <div id="dvData" className="d-inline py-6 overflow-scroll h-500px">
                    {showTable ? <Table columns={reportColumn} dataSource={initData} rowKey={(item) => item.row_id} pagination={paginationConfig} scroll={{ x: true }} loading={isLoading} /> : <>You can't access this company's data</>}

                </div>
            </Layout>

        </DashboardLayout>
    );
}


export default FirstReportView