import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const states = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam",
    "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
    "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
    "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const monthsList = [
    "Jan", "Feb", "Mar", "Apr", "May", "June", 
    "July", "Aug", "Sept", "Oct", "Nov", "Dec"
];

const HolidayList = () => {
    const [year, setYear] = useState('2026');
    const [state, setState] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [expandedMonths, setExpandedMonths] = useState({});
    const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date().getMonth());

    const generateCalendarDays = (yearStr, monthIndex) => {
        const y = parseInt(yearStr);
        if (isNaN(y)) return [];
        
        const firstDay = new Date(y, monthIndex, 1).getDay();
        const daysInMonth = new Date(y, monthIndex + 1, 0).getDate();
        const daysInPrevMonth = new Date(y, monthIndex, 0).getDate();
        
        const days = [];
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, isCurrentMonth: true });
        }
        const remainingDays = (7 - (days.length % 7)) % 7;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({ day: i, isCurrentMonth: false });
        }
        return days;
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!year || !state) {
            setError('Year and State are mandatory fields.');
            return;
        }

        setError('');
        setLoading(true);
        setResults(null);
        setExpandedMonths({}); // Reset expansions

        try {
            const response = await api.post('/holidays/search', { year, state });

            const data = response.data;

            if (data.success) {
                setResults(data.data);
            } else {
                setError(data.error || 'An error occurred while fetching holidays.');
            }
        } catch (err) {
            setError('Error fetching holidays. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleMonth = (monthIndex) => {
        setExpandedMonths(prev => ({
            ...prev,
            [monthIndex]: !prev[monthIndex]
        }));
    };

    const expandAll = () => {
        const allExpanded = {};
        monthsList.forEach((_, index) => {
            allExpanded[index] = true;
        });
        setExpandedMonths(allExpanded);
    };

    const collapseAll = () => {
        setExpandedMonths({});
    };

    // Group results by month (0-11)
    const groupedHolidays = {};
    monthsList.forEach((_, index) => {
        groupedHolidays[index] = [];
    });

    if (results) {
        results.forEach(holiday => {
            const dateObj = new Date(holiday.holiday_date);
            const monthIndex = dateObj.getMonth();
            groupedHolidays[monthIndex].push(holiday);
        });
    }

    return (
        <div style={{ backgroundColor: '#f1f3f6', padding: '20px 80px', minHeight: 'calc(100vh - 200px)' }}>
            <div style={{ fontSize: '14px', marginBottom: '20px' }}>
                <span style={{ color: '#4b5563' }}>Home</span>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>Services</span>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>User Services</span>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>HolidayList</span>
            </div>

            <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderTop: '3px solid #1eb3a6', padding: '30px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '15px', right: '30px', fontSize: '13px', color: '#333' }}>
                    <span style={{ color: '#d32f2f', fontSize: '16px' }}>•</span> indicates mandatory fields
                </div>

                <h2 style={{ color: '#001b5c', fontSize: '24px', fontWeight: '500', margin: '0 0 20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                    Holiday list
                </h2>

                <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end', marginBottom: '40px' }}>
                    <div style={{ flex: '1 1 30%', minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '500' }}>
                            Year <span style={{ color: '#d32f2f' }}>*</span>
                        </label>
                        <select 
                            value={year} 
                            onChange={(e) => { setYear(e.target.value); setError(''); }}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                fontSize: '14px',
                                border: `1px solid ${error && !year ? '#d32f2f' : '#ccc'}`,
                                borderRadius: '4px',
                                outline: 'none',
                                backgroundColor: '#fff'
                            }}
                        >
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                            <option value="2027">2027</option>
                        </select>
                    </div>

                    <div style={{ flex: '1 1 30%', minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '500' }}>
                            Selection by State <span style={{ color: '#d32f2f' }}>*</span>
                        </label>
                        <select 
                            value={state} 
                            onChange={(e) => { setState(e.target.value); setError(''); }}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                fontSize: '14px',
                                border: `1px solid ${error && !state ? '#d32f2f' : '#ccc'}`,
                                borderRadius: '4px',
                                outline: 'none',
                                backgroundColor: '#fff'
                            }}
                        >
                            <option value="">Select</option>
                            {states.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div style={{ flex: '0 0 auto' }}>
                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{ 
                                backgroundColor: '#0f4c81', 
                                color: '#fff', 
                                border: 'none', 
                                padding: '10px 30px', 
                                fontSize: '14px', 
                                fontWeight: '500', 
                                borderRadius: '4px', 
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'SEARCHING...' : 'SEARCH'}
                        </button>
                    </div>
                </form>

                {error && <div style={{ color: '#d32f2f', fontSize: '13px', marginBottom: '20px' }}>{error}</div>}

                <div style={{ marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <button onClick={expandAll} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0', fontSize: '14px', cursor: 'pointer', backgroundColor: 'transparent', border: 'none', color: '#333', fontWeight: 'bold' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', backgroundColor: '#333', color: '#fff', fontSize: '14px', fontWeight: 'bold', borderRadius: '2px', lineHeight: '1' }}>+</span> 
                                Expand All
                            </button>
                            <button onClick={collapseAll} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0', fontSize: '14px', cursor: 'pointer', backgroundColor: 'transparent', border: 'none', color: '#333', fontWeight: 'bold' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', backgroundColor: '#333', color: '#fff', fontSize: '14px', fontWeight: 'bold', borderRadius: '2px', lineHeight: '1' }}>-</span> 
                                Collapse All
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button 
                                onClick={() => setViewMode('list')} 
                                style={{ padding: '6px 15px', fontSize: '13px', cursor: 'pointer', backgroundColor: viewMode === 'list' ? '#666' : '#fff', color: viewMode === 'list' ? '#fff' : '#333', border: '1px solid #ccc', borderRadius: '3px' }}
                            >
                                ≡ List
                            </button>
                            <button 
                                onClick={() => setViewMode('calendar')} 
                                style={{ padding: '6px 15px', fontSize: '13px', cursor: 'pointer', backgroundColor: viewMode === 'calendar' ? '#666' : '#fff', color: viewMode === 'calendar' ? '#fff' : '#333', border: '1px solid #ccc', borderRadius: '3px' }}
                            >
                                📅 Calendar
                            </button>
                        </div>
                    </div>

                    {viewMode === 'list' ? (
                        <div style={{ border: '1px solid #e5e7eb' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#e5e7eb', color: '#333' }}>
                                        <th style={{ padding: '12px 15px', textAlign: 'left', width: '30%', fontWeight: 'bold' }}>Date and Day</th>
                                        <th style={{ padding: '12px 15px', textAlign: 'left', width: '40%', fontWeight: 'bold' }}>Description</th>
                                        <th style={{ padding: '12px 15px', textAlign: 'left', width: '30%', fontWeight: 'bold' }}>State/Centre</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthsList.map((monthName, index) => {
                                        const isExpanded = expandedMonths[index];
                                        const monthHolidays = groupedHolidays[index];

                                        return (
                                            <React.Fragment key={monthName}>
                                                <tr 
                                                    onClick={() => toggleMonth(index)}
                                                    style={{ backgroundColor: '#f9fafb', cursor: 'pointer', borderBottom: '1px solid #e5e7eb' }}
                                                >
                                                    <td colSpan="3" style={{ padding: '12px 15px', fontWeight: '500', fontSize: '14px', color: '#555' }}>
                                                        <span style={{ 
                                                            display: 'inline-flex', 
                                                            alignItems: 'center', 
                                                            justifyContent: 'center', 
                                                            width: '16px', 
                                                            height: '16px', 
                                                            backgroundColor: '#555', 
                                                            color: '#fff', 
                                                            fontSize: '14px', 
                                                            fontWeight: 'bold', 
                                                            marginRight: '10px', 
                                                            borderRadius: '2px',
                                                            lineHeight: '1'
                                                        }}>
                                                            {isExpanded ? '-' : '+'}
                                                        </span>
                                                        {monthName}
                                                    </td>
                                                </tr>
                                                {isExpanded && (
                                                    monthHolidays.length === 0 ? (
                                                        <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#fff' }}>
                                                            <td colSpan="3" style={{ padding: '15px 40px', color: '#666', fontSize: '13px' }}>
                                                                No holidays available for this month.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        monthHolidays.map((holiday, hIndex) => (
                                                            <tr key={hIndex} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#fff' }}>
                                                                <td style={{ padding: '12px 40px', color: '#333' }}>
                                                                    {new Date(holiday.holiday_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}<br/>
                                                                    <span style={{ color: '#64748b', fontSize: '12px' }}>({holiday.holiday_day})</span>
                                                                </td>
                                                                <td style={{ padding: '12px 15px', color: '#333' }}>
                                                                    {holiday.description}<br/>
                                                                    <span style={{ fontSize: '11px', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', color: '#475569' }}>
                                                                        {holiday.type}
                                                                    </span>
                                                                </td>
                                                                <td style={{ padding: '12px 15px', color: '#333' }}>{holiday.state}</td>
                                                            </tr>
                                                        ))
                                                    )
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '10px 0 30px' }}>
                                <button 
                                    onClick={() => setCurrentCalendarMonth(prev => Math.max(0, prev - 1))} 
                                    disabled={currentCalendarMonth === 0} 
                                    style={{ padding: '6px 12px', cursor: currentCalendarMonth === 0 ? 'not-allowed' : 'pointer', border: '1px solid #ccc', backgroundColor: '#fff', fontSize: '14px', borderRadius: '3px', color: '#333' }}
                                >
                                    &lt;
                                </button>
                                <select 
                                    value={currentCalendarMonth} 
                                    onChange={(e) => setCurrentCalendarMonth(Number(e.target.value))} 
                                    style={{ margin: '0 15px', padding: '6px 15px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '14px', outline: 'none' }}
                                >
                                    {monthsList.map((m, i) => <option key={i} value={i}>{m}</option>)}
                                </select>
                                <button 
                                    onClick={() => setCurrentCalendarMonth(prev => Math.min(11, prev + 1))} 
                                    disabled={currentCalendarMonth === 11} 
                                    style={{ padding: '6px 12px', cursor: currentCalendarMonth === 11 ? 'not-allowed' : 'pointer', border: '1px solid #ccc', backgroundColor: '#fff', fontSize: '14px', borderRadius: '3px', color: '#333' }}
                                >
                                    &gt;
                                </button>
                            </div>

                            <div style={{ border: '1px solid #e5e7eb', backgroundColor: '#fff', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                                        <div key={d} style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', borderRight: i < 6 ? '1px solid #e5e7eb' : 'none', backgroundColor: i === 0 || i === 6 ? '#f9fafb' : '#fff', color: '#333', fontSize: '14px' }}>
                                            {d}
                                        </div>
                                    ))}
                                    {generateCalendarDays(year, currentCalendarMonth).map((dateObj, i) => {
                                        const isWeekend = i % 7 === 0 || i % 7 === 6;
                                        const isToday = dateObj.isCurrentMonth && new Date().getDate() === dateObj.day && new Date().getMonth() === currentCalendarMonth && new Date().getFullYear() === parseInt(year);
                                        
                                        let holidayDetails = null;
                                        if (dateObj.isCurrentMonth) {
                                            const holidaysInMonth = groupedHolidays[currentCalendarMonth] || [];
                                            holidayDetails = holidaysInMonth.find(h => new Date(h.holiday_date).getDate() === dateObj.day);
                                        }

                                        return (
                                            <div key={i} style={{ 
                                                minHeight: '120px', 
                                                padding: '10px', 
                                                borderBottom: i < 35 ? '1px solid #e5e7eb' : 'none', 
                                                borderRight: (i + 1) % 7 !== 0 ? '1px solid #e5e7eb' : 'none',
                                                backgroundColor: isToday ? '#fffbdd' : (isWeekend ? '#f9fafb' : '#fff'),
                                                color: dateObj.isCurrentMonth ? '#333' : '#a0aec0'
                                            }}>
                                                <div style={{ fontWeight: dateObj.isCurrentMonth ? '500' : 'normal', textAlign: 'right', marginBottom: '5px', fontSize: '14px' }}>
                                                    {dateObj.day}
                                                </div>
                                                {holidayDetails && (
                                                    <div style={{ fontSize: '11px', backgroundColor: '#f1f5f9', borderLeft: '3px solid #0f4c81', padding: '6px', borderRadius: '0 3px 3px 0', color: '#333', marginTop: '10px' }}>
                                                        <div style={{ fontWeight: '500', marginBottom: '3px' }}>{holidayDetails.description}</div>
                                                        <div style={{ color: '#64748b' }}>{holidayDetails.type} • {holidayDetails.state}</div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HolidayList;
