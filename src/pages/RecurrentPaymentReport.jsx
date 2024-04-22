import { DashboardLayout, DefaultLayout } from '@/layout';
import { DeleteOutlined, EditOutlined, EyeOutlined, LeftOutlined, PlusOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, InputNumber, Layout, Modal, Popconfirm, Row, Space, Table, Tag, Typography } from 'antd';
import Search from 'antd/lib/transfer/search';
import React, { useEffect, useRef, useState } from 'react';
import CustomModal from 'modules/CustomModal'
import { useDispatch, useSelector } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { selectListItems } from '@/redux/crud/selectors';
import moment from 'moment';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { request } from '@/request';
import { selectCurrentAdmin } from '@/redux/auth/selectors';
import { useEffectOnce } from 'react-use';
const contractTypes = [
  "", "Payroll", "Services", "Viaticum", "Hourly"
]
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
const RecurrentPaymentReport = () => {
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
      title: "Payroll Contro",
      children: [
        {
          title: "Order",
          dataIndex: "key"
        },
        {
          title: "Period",
          dataIndex: "period",
          render: () => {
            return moment(new Date(currentYear, currentMonth - 1, 1)).format("MMMM YYYY")
          }
        },
        {
          title: "Quincena",
          dataIndex: "quincena",
          render: () => {
            const current = moment(new Date(currentYear, currentMonth - 1, 1));
            const Q = Math.round(currentQ + 1);
            return `${current.format("MMMM")} Q${Q} ${current.format("YYYY")}`
          }
        },

        {
          title: 'ID',
          dataIndex: ['employee', 'personal_id'],
          width: '100',
          align: "center"
        },
        {
          title: 'Employee ',
          dataIndex: ['employee', 'name'],
          width: '100',
          align: "center",
        },
        {
          title: 'Ruta',
          dataIndex: ['bank', 'ruta'],
          width: '100',
          align: "center",
        },
        {
          title: 'CTA de Banco',
          dataIndex: ['bank', 'name'],
          width: '100',
          align: "center",
        },
        {
          title: 'Tipo de cuenta',
          dataIndex: ['bank', 'account_type'],
          width: '100',
          align: "center",
        },
        {
          title: 'Categoría',
          width: '100',
          dataIndex: 'category'
        },
        {
          title: 'Type',
          width: '100',
          dataIndex: ['contract', 'type'],
          render: (type) => {
            return type ? contractTypes[type] : ''
          }
        },
        {
          title: "Gross Salary",
          dataIndex: "gross_salary"
        },
        {
          title: "Deductions",
          dataIndex: "deductions",
        },
        {
          title: "Net salary",
          dataIndex: "net_salary",
        },
        {
          title: "Transfer",
          dataIndex: "Transfer",
          render: (_, record) => {
            const { net_salary, deductions } = record;

            return (net_salary - deductions).toFixed(2)
          }
        }
      ]
    }
    ,
    {
      title: "Retentions",
      children: [
        {
          title: "S.S.",
          render: (_, record) => {
            const { gross_salary, contract } = record;
            return contract.type === 1 ? (gross_salary * 0.0975).toFixed(2) : 0;
          }
        },
        {
          title: "S.E.",
          render: (_, record) => {
            const { gross_salary, contract } = record;
            return contract.type === 1 ? (gross_salary * 0.0125).toFixed(2) : 0;
          }
        },
        {
          title: "DTM",
          render: (_) => {
            return '-'
          }
        }, {
          title: "Total RET",
          render: (_, record) => {
            const { gross_salary, contract } = record;
            return contract.type === 1 ? (gross_salary * (0.0975 + 0.0125)).toFixed(2) : 0
          }
        }
      ]
    },

    {
      title: "Cuota Patronal",
      children: [
        {
          title: "S.S.",
          render: (_, record) => {
            const { gross_salary, contract } = record;
            return contract.type === 1 ? (gross_salary * 0.1225).toFixed(2) : 0;
          }
        },
        {
          title: "S.E.",
          render: (_, record) => {
            const { gross_salary, contract } = record;
            return contract.type === 1 ? (gross_salary * 0.015).toFixed(2) : 0;
          }
        },
        {
          title: "R.P.",
          render: (_, record) => {
            const { gross_salary, contract } = record;
            return contract.type === 1 ? (gross_salary * 0.021).toFixed(2) : 0;
          }
        },
        {
          title: "DTM",
          render: (_) => {
            return '-'
          }
        },
        {
          title: "Total Cuota",
          render: (_, record) => {
            const { gross_salary, contract } = record;
            return contract.type === 1 ? (gross_salary * (0.1225 + 0.015 + 0.021)).toFixed(2) : 0
          }
        }
      ]
    },
    {
      title: 'SIPE',
      children: [
        {
          title: "R.P.",
          render: (_, record) => {
            const { gross_salary, contract } = record;
            return contract.type === 1 ? (gross_salary * 0.021).toFixed(2) : 0;
          }
        },
        {
          title: "DTM",
          render: (_) => {
            return '-'
          }
        },
        {
          title: "S.E.",
          render: (_, record) => {
            const { gross_salary, contract } = record;
            return contract.type === 1 ? (gross_salary * (0.015 + 0.0125)).toFixed(2) : 0;
          }
        },
        {
          title: "S.S.",
          render: (_, record) => {
            const { gross_salary, contract } = record;
            return contract.type === 1 ? (gross_salary * (0.1225 + 0.0975)).toFixed(2) : 0;
          }
        },
        {
          title: "Total SIPE",
          render: (_, record) => {
            const { gross_salary, contract } = record;
            return contract.type === 1 ? (gross_salary * (0.021 + 0.015 + 0.0125 + 0.1225 + 0.0975)).toFixed(2) : 0;
          }
        },

      ]
    },
    {
      title: "Acumulado",
      children: [
        {
          title: "Vac. A.",
          dataIndex: "vac_bonus",
        }, {
          title: "DTM A.",
          dataIndex: "dtm_bonus",

        }
      ]
    }
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
  }, [currentMonth, currentQ, currentYear]);


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
  const checkPeriodsOfProject = (periods, start, end) => {
    const project_start = periods[0];
    const project_end = periods[1];
    let startDate = moment(new Date(project_start), 'MM-DD-YYYY');
    const endDate = moment(new Date(project_end), 'MM-DD-YYYY');

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
    return flag
  }
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
  const changedCellValue = (hours, date, record) => {
    const { _id } = record;
    const item = hours.find(obj => obj.position === _id && obj.date === date);
    if (item) {
      return item.hour
    } else {
      return false;
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

      // if (contract.type === 3) {

      //   console.log(targetDay, 'target', startWorkDay, 'contract.type', contract.type, targetDay.isBetween(startWorkDay, endWorkDay, null, '[]'));
      // }
      if (targetDay.isBetween(startWorkDay, endWorkDay, null, '[]')) {
        return origin_value;
      } else {
        return 0;
      }
    }

  }

  const getEmployee = ({ employee }, employees) => {
    const item = employees.find(obj => obj._id === employee);
    return item
  }
  const getQuincena = (record, start_date, end_date) => {
    let currentDate = moment(start_date);
    const end = moment(end_date);
    var hours = 0;
    while (currentDate.isSameOrBefore(end)) {
      const day = currentDate.format("DD")
      const year = currentDate.year();
      const month = currentDate.format("MM");
      hours += parseFloat(record[`day_${year}-${month}-${day}`]) || 0;
      currentDate = currentDate.add(1, 'days');
    }
    return hours || 0;
  }
  const dateValue = (date) => {
    return new Date(date).valueOf();
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

      const { result: workContracts } = await request.list({ entity: "workContract" })
      const { result: assignedEmployees } = await request.list({ entity: "assignedEmployee" });
      const { result: bankDetails } = await request.list({ entity: "bankAccount" });
      const { result: vacBonus } = await request.list({ entity: 'vacHistory' });
      const { result: dtmBonus } = await request.list({ entity: 'dtmHistory' });
      const { result: projectData } = await request.list({ entity: 'project' });
      const { result: employeeItems } = await request.list({ entity: "employee" });
      const { result: replacementData } = await request.list({ entity: "replacement" });
      const filteredReplacements = replacementData.filter(data => dateValue(data.start_date) === dateValue(start_date) && dateValue(data.end_date) === dateValue(end_date))

      projectData.map(project =>
        project.employees = JSON.parse(project.employees)
      )
      const filteredProjects = projectData.filter(({ status, periods }) => (
        (status === 3 || status === 2) && checkPeriodsOfProject(periods, start_date, end_date)
      ))
      const nestedItems = [];
      filteredProjects.map(({ employees, ...obj }) => {
        employees.map(employee => {
          nestedItems.push({ ...employee, ...obj, employee: getEmployee(employee, employeeItems), gross_salary: getQuincena(employee, start_date, end_date) })
        })
      })
      const groupedProject = JSON.parse(JSON.stringify(nestedItems)).reduce((acc, item) => {
        const existingItem = acc.find(i => i.employee._id === item.employee._id);
        if (!existingItem) {
          acc.push(item);
        }
        return acc;
      }, []);

      groupedProject.map(project => {
        nestedItems.map(item => {
          if (project._id !== item._id && project.employee._id === item.employee._id) {
            project.gross_salary += item.gross_salary
          }
        });
        project['category'] = 'Project';
        project['contract'] = {}
        bankDetails.map(bank => {
          if (project.employee._id === bank.parent_id) {
            project.bank = bank;
          }
        })
      })

      vacBonus.map(data => {
        data['paidPeriods'] = JSON.parse(data['paidPeriods'])
      })
      dtmBonus.map(data => {
        data['paidPeriods'] = JSON.parse(data['paidPeriods'])
      })
      workContracts.map(obj => {
        obj.hrs_bi = obj.type === 1 ? mathCeil(obj.hr_week * 4.333 / 2) : 0;
        obj.week_pay = obj.type === 1 ? mathCeil(obj.hr_week * 4.333 / 2) : 0;
      })
      const viaticumArr = [];
      assignedEmployees.map(position => {
        const { viaticum, contract, ...otherObj } = position;
        if (viaticum && contract) {
          otherObj.contract = viaticum
          viaticumArr.push(otherObj);
          assignedEmployees.push({ ...otherObj, viaticum_flag: true });
        } else if (viaticum && !contract) {
          position.contract = { ...viaticum, viaticum_flag: true };
        }
      });
      assignedEmployees.map(position => {
        if (position.viaticum_flag) {
          if (position.viaticum_start_date) {
            position.contract.start_date = moment(new Date(position.viaticum_start_date)).format("MM/DD/YYYY");
          }
          if (position.viaticum_end_date) {
            position.contract.end_date = moment(new Date(position.viaticum_end_date)).format("MM/DD/YYYY");
          }
        } else {
          if (position.start_date) {
            position.contract.start_date = moment(new Date(position.start_date)).format("MM/DD/YYYY");
          }
          if (position.end_date) {
            position.contract.end_date = moment(new Date(position.end_date)).format("MM/DD/YYYY");
          }
        }
      })


      const mergedPositions = JSON.parse(JSON.stringify(assignedEmployees)).filter(data => data !== undefined);




      const _listItems = mergedPositions.filter(({ contract }) =>
        Object(contract).hasOwnProperty('status') && contract.status === "active" &&
        (
          checkPeriods(contract, start_date, end_date, 0)
        )
      );



      const groupedContracts = _listItems
        .reduce((acc, item) => {
          const existingItem = acc.find(i => i.contract && i.contract._id === item.contract._id);
          if (!existingItem) {
            acc.push(item);
          }
          return acc;
        }, []);

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

          switch (_day) {
            case 0:
              obj[dataIndex] = changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.sunday_hr;
              obj[dataIndex1] = (changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.sunday_hr) - obj.sunday_hr
              obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.sunday_hr);

              break;

            case 1:
              obj[dataIndex] = changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.monday_hr;
              obj[dataIndex1] = (changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.monday_hr) - obj.monday_hr
              obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.monday_hr);

              break;

            case 2:
              obj[dataIndex] = changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.tuesday_hr;
              obj[dataIndex1] = (changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.tuesday_hr) - obj.tuesday_hr;
              obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.tuesday_hr);
              break;

            case 3:
              obj[dataIndex] = changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.wednesday_hr;
              obj[dataIndex1] = (changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.wednesday_hr) - obj.wednesday_hr
              obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.wednesday_hr);
              break;

            case 4:
              obj[dataIndex] = changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.thursday_hr;
              obj[dataIndex1] = (changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.thursday_hr) - obj.thursday_hr
              obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.thursday_hr);

              break;
            case 5:
              obj[dataIndex] = changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.friday_hr;
              obj[dataIndex1] = (changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.friday_hr) - obj.friday_hr
              obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.friday_hr);


              break;
            case 6:
              obj[dataIndex] = changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.saturday_hr;
              obj[dataIndex1] = (changedCellValue(allHours, `${year}/${month + 1}/${day}`, obj) || obj.saturday_hr) - obj.saturday_hr
              obj[dataIndex2] = getCellValue(allHours, `${year}/${month + 1}/${day}`, obj, obj.saturday_hr);

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

            : mathCeil(obj.hrs_bi * obj.sal_hr);
        obj.adjustment = calcAdjustment(obj);
        obj.adjust =
          assignedContract.type === 3 ?
            ((obj.adjustment / obj.hrs_bi) * obj.week_pay).toFixed(2)
            : (calcAdjustment(obj) * obj.sal_hr || 0).toFixed(2);

        obj.salary = parseFloat(obj.adjust) + parseFloat(obj.week_pay);
        obj.deductions = (obj.gross_salary - obj.salary).toFixed(2);
        obj.gross_salary = (obj.salary || 0).toFixed(2);
        obj.net_salary = assignedContract.type === 1 ? (obj.gross_salary * 0.89).toFixed(2) : obj.gross_salary;
        obj.vac_bonus = assignedContract.type === (1) || assignedContract.type === (2) ? ((obj.salary / 11).toFixed(2)) : 0;
        obj.dtm_bonus = assignedContract.type === (1) || assignedContract.type === (2) ? (obj.salary / 12).toFixed(2) : 0;

        vacBonus.map(bonus => {
          const { contract_id, paidPeriods } = bonus;
          if (contract_id === assignedContract._id) {
            paidPeriods.map(paidPaid => {
              if (paidPaid.periods === `${moment(start_date).format('MM/DD/YYYY')}- ${moment(end_date).format('MM/DD/YYYY')}`) {
                obj.vac_bonus = (parseFloat(obj.vac_bonus) - paidPaid.payment).toFixed(2)
              }
            })
          }
        })
        dtmBonus.map(bonus => {
          const { contract_id, paidPeriods } = bonus;
          if (contract_id === assignedContract._id) {
            paidPeriods.map(paidPaid => {
              if (paidPaid.periods === `${moment(start_date).format('MM/DD/YYYY')}- ${moment(end_date).format('MM/DD/YYYY')}`) {
                obj.dtm_bonus = (parseFloat(obj.dtm_bonus) - paidPaid.payment).toFixed(2)
              }
            })
          }
        })
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
          const dataIndex2 = `services-day-${year}_${month + 1}_${day}`;
          const dataIndex1 = `_day-${year}_${month + 1}_${day}`;
          const originValue = replace.hours[dataIndex] || 0;
          replace[dataIndex_origin] = originValue
          replace[dataIndex_new] = changedCellHour(allHours, originValue, currentDate.format("MM/DD/YYYY"), replace, true)
          replace[dataIndex2] = originValue
          replace[dataIndex1] = parseInt(replace[dataIndex_new] - originValue)
          currentDate = currentDate.add(1, 'days');
        };
        replace.hrs_bi = getServiceHours(replace);
        replace.week_pay = mathCeil(replace.hrs_bi * replace.sal_hr)
        replace.adjustment = calcAdjustment(replace);
        replace.adjust = ((replace.adjustment / replace.hrs_bi) * replace.week_pay).toFixed(2)
        replace.salary = ((parseFloat(replace.adjust) + parseFloat(replace.week_pay))) || 0;
      })

      console.log(JSON.parse(JSON.stringify(filteredReplacements)), 'filteredReplacements');
      const allDatas = [..._listItems];
      allDatas.map((data, index) => {
        const { employee } = data;
        data['key'] = index + 1;
        data['category'] = 'Contract'
        if (!data.position) data.position = ''
        bankDetails.map(bank => {
          if (employee._id === bank.parent_id) {
            data.bank = bank;
          }
        })
      });

      console.log(allDatas, 'allDatas');
      const restedLists = JSON.parse(JSON.stringify(_listItems));
      const restedAGroupedLists = JSON.parse(JSON.stringify(groupedContracts));
      restedAGroupedLists.map((list, index) => {
        const { contract: contract1, employee } = list;
        restedLists.map(item => {
          const { contract: contract2 } = item;
          if (list._id !== item._id && contract1._id === contract2._id) {
            list.gross_salary = parseFloat(list.gross_salary) + parseFloat(item.gross_salary);
            list.net_salary = parseFloat(list.net_salary) + parseFloat(item.net_salary);
            list.deductions = (parseFloat(list.deductions) + parseFloat(item.deductions)).toFixed(2);
          }
        });
        list['category'] = 'Contract';
        bankDetails.map(bank => {
          if (employee._id === bank.parent_id) {
            list.bank = bank;
          }
        })

      })
      const allData = [...restedAGroupedLists, ...groupedProject];
      allData.map((data, index) => data['key'] = index)
      setListItems(allData);

      console.log(restedAGroupedLists, allDatas);


    }
    init()
  }, [
    currentPeriod, saveStatus, currentMonth, currentYear
  ]);

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

  const getServiceHours = (record) => {
    var hours = 0;
    for (var key in record) {
      if (key.includes('services-day-')) {
        hours += parseFloat(record[key]);
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

      <Table

        // scroll={{ x: (changedDays.length + columns.length) * 100, y: 1300 }}
        bordered
        dataSource={listItems || []}
        columns={[...columns]}
        rowClassName="editable-row"
        scroll={{
          x: 3500,
        }}
      />


    </Layout>
    // <DashboardLayout>
    //   <Layout>

    //   </Layout>
    // </DashboardLayout>
  );
};
export default RecurrentPaymentReport;