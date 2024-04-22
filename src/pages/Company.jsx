import { DashboardLayout, } from '@/layout';
import { DeleteOutlined, EditOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Form, Input, Layout, Modal, Popconfirm, Row, Select, Space, Table, Tag, Typography, message } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { selectListItems } from '@/redux/crud/selectors';
import { Link } from 'react-router-dom/cjs/react-router-dom';
import { request } from '@/request';
import useFetch from '@/hooks/useFetch';
import moment from 'moment';

const { role } = window.localStorage.auth ? JSON.parse(window.localStorage.auth) : {};
const statusLabel = [
  "",
  "Active",
  "Inactive"
]
const formattedDateFunc = (date) => {
  return new Date(date).toLocaleDateString()
}
const Company = () => {
  const entity = "company"
  const searchFields = 'name,email';
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [status, setStatus] = useState();

  const [isUpdate, setIsUpdate] = useState(false);
  const [searchText, setSearchText] = useState('');

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
  const [customerId, setCustomerId] = useState(generateCustomerId());
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

  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const [currentId, setCurrentId] = useState('');
  const [currentItem, setCurrentItem] = useState({});
  const [filterData, setFilterData] = useState([]);
  const [dataSource, setDataSource] = useState([]);

  const isEditing = (record) => record._id === editingKey;
  const editItem = (item) => {
    if (item) {
      setTimeout(() => {
        if (item.periods)
          item.periods = [moment(item.periods[0]), moment(item.periods[1])]

        console.log(item, '333333')
        if (formRef.current) formRef.current.setFieldsValue(item);
      }, 400);
      setCurrentId(item._id);
      setCurrentItem(item);
      setIsModalVisible(true);
      setIsUpdate(true);
    }
  }

  const deleteItem = async (item) => {
    if (!item.recurrent) {
      const id = item._id;
      dispatch(crud.delete({ entity, id }))
      setTimeout(() => {
        dispatch(crud.resetState());
        dispatch(crud.list({ entity }));
      }, 1000)
    } else {
      message.error("can't remove with company")
    }
  }
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: '15%',
    },
    {
      title: 'Company Name',
      dataIndex: 'company_name',
      width: '15%',
    },
    {
      title: 'Sub url',
      dataIndex: 'db_name',
      width: '15%',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: '15%',
    },
    {
      title: 'Users',
      dataIndex: 'users',
      width: '15%',
    },
    {
      title: 'Start',
      dataIndex: 'periods',
      width: '15%',
      render: (text) => {
        return text ? formattedDateFunc(text[0]) : ''
      }
    },
    {
      title: 'End',
      dataIndex: 'periods',
      width: '15%',
      render: (text) => {
        return text ? formattedDateFunc(text[1]) : ''
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: '15%',
      render: (status) => {
        return statusLabel[status]
      }
    },
    {
      title: 'Actions',
      dataIndex: 'operation',
      width: "10%",
      align: 'center',
      render: (_, record) => {
        return (
          // role === 0 ?
          <>
            <Typography.Link onClick={() => editItem(record)}>
              <EditOutlined style={{ fontSize: "20px" }} />
            </Typography.Link>

            <Popconfirm title="Sure to delete?" onConfirm={() => deleteItem(record)}>
              <DeleteOutlined style={{ fontSize: "20px" }} />
            </Popconfirm>
            {/* <Typography.Text>
                <Link to={`/customer/details/${record._id}`}>
                  <EyeOutlined style={{ fontSize: "20px" }} />
                </Link>
              </Typography.Text> */}

          </>
          // :
          // <>

          //   <Typography.Text>
          //     <Link to={`/customer/details/${record._id}`}>
          //       <EyeOutlined style={{ fontSize: "20px" }} />
          //     </Link>
          //   </Typography.Text>

          // </>
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
  const [detectAction, setdetectAction] = useState(false)



  const onFinish = (values) => {
    setdetectAction(true)
    const item = dataSource.filter(data => data.email === values.email || data.db_name === values.db_name)
    if (isUpdate && currentId) {
      const id = currentId;
      dispatch(crud.update({ entity, id, jsonData: values }));
    } else {
      if (item.length) {
        return message.error("can't save same db or same email")
      }
      values['status'] = 1;
      dispatch(crud.create({ entity, jsonData: values }));
    }
    formRef.current.resetFields();
    dispatch(crud.resetState());
    dispatch(crud.list({ entity }));
    handleCancel()
    setdetectAction(false)

  };
  const formRef = useRef(null);
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  useEffect(() => {
    dispatch(crud.resetState());
    dispatch(crud.list({ entity }));
    document.title = "Company"
    console.log(111111,);
  }, []);
  const asyncList = () => {
    return request.list({ entity: "recurrentInvoice" });
  };
  const { result: recurrentInvoices } = useFetch(asyncList);

  useEffect(() => {
    if (items && recurrentInvoices)
      items.map(item => {
        const { _id } = item;
        recurrentInvoices.map(recurrent => {
          const { parent_id } = recurrent;
          if (parent_id._id === _id) {
            item.recurrent = true;
          } else {

            item.recurrent = false;
          }
        })
      })
    setFilterData(items)
    setDataSource(items);
  }, [items, recurrentInvoices])
  useEffect(() => {
    const filteredData = dataSource.filter((record) => {
      const { email, name } = record;
      return (
        (!searchText || email.toString().toLowerCase().includes(searchText.toLowerCase()) ||
          name.toString().toLowerCase().includes(searchText.toLowerCase()))
      );
    })
    setFilterData(filteredData)
  }, [searchText, dataSource, detectAction])

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
                name="name"
                label="Name"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input value={customerId} />
              </Form.Item>
              <Form.Item
                name="company_name"
                label="Company Name"
                rules={[
                  {
                    required: true,
                    message: 'Please input company name!',
                  },
                ]}
              >
                <Input />
              </Form.Item>

              {
                !isUpdate &&
                <Form.Item
                  name="email"
                  label="E-mail"
                  rules={[
                    {
                      type: 'email',
                      message: 'The input is not valid E-mail!',
                    },
                    {
                      required: true,
                      message: 'Please input your E-mail!',
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              }
              <Form.Item
                name="users"
                label="Users"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input type='number' />
              </Form.Item>
              <Form.Item
                name="periods"
                label="Periods"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker.RangePicker />
              </Form.Item>
              {
                isUpdate &&
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Select
                    options={[
                      { value: 1, label: "Active" },
                      { value: 2, label: "Inactive" }
                    ]}
                  />
                </Form.Item>
              }

              {
                !isUpdate &&

                <Form.Item
                  name="db_name"
                  label="DB/Sub url"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>


              }
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
              <Button onClick={showModal} type="primary">Add Company</Button>
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
              // pagination={searchText ? paginations : pagination}
              onChange={handelDataTableLoad}
              // footer={Footer}
              pagination={{
                total: filterData.length,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                defaultPageSize: 10, // Set the default page size
              }}
            />
          </Form>


        </Layout>
      </Layout>
    </DashboardLayout>
  );
};
export default Company;