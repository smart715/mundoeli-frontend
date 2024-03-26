import { DashboardLayout, } from '@/layout';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Layout, Modal, PageHeader, Row, Table, Typography } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { selectListItems } from '@/redux/crud/selectors';
import { Link } from 'react-router-dom/cjs/react-router-dom';
import { request } from '@/request';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import moment from 'moment';
import { CompanyPicker } from "./common";
const Customers = () => {
  const entity = "client"
  const searchFields = 'name,email';
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCompany, setSelectedCompany] = useState();
  const { default: TextArea } = require("antd/lib/input/TextArea");



  const history = useHistory();
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

  }, [searchText, dispatch]);

  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const [currentId, setCurrentId] = useState('');
  const [filterData, setFilterData] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const isEditing = (record) => record._id === editingKey;
  const columns = [
    {
      title: 'Id',
      dataIndex: 'customer_id',
      width: '15%',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      width: '15%',
    },
    {
      title: 'IG  user',
      dataIndex: 'iguser',
      width: '15%',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: '15%',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      width: '15%',
    },
    {
      title: 'Registration',
      dataIndex: 'created',
      width: '15%',
      render: (created) => {
        return moment(new Date(created)).format('DD/MM/YY')
      }
    },
    {
      title: 'Actions',
      dataIndex: 'operation',
      width: "10%",
      align: 'center',
      render: (_, record) => {
        return (
          <>
            <Typography.Text>
              <Link to={`/customer/details/${record._id}`}>
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
  const { result: listResult } = useSelector(selectListItems);

  const { pagination, items } = listResult;
  const [paginations, setPaginations] = useState(pagination)


  const onFinish = async (values) => {
    values['company_id'] = values['company']?._id;
    if (isUpdate && currentId) {
      const id = currentId;
      dispatch(crud.update({ entity, id, jsonData: { ...values } }));
    } else {
      const { result } = await request.create({ entity, jsonData: { ...values } });
      if (result) {
        history.push(`/customer/details/${result?._id}`)
      } else {

      }
    }
    // formRef.current.resetFields();
    // dispatch(crud.resetState());
    // dispatch(crud.list({ entity }));
    // handleCancel()
  };
  const formRef = useRef(null);
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  useEffect(() => {
    dispatch(crud.resetState());
    dispatch(crud.list({ entity }));
    document.title = "Customers";
  }, [dispatch]);

  useEffect(() => {
    if (items) {
      const updatedItems = items.map((obj, index) => { obj._customer_id = index + 1; return obj })
      setFilterData(updatedItems)
      setDataSource(updatedItems);
    }
  }, [items])
  useEffect(() => {
    const filteredData = dataSource.filter((record) => {
      const { email, name, phone, iguser } = record;
      return (
        (!searchText || email.toString().toLowerCase().includes(searchText.toLowerCase()) ||
          name.toString().toLowerCase().includes(searchText.toLowerCase()) ||
          phone.toString().toLowerCase().includes(searchText.toLowerCase()) ||
          iguser.toString().toLowerCase().includes(searchText.toLowerCase()))
      );
    })
    setFilterData(filteredData)
  }, [searchText, dataSource])
  const Footer = useCallback(() => {
    const pages = searchText ? paginations : pagination
    const { current, count, total, page } = pages
    const currentPage = current || page;
    const totalSize = total || count;

    return (
      <>
        Showing {filterData.length ? ((currentPage - 1) * 10 + 1) : 0} to {currentPage * 10 > (totalSize) ? (totalSize) : currentPage * 10} of {totalSize} entries
      </>
    );
  }, [filterData, paginations, pagination, searchText])
  return (

    <DashboardLayout>
      <PageHeader title="Customer" onBack={() => { window['history'].back() }}
        extra={
          <Button onClick={showModal} type="primary">Create Customer</Button>
        }
      ></PageHeader>
      <Layout style={{ minHeight: '100vh' }}>
        <Modal title="Create Form" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} footer={null}>
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
              {/* <Form.Item
                name="customer_id"
                label="Customer ID"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input value={customerId} />
              </Form.Item> */}
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
              <Form.Item
                name="iguser"
                label="IG user"
                rules={[
                  {
                    required: true,
                    message: 'Please input your IG user!',
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
                name="notes"
                label="Notes"
              >
                <TextArea />
              </Form.Item>
              <Form.Item
                name="address"
                label="Address"
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="company"
                label="Company"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <CompanyPicker onChange={setSelectedCompany} />
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
        <Layout>
          <Row gutter={24}>
            <Col className='gutter-row' span={6}>
              <Input
                placeholder="Search"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
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
export default Customers;

