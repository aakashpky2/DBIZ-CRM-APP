import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Registration from './pages/Registration';
import Login from './pages/Login';
import ForgotUsername from './pages/ForgotUsername';
import ForgotPassword from './pages/ForgotPassword';
import NewUserLogin from './pages/NewUserLogin';
import Dashboard from './pages/Dashboard';
import BusinessDetails from './pages/BusinessDetails';
import PromoterPartners from './pages/PromoterPartners';
import AuthorizedSignatory from './pages/AuthorizedSignatory';
import AuthorizedRepresentative from './pages/AuthorizedRepresentative';
import PrincipalPlaceOfBusiness from './pages/PrincipalPlaceOfBusiness';
import AdditionalPlacesOfBusiness from './pages/AdditionalPlacesOfBusiness';
import GoodsAndServices from './pages/GoodsAndServices';
import StateSpecificInformation from './pages/StateSpecificInformation';
import AadhaarAuthentication from './pages/AadhaarAuthentication';
import Verification from './pages/Verification';
import ReturnsDashboard from './pages/ReturnsDashboard';
import GSTR1Dashboard from './pages/GSTR1Dashboard';
import GSTR1B2BDashboard from './pages/GSTR1B2BDashboard';
import GSTR1B2BAddInvoice from './pages/GSTR1B2BAddInvoice';
import GSTR1B2CLDashboard from './pages/GSTR1B2CLDashboard';
import GSTR1B2CLAddInvoice from './pages/GSTR1B2CLAddInvoice';
import GSTR1ExportsDashboard from './pages/GSTR1ExportsDashboard';
import GSTR1ExportsAddInvoice from './pages/GSTR1ExportsAddInvoice';
import GSTR1B2CSDashboard from './pages/GSTR1B2CSDashboard';
import GSTR1B2CSAddInvoice from './pages/GSTR1B2CSAddInvoice';
import GSTR1NilRatedDashboard from './pages/GSTR1NilRatedDashboard';
import GSTR1NilRatedAddInvoice from './pages/GSTR1NilRatedAddInvoice';
import GSTR1CDNRDashboard from './pages/GSTR1CDNRDashboard';
import GSTR1CDNRAddInvoice from './pages/GSTR1CDNRAddInvoice';
import GSTR1CDNURDashboard from './pages/GSTR1CDNURDashboard';
import GSTR1CDNURAddInvoice from './pages/GSTR1CDNURAddInvoice';
import GSTR1AdvTaxDashboard from './pages/GSTR1AdvTaxDashboard';
import GSTR1AdvTaxAddDetails from './pages/GSTR1AdvTaxAddDetails';
import GSTR1AdjAdvancesDashboard from './pages/GSTR1AdjAdvancesDashboard';
import GSTR1AdjAdvancesAddDetails from './pages/GSTR1AdjAdvancesAddDetails';
import GSTR1HSNSummary from './pages/GSTR1HSNSummary';
import GSTR1DocumentsIssued from './pages/GSTR1DocumentsIssued';
import GSTR1ECOSupplies from './pages/GSTR1ECOSupplies';
import GSTR1ECOAddRecord from './pages/GSTR1ECOAddRecord';
import GSTR1Supplies95Dashboard from './pages/GSTR1Supplies95Dashboard';
import GSTR1Supplies95AddDetails from './pages/GSTR1Supplies95AddDetails';
import GSTR1Summary from './pages/GSTR1Summary';
import GSTR1PrintPreview from './pages/GSTR1PrintPreview';
import AnnualReturn from './pages/AnnualReturn';
import GSTR9Questionnaire from './pages/GSTR9Questionnaire';
import Logout from './pages/Logout';
import ChangePassword from './pages/ChangePassword';
import MyProfile from './pages/MyProfile';
import TrackApplicationStatus from './pages/TrackApplicationStatus';
import CreateChallan from './pages/CreateChallan';
import GrievanceAgainstPayment from './pages/GrievanceAgainstPayment';
import TrackPaymentStatus from './pages/TrackPaymentStatus';
import SearchHsnCode from './pages/SearchHsnCode';
import CauseList from './pages/CauseList';
import VerifyRfn from './pages/VerifyRfn';
import HolidayList from './pages/HolidayList';
import NoticesAndOrders from './pages/NoticesAndOrders';
import LocateGstp from './pages/LocateGstp';
import GstLaw from './pages/GstLaw';
import ManageGstLinks from './pages/admin/ManageGstLinks';
import ManageGstStatistics from './pages/admin/ManageGstStatistics';
import GSTStatistics from './pages/GSTStatistics';
import SearchTaxpayerGSTIN from './pages/SearchTaxpayerGSTIN';
import SearchTaxpayerPAN from './pages/SearchTaxpayerPAN';
import SearchTaxpayerTempID from './pages/SearchTaxpayerTempID';
import SearchCompositionTaxpayer from './pages/SearchCompositionTaxpayer';
import ReasonForChallan from './pages/ReasonForChallan';
import SavedChallan from './pages/SavedChallan';
import ChallanHistory from './pages/ChallanHistory';
import ReturnsOfflineTool from './pages/ReturnsOfflineTool';
import Tran1OfflineTools from './pages/Tran1OfflineTools';
import GSTR3BOfflineUtility from './pages/GSTR3BOfflineUtility';
import ITC03OfflineTool from './pages/ITC03OfflineTool';
import GSTR7OfflineUtility from './pages/GSTR7OfflineUtility';
import SRM1OfflineTool from './pages/SRM1OfflineTool';
import GSTR10OfflineUtility from './pages/GSTR10OfflineUtility';
import GSTR9AOfflineUtility from './pages/GSTR9AOfflineUtility';
import GSTR4OfflineTool from './pages/GSTR4OfflineTool';
import IMSOfflineUtility from './pages/IMSOfflineUtility';
import GSTR2ADashboard from './pages/GSTR2ADashboard';
import GSTR2AB2BInvoices from './pages/GSTR2AB2BInvoices';
import GSTR2ACreditDebitNotes from './pages/GSTR2ACreditDebitNotes';
import GSTR2AAmendmentsB2B from './pages/GSTR2AAmendmentsB2B';
import GSTR2AAmendmentsCreditDebit from './pages/GSTR2AAmendmentsCreditDebit';
import GSTR2AECODocuments from './pages/GSTR2AECODocuments';
import GSTR2AAmendmentsECODocuments from './pages/GSTR2AAmendmentsECODocuments';
import GSTR2AISDCredits from './pages/GSTR2AISDCredits';
import GSTR2AAmendmentsISDCredits from './pages/GSTR2AAmendmentsISDCredits';
import GSTR2ATDSCredits from './pages/GSTR2ATDSCredits';
import GSTR2AAmendmentsTDSCredits from './pages/GSTR2AAmendmentsTDSCredits';
import GSTR2ATCSCredits from './pages/GSTR2ATCSCredits';
import GSTR2AImportGoodsOverseas from './pages/GSTR2AImportGoodsOverseas';
import GSTR2AImportSEZGoods from './pages/GSTR2AImportSEZGoods';
import GSTR2AOfflineDownload from './pages/GSTR2AOfflineDownload';
import { Navigate } from 'react-router-dom';
import MatchingOfflineTool from './pages/MatchingOfflineTool';
import Tran2OfflineTools from './pages/Tran2OfflineTools';
import ITC01OfflineTool from './pages/ITC01OfflineTool';
import ITC04OfflineTool from './pages/ITC04OfflineTool';
import GSTR4QuarterlyOfflineTool from './pages/GSTR4QuarterlyOfflineTool';
import GSTR8OfflineUtility from './pages/GSTR8OfflineUtility';
import SRM2OfflineUtility from './pages/SRM2OfflineUtility';
import GSTR9OfflineTool from './pages/GSTR9OfflineTool';
import GSTR9COfflineUtility from './pages/GSTR9COfflineUtility';
import TDSAndTCSOfflineTool from './pages/TDSAndTCSOfflineTool';

