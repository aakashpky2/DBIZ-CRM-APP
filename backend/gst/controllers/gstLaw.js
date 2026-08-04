const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

let mockLinks = [
    { id: uuidv4(), name: 'CBIC', url: 'https://www.cbic.gov.in/', is_active: true, display_order: 1 },
    { id: uuidv4(), name: 'Arunachal Pradesh', url: 'https://tax.arunachal.gov.in/', is_active: true, display_order: 2 },
    { id: uuidv4(), name: 'Chandigarh', url: 'https://excise.chd.gov.in/', is_active: true, display_order: 3 },
    { id: uuidv4(), name: 'Daman and Diu', url: 'https://daman.nic.in/vat.aspx', is_active: true, display_order: 4 },
    { id: uuidv4(), name: 'Gujarat', url: 'https://commercialtax.gujarat.gov.in/', is_active: true, display_order: 5 },
    { id: uuidv4(), name: 'Jammu and Kashmir', url: 'https://jkexcise.nic.in/', is_active: true, display_order: 6 },
    { id: uuidv4(), name: 'Kerala', url: 'https://keralataxes.gov.in/', is_active: true, display_order: 7 },
    { id: uuidv4(), name: 'Maharashtra', url: 'https://mahagst.gov.in/', is_active: true, display_order: 8 },
    { id: uuidv4(), name: 'Mizoram', url: 'https://zotax.nic.in/', is_active: true, display_order: 9 },
    { id: uuidv4(), name: 'Puducherry', url: 'https://gst.py.gov.in/', is_active: true, display_order: 10 },
    { id: uuidv4(), name: 'Sikkim', url: 'https://sikkimtax.gov.in/', is_active: true, display_order: 11 },
    { id: uuidv4(), name: 'Tripura', url: 'https://taxes.tripura.gov.in/', is_active: true, display_order: 12 },
    { id: uuidv4(), name: 'West Bengal', url: 'https://wbcomtax.gov.in/', is_active: true, display_order: 13 },
    { id: uuidv4(), name: 'Andaman and Nicobar Islands', url: 'https://andaman.gov.in/', is_active: true, display_order: 14 },
    { id: uuidv4(), name: 'Assam', url: 'https://tax.assam.gov.in/', is_active: true, display_order: 15 },
    { id: uuidv4(), name: 'Chhattisgarh', url: 'https://commercialtax.cgstate.gov.in/', is_active: true, display_order: 16 },
    { id: uuidv4(), name: 'Delhi', url: 'https://dvat.gov.in/', is_active: true, display_order: 17 },
    { id: uuidv4(), name: 'Haryana', url: 'https://haryanatax.gov.in/', is_active: true, display_order: 18 },
    { id: uuidv4(), name: 'Jharkhand', url: 'https://jharkhandcomtax.gov.in/', is_active: true, display_order: 19 },
    { id: uuidv4(), name: 'Lakshadweep', url: 'https://lakshadweep.gov.in/', is_active: true, display_order: 20 },
    { id: uuidv4(), name: 'Manipur', url: 'https://manipur.gov.in/', is_active: true, display_order: 21 },
    { id: uuidv4(), name: 'Nagaland', url: 'https://nagalandtax.nic.in/', is_active: true, display_order: 22 },
    { id: uuidv4(), name: 'Punjab', url: 'https://pextax.com/', is_active: true, display_order: 23 },
    { id: uuidv4(), name: 'Tamil Nadu', url: 'https://ctd.tn.gov.in/', is_active: true, display_order: 24 },
    { id: uuidv4(), name: 'Uttarakhand', url: 'https://comtax.uk.gov.in/', is_active: true, display_order: 25 },
    { id: uuidv4(), name: 'Andhra Pradesh', url: 'https://apct.gov.in/', is_active: true, display_order: 26 },
    { id: uuidv4(), name: 'Bihar', url: 'https://biharcommercialtax.gov.in/', is_active: true, display_order: 27 },
    { id: uuidv4(), name: 'Dadra and Nagar Haveli', url: 'https://dnh.gov.in/', is_active: true, display_order: 28 },
    { id: uuidv4(), name: 'Goa', url: 'https://goact.gov.in/', is_active: true, display_order: 29 },
    { id: uuidv4(), name: 'Himachal Pradesh', url: 'https://hptax.gov.in/', is_active: true, display_order: 30 },
    { id: uuidv4(), name: 'Karnataka', url: 'https://gst.kar.nic.in/', is_active: true, display_order: 31 },
    { id: uuidv4(), name: 'Madhya Pradesh', url: 'https://mptax.mp.gov.in/', is_active: true, display_order: 32 },
    { id: uuidv4(), name: 'Meghalaya', url: 'https://megexcise.gov.in/', is_active: true, display_order: 33 },
    { id: uuidv4(), name: 'Odisha', url: 'https://odishatax.gov.in/', is_active: true, display_order: 34 },
    { id: uuidv4(), name: 'Rajasthan', url: 'https://rajtax.gov.in/', is_active: true, display_order: 35 },
    { id: uuidv4(), name: 'Telangana', url: 'https://tgct.gov.in/', is_active: true, display_order: 36 },
    { id: uuidv4(), name: 'Uttar Pradesh', url: 'https://upgst.up.nic.in/', is_active: true, display_order: 37 }
];

exports.getActiveLinks = async (req, res) => {
    try {
        const { data, error } = await supabase.from('gst_law_links').select('*').eq('is_active', true).order('display_order', { ascending: true });
        
        if (error) {
            if (error.code === '42P01') {
                return res.status(200).json({ success: true, data: mockLinks.filter(l => l.is_active).sort((a,b) => a.display_order - b.display_order) });
            }
            throw error;
        }
        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.getAllLinks = async (req, res) => {
    try {
        const { data, error } = await supabase.from('gst_law_links').select('*').order('display_order', { ascending: true });
        
        if (error) {
            if (error.code === '42P01') {
                return res.status(200).json({ success: true, data: mockLinks.sort((a,b) => a.display_order - b.display_order) });
            }
            throw error;
        }
        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.addLink = async (req, res) => {
    try {
        const { name, url, is_active } = req.body;
        const { data, error } = await supabase.from('gst_law_links').insert([{ name, url, is_active }]).select();
        
        if (error) {
            if (error.code === '42P01') {
                const newLink = { id: uuidv4(), name, url, is_active: is_active ?? true, display_order: mockLinks.length + 1 };
                mockLinks.push(newLink);
                return res.status(201).json({ success: true, data: [newLink] });
            }
            throw error;
        }
        res.status(201).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.updateLink = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const { data, error } = await supabase.from('gst_law_links').update(updates).eq('id', id).select();
        
        if (error) {
            if (error.code === '42P01') {
                let updated = null;
                mockLinks = mockLinks.map(l => {
                    if (l.id === id) {
                        updated = { ...l, ...updates };
                        return updated;
                    }
                    return l;
                });
                return res.status(200).json({ success: true, data: updated ? [updated] : [] });
            }
            throw error;
        }
        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.deleteLink = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('gst_law_links').delete().eq('id', id);
        
        if (error) {
            if (error.code === '42P01') {
                mockLinks = mockLinks.filter(l => l.id !== id);
                return res.status(200).json({ success: true });
            }
            throw error;
        }
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
