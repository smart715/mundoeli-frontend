/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-sparse-arrays */
/* eslint-disable array-callback-return */
/* eslint-disable no-unused-vars */
import { DeleteOutlined, LeftOutlined, RightOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Layout, Modal, Popconfirm, Radio, Row, Select, Table, Typography, message } from 'antd';
import * as XLSX from 'xlsx';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import moment from 'moment';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { request } from '@/request';
const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};
const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  handleSave_,
  ...restProps
}) => {

  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);
  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };
  const save = async () => {
    try {
      const values = await form.validateFields();
      if (handleSave_) {
        handleSave_({
          ...record,
          ...values,
        }, values);
      } else {
        handleSave({
          ...record,
          ...values,
        }, values);
      }


    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };
  const handleKeyDown = e => {

    if (e.key === "Tab") {
      e.preventDefault();

      const currentCell = e.target.closest("td");
      const parentElement = currentCell.parentNode;

      var nextCell = null, prevCell = null;
      if (!currentCell.nextElementSibling) {
        nextCell = parentElement.nextElementSibling ? parentElement.nextElementSibling.children[parentElement.nextElementSibling.childElementCount === 2 ? 0 : 2] : currentCell
      } else {
        nextCell = currentCell.nextElementSibling
      }
      if (!currentCell.previousSibling) {
        prevCell = parentElement.previousSibling ? parentElement.previousSibling.children[parentElement.previousSibling.childElementCount === 2 ? 1 : 2] : currentCell
      }
      else if (currentCell.previousSibling && !currentCell.previousSibling.querySelector(".editable-cell-value-wrap")) {
        prevCell = parentElement.previousSibling ? parentElement.previousSibling.children[parentElement.previousSibling.childElementCount - 1] : currentCell
      }
      else {
        prevCell = currentCell.previousSibling
      }

      const Cell = e.shiftKey
        ? prevCell
        : nextCell;
      if (Cell) {
        const input = Cell.querySelector("input");
        if (input) {
          input.focus();
        } else {
          const editableCell = Cell.querySelector(".editable-cell-value-wrap");
          if (editableCell) {
            editableCell.click(); // Call toggleEdit function of nextCell
          }
        }
      }

    }
  };

  let childNode = children;
  if (editable) {
    childNode = (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
      >
        <Input ref={inputRef} onKeyDown={handleKeyDown} onPressEnter={save} onBlur={save} />
      </Form.Item>
    )
    // : (
    //   <div
    //     className="editable-cell-value-wrap"
    //     style={{
    //       paddingRight: 24,
    //     }}
    //     onClick={toggleEdit}
    //   >
    //     {children}
    //   </div>
    // );
  }
  return <td {...restProps} >{childNode}</td>;
};
const contractTypes = [
  "",
  "Payroll",
  "Services",
  "Viaticum",
  "Hourly"
]
const getFormattedHours = (days) => {
  const dayLabels = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'];
  const hours = [];

  for (let i = 0; i < days.length; i++) {
    if (!days[i]) continue
    const [start, end] = days[i];
    hours.push(dayLabels[i] + '( ' + new Date(start).getHours() + '-' + new Date(end).getHours() + ')');
  }
  return hours.join(', ');
}



