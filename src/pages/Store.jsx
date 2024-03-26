import { DashboardLayout, DefaultLayout } from '@/layout';
import { AliwangwangOutlined, DeleteOutlined, EditOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Form, Input, InputNumber, Layout, Modal, Popconfirm, Radio, Row, Select, Space, Table, Tag, Typography } from 'antd';
import Search from 'antd/lib/transfer/search';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { crud } from '@/redux/crud/actions';
import { selectListItems } from '@/redux/crud/selectors';
import { Link } from 'react-router-dom/cjs/react-router-dom';
import { request } from '@/request';
import moment from 'moment';
import SelectAsync from '@/components/SelectAsync';
import { useContext } from 'react';
const EditableContext = React.createContext(null);

const statusLabel = ["", "Active", "Canceled", "Finished"]
const statusArr = [
  { value: 0, label: "All Customers" },
  { value: 1, label: "Recurrent Customer" },
];


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
const getTotalWeekHours = (days) => {
  let totalHours = 0;

  for (const day of days) {
    const startTime = day[0];
    const endTime = day[1];

    const startHour = parseInt(startTime);
    const endHour = parseInt(endTime);

    const hours = endHour - startHour;
    totalHours += hours;
  }
  return totalHours;

}
const employeeColumns = [
  {
    title: "Name",
    dataIndex: "name"
  },
  {
    title: "Hours",
    dataIndex: "hours"
  },
  {
    title: "Salary",
    dataIndex: "salary"
  },
  {
    title: "Contract",
    dataIndex: "contract"

  },
  {
    title: "Hrs/sem",
    dataIndex: "hr_week"
  },
]
const Store = () => {
  const entity = "customerStores"
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterData, setFilterData] = useState([]);
  const [currentProducts, setCurrentProducts] = useState();
  const [isUpdate, setIsUpdate] = useState(false);
  const [rangeDate, setRangeDate] = useState();
  const [isModal, setIsModal] = useState(false);
  const [employeeDatas, setEmployeeDatas] = useState([]);
  const [assignedEmployeeLists, setAssignedEmployeeLists] = useState();
  const [globalData, setGlobalData] = useState([]);

  useEffect(() => {

    if (currentProducts) setIsProducts(true)
  }, [
    currentProducts
  ])
  const showModal = () => {

    setCurrentId(new Date().valueOf())
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
  const generateCustomerId = () => {
    return new Date().valueOf();
  }

  const [employeeList, setEmployeeList] = useState([]);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const [currentId, setCurrentId] = useState('');
  const [currentItem, setCurrentItem] = useState({});
  const [references, setReferences] = useState([]);
  const [initEmployeeColumns, setInitEmployeeColumns] = useState([]);
  const [paginations, setPaginations] = useState([])
  const [endDate, setEndDate] = useState();
  const [status, setStatus] = useState();
  const [summatoryCost, setSummatoryCost] = useState();
  const isEditing = (record) => record._id === editingKey;
  const [customerContacts, setCustomerContacts] = useState();
  const columns = [
    {
      title: 'Store',
      dataIndex: 'store',
      // width: 100,
    },
    // {
    //   title: 'Customer',
    //   dataIndex: ['parent_id', 'name'],
    //   width: '15%',
    // },
    {
      title: 'Contact name',
      dataIndex: 'contact_name',
      // width: 60,
    },
    // {
    //   title: 'Routes',
    //   dataIndex: ['routes', 'routes'],
    //   width: '15%',
    // },
    {
      title: 'Email',
      dataIndex: ['parent_id', 'email'],
      // width: 50,
    },
    {
      title: 'Phone',
      dataIndex: ['parent_id', 'phone'],
      // width: 100,
    },
    {
      title: "Store Hours",
      // width: 300,
      render: (text, record) => {
        return <>
          {
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
      }
    },
    {
      title: 'Products',
      dataIndex: 'products',
      // width: 100,
      render: (text, record) => {
        const { products } = record
        return text && <EyeOutlined onClick={() => setCurrentProducts(products)} style={{ fontSize: "20px" }} />
      }
    },
    {
      title: 'Employees',
      dataIndex: 'employees',
      // width: 100,
      render: (_, record) => {
        const { employees_ } = record
        return <label onClick={() => showEmployees(employees_)}>{_}</label>
      }
    },
    {
      title: 'Waze',
      dataIndex: 'waze_location',
      // width: 100,
      render: (_) => {
        return <a target="_blank" rel='noreferrer' href={`https://waze.com/ul?ll=${_}&navigate=yes"`}>
          <AliwangwangOutlined style={{ fontSize: "20px" }} />
        </a>
      }
    },

  ];

  const showEmployees = (data) => {
    setIsModal(true)
    const lists = []
    data.map((item, index) => {
      const { contract, store, employee, hr_week } = item;
      const obj = {
        key: index,
        name: employee ? employee.name : '',
        hours: getFormattedHours(
          [
            store.monday ? [store.monday[0], store.monday[1]] : "",
            store.tuesday ? [store.tuesday[0], store.tuesday[1]] : "",
            store.wednesday ? [store.wednesday[0], store.wednesday[1]] : "",
            store.thursday ? [store.thursday[0], store.thursday[1]] : "",
            store.friday ? [store.friday[0], store.friday[1]] : "",
            store.saturday ? [store.saturday[0], store.saturday[1]] : "",
            store.sunday ? [store.sunday[0], store.sunday[1]] : "",
          ]
        ),
        salary: contract ? contract.sal_monthly : 0,
        contract: contract ? `${contract.start_date}-${contract.end_date}` : '',
      }
      if (assignedEmployeeLists) {
        assignedEmployeeLists.map(position => {
          const { contract: p_contract, employee: p_employee, store: p_store } = position;
          if (contract && employee && store && p_contract && p_employee && p_store && contract._id === p_contract._id && employee._id === p_employee._id && store._id === p_store._id) {
            obj.hr_week = position.hr_week || 0;
          }
        })
      }
      lists.push(obj);
    })
    setEmployeeDatas(lists)

    console.log(data);
  }

  const { result: listResult } = useSelector(selectListItems);
  const { pagination, items } = listResult;
  const formRef = useRef(null);

  useEffect(() => {
    dispatch(crud.resetState());
    dispatch(crud.list({ entity }));
    (async () => {
      const { result } = await request.list({ entity: "customerContacts" })
      setCustomerContacts(result);
    })()
  }, []);
  useEffect(() => {

    async function init() {
      const { result: assignedEmployees } = await request.list({ entity: "assignedEmployee" });
      const { result: recurrentCustomers } = await request.list({ entity: "recurrentInvoice" });
      setAssignedEmployeeLists(assignedEmployees)
      items.map(item => {
        const { _id: store_id, parent_id: customer } = item
        item['employees_'] = [];
        item['status'] = 0;
        recurrentCustomers.map(recurrent => {
          const { parent_id } = recurrent;
          if (customer && parent_id._id === customer._id) {
            item['status'] = 1;
          }
        });
        if (assignedEmployees) {

          assignedEmployees.map(obj => {
            const { store } = obj;
            const { _id: store_id1 } = store;
            if (store_id === store_id1) {
              item['employees_'].push(obj)
            }
          })
        }
        item['employees'] = item['employees_'].length;
        if (customerContacts) {

          customerContacts.map(contact => {
            if (customer._id === contact.parent_id && contact.primary) {
              item['contact_name'] = contact.name;
            }
          })
        }
      })
      console.log(items, customerContacts, 'items1111');
      setFilterData(items);
      setGlobalData(items);
      setPaginations(pagination)
    }
    init();
  }, [items, pagination, customerContacts])

  useEffect(() => {
    const filteredData = globalData.filter((record) => {
      const { parent_id: customer, store, } = record;
      let routesStirng = ''
      const { name, email } = customer || {}
      // if (!routes) {
      //   routesStirng = '';
      // } else {
      //   routesStirng = routes.routes
      // }
      console.log(store, name, email, routesStirng)
      return (
        (!searchText || store.toString().toLowerCase().includes(searchText.toLowerCase()) ||
          name.toString().toLowerCase().includes(searchText.toLowerCase()) ||
          email.toString().toLowerCase().includes(searchText.toLowerCase())
        ) &&
        (!status || record.status === status)
      );
    })
    setFilterData(filteredData);
    setPaginations({ current: 1, pageSize: 10, total: filteredData.length })
  }, [searchText, status])

  const handelDataTableLoad = useCallback((pagination) => {
    const { current, total } = pagination;
    setPaginations(pagination)
    return true;
  }, [filterData, searchText]);
  const Footer = () => {
    const pages = paginations
    const { current, count, total, page } = pages
    const currentPage = current || page;
    const totalSize = total || count;

    return (
      <>
        Mostrando registros del {filterData.length ? ((currentPage - 1) * 10 + 1) : 0} al {currentPage * 10 > (totalSize) ? (totalSize) : currentPage * 10} de un total de {totalSize} registros
      </>
    );
  }
  const [isProducts, setIsProducts] = useState(false);
  const handleProducts = () => {
    setIsProducts(false)
  }
  const cancelModal = () => {
    setIsModal(false)
  }
  return (

    <DashboardLayout>
      <Layout style={{ minHeight: '100vh' }}>

        <Modal title="Products" visible={isProducts} onCancel={handleProducts} footer={null}>
          <h3>{currentProducts}</h3>
        </Modal>

        <Modal title="Employees" visible={isModal} onCancel={cancelModal} footer={null} width={1000}>
          <Table
            columns={employeeColumns}
            dataSource={employeeDatas || []}
          />
        </Modal>
        <Layout>
          <Row gutter={24} style={{ textAlign: 'right' }}>
            <Col span={6}>
              <Input
                placeholder='Search'
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col span={18}>
              <Select
                placeholder="Status Filter"
                optionFilterProp="children"
                onChange={(e) => { setStatus(e) }}
                options={statusArr} />
            </Col>
          </Row>

          <Form form={form} component={false}>
            <Table

              bordered
              rowKey={(item) => item._id}
              key={(item) => item._id}
              dataSource={filterData}
              columns={columns}
              rowClassName="editable-row"
              pagination={paginations}
              onChange={handelDataTableLoad}
              footer={Footer}
            // scroll={{
            //   x: 1300
            // }}

            />
          </Form>


        </Layout>
      </Layout>
    </DashboardLayout>
  );
};
export default Store;