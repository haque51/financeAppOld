import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Accounts from "./Accounts";

import Transactions from "./Transactions";

import Categories from "./Categories";

import Settings from "./Settings";

import Forecast from "./Forecast";

import Reconciliation from "./Reconciliation";

import Recurring from "./Recurring";

import Goals from "./Goals";

import Budget from "./Budget";

import Reports from "./Reports";

import DebtPayoff from "./DebtPayoff";

import Insights from "./Insights";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Accounts: Accounts,
    
    Transactions: Transactions,
    
    Categories: Categories,
    
    Settings: Settings,
    
    Forecast: Forecast,
    
    Reconciliation: Reconciliation,
    
    Recurring: Recurring,
    
    Goals: Goals,
    
    Budget: Budget,
    
    Reports: Reports,
    
    DebtPayoff: DebtPayoff,
    
    Insights: Insights,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Accounts" element={<Accounts />} />
                
                <Route path="/Transactions" element={<Transactions />} />
                
                <Route path="/Categories" element={<Categories />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/Forecast" element={<Forecast />} />
                
                <Route path="/Reconciliation" element={<Reconciliation />} />
                
                <Route path="/Recurring" element={<Recurring />} />
                
                <Route path="/Goals" element={<Goals />} />
                
                <Route path="/Budget" element={<Budget />} />
                
                <Route path="/Reports" element={<Reports />} />
                
                <Route path="/DebtPayoff" element={<DebtPayoff />} />
                
                <Route path="/Insights" element={<Insights />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}