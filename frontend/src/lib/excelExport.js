import * as XLSX from 'xlsx';

/**
 * Exports JSON data to an Excel (.xlsx) file
 * @param {Array<Object>} data Array of objects to export
 * @param {string} fileName Name of file (without extension)
 * @param {string} sheetName Sheet title
 */
export const exportToExcel = (data, fileName = 'export', sheetName = 'Sheet1') => {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Exports multiple sheets to a single Excel workbook
 * @param {Object} sheetsMap Object where keys are sheet names and values are arrays of objects
 * @param {string} fileName Name of file (without extension)
 */
export const exportMultipleSheets = (sheetsMap, fileName = 'kamrul_yarn_data') => {
  const workbook = XLSX.utils.book_new();
  let hasData = false;

  Object.entries(sheetsMap).forEach(([sheetName, data]) => {
    if (Array.isArray(data) && data.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
      hasData = true;
    }
  });

  if (!hasData) {
    alert('No data available to export.');
    return;
  }

  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};
