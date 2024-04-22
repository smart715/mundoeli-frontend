import { DashboardLayout, } from '@/layout';
import { AliwangwangOutlined, EyeOutlined, LeftOutlined, RightOutlined, SafetyOutlined, SearchOutlined, SkinOutlined, StopOutlined, TeamOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Form, Input, Layout, Modal, Popconfirm, Popover, Radio, Row, Select, Table, Tabs, Typography, message } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { crud } from '@/redux/crud/actions';
import { request } from '@/request';
import moment from 'moment';
import SelectAsync from '@/components/SelectAsync';
import Checkbox from 'antd/lib/checkbox/Checkbox';

const getBusinessDays = (year, month) => {
  const startDate = 1;
  const endDate = new Date(year, month, 0).getDate();
  let businessDays = 0;
  for (let date = startDate; date <= endDate; date++) {
    if (new Date(year, month - 1, date).getDay() !== 0) {
      businessDays++;
    }
  }
  console.log(year, 'year,month', month, businessDays);

  return businessDays;
}
const getWorkDays = (year, month, days) => {
  const startDate = 1;
  const endDate = new Date(year, month, days).getDate();
  let businessDays = 0;
  for (let date = startDate; date <= endDate; date++) {
    if (new Date(year, month - 1, date).getDay() !== 0) {
      businessDays++;
    }
  }
  console.log(year, 'year,month', month, businessDays);

  return businessDays;
}


