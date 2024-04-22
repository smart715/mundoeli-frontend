import { DashboardLayout, DefaultLayout } from '@/layout';
import { DeleteOutlined, EditOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, InputNumber, Layout, Modal, Popconfirm, Row, Space, Table, Tag, Typography } from 'antd';
import Search from 'antd/lib/transfer/search';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import CustomModal from 'modules/CustomModal'
import { useDispatch, useSelector } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { selectListItems } from '@/redux/crud/selectors';
import { Link } from 'react-router-dom/cjs/react-router-dom';
import { request } from '@/request';
import SelectAsync from '@/components/SelectAsync';
const { role } = window.localStorage.auth ? JSON.parse(window.localStorage.auth) : {};

const customerColumns = [
  {
    title: "Customer Name",
    dataIndex: "name"
  },
  {
    title: "Hours",
    dataIndex: "hours"
  },
  {
    title: "Location",
    dataIndex: "location"
  },
  {
    title: "Insumos",
    dataIndex: "insumos"

  },
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
const Employees = () => {
  const entity = "employee"
  const searchFields = 'name,personal_id';
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModal, setIsModal] = useState(false);
  const [customerData, setCustomerData] = useState([]);

  const [searchText, setSearchText] = useState('');
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

  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const [currentId, setCurrentId] = useState('');
  const [currentItem, setCurrentItem] = useState({});
  const [filterData, setFilterData] = useState([]);
  const isEditing = (record) => record._id === editingKey;
  const editItem = (item) => {
    if (item) {
      setTimeout(() => {
        if (formRef.current) formRef.current.setFieldsValue(item);
      }, 400);
      setCurrentId(item._id);
      setCurrentItem(item);
      setIsModalVisible(true);
      setIsUpdate(true);
    }
  }
  const deleteItem = (item) => {
    const id = item._id;
    dispatch(crud.delete({ entity, id }))
    setTimeout(() => {
      dispatch(crud.list({ entity }));
    }, 400)
  }
  const showCustomers = (data) => {
    setIsModal(true)
    const lists = []
    data.map((item, index) => {
      const { store, parent_id: customer, monday, tuesday, wednesday, thursday, friday, saturday, sunday } = item;
      const obj = {
        key: index,
        name: customer.name,
        hours: getFormattedHours(
          [
            monday ? [monday[0], monday[1]] : "",
            tuesday ? [tuesday[0], tuesday[1]] : "",
            wednesday ? [wednesday[0], wednesday[1]] : "",
            thursday ? [thursday[0], thursday[1]] : "",
            friday ? [friday[0], friday[1]] : "",
            saturday ? [saturday[0], saturday[1]] : "",
            sunday ? [sunday[0], sunday[1]] : "",
          ]
        ),
        location: store.location,
        insumos: store.insumos ? "yes" : "no"
      }
      lists.push(obj);
    })
    setCustomerData(lists)

    console.log(data);
  }

  const columns = [
    {
      title: 'Personal Id',
      dataIndex: 'personal_id',
      width: '15%',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      width: '15%',
    },
    {
      title: 'Customers',
      dataIndex: 'customers',
      width: '15%',
      render: (_, record) => {
        const { customers_ } = record
        return <label onClick={() => showCustomers(customers_)}>{_}</label>
      }
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      width: '15%',
    },
    {
      title: 'Actions',
      dataIndex: 'operation',
      width: "10%",
      align: 'center',
      render: (_, record) => {
        return (


          role !== 0 ?

            <>
              <Typography.Text>
                <Link to={`/employee/details/${record._id}`}>
                  <EyeOutlined style={{ fontSize: "20px" }} />
                </Link>
              </Typography.Text>

            </>
            : <>
              <Typography.Link onClick={() => editItem(record)}>
                <EditOutlined style={{ fontSize: "20px" }} />
              </Typography.Link>

              {/* <Popconfirm title="Sure to delete?" onConfirm={() => deleteItem(record)}>
                <DeleteOutlined style={{ fontSize: "20px" }} />
              </Popconfirm> */}
              <Typography.Text>
                <Link to={`/employee/details/${record._id}`}>
                  <EyeOutlined style={{ fontSize: "20px" }} />
                </Link>
              </Typography.Text>

            </>
        )

      },
    },

  ];
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === 'age' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });
  const { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems);

  const { pagination, items } = listResult;
  const [paginations, setPaginations] = useState(pagination)
  useEffect(() => {
    async function init() {
      const { result: assignedEmployees } = await request.list({ entity: "assignedEmployee" });
      items.map(item => {
        const { _id: employee_id } = item
        item['customers_'] = [];
        assignedEmployees.map(obj => {
          const { employee } = obj
          if (employee) {
            const { _id: employee_id1 } = employee;
            if (employee_id === employee_id1) {
              item['customers_'].push(obj)
            }
          }
        })
        item['customers'] = item['customers_'].length
      })
      setFilterData(items)
    }
    init();
  }, [items])
  const onFinish = (values) => {
    if (isUpdate && currentId) {
      const id = currentId;
      dispatch(crud.update({ entity, id, jsonData: values }));
    } else {
      dispatch(crud.create({ entity, jsonData: values }));
    }
    setTimeout(() => {
      formRef.current.resetFields();
      dispatch(crud.list({ entity }));
      handleCancel()
    }, 400);
  };
  const formRef = useRef(null);
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  useEffect(() => {
    dispatch(crud.resetState())
    dispatch(crud.list({ entity }));
  }, []);

  const handelDataTableLoad = useCallback((pagination) => {

    if (!searchText) {
      const options = { page: pagination.current || 1 };
      dispatch(crud.list({ entity, options }));
    } else {

      async function fetchData() {
        const options = {
          q: searchText,
          fields: searchFields,
          page: pagination.current || 1
        };
        const { result, paginations } = await request.search({ entity, options })
        console.log(result, paginations, 'result, paginations');
        setFilterData(result)
        setPaginations(paginations)
      }
      fetchData();
    }

  }, [searchText]);

  useEffect(() => {
    async function fetchData() {

      if (!searchText) {
        // setFilterData(pagination)
        setFilterData(items)
      } else {
        const options = {
          q: searchText,
          fields: searchFields,
        };
        const { result, paginations } = await request.search({ entity, options })
        setFilterData(result)
        setPaginations(paginations)
      }

    }
    fetchData();



  }, [searchText])
  const Footer = () => {
    const pages = searchText ? paginations : pagination
    const { current, count, total, page } = pages
    const currentPage = current || page;
    const totalSize = total || count;

    return (
      <>
        Mostrando registros del {filterData.length ? ((currentPage - 1) * 10 + 1) : 0} al {currentPage * 10 > (totalSize) ? (totalSize) : currentPage * 10} de un total de {totalSize} registros
      </>
    );
  }
  const cancelModal = () => {
    setIsModal(false)
  }
  return (

    <DashboardLayout>
      <Layout>
        <Modal title="Create Form" open={isModalVisible} onOk={handleOk} onCancel={handleCancel} footer={null}>
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
              onFinishFailed={onFinishFailed}
              autoComplete="off"
            >
              <Form.Item
                name="personal_id"
                label="Personal ID"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="name"
                label="name"
                rules={[
                  {
                    required: true,
                    message: 'Please input your name!',
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[
                  {
                    required: true,
                    message: 'Please input your phone!',
                  },
                ]}
              >
                <Input type='number' />
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
          </>
        </Modal>

        <Modal title="Customers" open={isModal} onCancel={cancelModal} footer={null} width={1000}>
          <Table
            columns={customerColumns}
            dataSource={customerData || []}

          />
        </Modal>
        <Layout>
          <Row gutter={24} style={{ textAlign: 'right' }}>
            <Col span={6}>
              <Input
                placeholder="Search"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col span={18}>
              <Button onClick={showModal} type="primary">Create Employee</Button>
            </Col>

          </Row>

          <Form form={form} component={false}>
            <Table
              bordered
              rowKey={(item) => item._id}
              key={(item) => item._id}
              dataSource={filterData}
              columns={mergedColumns}
              rowClassName="editable-row"
              pagination={searchText ? paginations : pagination}

              onChange={handelDataTableLoad}
              footer={Footer}

            />
          </Form>


        </Layout>
      </Layout>
    </DashboardLayout>
  );
};
export default Employees;