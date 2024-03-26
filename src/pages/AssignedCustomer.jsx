import { crud } from "@/redux/crud/actions";
import { selectListItems, selectListsByAssignedEmployee, selectListsByContract, } from "@/redux/crud/selectors";
import { DeleteOutlined, EditOutlined, } from "@ant-design/icons";
import { Button, Checkbox, Col, Form, InputNumber, Modal, Popconfirm, Row, Select, Table, TimePicker, Typography } from "antd";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SelectAsync from "@/components/SelectAsync";
import moment from "moment";


const AssignedCustomer = (props) => {
    const entity = 'assignedEmployee';
    const dispatch = useDispatch();
    const currentEmployeeId = props.parentId
    const [isBankModal, setIsBankModal] = useState(false);
    const formRef = useRef(null);

    const contractType = [
        "",
        "Payroll",
        "Services",
        "Viaticum",
        "Hourly"
    ]
    const bankColumns = [
        {
            title: 'Customer',
            dataIndex: ['parent_id', 'name'],
        },
        {
            title: 'Store',
            dataIndex: ['store', 'store'],
        },

        {
            title: 'Time',
            dataIndex: 'time',
            render: (text, record) => (
                <>
                    {getFormattedHours(
                        [
                            record.monday ? [record.monday[0], record.monday[1]] : "",
                            record.tuesday ? [record.tuesday[0], record.tuesday[1]] : "",
                            record.wednesday ? [record.wednesday[0], record.wednesday[1]] : "",
                            record.thursday ? [record.thursday[0], record.thursday[1]] : "",
                            record.friday ? [record.friday[0], record.friday[1]] : "",
                            record.saturday ? [record.saturday[0], record.saturday[1]] : "",
                            record.sunday ? [record.sunday[0], record.sunday[1]] : "",
                        ]
                    )}
                </>
            ),
        },
        {
            title: 'Hr/Week',
            dataIndex: 'hr_week',
        },
        {
            title: 'Type',
            dataIndex: ['contract', 'type'],
            render: (text, record) => (
                <>
                    {contractType[text]}
                </>
            )
        },
        {
            title: 'Sal/Hr',
            dataIndex: 'sal_hr',
        },

    ];
    const [currentId, setCurrentId] = useState('');
    const [isUpdate, setIsUpdate] = useState(false);

    const editBankModal = () => {
        setIsBankModal(true);
        setIsUpdate(false);
        // if (formRef) formRef.current.resetFields();
    }

    const getFormattedHours = (days) => {
        const dayLabels = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'];
        const hours = [];

        for (let i = 0; i < days.length; i++) {
            if (!days[i]) continue
            const [start, end] = days[i];

            if (start === end) {
                hours.push(dayLabels[i] + ' ' + new Date(start).getHours());
            } else if (i === 0 || start !== days[i - 1][0] || end !== days[i - 1][1]) {
                hours.push(dayLabels[i] + '( ' + new Date(start).getHours() + '-' + new Date(end).getHours() + ')');
            }
        }
        return hours.join(', ');
    }
    const editItem = (item) => {
        if (item) {
            setIsBankModal(true);
            setIsUpdate(true);
            setTimeout(() => {
                if (item.monday) setMondayValue(true);
                if (item.tuesday) setTuesdayValue(true);
                if (item.wednesday) setWednesdayValue(true);
                if (item.thursday) setTursdayValue(true);
                if (item.friday) setFridayValue(true);
                if (item.saturday) setSaturdayValue(true);
                if (item.sunday) setSundayValue(true);

                item.monday = item.monday ? [moment(item.monday[0]), moment(item.monday[1])] : null;
                item.tuesday = item.tuesday ? [moment(item.tuesday[0]), moment(item.tuesday[1])] : null;
                item.wednesday = item.wednesday ? [moment(item.wednesday[0]), moment(item.wednesday[1])] : null;
                item.thursday = item.thursday ? [moment(item.thursday[0]), moment(item.thursday[1])] : null;
                item.friday = item.friday ? [moment(item.friday[0]), moment(item.friday[1])] : null;
                item.saturday = item.saturday ? [moment(item.saturday[0]), moment(item.saturday[1])] : null;
                item.sunday = item.sunday ? [moment(item.sunday[0]), moment(item.sunday[1])] : null;
                console.log(item, 'fffffffffffffffffffsssffffff')
                if (formRef.current) formRef.current.setFieldsValue(item);
                setCurrentId(item._id);
            }, 200);

        }
    }
    const deleteItem = (item) => {
        const id = item._id;


        const jsonData = { parent_id: currentEmployeeId }
        console.log(id, 'idididi')
        dispatch(crud.delete({ entity, id }))
        setTimeout(() => {
            dispatch(crud.listByAssignedEmployee({ entity, jsonData }));
        }, 500)
    }
    const handleBankModal = () => {
        setIsBankModal(false)
    }
    const saveBankDetails = (values) => {
        const parentId = currentEmployeeId;
        if (currentId && parentId && isUpdate) {
            const id = currentId;
            const jsonData = { parent_id: parentId }
            values["parent_id"] = parentId;
            dispatch(crud.update({ entity, id, jsonData: values }));
            setIsBankModal(false)
            setTimeout(() => {
                dispatch(crud.listByAssignedEmployee({ entity, jsonData }));
            }, 500)
        } else {
            const jsonData = { parent_id: parentId }
            const id = currentId;
            values["parent_id"] = parentId;
            dispatch(crud.create({ entity, id, jsonData: values }));
            setIsBankModal(false)
            setTimeout(() => {
                dispatch(crud.listByAssignedEmployee({ entity, jsonData }));
            }, 500)
        }
    }
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    const { result: Items } = useSelector(selectListItems);
    const { result: Employees } = useSelector(selectListsByAssignedEmployee);

    const [items, setItems] = useState([]);
    useEffect(() => {
        const id = currentEmployeeId;
        const jsonData = { parent_id: id }
        const entity = "assignedEmployee"
        dispatch(crud.list({ entity }));
    }, []);
    useEffect(() => {
        const items = Items.items.map((obj, index) => {
            obj['key'] = index
            if (obj.employee && obj.employee._id === currentEmployeeId) {
                return obj;
            }
        }).filter(data => data !== undefined)
        console.log(items, 'items')
        setItems(items);

    }, [Items, Employees])
    const [mondayValue, setMondayValue] = useState(null);
    const [tuesdayValue, setTuesdayValue] = useState(null);
    const [wednesdayValue, setWednesdayValue] = useState(null);
    const [tursdayValue, setTursdayValue] = useState(null);
    const [fridayValue, setFridayValue] = useState(null);
    const [saturdayValue, setSaturdayValue] = useState(null);
    const [sundayValue, setSundayValue] = useState(null);

    const [workContract, setWorkContract] = useState([]);
    const { result: Contracts } = useSelector(selectListsByContract);

    const changeEmployee = (value) => {
        formRef.current.setFieldsValue({
            contract: undefined
        })
        setWorkContract([])
        if (value) {
            const entity = 'workContract';
            const jsonData = { parent_id: value }
            // dispatch(crud.resetState());
            dispatch(crud.listByContract({ entity, jsonData }))
        }
    }
    useEffect(() => {

        console.log(Contracts, 'ContractsContracts')
        const contractOptions = Contracts.items || [];
        if (contractOptions) {
            const contracts = contractOptions.map(item => {
                if (item.status === "active") {
                    return {
                        value: item._id,
                        label: `${item.start_date}~${item.end_date}`
                    }
                } else {
                    return {}
                }
            })
            setWorkContract(contracts);
        } else {
            setWorkContract(undefined);
        }

    }, [Contracts])
    return (

        <div className="whiteBox shadow">
            <Row>
                <Col span={12}>
                    <h3 style={{ color: '#22075e', marginBottom: 5 }}>Assigned Customers</h3>
                </Col>
            </Row>
            <Table
                bordered
                dataSource={items || []}
                columns={bankColumns}
                rowClassName="editable-row"
            />
        </div>
    );
}

export default AssignedCustomer;