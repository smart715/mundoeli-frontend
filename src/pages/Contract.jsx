import { crud } from "@/redux/crud/actions";
import { selectFilteredItemsByParent, selectListItems, selectListsByContract, selectListsByEmergency, selectListsByMedical, selectReadItem } from "@/redux/crud/selectors";
import { request } from "@/request";
import { CheckOutlined, CloseCircleOutlined, CloseOutlined, CreditCardOutlined, DeleteOutlined, EditOutlined, EyeOutlined, MoneyCollectOutlined, NumberOutlined } from "@ant-design/icons";
import { Button, Col, DatePicker, Form, Input, InputNumber, Modal, Popconfirm, Radio, Row, Table, Tag, Typography } from "antd";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const { role } = window.localStorage.auth ? JSON.parse(window.localStorage.auth) : {};

const Contract = (props) => {
    const entity = 'workContract';
    const dispatch = useDispatch();
    const Auth = JSON.parse(localStorage.getItem('auth'));

    const currentEmployeeId = props.parentId
    const [isBankModal, setIsBankModal] = useState(false);
    const [isVacation, setIsVacation] = useState(false);
    const formRef = useRef(null);
    const [salMonthly, setSalMonthly] = useState();
    const [positionData, setPositionData] = useState();
    const [allHours, setAllHours] = useState();
    const [paymentHistoryData, setPaymentHistoryData] = useState([]);
    const [totalAmountOfCurrentContract, setTotalAmountOfCurrentContract] = useState();
    const [currentContractId, setCurrentContractId] = useState();
    const [storedHistory, setStoredHistory] = useState()
    const [allUsers, setAllUsers] = useState()
    const [isDtm, setIsDtm] = useState(false)
    const [dtmItems, setDtmItems] = useState([]);
    const [dtmHistory, setDtmHistory] = useState([])
    const [storedDtmHistory, setStoredDtmHistory] = useState([])
    const contractTypes = [
        {
            value: 1,
            label: "Payroll"
        }, {
            value: 2,
            label: "Services"
        }, {
            value: 3,
            label: "Viaticum"
        }, {
            value: 4,
            label: "Hourly"
        },
    ]
    const Columns = [
        {
            title: 'Start',
            dataIndex: 'start_date',
            render: (text) => {
                return (formattedDateFunc(text));
            }
        },
        {
            title: 'End',
            dataIndex: 'end_date',
            render: (text) => {
                return (formattedDateFunc(text));
            }
        },
        {
            title: 'Sal/HR',
            dataIndex: 'sal_hr',
            render: (text) => {
                return parseFloat(text).toFixed(2)
            }
        },
        {
            title: 'HR/sem',
            dataIndex: 'hr_week',
        },
        {
            title: 'Sal/Mes',
            dataIndex: 'sal_monthly',
            render: (text) => {
                return parseFloat(text).toFixed(2)
            }
        },
        {
            title: 'Ref',
            dataIndex: 'ref',
        },
        {
            title: 'Status',
            dataIndex: 'status',
        },
        {
            title: 'Actions',
            dataIndex: 'operation',
            width: "10%",
            align: 'center',
            render: (_, record) => {
                return (
                    role === 0 ?
                        <>
                            {record.type <= 2 &&
                                <>
                                    <Typography.Link onClick={() => dtmModal(record)}>
                                        <CreditCardOutlined style={{ fontSize: "20px", paddingLeft: "5px" }} />
                                    </Typography.Link>
                                    <Typography.Link onClick={() => vacModal(record)}>
                                        <MoneyCollectOutlined style={{ fontSize: "20px", paddingLeft: "5px" }} />
                                    </Typography.Link>
                                </>
                            }
                            <Typography.Link onClick={() => editItem(record)}>
                                <EditOutlined style={{ fontSize: "20px", paddingLeft: "5px" }} />
                            </Typography.Link>
                            {checkCancelStatus(record) &&

                                <Popconfirm title="Sure to cancel?" onConfirm={() => updateDate({ status: 'canceled' }, record._id)}>
                                    <CloseCircleOutlined style={{ fontSize: "20px", paddingLeft: "5px" }} />
                                </Popconfirm>
                            }
                            <Popconfirm title="Sure to end?" onConfirm={() => terminateFunc('terminated', record._id)}>
                                <CloseOutlined title="Terminate" style={{ fontSize: "20px", paddingLeft: "5px" }} />
                            </Popconfirm>

                        </> : ''
                )

            },
        },
    ];

    const vacColumns = [
        {
            title: "Period",
            dataIndex: 'period'
        }, {
            title: 'Gross Salary',
            dataIndex: 'gross_salary'
        }, {
            title: "Amount",
            dataIndex: 'amount',
        }, {
            title: "Payment",
            dataIndex: 'payment'
        }, {
            title: "Pending",
            dataIndex: 'pending'
        }
    ];
    const paymentHistory = [
        {
            title: "Date",
            dataIndex: 'date'
        }, {
            title: "Comment",
            dataIndex: 'comment'
        }, {
            title: "By",
            dataIndex: 'user'
        }
    ]
    const [currentId, setCurrentId] = useState('');
    const [isUpdate, setIsUpdate] = useState(false);
    const [contracts, setContracts] = useState([]);
    const [contractType, setContractType] = useState();
    const [vacItems, setVacItems] = useState();
    const [dailyHours, setDailyHours] = useState();
    const formattedDateFunc = (date) => {
        return new Date(date).toLocaleDateString()
    }
    const checkPeriods = (data, start, end) => {
        const { from: contract_start, to: contract_end } = data;
        let startDate = moment(new Date(contract_start), 'MM-DD-YYYY');
        const endDate = moment(new Date(contract_end), 'MM-DD-YYYY');

        let targetStartDate = moment(start, 'MM-DD-YYYY');
        const targetEndDate = moment(end, 'MM-DD-YYYY');
        let flag = false;
        while (targetStartDate.isSameOrBefore(targetEndDate)) {

            if (targetStartDate.isBetween(startDate, endDate, null, '[]')) {
                flag = true;
            }
            targetStartDate = targetStartDate.add(1, 'days');
        }

        return flag;
        // console.log(startDate.isSameOrBefore(targetStartDate) && endDate.isSameOrAfter(targetEndDate), 'status')

    }
    const checkContractPeriods = (contract, start, end, what) => {
        const { start_date: contract_start, end_date: contract_end } = contract;
        let startDate = moment(new Date(contract_start), 'MM-DD-YYYY');
        const endDate = moment(new Date(contract_end), 'MM-DD-YYYY');

        let targetStartDate = moment(start, 'MM-DD-YYYY');
        const targetEndDate = moment(end, 'MM-DD-YYYY');
        let flag = false;
        const PeriodShouldBeworked = [];
        while (targetStartDate.isSameOrBefore(targetEndDate)) {

            if (targetStartDate.isBetween(startDate, endDate, null, '[]')) {
                flag = true;
                PeriodShouldBeworked.push(targetStartDate.format('MM-DD-YYYY'));
            }
            targetStartDate = targetStartDate.add(1, 'days');
        }
        if (what) {
            return PeriodShouldBeworked
        } else {
            return flag;
        }
        // console.log(startDate.isSameOrBefore(targetStartDate) && endDate.isSameOrAfter(targetEndDate), 'status')

    }
    const getHours = (dates) => {
        const hours = dates.map(date => moment(date).hour());
        const maxHour = Math.max(...hours);
        const minHour = Math.min(...hours);
        const difference = maxHour - minHour;
        return (difference)
    }
    const getCellValue = (hours, date, record, origin_value) => {

        const { workDays, start_date, end_date, contract, viaticum_start_date, viaticum_end_date } = record;
        if (contract) {

            let positionStart = contract.type === 3 ? moment(new Date(viaticum_start_date), 'MM-DD-YYYY') : moment(new Date(start_date), 'MM-DD-YYYY');
            let positionEnd = contract.type === 3 ? moment(new Date(viaticum_end_date), 'MM-DD-YYYY') : moment(new Date(end_date), 'MM-DD-YYYY');


            let startWorkDay = positionStart || moment(workDays[0], 'MM-DD-YYYY');
            let endWorkDay = end_date ? positionEnd : moment(workDays[workDays.length - 1], 'MM-DD-YYYY');
            startWorkDay = startWorkDay.subtract(1, 'day')
            const targetDay = moment(new Date(date), 'MM-DD-YYYY');

            if (contract.type === 3) {

                console.log(targetDay, 'target', startWorkDay, 'contract.type', contract.type, targetDay.isBetween(startWorkDay, endWorkDay, null, '[]'));
            }
            if (targetDay.isBetween(startWorkDay, endWorkDay, null, '[]')) {
                return origin_value;
            } else {
                return 0;
            }
        }
    }
    const changedCellValue = (hours, date, record, origin_value) => {

        const { _id, workDays, start_date, end_date, contract, viaticum_start_date, viaticum_end_date } = record;
        if (contract) {

            let positionStart = contract.type === 3 ? moment(new Date(viaticum_start_date), 'MM-DD-YYYY') : moment(new Date(start_date), 'MM-DD-YYYY');
            let positionEnd = contract.type === 3 ? moment(new Date(viaticum_end_date), 'MM-DD-YYYY') : moment(new Date(end_date), 'MM-DD-YYYY');


            let startWorkDay = positionStart || moment(workDays[0], 'MM-DD-YYYY');
            let endWorkDay = end_date ? positionEnd : moment(workDays[workDays.length - 1], 'MM-DD-YYYY');
            startWorkDay = startWorkDay.subtract(1, 'day')
            const targetDay = moment(new Date(date), 'MM-DD-YYYY');

            if (contract.type === 3) {

                console.log(targetDay, 'target', startWorkDay, 'contract.type', contract.type, targetDay.isBetween(startWorkDay, endWorkDay, null, '[]'));
            }
            if (targetDay.isBetween(startWorkDay, endWorkDay, null, '[]')) {
                const item = hours.find(obj => obj.position === _id && obj.date === date);

                if (item) {
                    return item.hour
                } else {
                    return false;
                }
            } else {
                return 0;
            }
        }

    }
    const getServiceHours = (record) => {
        var hours = 0;
        for (var key in record) {
            if (key.includes('services-day-')) {
                hours += record[key];
            }
        }
        return hours;
    }
    const mathCeil = (value) => {
        return value.toFixed(2)
    }
    const calcAdjustment = (record) => {
        var adjust = 0;
        for (var key in record) {
            if (key.includes('_day-')) {
                adjust += record[key];
            }
        }
        return adjust;
    }
    const getGrossSalary = (from, to, contract_id) => {
        if (positionData) {

            let restedData = JSON.parse(JSON.stringify(positionData))
            const filteredPositions = restedData.filter(position => position.contract._id === contract_id && (
                checkContractPeriods(position.contract, from, to, 0)
            )
            )
            filteredPositions.map((obj, index) => {
                const { contract: assignedContract } = obj;
                obj.sunday_hr = obj.sunday ? getHours(obj.sunday) : 0;
                obj.monday_hr = obj.monday ? getHours(obj.monday) : 0;
                obj.tuesday_hr = obj.tuesday ? getHours(obj.tuesday) : 0;
                obj.wednesday_hr = obj.wednesday ? getHours(obj.wednesday) : 0;
                obj.thursday_hr = obj.thursday ? getHours(obj.thursday) : 0;
                obj.friday_hr = obj.friday ? getHours(obj.friday) : 0;
                obj.saturday_hr = obj.saturday ? getHours(obj.saturday) : 0;
                obj.workDays = checkContractPeriods(assignedContract, from, to, 1)
                let currentDate = moment(new Date(from));
                const end = moment(new Date(to));

                while (currentDate.isSameOrBefore(end)) {
                    const day = currentDate.date();
                    const _day = currentDate.day();
                    const year = currentDate.year();
                    const month = currentDate.month();
                    const dataIndex = `-day-${year}_${month + 1}_${day}`;

                    const dataIndex2 = `services-day-${year}_${month + 1}_${day}`;
                    const dataIndex1 = `_day-${year}_${month + 1}_${day}`;
                    switch (_day) {
                        case 0:
                            obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.sunday_hr);

                            obj[dataIndex1] = (changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.sunday_hr) - obj.sunday_hr
                            break;

                        case 1:
                            obj[dataIndex1] = (changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.monday_hr) - obj.monday_hr;
                            obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.monday_hr);

                            break;

                        case 2:

                            obj[dataIndex1] = (changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.tuesday_hr) - obj.tuesday_hr
                            obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.tuesday_hr);
                            break;

                        case 3:
                            obj[dataIndex1] = (changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.wednesday_hr) - obj.wednesday_hr
                            obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.wednesday_hr);
                            break;

                        case 4:
                            obj[dataIndex1] = (changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.thursday_hr) - obj.thursday_hr
                            obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.thursday_hr);
                            break;
                        case 5:
                            obj[dataIndex1] = (changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.friday_hr) - obj.friday_hr

                            obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.friday_hr);
                            break;
                        case 6:
                            obj[dataIndex1] = (changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.saturday_hr) - obj.saturday_hr
                            obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.saturday_hr);
                            break;

                        default:
                            break;
                    }
                    currentDate = currentDate.add(1, 'days');
                };
                obj.hr_week = assignedContract.hr_week;
                obj.sal_hr = assignedContract.sal_hr;
                obj.hrs_bi = getServiceHours(obj);
                obj.week_pay =
                    (assignedContract && assignedContract.type) ?
                        (
                            assignedContract.type === 3 ?
                                assignedContract.sal_monthly / 2
                                :
                                mathCeil(obj.hrs_bi * assignedContract.sal_hr || 0)
                        )

                        : mathCeil(obj.hrs_bi * obj.sal_hr)
                obj.adjustment = calcAdjustment(obj);
                obj.adjust =

                    assignedContract.type === 3 ?
                        ((obj.adjustment / obj.hrs_bi) * obj.week_pay).toFixed(2)
                        : (calcAdjustment(obj) * obj.sal_hr || 0).toFixed(2);


                obj.salary = ((parseFloat(obj.adjust) + parseFloat(obj.week_pay))).toFixed(2) || 0;
            });
            let totalSalary = 0;
            JSON.parse(JSON.stringify(filteredPositions)).map(item => {
                totalSalary += parseFloat(item.salary);
            })
            return totalSalary.toFixed(2) || 0;

        }
    }
    const getPeriods = (month, year, Q = 0) => {
        const daysInMonth = new Date(year, month, 0).getDate();
        const prevMonth = new Date(year, month, 0);
        const daysInPrevMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 0).getDate();

        if (daysInPrevMonth === 31) {
            const Qs = ['31-15', `16-${daysInMonth === 31 ? 30 : daysInMonth}`];
            return Qs[Q];
        } else if (daysInMonth) {
            const Qs = ['1-15', `16-${daysInMonth === 31 ? 30 : daysInMonth}`];
            return Qs[Q];

        }
    }

    const vacModal = (record) => {
        let { _id: contract_id, start_date, end_date } = record;
        setCurrentContractId(contract_id);


        let startDate = moment(`${start_date.split('/')[0]}/${start_date.split('/')[2]}`, 'MM/YYYY');
        let endDate = moment(`${end_date.split('/')[0]}/${end_date.split('/')[2]}`, 'MM/YYYY');
        const periods = [];

        endDate = endDate.add(1, 'months')
        while (startDate.isSameOrBefore(endDate)) {
            const p1 = getPeriods(startDate.month(), startDate.year(), 0);
            const p2 = getPeriods(startDate.month(), startDate.year(), 1);


            console.log(p1, p2, ';p1,p2', startDate.format('MM/DD/YYYY'), parseInt(p1.split('-')[0]) === 31 ? startDate.month() - 1 : startDate.month(), startDate.month());
            const first = {
                period: `${startDate.format("MMM")} Q1`,
                from: moment(new Date(startDate.year(), parseInt(p1.split('-')[0]) === 31 ? startDate.month() - 1 : startDate.month(), p1.split('-')[0])).format("MM/DD/YYYY"),
                to: moment(new Date(startDate.year(), startDate.month(), p1.split('-')[1])).format("MM/DD/YYYY"),
                q: 1,
                payment: 0,
            };
            const second = {
                period: `${startDate.format("MMM")} Q2`,
                from: moment(new Date(startDate.year(), parseInt(p2.split('-')[0]) === 31 ? startDate.month() - 1 : startDate.month(), p2.split('-')[0])).format("MM/DD/YYYY"),
                to: moment(new Date(startDate.year(), startDate.month(), p2.split('-')[1])).format("MM/DD/YYYY"),
                q: 2,
                payment: 0,
            }

            if (checkPeriods(first, start_date, end_date)) {
                periods.push(first)
            }
            if (checkPeriods(second, start_date, end_date)) {
                periods.push(second)
            }
            startDate = startDate.add(1, 'months')
        }

        let totalAmount = 0;

        console.log(allUsers, 'allUsers');
        const filteredHistory = storedHistory.filter(data => data.employee === currentEmployeeId && data.contract_id === contract_id)
        JSON.parse(JSON.stringify(filteredHistory)).map((data, index) => {
            let { paidPeriods } = data;
            data['key'] = index;
            paidPeriods = JSON.parse(paidPeriods);
            periods.map(period => {
                paidPeriods.map(paidPeriod => {
                    if (`${period.from}- ${period.to}` === paidPeriod.periods) {
                        period.payment += paidPeriod.payment
                    }
                })
            })
        });
        periods.map((data, index) => {
            data['key'] = index;
            data['gross_salary'] = getGrossSalary(data['from'], data['to'], contract_id)
            data['amount'] = parseFloat(data.gross_salary / 11).toFixed(2);
            data['pending'] = data['amount'] - data['payment']
            totalAmount += data['pending']
        })
        filteredHistory.map((data, index) => {
            data['key'] = index
            data['user'] = allUsers.find(user => user._id === data['by']) ? allUsers.find(user => user._id === data['by']).name : ''

        })
        console.log(filteredHistory, 'filteredHistory');
        setPaymentHistoryData(filteredHistory)

        setTotalAmountOfCurrentContract(parseFloat(totalAmount.toFixed(2)));
        setIsVacation(true);
        setVacItems(periods)
        console.log(periods, 'periods');
    }
    const dtmModal = (record) => {
        let { _id: contract_id, start_date, end_date } = record;
        setCurrentContractId(contract_id);


        let startDate = moment(`${start_date.split('/')[0]}/${start_date.split('/')[2]}`, 'MM/YYYY');
        let endDate = moment(`${end_date.split('/')[0]}/${end_date.split('/')[2]}`, 'MM/YYYY');
        const periods = [];

        endDate = endDate.add(1, 'months')
        while (startDate.isSameOrBefore(endDate)) {
            const p1 = getPeriods(startDate.month(), startDate.year(), 0);
            const p2 = getPeriods(startDate.month(), startDate.year(), 1);


            console.log(p1, p2, ';p1,p2', startDate.format('MM/DD/YYYY'), parseInt(p1.split('-')[0]) === 31 ? startDate.month() - 1 : startDate.month(), startDate.month());
            const first = {
                period: `${startDate.format("MMM")} Q1`,
                from: moment(new Date(startDate.year(), parseInt(p1.split('-')[0]) === 31 ? startDate.month() - 1 : startDate.month(), p1.split('-')[0])).format("MM/DD/YYYY"),
                to: moment(new Date(startDate.year(), startDate.month(), p1.split('-')[1])).format("MM/DD/YYYY"),
                q: 1,
                payment: 0,
            };
            const second = {
                period: `${startDate.format("MMM")} Q2`,
                from: moment(new Date(startDate.year(), parseInt(p2.split('-')[0]) === 31 ? startDate.month() - 1 : startDate.month(), p2.split('-')[0])).format("MM/DD/YYYY"),
                to: moment(new Date(startDate.year(), startDate.month(), p2.split('-')[1])).format("MM/DD/YYYY"),
                q: 2,
                payment: 0,
            }

            if (checkPeriods(first, start_date, end_date)) {
                periods.push(first)
            }
            if (checkPeriods(second, start_date, end_date)) {
                periods.push(second)
            }
            startDate = startDate.add(1, 'months')
        }

        let totalAmount = 0;

        console.log(allUsers, 'allUsers');
        const filteredHistory = storedDtmHistory.filter(data => data.employee === currentEmployeeId && data.contract_id === contract_id)
        JSON.parse(JSON.stringify(filteredHistory)).map((data, index) => {
            let { paidPeriods } = data;
            data['key'] = index;
            paidPeriods = JSON.parse(paidPeriods);
            periods.map(period => {
                paidPeriods.map(paidPeriod => {
                    if (`${period.from}- ${period.to}` === paidPeriod.periods) {
                        period.payment += paidPeriod.payment
                    }
                })
            })
        });
        periods.map((data, index) => {
            data['key'] = index;
            data['gross_salary'] = getGrossSalary(data['from'], data['to'], contract_id)
            data['amount'] = parseFloat(data.gross_salary / 12).toFixed(2);
            data['pending'] = parseFloat((data['amount'] - data['payment']).toFixed(2))
            totalAmount += data['pending']
        })
        filteredHistory.map((data, index) => {
            data['key'] = index
            data['user'] = allUsers.find(user => user._id === data['by']) ? allUsers.find(user => user._id === data['by']).name : ''

        })
        console.log(JSON.parse(JSON.stringify(filteredHistory)), 'filteredHistory');
        setDtmHistory(filteredHistory)

        setTotalAmountOfCurrentContract(parseFloat(totalAmount.toFixed(2)));
        setIsDtm(true);
        setDtmItems(periods)
        console.log(periods, 'periods');
    }
    const checkCancelStatus = (record) => {
        if (positionData && record) {
            const { _id, parent_id } = record;
            const filterItem = positionData.filter(position => {
                const { employee, contract } = position;
                if (contract && employee && _id === contract._id && parent_id._id === employee._id) {
                    return position
                } else {
                    return false;
                }
            })
            if (filterItem.length) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }
    const updateDate = (updateData, _id) => {
        const id = currentId || _id;
        const parentId = currentEmployeeId;
        if (id) {
            const jsonData = updateData
            dispatch(crud.update({ entity, id, jsonData }));
            setIsBankModal(false)
            setTimeout(() => {
                const jsonData = { parent_id: parentId }
                dispatch(crud.listByContract({ entity, jsonData }));
            }, 500)
        }
    }
    const editBankModal = () => {
        setIsBankModal(true);
        setIsUpdate(false);
        if (formRef.current) formRef.current.resetFields();
    }
    const editItem = (item) => {
        if (item) {

            item = JSON.parse(JSON.stringify(item))
            setContractType(item.type);
            setHourWeek(item.hr_week);
            setSalaryHour(item.sal_hr);
            setIsBankModal(true);
            setIsUpdate(true);
            setTimeout(() => {
                item.start_date = moment(new Date(item.start_date), 'mm/dd/yyyy')
                item.end_date = moment(new Date(item.end_date), 'mm/dd/yyyy')
                console.log(item, 'itemitemitemitem')
                if (formRef.current) {

                    formRef.current.setFieldsValue({ ...item, sal_biweekly: (item.sal_monthly / 2).toFixed(2) })
                    formRef.current.validateFields(["hr_week"])
                }
                setCurrentId(item._id);
            }, 500);

        }
    }
    const handleBankModal = () => {
        setIsBankModal(false)
    }
    const formatDate = (date) => {
        date = date._d;
        const day = date.getDate().toString().padStart(2, '0'); // padStart adds a zero if the length of the string is less than 2 characters
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        // combine the day, month and year into a single string in mm/dd/yyyy format
        const formattedDate = `${month}/${day}/${year}`;
        return formattedDate;
    }
    const saveDetails = (values) => {
        values['start_date'] = formatDate(values['start_date']);
        values['end_date'] = formatDate(values['end_date']);
        const parentId = currentEmployeeId;
        if (currentId && parentId && isUpdate) {
            const id = currentId;
            const jsonData = { parent_id: parentId }
            values["parent_id"] = parentId;
            dispatch(crud.update({ entity, id, jsonData: values }));
            setIsBankModal(false)
            setTimeout(() => {
                dispatch(crud.listByContract({ entity, jsonData }));
            }, 500)
        } else {
            const jsonData = { parent_id: parentId }
            const id = currentId;
            values["parent_id"] = parentId;
            dispatch(crud.create({ entity, id, jsonData: values }));
            setIsBankModal(false)
            setTimeout(() => {
                dispatch(crud.listByContract({ entity, jsonData }));
            }, 500)
        }
    }
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    const { result: Contracts } = useSelector(selectListsByContract);

    useEffect(() => {
        const id = currentEmployeeId;
        const jsonData = { parent_id: id }
        dispatch(crud.listByContract({ entity, jsonData }));
        const init = async () => {
            const { result } = await request.listById({ entity: "assignedEmployee", jsonData: { employee: id } });
            const { result: allHours } = await request.list({ entity: 'payroll' });
            const { result: paymentHistory } = await request.list({ entity: 'vacHistory' });
            const { result: dtmHistory } = await request.list({ entity: 'dtmHistory' });
            const { result: userData } = await request.list({ entity: "Admin" });

            setAllHours(allHours)
            setPositionData(result);
            setStoredHistory(paymentHistory)
            setAllUsers(userData);
            setStoredDtmHistory(dtmHistory)
        }
        init();
    }, []);

    useEffect(() => {
        const _contracts = Contracts.items || [];

        if (_contracts) {

            setContracts(_contracts);
        } else {
            setContracts([]);
        }

    }, [Contracts])


    const [salaryHour, setSalaryHour] = useState(0);
    const [hourWeek, setHourWeek] = useState(0);
    useEffect(() => {
        if (salaryHour && hourWeek) {
            const monthly = (salaryHour * hourWeek * 4.333).toFixed();
            formRef.current.setFieldsValue({
                sal_monthly: monthly,
                sal_biweekly: parseFloat(monthly / 2).toFixed(2)
            });
        }
    }, [
        salaryHour, hourWeek
    ])
    useEffect(() => {
        if (hourWeek && dailyHours) {
            if (hourWeek > dailyHours * 6) {
                formRef.current.validateFields(["hr_week"])
                console.log(formRef.current, dailyHours, 'dailyHours')
            } else {
                formRef.current.validateFields(["hr_week"])
            }
        }
    }, [
        hourWeek, dailyHours
    ])


    useEffect(() => {
        if (salMonthly) {
            formRef.current.setFieldsValue({
                sal_biweekly: parseFloat(salMonthly / 2).toFixed(2)
            });
        }

    }, [salMonthly])
    useEffect(() => {

    }, [contractType])
    const handleVac = () => {
        setIsVacation(false)
    }
    const handleDtm = () => {
        setIsDtm(false)
    }

    useEffect(() => {

        let totalAmount = 0;
        if (vacItems) {
            vacItems.map(data => {
                totalAmount += parseFloat(data['pending']);
            });

            console.log(totalAmount, 'totalAmount')
            setTotalAmountOfCurrentContract(totalAmount)
        }

    }, [vacItems])
    const payVacation = (values) => {
        const newData = JSON.parse(JSON.stringify(vacItems)).sort((a, b) => b.key - a.key);
        let { paymentAmount } = values;
        let commentAmount = paymentAmount
        paymentAmount = parseFloat(paymentAmount)
        let paidPeriods = [];
        newData.map(data => {
            let { pending } = data;
            pending = parseFloat(pending);
            if (pending > paymentAmount) {
                data['payment'] += paymentAmount;
                data['pending'] = (pending - paymentAmount).toFixed(2);
                paidPeriods.push({
                    payment: paymentAmount,
                    periods: `${data['from']}- ${data['to']}`
                })
                paymentAmount = 0;
            } else if (pending < paymentAmount) {
                data['payment'] += pending;
                data['pending'] = 0;
                paymentAmount = paymentAmount - pending;
                paidPeriods.push({
                    payment: pending,
                    periods: `${data['from']}- ${data['to']}`
                })
            } else if (pending === paymentAmount) {
                data['payment'] += pending;
                data['pending'] = 0;
                paymentAmount = paymentAmount - pending;

                paidPeriods.push({
                    payment: pending,
                    periods: `${data['from']}- ${data['to']}`
                })
            }
        });
        const sortedNewData = newData.sort((a, b) => a.key - b.key)
        console.log(paidPeriods);

        const newHistory = {
            date: moment().format("MM/DD/YY H:mm"),
            comment: `Vacations executed for $${commentAmount}`,
            user: Auth.name,
            key: paymentHistoryData.length + 1,
            paidPeriods: JSON.stringify(paidPeriods),
            contract_id: currentContractId,
            employee: currentEmployeeId
        }
        const saveHistory = {
            date: moment().format("MM/DD/YY H:mm"),
            comment: `Vacations executed for $${commentAmount}`,
            by: Auth.id,
            key: paymentHistoryData.length + 1,
            paidPeriods: JSON.stringify(paidPeriods),
            contract_id: currentContractId,
            employee: currentEmployeeId
        }
        dispatch(crud.create({ entity: "vacHistory", jsonData: saveHistory }))


        paymentHistoryData.push(newHistory)
        setPaymentHistoryData([...paymentHistoryData])
        setVacItems(sortedNewData)


    }
    const payDtm = (values) => {
        const newData = JSON.parse(JSON.stringify(dtmItems)).sort((a, b) => b.key - a.key);
        let { paymentAmount } = values;
        let commentAmount = paymentAmount
        paymentAmount = parseFloat(paymentAmount)
        let paidPeriods = [];
        newData.map(data => {
            let { pending } = data;
            pending = parseFloat(pending);
            if (pending > paymentAmount) {
                data['payment'] += paymentAmount;
                data['pending'] = (pending - paymentAmount).toFixed(2);
                paidPeriods.push({
                    payment: paymentAmount,
                    periods: `${data['from']}- ${data['to']}`
                })
                paymentAmount = 0;
            } else if (pending < paymentAmount) {
                data['payment'] += pending;
                data['pending'] = 0;
                paymentAmount = paymentAmount - pending;
                paidPeriods.push({
                    payment: pending,
                    periods: `${data['from']}- ${data['to']}`
                })
            } else if (pending === paymentAmount) {
                data['payment'] += pending;
                data['pending'] = 0;
                paymentAmount = paymentAmount - pending;

                paidPeriods.push({
                    payment: pending,
                    periods: `${data['from']}- ${data['to']}`
                })
            }
        });
        const sortedNewData = newData.sort((a, b) => a.key - b.key)
        console.log(paidPeriods);

        const newHistory = {
            date: moment().format("MM/DD/YY H:mm"),
            comment: `Vacations executed for $${commentAmount}`,
            user: Auth.name,
            key: dtmHistory.length + 1,
            paidPeriods: JSON.stringify(paidPeriods),
            contract_id: currentContractId,
            employee: currentEmployeeId
        }
        const saveHistory = {
            date: moment().format("MM/DD/YY H:mm"),
            comment: `Vacations executed for $${commentAmount}`,
            by: Auth.id,
            key: dtmHistory.length + 1,
            paidPeriods: JSON.stringify(paidPeriods),
            contract_id: currentContractId,
            employee: currentEmployeeId
        }
        dispatch(crud.create({ entity: "dtmHistory", jsonData: saveHistory }))


        dtmHistory.push(newHistory)
        setDtmHistory([...dtmHistory])
        setDtmItems(sortedNewData)


    }
    const [isTerminateModal, setIsTerminateModal] = useState(false);
    const [termiateId, setTermiateId] = useState(false);
    const handleTeminateModal = () => {
        setIsTerminateModal(false)
    }
    const terminateFunc = (status, id) => {
        setIsTerminateModal(true)
        setTermiateId(id)
    }
    const handleTeminate = (value) => {
        value['status'] = "terminated"
        updateDate(value, termiateId)
        setIsTerminateModal(false)
    }
    return (

        <div className="whiteBox shadow">
            <Modal title="Work Contract" visible={isBankModal} onCancel={handleBankModal} footer={null} width={900}>
                <Form
                    ref={formRef}
                    name="basic"
                    labelCol={{
                        span: 8,
                    }}
                    wrapperCol={{
                        span: 24,
                    }}
                    onFinish={saveDetails}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                    initialValues={{
                        sal_hr: 0,
                        hr_week: 0,
                    }}

                >
                    <Row gutter={24}>
                        <Col span={16}>
                            <Form.Item
                                name="type"
                                label="Type"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >

                                <Radio.Group disabled={isUpdate ? true : false} name="radiogroup" options={contractTypes} onChange={(e) => setContractType(e.target.value)} />
                            </Form.Item>


                            {contractType !== 3 &&
                                <Form.Item
                                    name="sal_hr"
                                    label="Sal/Hr"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <InputNumber onChange={(e) => { setSalaryHour(e) }} />
                                </Form.Item>
                            }

                            {(contractType !== 4 && contractType !== 3) &&

                                <Form.Item
                                    name="hr_week"
                                    label="Hr / Week"
                                    rules={[
                                        {
                                            required: true,
                                            validator: (_, value) => {
                                                if (value && value > 96) {
                                                    return Promise.reject(`Value must be less than or equal to 96`);
                                                } else if (value && value > dailyHours * 6) {
                                                    return Promise.reject(`Value must be less than or equal to ${dailyHours * 6}`);
                                                }
                                                return Promise.resolve();
                                            }
                                        },
                                    ]}
                                >
                                    <InputNumber onChange={(e) => { setHourWeek(e) }} />
                                </Form.Item>
                            }
                            <Form.Item
                                name="start_date"
                                label="Start"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <DatePicker format={"MM/DD/YYYY"} />
                            </Form.Item>
                            <Form.Item
                                name="end_date"
                                label="End"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <DatePicker format={"MM/DD/YYYY"} />
                            </Form.Item>

                        </Col>
                        <Col span={8}>

                            {(contractType !== 3 && contractType !== 4) &&

                                <Form.Item
                                    name="sal_monthly"
                                    label="Sal/Mon"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Input readOnly style={{ background: 'lightgrey' }} />
                                </Form.Item>

                            }
                            {(contractType === 3 && contractType !== 4) &&

                                <Form.Item
                                    name="sal_monthly"
                                    label="Sal/Mon"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Input onChange={(e) => setSalMonthly(e.target.value)} />
                                </Form.Item>

                            }
                            {contractType !== 4 &&


                                <Form.Item
                                    name="sal_biweekly"
                                    label="Sal/Biweekly"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Input readOnly style={{ background: 'lightgrey' }} />
                                </Form.Item>
                            }
                            <Form.Item
                                name={"daily_hour"}
                                label="Daily Hour"
                                rules={[
                                    {
                                        required: true,
                                        validator: (_, value) => {
                                            if (value && value > 16) {
                                                return Promise.reject(`Value must be less than or equal to 16`);
                                            }
                                            return Promise.resolve();
                                        }
                                    }
                                ]}
                            >
                                <Input onChange={(e) => setDailyHours(e.target.value)} type="number" />
                            </Form.Item>
                            <Form.Item
                                name="ref"
                                label="Ref"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item>
                                {
                                    isUpdate ?
                                        <Button type="primary" htmlType="submit">
                                            Update
                                        </Button>
                                        : <Button type="primary" htmlType="submit">
                                            Save
                                        </Button>

                                }

                                <Button type="ghost" onClick={handleBankModal}>
                                    cancel
                                </Button>
                            </Form.Item>

                        </Col>
                    </Row>

                </Form>
                <>
                </>
            </Modal>
            <Modal title="Accumulated Vacations" visible={isVacation} onCancel={handleVac} footer={null} width={800}>
                <Table
                    bordered
                    dataSource={vacItems || []}
                    columns={vacColumns}
                />
                <Row >
                    <Form
                        onFinish={payVacation}
                    >
                        <Form.Item
                            name={"paymentAmount"}
                            label="Amount to pay"
                            rules={[
                                {
                                    required: true,
                                    validator: (_, value) => {
                                        if (value > totalAmountOfCurrentContract) {
                                            return Promise.reject("Value must be less that  total ")
                                        }
                                        return Promise.resolve();
                                    }
                                },
                            ]}
                        >

                            <Input placeholder="Amount to pay" />
                        </Form.Item>

                        <Col span={16}>
                            <Button type="primary" htmlType="submit" >Pay Vacation</Button>
                        </Col>
                    </Form>
                </Row>
                <Table
                    bordered
                    dataSource={paymentHistoryData}
                    columns={paymentHistory}
                />
            </Modal>
            <Modal title="Accumulated DTM" visible={isDtm} onCancel={handleDtm} footer={null} width={800}>
                <Table
                    bordered
                    dataSource={dtmItems || []}
                    columns={vacColumns}
                />
                <Row >
                    <Form
                        onFinish={payDtm}
                    >
                        <Form.Item
                            name={"paymentAmount"}
                            label="Amount to pay"
                            rules={[
                                {
                                    required: true,
                                    validator: (_, value) => {
                                        if (value > totalAmountOfCurrentContract) {
                                            return Promise.reject("Value must be less that  total ")
                                        }
                                        return Promise.resolve();
                                    }
                                },
                            ]}
                        >

                            <Input placeholder="Amount to pay" />
                        </Form.Item>

                        <Col span={16}>
                            <Button type="primary" htmlType="submit" >Pay Vacation</Button>
                        </Col>
                    </Form>
                </Row>
                <Table
                    bordered
                    dataSource={dtmHistory}
                    columns={paymentHistory}
                />
            </Modal>
            <Modal title="Teminate Modal" visible={isTerminateModal} onCancel={handleTeminateModal} footer={null} width={600}>
                <Form
                    onFinish={handleTeminate}
                >
                    <Form.Item
                        name={"terminated_date"}
                        label="Teminate Date"
                        rules={[
                            {
                                required: true,
                                validator: (_, date) => {
                                    let today = moment(new Date());
                                    today = today.subtract(1, 'day')
                                    if (today.isSameOrBefore(date)) {
                                        return Promise.resolve();
                                    } else {
                                        return Promise.reject("Terminate date should be after current date")
                                    }
                                }
                            },
                        ]}
                    >
                        <DatePicker />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Save
                        </Button>
                        <Button type="ghost" onClick={handleTeminateModal}>
                            cancel
                        </Button>
                    </Form.Item>

                </Form>
            </Modal>
            <Row>
                <Col span={5}>
                    <h3 style={{ color: '#22075e', marginBottom: 5 }}>Contracts</h3>
                </Col>
                <Col span={12}>
                    <Button type="primary" onClick={editBankModal}>Add</Button>
                </Col>
            </Row>
            <Table
                bordered
                rowKey={(item) => item._id}
                key={(item) => item._id}
                dataSource={contracts || []}
                columns={Columns}
                rowClassName="editable-row"


            />
        </div >
    );
}

export default Contract;