// GSTR-2B Modules
import GSTR2BDashboard from './pages/GSTR2BDashboard';
import GSTR2BSectionManager from './pages/GSTR2BSectionManager';
import GSTR2BSummary from './pages/GSTR2BSummary';
import GSTR2BPrintPreview from './pages/GSTR2BPrintPreview';
import GSTR2BB2BDetails from './pages/GSTR2BB2BDetails';

// GSTR-1 Amendment Modules
import GSTR1B2BAmendmentSummary from './pages/GSTR1B2BAmendmentSummary';
import GSTR1B2CLAmendmentSummary from './pages/GSTR1B2CLAmendmentSummary';
import GSTR1ExportAmendmentSummary from './pages/GSTR1ExportAmendmentSummary';
import GSTR1CDNRAmendmentSummary from './pages/GSTR1CDNRAmendmentSummary';
import GSTR1CDNURAmendmentSummary from './pages/GSTR1CDNURAmendmentSummary';
import GSTR1B2CSAmendmentSummary from './pages/GSTR1B2CSAmendmentSummary';
import GSTR1AdvTaxAmendmentSummary from './pages/GSTR1AdvTaxAmendmentSummary';
import GSTR1AdjAdvancesAmendmentSummary from './pages/GSTR1AdjAdvancesAmendmentSummary';
import GSTR1ECOAmendmentSummary from './pages/GSTR1ECOAmendmentSummary';
import GSTR1Supplies15AAmendmentSummary from './pages/GSTR1Supplies15AAmendmentSummary';

