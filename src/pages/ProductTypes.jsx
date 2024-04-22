import { DashboardLayout, } from '@/layout';
import { DeleteOutlined, EditOutlined, SearchOutlined, } from '@ant-design/icons';
import { Button, Col, Form, Input, Layout, Modal, PageHeader, Popconfirm, Row, Table, Typography } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { selectListItems } from '@/redux/crud/selectors';
import moment from 'moment';
import SelectAsync from '@/components/SelectAsync';
import { request } from '@/request';
import { useForm } from 'antd/lib/form/Form';

const { role } = window.localStorage.auth ? JSON.parse(window.localStorage.auth) : {};


const ProductTypes = () => {
  const entity = "productTypes"
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isUpdate, setIsUpdate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { is_admin, is_primary_company, company_id } = useSelector((state) => state.auth);
  const showModal = () => {
    setCurrentId(new Date().valueOf())
    setIsModalVisible(true);
    setIsUpdate(false);
    if (formRef.current) formRef.current.resetFields();
    selectDefaultCompany();
  };
  const dispatch = useDispatch();

  const handleOk = () => {
    // handle ok button click here
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const [createForm] = useForm();
  const [editingKey, setEditingKey] = useState('');
  const [currentId, setCurrentId] = useState('');
  const [currentItem, setCurrentItem] = useState({});
  const [filterData, setFilterData] = useState([]);
  const [userData, setUserData] = useState([]);
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
      selectDefaultCompany()
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
  const columns = [
    {
      title: 'Product type',
      dataIndex: 'product_name',
      width: '15%',
    },
    {
      title: 'Company Name',
      dataIndex: ['company_name', 'company_name'],
      width: '15%',
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
            <Typography.Link onClick={() => editItem(record)}>
              <EditOutlined style={{ fontSize: "20px" }} />
            </Typography.Link>

            <Popconfirm title="Sure to delete?" onConfirm={() => deleteItem(record)}>
              <DeleteOutlined style={{ fontSize: "20px" }} />
            </Popconfirm>
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
  const [pagination, setPagination] = useState();
  const [items, setItems] = useState();
  const onFinish = (values) => {
    if (isUpdate && currentId) {
      const id = currentId;
      dispatch(crud.update({ entity, id, jsonData: values }));
    } else {
      dispatch(crud.create({ entity, jsonData: values }));
    }
    formRef.current.resetFields();
    getItems();
    handleCancel()
  };
  const formRef = useRef(null);
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  const getItems = async () => {
    const { result: items, pagination } = await request.list({ entity });
    let filter = items.filter((product_type) => (is_admin || company_id === product_type.company_name._id));
    const result = filter.map((obj, index) => (
      { ...obj, key: index }
    ))
    if (result.length) {
      setFilterData(result)

      setIsLoading(false);
      console.log("-setIsLoading", result);
      setUserData(result)
    }
    setPagination(pagination);
  }
  useEffect(() => {
    getItems();
    document.title = "Product Types"
  }, []);
  useEffect(() => {
    const filteredData = userData.filter((record) => {
      return (
        (!searchText || record['product_name'].toString().toLowerCase().includes(searchText.toLowerCase()))
      );
    })
    setFilterData(filteredData);
  }, [searchText, userData]);
  const selectDefaultCompany = async () => {
    const { result } = await request.listById({ entity: 'companyList', jsonData: { primary: true } });
    createForm.setFieldsValue({ company_name: result[0]?._id })
  }
  return (

    <DashboardLayout>
      <PageHeader title="Product Types" onBack={() => { window['history'].back() }}
        extra={
          <Button onClick={showModal} type="primary">Create Type</Button>
        }
      ></PageHeader>
      <Layout>
        <Modal title="Create Form" open={isModalVisible} onOk={handleOk} onCancel={handleCancel} footer={null}>
          <>
            <Form
              form={createForm}
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
                name="product_name"
                label="Product Type"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="company_name"
                label="Company"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <SelectAsync entity={"companyList"} displayLabels={["company_name"]} />
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
            bordered
            rowKey={(item) => item._id}
            key={(item) => item._id}
            dataSource={filterData}
            columns={mergedColumns}
            loading={isLoading}
            rowClassName="editable-row"
            pagination={{
              total: filterData.length,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              defaultPageSize: 10, // Set the default page size
            }}
          />


        </Layout>
      </Layout>
    </DashboardLayout>
  );
};
export default ProductTypes;