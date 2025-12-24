import MUIDataTable from 'mui-datatables';
import { Icon } from '@iconify/react';
import DefaultAvatar from '../otherImages/default.png';
import DP1 from '../otherImages/dp-1.png';
import DP2 from '../otherImages/dp-2.png';
import DP3 from '../otherImages/dp-3.png';
import DP4 from '../otherImages/dp-4.png';
import DP5 from '../otherImages/dp-5.png';
import DP6 from '../otherImages/dp-6.png';

const PaymentHistoryTable = () => {
  const packageData = [
    { id: 'PKG-001', packageName: 'Website Development - Basic', packageImage: DP1, price: "750/Monthly", created_at: '26 May 2025', description: 'Lorem details about what the package includes', paymentStatus: "In Progress", },
    { id: 'PKG-002', packageName: 'Website Development - Basic', packageImage: DP2, price: "1500/Monthy", clientName: 'Pristia Candra', clientImage: DP1, created_at: '26 May 2025',created_by: 'Peter Webb', description: 'Lorem details about what the package includes', paymentStatus: "Planning", },
    { id: 'PKG-003', packageName: 'Website Development - Basic', packageImage: DP3, price: "1500/Monthy",  clientName: 'Pristia Candra', clientImage: DP1, created_at: '26 May 2025',created_by: 'Peter Webb', description: 'Lorem details about what the package includes', paymentStatus: "Completed", },
    { id: 'PKG-004', packageName: 'Social Media Package', packageImage: DP4, price: 500.00, clientName: 'Pristia Candra', clientImage: DP1, created_at: '26 May 2025',created_by: 'Peter Webb', description: 'Lorem details about what the package includes', paymentStatus: "Planning", },
    { id: 'PKG-005', packageName: 'Mobile App Development', packageImage: DP5, price: 1200.00, clientName: 'Pristia Candra', clientImage: DP1, created_at: '26 May 2025',created_by: 'Peter Webb', description: 'Lorem details about what the package includes', paymentStatus: "In Progress", },
    { id: 'PKG-006', packageName: 'Mobile App Development', packageImage: DP6, price: 5000.00, clientName: 'Pristia Candra', clientImage: DP1, created_at: '26 May 2025',created_by: 'Peter Webb', description: 'Lorem details about what the package includes', paymentStatus: "Completed", },
    { id: 'PKG-007', packageName: 'Website Development - Basic', packageImage: DP1, price: "1500/Monthy", clientName: 'Pristia Candra', clientImage: DP1, created_at: '26 May 2025',created_by: 'Peter Webb', description: 'Lorem details about what the package includes', paymentStatus: "Planning", },
    { id: 'PKG-008', packageName: 'Website Development - Basic', packageImage: DP2, price: "1500/Monthy", clientName: 'Pristia Candra', clientImage: DP1, created_at: '26 May 2025',created_by: 'Peter Webb', description: 'Lorem details about what the package includes', paymentStatus: "In Progress", },
    { id: 'PKG-009', packageName: 'Website Development - Basic', packageImage: DP3, price: "1500/Monthy", clientName: 'Pristia Candra', clientImage: DP1, created_at: '26 May 2025',created_by: 'Peter Webb', description: 'Lorem details about what the package includes', paymentStatus: "Planning", },
    { id: 'PKG-010', packageName: 'Social Media Package', packageImage: DP4, price: 500.00, clientName: 'Pristia Candra', clientImage: DP1, created_at: '26 May 2025',created_by: 'Peter Webb', description: 'Lorem details about what the package includes', paymentStatus: "Completed", },
    { id: 'PKG-011', packageName: 'Mobile App Development', packageImage: DP5, price: 500.00, clientName: 'Pristia Candra', clientImage: DP1, created_at: '26 May 2025',created_by: 'Peter Webb', description: 'Lorem details about what the package includes', paymentStatus: "In Progress", },
    { id: 'PKG-012', packageName: 'Mobile App Development', packageImage: DP6, price: 500.00, clientName: 'Pristia Candra', clientImage: DP1, created_at: '26 May 2025',created_by: 'Peter Webb', description: 'Lorem details about what the package includes', paymentStatus: "Completed", },
  ];

  const columns = [
    {
      name: 'packageName',
      label: 'Package Name',
      options: {
        customBodyRender: (value, tableMeta) => {
          const safeVal = value.toLowerCase().replace(/\s+/g, '_');
          return (
            <div className={`col-packageName val-${safeVal} d-flex align-items-center gap-8`}>
              <img
                style={{ height: "35px", width: "35px", borderRadius: "50%" }}
                src={packageData[tableMeta.rowIndex].packageImage || DefaultAvatar}
                alt="package"
              />
              {value}
            </div>
          );
        }
      }
    },

    // {
    //   name: 'description',
    //   label: 'Description',
    //   options: {
    //     customBodyRender: (value) => {
    //       const safeVal = value.toLowerCase().replace(/\s+/g, '-');
    //       return (
    //         <span className={`col-description val-${safeVal}`}>
    //           {value}
    //         </span>
    //       );
    //     }
    //   }
    // },

    {
      name: 'price',
      label: 'Price',
      options: {
      customBodyRender: (value) => {
          const safeVal = value;
          return (
          <span className={`col-price packagePrice val-${safeVal} font-bold fs-6`}>
              ${value}
          </span>
          );
      }
      }
    },

    {
      name: 'created_at',
      label: 'Created At',
      options: {
        customBodyRender: (value) => {
          const safeVal = value.toLowerCase().replace(/\s+/g, '-');
          return (
            <span className={`col-date val-${safeVal} text-gray-600`}>
              {value}
            </span>
          );
        }
      }
    },

    {
      name: 'paymentStatus',
      label: 'Payment Status',
      options: {
        customBodyRender: (value) => {
          const safeVal = value.toLowerCase().replace(/\s+/g, '-');
          return (
            <span className={`col-price val-${safeVal} text-gray-600`}>
              {value}
            </span>
          );
        }
      }
    }
  ];

  const options = {
    selectableRows: 'none',
    rowsPerPage: 10,
    responsive: 'standard',
    elevation: 0,
    print: false,
    download: false,
    viewColumns: false,
    filter: false,
    search: true,
  };

  return (
    <div className="card basic-data-table">
      <div className="card-body">
        <MUIDataTable
          data={packageData}
          columns={columns}
          options={options}
          className="overflow-hidden packageTable"
        />
      </div>
    </div>
  );
};

export default PaymentHistoryTable;