import { DashboardLayout, } from '@/layout';
import { DeleteOutlined, EditOutlined, SettingTwoTone, } from '@ant-design/icons';
import { Button, Form, Input, Layout, Modal, PageHeader, Popconfirm, Table, Typography } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { selectListItems } from '@/redux/crud/selectors';
import moment from 'moment';
import { request } from '@/request';

const CompanyList = () => {
  const entity = "companyList"
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisibleDelete, setIsModalVisibleDelete] = useState(false);
  const { id: currentUserId } = JSON.parse(localStorage.auth)
  const [isUpdate, setIsUpdate] = useState(false);
  const [deletItem, setDeleteItem] = useState();
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
  const handleOkDelete = () => {
    // handle ok button click here
    setIsModalVisibleDelete(false);
  };
  const handleCancelDelete = () => {
    setIsModalVisibleDelete(false);
  };
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const [currentId, setCurrentId] = useState('');
  const [currentItem, setCurrentItem] = useState({});
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
  const formRefAdmin = useRef(null);
  const onFinishAdmin = async (values) => {
    const entityAdmin = 'admin'
    const id = currentUserId
    const userPass = await request.checkPass({ entity: entityAdmin, id, jsonData: values })
    if (userPass.success) {
      const id = deletItem._id;
      dispatch(crud.delete({ entity, id }))
      setTimeout(() => {
        dispatch(crud.resetState());
        dispatch(crud.list({ entity }));
      }, 1000)
    }
    setIsModalVisibleDelete(false);

  };
  const onFinishFailedAdmin = (errorInfo) => {
    console.log('Failed:', errorInfo);
    setIsModalVisibleDelete(false);
  };
  const deleteItem = (item) => {
    setDeleteItem(item)
    setIsModalVisibleDelete(true);


  }
  const columns = [
    {
      title: 'Company Name',
      dataIndex: 'company_name',
      width: '15%',
      render: (text, record) => {
        if (record?.primary) {
          return <span className='badge badge-light-success'>{text}</span>
        } else {
          return text;
        }
      }
    },
    {
      title: 'Created',
      dataIndex: 'created',
      width: '15%',
      render: (text) => {
        return moment(new Date(text)).format('DD/MM/YY')
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
            <Modal
              title='Admin Password'
              visible={isModalVisibleDelete}
              onOk={handleOkDelete}
              onCancel={handleCancelDelete}
              footer={null}
            >
              <Form
                ref={formRefAdmin}
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
                onFinish={onFinishAdmin}
                onFinishFailed={onFinishFailedAdmin}
                autoComplete="off"
              >
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input type='password' />
                </Form.Item>
                <Form.Item
                  wrapperCol={{
                    offset: 8,
                    span: 20,
                  }}
                >
                  <Button type="primary" htmlType="submit">
                    Delete
                  </Button>
                  <Button type="ghost" onClick={handleCancelDelete}>
                    cancel
                  </Button>
                </Form.Item>

              </Form>
            </Modal>

            <Typography.Link onClick={() => editItem(record)}>
              <EditOutlined style={{ fontSize: "20px" }} />
            </Typography.Link>
            {
              !record?.primary &&
              <>
                <Popconfirm title="Sure to delete?" onConfirm={() => deleteItem(record)}>
                  <DeleteOutlined style={{ fontSize: "20px" }} />
                </Popconfirm>
                <Popconfirm title="Set to primary?" onConfirm={() => setPrimary(record)}>
                  <SettingTwoTone style={{ fontSize: "20px" }} />
                </Popconfirm>
              </>
            }
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
  const onSearch = (value) => console.log(value);
  const onFinish = (values) => {
    if (isUpdate && currentId) {
      const id = currentId;
      dispatch(crud.update({ entity, id, jsonData: values }));
    } else {
      dispatch(crud.create({ entity, jsonData: values }));
    }
    formRef.current.resetFields();
    dispatch(crud.resetState());
    dispatch(crud.list({ entity }));
    handleCancel()
  };
  const formRef = useRef(null);
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  useEffect(() => {
    dispatch(crud.resetState());
    dispatch(crud.list({ entity }));
    document.title = "Company"
  }, []);
  const setPrimary = (record) => {
    const id = record._id;
    const jsonData = { primary: true }
    dispatch(crud.update({ entity, id, jsonData }));
    setTimeout(() => {
      dispatch(crud.resetState());
      dispatch(crud.list({ entity }));
    }, [500]);
  }
  return (
    <DashboardLayout>
      <PageHeader onBack={() => window.history.back()} title="Company" extra={<Button onClick={showModal} type="primary">Create</Button>}></PageHeader>
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
              <Form.Item
                name="company_name"
                label="Company Name"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
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
          <Form form={form} component={false}>
            <Table
              bordered
              rowKey={(item) => item._id}
              key={(item) => item._id}
              dataSource={items}
              columns={mergedColumns}
              rowClassName="editable-row"
              pagination={{
                total: items.length,
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
export default CompanyList;