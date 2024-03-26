import { DownloadOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

import { Button, Col, Layout, Row, Table } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import moment from 'moment';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { request } from '@/request';

const ProjectDetails = () => {
  const entity = "payroll"
  const url = useParams().id;
  const [currentMonth, setCurrentMonth] = useState(parseInt(url.split("-")[1]));
  const [currentYear, setCurrentYear] = useState(parseInt(url.split("-")[0]));
  const [currentQ, setCurrentQ] = useState(parseInt(url.split("-")[2]));
  const [currentPeriod, setCurrentPeriod] = useState('1-15')
  const [changedDays, setChangedDays] = useState([]);
  const columns = [
    {
      title: 'Customer Name',
      dataIndex: ['customer', 'name'],
      width: 100,
    },
    {
      title: 'Billing ID',
      dataIndex: 'invoice_id',
      width: 100,
    },
    {
      title: 'Employee',
      dataIndex: 'employee',
      width: 100,
    },
    {
      title: 'Project ID',
      dataIndex: 'project_id',
      width: 100,
    },
    {
      title: 'Category',
      width: 100,
      render: () => {
        return "Project"
      }
    },
    {
      title: 'Payment',
      dataIndex: 'quincena',
      width: 100,
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
  const [listItems, setListItems] = useState([]);
  const formRef = useRef(null);
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
  const dateValue = (date) => {
    return new Date(date).valueOf();
  }
  useEffect(() => {
    async function init() {
      const startDay = parseInt(currentPeriod.split("-")[0]);
      const endDay = parseInt(currentPeriod.split("-")[1]);
      const start_date = new Date(currentYear, startDay === 31 ? (currentMonth - 2) : (currentMonth - 1), startDay);
      const end_date = new Date(currentYear, currentMonth - 1, endDay);
      let currentDate = moment(start_date);
      var date = new Date(start_date);
      date.setMonth(date.getMonth() + 12);
      const end = moment(end_date);
      const daysColumns = [];
      while (currentDate.isSameOrBefore(end)) {
        const monthLable = currentDate.format("MMMM");
        const day = currentDate.format("DD")
        const year = currentDate.year();
        const month = currentDate.format("MM");
        daysColumns.push({
          title: `${currentDate.format("dddd").slice(0, 1).toUpperCase()} ${day}`,
          dataIndex: `day_${year}-${month}-${day}`,
          width: 30
        })
        currentDate = currentDate.add(1, 'days');
      };
      setChangedDays(daysColumns);
      const { result: projects } = await request.list({ entity: "project" });
      const { result: employeeItems } = await request.list({ entity: "employee" });
      const projectListItems = projects.filter(({ periods, status }) =>
        status === 3 || status === 2
        // &&
        // (
        //   (
        //     dateValue(periods[0]) <= dateValue(start_date) &&
        //     dateValue(periods[1]) >= dateValue(end_date)
        //   )
        //   ||
        //   (
        //     dateValue(periods[0]) > dateValue(start_date) &&
        //     dateValue(periods[0]) < dateValue(end_date) &&
        //     dateValue(periods[1]) >= dateValue(end_date)
        //   )
        // )
      )
      const nestedItems = [];
      projectListItems.map(({ employees, ...obj }) => {
        const employeeLists = JSON.parse(employees);
        employeeLists.map(employee => {
          nestedItems.push({ ...employee, ...obj, employee: getEmployeeName(employee, employeeItems), quincena: getQuincena(employee, start_date, end_date) })
        })
        if (!employeeLists.length) {
          nestedItems.push({ ...obj })
        }
      })
      nestedItems.map((obj, index) => {
        obj['key'] = index
      })

      console.log(JSON.parse(JSON.stringify(nestedItems)), 'JSON.parse(JSON.stringify(nestedItems))')
      setListItems(JSON.parse(JSON.stringify(nestedItems)))
    }
    init()
  }, [
    currentPeriod
  ]);
  const getEmployeeName = ({ employee }, employees) => {
    const item = employees.find(obj => obj._id === employee);
    return item ? item.name : ''
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
  const exportToExcel = () => {
    const excelLists = [];
    listItems.map(obj => {
      const { customer, ref, enabled, key, periods, removed, status, type, __v, _id, billing, cost, employee, quincena, created, project_id, ...others } = obj;
      const { name: customer_name } = customer;
      excelLists.push({
        customer_name: customer_name,
        billing_id: "",
        employee: employee,
        project: project_id,
        category: "Project",
        payment: quincena,
        ...others
      });
    })
    const worksheet = XLSX.utils.json_to_sheet(excelLists);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${moment().format('YYYY-MM-DD')}(${currentPeriod}).xlsx`);
  }
  return (

    <Layout
      style={{ padding: '100px' }}
    >
      <Row>
        <Col span={24}>
          <h3 style={{ textAlign: 'center' }}>
            <LeftOutlined onClick={prevData} />
            QUINCENA: {currentPeriod.split("-")[0]} DE {parseInt(currentPeriod.split("-")[0]) !== 31 ? new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' }) : new Date(currentYear, currentMonth - 2).toLocaleString('default', { month: 'long' })} AL {currentPeriod.split("-")[1]} DE {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' })} {currentYear}
            <RightOutlined onClick={nextData} />
          </h3>
        </Col>
        <Button type="primary" icon={<DownloadOutlined />} onClick={exportToExcel} >Export to excel</Button>
      </Row>
      <Table
        bordered
        dataSource={listItems || []}
        columns={[...columns, ...changedDays]}
        rowClassName="editable-row"
        scroll={{
          x: 3300
        }}
      />
    </Layout>
  );
};
export default ProjectDetails;