const VisitControl = () => {
  const entity = "visitControl"
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isInspectionModal, setIsInspectionModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterData, setFilterData] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [rangeDate] = useState();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentFile, setCurrentFile] = useState();
  const visitType = [
    '',
    <TeamOutlined />,
    <SkinOutlined />,
    <SafetyOutlined />,
  ]
  const visitLabel = [
    '',
    'Visit',
    'Products',
    'Inspection',
  ]
  const { id: currentUserId, role } = JSON.parse(localStorage.auth)
  const formattedDateFunc = (date) => {
    return moment(date).format("MM/DD/YYYY")
  }
  const showModal = () => {
    setCurrentId(new Date().valueOf())
    setIsModalVisible(true);
    setIsUpdate(false);

    if (formRef.current) {
      console.log(tabsStatus, 'tabsStatustabsStatus')
      // formRef.current.resetFields();
      formRef.current.setFieldsValue({
        type: parseInt(tabsStatus)
      })
    }
  };
  const dispatch = useDispatch();
  const handleOk = () => {
    setIsModalVisible(false);
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const [typeOptions, setTypeOptions] = useState([
    {
      value: 3,
      label: "Inspection",
    },
    {
      value: 2,
      label: "Products"
    },
    {
      value: 1,
      label: "Visit"
    },
  ])
  const [customerStores, setCustomerStores] = useState([]);
  const [globalData, setGlobalData] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [changeStatus, setChangeStatus] = useState(false);
  const [changedMonth, setChangedMonth] = useState([]);
  const [form] = Form.useForm();
  const [currentId, setCurrentId] = useState('');
  const [paginations, setPaginations] = useState([])
  const [visitContols, setVisitControls] = useState([]);
  const [isHistory, setIsHistory] = useState(false);
  const [historyData, setHistoryData] = useState([])
  const [reportData, setReportData] = useState([]);
  const [typeValue, setTypeValue] = useState(3);
  const [tabsStatus, setTabStatus] = useState(3);
  const [visitTypeValue, setVisitTypeValue] = useState(3);
  const [isClientStore, setIsClientStore] = useState(false);
  const [customerStore, setCustomerStore] = useState([]);
  const [rowClass, setRowClass] = useState("inspection_background")
  const content = (
    <table style={{
      tableLayout: 'fixed',
      width: '200px',
      textAlign: 'center',
      borderCollapse: 'collapse',
      cursor: 'pointer'
    }}
      className='_months'
    >
      <thead></thead>
      <tbody>
        <tr>
          <td onClick={(e) => { selectMonthAndActive(e, 1) }}>Jan</td>
          <td onClick={(e) => { selectMonthAndActive(e, 2) }}>Feb</td>
          <td onClick={(e) => { selectMonthAndActive(e, 3) }}>Mar</td>
        </tr>
        <tr>
          <td onClick={(e) => { selectMonthAndActive(e, 4) }}>Apr</td>
          <td onClick={(e) => { selectMonthAndActive(e, 5) }}>May</td>
          <td onClick={(e) => { selectMonthAndActive(e, 6) }}>Jun</td>
        </tr>
        <tr>
          <td onClick={(e) => { selectMonthAndActive(e, 7) }}>Jul</td>
          <td onClick={(e) => { selectMonthAndActive(e, 8) }}>Aug</td>
          <td onClick={(e) => { selectMonthAndActive(e, 9) }}>Sep</td>
        </tr>
        <tr>
          <td onClick={(e) => { selectMonthAndActive(e, 10) }}>Oct</td>
          <td onClick={(e) => { selectMonthAndActive(e, 11) }}>Nov</td>
          <td onClick={(e) => { selectMonthAndActive(e, 12) }}>Dec</td>
        </tr>
      </tbody>
    </table>
  );
  const selectMonthAndActive = (e, value) => {
    setCurrentMonth(value);
    const selectedElement = e.target;
    const activeTd = selectedElement.parentElement.parentElement.querySelector(".active-td");
    if (activeTd) {
      activeTd.style.background = ''
      activeTd.className = ''
    }
    selectedElement.className = 'active-td'
    selectedElement.style.background = '#3fe1fd'
  }
  const editItem = (item) => {
    if (item) {
      setIsClientStore(true)
      const { customer, store } = item;
      console.log(item)
      const { location, waze_location, products, spec } = store;
      setCustomerStore([{
        location: location,
        waze: <a target="_blank" rel='noreferrer' href={`https://waze.com/ul?ll=${waze_location || ''}&navigate=yes"`}>
          <AliwangwangOutlined style={{ fontSize: "20px" }} />
        </a>,
        products: products,
        spects: spec,
        key: 0
      }])
      const filteredData = visitContols.filter(({ customer: customer1, store: store1, visit_date }) =>
        customer._id === customer1._id && store._id === store1._id &&
        new Date(visit_date).getFullYear() === currentYear
        && new Date(visit_date).getMonth() === (currentMonth - 1)
      )
      filteredData.sort((a, b) => { return new Date(a.visit_date) - new Date(b.visit_date) })
      setHistoryData(filteredData)
      setCurrentId(item._id);
      // setIsHistory(true);
    }
  }

  const columns = [
    {
      title: 'Client(Branch)',
      dataIndex: ['customer', 'name'],
      width: 230,
      render: (text, { store, ...otherObj }) => {
        return (<label style={{ cursor: 'pointer' }} onClick={() => editItem({ store, ...otherObj })}>{text}({store.store})</label>)
      }
    },
    {
      title: 'T',
      dataIndex: 'store_visit_value',
      width: 50,
    },
    {
      title: 'R',
      dataIndex: 'visit_value',
      width: 50,
    },
    {
      title: 'P',
      dataIndex: 'difference',
      width: 50,
      render: (text, record) => {
        return ((parseFloat(record.store_visit_value) || 0) - (parseFloat(record.visit_value) || 0));
      }
    },
    // {
    //   title: 'INSU',
    //   dataIndex: ['store', 'insumos'],
    //   width: '15%',
    //   render: (_, record) => {
    //     const { store } = record;
    //     const { insumos } = store;
    //     return insumos ? "YES" : "NO"
    //   }

    // },
  ];

  const topColumn = [
    {
      title: "",
      width: 200,
      dataIndex: "report_title"
    },
    {
      title: "",
      width: 50,
      dataIndex: 'report_value'
    },
    {
      title: "",
      width: 0,
    },
    {
      title: "",
      width: 0,

    },
    {
      title: "..%...",
      width: 50,
      dataIndex: "report_percent",
      render: (text, record, index) => {
        const obj = {
          children: `${text}%`,
          props: {},
        };
        if (index === 0) {
          obj.props.rowSpan = 3;
        } else {
          obj.props.rowSpan = 0;
        }
        return obj;
      },
    },
  ]
  const visitColumn = [
    {
      title: "",
      width: 230,
      dataIndex: "report_title"
    },
    {
      title: "",
      width: 150,
      dataIndex: 'report_value'
    },
  ]
  const onFinish = async (values) => {


    values['by'] = currentUserId
    const { customer, visit_date, store } = values;
    const { result } = await request.listById({ entity: 'visitControl', jsonData: { customer: customer, store: store, visit_date: getDate(visit_date) } });
    values['visit_date'] = getDate(visit_date);
    if ((result && result.length) || moment().isBefore(visit_date)) {
      return message.error("can't you save on same date or future date ")
    }
    if (isUpdate && currentId) {
      const id = currentId;
      dispatch(crud.update({ entity, id, jsonData: values }));
    } else {
      // values["inspection_details"] = JSON.stringify(data)
      // const { result } = await request.create({ entity, jsonData: values });
      dispatch(crud.create({ entity, jsonData: values }));
    }
    formRef.current.resetFields();
    setTimeout(() => {
      dispatch(crud.resetState());
      dispatch(crud.list({ entity }));
    }, [400])
    handleCancel();
    setChangeStatus(!changeStatus);
  };
  const formRef = useRef(null);
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  useEffect(() => {
    const filteredData = globalData.filter((record) => {
      const { customer, store } = record;
      return (
        (!searchText || customer['name'].toString().toLowerCase().includes(searchText.toLowerCase()) ||
          store['store'].toString().toLowerCase().includes(searchText.toLowerCase()))
      );
    })
    setFilterData(filteredData);
    setPaginations({ current: 1, pageSize: 10, total: filteredData.length })
  }, [searchText, rangeDate, globalData])

  const handelDataTableLoad = useCallback((pagination) => {
    const { current, total } = pagination;

    console.log(pagination, 'pagination');
    setPaginations(pagination)
    return true;
  }, [filterData, searchText]);
  const closeModal = () => {
    setIsHistory(!isHistory);
  }
  const closeInspectionModal = () => {
    setIsInspectionModal(!isInspectionModal);
  }
  const prevData = () => {
    if (currentMonth === 1) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(12)
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }
  const nextData = () => {
    if (currentMonth === 12) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(1);
    }
    else {
      setCurrentMonth(currentMonth + 1);
    }
  }
  window._test = () => {
    const id = prompt("test")
    if (id) {
      dispatch(crud.delete({ entity, id }));
      setTimeout(() => {
        dispatch(crud.list({ entity }));
      }, 1000)
    }
  }

  useEffect(() => {
    typeOptions.map(type => {
      if (type.value == tabsStatus) {
        type.disabled = false;
      } else {
        type.disabled = true;
      }
    })
    console.log(typeOptions, tabsStatus);
  }, [
    tabsStatus, typeOptions
  ])
  useEffect(() => {

    async function init() {

      const startDay = 1;
      const endDay = new Date(currentYear, currentMonth, 0).getDate();
      const start_date = new Date(currentYear, currentMonth - 1, startDay);
      const end_date = new Date(currentYear, currentMonth - 1, endDay);
      let currentDate = moment(start_date);
      const end = moment(end_date);
      const daysColumns = [];

      let inspectionPerDate = {};
      let inspectionPerDate_ = {};
      let visitPerDate = {};
      let visitPerDate_ = {};
      var productPerDate = {};
      var productPerDate_ = {};
      while (currentDate.isSameOrBefore(end)) {
        const day = currentDate.format("DD")
        const year = currentDate.year();
        const month = currentDate.format("MM");
        daysColumns.push({
          title: `${currentDate.format("dddd").slice(0, 1).toUpperCase()} ${day}`,
          dataIndex: `day_${year}-${month}-${day}`,
          width: 50
        })
        inspectionPerDate[`day_${year}-${month}-${day}`] = 0;
        inspectionPerDate_[`day_${year}-${month}-${day}`] = 0;
        visitPerDate[`day_${year}-${month}-${day}`] = 0;
        visitPerDate_[`day_${year}-${month}-${day}`] = 0;
        productPerDate[`day_${year}-${month}-${day}`] = 0;
        productPerDate_[`day_${year}-${month}-${day}`] = 0;
        currentDate = currentDate.add(1, 'days');
      };
      setChangedMonth(daysColumns)

      var totalInspectionOnStores = 0;
      var totalMonthlyDeliver = 0;
      const { result: visitDatas } = await request.listById({ entity: "visitControl" });
      setVisitControls(visitDatas);
      const { result: customerStores } = await request.list({ entity: "customerStores" });
      setCustomerStores(customerStores)
      const storeData = customerStores.map(obj => {

        if (obj.insumos) {
          totalMonthlyDeliver += parseInt(obj.deliver) || 0
        }
        totalInspectionOnStores += parseInt(obj.inspection) || 0
        const { parent_id, ...otherObj } = obj;
        return {
          store: otherObj,
          customer: parent_id
        }
      })

      const fillteredData = visitDatas.filter(({ visit_date }) =>
      (
        new Date(visit_date).getFullYear() === currentYear
        && new Date(visit_date).getMonth() === (currentMonth - 1)
      )
      )

      storeData.map((obj, index) => {
        const { store, customer } = obj;
        const { deliver, inspection } = store;

        switch (parseInt(tabsStatus)) {
          case 1:
            obj['store_visit_value'] = 0;
            break;
          case 2:
            obj['store_visit_value'] = deliver || 0;

            break;
          case 3:
            obj['store_visit_value'] = inspection || 0;
            break;
          default:
            break;
        }
        obj['visit_value'] = 0;
        obj['key'] = index;
        fillteredData.map(data => {
          const { store: store1, customer: customer1, visit_date, type, status } = data;
          if (store._id === store1._id && customer._id === customer1._id) {
            if (status && type === parseInt(tabsStatus)) {
              obj[`day_${getDate(visit_date)}`] = visitType[type]
              obj['visit_value']++;

            }
          }
        })
      })
      var storeDataHasValue = [];
      console.log(storeData, '22222222222');

      switch (parseInt(tabsStatus)) {
        case 2:
          storeDataHasValue = storeData.filter(store => store.visit_value > 0 || store.store.deliver)
          break;
        case 3:
          storeDataHasValue = storeData.filter(store => store.visit_value > 0 || store.store.inspection)
          break;
        default:
          storeDataHasValue = storeData.filter(store => store.visit_value > 0)
          break;
      }
      setFilterData(storeDataHasValue)
      setGlobalData(storeDataHasValue)

      // I would like to display inspection data by user per day... ------start-----

      const today = new Date().getDate()
      fillteredData.map(item => {
        const { type, visit_date, status } = item
        if (status && type === 3) {
          Object.keys(inspectionPerDate).map(key => {
            if (key === `day_${getDate(visit_date)}`) {
              inspectionPerDate[`day_${getDate(visit_date)}`]++
            }
          })
        } else if (status && type === 1) {
          Object.keys(visitPerDate).map(key => {
            if (key === `day_${getDate(visit_date)}`) {
              visitPerDate[`day_${getDate(visit_date)}`]++
            }
          })
        }
        else if (status && type === 2) {
          Object.keys(productPerDate).map(key => {
            if (key === `day_${getDate(visit_date)}`) {
              productPerDate[`day_${getDate(visit_date)}`]++
            }
          })
        }
      })
      const totalInspection = getTotalInspection(inspectionPerDate)
      const totalVisits = getTotalInspection(visitPerDate)
      const totalProducts = getTotalInspection(productPerDate)
      const businessDays = getBusinessDays(currentYear, currentMonth)
      const workDays = getWorkDays(currentYear, currentMonth, today)
      for (var key in inspectionPerDate_) {
        inspectionPerDate_[key] = parseInt(totalInspection / businessDays)
      }
      for (var key1 in productPerDate_) {
        productPerDate_[key1] = parseInt(totalProducts / businessDays)
      }
      for (var key2 in visitPerDate_) {
        visitPerDate_[key2] = parseInt(totalVisits / businessDays)
      }
      // -------------------------------end----------------------------------------


      setPaginations({ current: 1, pageSize: 10, total: storeData.length })
      const initReportData = [];


      switch (parseInt(tabsStatus)) {
        case 3:
          initReportData.push({
            key: 1,
            report_title: "REALIZADAS",
            ...inspectionPerDate,
            report_value: totalInspection,
            report_percent: Math.round(totalInspection / (parseInt(totalInspection / businessDays * workDays))) || 0
          },
            {
              key: 2,
              report_title: "Proyección a la Fecha",
              report_value: parseInt(totalInspection / businessDays * workDays),
              ...inspectionPerDate_,
            },
            {
              key: 3,
              report_title: "Proyección del Mes",
              report_value: totalInspectionOnStores
            },);
          setRowClass("inspection_background");
          break;
        case 2:
          initReportData.push({
            key: 4,
            report_title: "INSUMOS ENTREGADOS",
            report_value: totalProducts,
            ...productPerDate,
            report_percent: Math.round(totalProducts / (parseInt(totalMonthlyDeliver / businessDays * workDays))) || 0

          },
            {
              key: 5,
              report_title: "Proyección a la Fecha",
              report_value: parseInt(totalMonthlyDeliver / businessDays * workDays),
              ...productPerDate_
            },
            {
              key: 6,
              report_title: "Proyección del Mes",
              report_value: parseInt(totalMonthlyDeliver)
            },);
          setRowClass("insumo_background");
          break;
        case 1:
          initReportData.push(
            {
              key: 7,
              report_title: "Visitas Realizadas",
              ...visitPerDate,
              report_value: parseInt(totalVisits)
            }
          )
          setRowClass("visit_background");
          break;
        default:
          break;
      }

      setReportData(initReportData);
    }
    init();

  }, [
    currentMonth, currentYear, changeStatus, tabsStatus
  ])

  const getTotalInspection = (record) => {
    let total = 0;
    for (var key in record) {
      total += parseInt(record[key]) || 0;
    }
    return total;
  }
  const getDate = (value) => {
    return moment(value).format("YYYY-MM-DD")
  }
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
  const changedClient = (e) => {
    const filteredData = customerStores.filter(({ parent_id }) => parent_id._id === e);

    if (filteredData.length) {
      const storeData = [];
      filteredData.map(({ _id, store }) => {
        storeData.push({
          value: _id,
          label: store
        })
      })
      setFilteredStores(storeData);
    } else {
      formRef.current.resetFields(['store'])
      setFilteredStores([])
    }
  }
  const updateHistory = async (_item) => {

    const { _id } = _item;
    const jsonData = { status: 0, by: currentUserId };
    const { result } = await request.update({ entity, id: _id, jsonData: jsonData })
    // dispatch(crud.update({ entity, id: _id, jsonData: jsonData }))
    const newData = [...historyData];
    const index = newData.findIndex((item) => item._id === _id);
    // const item = newData[index];
    newData[index] = result
    console.log(JSON.parse(JSON.stringify(newData)), 'newData');
    setHistoryData([...newData])
    setChangeStatus(!changeStatus)
  }
  const historyColumns = [
    {
      title: "Date",
      dataIndex: 'visit_date',
      render: (_) => {
        return formattedDateFunc(_)
      }
    }
    ,
    {
      title: "Type",
      dataIndex: 'type',
      render: (_) => {
        return visitLabel[_];
      }
    }
    ,
    {
      title: "Comment",
      dataIndex: 'comments'
    }
    ,
    {
      title: "By",
      dataIndex: ['by', 'name']
    }
    ,

    {
      title: "Action",
      dataIndex: 'operation',
      width: "10%",
      align: 'center',
      render: (_, record) => {
        const { status, type } = record;
        return (
          status === 0 ?
            'Canceled'
            :
            role === 0 ?
              <>
                <Popconfirm title="Sure to cancel?" onConfirm={() => updateHistory(record)} >
                  <StopOutlined style={{ fontSize: "20px" }} />
                </Popconfirm>
                {type === 3 &&

                  <Typography.Text onClick={() => showInspectionForm(record)}>
                    <EyeOutlined style={{ fontSize: "20px" }} />
                  </Typography.Text>
                }
              </>
              : ""
        )

      },
    }
  ]


  const [inspectionOfficer, setInspectionOfficer] = useState();
  const [personAcknowledgingReceipt, setPersonAcknowledgingReceipt] = useState();
  const [inspectionComment, setInspectionComment] = useState();
  const [customerPerception, setCustomerPerception] = useState();

  const showInspectionForm = (record) => {
    const { inspection_comment, inspection_officer, person_acknowledging_receipt, customer_perception } = record;

    setInspectionOfficer(inspection_officer || '');
    setPersonAcknowledgingReceipt(person_acknowledging_receipt || '');
    setCustomerPerception(customer_perception || '');
    setInspectionComment(inspection_comment || '');
    setIsInspectionModal(true)

  }
  const handleUpload = (e) => {
    e.preventDefault();

    const file = e.target.files[0];
    setCurrentFile(file);
  };
  return (

    <DashboardLayout>
      <Layout>
        <Modal title="Create Form" open={isModalVisible} onOk={handleOk} onCancel={handleCancel} footer={null} width={1000}>
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
                type: 3,
              }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
            >

              <Row gutter={24}>

                <Col span={24}>
                  <Form.Item
                    name='type'
                    label='Type'
                    required={[
                      {
                        required: true
                      }
                    ]}
                  >
                    <Radio.Group
                      name='radioGroup'
                      options={typeOptions}
                      onChange={(e) => setTypeValue(e.target.value)}
                    />
                  </Form.Item>
                  <Form.Item
                    name="customer"
                    label="Customer"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <SelectAsync
                      entity={'client'}
                      displayLabels={['name']}
                      onChange={changedClient}
                    />
                  </Form.Item>
                  <Form.Item
                    name="store"
                    label="Store"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <Select
                      options={filteredStores}
                    />
                  </Form.Item>
                  <Form.Item name="visit_date" label="Date/Time" rules={[
                    {
                      required: true,
                    },
                  ]}>
                    <DatePicker />
                  </Form.Item>

                  <Form.Item
                    name="comments"
                    label="Comments"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <Input.TextArea />
                  </Form.Item>

                  {
                    typeValue === 3 &&
                    <Form.Item
                      name="pdf"
                      label="Upload File"
                    >
                      <Input
                        type='file'
                        name='file'
                        onChange={handleUpload}
                      />

                    </Form.Item>
                  }
                </Col>
                {/* {
                  typeValue === 3 &&
                  <Col span={12}>
                    <Table
                      pagination={[{ pageSize: 20 }]}
                      columns={[
                        {
                          title: "Item-Label",
                          dataIndex: "item_label",
                          key: "item_label"
                        },
                        {
                          title: "Cumple",
                          dataIndex: "cumple",
                          key: "cumple",
                          render: (text, record) => (
                            <Checkbox
                              checked={record.cumple}
                              onChange={e => handleCheckChange(record.key, 'cumple', e.target.checked)}
                            />
                          ),

                        },
                        {
                          title: 'Increase Quality',
                          dataIndex: 'increase_quality',
                          key: 'increase_quality',
                          render: (text, record) => (
                            <Checkbox
                              checked={record.increase_quality}
                              onChange={e => handleCheckChange(record.key, 'increase_quality', e.target.checked)}
                            />
                          ),
                        },

                      ]}
                      dataSource={data || []}
                    />
                  </Col>
                } */}
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

        <Modal title="History Form" open={isHistory} onCancel={closeModal} footer={null} width={700}>
          <Table
            columns={historyColumns}
            dataSource={historyData || []}
            rowKey={(item) => item._id}
          />
        </Modal>

        <Modal title="Inspection Form" open={isInspectionModal} onCancel={closeInspectionModal} footer={null} width={900}>

          <h3>Encargado de inspección : {inspectionOfficer}</h3>
          <h3>Cliente: Percepción del servicio el último mes / alguna oportunidad de mejora : {customerPerception}</h3>
          <h3>Persona que acusa de recibido : {personAcknowledgingReceipt}</h3>
          <h3>Comment : {inspectionComment}</h3>


          {/* <Table
            pagination={[{ pageSize: 20 }]}
            columns={[
              {
                title: "Item Label",
                dataIndex: "item_label",
                key: "item_label"
              },
              {
                title: "Cumple",
                dataIndex: "cumple",
                key: "cumple",
                render: (text, record) => (
                  <Checkbox
                    checked={record.cumple}
                    onChange={e => handleCheckChange(record.key, 'cumple', e.target.checked)}
                  />
                ),

              },
              {
                title: 'Increase Quality',
                dataIndex: 'increase_quality',
                key: 'increase_quality',
                render: (text, record) => (
                  <Checkbox
                    checked={record.increase_quality}
                    onChange={e => handleCheckChange(record.key, 'increase_quality', e.target.checked)}
                  />
                ),
              },

            ]}
            dataSource={data || []}
          /> */}
        </Modal>
        <Modal title="Form" open={isClientStore} onCancel={() => setIsClientStore(false)} footer={null} width={800}>
          <Button type='primary' onClick={() => setIsHistory(true)}>History</Button>
          <Table
            columns={[
              {
                title: "Location",
                dataIndex: "location"
              },
              {
                title: "Waze",
                dataIndex: "waze"
              },
              {
                title: "Contact name",
                dataIndex: "contact_name"
              },
              {
                title: "Employees",
                dataIndex: "employees"
              },
              {
                title: "Products",
                dataIndex: "products"
              },
              {
                title: "Spects",
                dataIndex: "spects"
              }
            ]}
            dataSource={customerStore || []}
          />
        </Modal>
        <Layout >

          <Tabs defaultActiveKey='3' onChange={(e) => setTabStatus(e)}>
            <div tab="Inspections" key={3}>
              {/* Inspections */}
            </div>
            <div tab="Products" key={2}>
              {/* Products */}
            </div>
            <div tab="Visits" key={1}>
              {/* Visits */}
            </div>
          </Tabs>
          <Row gutter={24} style={{ textAlign: 'right' }}>
            <Col span={24}>

              <h3 style={{ textAlign: 'center' }}>
                <LeftOutlined onClick={prevData} />
                <Popover content={content} title="" trigger="click">
                  {moment(new Date(currentYear, currentMonth - 1, 1)).format("MMMM")}
                </Popover>
                <label> {currentYear}</label>
                <RightOutlined onClick={nextData} />
              </h3>
            </Col>
            <Col span={6}>
              <Input
                placeholder='Search'
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col span={18}>
              <Button onClick={showModal} type="primary">New Visit</Button>
            </Col>
          </Row>
          <Form form={form} component={false}>
            <Table
              bordered
              dataSource={reportData}
              columns={parseInt(tabsStatus) === 1 ? [...visitColumn, ...changedMonth] : [...topColumn, ...changedMonth]}
              rowClassName={rowClass}
              scroll={{
                x: 2700
              }}
              pagination={false}
            />
          </Form>
          <Form form={form} component={false}>
            <Table
              style={{ overflow: 'auto' }}
              bordered
              dataSource={filterData}
              columns={[...columns, ...changedMonth]}
              rowClassName="editable-row"
              pagination={paginations}
              onChange={handelDataTableLoad}
              footer={Footer}
              scroll={{
                x: 2700
              }}
            />
          </Form>
        </Layout>
      </Layout>
    </DashboardLayout >
  );
};
export default VisitControl;