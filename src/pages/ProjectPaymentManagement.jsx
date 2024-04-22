import { DashboardLayout } from '@/layout';
import { Form, Layout, Table, Typography } from 'antd';

import React, { useEffect, useState } from 'react';
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
          <Link to={`/project_details/${row.year}-${row.month + 1}-${row.q}`}>{text}</Link>
        </Typography.Text>
      )
    }
  },
  {
    title: 'Total',
    dataIndex: 'total',
    width: '15%',

  },
];

const ProjectPaymentManagement = () => {
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
  const getData = async () => {
    const start_date = '2023/06/01';
    const end_date = new Date();
    let currentDate = moment(new Date(start_date));

    const end = moment(end_date)
    const periods = []

    const { result: projects } = await request.list({ entity: "project" });
    while (currentDate.isSameOrBefore(end)) {

      if (currentDate.month() === end.month() && end.date() < 15) {
        periods.push({
          id: new Date().valueOf(),
          month: currentDate.month(),
          q: 0,
          period_label: `${currentDate.format('MMMM')}-1(${currentDate.year()})`,
          year: currentDate.year(),
          total: getPaymentData(JSON.parse(JSON.stringify(projects)), currentDate.year(), currentDate.month(), getPeriods(currentDate.month() + 1, currentDate.year(), 0), 1),
        })
      }
      else {
        periods.push({
          id: new Date().valueOf(),
          month: currentDate.month(),
          q: 0,
          period_label: `${currentDate.format('MMMM')}-1(${currentDate.year()})`,
          year: currentDate.year(),
          total: getPaymentData(JSON.parse(JSON.stringify(projects)), currentDate.year(), currentDate.month(), getPeriods(currentDate.month() + 1, currentDate.year(), 0), 1)
        },
          {
            id: new Date().valueOf() + 1,
            month: currentDate.month(),
            q: 1,
            period_label: `${currentDate.format('MMMM')}-2(${currentDate.year()})`,
            year: currentDate.year(),
            total: getPaymentData(JSON.parse(JSON.stringify(projects)), currentDate.year(), currentDate.month(), getPeriods(currentDate.month() + 1, currentDate.year(), 1), 1)
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

  const getPaymentData = (projects, year, month, periods, payType = 1) => {
    month++;
    const startDay = parseInt(periods.split("-")[0]);
    const endDay = parseInt(periods.split("-")[1]);
    const start_date = new Date(year, startDay === 31 ? (month - 2) : (month - 1), startDay);
    const end_date = new Date(year, month - 1, endDay);
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

    console.log(projects, projectListItems, month, periods, ' month, periods');
    const nestedItems = [];
    projectListItems.map(({ employees, ...obj }) => {
      const employeeLists = JSON.parse(employees);
      employeeLists.map(employee => {
        nestedItems.push({ ...employee, ...obj, quincena: getQuincena(employee, start_date, end_date) })
      })
      if (!employeeLists.length) {
        nestedItems.push({ ...obj, key: new Date().valueOf() })
      }
    });
    let calValue = 0;
    nestedItems.map(({ quincena }) => {
      calValue += parseFloat(quincena) || 0
    })
    return calValue;
  }
  const getQuincena = (record, start_date, end_date) => {
    let currentDate = moment(start_date);
    const end = moment(end_date);
    var hours = 0;
    while (currentDate.isSameOrBefore(end)) {
      const day = currentDate.format("DD")
      const year = currentDate.year();
      const month = currentDate.format("MM");
      hours += parseFloat(record[`day_${year}-${month}-${day}`] || 0);
      currentDate = currentDate.add(1, 'days');
    }
    return hours;
  }


  useEffect(() => {
    async function init() {
      const { result } = await request.list({ entity });
      const { result: allHours } = await request.list({ entity });

      console.log(result, allHours, 'testing..........')
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
export default ProjectPaymentManagement;