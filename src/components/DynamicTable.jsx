// components/DynamicTable.js
import React from 'react';

const DynamicTable = ({ 
  columns, 
  data, 
  keyField,
  className 
}) => {
  // Helper function to convert value to valid CSS class name
  const toValidClassName = (value) => {
    if (typeof value === 'string') {
      return value
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')  // Replace special chars with hyphen
        .replace(/-+/g, '-')         // Remove consecutive hyphens
        .replace(/^-|-$/g, '');       // Remove leading/trailing hyphens
    }
    return '';
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y dynamicTable" id="dataTable" data-page-length={10}>
        <thead className="tableHead">
          <tr>
            {columns.map((column) => (
              <th
                key={column.field}
                scope="col"
                className={`px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider ${column.field}-header`}
              >
                {column.headerName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row) => (
            <tr 
              key={row[keyField]} 
              className="hover:bg-gray-50 "
            >
              {columns.map((column) => {
                const cellValue = row[column.field];
                const valueClass = toValidClassName(cellValue);
                const cellClasses = [
                  'px-6',
                  'py-4',
                  'whitespace-nowrap',
                  'text-sm',
                  'fw-semibold',
                  `${column.field}-cell`,
                  valueClass
                ].filter(Boolean).join(' ');

                return (
                  <td
                    key={`${row[keyField]}-${column.field}`}
                    className={cellClasses}
                  >
                    {column.render ? column.render(row) : cellValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DynamicTable;