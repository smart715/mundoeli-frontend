/* eslint-disable array-callback-return */
import { DashboardLayout, DefaultLayout } from '@/layout';
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, InputNumber, Layout, Modal, Popconfirm, Row, Space, Table, Tag, Typography } from 'antd';

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { selectListItems } from '@/redux/crud/selectors';
import moment from 'moment';
import { request } from '@/request';
import { Link } from 'react-router-dom/cjs/react-router-dom';
const mathCeil = (value) => {
  return value.toFixed(2)
}
const columns = [
  {
    title: 'Period',
    dataIndex: 'period_label',
    width: '15%',
    editable: true,
    render: (text, row) => {
      return (

        <Typography.Text>
          <Link to={`/payroll_details/${row.year}-${row.month + 1}-${row.q}`}>{text}</Link>
        </Typography.Text>
      )
    }
  },
  {
    title: 'Total Payroll',
    dataIndex: 'payroll_amount',
    width: '15%',
    editable: true,
    render: (text) => {
      return (mathCeil(text) || 0
      )
    }
  },
  {
    title: 'Total for services',
    dataIndex: 'services_amount',
    width: '15%',
    editable: true,
    render: (text) => {
      return (mathCeil(text) || 0
      )
    }
  },
  {
    title: 'Total',
    dataIndex: 'total',
    width: '15%',
    editable: true,
    render: (text, record) => {

      return (mathCeil(record.payroll_amount + record.services_amount))
    }
  },
];

