import { DashboardLayout, } from '@/layout';
import { CheckOutlined, CloseCircleOutlined, DeleteOutlined, DeliveredProcedureOutlined, EditFilled, EditOutlined, EyeOutlined, FolderViewOutlined, FundViewOutlined, MinusCircleOutlined, PlusCircleOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { Badge, Button, Col, Dropdown, Form, Input, Layout, Modal, PageHeader, Popconfirm, Row, Select, Space, Statistic, Table, Tag, Typography, Upload, message } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { selectListItems, selectListsByCustomerContact } from '@/redux/crud/selectors';
import { Link } from 'react-router-dom/cjs/react-router-dom';
import { request } from '@/request';
import useFetch from '@/hooks/useFetch';
import { useForm } from 'antd/lib/form/Form';
import SelectAsync from '@/components/SelectAsync';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import TextArea from 'antd/lib/input/TextArea';
import moment from 'moment';
import CustomerModal from './CustomerModal';
import EditReservationModal from './EditReservationModal';
import ProductCreationModal from './ProductCreationModal';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { sendEmailWithCreation } from './common';
import _ from 'lodash';
import history from '@/utils/history';

const { role } = window.localStorage.auth ? JSON.parse(window.localStorage.auth) : {};
const { id: currentUserId } = JSON.parse(localStorage.auth)

const statusArr = [
  { value: 0, label: "All" },
  { value: 1, label: "Active" },
  { value: -1, label: "Cancelled" },
  { value: 2, label: "Delivered" },
  { value: 3, label: "Preventa" },
];
const entity = "customerReversation"

const Reservations = () => {
  const searchFields = 'name,email';
  const [status, setStatus] = useState();
  const [isPayment, setIsPayment] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [searchText, setSearchText] = useState('');

  const [emailFooter, setEmailFooter] = useState('')
  const dispatch = useDispatch();



  const [imageUrl, setImageUrl] = useState('');
  const [currentFile, setCurrentFile] = useState([]);

  const handlePaste = (event) => {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;

    setCurrentFile(event.clipboardData.files[0]);
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (e) => {
          console.log(e.target)
          const imageUrl = e.target.result;
          setImageUrl(imageUrl);
        };
        reader.readAsDataURL(blob);
      }
    }
  }

  const handleMenuClick = ({ key }, record) => {
    if (key === `1`) {
      editItem(record)
    } else if (key === `2`) {
      cancelItem(record)
    } else if (key === `3`) {
      deliveredItem(record)
    } else {
      logViewItem(record)
    }
  };
  const handleMenuClickBulk = ({ key }) => {
    console.log(key, `11111111111`);
    if (key === `2`) {
      bulkCancel()
    } else {
      bulkDeliver();
    }
  }
  const _items = [
    {
      label: 'Edit',
      key: 1,
      icon: <EditOutlined />,
    },
    {
      label: 'Cancel',
      key: 2,
      icon: <CloseCircleOutlined />,
    },
    {
      label: 'Delivered',
      key: 3,
      icon: <DeliveredProcedureOutlined />,
    },
    {
      label: 'View Log',
      key: 4,
      icon: <FundViewOutlined />,
    },
  ];
  const bulkItems = [
    {
      label: 'Cancel',
      key: 2,
      icon: <CloseCircleOutlined />,
    },
    {
      label: 'Delivered',
      key: 3,
      icon: <DeliveredProcedureOutlined />,
    },

  ];



  const finishCancel = async () => {
    if (currentId) {
      const id = currentId;
      const jsonData = { status: -1 };
      await request.create({ entity: `logHistory`, jsonData: { description: cancelCommit, log_id: id, where_: "reserva", user_id: currentUserId } })
      console.log(entity, id, jsonData, 'entity, id, jsonData');
      await request.update({ entity, id, jsonData })
      history.push('/reservations');
      setIsCancelModal(true);

    }
  }
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
  const [filterData, setFilterData] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [detectData, setDetectData] = useState(false);


  const onSelectChange = (newSelectedRowKeys) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const isEditing = (record) => record._id === editingKey;
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const columns = [
    {
      title: 'Id',
      dataIndex: 'reserva_id',
      width: '15%',
      render: (id, item) => {
        return <label onClick={() => editItem(item)}>R{id}</label>
      }
    },
    {
      title: 'Product',
      dataIndex: [`product_name`, 'category_name'],
      width: '15%',
    },
    {
      title: 'Type',
      dataIndex: [`product_type`, 'product_name'],
      width: '15%',
    },
    {
      title: 'Customer',
      dataIndex: [`parent_id`, 'name'],
      width: '15%',
    },
    // {
    //   title: 'IG  user',
    //   dataIndex: [`parent_id`, 'iguser'],
    //   width: '15%',
    // },
    // {
    //   title: 'Email',
    //   dataIndex: [`parent_id`, 'email'],
    //   width: '15%',
    // },
    {
      title: 'Phone',
      dataIndex: [`parent_id`, 'phone'],
      width: '15%',
    },
    {
      title: 'Date',
      dataIndex: 'created',
      width: '15%',
      render: (created) => {
        return moment(new Date(created)).format('DD/MM/YY')
      }
    },
    {
      title: 'Company',
      dataIndex: ['company_name', 'company_name'],
    },
    {
      title: 'Status',
      dataIndex: 'is_preventa',
      width: `15%`,
      render: (status, record) => {
        if (record?.status == -1) {
          return <span className='badge badge-light-danger'>Cancelled</span>
        } else if (record?.status === 2) {
          return <span className='badge badge-light-warning'>Delivered</span>
        }
        else {
          if ((status)) {
            return <span className='badge badge-light-info'>Preventa</span>
          } else {

            return <span className='badge badge-light-success'>Active</span>
          }
        }
      }
    },
    {
      title: 'Method',
      dataIndex: ['method', 'method_name'],
    },
    {
      title: 'Actions',
      render: (_, record) => {
        return (
          <Dropdown.Button menu={{ items: _items, onClick: (item) => handleMenuClick(item, record) }} />
        )

      }
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
  const logColumns = [
    {
      title: 'Date',
      dataIndex: 'created',
      render: (created) => {
        return moment(new Date(created)).format('DD/MM/YY')
      }
    },
    {
      title: 'Description',
      dataIndex: 'description',
    },
    {
      title: 'User',
      dataIndex: [`user_id`, `name`]
    },

  ];
  const { result: Items } = useSelector(selectListItems);

  const { pagination, items } = Items;
  const [initItems, setInitItems] = useState([]);
  const [paginations, setPaginations] = useState({
    "page": "1",
    "pages": 3,
    "count": 23
  })
  useEffect(async () => {
    const { result } = await request.list({ entity: 'systemInfo' });
    setEmailFooter(result[0]?.email_footer)
    console.log('%cfrontend\src\pages\Reservations.jsx:311 emailFooter', 'color: #007acc;', emailFooter);
    (async () => {
      const { result, pagination } = await request.list({ entity });
      setPaginations(pagination);
      setInitItems(result);

    })()
    document.title = "Reservations";
  }, []);

  useEffect(() => {
    (async () => {
      const { result } = await request.list({ entity: `logHistory` });
      const _initItems = initItems.sort((a, b) => b._reserva_id - a.reserva_id);
      // for (var i = 0; i < _initItems.length; i++) {
      //   _initItems[i]['_reserva_id'] = `R${i + 1}`
      //   for (var j = 0; j < result.length; j++) {
      //     if (_initItems[i].status === -1 && _initItems[i]._id === result[j].log_id) {
      //       _initItems[i][`notes`] = result[j][`description`];
      //     }
      //   }
      // }
      setFilterData(_initItems)
      setDataSource(_initItems);

    })()
  }, [initItems, detectData])
  useEffect(() => {
    const filteredData = dataSource.filter((record) => {

      var _status = record?.status
      if (record?.status === 1 && record?.is_preventa) {
        _status = 3
      }
      const { email, name, phone, iguser } = record?.parent_id;
      return (
        (!searchText || email.toString().toLowerCase().includes(searchText.toLowerCase()) ||
          name.toString().toLowerCase().includes(searchText.toLowerCase()) ||
          phone.toString().toLowerCase().includes(searchText.toLowerCase()) ||
          iguser.toString().toLowerCase().includes(searchText.toLowerCase())) &&
        (!status || _status === status)
      );
    })
    setFilterData(filteredData)
  }, [searchText, status])

  const Footer = () => {
    const pages = searchText ? paginations : pagination
    const { current, count, total, page } = pages
    const currentPage = current || page;
    const totalSize = total || count;

    return (
      <>
        Showing {filterData?.length ? ((currentPage - 1) * 10 + 1) : 0} to {currentPage * 10 > (totalSize) ? (totalSize) : currentPage * 10} of {totalSize} entries
      </>
    );
  }
  const handleDetectDataChange = (newDetectData) => {
    setDetectData(newDetectData);
  };
  const [isOpen, setIsOpen] = useState(false)
  const [isOpenModal, setIsOpenModal] = useState(false)
  const handleCloseFunc = (value) => {
    setIsOpen(value);
    setIsPayment(value)
  }

  const [isEditReserva, setIsEditReserva] = useState(false);
  const [isLogHistory, setIsLogHistory] = useState(false);
  const [isCancelModal, setIsCancelModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [_editForm] = useForm();
  const [logHistories, setLogHistories] = useState([]);
  const [paymentHistories, setPaymentHistories] = useState([])
  const [customerObj, setCustomerObj] = useState({})
  const [selectedRecord, setSelectedRecord] = useState({});

  const [cancelCommit, setCancelCommit] = useState(``);

  const getPaymentHistories = async (item) => {
    const { result } = await request.listById({ entity: 'paymentHistory', jsonData: { reserva_id: item?._id } });
    setPaymentHistories(result || [])
  }
  const editItem = (item) => {
    setIsEditReserva(true);
    setCurrentId(item?._id);
    setSelectedRecord(item)
    getPaymentHistories(item);
    setCustomerObj(item?.parent_id);
    _editForm.setFieldsValue({ ...item, product_name: item.product_name._id, product_type: item.product_type._id, pending_amount: (item.product_price - item.paid_amount), name: item?.parent_id?.name, email: item?.parent_id?.email, iguser: item?.parent_id?.iguser })

  }
  const logViewItem = async (item) => {
    const currentId = item?._id;
    const jsonData = { log_id: currentId, where_: "reserva" }
    const { result: logData } = await request.listById({ entity: "logHistory", jsonData });
    setLogHistories(logData)
    setIsLogHistory(true)
  }
  const cancelItem = (item) => {
    setIsCancelModal(true);
    setCurrentId(item?._id)
  }
  const deliveredItem = async (item) => {
    await request.update({ entity, id: item?._id, jsonData: { status: 2 } })
    await request.create({ entity: 'logHistory', jsonData: { log_id: item?._id, where_: `reserva`, description: "Delivered", user_id: currentUserId } })
    history.push('/reservations')
  }
  const bulkCancel = async () => {
    if (selectedRowKeys?.length) {
      await request.update({ entity, jsonData: { selectedRowKeys, bulk: true, status: -1 } });
      await request.list({ entity });
      const logData = selectedRowKeys.map(_id => {
        return { log_id: _id, user_id: currentUserId, description: 'Cancelled', where_: 'reserva', };
      })
      await request.multiCreate({ entity: 'logHistory', jsonData: logData })
    } else {
      message.error("Please select row.")
    }
    history.push('/reservations')
  }
  const bulkDeliver = async () => {
    if (selectedRowKeys?.length) {
      const filteredData = dataSource.filter(item => selectedRowKeys.includes(item._id));
      const customerIds = _.groupBy(filteredData, 'parent_id._id');
      for (var key in customerIds) {
        const _customer = filteredData.find(item => item?.parent_id?._id === key);
        const _mailArray = customerIds[key]
        await sendEmailWithCreation(_mailArray, 'to_delivered', _customer?.parent_id, emailFooter)
      }
      await request.update({ entity, jsonData: { selectedRowKeys, bulk: true, status: 2 } })
      const logData = selectedRowKeys.map(_id => {
        return { log_id: _id, user_id: currentUserId, description: 'Delivered', where_: 'reserva', };
      })
      await request.multiCreate({ entity: 'logHistory', jsonData: logData })
      history.push('/reservations')
    } else {
      message.error("Please select row.")
    }
  }
  const handleBankModal = () => {
    setIsEdit(false)
    setIsEditReserva(false)
  }
  const editedDataSave = (values) => {
    const id = currentId;
    if (currentId) {
      console.log(currentId, 'currentId');
      dispatch(crud.update({ entity, id, jsonData: values }));
      dispatch(crud.list({ entity }));
      handleBankModal()
    }
  }
  const [isCustomerUpdate, setIsCustomerUpdate] = useState(false)
  const editCustomer = () => {
    setIsOpenModal(true)
    setIsCustomerUpdate(true)
  }
  const handleCustomerModal = () => {
    setIsOpenModal(false)
  }
  const setCustomerInfo = (value) => {
    console.log(_editForm.getFieldsValue(), value);
    _editForm.setFieldsValue(value)
  }

  return (
    <DashboardLayout>
      <PageHeader title="Reservations" onBack={() => { window['history'].back() }}
        extra={
          <>
            <Button onClick={() => setIsOpen(true)}>New Reservation</Button>
            <Button type='primary' onClick={() => { setIsPayment(true); }} >New Payment</Button>
            <Dropdown.Button menu={{ items: bulkItems, onClick: (item) => handleMenuClickBulk(item) }} >
              Action
            </Dropdown.Button>
          </>
        }
      ></PageHeader>
      <Layout style={{ minHeight: '100vh' }} onPaste={handlePaste}>
        <Layout>
          <Row gutter={24}>
            <Col span={6}>
              <Input
                placeholder="Search"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col span={6}>
              <Select
                style={{ width: 200, textAlign: 'center' }}
                placeholder="Filter"
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
              columns={mergedColumns}
              rowClassName="editable-row"

              // pagination={searchText ? paginations : pagination}
              onChange={handelDataTableLoad}
              rowSelection={rowSelection}
              // footer={Footer}
              pagination={{
                total: filterData.length,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                defaultPageSize: 10, // Set the default page size
              }}
            />
          </Form>

          <NewReservationModal isVisit={isOpen} handleClose={handleCloseFunc} currentFile={currentFile} imageUrl={imageUrl}
            onDetectDataChange={handleDetectDataChange} />
          <Modal title={`Log History`} footer={null} onCancel={() => setIsLogHistory(false)} visible={isLogHistory}>
            <Table
              bordered
              rowKey={(item) => item._id}
              key={(item) => item._id}
              dataSource={logHistories || []}
              columns={logColumns}
              rowClassName="editable-row"


            />
          </Modal>
          <NewPaymentModal isVisit={isPayment} handleClose={handleCloseFunc} />
          <Modal title={`Please input your comment before cancel.`} onOk={finishCancel} onCancel={() => setIsCancelModal(false)} visible={isCancelModal}>
            <Form>
              <Form.Item>
                <TextArea onChange={(e) => setCancelCommit(e?.target?.innerHTML)} />
              </Form.Item>
            </Form>
          </Modal>

          <CustomerModal setCustomerInfo={setCustomerInfo} isEditWithReserva={true} isUpdate={isCustomerUpdate} isOpen={isOpenModal} handleCustomerModal={handleCustomerModal} customerInfo={customerObj} />
          <EditReservationModal isEditReserva={isEditReserva} setIsEditReserva={(value) => { setIsEditReserva(value) }} customerInfo={customerObj} currentItem={selectedRecord} currentCustomerId={customerObj?._id} />

        </Layout>
      </Layout>
    </DashboardLayout>
  );
};
export default Reservations;

const NewReservationModal = ({ isVisit, handleClose, imageUrl, currentFile, onDetectDataChange }) => {
  const dispatch = useDispatch();
  const [_form] = useForm();
  const [customerForm] = useForm();
  const [fileList, setFileList] = useState([]);
  const [newCategory, setNewCategory] = useState(``);
  const [newCustomer, setNewCustomer] = useState(``);
  const [productCategories, setProductCategories] = useState([]);
  const [companyName, setCompanyName] = useState('');
  const [customerData, setCustomerData] = useState([]);
  const [isEditCustomer, setIsEditCustomer] = useState(false)
  const [isNewCustomer, setIsNewCustomer] = useState(false)
  const [updateCustomerInfo, setUpdateCustomerInfo] = useState(false);
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const [totalAllAmount, setTotalAllAmount] = useState(0);
  const [totalPredienteAmount, setTotalPredienteAmount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState();
  const [paymentMethodLists, setPaymentMethodLists] = useState([])
  const [reservationMethod, setReservationMethod] = useState('')

  const history = useHistory();
  const getPaymentLists = async () => {
    const { result } = await request.listById({ entity: "paymentMethod" });
    setPaymentMethodLists(result || [])
  }
  const saveData = (values) => {
    onDetectDataChange(true)
    if (selectedCustomerId) {
      const parentId = selectedCustomerId;
      const { reversations } = values;
      const reversationsWithParentId = reversations.map((obj) => {
        obj.parent_id = parentId;
        obj.user_id = currentUserId;
        obj.is_preventa = obj.is_preventa || false;
        obj.company_name = values?.company_name;
        obj.method = reservationMethod;
        return obj
      })
      const formData = new FormData();
      formData.append('_file', imageUrl);
      formData.append('bulkData', JSON.stringify(reversationsWithParentId));
      dispatch(crud.upload({ entity, jsonData: formData }));
      handleClose(false);
      history.push('/reservations')
    }
    onDetectDataChange(false)

  }
  const onFinishFailed = () => { }
  const handleSearch = (values) => {
    setNewCustomer(values);
  }
  const [originProductCategories, setOriginProductCategories] = useState([])
  const [productObj, setProductObj] = useState(false)
  const getProductCategories = async () => {
    const { result } = await request.list({ entity: `productCategories` });
    setProductCategories(result || [])
    setOriginProductCategories(result || [])
  };
  const getCustomerData = async () => {
    const { result } = await request.list({ entity: `client` });

    setCustomerData(result || [])
  };
  const [isModalVisible, setIsModalVisible] = useState(false);
  const saveCategory = async (index) => {
    setCurrentIndex(index);
    if (!(_form.getFieldsValue()?.reversations && _form.getFieldsValue()?.reversations[index].product_type)) {
      return message.warning("Please select Type.")
    }
    if (newCategory) {
      const { reversations } = _form.getFieldsValue();
      setProductObj({ ...reversations[index], category_name: newCategory })
      setIsModalVisible(true)
    }
  }

  useEffect(() => {
    if (isVisit) {
      getProductCategories();
      getCustomerData();
      (async () => {
        const { result: companyList } = await request.list({ entity: "companyList" });
        _form.setFieldsValue({ company_name: companyList[0]?._id })
      })()
    }
  }, [isVisit, _form]);
  const onFinish = async (values) => {
    if (isNewCustomer) {
      await request.create({ entity: "client", jsonData: values });
      setTimeout(async () => {
        await getCustomerData()
      }, 500);

    } else {
      if (selectedCustomerId) {
        values[`_id`] = selectedCustomerId
        dispatch(crud.update({ entity: 'client', id: selectedCustomerId, jsonData: values }));
        setTimeout(async () => {
          await getCustomerData()
        }, 500)
      }
    }

  }
  const [selectedCustomerId, setSelectedCustomerId] = useState();
  const editCustomer = (status = false) => {
    if (status) {
      console.log(newCustomer, 'newCustomer');
      setIsNewCustomer(true);
      customerForm.resetFields();
      customerForm.setFieldsValue({ name: newCustomer });
    }
    else {
      setIsNewCustomer(false)
      const customerInfo = _form.getFieldsValue();
      setSelectedCustomerId(customerInfo?.name);
      console.log(customerInfo, 'customerInfo');
      const customerName = customerData.find(obj => obj._id === customerInfo.name)
      customerForm.setFieldsValue({ ...customerInfo, name: customerName?.name })
    }
    setIsEditCustomer(true)
  }
  useEffect(() => {
    if (selectedCustomerId) {
      const filteredObj = customerData.find(obj => obj._id === selectedCustomerId);
      console.log(filteredObj);
      _form.setFieldsValue({ email: filteredObj?.email, iguser: filteredObj?.iguser, phone: filteredObj?.phone, customer_name: filteredObj?.name, customer_id: filteredObj?._id })
    }
    getPaymentLists()

  }, [customerData, updateCustomerInfo, selectedCustomerId, _form]);

  const handleProductChange = (value) => {
    const company_name = [...originProductCategories.filter(obj => {
      if (obj?.product_type?._id === value) {
        return obj?.product_type?.company_name?.company_name
      }
    })]
    setCompanyName(company_name[0]?.product_type?.company_name?.company_name)
    setProductCategories([...originProductCategories.filter(obj => {
      if (obj?.product_type?._id === value) {
        return obj
      }
    })])
  }
  const handlePriceChange = useCallback((newValue, index) => {
    var formData = _form.getFieldsValue();
    if (formData) {
      formData['reversations'][index][`total_price`] = newValue;
      formData['reversations'][index][`prediente`] = (newValue || 0) - (formData['reversations'][index][`paid_amount`] || 0);
      const reversations = formData?.reversations;
      var total_paid_amount = 0, total_amount = 0, tota_prediente = 0;
      for (var i = 0; reversations && i < reversations.length; i++) {
        var obj = reversations[i];
        total_paid_amount += parseFloat(obj?.paid_amount || 0);
        total_amount += parseFloat(obj?.total_price || 0);
        tota_prediente += parseFloat(obj?.prediente || 0)
      }
      setTotalPaidAmount(total_paid_amount || 0)
      setTotalAllAmount(total_amount || 0)
      setTotalPredienteAmount(tota_prediente || 0)

      _form.setFieldsValue(formData);
    }
  }, [_form])
  const handlePaidChange = useCallback((newValue, index) => {
    var formData = _form.getFieldsValue();
    console.log(formData, 'formData');
    if (formData) {
      formData['reversations'][index][`prediente`] = formData['reversations'][index][`product_price`] - newValue;
      setReservationMethod(formData['reversations'][index][`method`])
      const reversations = formData[`reversations`];
      var total_paid_amount = 0, total_amount = 0, tota_prediente = 0;
      for (var i = 0; reversations && i < reversations.length; i++) {
        var obj = reversations[i];
        total_paid_amount += parseFloat(obj?.paid_amount || 0);
        total_amount += parseFloat(obj?.total_price || 0);
        tota_prediente += parseFloat(obj?.prediente || 0)
      }
      setTotalPaidAmount(total_paid_amount || 0)
      setTotalAllAmount(total_amount || 0)
      setTotalPredienteAmount(tota_prediente || 0)
      _form.setFieldsValue(formData);
    }
  }, [_form])
  const [checked, setChecked] = useState(false);

  const handleUpdatedInfo = async (updatedInfo) => {
    console.log(updatedInfo, '222222')
    setIsModalVisible(false);
    await getProductCategories();
    productChangeEvent(updatedInfo?._id, currentIndex, updatedInfo)
  }
  const productChangeEvent = useCallback((value, index, updatedInfo = false) => {
    var formData = _form.getFieldsValue();
    if (updatedInfo) {
      const { category_name, product_price, _id, product_type } = updatedInfo;
      if (formData) {
        formData['reversations'][index][`product_name`] = _id;
        formData['reversations'][index][`product_type`] = product_type;
        formData['reversations'][index][`payment_name`] = category_name;
        formData['reversations'][index][`product_price`] = product_price;
        _form.setFieldsValue(formData);
        handlePriceChange(product_price, index);
        handlePaidChange(formData['reversations'][index][`paid_amount`], index)
      }
    } else {
      const { category_name, product_price, product_type } = productCategories.find((obj) => {
        if (obj._id === value) {
          return obj
        }
      });
      if (formData) {
        formData['reversations'][index][`payment_type`] = product_type;
        formData['reversations'][index][`payment_name`] = category_name;
        formData['reversations'][index][`product_price`] = product_price;
        _form.setFieldsValue(formData);
        handlePriceChange(product_price, index);
        handlePaidChange(formData['reversations'][index][`paid_amount`], index)
      }
    }

  }, [_form, handlePriceChange, handlePaidChange, productCategories]);


  const [productType, setProductType] = useState('')
  const [originProductTypes, setOriginProductTypes] = useState('')
  const handleCompanyType = async (value) => {
    const { result } = await request.list({ entity: `productTypes` });
    setOriginProductTypes(result)

    const productTypes = result.filter((obj) => {
      if (obj?.company_name?._id === value) {
        return obj;
      }
    })
    setProductType(productTypes);
  }

  return (
    <div>
      <Modal title={`New Reservation`} visible={isVisit} onCancel={() => handleClose(false)} width={800} footer={null}>
        <Form
          className="ant-advanced-search-form"
          form={_form}
          name="basic"
          layout="vertical"
          wrapperCol={{
            span: 16,
          }}
          onFinish={saveData}
          onFinishFailed={onFinishFailed}
          autoComplete="off"

        >
          <Row style={{ width: `100%`, display: 'flex', justifyContent: "space-around" }}>
            <Col span={4}>
              <Form.Item
                name={'name'}
                wrapperCol={24}
                label="Name"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Select
                  onSearch={handleSearch}
                  showSearch
                  optionFilterProp="children"
                  onChange={(customer_id) => {
                    setSelectedCustomerId(customer_id)
                    const filteredObj = customerData.find(obj => customer_id === obj?._id)
                    _form.setFieldsValue({ email: filteredObj?.email, iguser: filteredObj?.iguser, phone: filteredObj?.phone, customer_name: filteredObj?.name, customer_id: filteredObj?._id });
                  }}
                  notFoundContent={<Button type="primary" onClick={(e) => editCustomer(true)}>
                    Create
                  </Button>}
                >
                  {customerData.map((optionField) => (
                    <Select.Option
                      key={optionField[`_id`]}
                      value={optionField[`_id`]}
                    >
                      {optionField[`name`]}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                name={'email'}
                label="Email"
                wrapperCol={24}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Select
                  onSearch={handleSearch}
                  showSearch
                  optionFilterProp="children"
                  onChange={(customer_id) => {
                    setSelectedCustomerId(customer_id)
                    const filteredObj = customerData.find(obj => customer_id === obj?._id)
                    _form.setFieldsValue({ email: filteredObj?.email, iguser: filteredObj?.iguser, phone: filteredObj?.phone, customer_name: filteredObj?.name, customer_id: filteredObj?._id, name: filteredObj?._id });
                  }}
                  notFoundContent={<Button type="primary" onClick={(e) => editCustomer(true)}>
                    Create
                  </Button>}
                >
                  {customerData.map((optionField) => (
                    <Select.Option
                      key={optionField[`_id`]}
                      value={optionField[`_id`]}
                    >
                      {optionField[`email`]}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item
                name={'phone'}
                label="Phone"
                wrapperCol={24}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Select
                  onSearch={handleSearch}
                  showSearch
                  defaultActiveFirstOption={true}
                  optionFilterProp="children"
                  onChange={(customer_id) => {
                    setSelectedCustomerId(customer_id)
                    const filteredObj = customerData.find(obj => customer_id === obj?._id)
                    _form.setFieldsValue({ email: filteredObj?.email, iguser: filteredObj?.iguser, phone: filteredObj?.phone, customer_name: filteredObj?.name, customer_id: filteredObj?._id, name: filteredObj?._id });
                  }}
                  notFoundContent={<Button type="primary" onClick={(e) => editCustomer(true)}>
                    Create
                  </Button>}
                >
                  {customerData.map((optionField) => (
                    <Select.Option
                      key={optionField[`_id`]}
                      value={optionField[`_id`]}
                    >
                      {optionField[`phone`]}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={3}>
              <Form.Item
                name={'iguser'}
                wrapperCol={24}
                label="IG"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Select
                  onSearch={handleSearch}
                  showSearch
                  optionFilterProp="children"
                  onChange={(customer_id) => {
                    setSelectedCustomerId(customer_id)
                    const filteredObj = customerData.find(obj => customer_id === obj?._id)
                    _form.setFieldsValue({ email: filteredObj?.email, iguser: filteredObj?.iguser, phone: filteredObj?.phone, customer_name: filteredObj?.name, customer_id: filteredObj?._id, name: filteredObj?._id });
                  }}
                  notFoundContent={<Button type="primary" onClick={(e) => editCustomer(true)}>
                    Create
                  </Button>}
                >
                  {customerData.map((optionField) => (
                    <Select.Option
                      key={optionField[`_id`]}
                      value={optionField[`_id`]}
                    >
                      {optionField[`iguser`]}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                name={'company_name'}
                label="Company Name"
              >

                <SelectAsync entity={`companyList`} displayLabels={[`company_name`]} onChange={handleCompanyType} />

              </Form.Item>
            </Col>
            <Col span={3}></Col>
            <Col span={4}><span style={{ color: 'red' }}>*</span> Product Type</Col>
            <Col span={4}><span style={{ color: 'red' }}>*</span> Product</Col>
            <Col span={3}><span style={{ color: 'red' }}>*</span>  Price</Col>
            <Col span={2}>Preventa</Col>
            <Col span={3}>Notes</Col>
            <Col span={4}>Methods</Col>
            <Col span={3}>action</Col>
            <Form.List name="reversations" initialValue={[{}]}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <Row
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: `space-around`,
                        width: '100%',
                        height: '35px'

                      }}
                    >
                      <Col span={4}>

                        <Form.Item
                          {...restField}
                          name={[name, `product_type`]}
                          wrapperCol={24}
                          rules={[
                            {
                              required: true,
                            },
                          ]}
                        >
                          <Select onChange={handleProductChange}>
                            {[...productType].map((optionField) => (
                              <Select.Option
                                key={optionField[`_id`]}
                                value={optionField[`_id`]}
                              >
                                {optionField[`product_name`]}
                              </Select.Option>
                            ))}
                            {/* <SelectAsync entity={'productTypes'} displayLabels={['product_name']} onChange={handleProductType} /> */}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}

                          wrapperCol={24}
                          name={[name, `product_name`]}
                          rules={[
                            {
                              required: true,
                            },
                          ]}

                        >
                          <Select
                            onSearch={(value) => setNewCategory(value)}
                            showSearch
                            optionFilterProp="children"
                            notFoundContent={<Button type="primary" onClick={(e) => {
                              saveCategory(index)
                            }}>
                              Create
                            </Button>}
                            onChange={(value) => {
                              productChangeEvent(value, index);
                            }}
                          >
                            {productCategories.map((optionField) => (
                              <Select.Option
                                key={optionField[`_id`]}
                                value={optionField[`_id`]}
                              >
                                {optionField[`category_name`]}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={3}>
                        <Form.Item
                          {...restField}
                          name={[name, `product_price`]}
                          wrapperCol={24}
                          rules={[
                            {
                              required: true,
                            },
                          ]}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            handlePriceChange(newValue, index)
                          }}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Form.Item
                          wrapperCol={24}
                          {...restField}
                          name={[name, `is_preventa`]}
                          valuePropName="checked"
                        >
                          <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)}>Yes</Checkbox>
                        </Form.Item>
                      </Col>
                      <Col span={3}>
                        <Form.Item
                          {...restField}
                          name={[name, `notes`]}
                          wrapperCol={24}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={4}>

                        <Form.Item name={[name, `method`]}>
                          <Select
                          >
                            {[...paymentMethodLists].map((data) => {
                              return (
                                <Select.Option
                                  value={data?._id}
                                >{data?.method_name} </Select.Option>
                              );
                            })}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={3}>
                        <Form.Item

                        >
                          <MinusCircleOutlined onClick={() => {
                            remove(name)
                            const formData = _form?.getFieldsValue();
                            if (formData) {
                              const reversations = formData?.reversations;
                              var total_paid_amount = 0, total_amount = 0, tota_prediente = 0;
                              for (var i = 0; reversations && i < reversations.length; i++) {
                                var obj = reversations[i];
                                total_paid_amount += parseFloat(obj?.paid_amount || 0);
                                total_amount += parseFloat(obj?.total_price || 0);
                                tota_prediente += parseFloat(obj?.prediente || 0)
                              }
                              setTotalPaidAmount(total_paid_amount || 0)
                              setTotalAllAmount(total_amount || 0)
                              setTotalPredienteAmount(tota_prediente || 0)

                            };
                          }} />
                          <PlusCircleOutlined onClick={() => add()} />

                        </Form.Item>
                      </Col>
                    </Row>

                  ))}
                  <div style={{ "border": "1px solid #f0f0f0" }} className="opacity-25 rounded h-1px w-100 mb-5 mt-5" a="12312"></div>
                  {/* <div className='border border-dark border-active active border-dashed d-flex pt-5 px-5'> */}
                  <Row style={{
                    display: `flex`,
                    justifyContent: 'space-between',
                    width: `80%`
                  }}>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <>
                        <Form.Item
                          {...restField}
                          style={{ width: '24%' }}
                          wrapperCol={24}
                          name={[name, 'payment_name']}
                          label={!index && "Product"}
                        >
                          <label>{_form.getFieldsValue()?.reversations && _form.getFieldsValue()?.reversations[index]?.payment_name}</label>
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          style={{ width: '24%' }}
                          name={[name, 'paid_amount']}
                          label={!index && "Paid"}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            handlePaidChange(newValue, index)

                          }}
                          rules={[
                            {
                              validator: ({ field }, paid_amount,) => {
                                const formValues = _form.getFieldsValue();
                                const total_price = formValues?.reversations[index]?.total_price;
                                console.log(typeof total_price, 'total_price,paid_amount', typeof paid_amount);
                                if (parseFloat(paid_amount || 0) > parseFloat(total_price || 0)) {
                                  return Promise.reject('Paid amount cannot be greater than total price');

                                }
                                return Promise.resolve();
                              },
                            }
                          ]}
                        >
                          <Input type='number' prefix="$" />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          style={{ width: '24%' }}
                          name={[name, 'total_amount']}
                          label={!index && "Total"}
                        >
                          <label>${(_form.getFieldsValue()?.reversations && (_form.getFieldsValue()?.reversations[index]?.total_price || 0))}</label>
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          style={{ width: '24%' }}
                          name={[name, 'prediente']}
                          label={!index && "Pending"}
                        >
                          <label>${(_form.getFieldsValue()?.reversations && (_form.getFieldsValue()?.reversations[index]?.prediente || 0))}</label>
                        </Form.Item>
                      </>
                    ))}
                  </Row>

                  <Row style={{
                    display: `flex`,
                    justifyContent: 'space-between',
                    width: `20%`,
                    height: '100%'
                  }}>
                    <img src={imageUrl} width="100%" height='100%' alt='' />
                  </Row>
                  <div className="opacity-25 rounded h-1px w-100 mb-5 mt-5" style={{ "border": "1px solid #f0f0f0" }}></div>
                  {/* </div> */}
                </>
              )}
            </Form.List>
          </Row>
          <Row style={{ width: '80%', justifyContent: 'space-around', display: 'flex' }}>
            <Col span={6}>
              <h3>Total Payment</h3>
            </Col>
            <Col span={6}>
              <h3>${totalPaidAmount.toFixed(2)}</h3>
            </Col>
            <Col span={6}>
              <h3>${totalAllAmount.toFixed(2)}</h3>
            </Col>
            <Col span={6}>
              <h3>${totalPredienteAmount.toFixed(2)}</h3>
            </Col>
          </Row>

          <Form.Item
            className='mt-6'
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            <Button type="primary" htmlType="submit">
              Save
            </Button>
            <Button type="ghost" onClick={() => handleClose(false)}>
              cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal title={`Edit Customer`} visible={isEditCustomer} onCancel={() => setIsEditCustomer(false)} footer={null}>
        <Form
          form={customerForm}
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
            className='mt-6'
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            <Button type="primary" htmlType="submit">
              Save
            </Button>
            <Button type="ghost">
              cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <ProductCreationModal handleUpdatedInfo={(value) => handleUpdatedInfo(value)} productInfo={productObj} thirdParty={true} isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible} />
    </div >

  );
};
const NewPaymentModal = ({ isVisit, handleClose }) => {
  const dispatch = useDispatch();
  const { id: currentUserId } = JSON.parse(localStorage.auth)
  const [newPayment] = useForm();
  const [customerForm] = useForm();
  const [currentFile, setCurrentFile] = useState();
  const [newCustomer, setNewCustomer] = useState(``);
  const [productCategories, setProductCategories] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [isEditCustomer, setIsEditCustomer] = useState(false)
  const [isNewCustomer, setIsNewCustomer] = useState(false)
  const [updateCustomerInfo, setUpdateCustomerInfo] = useState(false);
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const [totalAllAmount, setTotalAllAmount] = useState(0);
  const [totalPredienteAmount, setTotalPredienteAmount] = useState(0);
  const [totalPreviousAmount, setTotalPreviousAmount] = useState(0);
  const saveData = (values) => {
    console.log(values, 'values', selectedCustomerId);
    const result = Object.values(values).filter(obj => typeof obj === `object`);
    console.log(result);
    if (selectedCustomerId) {
      const customer_id = selectedCustomerId;
      const saveData = result.map((obj) => {
        return { reserva_id: obj?._id, amount: obj?.paid_amount }
      })
      const jsonData = [{ customer_id, user_id: currentUserId, reservation: saveData }]
      const formData = new FormData();
      console.log('%cfrontend\src\pages\Reservations.jsx:1371 imageUrl', 'color: #007acc;', imageUrl);
      formData.append('_file', imageUrl);
      formData.append('bulkData', JSON.stringify(jsonData));
      dispatch(crud.upload({ entity: `paymentHistory`, jsonData: formData }));
      // dispatch(crud.listByCustomerContact({ entity, jsonData: { parent_id: parentId } }));
      handleClose(false)
    }
  }
  const onFinishFailed = () => { }
  const handleSearch = (values) => {
    setNewCustomer(values);
  }

  const [originProductCategories, setOriginProductCategories] = useState([]);
  const getProductCategories = async () => {
    const { result } = await request.list({ entity: `productCategories` });
    setOriginProductCategories(result)
    setProductCategories(result || [])
  };
  const getCustomerData = async () => {
    const { result } = await request.list({ entity: `client` });

    setCustomerData(result || [])
  };
  const getReservations = async () => {
    const { result } = await request.list({ entity });
    setReservations(result || [])
  };
  useEffect(() => {
    if (isVisit) {
      getProductCategories();
      getCustomerData();
      getReservations();
      newPayment.resetFields();
    }
  }, [isVisit]);
  const onFinish = async (values) => {
    if (isNewCustomer) {
      await request.create({ entity: "client", jsonData: values });
      setTimeout(async () => {
        await getCustomerData()
      }, 500);

    } else {
      if (selectedCustomerId) {
        values[`_id`] = selectedCustomerId
        dispatch(crud.update({ entity: 'client', id: selectedCustomerId, jsonData: values }));
        setTimeout(async () => {
          await getCustomerData()
        }, 500)
      }
    }
    setIsEditCustomer(false);
  }
  const [selectedCustomerId, setSelectedCustomerId] = useState();
  const [productList, setProductList] = useState([]);

  const [reservations, setReservations] = useState([]);
  const [paymentHistories, setPaymentHistories] = useState([])
  const getPaymentHistories = async (customer_id) => {
    const { result } = await request.listById({ entity: 'paymentHistory', jsonData: { customer_id } });
    setPaymentHistories(result || []);
  }
  const editCustomer = (status = false) => {
    if (status) {
      console.log(newCustomer, 'newCustomer');
      setIsNewCustomer(true);
      customerForm.resetFields();
      customerForm.setFieldsValue({ name: newCustomer });
    }
    else {
      setIsNewCustomer(false)
      const customerInfo = newPayment.getFieldsValue();
      setSelectedCustomerId(customerInfo?.name);
      console.log(customerInfo, 'customerInfo');
      const customerName = customerData.find(obj => obj._id === customerInfo.name)
      customerForm.setFieldsValue({ ...customerInfo, name: customerName?.name })
    }
    setIsEditCustomer(true)
  }
  const handleProductList = async (customer_id) => {
    const { result: reservations } = await request.listById({ entity, jsonData: { parent_id: customer_id, status: 1 } });
    const { result: paymentHistories } = await request.listById({ entity: 'paymentHistory', jsonData: { customer_id } });
    var total_amount = 0, pending_amount = 0, newPayments = [], prev_amount = 0;
    for (var i = 0; i < [...reservations].length; i++) {
      var obj = { ...reservations[i] };
      for (var j = 0; j < [...paymentHistories].length; j++) {
        var payObj = { ...paymentHistories[j] };
        for (var l = 0; l < payObj?.reservation?.length; l++) {
          var _obj = payObj?.reservation[l];
          if (obj?._id === _obj?.reserva_id?._id) {
            obj[`paid_amount`] = parseFloat(obj[`paid_amount`]) + parseFloat(_obj?.amount);
          }
        }

      }
      obj[`pending_amount`] = parseFloat(obj[`product_price`]) - parseFloat(obj[`paid_amount`])
      total_amount += parseFloat(obj?.product_price || 0) || 0
      pending_amount += parseFloat(obj?.product_price - obj?.paid_amount) || 0;
      prev_amount += parseFloat(obj?.paid_amount);
      newPayments.push({ ...obj })
    }
    setTotalPreviousAmount(prev_amount)
    setProductList([...newPayments])
    setTotalAllAmount(total_amount);
    setTotalPredienteAmount(pending_amount)

  }
  useEffect(() => {
    if (selectedCustomerId) {
      getPaymentHistories(selectedCustomerId);
      handleProductList(selectedCustomerId)
      const filteredObj = customerData.find(obj => obj._id === selectedCustomerId);
      newPayment.setFieldsValue({ email: filteredObj?.email, iguser: filteredObj?.iguser, phone: filteredObj?.phone, customer_name: filteredObj?.name, customer_id: filteredObj?._id });
    }
  }, [customerData, updateCustomerInfo, selectedCustomerId, newPayment, reservations]);


  const [imageUrl, setImageUrl] = useState('')
  const handlePaste = (event) => {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    setCurrentFile(event.clipboardData.files[0]);
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();

        // You can use the blob data to display the image or upload it to your server
        // For simplicity, we are displaying the image directly in the browser

        const reader = new FileReader();
        reader.onload = (e) => {
          console.log(e.target)
          const imageUrl = e.target.result;
          setImageUrl(imageUrl);
          // Display the image (you can also upload it to a server at this point)
        };
        reader.readAsDataURL(blob);
      }
    }
  }
  return (
    <>
      <Modal title={`New Payments`} visible={isVisit} onCancel={() => handleClose(false)} width={800} footer={null}>
        <Form
          className="ant-advanced-search-form"
          form={newPayment}
          name="basic"
          layout="vertical"
          wrapperCol={{
            span: 16,
          }}
          onFinish={saveData}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Row onPaste={handlePaste}>
            <Col span={6}>
              <Form.Item
                name={'name'}
                wrapperCol={24}
                label="Name"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Select
                  onSearch={handleSearch}
                  showSearch
                  optionFilterProp="children"
                  suffixIcon={<EditOutlined onClick={() => editCustomer(false)} />}

                  onChange={(customer_id) => {
                    setSelectedCustomerId(customer_id)
                    const filteredObj = customerData.find(obj => customer_id === obj?._id)
                    newPayment.setFieldsValue({ email: filteredObj?.email, iguser: filteredObj?.iguser, phone: filteredObj?.phone, customer_name: filteredObj?.name, customer_id: filteredObj?._id });
                  }}
                  notFoundContent={<Button type="primary" onClick={(e) => editCustomer(true)}>
                    Create
                  </Button>}
                >
                  {customerData.map((optionField) => (
                    <Select.Option
                      key={optionField[`_id`]}
                      value={optionField[`_id`]}
                    >
                      {optionField[`name`]}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name={'email'}
                label="Email"
                wrapperCol={24}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Select
                  showSearch
                  optionFilterProp="children"
                  suffixIcon={<EditOutlined onClick={() => editCustomer(false)} />}
                  onChange={(customer_id) => {
                    console.log(customer_id);
                    setSelectedCustomerId(customer_id)
                    const filteredObj = customerData.find(obj => customer_id === obj?._id)
                    newPayment.setFieldsValue({ email: filteredObj?.email, iguser: filteredObj?.iguser, phone: filteredObj?.phone, customer_name: filteredObj?.name, customer_id: filteredObj?._id, name: filteredObj?._id });
                  }}
                >
                  {customerData.map((optionField) => (
                    <Select.Option
                      key={optionField[`_id`]}
                      value={optionField[`_id`]}
                    >
                      {optionField[`email`]}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name={'phone'}
                label="Phone"
                wrapperCol={24}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Select
                  showSearch
                  optionFilterProp="children"
                  onChange={(customer_id) => {
                    setSelectedCustomerId(customer_id)
                    const filteredObj = customerData.find(obj => customer_id === obj?._id)
                    newPayment.setFieldsValue({ email: filteredObj?.email, iguser: filteredObj?.iguser, phone: filteredObj?.phone, customer_name: filteredObj?.name, customer_id: filteredObj?._id, name: filteredObj?._id });
                  }}
                  suffixIcon={<EditOutlined onClick={() => editCustomer(false)} />}
                >
                  {customerData.map((optionField) => (
                    <Select.Option
                      key={optionField[`_id`]}
                      value={optionField[`_id`]}
                    >
                      {optionField[`phone`]}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name={'iguser'}
                wrapperCol={24}
                label="IG"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Select
                  showSearch
                  onChange={(customer_id) => {
                    setSelectedCustomerId(customer_id)
                    const filteredObj = customerData.find(obj => customer_id === obj?._id)
                    newPayment.setFieldsValue({ email: filteredObj?.email, iguser: filteredObj?.iguser, phone: filteredObj?.phone, customer_name: filteredObj?.name, customer_id: filteredObj?._id, name: filteredObj?._id });
                  }}
                  optionFilterProp="children"
                  suffixIcon={<EditOutlined onClick={() => editCustomer(false)} />}
                >
                  {customerData.map((optionField) => (
                    <Select.Option
                      key={optionField[`_id`]}
                      value={optionField[`_id`]}
                    >
                      {optionField[`iguser`]}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {productList.map((obj, name) => (
              <>
                <Row style={{ display: 'flex', justifyContent: "space-around", width: '80%' }}>
                  <Col span={4}>
                    <Form.Item
                      wrapperCol={24}
                      name={[name, 'payment_name']}
                      label={!name && "Product"}
                    >
                      <label>{obj?.product_name?.category_name}</label>
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      name={[name, 'paid_amount']}
                      label={!name && "Paid"}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        console.log(newValue, `newValue`);
                        if (newValue) {
                          const pending_amount = parseFloat(obj?.product_price || 0) - parseFloat(newValue) - parseFloat(obj?.paid_amount || 0);
                          productList[name][`pending_amount`] = pending_amount;
                          setProductList([...productList]);
                          var tota_prediente = 0;
                          for (var i = 0; i < [...productList].length; i++) {
                            var _obj = { ...productList[i] };
                            tota_prediente += parseFloat(_obj?.pending_amount || 0)
                          }
                          setTotalPredienteAmount(tota_prediente);

                          const formData = newPayment.getFieldsValue();
                          const result = Object.values(formData).filter(obj => typeof obj === `object`);
                          var sumPaidAmount = 0;
                          result.map((obj) => {
                            sumPaidAmount += parseFloat(obj?.paid_amount) || 0
                          });
                          setTotalPaidAmount(sumPaidAmount);
                        } else {
                          productList[name][`pending_amount`] = false;
                          setProductList([...productList])
                        }
                      }}
                      rules={[
                        {
                          validator: ({ field }, paid_amount,) => {
                            const pending_amount = obj?.pending_amount;
                            console.log(pending_amount, `pending_amount`);
                            if (pending_amount < 0) {
                              return Promise.reject(`You can't enter that amount`);
                            }
                            return Promise.resolve();
                          },
                        }
                      ]}
                    >
                      <Input prefix="$" />
                    </Form.Item>
                  </Col >
                  <Col span={4}>
                    <Form.Item
                      name={[name, 'total_amount']}
                      label={!name && "Total"}
                    >
                      <label>${obj?.product_price}</label>
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      name={[name, 'prediente']}
                      label={!name && "Pending"}
                    >
                      <label>${obj?.pending_amount || 0.00}</label>
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      name={[name, 'Previous']}
                      label={!name && "Previous"}
                    >
                      <label>${obj?.paid_amount || 0.00}</label>
                    </Form.Item>
                    <Form.Item
                      name={[name, '_id']}
                      style={{ display: `none` }}
                      initialValue={obj?._id}
                    >
                      <Input value={obj?._id} />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      name={[name, 'method']}
                      label={!name && "Method"}
                    >
                      <label>{obj?.method?.method_name}</label>
                    </Form.Item>
                    {/* <Form.Item
                      name={[name, '_id']}
                      style={{ display: `none` }}
                      initialValue={obj?._id}
                    >
                      <Input value={obj?._id} />
                    </Form.Item> */}
                  </Col>
                  {
                    productList.length === name + 1 && (
                      <>
                        <Col span={6}>
                          Total Payment
                        </Col>
                        <Col span={6}>
                          ${totalPaidAmount || 0.00}
                        </Col>
                        <Col span={4}>
                          ${totalAllAmount || 0.00}
                        </Col>
                        <Col span={4}>
                          ${totalPredienteAmount || 0.00}
                        </Col>
                        <Col span={4}>
                          ${totalPreviousAmount || 0.00}
                        </Col>
                      </>
                    )
                  }
                </Row>
                {productList.length === name + 1 && <Row style={{ display: 'flex', justifyContent: "space-around", width: '20%', height: '100%' }}>
                  <img src={imageUrl} width="100%" height='100%' alt='' />
                </Row>}
              </>
            ))}
          </Row>

          <Form.Item
            className='mt-6'
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            <Button type="primary" htmlType="submit">
              Save
            </Button>
            &nbsp;
            <Button type="ghost" onClick={() => { handleClose(false) }}>
              cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal >
      <Modal title={`Edit Customer`} visible={isEditCustomer} onCancel={() => setIsEditCustomer(false)} footer={null}>
        <Form
          form={customerForm}
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
            className='mt-6'
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            <Button type="primary" htmlType="submit">
              Save
            </Button>
            <Button type="ghost" onClick={() => { handleClose(false) }}>
              cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>

  );
};

