import * as XLSX from 'xlsx';
import { Col, Modal, Row, Table, } from "antd";
import { useEffect, useState } from "react";
import { request } from '@/request';
const ProjectBillingHistory = (props) => {
    const currentEmployeeId = props.parentId
    const [dataSource, setDataSource] = useState();
    const [projectDetail, setProjectDetail] = useState();
    const [isProducts, setIsProducts] = useState();
    const Columns = [
        {
            title: 'Date',
            dataIndex: 'start_date',
            render: (text) => {
                return (formattedDateFunc(text));
            }
        },
        {
            title: "Billing ID",
            dataIndex: 'invoice_id',
            render: (text, record) => {
                return <span onClick={() => viewProjectDetail(record)}>{text}</span>
            }
        },
        {
            title: "Reference",
            dataIndex: 'ref'
        }
        ,
        {
            title: 'Amount',
            dataIndex: 'amount',
            render: (_) => {
                return _ ? _.toFixed(2) : 0
            }
        },
    ];
    const formattedDateFunc = (date) => {
        return new Date(date).toLocaleDateString()
    }

    const viewProjectDetail = (record) => {
        if (record) {
            const { project_details } = record;
            setProjectDetail(project_details)
            setIsProducts(true)
        }

    }
    useEffect(() => {
        const init = async () => {
            const { result } = await request.listById({ entity: "project", jsonData: { customer: currentEmployeeId } });
            console.log(result, 'result');
            const projectHistory = result.map((item, index) => ({
                start_date: item.created,
                amount: item.billing,
                key: index,
                ...item
            }));
            setDataSource(projectHistory);

        }
        init()

    }, [currentEmployeeId])
    const exportToExcel = () => {
        const data = dataSource.map(obj => ({
            date: obj.start_date,
            amount: obj.amount,
        }))
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        XLSX.writeFile(workbook, 'table.xlsx');
    }
    const handleProducts = () => {
        setIsProducts(false)
    }
    return (
        <div className="whiteBox shadow">
            <Modal title="Products" visible={isProducts} onCancel={handleProducts} footer={null}>
                <h3>{projectDetail}</h3>
            </Modal>

            <Row>
                <Col span={3}>
                    <h3 style={{ color: '#22075e', marginBottom: 5 }}>Project Billing History</h3>
                </Col>
                <Col span={12}>
                    <button onClick={exportToExcel}>Export to Excel</button>
                </Col>
            </Row>
            <Table
                bordered
                dataSource={dataSource || []}
                columns={Columns}
                rowClassName="editable-row"
            />
        </div>
    );
}
export default ProjectBillingHistory;