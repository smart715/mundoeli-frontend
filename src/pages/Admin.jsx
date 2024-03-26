
import React, { useEffect } from 'react';

import { Button, Col, Input, Row, Select, Table, Form, Typography, Popconfirm, PageHeader, Checkbox } from 'antd';
import { DashboardLayout } from '@/layout';
import Layout from 'antd/lib/layout/layout';
import { DeleteOutlined, EditOutlined, RedoOutlined, SearchOutlined } from '@ant-design/icons';
import { useState } from 'react';
import Modal from 'antd/lib/modal/Modal';
import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { request } from '@/request';
import { useSelector } from 'react-redux';
import { selectListItems } from '@/redux/crud/selectors';
import useOnFetch from '@/hooks/useOnFetch';
import { CompanyPicker } from "./common";

const userRoles = [
  {
    label: "Super Admin",
    value: 0
  },

  {
    label: "Consultas Admin",
    value: 1
  },

  {
    label: "Operations",
    value: 2
  },

  {
    label: "SuperVisor",
    value: 3
  },
]
const getRoleName = (role) => {
  if (!isNaN(role)) {
    const { label } = userRoles.find(obj => obj.value === role)
    return label;
  }
  return '';
}

const Admin = () => {

  const [isUpdate, setIsUpdate] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentId, setCurrentId] = useState()
  const [filterData, setFilterData] = useState([]);
  const [userData, setUserData] = useState([]);
  const dispatch = useDispatch();
  const formRef = useRef(null);
  const { onFetch, result, isLoading, isSuccess } = useOnFetch();
  const [paginations, setPaginations] = useState([])
  const [selectedCompany, setSelectedCompany] = useState();

  const entity = 'admin'
  const dataTableColumns = [
    { title: 'Full Name', dataIndex: 'name' },
    { title: 'Email', dataIndex: 'email' },
    {
      title: "Admin", dataIndex: 'is_admin',
      render: (_) => {
        return _ ?
          <span className='badge badge-light-success'>Administrator</span> :
          <span className='badge badge-light-primary'>User</span>
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
            <Typography.Link onClick={() => editItem(record)}>
              <EditOutlined style={{ fontSize: "20px" }} />
            </Typography.Link>

            <Popconfirm title="Sure to delete?" onConfirm={() => deleteItem(record)}>
              <DeleteOutlined style={{ fontSize: "20px" }} />
            </Popconfirm>
            <Typography.Link onClick={() => updatePassword(record)}>
              <RedoOutlined style={{ fontSize: "20px" }} />
            </Typography.Link>
          </>
        )
      },

    }
  ];

  const showModal = () => {
    setIsUpdate(false)
    setIsModalVisible(true);
    if (formRef.current) {
      formRef.current.resetFields()
    }


  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const onFinish = (values) => {
    if (!values['is_admin']) values['is_admin'] = false;
    values['company_id'] = values['company']?._id;
    console.log('%cfrontend\src\pages\Admin.jsx:114 values', 'color: #007acc;', values);
    if (isUpdate && currentId) {
      const id = currentId;
      dispatch(crud.update({ entity, id, jsonData: values }));
    } else {
      dispatch(crud.create({ entity, jsonData: values }));
    }
    setIsModalVisible(false)
    setTimeout(() => {
      dispatch(crud.resetState());
      dispatch(crud.list({ entity }));
    }, 400)
  }
  const editItem = (item) => {
    setCurrentId(item._id);
    setIsModalVisible(true);
    setIsUpdate(true);
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.setFieldsValue(item)
      }
    }, 400);
  }
  const { result: listResult } = useSelector(selectListItems);

  const { pagination, items } = listResult;

  const updatePassword = (item) => {
    const password = prompt("please enter new password");

    if (password) {
      const entity = 'admin/password-update/' + item._id;
      const updateFn = () => {
        return request.patch({ entity, jsonData: { password: password } });
      };
      onFetch(updateFn);
    }


  }
  const deleteItem = (item) => {
    const id = item._id;
    dispatch(crud.delete({ entity, id }))
    setTimeout(() => {
      dispatch(crud.resetState());
      dispatch(crud.list({ entity }));
    }, 1000)
  }
  useEffect(() => {
    const result = items.map((obj, index) => (
      { ...obj, key: index }
    ))


    if (result.length) {
      setFilterData(result)
      setUserData(result)
      setPaginations(pagination)
    }

  }, [
    items, pagination
  ])

  useEffect(() => {
    dispatch(crud.resetState());
    dispatch(crud.list({ entity }));
    document.title = "Users"
  }, [])
  useEffect(() => {
    const filteredData = userData.filter((record) => {

      return (
        (!searchText || record['name'].toString().toLowerCase().includes(searchText.toLowerCase()) ||
          record['surname'].toString().toLowerCase().includes(searchText.toLowerCase()) ||
          record['email'].toString().toLowerCase().includes(searchText.toLowerCase()))
      );

    })
    setFilterData(filteredData);
    setPaginations({ current: 1, pageSize: 10, total: filteredData.length })
  }, [searchText])
  const onFinishFailed = () => { }
  return (
    <DashboardLayout>
      <PageHeader title="Users" onBack={() => { window['history'].back() }}
        extra={
          <Button onClick={showModal} type="primary">Create user</Button>
        }
      ></PageHeader>
      <Layout>
        <Modal title="Create Form" visible={isModalVisible} onCancel={handleCancel} footer={null} width={500}>
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

              <Row gutter={24}>

                <Col span={24}>
                  <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>


                  {!isUpdate
                    &&

                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        {
                          required: true,
                          type: 'email'
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  }
                  {!isUpdate &&


                    <Form.Item
                      name="password"
                      label="Password"
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    >
                      <Input.Password autoComplete="new-password" />
                    </Form.Item>
                  }
                  <Form.Item
                    name={'is_admin'}
                    label={"Admin"}
                    valuePropName='checked'
                  >
                    <Checkbox defaultChecked={false} />
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
                </Col>
              </Row>
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
        <Row gutter={24} style={{ textAlign: 'right' }}>
          <Col span={6}>
            <Input
              placeholder='Search'
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
        </Row>

        <Table
          style={{ overflow: 'auto' }}
          bordered
          dataSource={filterData || []}
          columns={dataTableColumns}
          rowClassName="editable-row"
          // pagination={paginations}
          pagination={{
            total: filterData.length,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            defaultPageSize: 10, // Set the default page size
          }}

        />
      </Layout>
    </DashboardLayout>
  );
}
export default Admin