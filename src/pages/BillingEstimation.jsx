import { crud } from "@/redux/crud/actions";
import { selectListsByCustomerStores, selectListsByInvoice, selectListsByRecurrent, } from "@/redux/crud/selectors";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Checkbox, Col, DatePicker, Form, Input, InputNumber, Modal, Popconfirm, Radio, Row, Select, Table, Typography } from "antd";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";


const BillingEsmitaion = (props) => {
    const entity = 'invoiceHistory';
    const dispatch = useDispatch();
    const currentEmployeeId = props.parentId
    const Columns = [
        {
            title: 'Month',
            dataIndex: 'start_date',

        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            render: (_) => {
                return _ ? _.toFixed(2) : 0
            }
        },
    ];

    const [invoices, setInvoices] = useState([]);
    const { result: Invoices } = useSelector(selectListsByInvoice);


    useEffect(() => {
        const id = currentEmployeeId;
        const jsonData = { parent_id: id }
        dispatch(crud.listByInvoice({ entity, jsonData }));
    }, []);
    useEffect(() => {

        if (Invoices.items) {
            const invoices = Invoices.items;
            let currentDate = moment(new Date().setMonth(new Date().getMonth() + 1));
            var date = new Date();
            date.setMonth(date.getMonth() + 12);
            const end = moment(date);
            const estimations = [];
            while (currentDate.isSameOrBefore(end)) {
                estimations.push({
                    start_date: currentDate.format('MM/YYYY'),
                    amount: 0
                })
                currentDate = currentDate.add(1, 'months');
            }
            estimations.map(eObj => {
                invoices.map(iObj => {
                    if (parseInt(eObj.start_date.split("/")[0]) === parseInt(new Date(iObj.start_date).getMonth() + 1)) {
                        eObj.amount += iObj.amount;
                    }
                })
            })

            estimations.map((obj, index) => {
                obj['key'] = index
            })

            setInvoices(estimations)

        }
    }, [Invoices])

    return (
        <div className="whiteBox shadow">
            <Row>
                <h3 style={{ color: '#22075e', marginBottom: 5 }}>Billing Estimation</h3>

            </Row>
            <Table
                bordered
                dataSource={invoices || []}
                columns={Columns}
                rowClassName="editable-row"
            />
        </div>
    );
}
export default BillingEsmitaion;