// Placeholders for GSTR-3B and IMS
import GSTR3BPlaceholder from './pages/GSTR3BPlaceholder';
import IMSPlaceholder from './pages/IMSPlaceholder';

import './App.css';

function App() {
  return (
    <Router basename="/gst">
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/services/registration/track-application-status" element={<TrackApplicationStatus />} />
          <Route path="/payment/create-challan" element={<CreateChallan />} />
          <Route path="/payment/create-challan/quarterly-return" element={<CreateChallan />} />
          <Route path="/payment/create-challan/other-payment" element={<CreateChallan />} />
          <Route path="/payment/saved-challan" element={<SavedChallan />} />
          <Route path="/payment/challan-history" element={<ChallanHistory />} />
          <Route path="/services/payments/grievance-against-payment" element={<GrievanceAgainstPayment />} />
          <Route path="/services/payments/track-payment-status" element={<TrackPaymentStatus />} />
          <Route path="/services/user-services/search-hsn-code" element={<SearchHsnCode />} />
          <Route path="/services/user-services/verify-rfn" element={<VerifyRfn />} />
          <Route path="/services/user-services/holiday-list" element={<HolidayList />} />
          <Route path="/services/user-services/cause-list" element={<CauseList />} />
          <Route path="/services/user-services/locate-gstp" element={<LocateGstp />} />
          <Route path="/services/user-services/notices-orders" element={<NoticesAndOrders />} />
          <Route path="/gst-law" element={<GstLaw />} />
          <Route path="/admin/gst-links" element={<ManageGstLinks />} />
          <Route path="/admin/gst-statistics" element={<ManageGstStatistics />} />
          <Route path="/gst-statistics" element={<GSTStatistics />} />
          <Route path="/search-taxpayer/gstin" element={<SearchTaxpayerGSTIN />} />
          <Route path="/search-taxpayer/pan" element={<SearchTaxpayerPAN />} />
          <Route path="/search-taxpayer/temp-id" element={<SearchTaxpayerTempID />} />
          <Route path="/search-taxpayer/composition" element={<SearchCompositionTaxpayer />} />
          {/* Fallback for the old route just in case */}
          <Route path="/payments/grievance" element={<GrievanceAgainstPayment />} />
          <Route path="/payments/track-status" element={<TrackPaymentStatus />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-username" element={<ForgotUsername />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/services/forgotpassword" element={<ForgotPassword />} />
          <Route path="/new-login" element={<NewUserLogin />} />
          <Route path="/download/returns" element={<ReturnsOfflineTool />} />
          <Route path="/download/trans1b" element={<Tran1OfflineTools />} />
          <Route path="/download/gstr3b" element={<GSTR3BOfflineUtility />} />
          <Route path="/download/itc03" element={<ITC03OfflineTool />} />
          <Route path="/download/gstr7" element={<GSTR7OfflineUtility />} />
          <Route path="/download/srm1" element={<SRM1OfflineTool />} />
          <Route path="/download/gstr10" element={<GSTR10OfflineUtility />} />
          <Route path="/download/gstr9a" element={<GSTR9AOfflineUtility />} />
          <Route path="/download/gstr4x" element={<GSTR4OfflineTool />} />
          <Route path="/download/ims" element={<IMSOfflineUtility />} />
          <Route path="/download/gstr2b" element={<MatchingOfflineTool />} />
          <Route path="/download/trans2" element={<Tran2OfflineTools />} />
          <Route path="/download/itc01" element={<ITC01OfflineTool />} />
          <Route path="/download/itc04" element={<ITC04OfflineTool />} />
          <Route path="/download/gstr4/offline" element={<GSTR4QuarterlyOfflineTool />} />
          <Route path="/download/gstr8" element={<GSTR8OfflineUtility />} />
          <Route path="/download/srm2" element={<SRM2OfflineUtility />} />
          <Route path="/download/gstr9" element={<GSTR9OfflineTool />} />
          <Route path="/download/gstr9c" element={<GSTR9COfflineUtility />} />
          <Route path="/download/gstr2x" element={<TDSAndTCSOfflineTool />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/returns-dashboard" element={<ReturnsDashboard />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/returns/gstr1" element={<GSTR1Dashboard />} />
          
          {/* GSTR-2B Return Routes */}
          <Route path="/returns/gstr2b" element={<GSTR2BDashboard />} />
          <Route path="/returns/gstr2b/section/b2b" element={<GSTR2BB2BDetails />} />
          <Route path="/returns/gstr2b/section/:secId" element={<GSTR2BSectionManager />} />
          <Route path="/returns/gstr2b/summary" element={<GSTR2BSummary />} />
          <Route path="/returns/gstr2b/pdf-preview" element={<GSTR2BPrintPreview />} />
          <Route path="/returns/gstr3b" element={<GSTR3BPlaceholder />} />
          <Route path="/returns/ims" element={<IMSPlaceholder />} />
          
          <Route path="/returns/annual-return" element={<AnnualReturn />} />
          <Route path="/returns/gstr9/questionnaire" element={<GSTR9Questionnaire />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/returns/gstr1/summary" element={<GSTR1Summary />} />
          <Route path="/returns/gstr1/pdf-preview" element={<GSTR1PrintPreview />} />
          <Route path="/returns/gstr2a" element={<GSTR2ADashboard />} />
          <Route path="/returns/gstr2a/b2b-invoices" element={<GSTR2AB2BInvoices />} />
          <Route path="/returns/gstr2a/credit-debit-notes" element={<GSTR2ACreditDebitNotes />} />
          <Route path="/returns/gstr2a/amendments-b2b" element={<GSTR2AAmendmentsB2B />} />
          <Route path="/returns/gstr2a/amendments-credit-debit" element={<GSTR2AAmendmentsCreditDebit />} />
          <Route path="/returns/gstr2a/eco-documents" element={<GSTR2AECODocuments />} />
          <Route path="/returns/gstr2a/amendments-eco-documents" element={<GSTR2AAmendmentsECODocuments />} />
          <Route path="/returns/gstr2a/isd-credits" element={<GSTR2AISDCredits />} />
          <Route path="/returns/gstr2a/amendments-isd-credits" element={<GSTR2AAmendmentsISDCredits />} />
          <Route path="/returns/gstr2a/tds-credits" element={<GSTR2ATDSCredits />} />
          <Route path="/returns/gstr2a/amendments-tds-credits" element={<GSTR2AAmendmentsTDSCredits />} />
          <Route path="/returns/gstr2a/tcs-credits" element={<GSTR2ATCSCredits />} />
          <Route path="/returns/gstr2a/import-goods-overseas" element={<GSTR2AImportGoodsOverseas />} />
          <Route path="/returns/gstr2a/import-overseas" element={<Navigate to="/returns/gstr2a/import-goods-overseas" replace />} />
          <Route path="/returns/gstr2a/import-sez-goods" element={<GSTR2AImportSEZGoods />} />
          <Route path="/returns/gstr2a/import-sez" element={<Navigate to="/returns/gstr2a/import-sez-goods" replace />} />
          <Route path="/returns/gstr2a/offline-download" element={<GSTR2AOfflineDownload />} />
          <Route path="/returns/gstr1/b2b" element={<GSTR1B2BDashboard />} />
          <Route path="/returns/gstr1/b2b/add" element={<GSTR1B2BAddInvoice />} />
          <Route path="/returns/auth/gstr1/b2b/amendment/summary" element={<GSTR1B2BAmendmentSummary />} />
          <Route path="/returns/auth/gstr1/b2cl/summary" element={<GSTR1B2CLDashboard />} />
          <Route path="/returns/gstr1/b2cl" element={<Navigate to="/returns/auth/gstr1/b2cl/summary" replace />} />
          <Route path="/returns/auth/gstr1/b2cl/add" element={<GSTR1B2CLAddInvoice />} />
          <Route path="/returns/auth/gstr1/b2cl/amendment/summary" element={<GSTR1B2CLAmendmentSummary />} />
          <Route path="/returns/gstr1/exports" element={<GSTR1ExportsDashboard />} />
          <Route path="/returns/gstr1/exports/add" element={<GSTR1ExportsAddInvoice />} />
          <Route path="/returns/auth/gstr1/export/amendment/summary" element={<GSTR1ExportAmendmentSummary />} />
          <Route path="/returns/gstr1/b2cs" element={<GSTR1B2CSDashboard />} />
          <Route path="/returns/gstr1/b2cs/add" element={<GSTR1B2CSAddInvoice />} />
          <Route path="/returns/auth/gstr1/b2cs/amendment/summary" element={<GSTR1B2CSAmendmentSummary />} />
          <Route path="/returns/gstr1/nilrated" element={<GSTR1NilRatedDashboard />} />
          <Route path="/returns/gstr1/nilrated/add" element={<GSTR1NilRatedAddInvoice />} />
          <Route path="/returns/gstr1/cdnr" element={<GSTR1CDNRDashboard />} />
          <Route path="/returns/gstr1/cdnr/add" element={<GSTR1CDNRAddInvoice />} />
          <Route path="/returns/auth/gstr1/cdn/registered/amendment/summary" element={<GSTR1CDNRAmendmentSummary />} />
          <Route path="/returns/gstr1/cdnur" element={<GSTR1CDNURDashboard />} />
          <Route path="/returns/gstr1/cdnur/add" element={<GSTR1CDNURAddInvoice />} />
          <Route path="/returns/auth/gstr1/cdn/unregistered/amendment/summary" element={<GSTR1CDNURAmendmentSummary />} />
          <Route path="/returns/gstr1/advtax" element={<GSTR1AdvTaxDashboard />} />
          <Route path="/returns/gstr1/advtax/add" element={<GSTR1AdvTaxAddDetails />} />
          <Route path="/returns/auth/gstr1/advtax/amendment/summary" element={<GSTR1AdvTaxAmendmentSummary />} />
          <Route path="/returns/gstr1/adjadvances" element={<GSTR1AdjAdvancesDashboard />} />
          <Route path="/returns/gstr1/adjadvances/add" element={<GSTR1AdjAdvancesAddDetails />} />
          <Route path="/returns/auth/gstr1/txpd/amendment/summary" element={<GSTR1AdjAdvancesAmendmentSummary />} />
          <Route path="/returns/gstr1/hsn" element={<GSTR1HSNSummary />} />
          <Route path="/returns/gstr1/documents" element={<GSTR1DocumentsIssued />} />
          <Route path="/returns/gstr1/eco" element={<GSTR1ECOSupplies />} />
          <Route path="/returns/gstr1/eco/add" element={<GSTR1ECOAddRecord />} />
          <Route path="/returns/auth/gstr1/ecomaopt/amendment/summary" element={<GSTR1ECOAmendmentSummary />} />
          <Route path="/returns/auth/gstr1/ecomaopt/lipaysum" element={<GSTR1ECOAmendmentSummary />} />
          <Route path="/returns/gstr1/sup95" element={<GSTR1Supplies95Dashboard />} />
          <Route path="/returns/gstr1/sup95/add" element={<GSTR1Supplies95AddDetails />} />
          <Route path="/returns/auth/gstr1/sup15a/summary" element={<GSTR1Supplies15AAmendmentSummary />} />
          <Route path="/returns/auth/gstr1/sup15a/b2ca_sum" element={<GSTR1Supplies15AAmendmentSummary />} />
          <Route path="/returns/auth/gstr1/sup15a/c2ba_sum" element={<GSTR1Supplies15AAmendmentSummary />} />
          <Route path="/returns/auth/gstr1/sup15a/c2ca_sum" element={<GSTR1Supplies15AAmendmentSummary />} />
          <Route path="/business-details" element={<BusinessDetails />} />

          <Route path="/promoter-partners" element={<PromoterPartners />} />
          <Route path="/authorized-signatory" element={<AuthorizedSignatory />} />
          <Route path="/authorized-representative" element={<AuthorizedRepresentative />} />
          <Route path="/principal-place-of-business" element={<PrincipalPlaceOfBusiness />} />
          <Route path="/additional-places-of-business" element={<AdditionalPlacesOfBusiness />} />
          <Route path="/goods-and-services" element={<GoodsAndServices />} />
          <Route path="/state-specific-information" element={<StateSpecificInformation />} />
          <Route path="/aadhaar-authentication" element={<AadhaarAuthentication />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/payment/reason-for-challan" element={<ReasonForChallan />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
