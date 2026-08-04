import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegistrationTabPage from '../components/RegistrationTabPage';
import { useFormSave } from '../hooks/useFormSave';

const GoodsAndServices = () => {
    const navigate = useNavigate();
    const { handleSaveAndContinue, isSaving } = useFormSave('GoodsAndServices', '/state-specific-information');
    const [activeSubTab, setActiveSubTab] = useState('goods');

    return (
        <RegistrationTabPage activeIndex={6} breadcrumb="Goods and Services">
            <div className="gs-sub-tabs">
                <div
                    className={`gs-sub-tab ${activeSubTab === 'goods' ? 'active' : ''}`}
                    onClick={() => setActiveSubTab('goods')}
                >
                    Goods
                </div>
                <div
                    className={`gs-sub-tab ${activeSubTab === 'services' ? 'active' : ''}`}
                    onClick={() => setActiveSubTab('services')}
                >
                    Services
                </div>
            </div>

            {activeSubTab === 'goods' ? (
                <div className="gs-content-section">
                    <h3 className="gs-title">Details of Goods / Commodities supplied by the business</h3>
                    <p className="gs-subtitle">Please specify top 5 Commodities</p>

                    <div className="gs-search-area">
                        <label className="gs-search-label">Search HSN Chapter by Name or Code</label>
                        <input
                            type="text"
                            className="gs-search-input"
                            placeholder="Search HSN Chapter"
                        />
                    </div>
                </div>
            ) : (
                <div className="gs-content-section">
                    <h3 className="gs-title">Details of Services offered by the Business</h3>
                    <p className="gs-subtitle">Please specify top 5 Services</p>

                    <div className="gs-search-area">
                        <label className="gs-search-label">Search by Name or Code</label>
                        <input
                            type="text"
                            className="gs-search-input"
                            placeholder="Search Service Classification Code"
                        />
                    </div>
                </div>
            )}

            <div className="bd-actions" style={{ marginTop: '80px' }}>
                <button className="bd-back-btn" onClick={() => navigate('/additional-places-of-business')}>BACK</button>
                <button className="bd-save-btn" onClick={handleSaveAndContinue} disabled={isSaving}>
                    {isSaving ? 'SAVING...' : 'SAVE & CONTINUE'}
                </button>
            </div>
        </RegistrationTabPage>
    );
};

export default GoodsAndServices;
