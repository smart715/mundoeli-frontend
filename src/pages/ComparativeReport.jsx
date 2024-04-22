/* eslint-disable no-self-assign */
/* eslint-disable array-callback-return */
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Layout, Modal, Row, Table, } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { selectListItems } from '@/redux/crud/selectors';
import moment from 'moment';
import { request } from '@/request';
import { selectCurrentAdmin } from '@/redux/auth/selectors';
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



const mathCeil = (value) => {
  return value.toFixed(2)
}
const ComparativeReport = () => {
  const entity = "payroll"
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [isUpdate, setIsUpdate] = useState(false);
  const showModal = () => {
    setIsModalVisible(true);
    setIsUpdate(false);
    if (formRef.current) formRef.current.resetFields();
  };
  const dispatch = useDispatch();

  const handleOk = () => {
    // handle ok button click here
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const getCurrentQ = (date) => {
    if (date > 15) {
      return 1;
    } else {
      return 0;
    }
  }

  const [form] = Form.useForm();
  const [currentId, setCurrentId] = useState('');
  const [currentItem, setCurrentItem] = useState({});
  const [allHours, setAllHours] = useState([]);
  const [saveStatus, setSaveStatus] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentQ, setCurrentQ] = useState(getCurrentQ(new Date().getDate()))
  const [currentBiWeek, setCurrentBiweek] = useState(new Date())
  const [currentPeriod, setCurrentPeriod] = useState('1-15')
  const [changedDays, setChangedDays] = useState([]);
  const [biWeek, setBiWeek] = useState(0);
  const [selectedCellValue, setSelectedCellValue] = useState(0);
  const [selectedDate, setSelectedDate] = useState();
  const [byEmail, setByEmail] = useState();
  const [adjust, setAdjust] = useState(0);
  const [totalProjection, setTotalProjection] = useState(0);
  const [totalDifference, setTotalDifference] = useState(0);
  const editItem = (item, cellItem, current, mainHour) => {
    const { hour, comment, by: { email: byEmail = '' } = {} } = cellItem
    if (item) {
      setTimeout(() => {
        if (formRef.current) formRef.current.setFieldsValue({
          hours: hour,
          comment: comment,
        });
      }, 400);
      setSelectedCellValue(mainHour)
      setSelectedDate(current);
      setByEmail(byEmail)
      setCurrentId(item._id);
      setCurrentItem(item);
      setIsModalVisible(true);
      setIsUpdate(true);
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
    {
      title: 'Customer',
      dataIndex: ['parent_id', 'name'],
      width: '100',
      align: "center"

    },
    {
      title: 'Projection ',
      dataIndex: 'gross_salary',
      width: '100',
      align: "center",
      render: (_) => {
        return `$${_ ? _.toFixed(2) : 0 || 0}`
      }
    },
    {
      title: "Projected hours",
      render: (_, record) => {
        return parseFloat(record.hrs_bi || 0) + parseFloat(record.adjustment || 0)
      }
    }
    ,
    {
      title: 'Real Payment',
      dataIndex: 'salary',
      width: '100',
      align: "center",
      render: (_) => {
        return `$${_ ? _.toFixed(2) : 0}`
      }
    },

    {
      title: "Real hours",
      dataIndex: 'hrs_bi'
    },
    {
      title: 'Difference',
      width: '100',
      render: (_, record) => {
        return `$${((parseInt(record.gross_salary) || 0) - (parseInt(record.salary) || 0)).toFixed(2)}`
      },
      align: "center"
    },
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


  const { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems);

  const { pagination, items } = listResult;
  const [listItems, setListItems] = useState([]);
  const formRef = useRef(null);
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
  const AdminId = useSelector(selectCurrentAdmin);
  const Auth = JSON.parse(localStorage.getItem('auth'));
  const onFinish = (values) => {
    const { comment, hours } = values;
    const { contract, employee, parent_id } = currentItem
    const jsonData = { by: Auth.id, hour: hours, date: selectedDate, comment: comment, contract: contract._id, employee: employee._id, customer: parent_id._id }
    console.log(allHours, 'allHoursallHours');

    const item = allHours.filter(obj => obj.contract === contract._id && obj.employee === employee._id && obj.customer === parent_id._id && obj.date === selectedDate)
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
      let startWorkDay = positionStart || moment(workDays[0], 'MM-DD-YYYY');
      let endWorkDay = end_date ? positionEnd : moment(workDays[workDays.length - 1], 'MM-DD-YYYY');
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


  const changedCellItem = (hours, date, record) => {
    const { contract: { _id: contract_id }, employee: { _id: employee_id }, parent_id: { _id: customer_id } } = record;
    const item = hours.find(obj => obj.contract === contract_id && obj.employee === employee_id && obj.customer === customer_id && obj.date === date);
    if (item) {
      return item
    } else {
      return false;
    }
  }
  const checkPeriods = (contract, start, end, what) => {
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

  useEffect(() => {
    async function init() {
      const { result: allHours } = await request.list({ entity });
      setAllHours(allHours)
      console.log(allHours, '1qwqwq');
      const startDay = parseInt(currentPeriod.split("-")[0]);
      const endDay = parseInt(currentPeriod.split("-")[1]);
      const start_date = new Date(currentYear, startDay === 31 ? (currentMonth - 2) : (currentMonth - 1), startDay);
      const end_date = new Date(currentYear, currentMonth - 1, endDay);

      var date = new Date(start_date);
      date.setMonth(date.getMonth() + 12);



      const { result: assignedEmployees } = await request.list({ entity: "assignedEmployee" })


      assignedEmployees.map(position => {

        if (position.start_date) {
          position.contract.start_date = moment(new Date(position.start_date)).format("MM/DD/YYYY");
        }
        if (position.end_date) {
          position.contract.end_date = moment(new Date(position.end_date)).format("MM/DD/YYYY");
        }
      })


      const _listItems = assignedEmployees.filter(({ contract }) =>
        Object(contract).hasOwnProperty('status') && contract.status === "active" &&
        (
          checkPeriods(contract, start_date, end_date, 0)
        )
      )
      _listItems.map(obj => {
        const { contract: assignedContract } = obj;
        obj.position = obj.position;
        obj.sunday_hr = obj.sunday ? getHours(obj.sunday) : 0;
        obj.monday_hr = obj.monday ? getHours(obj.monday) : 0;
        obj.tuesday_hr = obj.tuesday ? getHours(obj.tuesday) : 0;
        obj.wednesday_hr = obj.wednesday ? getHours(obj.wednesday) : 0;
        obj.thursday_hr = obj.thursday ? getHours(obj.thursday) : 0;
        obj.friday_hr = obj.friday ? getHours(obj.friday) : 0;
        obj.saturday_hr = obj.saturday ? getHours(obj.saturday) : 0;
        obj.workDays = checkPeriods(assignedContract, start_date, end_date, 1)


        let currentDate = moment(start_date);

        const end = moment(end_date);

        while (currentDate.isSameOrBefore(end)) {
          const day = currentDate.date();
          const _day = currentDate.day();
          const year = currentDate.year();
          const month = currentDate.month();
          const dataIndex = `-day-${year}_${month + 1}_${day}`;
          const dataIndex1 = `_day-${year}_${month + 1}_${day}`;
          const dataIndex2 = `services-day-${year}_${month + 1}_${day}`;
          const dataIndex_new = `new-day-${year}_${month + 1}_${day}`;

          switch (_day) {
            case 0:
              obj[dataIndex] = changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.sunday_hr;
              obj[dataIndex1] = (changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.sunday_hr) - obj.sunday_hr
              obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.sunday_hr);
              obj[dataIndex_new] = obj[dataIndex2]
              // obj[dataIndex_new] = (changedCellHour(allHours, obj.sunday_hr, `${year}/${month + 1}/${day}`, obj, true))
              break;

            case 1:
              obj[dataIndex] = changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.monday_hr;
              obj[dataIndex1] = (changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.monday_hr) - obj.monday_hr
              obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.monday_hr);
              obj[dataIndex_new] = obj[dataIndex2]
              // obj[dataIndex_new] = (changedCellHour(allHours, obj.monday_hr, `${year}/${month + 1}/${day}`, obj, true))
              break;

            case 2:
              obj[dataIndex] = changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.tuesday_hr;
              obj[dataIndex1] = (changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.tuesday_hr) - obj.tuesday_hr
              obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.tuesday_hr);
              obj[dataIndex_new] = obj[dataIndex2]
              // obj[dataIndex_new] = (changedCellHour(allHours, obj.tuesday_hr, `${year}/${month + 1}/${day}`, obj, true))
              break;

            case 3:
              obj[dataIndex] = changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.wednesday_hr;
              obj[dataIndex1] = (changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.wednesday_hr) - obj.wednesday_hr
              obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.wednesday_hr);
              obj[dataIndex_new] = obj[dataIndex2]
              // obj[dataIndex_new] = (changedCellHour(allHours, obj.wednesday_hr, `${year}/${month + 1}/${day}`, obj, true))
              break;

            case 4:
              obj[dataIndex] = changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.thursday_hr;
              obj[dataIndex1] = (changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.thursday_hr) - obj.thursday_hr
              obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.thursday_hr);
              obj[dataIndex_new] = obj[dataIndex2]
              // obj[dataIndex_new] = (changedCellHour(allHours, obj.thursday_hr, `${year}/${month + 1}/${day}`, obj, true))
              break;
            case 5:
              obj[dataIndex] = changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.friday_hr;
              obj[dataIndex1] = (changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.friday_hr) - obj.friday_hr
              obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.friday_hr);
              obj[dataIndex_new] = obj[dataIndex2]
              // obj[dataIndex_new] = (changedCellHour(allHours, obj.friday_hr, `${year}/${month + 1}/${day}`, obj, true))
              break;
            case 6:
              obj[dataIndex] = changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.saturday_hr;
              obj[dataIndex1] = (changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.saturday_hr) - obj.saturday_hr
              obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.saturday_hr);
              obj[dataIndex_new] = obj[dataIndex2]
              // obj[dataIndex_new] = (changedCellHour(allHours, obj.saturday_hr, `${year}/${month + 1}/${day}`, obj, true))
              break;

            default:
              break;
          }
          currentDate = currentDate.add(1, 'days');
        };
        obj.sal_hr = assignedContract.sal_hr || 0;
        obj.hrs_bi = getServiceHours(obj);
        obj.week_pay = mathCeil(obj.hrs_bi * assignedContract.sal_hr || 0)
        obj.adjustment = calcAdjustment(obj);
        obj.adjust = obj.adjustment * obj.sal_hr;
        obj.salary = parseFloat(obj.adjust) + parseFloat(obj.week_pay);
      });

      console.log(_listItems, '_listIt111ems');
      const groupedCustomer = _listItems.reduce((acc, item) => {
        const existingItem = acc.find(i => i.parent_id._id === item.parent_id._id);
        if (!existingItem) {
          acc.push(item);
        }
        return acc;
      }, []);
      let _totalProjection = 0, _totalDifference = 0, _totalRealPayment = 0;
      groupedCustomer.map(item => {
        const { parent_id: customer1 } = item;
        _listItems.map(list => {
          const { parent_id: customer2 } = list
          if (item._id !== list._id && customer1._id === customer2._id) {
            item.salary += parseFloat(list.salary || 0);
            item.gross_salary += parseFloat(list.gross_salary || 0);
            item.gross_salary += parseFloat(list.gross_salary || 0);
          }
        });
        _totalProjection += item.gross_salary || 0;
        _totalRealPayment += item.salary || 0;
      });



      _totalDifference = _totalProjection - _totalRealPayment;
      setTotalProjection(parseFloat(_totalProjection).toFixed(2));
      setTotalDifference(parseFloat(_totalDifference).toFixed(2));
      setListItems([...groupedCustomer])
    }
    init()
  }, [
    currentPeriod, saveStatus, currentMonth, currentYear
  ]);
  const getServiceHours = (record) => {
    var hours = 0;
    for (var key in record) {
      if (key.includes('new-day-')) {
        hours += record[key];
      }
    }
    return hours;
  }
  useEffect(() => {
  }, [biWeek]);


  return (

    <Layout style={{ padding: '100px', overflow: 'auto' }}>
      <Modal title={selectedDate} open={isModalVisible} onOk={handleOk} onCancel={handleCancel} footer={null}>
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
                  validator: (_, value) => {
                    if (selectedCellValue === 0) {
                      if (value && value > 10) {
                        return Promise.reject(`Value must be less than or equal to 10`);
                      }
                    } else {
                      if (value && value > Math.abs(selectedCellValue)) {
                        return Promise.reject(`Value must be less than or equal to ${Math.abs(selectedCellValue)}`);
                      }
                    }
                    return Promise.resolve();
                  }

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
              {
                isUpdate ? <Button type="primary" htmlType="submit">
                  Update
                </Button> :
                  <Button type="primary" htmlType="submit">
                    Save
                  </Button>

              }

              <Button type="ghost" onClick={handleCancel}>
                cancel
              </Button>
            </Form.Item>
          </Form>
          {byEmail && `Changed by ${byEmail}`}
        </>
      </Modal>
      <Row>
        <Col span={24}>
          <h3 style={{ textAlign: 'center' }}>
            <LeftOutlined onClick={prevData} />
            QUINCENA: {currentPeriod.split("-")[0]} DE {parseInt(currentPeriod.split("-")[0]) !== 31 ? new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' }) : new Date(currentYear, currentMonth - 2).toLocaleString('default', { month: 'long' })} AL {currentPeriod.split("-")[1]} DE {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' })} {currentYear}
            <RightOutlined onClick={nextData} />

          </h3>
        </Col>
      </Row>
      <Row style={{
        textAlign: 'center', paddingTop: "50px", paddingBottom: "30px"
      }}>
        <Col span={12}>
          <h4 >Total Projection: ${totalProjection}</h4>
        </Col>
        <Col span={12}>
          <h4>Total Difference: ${totalDifference}</h4>

        </Col>
      </Row>
      <Table

        // scroll={{ x: (changedDays.length + columns.length) * 100, y: 1300 }}
        bordered
        rowKey={(item) => item._id}
        key={(item) => item._id}
        dataSource={listItems || []}
        columns={[...columns]}
        rowClassName="editable-row"
        style={{ width: '1500px' }}
      />


    </Layout>
    // <DashboardLayout>
    //   <Layout>

    //   </Layout>
    // </DashboardLayout>
  );
};
export default ComparativeReport;