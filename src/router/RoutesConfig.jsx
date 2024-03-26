const { role } = window.localStorage.auth ? JSON.parse(window.localStorage.auth) : {};



var routes = [
  {
    path: '/',
    component: 'Customer',
  },
  {
    path: '/user_edit',
    component: 'UserEdit',
  },
  {
    path: '/customer',
    component: 'Customer',
  },
  {
    path: '/invoice',
    component: 'Invoice',
  },
  {
    path: '/employee/details/:id',
    component: 'Details',
  },
  {
    path: '/customer/details/:id',
    component: 'CustomerDetails',
  },
  {
    path: '/customer_details',
    component: 'CustomerDetails',
  },
  {
    path: '/payroll_management',
    component: 'PayrollManagement',
  },
  {
    path: '/project_payment_management',
    component: 'ProjectPaymentManagement',
  },
  {
    path: '/payroll_details/:id',
    component: 'PayrollDetails',
  },
  {
    path: '/project_details/:id',
    component: 'ProjectDetails',
  },
  {
    path: '/Projects',
    component: 'Projects',
  },
  {
    path: '/visit_control',
    component: 'VisitControl',
  },
  {
    path: '/store',
    component: 'Store',
  },
  {
    path: '/quote',
    component: 'Quote',
  },
  {
    path: '/payment/invoice',
    component: 'PaymentInvoice',
  },
  {
    path: '/employee',
    component: 'Employee',
  },
  {
    path: '/admin',
    component: 'Admin',
  },
  {
    path: '/company',
    component: 'Company',
  },
  {
    path: '/payment/mode',
    component: 'PaymentMode',
  },
  {
    path: '/role',
    component: 'Role',
  },
  {
    path: '/ref',
    component: 'Reference',
  },
  {
    path: '/position',
    component: 'Position',
  },
  {
    path: '/comparative_Report',
    component: 'ComparativeReport',
  },
  {
    path: '/billing_report',
    component: 'BillingReport',
  },
  {
    path: '/routes',
    component: 'Routes',
  },
  {
    path: '/recurrent_payment_report',
    component: 'RecurrentPaymentReport',
  },
  {
    path: '/product_list',
    component: 'ProductCategories',
  },
  {
    path: '/product_list_checkout',
    component: 'CheckoutProductLists',
  },
  {
    path: '/product_types',
    component: 'ProductTypes',
  },
  {
    path: '/reservations',
    component: 'Reservations',
  },
  {
    path: '/payments',
    component: 'PaymentManagement',
  },
  {
    path: '/company_list',
    component: 'CompanyList',
  },
  {
    path: '/checkout',
    component: 'CheckoutPage',
  },
  {
    path: '/system_info',
    component: 'SystemInfo',
  },
  {
    path: '/payment_method',
    component: 'PaymentMethod',
  },
  {
    path: '/payment_report',
    component: 'PaymentReport',
  },
  {
    path: '/report1',
    component: 'FirstReportView',
  },
  {
    path: '/report2',
    component: 'SecondReportView',
  },
  {
    path: '/report3',
    component: 'ThirdReportView',
  },
  {
    path: '/rd_checkout',
    component: 'RDCheckout',
  },

]



export const routesConfig = routes
export const Role = role;