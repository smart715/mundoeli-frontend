/* eslint-disable jsx-a11y/img-redundant-alt */
import { DashboardLayout, } from '@/layout';
import { CloseCircleOutlined, CloseOutlined, DeliveredProcedureOutlined, EditOutlined, EyeOutlined, FolderViewOutlined, } from '@ant-design/icons';
import { Button, Col, DatePicker, Form, Input, Layout, Modal, PageHeader, Popconfirm, Row, Select, Statistic, Table, Tag, Typography, Upload, Image } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { selectListItems, } from '@/redux/crud/selectors';
import { request } from '@/request';
import { useForm } from 'antd/lib/form/Form';
import SelectAsync from '@/components/SelectAsync';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import TextArea from 'antd/lib/input/TextArea';
import moment from 'moment';
import history from '@/utils/history';
import { dateFormat, dateTimeFormat, priceFormat } from './common';
import _ from 'lodash';
import { UPLOAD_URL } from '@/config/serverApiConfig';
const { id: currentUserId } = JSON.parse(localStorage.auth)
const entity = "paymentHistory"

const PaymentManagement = () => {
  const searchFields = 'name,email';
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState();
  const [isPayment, setIsPayment] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [periods, setPeriods] = useState(null);
  const [paymentDetailTitle, setPaymentDetailTitle] = useState('');
  const dispatch = useDispatch();
  const finishCancel = () => {
    if (currentId) {
      const id = currentId;
      const jsonData = { status: -1, cancel_commit: cancelCommit }
      dispatch(crud.update({ entity, id, jsonData }));
      setTimeout(() => {
        dispatch(crud.list({ entity }))
      }, [500]);
      setIsCancelModal(false)
      history.push('/payments')
    }
  }
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
  const { company_id: company_id } = JSON.parse(localStorage?.auth)
  const { is_admin: is_admin } = JSON.parse(localStorage?.auth)
  const [showTable, setShowTable] = useState(false)

  const isEditing = (record) => record._id === editingKey;
  const columns = [
    {
      title: 'Id',
      dataIndex: 'payment_id',
      width: '15%',
      render: (id) => {
        return <label>P{id}</label>
      }
    },
    {
      title: 'Date',
      dataIndex: 'created',
      width: '15%',
      render: (created) => {
        return dateTimeFormat(created);
      }
    },
    {
      title: 'Total',
      dataIndex: `total_amount`,
      width: '15%',
      render: (data) => {
        return priceFormat(data)
      }
    },
    {
      title: 'From',
      dataIndex: [`customer_id`, 'name'],
      width: '15%',
      render: (customer, record) => {
        if (customer) {
          return <label onClick={() => history.push(`/customer/details/${record?.customer_id?._id}`)}>{customer}</label>
        }
        return "Store Sales"
      }
    },
    {
      title: 'By',
      dataIndex: [`user_id`, 'name'],
      width: '15%',
    },
    {
      title: 'Actions',
      render: (_, record) => {
        return (
          <>
            <Typography.Link onClick={() => viewPaymentDetails(record)}>
              <EyeOutlined style={{ fontSize: "15px" }} />
            </Typography.Link>
            {console.log('%cfrontend\src\pages\PaymentManagement.jsx:121 record', 'color: #007acc;', is_admin)}

            {(is_admin == true || company_id == record?.user_id?.company_id) && record.status === 1 ?
              <Popconfirm title="Sure to Cancelled?" onConfirm={() => cancelPayment(record)}>
                <CloseOutlined style={{ fontSize: "15px" }} />
              </Popconfirm> : null
            }
            {record?.status === -1 &&
              <span className='badge badge-light-danger'>Cancelled</span>
            }
          </>
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
  const { result: Items, isLoading: listIsLoading } = useSelector(selectListItems);
  const { pagination, items } = Items;
  const [paginations, setPaginations] = useState(pagination)
  const [initItems, setInitItems] = useState([]);
  useEffect(() => {

    dispatch(crud.resetState());
    dispatch(crud.list({ entity }));
    document.title = "Payments"
  }, [dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { result: items, pagination } = await request.list({ entity });
        setInitItems(items);
        setPaginations(pagination);
        const { result } = await request.list({ entity: `logHistory` });
        console.log("items", items);
        for (var i = 0; i < items.length; i++) {
          const sum = _.sumBy(items[i]?.reservation, obj => parseFloat(obj.reserva_id.status !== -1 ? obj.amount : 0 || 0));
          const sum_order = _.sumBy(items[i]?.orders, obj => parseFloat(obj.product_price * obj.count));
          items[i]['total_amount'] = sum + sum_order + items[i].tax_price;
          for (var j = 0; j < result.length; j++) {
            if (items[i].status === -1 && items[i]._id === result[j].log_id) {
              items[i][`notes`] = result[j][`description`];
            }
          }
        }
        const filtered_items = items.filter(obj => obj.total_amount > 0);
        setFilterData(filtered_items);
        setDataSource(filtered_items);
      } catch (error) {
        // Handle error state
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    document.title = "Payments";
  }, []);
  useEffect(() => {

    if (periods) {
      const [startDate, endDate] = periods
      const format = 'MM-DD-YYYY';
      const filteredData = dataSource.filter(item => {
        const itemDate = moment(new Date(item.created), format).format(format);
        const _start = moment(new Date(startDate), format).format(format);
        const _end = moment(new Date(endDate), format).format(format);
        const flag = moment(itemDate).isBetween(moment(_start), moment(_end), null, '[]');
        return flag
      });
      setFilterData(filteredData);
    }
  }, [dataSource, periods])

  const [isOpen, setIsOpen] = useState(false)
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
  const [cancelCommit, setCancelCommit] = useState(``);

  const getPaymentHistories = async (item) => {
    const { result } = await request.listById({ entity: 'paymentHistory', jsonData: { reserva_id: item?._id } });
    setPaymentHistories(result || [])
  }
  const editItem = (item) => {
    setIsEditReserva(true);
    setCurrentId(item?._id);
    getPaymentHistories(item)
    _editForm.setFieldsValue({ ...item, product_name: item.product_name._id, product_type: item.product_type._id, pending_amount: (item.product_price - item.paid_amount), name: item?.parent_id?.name, email: item?.parent_id?.email, iguser: item?.parent_id?.iguser })

  }
  const [detailForm] = useForm();
  const [paymentDetails, setPaymentDetails] = useState({
    name: '',
    phone: '',
    payment_method: 'Cash',
    date: ''
  });
  const [reservations, setReservations] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [isCheckout, setIsCheckout] = useState(false);
  const [subTotalAmount, setSubTotalAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [totalAmountWithTax, setTotalAmountWithTax] = useState(0)
  const [cashAmount, setCashAmount] = useState(0)
  const [selectedPayment, setSelectedPayment] = useState()
  const viewPaymentDetails = async (item) => {
    setSelectedPayment(item);
    console.log(item, 4);
    setPaymentDetails({
      name: item?.customer_id?.name,
      phone: item?.customer_id?.phone,
      payment_method: 'Cash',
      status: item?.status,
      date: dateFormat(item?.created)
    });
    setPaymentDetailTitle(`Payment | P${item?.payment_id} | ${item?.user_id?.name}`);
    if (item?.checkout) {
      setIsCheckout(true)
      setPaymentAmount(0);
      setTotalAmount(0);
      setPendingAmount(0);
      setSubTotalAmount(item?.sub_total);
      setTaxAmount(item?.tax_price)
      setTotalAmountWithTax(item?.order_price);
      setCashAmount(item?.cash_amount);
      setPaymentDetails({
        name: item?.customer_id?.name,
        phone: item?.customer_id?.phone,
        payment_method: item?.method_id?.method_name,
        status: item?.status,
        date: dateFormat(item?.created)
      });

      console.log("-item--", item);
      let processedPayments = [].concat(...item.orders.map(order => {
        return {
          companyName: order._id.product_type.company_name.company_name,
          date: moment(item.created).format('DD/MM/YY hh:mm:ss A'),
          productName: order._id.product_name,
          productPrice: order.product_price,
          productType: order._id.product_type.product_name,
          sourceId: 'P' + item.payment_id,
          customerName: item.customer_id?.name ? item.customer_id?.name : 'checkout',
          deduction: item.method_id?.method_name + "-$" + parseFloat(order._id.product_price * order.count * (item.method_id?.deduction ? item.method_id?.deduction : 0) / 100).toFixed(2),
          mPayment: '$' + parseFloat(item.order_price / item.sub_total * order._id.product_price * order.count).toFixed(2),
          count: order.count
        };
      }));
      processedPayments = processedPayments.concat(...item.reservation.map(reserver => {
        return {
          companyName: reserver.reserva_id?.product_type?.company_name.company_name,
          date: moment(reserver.reserva_id?.delivered_date).format('DD/MM/YY hh:mm:ss A'),
          productName: reserver.reserva_id?.product_name.category_name,
          productPrice: reserver.amount,
          productType: reserver.reserva_id?.product_type.product_name,
          sourceId: 'R' + reserver.reserva_id?.reserva_id,
          customerName: item.customer_id?.name,
          deduction: reserver.reserva_id?.method.method_name + "-$" + parseFloat(reserver.amount * (reserver.reserva_id?.method.deduction ? reserver.reserva_id?.method.deduction : 0) / 100).toFixed(2),
          mPayment: '$' + reserver.amount,
          count: -1
        };
      }));
      console.log("-orderList--", processedPayments);
      setReservations(processedPayments);
    } else {
      setIsCheckout(false)
      setPaymentDetails({
        name: item?.customer_id?.name,
        phone: item?.customer_id?.phone,
        payment_method: 'Cash',
        status: item?.status,
        date: dateFormat(item?.created)
      });
      const _total = _.sumBy(item?.reservation, obj => parseFloat(obj?.reserva_id?.product_name?.product_price));
      const _payment = _.sumBy(item?.reservation, obj => parseFloat(obj?.amount));
      const _pending = _total - _payment;
      setPaymentAmount(_payment);
      setTotalAmount(_total);
      setPendingAmount(_pending);
      setReservations(item?.reservation);
    }
    setImageUrl(item?.filename)
    const currentId = item?._id;
    const jsonData = { log_id: currentId, where_: "reserva" }
    const { result: logData } = await request.listById({ entity: "logHistory", jsonData });
    setLogHistories(logData)
    setIsLogHistory(true)
  }
  const cancelPayment = (item) => {
    setIsCancelModal(true);
    setCurrentId(item?._id)
  }
  const changePeriods = (periods) => {
    if (periods) setPeriods(periods);
    else setFilterData(dataSource)
  }

  return (
    <DashboardLayout>
      <PageHeader title="Payments" onBack={() => { window['history'].back() }}
        extra={
          <Button type='primary' onClick={() => history.push('/checkout')} >New sale</Button>
        }
      ></PageHeader>
      <Layout>
        <Layout>
          <Row gutter={24} style={{ textAlign: 'right' }}>
            <DatePicker.RangePicker onCalendarChange={(value) => changePeriods(value)} defaultValue={[moment().subtract(7, 'days'), moment()]} />
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
              loading={isLoading}
              pagination={{
                total: filterData.length,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                defaultPageSize: 10, // Set the default page size
              }}
            // footer={Footer}
            />
          </Form>
          <Modal title={<span>{paymentDetailTitle} &nbsp;
            {paymentDetails?.status === -1 && <span className='badge badge-light-danger'>Cancelled</span>} </span>} footer={null} onCancel={() => setIsLogHistory(false)} open={isLogHistory} width={700}>
            <Form layout="vertical" className='row bold-form' form={detailForm}>
              <div className="col-3">
                <Form.Item name={'name'} label="Name">
                  <label>{paymentDetails?.name}</label>
                </Form.Item>
              </div>
              <div className="col-3">
                <Form.Item name={'phone'} label="Phone">
                  <label>{paymentDetails?.phone}</label>
                </Form.Item>
              </div>
              <div className="col-3">
                <Form.Item name={'date'} label="Date">
                  <label>{paymentDetails?.date}</label>
                </Form.Item>
              </div>
              <div className="col-3">
                <Form.Item name={'payment_method'} label="Payment Method">
                  <label>{paymentDetails?.payment_method}</label>
                </Form.Item>
              </div>
            </Form>
            <h3>Payment Details</h3>
            <div className="row">
              {!isCheckout &&
                <>
                  <div className="w-75">
                    {reservations.map((obj, index) =>
                    (
                      <Form layout="vertical" className='row bold-form' form={detailForm}>
                        <div className="col-3">
                          <Form.Item name={'company'} label={!index && "Company"}>
                            <label>{obj?.reserva_id?.product_type?.company_name?.company_name}</label>
                          </Form.Item>
                        </div>
                        <div className="col-3">
                          <Form.Item name={'product'} label={!index && "Product"}>
                            <label>{obj?.reserva_id?.product_name?.category_name}</label>
                          </Form.Item>
                        </div>
                        <div className="col-2">
                          <Form.Item name={'payment'} label={!index && "Payment"}>
                            <label>${priceFormat(obj?.amount)}</label>
                          </Form.Item>
                        </div>
                        <div className="col-2">
                          <Form.Item name={'total'} label={!index && "Total"}>
                            <label>${priceFormat(obj?.reserva_id?.product_name?.product_price)}</label>
                          </Form.Item>
                        </div>
                        <div className="col-2">
                          <Form.Item name={'pending'} label={!index && "Pending"}>
                            <label>${priceFormat(parseFloat(obj?.reserva_id?.product_name?.product_price) - parseFloat(obj?.amount))}</label>
                          </Form.Item>
                        </div>
                      </Form>
                    ))}
                  </div>
                  <div className="w-25">
                    {imageUrl &&
                      <Image src={`${UPLOAD_URL}reservation/${imageUrl}`} width="100%" height="100%" alt="Upload Image" />}
                  </div>
                  <div className='w-75'>
                    <Form layout="vertical" className='row' form={detailForm}>
                      <div className="col-6">
                        <Form.Item>
                          <label>Total Payment</label>
                        </Form.Item>
                      </div>
                      <div className="col-2">
                        <Form.Item>
                          <label className='text text-primary'>${priceFormat(paymentAmount)}</label>
                        </Form.Item>
                      </div>
                      <div className="col-2">
                        <Form.Item>
                          <label>${priceFormat(paymentAmount)}</label>
                        </Form.Item>
                      </div>
                      <div className="col-2">
                        <Form.Item>
                          <label>${priceFormat(paymentAmount)}</label>
                        </Form.Item>
                      </div>
                    </Form>
                  </div>
                  <div>
                  </div>
                </>
              }
              {isCheckout &&
                <>
                  <div className="w-75">
                    {reservations.map((obj, index) =>
                    (
                      <Form layout="vertical" className='row bold-form' form={detailForm}>
                        <div className="col-3">
                          <Form.Item name={'company'} label={!index && "Company"}>
                            <label>{obj?.companyName}</label>
                          </Form.Item>
                        </div>
                        <div className="col-3">
                          <Form.Item name={'product'} label={!index && "Product"}>
                            <label>{obj?.productName}</label>
                          </Form.Item>
                        </div>
                        <div className="col-3">
                          <Form.Item name={'price'} label={!index && "Price"}>
                            <label>${priceFormat(obj?.productPrice)}</label>
                          </Form.Item>
                        </div>
                        <div className="col-3">
                          <Form.Item name={'count'} label={!index && "count"}>
                            <label>
                              {obj?.count !== -1 ? obj?.count : <span className='badge badge-light-danger'>Pending</span>}

                            </label>
                          </Form.Item>
                        </div>
                      </Form>
                    ))}
                  </div>
                  <div className="w-25">
                    <Form layout="horizontal" className='row'>
                      <div className="col-12">
                        <Form.Item className="my-0" name={'sub_total'} label={"Sub Total"}>
                          <label className='text text-primary'>${priceFormat(subTotalAmount)}</label>
                        </Form.Item>
                      </div>
                      <div className="col-12">
                        <Form.Item className="my-0" name={'taxs'} label={"Taxes"}>
                          <label className='text text-info'>${priceFormat(taxAmount)}</label>
                        </Form.Item>
                      </div>
                      <div className="col-12">
                        <Form.Item className="my-0" name={'total'} label={"Total"}>
                          <label className='text text-success'>${priceFormat(totalAmountWithTax)}</label>
                        </Form.Item>
                      </div>
                      {
                        paymentDetails?.payment_method?.toLowerCase() === 'cash' &&
                        <div className="col-12">
                          <Form.Item className="my-0" name={'cash_amount'} label={"Payment"}>
                            <label className='text text-nomarl'>${priceFormat(cashAmount)}</label>
                          </Form.Item>
                          <Form.Item className="my-0" name={'exchange'} label={"Exchange"}>
                            <label className='text text-nomarl'>${priceFormat(cashAmount - totalAmountWithTax)}</label>
                          </Form.Item>
                        </div>
                      }
                    </Form>
                  </div>
                </>
              }
            </div>
            {
              selectedPayment?.status === -1 &&
              <div className="row">
                <div className="col-2">
                  <h5>Commit : </h5>
                </div>
                <div className="col-10">
                  <label>{selectedPayment?.cancel_commit}</label>
                </div>
              </div>
            }

          </Modal>
          <Modal title={`Please input your comment before cancel.`} onOk={finishCancel} onCancel={() => setIsCancelModal(false)} open={isCancelModal}>
            <Form>
              <Form.Item>
                <TextArea onChange={(e) => setCancelCommit(e?.target?.innerHTML)} />
              </Form.Item>
            </Form>
          </Modal>
        </Layout>
      </Layout>
    </DashboardLayout>
  );
};
export default PaymentManagement;

