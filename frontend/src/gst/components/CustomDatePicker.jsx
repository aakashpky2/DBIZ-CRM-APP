import React, { useState, useEffect, useRef } from 'react';
import './CustomDatePicker.css';

const CustomDatePicker = ({ value, onChange, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(value ? new Date(value.split('/').reverse().join('-')) : new Date());
    const [viewDate, setViewDate] = useState(new Date(selectedDate));
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatDate = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDateSelect = (day) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        setSelectedDate(newDate);
    };

    const handleOk = () => {
        onChange(formatDate(selectedDate));
        setIsOpen(false);
    };

    const handleClear = () => {
        onChange('');
        setIsOpen(false);
    };

    const days = [];
    const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());

    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const isSelected = selectedDate.getDate() === d && 
                           selectedDate.getMonth() === viewDate.getMonth() && 
                           selectedDate.getFullYear() === viewDate.getFullYear();
        days.push(
            <div 
                key={d} 
                className={`calendar-day ${isSelected ? 'selected' : ''}`}
                onClick={() => handleDateSelect(d)}
            >
                {d}
            </div>
        );
    }

    const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
    const dayNames = ["S", "M", "T", "W", "T", "F", "S"];

    return (
        <div className="custom-datepicker-container" ref={containerRef}>
            <div className="date-input-wrapper" onClick={() => setIsOpen(!isOpen)}>
                <input 
                    type="text" 
                    readOnly 
                    value={value || ''} 
                    placeholder="DD/MM/YYYY"
                    className="datepicker-input"
                />
                <span className="calendar-icon">📅</span>
            </div>

            {isOpen && (
                <div className="datepicker-modal">
                    <div className="datepicker-header">
                        <div className="header-year">{selectedDate.getFullYear()}</div>
                        <div className="header-full-date">
                            {selectedDate.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                    </div>

                    <div className="datepicker-body">
                        <div className="month-navigation">
                            <button onClick={handlePrevMonth}>&lt;</button>
                            <span>{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
                            <button onClick={handleNextMonth}>&gt;</button>
                        </div>

                        <div className="day-names">
                            {dayNames.map(day => <div key={day} className="day-name">{day}</div>)}
                        </div>

                        <div className="days-grid">
                            {days}
                        </div>
                    </div>

                    <div className="datepicker-footer">
                        <button className="footer-btn clear-btn" onClick={handleClear}>CLEAR</button>
                        <button className="footer-btn cancel-btn" onClick={() => setIsOpen(false)}>CANCEL</button>
                        <button className="footer-btn ok-btn" onClick={handleOk}>OK</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDatePicker;