const PayrollManagement = () => {
  const entity = "workContract"
  const [form] = Form.useForm();
  const [listItems, setListItems] = useState([]);
  const [payrollDetails, setPayrollDetails] = useState([])
  const [allHours, setAllHours] = useState([]);
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

  useEffect(() => {

  }, [payrollDetails])
  const getData = async () => {
    const start_date = '2023/06/1';
    const end_date = new Date();
    let currentDate = moment(new Date(start_date));

    const end = moment(end_date)
    const periods = []

    const { result: assignedEmployee } = await request.list({ entity: "assignedEmployee" });
    const { result: allHours } = await request.list({ entity: 'payroll' });
    const { result: workContracts } = await request.list({ entity: "workContract" })
    const { result: replacementData } = await request.list({ entity: "replacement" });

    while (currentDate.isSameOrBefore(end)) {

      if (currentDate.month() === end.month() && end.date() < 15) {
        periods.push({
          id: new Date().valueOf(),
          month: currentDate.month(),
          q: 0,
          period_label: `${currentDate.format('MMMM')}-1(${currentDate.year()})`,
          year: currentDate.year(),
          periods: getPeriods(currentDate.month(), currentDate.year(), 0),
          payroll_amount: getPaymentData(JSON.parse(JSON.stringify(assignedEmployee)), JSON.parse(JSON.stringify(replacementData)), allHours, workContracts, currentDate.year(), currentDate.month(), getPeriods(currentDate.month() + 1, currentDate.year(), 0), 1),
          services_amount: getPaymentData(JSON.parse(JSON.stringify(assignedEmployee)), JSON.parse(JSON.stringify(replacementData)), allHours, workContracts, currentDate.year(), currentDate.month(), getPeriods(currentDate.month() + 1, currentDate.year(), 0), 2)
        })
      }
      else {
        periods.push({
          id: new Date().valueOf(),
          month: currentDate.month(),
          q: 0,
          period_label: `${currentDate.format('MMMM')}-1(${currentDate.year()})`,
          year: currentDate.year(),
          periods: getPeriods(currentDate.month(), currentDate.year(), 0),
          payroll_amount: getPaymentData(JSON.parse(JSON.stringify(assignedEmployee)), JSON.parse(JSON.stringify(replacementData)), allHours, workContracts, currentDate.year(), currentDate.month(), getPeriods(currentDate.month() + 1, currentDate.year(), 0), 1)
          ,
          services_amount: getPaymentData(JSON.parse(JSON.stringify(assignedEmployee)), JSON.parse(JSON.stringify(replacementData)), allHours, workContracts, currentDate.year(), currentDate.month(), getPeriods(currentDate.month() + 1, currentDate.year(), 0), 2)

        },
          {
            id: new Date().valueOf() + 1,
            month: currentDate.month(),
            q: 1,
            period_label: `${currentDate.format('MMMM')}-2(${currentDate.year()})`,
            year: currentDate.year(),
            periods: getPeriods(currentDate.month(), currentDate.year(), 1),
            payroll_amount: getPaymentData(JSON.parse(JSON.stringify(assignedEmployee)), JSON.parse(JSON.stringify(replacementData)), allHours, workContracts, currentDate.year(), currentDate.month(), getPeriods(currentDate.month() + 1, currentDate.year(), 1), 1)
            ,
            services_amount: getPaymentData(JSON.parse(JSON.stringify(assignedEmployee)), JSON.parse(JSON.stringify(replacementData)), allHours, workContracts, currentDate.year(), currentDate.month(), getPeriods(currentDate.month() + 1, currentDate.year(), 1), 2)

          })
      }
      currentDate = currentDate.add(1, 'months');
    }
    periods.sort((a, b) => {
      return b.year - a.year || b.month - a.month || b.q - a.q
    })
    periods.map((obj, index) => {
      obj.key = index
    })
    setListItems(periods)
  }
  const dateValue = (date) => {
    return new Date(date).valueOf();
  }
  const changedCellValue = (hours, date, record, origin_value) => {

    const { workDays, start_date, end_date, contract, viaticum_start_date, viaticum_end_date, _id } = record;
    if (contract) {

      let positionStart = contract.type === 3 ? moment(new Date(viaticum_start_date), 'MM-DD-YYYY') : moment(new Date(start_date), 'MM-DD-YYYY');
      let positionEnd = contract.type === 3 ? moment(new Date(viaticum_end_date), 'MM-DD-YYYY') : moment(new Date(end_date), 'MM-DD-YYYY');


      let startWorkDay = positionStart || moment(workDays?.length ? workDays[0] : null, 'MM-DD-YYYY');
      let endWorkDay = end_date ? positionEnd : moment(workDays?.length ? workDays[workDays.length - 1] : null, 'MM-DD-YYYY');
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

  const getCellValue = (hours, date, record, origin_value) => {

    const { workDays, start_date, end_date, contract, viaticum_start_date, viaticum_end_date } = record;
    if (contract) {

      let positionStart = contract.type === 3 ? moment(new Date(viaticum_start_date), 'MM-DD-YYYY') : moment(new Date(start_date), 'MM-DD-YYYY');
      let positionEnd = contract.type === 3 ? moment(new Date(viaticum_end_date), 'MM-DD-YYYY') : moment(new Date(end_date), 'MM-DD-YYYY');


      let startWorkDay = positionStart || moment(workDays?.length ? workDays[0] : null, 'MM-DD-YYYY');
      let endWorkDay = end_date ? positionEnd : moment(workDays?.length ? workDays[workDays.length - 1] : null, 'MM-DD-YYYY');
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

  const getHours = (dates) => {
    const hours = dates.map(date => moment(date).hour());
    const maxHour = Math.max(...hours);
    const minHour = Math.min(...hours);
    const difference = maxHour - minHour;
    return (difference)
  }
  const checkPeriods = (contract, start, end, what, obj = false) => {
    const { start_date: contract_start, end_date: contract_end } = contract;

    let startDate = moment(new Date(contract_start), 'MM-DD-YYYY');
    let endDate = moment(new Date(contract_end), 'MM-DD-YYYY');
    if (obj) {
      if (obj.viaticum_flag) {
        if (obj.viaticum_start_date) startDate = moment(new Date(obj.viaticum_start_date), "MM-DD-YYYY");
        if (obj.viaticum_end_date) startDate = moment(new Date(obj.viaticum_end_date), "MM-DD-YYYY");
      } else {
        console.log(obj, obj.viaticum_flag, 'obj.viaticum_flag');
        if (obj.start_date) startDate = moment(new Date(obj.start_date), "MM-DD-YYYY");
        if (obj.end_date) endDate = moment(new Date(obj.end_date), "MM-DD-YYYY");
      }
    }

    let targetStartDate = moment(start, 'MM-DD-YYYY');
    const targetEndDate = moment(end, 'MM-DD-YYYY');
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

  const getPaymentData = (_assignedEmployees, _replacements, Hours, workContracts, year, month, periods, payType = 1) => {
    month++;
    const unassignedContracts = [];
    const assignedContracts = [];
    const startDay = parseInt(periods.split("-")[0]);
    const endDay = parseInt(periods.split("-")[1]);
    const start_date = new Date(year, startDay === 31 ? (month - 2) : (month - 1), startDay);
    const end_date = new Date(year, month - 1, endDay);
    const unworkedContracts = [];
    const filteredLists = _assignedEmployees.filter(({ contract }) =>
      Object(contract).hasOwnProperty("status") && contract.status === "active" &&
      (
        checkPeriods(contract, start_date, end_date, 0)
      )
    )
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
    console.log(unworkedContracts, 'unworkedContracts');
    // _assignedEmployees.map(position => {
    //   if (position.start_date) {
    //     position.contract.start_date = moment(new Date(position.start_date)).format("MM/DD/YYYY");
    //   }
    //   if (position.end_date) {
    //     position.contract.end_date = moment(new Date(position.end_date)).format("MM/DD/YYYY");
    //   }
    // })

    const _listItems = _assignedEmployees.filter(({ contract }) =>
      Object(contract).hasOwnProperty("status") && contract.status === "active" &&
      (
        checkPeriods(contract, start_date, end_date, 0)
      )
    )
    const filteredReplacements = _replacements.filter(data => dateValue(data.start_date) === dateValue(start_date) && dateValue(data.end_date) === dateValue(end_date))
    _listItems.map((obj, index) => {

      const { contract: assignedContract } = obj;
      if (assignedContract.type === payType) {
        obj.sunday_hr = obj.sunday ? getHours(obj.sunday) : 0;
        obj.monday_hr = obj.monday ? getHours(obj.monday) : 0;
        obj.tuesday_hr = obj.tuesday ? getHours(obj.tuesday) : 0;
        obj.wednesday_hr = obj.wednesday ? getHours(obj.wednesday) : 0;
        obj.thursday_hr = obj.thursday ? getHours(obj.thursday) : 0;
        obj.friday_hr = obj.friday ? getHours(obj.friday) : 0;
        obj.saturday_hr = obj.saturday ? getHours(obj.saturday) : 0;
        obj.workDays = checkPeriods(assignedContract, start_date, end_date, 1, obj)

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
              obj[dataIndex] = changedCellValue(Hours, `${year}/${month + 1}/${day}`, obj) || obj.sunday_hr;
              obj[dataIndex1] = (changedCellValue(Hours, `${year}/${month + 1}/${day}`, obj) || obj.sunday_hr) - obj.sunday_hr
              obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.sunday_hr);
              obj[dataIndex_new] = obj[dataIndex2]
              // obj[dataIndex_new] = (changedCellHour(allHours, obj.sunday_hr, `${year}/${month + 1}/${day}`, obj, true))


              break;

            case 1:
              obj[dataIndex] = changedCellValue(Hours, `${year}/${month + 1}/${day}`, obj) || obj.monday_hr;
              obj[dataIndex1] = (changedCellValue(Hours, `${year}/${month + 1}/${day}`, obj) || obj.monday_hr) - obj.monday_hr
              obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.monday_hr);
              // obj[dataIndex_new] = (changedCellHour(allHours, obj.monday_hr, `${year}/${month + 1}/${day}`, obj, true))
              obj[dataIndex_new] = obj[dataIndex2]
              break;

            case 2:
              obj[dataIndex] = changedCellValue(Hours, `${year}/${month + 1}/${day}`, obj) || obj.tuesday_hr;
              obj[dataIndex1] = (changedCellValue(Hours, `${year}/${month + 1}/${day}`, obj) || obj.tuesday_hr) - obj.tuesday_hr
              obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.tuesday_hr);
              // obj[dataIndex_new] = (changedCellHour(allHours, obj.tuesday_hr, `${year}/${month + 1}/${day}`, obj, true))
              obj[dataIndex_new] = obj[dataIndex2]

              break;

            case 3:
              obj[dataIndex] = changedCellValue(Hours, `${year}/${month + 1}/${day}`, obj) || obj.wednesday_hr;
              obj[dataIndex1] = (changedCellValue(Hours, `${year}/${month + 1}/${day}`, obj) || obj.wednesday_hr) - obj.wednesday_hr
              obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.wednesday_hr);
              // obj[dataIndex_new] = (changedCellHour(allHours, obj.wednesday_hr, `${year}/${month + 1}/${day}`, obj, true))
              obj[dataIndex_new] = obj[dataIndex2]
              break;

            case 4:
              obj[dataIndex] = changedCellValue(Hours, `${year}/${month + 1}/${day}`, obj) || obj.thursday_hr;
              obj[dataIndex1] = (changedCellValue(Hours, `${year}/${month + 1}/${day}`, obj) || obj.thursday_hr) - obj.thursday_hr
              obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.thursday_hr);
              // obj[dataIndex_new] = (changedCellHour(allHours, obj.thursday_hr, `${year}/${month + 1}/${day}`, obj, true))
              obj[dataIndex_new] = obj[dataIndex2]
              break;
            case 5:
              obj[dataIndex] = changedCellValue(Hours, `${year}/${month + 1}/${day}`, obj) || obj.friday_hr;
              obj[dataIndex1] = (changedCellValue(Hours, `${year}/${month + 1}/${day}`, obj) || obj.friday_hr) - obj.friday_hr
              obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.friday_hr);
              // obj[dataIndex_new] = (changedCellHour(allHours, obj.friday_hr, `${year}/${month + 1}/${day}`, obj, true))
              obj[dataIndex_new] = obj[dataIndex2]
              break;
            case 6:
              obj[dataIndex] = changedCellValue(Hours, `${year}/${month + 1}/${day}`, obj) || obj.saturday_hr;
              obj[dataIndex1] = (changedCellValue(Hours, `${year}/${month + 1}/${day}`, obj) || obj.saturday_hr) - obj.saturday_hr
              obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.saturday_hr);
              // obj[dataIndex_new] = (changedCellHour(allHours, obj.saturday_hr, `${year}/${month + 1}/${day}`, obj, true))
              obj[dataIndex_new] = obj[dataIndex2]
              break;

            default:
              break;
          }
          currentDate = currentDate.add(1, 'days');
        };
        obj.sal_hr = assignedContract.sal_hr || 0;

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
        obj.adjustment = calcAdjustment(obj) || 0;
        obj.adjust =
          assignedContract.type === 3 ?
            ((obj.adjustment / obj.hrs_bi) * obj.week_pay).toFixed(2)
            : (calcAdjustment(obj) * obj.sal_hr || 0).toFixed(2);
        obj.salary =
          (assignedContract.type <= 2 && (getFullPaymentStatus(obj.workDays, start_date, end_date, obj) || assignedContract.hr_week * 2 === parseFloat(obj.hrs_bi))) ?
            assignedContract.sal_monthly / 2 || 0
            :
            ((parseFloat(obj.adjust) + parseFloat(obj.week_pay))).toFixed(2) || 0;
      }
    });

    [...workContracts, ...unworkedContracts].map(obj => {
      obj.contract = { type: obj.type, flag: false }
      obj.workDays = checkPeriods(obj, start_date, end_date, 1);
      let currentDate = moment(start_date);
      const end = moment(end_date);

      while (currentDate.isSameOrBefore(end)) {
        const day = currentDate.date();
        const _day = currentDate.day();
        const year = currentDate.year();
        const month = currentDate.month();
        const dataIndex = `-day-${year}_${month + 1}_${day}`;
        const dataIndex2 = `services-day-${year}_${month + 1}_${day}`;
        const dataIndex_new = `new-day-${year}_${month + 1}_${day}`;
        let contractWeekHours = obj.hr_week;
        let dailyHours = obj.daily_hour || 0
        const splitedWeekHours = getSplitedWeekHours(contractWeekHours, dailyHours);
        if (_day && obj.workDays.join(",").includes(currentDate.format("MM-DD-YYYY"))) {
          obj[dataIndex] = splitedWeekHours[_day - 1]
          obj[dataIndex2] = splitedWeekHours[_day - 1]
          obj[dataIndex_new] = splitedWeekHours[_day - 1]
        }
        currentDate = currentDate.add(1, 'days');
      };
      obj.hrs_bi = getServiceHours(obj)
      obj.salary = (obj.type <= 2 && (dateValue(obj.start_date) <= dateValue(start_date) && dateValue(obj.end_date) >= dateValue(end_date))) ? (obj.sal_monthly / 2).toFixed(2) : (obj.sal_hr * obj.hrs_bi).toFixed(2)
      obj.employee = obj.parent_id
    })
    const filterdWorkContract = [...workContracts, ...unworkedContracts].filter(contract => Object(contract).hasOwnProperty('status') && contract.status === "active" &&
      (
        checkPeriods(contract, start_date, end_date, 0)
      ))
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
        replace[dataIndex_origin] = originValue

        replace[dataIndex1] = (changedCellValue(allHours, `${year}/${month + 1}/${day}`, replace) || originValue) - originValue
        replace[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, replace, originValue);
        replace[dataIndex_new] = originValue
        replace[dataIndex_origin] = originValue
        replace[dataIndex_comment] = changedCellHour(allHours, originValue, `${year}/${month + 1}/${day}`, replace, false)
        replace[`history${dataIndex}`] = getHistory(allHours, `${year}/${month + 1}/${day}`, replace)
        // replace[dataIndex_new] = changedCellHour(Hours, originValue, currentDate.format("MM/DD/YYYY"), replace, true)
        // replace[dataIndex2] = originValue
        // replace[dataIndex1] = parseInt(replace[dataIndex_new] - originValue)
        // replace[dataIndex_comment] = changedCellHour(Hours, originValue, currentDate.format("MM/DD/YYYY"), replace, false)
        // replace[`history${dataIndex}`] = getHistory(Hours, currentDate.format("MM/DD/YYYY"), replace)
        currentDate = currentDate.add(1, 'days');
      };


      replace.hrs_bi = getServiceHours(replace);
      replace.week_pay = mathCeil(replace.hrs_bi * replace.sal_hr)
      replace.adjustment = calcAdjustment(replace);
      replace.adjust = ((replace.adjustment / replace.hrs_bi) * replace.week_pay).toFixed(2)
      replace.salary = ((parseFloat(replace.adjust) + parseFloat(replace.week_pay))) || 0;
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
            } else {
              c_item.hr_week = parseFloat(c_item.hr_week) - parseFloat(a_item.hr_week);
              c_item.salary = ((parseFloat(c_item.hr_week) / (parseFloat(c_item.hr_week) + parseFloat(a_item.hr_week))) * c_item.sal_monthly / 2).toFixed(2)
            }
          }
        }
      })
    })
    const finalWorkConctract = filterdWorkContract.filter(contract => contract.isShow !== false)
    let calValue = 0;
    // [..._listItems].map(obj => {
    [..._listItems, ...filteredReplacements, ...finalWorkConctract].map(obj => {
      const { contract } = obj;
      if (contract.type === payType) {
        calValue += (parseFloat(obj.salary))
      }
    })
    return calValue;
  }
  const getPartialHours = (contract, childrens) => {
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

  const calcAdjustment = (record) => {
    var adjust = 0;
    for (var key in record) {
      if (key.includes('_day-')) {
        adjust += record[key];
      }
    }
    return adjust;
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

  const getHistory = (hours, date, record) => {
    const { _id } = record;
    const item = hours.find(obj => obj.position === _id && dateValue(date) === dateValue(obj.date))

    if (item) {
      return item
    } else {
      return false
    }
  }


  useEffect(() => {
    async function init() {
      const { result } = await request.list({ entity });
      const { result: allHours } = await request.list({ entity });
      setPayrollDetails(result);
      setAllHours(allHours)
    }
    getData();
    init();
  }, []);


  return (

    <DashboardLayout>
      <Layout>

        <Layout>
          <Form form={form} component={false}>
            <Table
              bordered
              // rowKey={new Date().valueOf()}
              dataSource={listItems || []}
              columns={columns}
              rowClassName="editable-row"
            />
          </Form>


        </Layout>
      </Layout>
    </DashboardLayout>
  );
};
export default PayrollManagement;