import { DashboardLayout } from "@/layout";
import { Layout, PageHeader } from "antd";
import Panel1 from "./RdCheckout/Panel1";
import { useEffect, useState } from "react";
import Panel2 from "./RdCheckout/Panel2";

const RDCheckout = () => {
    const [assignedUser, setAssignedUser] = useState(null);
    useEffect(() => {
        if (assignedUser) {

        }
    }, [assignedUser])
    return (
        <DashboardLayout>
            {!assignedUser && <PageHeader title="Rd Checkout" onBack={() => window.history.back()}></PageHeader>}
            <Layout className="w-100 my-8" style={{ height: '80vh' }}>
                {!assignedUser && <Panel1 setAssignedUser={setAssignedUser} />}
                {assignedUser && <Panel2 assignedUser={assignedUser} />}
            </Layout>
        </DashboardLayout>
    );
}
export default RDCheckout;