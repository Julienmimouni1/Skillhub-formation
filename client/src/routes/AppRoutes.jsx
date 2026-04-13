import { Routes, Route } from 'react-router-dom';
import React, { Suspense } from 'react';

// Lazy Load Pages
// -- Core / Collaborator --
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const CreateRequest = React.lazy(() => import('../pages/WizardRequestForm'));
const RequestDetail = React.lazy(() => import('../pages/RequestDetail'));
const TrainingFollowUp = React.lazy(() => import('../pages/TrainingFollowUp'));
const Wishlist = React.lazy(() => import('../pages/Wishlist'));
const Catalog = React.lazy(() => import('../pages/Catalog'));
const PracticalApplicationPage = React.lazy(() => import('../pages/PracticalApplicationPage'));
const PracticalApplicationDetail = React.lazy(() => import('../pages/PracticalApplicationDetail'));
const SkillWallet = React.lazy(() => import('../pages/SkillWallet'));
const TrainingProposals = React.lazy(() => import('../pages/TrainingProposals'));
const Profile = React.lazy(() => import('../pages/Profile'));
const Help = React.lazy(() => import('../pages/Help'));

// -- Manager --
const TeamBudget = React.lazy(() => import('../pages/manager/TeamBudget'));
const TeamPracticalApplications = React.lazy(() => import('../pages/TeamPracticalApplications'));
const SkillMatrixPage = React.lazy(() => import('../pages/manager/SkillMatrixPage'));

// -- Admin / RH --
const AdminDashboard = React.lazy(() => import('../pages/admin/AdminDashboard'));
const OptimizationDashboard = React.lazy(() => import('../pages/rh/OptimizationDashboard'));
const RHPilotagePage = React.lazy(() => import('../pages/rh/RHPilotagePage'));
const CampaignList = React.lazy(() => import('../pages/Campaigns/CampaignList'));
const CampaignDetail = React.lazy(() => import('../pages/Campaigns/CampaignDetail'));
const CollaboratorProposals = React.lazy(() => import('../pages/admin/CollaboratorProposals'));
const CollaboratorsList = React.lazy(() => import('../pages/rh/CollaboratorsList'));
const CompliancePage = React.lazy(() => import('../pages/rh/CompliancePage'));
const DocumentLibrary = React.lazy(() => import('../pages/DocumentLibrary'));
const ProfessionalInterviewsPage = React.lazy(() => import('../pages/rh/ProfessionalInterviewsPage'));
const AnnualReviewsPage = React.lazy(() => import('../pages/rh/AnnualReviewsPage'));
const SixYearReviewPage = React.lazy(() => import('../pages/rh/SixYearReviewPage'));
const AuthorizationsPage = React.lazy(() => import('../pages/rh/AuthorizationsPage'));
const TrainingHistoryPage = React.lazy(() => import('../pages/rh/TrainingHistoryPage'));

const LoadingFallback = () => <div className="p-4 text-center">Chargement...</div>;

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* === COLLABORATEUR === */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="new-request" element={<CreateRequest />} />
        <Route path="requests/edit/:id" element={<CreateRequest />} />
        <Route path="requests/:id" element={<RequestDetail />} />
        <Route path="my-trainings" element={<TrainingFollowUp />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="catalog" element={<Catalog />} />
        <Route path="practical-application" element={<PracticalApplicationPage />} />
        <Route path="practical-application/:id" element={<PracticalApplicationDetail />} />
        <Route path="skill-wallet" element={<SkillWallet />} />
        <Route path="proposals" element={<TrainingProposals />} />
        <Route path="profile" element={<Profile />} />
        <Route path="help" element={<Help />} />

        {/* === MANAGER === */}
        <Route path="team-budget" element={<TeamBudget />} />
        <Route path="team-practical-application" element={<TeamPracticalApplications />} />
        <Route path="team-skills" element={<SkillMatrixPage />} />

        {/* === ADMIN / RH === */}
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="admin/proposals" element={<CollaboratorProposals />} />
        
        <Route path="rh/optimization" element={<OptimizationDashboard />} />
        <Route path="pilotage" element={<RHPilotagePage />} />
        
        <Route path="campaigns" element={<CampaignList />} />
        <Route path="campaigns/:id" element={<CampaignDetail />} />
        
        <Route path="collaborators" element={<CollaboratorsList />} />
        
        <Route path="rh/compliance" element={<CompliancePage />} />
        <Route path="rh/documents" element={<DocumentLibrary />} />
        <Route path="rh/compliance/professional" element={<ProfessionalInterviewsPage />} />
        <Route path="rh/compliance/annual" element={<AnnualReviewsPage />} />
        <Route path="rh/compliance/6-year-bilan" element={<SixYearReviewPage />} />
        <Route path="rh/compliance/authorizations" element={<AuthorizationsPage />} />
        <Route path="rh/training-history" element={<TrainingHistoryPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
