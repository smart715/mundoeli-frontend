import { DashboardLayout, } from '@/layout';
import { DeleteOutlined, EditOutlined, SearchOutlined, } from '@ant-design/icons';
import { Button, Col, Form, Input, Layout, PageHeader, Popconfirm, Row, Table, Typography } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { selectListItems } from '@/redux/crud/selectors';
import moment from 'moment';
import ProductCreationModal from './ProductCreationModal';
import SelectAsync from '@/components/SelectAsync';
import history from '@/utils/history';
import { request } from '@/request';
const ProductCategories = () => {
  const entity = "productCategories"
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [isUpdate, setIsUpdate] = useState(false);
  const { is_admin, is_primary_company, company_id } = useSelector((state) => state.auth);
  const showModal = () => {

    setCurrentId(new Date().valueOf())
    setIsModalVisible(true);
    setIsUpdate(false);
    if (formRef.current) formRef.current.resetFields();

  };
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const [currentId, setCurrentId] = useState('');
  const [currentItem, setCurrentItem] = useState({});
  const [searchText, setSearchText] = useState('');
  const [userData, setUserData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [productLists, setProductLists] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState()
  const [isLoading, setIsLoading] = useState(true);
  const isEditing = (record) => record._id === editingKey;
  const editItem = (item) => {
    if (item) {
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
      dispatch(crud.resetState());
      dispatch(crud.list({ entity }));
    }, 1000)
  }
  const columns = [
    {
      title: 'Product name',
      dataIndex: 'category_name',
      width: '15%',
    },
    {
      title: 'Product Price',
      dataIndex: 'product_price',
      width: '15%',
      render: (price) => {
        return `$${parseFloat(price || 0).toFixed(2) || 0}`
      }
    },
    {
      title: 'Product Type',
      dataIndex: ['product_type', `product_name`],
      width: '15%',
    },
    {
      title: 'Date',
      dataIndex: `created`,
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
  const formRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { result } = await request.listById({ entity });
      let filter = result.filter((product) => (is_admin || company_id === product.product_type.company_name._id));
      console.log("productLists", filter);
      setProductLists(filter);
      setIsLoading(false);
    })()
    document.title = "Product Lists"
  }, []);
  useEffect(() => {
    const result = productLists.map((obj, index) => (
      { ...obj, key: index }
    ))
    if (result.length) {
      setFilterData(result)
      setUserData(result)
    }
  }, [
    productLists
  ])
  useEffect(() => {
    const filteredData = userData.filter((record) => {
      return (
        (!searchText || record['category_name'].toString().toLowerCase().includes(searchText.toLowerCase()))
        &&
        (!selectedTypeId || record?.product_type?._id === selectedTypeId)
      );
    })
    setFilterData(filteredData);
  }, [searchText, userData, selectedTypeId]);

  return (

    <DashboardLayout>
      <PageHeader title="Reserva Products" onBack={() => { window['history'].back() }}
        extra={
          <Button onClick={showModal} type="primary">Create Product</Button>
        }
      ></PageHeader>
      <Layout>
        <Layout>
          <Row gutter={24}>
            <Col span={4}>
              <Form.Item>
                <Input
                  placeholder='Search'
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </Form.Item>
            </Col>

            <Form.Item style={{ width: "20%" }}>
              <SelectAsync entity={"productTypes"} displayLabels={["product_name"]} onChange={(id) => setSelectedTypeId(id)} />
            </Form.Item>
          </Row>

          <Form form={form} component={false}>
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
          </Form>

          <ProductCreationModal isModalVisible={isModalVisible} setIsModalVisible={(value) => setIsModalVisible(value)} currentId={currentId} isUpdate={isUpdate} currentItem={currentItem} />
        </Layout>
      </Layout>
    </DashboardLayout>
  );
};
export default ProductCategories;


