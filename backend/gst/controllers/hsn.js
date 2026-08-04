const supabase = require('../config/supabase');
const ExcelJS = require('exceljs');

const mockData = [
    { hsn_code: '1006', description: 'Rice', chapter: 'Chapter 10', gst_rate: 5.00, category: 'Goods' },
    { hsn_code: '100630', description: 'Semi-milled or wholly milled rice', chapter: 'Chapter 10', gst_rate: 5.00, category: 'Goods' },
    { hsn_code: '10063010', description: 'Rice, parboiled', chapter: 'Chapter 10', gst_rate: 5.00, category: 'Goods' },
    { hsn_code: '8471', description: 'Automatic data processing machines', chapter: 'Chapter 84', gst_rate: 18.00, category: 'Goods' },
    { hsn_code: '9983', description: 'Other professional, technical and business services', chapter: 'Chapter 99', gst_rate: 18.00, category: 'Services' }
];

exports.searchHsn = async (req, res) => {
    try {
        const { mode, query, category } = req.body;

        if (!query) {
            return res.status(400).json({ success: false, error: 'Please enter search criteria.' });
        }

        let dbQuery = supabase.from('hsn_codes').select('*');

        if (mode === 'hsn') {
            dbQuery = dbQuery.ilike('hsn_code', `${query}%`);
        } else if (mode === 'description') {
            dbQuery = dbQuery.ilike('description', `%${query}%`);
            if (category) {
                dbQuery = dbQuery.eq('category', category);
            }
        } else {
            return res.status(400).json({ success: false, error: 'Invalid search mode.' });
        }

        const { data, error } = await dbQuery;

        if (error) {
            if (error.code === '42P01') {
                console.warn("Table hsn_codes does not exist. Using mock data.");
                let results = [];
                if (mode === 'hsn') {
                    results = mockData.filter(item => item.hsn_code.startsWith(query));
                } else {
                    const lowerQuery = query.toLowerCase();
                    results = mockData.filter(item => 
                        item.description.toLowerCase().includes(lowerQuery) &&
                        (!category || item.category === category)
                    );
                }
                return res.status(200).json({ success: true, data: results });
            }
            throw error;
        }

        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error('Error in searchHsn:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.downloadHsnExcel = async (req, res) => {
    try {
        const { data, error } = await supabase.from('hsn_codes').select('*');

        let records = data;

        if (error) {
            if (error.code === '42P01') {
                console.warn("Table hsn_codes does not exist. Using mock data for Excel.");
                records = mockData;
            } else {
                throw error;
            }
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('HSN Directory');

        worksheet.columns = [
            { header: 'HSN Code', key: 'hsn_code', width: 15 },
            { header: 'Description', key: 'description', width: 50 },
            { header: 'Chapter', key: 'chapter', width: 20 },
            { header: 'GST Rate (%)', key: 'gst_rate', width: 15 },
            { header: 'Category', key: 'category', width: 15 }
        ];

        worksheet.getRow(1).font = { bold: true };

        records.forEach(record => {
            worksheet.addRow(record);
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=' + 'HSN_Directory.xlsx');

        await workbook.xlsx.write(res);
        res.status(200).end();
    } catch (err) {
        console.error('Error in downloadHsnExcel:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
