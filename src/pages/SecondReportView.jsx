import { DashboardLayout } from "@/layout";
import { Layout, PageHeader, Table, Button } from "antd";
import { CompanyPicker, MonthlyPicker, YearlyPicker, priceFormat } from "./common";
import { useCallback, useEffect, useState } from "react";
import { request } from "@/request";
import moment from "moment";
import _ from "lodash";

const SecondReportView = () => {
    const [selectedCompany, setSelectedCompany] = useState();
    const [selectedYear, setSelectedYear] = useState();
    const [selectedMonth, setSelectedMonth] = useState();
    const [paymentInfos, setPaymentInfos] = useState([]);
    const [initData, setInitData] = useState([]);
    const [reportColumn, setReportColumn] = useState([]);
    const [showTable, setShowTable] = useState(false)
    const { is_admin: is_admin } = JSON.parse(localStorage?.auth)
    const { company_id: company_id } = JSON.parse(localStorage?.auth)
    useEffect(() => {
        (async () => {
            const { result } = await request.list({ entity: 'paymentHistory' });
            setPaymentInfos(result);
        })()
    },
        []);
    const getPaymentObjWithDate = useCallback((date_str, product) => {
        var amount = 0, count = 0;
        const customisedPaymentInfo = customisePaymentInfos(paymentInfos);
        for (var i = 0; i < customisedPaymentInfo?.length; i++) {
            var obj = customisedPaymentInfo[i];
            const payment_created = moment(new Date(obj?.created)).format('YYYY-MM-DD');
            if (obj?.product_type === product?._id && payment_created === date_str) {
                amount += parseFloat(obj?.amount) * 1;
                count++;
            }
        }
        return [amount, count];
    }, [paymentInfos]);
    const customisePaymentInfos = (_paymentInfos) => {
        var arr = [];
        for (var i = 0; i < _paymentInfos?.length; i++) {
            var obj = _paymentInfos[i];
            if (obj?.status === 1) {
                if (obj?.checkout) {
                    var _arr = obj?.orders;
                    for (var _i = 0; _i < _arr?.length; _i++) {
                        arr.push({
                            amount: priceFormat(_arr[_i]?._id?.product_price),
                            count: _arr[_i]?.count,
                            product_type: _arr[_i]?._id?.product_type?._id,
                            created: obj?.created
                        })
                    }
                } else {
                    var __arr = obj?.reservation;
                    for (var i_ = 0; i_ < __arr?.length; i_++) {
                        arr.push({
                            amount: priceFormat(__arr[i_]?.amount),
                            count: 1,
                            product_type: __arr[i_]?.reserva_id?.product_type?._id,
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
        for (var i = 0; i < 31; i++) {
            const element = data[`day_${i + 1}`] || 0;
            amount += element;
        }
        return amount;
    }
    const getTotalCount = (data) => {
        var count = 0;
        for (var i = 0; i < 31; i++) {
            const element = data[`day_${i + 1}_count`] || 0;
            count += element;
        }
        return count;
    }
    useEffect(() => {
        setShowTable(false)
        if (is_admin == true || company_id == selectedCompany?._id) {
            setShowTable(true)
        }
        if (selectedCompany && selectedYear) {
            (async () => {
                const monthCount = moment().set('year', selectedYear).set('month', selectedMonth).daysInMonth()
                const _reportColumn = [{
                    title: 'ProductType',
                    dataIndex: 'product_type',
                    width: 200

                },
                {
                    title: 'Total',
                    dataIndex: 'total_label',
                    width: 200
                }]
                for (var i = 0; i < monthCount; i++) {
                    _reportColumn.push({
                        title: i + 1,
                        dataIndex: `day_${i + 1}_count`,
                        width: 20
                    });
                }
                setReportColumn(_reportColumn);
                const { result: _productTypes } = await request.listById({ entity: 'productTypes', jsonData: { company_name: selectedCompany?._id } });

                var obj = {}, reportData = [];
                for (var i = 0; i < [..._productTypes]?.length; i++) {
                    var product = _productTypes[i];
                    obj['row_id'] = i;
                    obj['product_type'] = product?.product_name;
                    for (var j = 0; j < monthCount; j++) {
                        const date_str = moment(new Date(`${selectedYear}-${selectedMonth + 1}-${j + 1}`)).format('YYYY-MM-DD');
                        obj[`day_${j + 1}`] = getPaymentObjWithDate(date_str, { ...product })[0];
                        obj[`day_${j + 1}_count`] = getPaymentObjWithDate(date_str, { ...product })[1];
                    }
                    obj['total_amount'] = getTotalAmount(obj);
                    obj['total_count'] = getTotalCount(obj);
                    obj['total_label'] = `${obj['total_count']} / $${priceFormat(obj['total_amount'])}`;
                    reportData.push(obj);
                    product = {};
                    obj = {};
                }
                const _obj = {};
                for (var _j = 0; _j < 31; _j++) {
                    _obj[`day_${_j + 1}_count`] = _.sumBy(reportData, `day_${_j + 1}_count`)
                }
                reportData.push({
                    product_type: "Total",
                    row_id: reportData.length,
                    total_label: `${_.sumBy(reportData, 'total_count')} / $${priceFormat(_.sumBy(reportData, 'total_amount'))}`,
                    ..._obj
                })
                setInitData(reportData);
            })()
        }
    }, [
        selectedCompany, getPaymentObjWithDate, selectedYear, paymentInfos, selectedMonth
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
        var fileName = `second_report_${fullDateString}.xls`;
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
                    <MonthlyPicker onChange={setSelectedMonth} />
                    <CompanyPicker onChange={setSelectedCompany} />
                    <Button id="btnExport" onClick={handleClick}>Export</Button>
                </div>
                <div className="d-inline py-6 overflow-scroll h-450px">
                    {showTable ? <Table columns={reportColumn} dataSource={initData} rowKey={(item) => item.row_id} pagination={paginationConfig} /> : <>You can't access this company's data</>}
                </div>
            </Layout>
        </DashboardLayout>
    );
}


export default SecondReportView