const mathCeil = (value) => {
  return value.toFixed(2)
}
const PayrollDetails = () => {
  const entity = "payroll"
  const url = useParams().id;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const tableRef = useRef(null);

  const [isUpdate, setIsUpdate] = useState(false);
  const dispatch = useDispatch();

  const handleOk = () => {
    // handle ok button click here
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const [currentId, setCurrentId] = useState('');
  const [currentItem, setCurrentItem] = useState({});
  const [allHours, setAllHours] = useState([]);
  const [saveStatus, setSaveStatus] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(parseInt(url.split("-")[1]));
  const [currentYear, setCurrentYear] = useState(parseInt(url.split("-")[0]));
  const [currentQ, setCurrentQ] = useState(parseInt(url.split("-")[2]));
  const [currentPeriod, setCurrentPeriod] = useState('1-15')
  const [changedDays, setChangedDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState();
  const [mergedColumns, setMergedColumns] = useState([]);
  const [prevHour, setPrevHour] = useState();
  const [currentHistory, setCurrentHistory] = useState();
  const [userData, setUserData] = useState();
  const [searchText, setSearchText] = useState('');
  const [globalItems, setGlobalItems] = useState();
  const [paginations, setPaginations] = useState([]);
  const [isReplacement, setIsReplacement] = useState(false);
  const [currentEmployees, setCurrentEmployees] = useState([]);
  const [employeeLists, setEmployeeList] = useState([]);
  const [globalEmployeeLists, setGlobalEmployeeLists] = useState();
  const [editingKey, setEditingKey] = useState('');
  const [changeStatus, setChangeStatus] = useState(false);
  const isEditing = (record) => record.key === editingKey;

  const editItem = (item, cellItem, current, mainHour) => {
    const { hour, comment, by: { email: byEmail = '' } = {} } = cellItem;

    console.log(item, cellItem, current, mainHour, '11111111111111')
    setCurrentHistory(cellItem)
    if (item && item.contract.replace) {


      const newHour = parseFloat(item[`new-day-${current.split("/").join("_")}`]);
      const differnceHour = parseFloat(item[`_day-${current.split("/").join("_")}`]);
      const newComment = item[`comment-day-${current.split("/").join("_")}`];
      const newHistory = item[`history-day-${current.split("/").join("_")}`]

      console.log(newHistory, 'newHistory');
      setCurrentHistory(newHistory)
      setPrevHour(newHour);
      setTimeout(() => {
        if (formRef.current) formRef.current.setFieldsValue({
          hours: (newHour + differnceHour),
          comment: newComment,
        });
      }, 400);
      setSelectedDate(current);
      setCurrentId(item._id);
      setCurrentItem(item);
      setIsModalVisible(true);
      setIsUpdate(true);
    }
    if (item && item.contract._id) {
      const { workDays, start_date, end_date, contract, viaticum_start_date, viaticum_end_date } = item;
      if (contract) {
        let positionStart = contract.type === 3 ? moment(new Date(viaticum_start_date), 'MM-DD-YYYY') : moment(new Date(start_date), 'MM-DD-YYYY');
        let positionEnd = contract.type === 3 ? moment(new Date(viaticum_end_date), 'MM-DD-YYYY') : moment(new Date(end_date), 'MM-DD-YYYY');

        console.log(start_date, positionStart.format("MM-DD-YYYY"), end_date, 'start_date, end_date');
        let workStart = start_date ? positionStart : moment(workDays?.length ? workDays[0] : null, 'MM-DD-YYYY');
        let workEnd = end_date ? positionEnd : moment(workDays?.length ? workDays[workDays.length - 1] : null, 'MM-DD-YYYY');
        let targetDate = moment(new Date(current), 'MM-DD-YYYY');
        // workStart = workStart.subtract(1, 'day')
        // workEnd = workEnd.add(1, 'day')

        console.log(workStart, workEnd, targetDate.isSame(workEnd))

        if (targetDate.format("MM/DD/YYYY") === workStart.format("MM/DD/YYYY") || targetDate.isBetween(workStart, workEnd)) {
          setPrevHour(hour);
          setTimeout(() => {
            if (formRef.current) formRef.current.setFieldsValue({
              hours: hour,
              comment: comment,
            });
          }, 400);
          setSelectedDate(current);
          setCurrentId(item._id);
          setCurrentItem(item);
          setIsModalVisible(true);
          setIsUpdate(true);
        } else {
          return message.error(`can't edit hour because `)
        }
      }
    }
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
  const columns = [
    // {
    //   title: "action",
    //   render: (_, record) => {
    //     return (

    //       record.replace &&
    //       <Popconfirm title="Sure to delete?" onConfirm={() => deleteItem(record._id)}>
    //         <DeleteOutlined style={{ fontSize: "20px" }} />
    //       </Popconfirm>

    //     );
    //   }
    // },
    {
      title: 'Store',
      dataIndex: ['store', 'store'],
      render: (text) => {
        return text || "Not assigned"
      },
    },
    {
      title: 'Personal ID',
      dataIndex: ['employee', 'personal_id'],

    },
    {
      title: 'Employee',
      dataIndex: ['employee', 'name'],
    },

    {
      title: `Hours`,
      dataIndex: 'hours',
      align: 'center',
      render: (text, record) => (
        <>


          {
            text ?
              text :
              `${getFormattedHours(
                [
                  record.monday ? [record.monday[0], record.monday[1]] : "",
                  record.tuesday ? [record.tuesday[0], record.tuesday[1]] : "",
                  record.wednesday ? [record.wednesday[0], record.wednesday[1]] : "",
                  record.thursday ? [record.thursday[0], record.thursday[1]] : "",
                  record.friday ? [record.friday[0], record.friday[1]] : "",
                  record.saturday ? [record.saturday[0], record.saturday[1]] : "",
                  record.sunday ? [record.sunday[0], record.sunday[1]] : "",
                ])}`

          }
        </>
      ),
    },
    {
      title: 'HR/Week',
      dataIndex: 'hr_week',
    },
    {
      title: 'Type',
      dataIndex: ['contract', 'type'],
      render: (text) => {
        return (
          contractTypes[text]
        );
      },
    },
    {
      title: 'Sal/Hr',
      dataIndex: 'sal_hr',
    },
    {
      title: 'Hrs/BiWeekly',
      dataIndex: 'hrs_bi',
    },
    {
      title: 'Week Pay',
      dataIndex: 'week_pay',
    },
    {
      title: 'Adjustment',
      dataIndex: 'adjustment',


    },
    {
      title: 'Adjust($$$)',
      dataIndex: 'adjust',

    },
    {
      title: 'Salary',
      dataIndex: 'salary',

    },
    // {
    //   title: 'Transferencia',
    //   dataIndex: 'transferencia',
    //   width: '100',

    // },
  ];
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



  const [listItems, setListItems] = useState([]);
  const formRef = useRef(null);
  const replaceRef = useRef(null);
  const getHours = (dates) => {
    const hours = dates.map(date => moment(date).hour());
    const maxHour = Math.max(...hours);
    const minHour = Math.min(...hours);
    const difference = maxHour - minHour;
    return (difference)
  }

  const prevData = () => {
    if (currentQ) {
      setCurrentQ(0)
    } else {
      if (currentMonth === 1) {
        setCurrentYear(currentYear - 1);
        setCurrentMonth(12)
      }
      setCurrentMonth(currentMonth - 1);
      setCurrentQ(1);
    }
  }
  const deleteItem = (id) => {
    const entity = 'replacement'
    dispatch(crud.delete({ entity, id }))
    setChangeStatus(!changeStatus);

  }
  const nextData = () => {
    if (currentQ) {
      setCurrentMonth(currentMonth + 1);
      setCurrentQ(0);
      if (currentMonth === 12) {
        setCurrentYear(currentYear + 1);
        setCurrentMonth(1);
      }
    } else {
      setCurrentQ(1)
    }
  }
  useEffect(() => {
    setCurrentPeriod(getPeriods(currentMonth, currentYear, currentQ))
  }, [currentMonth, currentQ, currentYear])
  const Auth = JSON.parse(localStorage.getItem('auth'));
  const onFinish = (values) => {

    const { comment, hours } = values;

    const historyObj = { auth_id: Auth.id, prevHour: prevHour, created: moment().format("mm/dd/yyyy : h:m:s"), new_hour: hours, comment: comment };
    const historys = JSON.parse(currentHistory.history || '[]');
    historys.push(historyObj);


    const { contract, employee, parent_id, _id: position_id } = currentItem
    const jsonData = { by: Auth.id, hour: hours, date: selectedDate, comment: comment, history: JSON.stringify(historys), position: position_id }
    const item = allHours.filter(obj => obj.position === position_id && obj.date === selectedDate)
    if (item.length) {
      dispatch(crud.update({ entity, id: item[0]._id, jsonData }))
    } else {
      dispatch(crud.create({ entity, jsonData }))
    }
    setIsModalVisible(false);
    setSaveStatus(!saveStatus)

  }

  const dateValue = (date) => {
    return new Date(date).valueOf();
  }
  const changedCellValue = (hours, date, record, origin_value) => {

    const { workDays, start_date, end_date, contract, viaticum_start_date, viaticum_end_date, _id: position_id } = record;
    if (contract) {
      let positionStart = contract.type === 3 ? moment(new Date(viaticum_start_date), 'MM-DD-YYYY') : moment(new Date(start_date), 'MM-DD-YYYY');
      let positionEnd = contract.type === 3 ? moment(new Date(viaticum_end_date), 'MM-DD-YYYY') : moment(new Date(end_date), 'MM-DD-YYYY');
      let startWorkDay = positionStart || moment(workDays?.length ? workDays[0] : null, 'MM-DD-YYYY');
      let endWorkDay = end_date ? positionEnd : moment(workDays?.length ? workDays[workDays.length - 1] : null, 'MM-DD-YYYY');
      startWorkDay = startWorkDay.subtract(1, 'day')
      const targetDay = moment(new Date(date), 'MM-DD-YYYY');
      if (targetDay.isBetween(startWorkDay, endWorkDay, null, '[]')) {
        const item = hours.find(obj => obj.position === position_id && obj.date === date);
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
  const getCellValue = (hours, date, record, origin_value) => {
    const { workDays, start_date, end_date, contract, viaticum_start_date, viaticum_end_date } = record;
    if (contract) {
      let positionStart = contract.type === 3 ? moment(new Date(viaticum_start_date), 'MM-DD-YYYY') : moment(new Date(start_date), 'MM-DD-YYYY');
      let positionEnd = contract.type === 3 ? moment(new Date(viaticum_end_date), 'MM-DD-YYYY') : moment(new Date(end_date), 'MM-DD-YYYY');
      let startWorkDay = positionStart || moment(workDays?.length ? workDays[0] : null, 'MM-DD-YYYY');
      let endWorkDay = end_date ? positionEnd : moment(workDays?.length ? workDays[workDays.length - 1] : null, 'MM-DD-YYYY');
      startWorkDay = startWorkDay.subtract(1, 'day')
      const targetDay = moment(new Date(date), 'MM-DD-YYYY');
      if (targetDay.isBetween(startWorkDay, endWorkDay, null, '[]')) {
        return origin_value;
      } else {
        return 0;
      }
    }
  }
  const changedCellHour = (hours, origin_value, date, record, flag) => {
    const { _id, workDays } = record;
    const item = hours.find(obj => obj.position === _id && dateValue(date) === dateValue(obj.date))
    let startDate = moment(new Date(workDays?.length ? workDays[0] : null));
    startDate = startDate.subtract(2, 'day')
    let endDate = moment(new Date(workDays?.length ? workDays[workDays.length - 1] : null));
    let targetDate = moment(new Date(date));
    if (item) {
      if (flag) {
        return (targetDate.isBetween(startDate, endDate) || targetDate.isSame(endDate)) ? item.hour : 0
      } else {
        return item.comment
      }
    } else {
      if (flag) {
        return (targetDate.isBetween(startDate, endDate) || targetDate.isSame(endDate)) ? origin_value : 0
      } else {
        return ''
      }
    }
  }
  const changedCellItem = (hours, date, record) => {

    if (record.contract._id) {
      const { contract: { _id: contract_id }, employee: { _id: employee_id }, parent_id: { _id: customer_id }, _id: position_id } = record;
      const item = hours.find(obj => obj.position === position_id && obj.date === date);
      if (contract_id && item) {
        return item
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  const setColor = (new_value, origin_value) => {

    if (new_value !== origin_value && new_value === 0) {
      return <p>0</p>
    }
    else if (!new_value) {
      return <p>{origin_value}</p>
    }
    else if (new_value > origin_value) {
      return <p className='parent_green'>{new_value}({origin_value})</p>
    } else if (new_value < origin_value) {
      return <p className='parent_yellow'>{new_value}({origin_value})</p>
    } else {
      return <p>{origin_value}</p>
    }
  }
  const [periodsColumn, setPeriodsColumn] = useState();
  const [periodsData, setPeriodsData] = useState([]);
  const checkPeriods = (contract, start, end, what, obj = false) => {
    const { start_date: contract_start, end_date: contract_end } = contract;

    let startDate = moment(new Date(contract_start), 'MM-DD-YYYY');
    let endDate = moment(new Date(contract_end), 'MM-DD-YYYY');
    let targetStartDate = moment(start, 'MM-DD-YYYY');
    const targetEndDate = moment(end, 'MM-DD-YYYY');
    if (obj) {
      if (obj.viaticum_flag) {
        if (obj.viaticum_start_date) startDate = moment(new Date(obj.viaticum_start_date), "MM-DD-YYYY");
        if (obj.viaticum_end_date) startDate = moment(new Date(obj.viaticum_end_date), "MM-DD-YYYY");
      } else {
        if (obj.start_date) startDate = moment(new Date(obj.start_date), "MM-DD-YYYY");
        if (obj.end_date) endDate = moment(new Date(obj.end_date), "MM-DD-YYYY");
      }
    }
    let flag = false;
    const PeriodShouldBeworked = [];
    while (targetStartDate.isSameOrBefore(targetEndDate)) {
      if (targetStartDate.isBetween(startDate, endDate, null, '[]') && targetStartDate.day()) {
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
  const getWorkedStatus = (record) => {
    var flag = true;
    for (var key in record) {
      if (key.includes('services-day-')) {
        const date_key = key.split('services-day-')[1].split("_").join("-");
        const day = moment(new Date(date_key)).day();
        if (day && !record[key]) {
          flag = false;
        }
      }
    }
    return flag;
  }

  const getFullPaymentStatus = (workDates, start, end, record) => {
    let start_date = moment(start);
    let end_date = moment(end);
    const work_start = workDates[0];
    const real_start = record.start_date ? moment(record.start_date).format('MM-DD-YYYY') : moment(record.viaticum_start_date).format('MM-DD-YYYY');
    const real_end = record.start_date ? moment(record.end_date).format('MM-DD-YYYY') : moment(record.viaticum_end_date).format('MM-DD-YYYY');
    const work_end = workDates[workDates.length - 1]
    if (getWorkedStatus(record) && record.adjustment === 0 && work_start === start_date.format('MM-DD-YYYY') && work_end === end_date.format('MM-DD-YYYY') && work_start >= real_start && work_end <= real_end) {
      return true;
    } else {
      return false;
    }
  }

  useEffect(() => {
    async function init() {
      const { result: allHours } = await request.list({ entity });
      const startDay = parseInt(currentPeriod.split("-")[0]);
      const endDay = parseInt(currentPeriod.split("-")[1]);
      const start_date = new Date(currentYear, startDay === 31 ? (currentMonth - 2) : (currentMonth - 1), startDay);
      const end_date = new Date(currentYear, currentMonth - 1, endDay);

      let currentDate = moment(start_date);
      var date = new Date(start_date);
      date.setMonth(date.getMonth() + 12);
      const end = moment(end_date);

      const daysColumns = [];
      const periodsColumns = [];
      const initPeriodsData = {};
      while (currentDate.isSameOrBefore(end)) {
        const day = currentDate.date();
        const _day = currentDate.day();
        const year = currentDate.year();
        const month = currentDate.month();
        periodsColumns.push(

          {
            title: currentDate.format("MMM/DD"),
            dataIndex: `-day-${year}_${month + 1}_${day}`,
            editable: true
          }
        )

        initPeriodsData[`-day-${year}_${month + 1}_${day}`] = 0;
        initPeriodsData['key'] = currentDate.valueOf();
        daysColumns.push({
          title: `${currentDate.format("dddd").slice(0, 1).toUpperCase()} ${day}`,
          dataIndex: `-day-${year}_${month + 1}_${day}`,
          render: (text, record) => {
            const { contract } = record;
            switch (_day) {
              case 0:
                return (

                  !(contract && Object(contract).hasOwnProperty('type')) ?
                    <Typography.Text>
                      {0}
                    </Typography.Text>
                    :
                    <Typography.Text onDoubleClick={() => editItem(record, changedCellItem(allHours, `${year}/${month + 1}/${day}`, record) || { hour: record.sunday_hr }, `${year}/${month + 1}/${day}`, record.sunday_hr)}>
                      {(text) || 0}
                    </Typography.Text>
                );
              case 1:
                return (
                  !(contract && Object(contract).hasOwnProperty('type')) ?
                    <Typography.Text>
                      {0}
                    </Typography.Text>
                    :
                    <Typography.Text onDoubleClick={() => editItem(record, changedCellItem(allHours, `${year}/${month + 1}/${day}`, record) || { hour: record.monday_hr }, `${year}/${month + 1}/${day}`, record.monday_hr)}>
                      {(text) || 0}
                    </Typography.Text>
                );
              case 2:
                return (
                  !(contract && Object(contract).hasOwnProperty('type')) ?
                    <Typography.Text>
                      {0}
                    </Typography.Text>
                    :
                    <Typography.Text onDoubleClick={() => editItem(record, changedCellItem(allHours, `${year}/${month + 1}/${day}`, record) || { hour: record.tuesday_hr }, `${year}/${month + 1}/${day}`, record.tuesday_hr)}>
                      {(text) || 0}
                    </Typography.Text>
                );
              case 3:
                return (
                  !(contract && Object(contract).hasOwnProperty('type')) ?
                    <Typography.Text>
                      {0}
                    </Typography.Text>
                    :
                    <Typography.Text onDoubleClick={() => editItem(record, changedCellItem(allHours, `${year}/${month + 1}/${day}`, record) || { hour: record.wednesday_hr }, `${year}/${month + 1}/${day}`, record.wednesday_hr)}>
                      {(text) || 0}
                    </Typography.Text>
                );
              case 4:
                return (
                  !(contract && Object(contract).hasOwnProperty('type')) ?
                    <Typography.Text>
                      {0}
                    </Typography.Text>
                    :
                    <Typography.Text onDoubleClick={() => editItem(record, changedCellItem(allHours, `${year}/${month + 1}/${day}`, record) || { hour: record.thursday_hr }, `${year}/${month + 1}/${day}`, record.thursday_hr)}>
                      {(text) || 0}
                    </Typography.Text>
                );
              case 5:
                return (
                  !(contract && Object(contract).hasOwnProperty('type')) ?
                    <Typography.Text>
                      {0}
                    </Typography.Text>
                    :
                    <Typography.Text onDoubleClick={() => editItem(record, changedCellItem(allHours, `${year}/${month + 1}/${day}`, record) || { hour: record.friday_hr }, `${year}/${month + 1}/${day}`, record.friday_hr)}>
                      {(text) || 0}
                    </Typography.Text>
                );
              case 6:
                return (
                  !(contract && Object(contract).hasOwnProperty('type')) ?
                    <Typography.Text>
                      {0}
                    </Typography.Text>
                    :
                    <Typography.Text onDoubleClick={() => editItem(record, changedCellItem(allHours, `${year}/${month + 1}/${day}`, record) || { hour: record.saturday_hr }, `${year}/${month + 1}/${day}`, record.saturday_hr)}>
                      {(text) || 0}
                    </Typography.Text>
                );

              default:
                break;
            }
          }
        })

        currentDate = currentDate.add(1, 'days');
      };
      setPeriodsColumn(periodsColumns)
      setPeriodsData([initPeriodsData]);
      setChangedDays(daysColumns);
      setMergedColumns([...columns, ...daysColumns])
      const { result: replacementData } = await request.list({ entity: "replacement" });
      const { result: workContracts } = await request.list({ entity: "workContract" })
      const { result: assignedEmployees } = await request.list({ entity: "assignedEmployee" });
      const { result: allEmployees } = await request.list({ entity: "employee" });
      const { result: userData } = await request.list({ entity: "Admin" });
      const { result: BankDetails } = await request.list({ entity: "bankAccount" });
      const getBankDetails = (emplopyee_id) => {
        const item = BankDetails.find(item => item.parent_id === emplopyee_id);
        return item || {};
      }
      const filteredReplacements = replacementData.filter(data => dateValue(data.start_date) === dateValue(start_date) && dateValue(data.end_date) === dateValue(end_date))
      setUserData(userData);
      const _employees = allEmployees.map(employee => {
        return {
          value: employee._id,
          label: employee.name
        }
      })
      setEmployeeList(_employees);
      setGlobalEmployeeLists(_employees)
      const assignedContracts = [];

      const viaticumArr = [];
      assignedEmployees.map(position => {
        const { viaticum, contract, ...otherObj } = position;
        if (viaticum && contract) {
          otherObj.contract = viaticum
          viaticumArr.push({ ...otherObj, viaticum_flag: true });
          assignedEmployees.push({ ...otherObj, viaticum_flag: true });
        } else if (viaticum && !contract) {
          position.contract = { ...viaticum, viaticum_flag: true };
        }
      });


      const unworkedContracts = [];



      const filteredLists = assignedEmployees.filter(({ contract, viaticum }) =>
        Object(contract).hasOwnProperty('status') && contract.status === "active" &&
        (
          checkPeriods(contract, start_date, end_date, 0)
        )
      );
      filteredLists.map(position => {
        if (position.contract && moment(new Date(position.start_date)).isAfter(moment(new Date(position.contract.start_date)))) {
          const { start_date, end_date, _id, contract, ...unassingedPeriods } = position
          unworkedContracts.push({ ...contract, _id: new Date().valueOf(), start_date: contract.start_date, end_date: moment(start_date).subtract(1, "d").format("MM/DD/YYYY") })
        }

        if (position.contract && moment(new Date(position.end_date)).isBefore(moment(new Date(end_date)))) {
          console.log(moment(new Date(end_date)).format("MM/DD/YYYY"), 'moment(new Date(end_date)).format("MM/DD/YYYY")');
          const { start_date, _id, contract, ...unassingedPeriods } = position
          unworkedContracts.push({
            ...contract, _id: new Date().valueOf(), start_date: moment(new Date(position.end_date)).add(1, 'd').format("MM/DD/YYYY"), end_date: moment(new Date(end_date)).format("MM/DD/YYYY")
          })
        }
      })
      const _listItems = assignedEmployees.filter(({ contract, viaticum }) =>
        Object(contract).hasOwnProperty('status') && contract.status === "active" &&
        (
          checkPeriods(contract, start_date, end_date, 0)
        )
      );
      _listItems.map((obj, index) => {
        const { contract: assignedContract, employee } = obj;
        obj.sunday_hr = obj.sunday ? getHours(obj.sunday) : 0;
        obj.monday_hr = obj.monday ? getHours(obj.monday) : 0;
        obj.tuesday_hr = obj.tuesday ? getHours(obj.tuesday) : 0;
        obj.wednesday_hr = obj.wednesday ? getHours(obj.wednesday) : 0;
        obj.thursday_hr = obj.thursday ? getHours(obj.thursday) : 0;
        obj.friday_hr = obj.friday ? getHours(obj.friday) : 0;
        obj.saturday_hr = obj.saturday ? getHours(obj.saturday) : 0;
        obj.workDays = checkPeriods(assignedContract, start_date, end_date, 1, obj);
        obj.payroll_id = obj._id;
        obj.bankData = getBankDetails(employee?._id);
        obj.bank = obj.bankData['bank'] || ''
        obj.account_type = obj.bankData['account_type'] || ''
        obj.account_no = obj.bankData['account_no'] || ''
        obj.ruta = obj.bankData['ruta'] || ''
        let currentDate = moment(start_date);
        const end = moment(end_date);

        while (currentDate.isSameOrBefore(end)) {
          const day = currentDate.date();
          const _day = currentDate.day();
          const year = currentDate.year();
          const month = currentDate.month();
          const dataIndex = `-day-${year}_${month + 1}_${day}`;
          const dataIndex2 = `services-day-${year}_${month + 1}_${day}`;
          const dataIndex1 = `_day-${year}_${month + 1}_${day}`;
          const dataIndex_new = `new-day-${year}_${month + 1}_${day}`;
          switch (_day) {
            case 0:
              obj[dataIndex] = setColor(changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj), obj.sunday_hr);
              obj[dataIndex1] = (changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.sunday_hr) - obj.sunday_hr
              obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.sunday_hr);
              obj[dataIndex_new] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.sunday_hr);
              // obj[dataIndex_new] = (changedCellHour(allHours, obj.sunday_hr, `${year}/${month + 1}/${day}`, obj, true))
              break;

            case 1:
              obj[dataIndex] = setColor(changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj), obj.monday_hr);
              obj[dataIndex1] = (changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.monday_hr) - obj.monday_hr;
              obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.monday_hr);
              obj[dataIndex_new] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.monday_hr);
              // obj[dataIndex_new] = (changedCellHour(allHours, obj.monday_hr, `${year}/${month + 1}/${day}`, obj, true))
              break;

            case 2:
              obj[dataIndex] = setColor(changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj), obj.tuesday_hr);
              obj[dataIndex1] = (changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.tuesday_hr) - obj.tuesday_hr
              obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.tuesday_hr);
              obj[dataIndex_new] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.tuesday_hr);
              // obj[dataIndex_new] = (changedCellHour(allHours, obj.tuesday_hr, `${year}/${month + 1}/${day}`, obj, true))
              break;

            case 3:
              obj[dataIndex] = setColor(changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj), obj.wednesday_hr);
              obj[dataIndex1] = (changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.wednesday_hr) - obj.wednesday_hr
              obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.wednesday_hr);
              obj[dataIndex_new] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.wednesday_hr);
              // obj[dataIndex_new] = (changedCellHour(allHours, obj.wednesday_hr, `${year}/${month + 1}/${day}`, obj, true))
              break;

            case 4:
              obj[dataIndex] = setColor(changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj), obj.thursday_hr);
              obj[dataIndex1] = (changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.thursday_hr) - obj.thursday_hr
              obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.thursday_hr);
              obj[dataIndex_new] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.thursday_hr);
              // obj[dataIndex_new] = (changedCellHour(allHours, obj.thursday_hr, `${year}/${month + 1}/${day}`, obj, true))
              break;
            case 5:
              obj[dataIndex] = setColor(changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj), obj.friday_hr);
              obj[dataIndex1] = (changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.friday_hr) - obj.friday_hr
              obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.friday_hr);
              obj[dataIndex_new] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.thursday_hr);
              // obj[dataIndex_new] = (changedCellHour(allHours, obj.friday_hr, `${year}/${month + 1}/${day}`, obj, true))
              break;
            case 6:
              obj[dataIndex] = setColor(changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj), obj.saturday_hr);
              obj[dataIndex1] = (changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.saturday_hr) - obj.saturday_hr
              obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.saturday_hr);
              obj[dataIndex_new] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.saturday_hr);
              // obj[dataIndex_new] = (changedCellHour(allHours, obj.saturday_hr, `${year}/${month + 1}/${day}`, obj, true))
              break;

            default:
              break;
          }
          currentDate = currentDate.add(1, 'days');
        };
        obj.sal_hr = parseFloat(assignedContract.sal_hr).toFixed(2);
        obj.hrs_bi = getServiceHours(obj);
        obj.week_pay =
          (assignedContract && assignedContract.type) ?
            (
              assignedContract.type === 3 ?
                (assignedContract.sal_monthly / 2).toFixed(2)
                :
                mathCeil(obj.hrs_bi * assignedContract.sal_hr || 0)
            )
            : mathCeil(obj.hrs_bi * obj.sal_hr)
        obj.adjustment = calcAdjustment(obj);
        obj.adjust =
          assignedContract.type === 3 ?
            ((obj.adjustment / obj.hrs_bi) * obj.week_pay).toFixed(2)
            : (calcAdjustment(obj) * obj.sal_hr || 0).toFixed(2);
        obj.full_status = getFullPaymentStatus(obj.workDays, start_date, end_date, obj);
        obj.salary =
          (assignedContract.type <= 2 && (getFullPaymentStatus(obj.workDays, start_date, end_date, obj) || assignedContract.hr_week * 2 === parseFloat(obj.hrs_bi))) ?
            (assignedContract.sal_monthly / 2).toFixed(2) || 0
            :
            ((parseFloat(obj.adjust) + parseFloat(obj.week_pay))).toFixed(2) || 0;
        obj.replace = false
      });
      filteredReplacements.map(replace => {
        replace.hours = JSON.parse(replace.hours)[0]
        replace.contract = { type: replace.contract_type, sal_hr: replace.sal_hr, replace: true }
        replace.employee = replace.replacement
        let currentDate = moment(start_date);
        const end = moment(end_date);
        while (currentDate.isSameOrBefore(end)) {
          const day = currentDate.date();
          const year = currentDate.year();
          const month = currentDate.month();
          const dataIndex = `-day-${year}_${month + 1}_${day}`;
          const dataIndex_origin = `origin-day-${year}_${month + 1}_${day}`;
          const dataIndex_new = `new-day-${year}_${month + 1}_${day}`;
          const dataIndex_comment = `comment-day-${year}_${month + 1}_${day}`;
          const dataIndex2 = `services-day-${year}_${month + 1}_${day}`;
          const dataIndex1 = `_day-${year}_${month + 1}_${day}`;
          const originValue = replace.hours[dataIndex] || 0;



          // finding error
          // obj[dataIndex] = setColor(changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj), obj.saturday_hr);
          // obj[dataIndex1] = (changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.saturday_hr) - obj.saturday_hr
          // obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.saturday_hr);
          // obj[dataIndex_new] = (changedCellHour(allHours, obj.saturday_hr, `${year}/${month + 1}/${day}`, obj, true))


          // const dataIndex = `-day-${year}_${month + 1}_${day}`;
          // const dataIndex2 = `services-day-${year}_${month + 1}_${day}`;
          // const dataIndex1 = `_day-${year}_${month + 1}_${day}`;
          // const dataIndex_new = `new-day-${year}_${month + 1}_${day}`;
          replace[dataIndex] = setColor(changedCellValue(allHours, `${year}/${month + 1}/${day}`, replace), originValue)
          replace[dataIndex1] = (changedCellValue(allHours, `${year}/${month + 1}/${day}`, replace) || originValue) - originValue
          replace[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, replace, originValue);
          replace[dataIndex_new] = originValue
          replace[dataIndex_origin] = originValue
          replace[dataIndex_comment] = changedCellHour(allHours, originValue, `${year}/${month + 1}/${day}`, replace, false)
          replace[`history${dataIndex}`] = getHistory(allHours, `${year}/${month + 1}/${day}`, replace)
          currentDate = currentDate.add(1, 'days');
        };
        replace.sal_hr = parseFloat(replace.sal_hr).toFixed(2)
        replace.replace = true
        replace.hours =
          <Popconfirm title="Sure to delete?" onConfirm={() => deleteItem(replace._id)}>
            <label>Replacement {'        '}</label>
            <DeleteOutlined style={{ fontSize: "20px", color: 'blue' }} />
          </Popconfirm>

        replace.hrs_bi = getServiceHours(replace);
        replace.week_pay = mathCeil(replace.hrs_bi * replace.sal_hr)
        replace.adjustment = calcAdjustment(replace);
        replace.adjust = ((replace.adjustment / replace.hrs_bi) * replace.week_pay).toFixed(2)
        replace.salary = ((parseFloat(replace.adjust) + parseFloat(replace.week_pay))).toFixed(2) || 0;
      })
      console.log(filteredReplacements, '_listItems111111');

      assignedEmployees.map(obj => {
        const { contract: assignedContract } = obj;
        assignedContracts.push(assignedContract);
      })
      const unAssingedEmployees = [];
      assignedEmployees.map(({ contract, employee, ...otherObject }) => {
        if (!contract || !employee)
          unAssingedEmployees.push(otherObject);
      });
      _listItems.map(data => {
        if (!data.position) data.position = ''
      })
      unAssingedEmployees.map((obj, index) => {
        obj.sunday_hr = obj.sunday ? getHours(obj.sunday) : 0;
        obj.monday_hr = obj.monday ? getHours(obj.monday) : 0;
        obj.tuesday_hr = obj.tuesday ? getHours(obj.tuesday) : 0;
        obj.wednesday_hr = obj.wednesday ? getHours(obj.wednesday) : 0;
        obj.thursday_hr = obj.thursday ? getHours(obj.thursday) : 0;
        obj.friday_hr = obj.friday ? getHours(obj.friday) : 0;
        obj.saturday_hr = obj.saturday ? getHours(obj.saturday) : 0;
        obj.sal_hr = parseFloat(obj.sal_hr).toFixed(2)
        obj.hrs_bi = getServiceHours(obj);
        obj.week_pay = mathCeil(obj.hrs_bi * obj.sal_hr)
        obj.adjustment = calcAdjustment(obj);
        obj.adjust = (obj.adjustment * obj.sal_hr || 0).toFixed(2);
        obj.salary = (obj.gross_salary).toFixed(2) || 0;
        obj.employee = { personal_id: '', name: '' };
        obj.unassinged = true;
      });
      [...workContracts, ...unworkedContracts].map(obj => {
        obj.contract = { type: obj.type, flag: false }
        obj.workDays = checkPeriods(obj, start_date, end_date, 1);
        let currentDate = moment(start_date);
        const end = moment(end_date);

        let contractWeekHours = obj.hr_week || 0;
        let dailyHours = obj.daily_hour || 0
        const splitedWeekHours = getSplitedWeekHours(contractWeekHours, dailyHours);
        while (currentDate.isSameOrBefore(end)) {
          const day = currentDate.date();
          const _day = currentDate.day();
          const year = currentDate.year();
          const month = currentDate.month();
          const dataIndex = `-day-${year}_${month + 1}_${day}`;
          const dataIndex2 = `services-day-${year}_${month + 1}_${day}`;
          const dataIndex_new = `new-day-${year}_${month + 1}_${day}`;
          if (_day && obj.workDays.join(",").includes(currentDate.format("MM-DD-YYYY"))) {
            obj[dataIndex] = splitedWeekHours[_day - 1]
            obj[dataIndex2] = splitedWeekHours[_day - 1]
            obj[dataIndex_new] = splitedWeekHours[_day - 1]
          }
          currentDate = currentDate.add(1, 'days');
        };
        obj.sal_hr = parseFloat(obj.sal_hr).toFixed(2)
        obj.hrs_bi = getServiceHours(obj)
        obj.salary = (obj.type <= 2 && (dateValue(obj.start_date) <= dateValue(start_date) && dateValue(obj.end_date) >= dateValue(end_date))) ? (obj.sal_monthly / 2).toFixed(2) : (obj.sal_hr * obj.hrs_bi).toFixed(2)
        obj.employee = obj.parent_id;

        obj.bankData = getBankDetails(obj.employee?._id);
        obj.bank = obj.bankData['bank'] || ''
        obj.account_type = obj.bankData['account_type'] || ''
        obj.account_no = obj.bankData['account_no'] || ''
        obj.ruta = obj.bankData['ruta'] || ''
      })
      const filterdWorkContract = [...workContracts, ...unworkedContracts].filter(contract => Object(contract).hasOwnProperty('status') && contract.status === "active" &&
        (
          checkPeriods(contract, start_date, end_date, 0)
        ))
      filterdWorkContract.map(contract => {
        contract.store = { store: '' }
      })
      const groupedContract = JSON.parse(JSON.stringify(_listItems)).reduce((acc, item) => {
        const existingItem = acc.find(i => i.employee._id === item.employee._id && i.contract._id === item.contract._id);
        if (!existingItem) {
          acc.push(item);
        }
        return acc;
      }, []);
      groupedContract.map(a_item => {
        a_item.full_periods = [a_item.full_status];
        a_item.childrens = [a_item];
        _listItems.map(b_item => {
          if (a_item._id !== b_item._id && a_item.contract._id === b_item.contract._id && a_item.employee._id === b_item.employee._id) {
            a_item.hr_week += parseFloat(a_item.hr_week)
            a_item.full_periods.push(b_item.full_status)
            a_item.childrens.push(b_item);
          }
        });
        filterdWorkContract.map(c_item => {
          if (c_item.type <= 2 && a_item.contract._id === c_item._id && a_item.employee._id === c_item.employee._id) {
            if (a_item.hr_week >= c_item.hr_week) {
              c_item.isShow = false;
            } else {


              // c_item.isShow = true;
              c_item.hrs_bi = getPartialHours(c_item, a_item.childrens);
              if (a_item.full_periods.toString().includes("false") || c_item.hrs_bi !== c_item.hr_week * 2) {


                c_item.hr_week = parseFloat(c_item.hr_week) - parseFloat(a_item.hr_week);

                c_item.salary = (c_item.hrs_bi * parseFloat(c_item.sal_hr)).toFixed(2);
                console.log('----------11111113434111111');
              } else {
                // console.log(parseFloat(c_item.hr_week), '----', (parseFloat(c_item.hr_week) + parseFloat(a_item.hr_week)));
                c_item.hr_week = parseFloat(c_item.hr_week) - parseFloat(a_item.hr_week);

                c_item.salary = ((parseFloat(c_item.hr_week) / (parseFloat(c_item.hr_week) + parseFloat(a_item.hr_week))) * c_item.sal_monthly / 2).toFixed(2)
              }
            }
          }
        })
      })
      const finalWorkConctract = filterdWorkContract.filter(contract => contract.isShow !== false)
      const sortedListItems = _listItems.sort((a, b) => b.position.localeCompare(a.position));
      const allDatas = [...sortedListItems, ...filteredReplacements, ...finalWorkConctract, ...unAssingedEmployees];
      allDatas.map(obj => {
        if (!obj.payroll_id) {
          obj.payroll_id = "ZZZZZ"
        }
      })
      const sortedLists = allDatas.sort((a, b) => a.payroll_id.localeCompare(b.payroll_id));
      allDatas.map((data, index) => data['key'] = index)
      setListItems(sortedLists);
      setGlobalItems(sortedLists);

      console.log(sortedLists, 'sortedLists');
    }
    init()
  }, [
    currentPeriod, saveStatus, currentMonth, currentYear, changeStatus
  ]);

  const getSplitedWeekHours = (hr_week, daily_hour) => {
    var hours = [];
    var weekHours = hr_week
    for (var i = 0; i < 6; i++) {
      if (weekHours - daily_hour >= 0) {
        hours.push(daily_hour)
        weekHours -= daily_hour
      } else if (weekHours < daily_hour) {
        hours.push(weekHours)
        weekHours = 0;
      } else {
        hours.push(0);
      }
    }
    return hours;
  }
  const getPartialHours = (contract, childrens) => {


    console.log(childrens, 'chi1ldrens');
    let { daily_hour } = contract.daily_hour ? contract : { ...contract, daily_hour: 8 };
    daily_hour = parseFloat(daily_hour);

    let pendingHours = 0;
    childrens.map(children => {
      for (var key in children) {
        if (key.includes("new-day-")) {
          pendingHours += (parseFloat(daily_hour) - parseFloat(children[key]))
        }
      }
    })
    console.log(pendingHours, 'daily_hour')

    return pendingHours;
  }
  const getHistory = (hours, date, record) => {
    const { _id } = record;
    const item = hours.find(obj => obj.position === _id && dateValue(date) === dateValue(obj.date))

    if (item) {
      return item
    } else {
      return false
    }
  }
  const getServiceHours = (record) => {
    var hours = 0;
    for (var key in record) {
      if (key.includes('new-day-')) {
        hours += parseFloat(record[key]);
      }
    }
    return hours;
  }
  const [isChangeHistory, setIsChangeHistory] = useState(false);
  const [historyData, setHistoryData] = useState();
  const handleCancelHistory = () => {
    setIsChangeHistory(false);
  }
  const showHistory = () => {
    setIsChangeHistory(true)
    if (currentHistory) {
      const { history } = currentHistory;
      console.log(currentHistory, 'userData')
      const historyDatas = JSON.parse(history || '[]');
      for (var i = 0; i < historyDatas.length; i++) {
        var history_ = historyDatas[i];
        for (var j = 0; j < userData.length; j++) {
          var user = userData[j];
          if (history_.auth_id === user._id) {
            history_['auth_id'] = user.name
          }
        }
        history_['key'] = i;
      }
      setHistoryData(historyDatas);
    } else {
      setHistoryData([])
    }
  }

  const exportToExcel = () => {
    const tableData = [];
    const addedHeader = [{
      title: "Ruta",
      hidden: true,
      dataIndex: "ruta"
    },
    {
      title: "Account No.",
      hidden: true,
      dataIndex: "account_no"
    },
    {
      title: "Bank name",
      hidden: true,
      dataIndex: "bank"
    },
    {
      title: "Account type",
      hidden: true,
      dataIndex: "account_type"
    },]
    let insertPosition = 3;
    const columns1 = [...mergedColumns];

    columns1.splice(insertPosition, 0, ...addedHeader)
    const headerRow1 = columns1.map((column) => column.title);
    console.log(columns1, 'columns1');
    tableData.push(headerRow1);
    listItems.forEach((record) => {
      const rowData = columns1.map((column, index) => {
        if (column.dataIndex && column.dataIndex.includes('-day-')) {
          return record[`services${column.dataIndex}`] || 0;
        }
        else if (column.dataIndex && column.dataIndex.includes('store') && record['store']) {
          return record['store']['store']
        }
        else if (column.dataIndex && column.dataIndex.includes('personal_id') && record['employee']) {
          return record['employee']['personal_id']
        }
        else if (column.dataIndex && column.dataIndex.includes('name') && record['employee']) {
          return record['employee']['name']
        }
        else if (column.dataIndex && column.dataIndex.includes('hours')) {
          return `${getFormattedHours(
            [
              record.monday ? [record.monday[0], record.monday[1]] : "",
              record.tuesday ? [record.tuesday[0], record.tuesday[1]] : "",
              record.wednesday ? [record.wednesday[0], record.wednesday[1]] : "",
              record.thursday ? [record.thursday[0], record.thursday[1]] : "",
              record.friday ? [record.friday[0], record.friday[1]] : "",
              record.saturday ? [record.saturday[0], record.saturday[1]] : "",
              record.sunday ? [record.sunday[0], record.sunday[1]] : "",
            ])}`
        }
        else if (column.dataIndex && column.dataIndex[1] === 'type' && record['contract']) {
          return contractTypes[record['contract']['type']]
        }
        else if (column.dataIndex && column.dataIndex === 'account_type') {
          return record['account_type']
        }
        return record[`${column.dataIndex}`]
      });
      tableData.push(rowData);
    });
    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `Payroll${new Date().valueOf()}.xlsx`);
  }
  const isertReplacement = () => {
    setIsReplacement(true)
    if (replaceRef.current) {
      replaceRef.current.resetFields();
    }
  }
  useEffect(() => {
    if (globalItems) {
      const filteredData = globalItems.filter((record) => {
        const { store, employee } = record;
        return (
          (!searchText || (employee && employee['name'].toString().toLowerCase().includes(searchText.toLowerCase())) ||
            (store && store['store'].toString().toLowerCase().includes(searchText.toLowerCase())))
        );
      })
      setListItems(filteredData);
      setPaginations({ current: 1, pageSize: 10, total: filteredData.length })
    }
  }, [searchText, globalItems]);
  useEffect(() => {
    if (globalItems) {
      const filter = globalItems.map((item, index) => {
        const { employee, store } = item;
        if (employee && store && store.store && !item.replace) {
          return {
            value: `${employee._id}-${store._id}-${item._id}`,
            label: `${employee.name}(${store.store})`
          }
        }
      }).filter(data => data !== undefined).reduce((acc, item) => {
        const existingItem = acc.find(i => i.value === item.value);
        if (!existingItem) {
          acc.push(item);
        }
        return acc;
      }, []);
      setCurrentEmployees(filter);
      console.log(filter, 'globalItems')
    }
  }, [
    globalItems
  ])
  const Footer = () => {
    const pages = paginations
    const { current, count, total, page } = pages
    const currentPage = current || page;
    const totalSize = total || count;

    return (
      <>
        Mostrando registros del {listItems.length ? ((currentPage - 1) * 10 + 1) : 0} al {currentPage * 10 > (totalSize) ? (totalSize) : currentPage * 10} de un total de {totalSize} registros
      </>
    );
  }
  const handleCancelReplacement = () => {
    setIsReplacement(false);
  }
  const changeCurrentEmployee = (employee_id) => {

    if (employee_id) {
      employee_id = employee_id.split('-')[0]
      console.log(employee_id, 'employee_id');
      const filter = globalEmployeeLists.filter(list => list.value !== employee_id);
      setEmployeeList(filter);

    }
  }
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const handleSave_ = (row, values) => {
    const newData = [...periodsData];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setPeriodsData(newData);
  };
  const [initPeriodsColumn, setInitPeriodsColumn] = useState([]);
  useEffect(() => {
    if (periodsColumn) {
      const _columns = periodsColumn.map((col) => {
        if (!col.editable) {
          return col;
        }
        return {
          ...col,
          onCell: (record) => ({
            record,
            editable: col.editable,
            dataIndex: col.dataIndex,
            title: col.title,
            handleSave_,
            editing: isEditing(record).toString(),
          }),
        };
      })
      setInitPeriodsColumn(_columns)
    }
  }, [
    periodsColumn
  ]);
  const handleReplacement = (values) => {


    const jsonObj = { ...values, };
    jsonObj.store = jsonObj.employee.split('-')[1];
    jsonObj.payroll_id = jsonObj.employee.split('-')[2];
    jsonObj.employee = jsonObj.employee.split('-')[0];
    jsonObj.hours = JSON.stringify(periodsData)
    const startDay = parseInt(currentPeriod.split("-")[0]);
    const endDay = parseInt(currentPeriod.split("-")[1]);
    const start_date = new Date(currentYear, startDay === 31 ? (currentMonth - 2) : (currentMonth - 1), startDay);
    const end_date = new Date(currentYear, currentMonth - 1, endDay);
    jsonObj.start_date = start_date;
    jsonObj.end_date = end_date;
    dispatch(crud.create({ entity: 'replacement', jsonData: jsonObj }));
    setIsReplacement(false);
    setChangeStatus(!changeStatus);
  }
  return (

    <Layout style={{ padding: '30px', overflow: 'auto' }}>
      <Modal title={selectedDate} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} footer={null}>
        <>
          <Form
            ref={formRef}
            name="basic"
            labelCol={{
              span: 8,
            }}
            wrapperCol={{
              span: 16,
            }}
            initialValues={{
              remember: true,
            }}
            onFinish={onFinish}
            // onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              name="hours"
              label="Hours"
              rules={[
                {
                  required: true,
                  // validator: (_, value) => {
                  //   if (selectedCellValue === 0) {
                  //     if (value && value > 10) {
                  //       return Promise.reject(`Value must be less than or equal to 10`);
                  //     }
                  //   } else {
                  //     if (value && value > Math.abs(selectedCellValue)) {
                  //       return Promise.reject(`Value must be less than or equal to ${Math.abs(selectedCellValue)}`);
                  //     }
                  //   }
                  //   return Promise.resolve();
                  // }

                },
              ]}
            >
              <Input type='number' />
            </Form.Item>
            <Form.Item
              name="comment"
              label="Comment"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              wrapperCol={{
                offset: 8,
                span: 16,
              }}
            >
              <Button type="default" onClick={showHistory}>
                History                </Button>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
              <Button type="ghost" onClick={handleCancel}>
                cancel
              </Button>
            </Form.Item>
          </Form>
        </>
      </Modal>
      <Modal title="Change History" visible={isChangeHistory} onCancel={handleCancelHistory} footer={null} width={700}>
        <Table
          columns={[
            {
              title: "Date/Time",
              dataIndex: "created"
            },
            {
              title: "Comment",
              dataIndex: "comment"
            },
            {
              title: "By",
              dataIndex: 'auth_id'
            }, {
              title: "Prev Hour",
              dataIndex: 'prevHour'
            }, {
              title: "New Hour",
              dataIndex: 'new_hour'
            }
          ]}
          dataSource={historyData || []}
        />
      </Modal>
      <Modal title="Replacement" visible={isReplacement} footer={null} onCancel={handleCancelReplacement} width={1300}>
        <Form
          ref={replaceRef}
          onFinish={handleReplacement}
        >
          <Form.Item
            name={"employee"}
            label="Employee"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select options={currentEmployees} onChange={changeCurrentEmployee} />
          </Form.Item>
          <Form.Item name={"replacement"} label="Replacement"
            rules={[
              {
                required: true,
              },
            ]}>
            <Select options={employeeLists} />
          </Form.Item>

          <Form.Item name={"sal_hr"} label="Sal/Hr"
            rules={[
              {
                required: true,
                max: 500
              },
            ]}
          >
            <Input type='number' />
          </Form.Item>
          <Form.Item
            name={"contract_type"}
            label="Contract Type"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Radio.Group options={[
              {
                label: "Payroll",
                value: 1
              },
              {
                label: "Services",
                value: 2
              },
              {
                label: "Hourly",
                value: 4
              }
            ]} />
          </Form.Item>
          <Table columns={initPeriodsColumn || []} dataSource={periodsData || []} components={components} />
          <Form.Item
            className='mt-6'
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >


            {
              isUpdate ? <Button type="primary" htmlType="submit">
                Update
              </Button> :
                <Button type="primary" htmlType="submit">
                  Replace
                </Button>

            }

            <Button type="ghost" onClick={handleCancelReplacement}>
              cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Row style={{ textAlign: 'right' }}>
        <Col span={24}>
          <h3 style={{ textAlign: 'center' }}>
            <LeftOutlined onClick={prevData} />
            QUINCENA: {currentPeriod.split("-")[0]} DE {parseInt(currentPeriod.split("-")[0]) !== 31 ? new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' }) : new Date(currentYear, currentMonth - 2).toLocaleString('default', { month: 'long' })} AL {currentPeriod.split("-")[1]} DE {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' })} {currentYear}
            <RightOutlined onClick={nextData} />
          </h3>
        </Col>
        <Col span={5}>
          <Input
            placeholder='Search'
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />        </Col>
        <Col span={7}>
          <Button type='primary' onClick={isertReplacement}>Insert Replacement</Button>
        </Col>
        <Col span={7}>
          <Button type='primary' onClick={exportToExcel}>Export to Excel</Button>
        </Col>
      </Row>
      <Table
        bordered
        dataSource={listItems || []}
        columns={[...mergedColumns]}
        ref={tableRef}
        scroll={{
          x: 3000,
        }}
        pagination={false}
        footer={Footer}
      />
    </Layout>
  );
};
export default PayrollDetails;