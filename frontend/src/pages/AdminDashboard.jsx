import React, { useState } from 'react';
import { LayoutDashboard, FileText, Users, DollarSign, Settings, LogOut, CheckCircle, XCircle, Info, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

    // Real Data States
    const [stats, setStats] = useState({
        total_raised: 0,
        pending_requests: 0,
        active_campaigns: 0,
        total_donations: 0
    });
    const [requests, setRequests] = useState([]);
    const [donations, setDonations] = useState([]);
    const [campaignsList, setCampaignsList] = useState([]);
    const [volunteersList, setVolunteersList] = useState([]);
    const [selectedFullRequest, setSelectedFullRequest] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const API_BASE_URL = 'http://localhost:8000';

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('admin_token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const [statsRes, requestsRes, volunteersRes, campaignsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/admin/dashboard`, config).then(res => res.json()),
                    fetch(`${API_BASE_URL}/api/admin/requests`, config).then(res => res.json()),
                    fetch(`${API_BASE_URL}/api/admin/volunteers`, config).then(res => res.json()),
                    fetch(`${API_BASE_URL}/api/campaigns`).then(res => res.json())
                ]);

                setStats(statsRes);
                setRequests(requestsRes);
                setVolunteersList(volunteersRes);
                setCampaignsList(campaignsRes);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching admin data:", err);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const fetchDonations = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_BASE_URL}/api/admin/donations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setDonations(data);
        } catch (err) {
            console.error("Error fetching donations:", err);
        }
    };

    React.useEffect(() => {
        if (activeTab === 'donations') {
            fetchDonations();
        }
    }, [activeTab]);

    const dashboardStats = [
        { label: 'Total Raised', value: `₹${stats.total_raised.toLocaleString()}`, icon: <DollarSign className="text-green-500" /> },
        { label: 'Total Donations', value: stats.total_donations, icon: <CheckCircle className="text-blue-500" /> },
        { label: 'Pending Requests', value: stats.pending_requests, icon: <FileText className="text-orange-500" /> },
        { label: 'Active Campaigns', value: stats.active_campaigns, icon: <LayoutDashboard className="text-primary" /> },
    ];

    const volunteers = [
        { id: 'v1', name: 'Rahul Sharma', email: 'rahul@example.com', phone: '9876543210', verified: true, currentAssignment: 'Emergency Cancer Treatment...', verificationDetails: 'Aadhar Verified, Background Check Clear' },
        { id: 'v2', name: 'Priya Patel', email: 'priya@example.com', phone: '9876543211', verified: true, currentAssignment: null, verificationDetails: 'PAN Verified, Physical Address Verified' },
        { id: 'v3', name: 'Amit Singh', email: 'amit@example.com', phone: '9876543212', verified: false, currentAssignment: 'Health Camp for Slums', verificationDetails: 'Verification in Progress' },
    ];

    const handleUpdateStatus = (id, newStatus) => {
        console.log(`Updating status for ${id} to ${newStatus}`);
        // API call would go here
    };

    const renderRequestsTable = (limit = null) => {
        const displayedData = limit ? requests.slice(0, limit) : requests;

        if (displayedData.length === 0) {
            return <div className="p-8 text-center text-gray-400">No requests found.</div>;
        }

        return (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                            <th className="px-6 py-4">Requester</th>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Target</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {displayedData.map((req, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-text text-sm">{req.fundraiser_id.substring(0, 8)}...</p>
                                    <p className="text-[10px] text-gray-400 uppercase">{req.category}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-gray-500 text-sm truncate max-w-xs">{req.title}</p>
                                    <p className="text-[10px] text-gray-300 italic">{new Date(req.created_at).toLocaleDateString()}</p>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-text">₹{req.target_amount.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <div className="relative inline-block text-left">
                                        <select
                                            value={req.status}
                                            onChange={(e) => handleUpdateStatus(req.id, e.target.value)}
                                            className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase border border-gray-100 shadow-sm focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none transition-all ${req.status === 'approved' ? 'bg-green-50 text-success border-success/20' :
                                                req.status === 'submitted' ? 'bg-orange-50 text-orange-500 border-orange-200' :
                                                    req.status === 'rejected' ? 'bg-red-50 text-red-500 border-red-200' :
                                                        'bg-blue-50 text-blue-500 border-blue-200'
                                                }`}
                                        >
                                            <option value="submitted">Pending</option>
                                            <option value="under_review">Under Review</option>
                                            <option value="approved">Approved</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={async () => {
                                                setSelectedRequest(req);
                                                setIsDetailModalOpen(true);
                                                setLoadingDetails(true);
                                                try {
                                                    const token = localStorage.getItem('admin_token');
                                                    const res = await fetch(`${API_BASE_URL}/api/admin/requests/${req.id}`, {
                                                        headers: { Authorization: `Bearer ${token}` }
                                                    });
                                                    const data = await res.json();
                                                    setSelectedFullRequest(data);
                                                } catch (err) {
                                                    console.error("Error fetching details:", err);
                                                } finally {
                                                    setLoadingDetails(false);
                                                }
                                            }}
                                            className="p-2 hover:bg-primary/10 text-primary rounded-xl transition-all"
                                            title="View Full Details"
                                        >
                                            <FileText size={18} />
                                        </button>
                                        <button
                                            onClick={() => { setSelectedRequest(req); setIsAssignModalOpen(true); }}
                                            className="p-2 hover:bg-accent/10 text-accent rounded-xl transition-all"
                                            title="Assign Volunteer for Verification"
                                        >
                                            <Users size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderDonationsTable = () => {
        if (donations.length === 0) {
            return <div className="p-12 text-center text-gray-400">No donations recorded yet.</div>;
        }

        return (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                            <th className="px-6 py-4">Donor & Campaign</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Method</th>
                            <th className="px-6 py-4">Payment ID</th>
                            <th className="px-6 py-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {donations.map((d, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-text text-sm">{d.donor_name}</p>
                                    <p className="text-[10px] text-primary font-bold uppercase truncate max-w-[200px]">{d.campaign_title}</p>
                                </td>
                                <td className="px-6 py-4 text-sm font-black text-text">₹{d.amount.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold uppercase text-gray-500">{d.method}</span>
                                </td>
                                <td className="px-6 py-4 text-[11px] text-gray-400 font-mono">{d.payment_id || 'Pending'}</td>
                                <td className="px-6 py-4 text-xs text-gray-500">{d.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }; const renderCampaignsTable = () => {
        if (campaignsList.length === 0) {
            return <div className="p-12 text-center text-gray-400">No campaigns found.</div>;
        }

        return (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                            <th className="px-6 py-4">Title & Category</th>
                            <th className="px-6 py-4">Raised / Target</th>
                            <th className="px-6 py-4">Images</th>
                            <th className="px-6 py-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {campaignsList.map((c, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-text text-sm">{c.title}</p>
                                    <p className="text-[10px] text-gray-400 uppercase">{c.category}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm font-bold text-text">₹{c.raised_amount.toLocaleString()}</p>
                                    <p className="text-[10px] text-gray-400">of ₹{c.target_amount.toLocaleString()}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex -space-x-2 overflow-hidden">
                                        <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 overflow-hidden">
                                            <img src={c.image_url} className="h-full w-full object-cover" />
                                        </div>
                                        {/* Additional images will be shown here in future if returned by list API */}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => {
                                            const newUrl = prompt("Add new Image URL for this campaign:", "");
                                            if (newUrl) {
                                                // Call API to add image
                                                fetch(`${API_BASE_URL}/api/admin/campaigns/${c.id}/images`, {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
                                                    },
                                                    body: JSON.stringify({ image_url: newUrl })
                                                }).then(() => {
                                                    alert("Image added successfully!");
                                                    window.location.reload();
                                                });
                                            }
                                        }}
                                        className="text-primary text-xs font-bold hover:underline bg-primary/5 px-3 py-1 rounded-lg"
                                    >
                                        Manage Images
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {dashboardStats.map((stat, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-3xl soft-shadow border border-gray-50">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-gray-50 rounded-lg">
                                            {stat.icon}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                                    <h3 className="text-2xl font-bold text-text mt-1">{stat.value}</h3>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white rounded-3xl soft-shadow border border-gray-50 overflow-hidden">
                            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                                <h3 className="font-bold text-text">Recent Fundraiser Requests</h3>
                                <button onClick={() => setActiveTab('requests')} className="text-accent text-sm font-bold hover:underline">View All</button>
                            </div>
                            {renderRequestsTable(3)}
                        </div>
                    </div>
                );
            case 'requests':
                return (
                    <div className="bg-white rounded-3xl soft-shadow border border-gray-50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-6 border-b border-gray-50">
                            <h3 className="font-bold text-text">All Fundraiser Requests</h3>
                        </div>
                        {renderRequestsTable()}
                    </div>
                );
            case 'donations':
                return (
                    <div className="bg-white rounded-3xl soft-shadow border border-gray-50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-6 border-b border-gray-50">
                            <h3 className="font-bold text-text">Successfull Contributions</h3>
                        </div>
                        {renderDonationsTable()}
                    </div>
                );
            case 'campaigns':
                return (
                    <div className="bg-white rounded-3xl soft-shadow border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-text">Active Campaigns</h3>
                        </div>
                        {renderCampaignsTable()}
                    </div>
                );
            case 'assignments':
                return (
                    <div className="bg-white rounded-3xl soft-shadow border border-gray-50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-6 border-b border-gray-50">
                            <h3 className="font-bold text-text">Volunteer Fleet & Assignments</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                        <th className="px-6 py-4">Volunteer</th>
                                        <th className="px-6 py-4">Verification Details</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {volunteers.map((v) => (
                                        <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-text text-sm">{v.name}</p>
                                                <p className="text-xs text-gray-500">{v.email}</p>
                                                <p className="text-[10px] text-gray-400">{v.phone}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-600 line-clamp-1">{v.verificationDetails}</p>
                                                {v.currentAssignment && (
                                                    <div className="mt-1 flex items-center text-[10px] text-primary font-bold">
                                                        <CheckCircle size={10} className="mr-1" />
                                                        Currently assigned to: {v.currentAssignment}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${v.verified ? 'bg-green-50 text-success' : 'bg-gray-100 text-gray-400'}`}>
                                                    {v.verified ? 'Verified Active' : 'Unverified / Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="text-accent text-xs font-bold hover:underline">Full Profile</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'payouts':
                return (
                    <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CheckCircle size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-text">Payout Records</h3>
                        <p className="text-gray-400 mt-2">All previous payouts have been successfully processed.</p>
                    </div>
                );
            case 'settings':
                return (
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-xl font-bold text-text mb-6">General Settings</h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between py-4 border-b border-gray-50">
                                <div>
                                    <p className="font-bold text-text text-sm">Email Notifications</p>
                                    <p className="text-xs text-gray-400">Receive alerts for new fundraiser requests</p>
                                </div>
                                <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                            </div>
                            <div className="flex items-center justify-between py-4 border-b border-gray-50">
                                <div>
                                    <p className="font-bold text-text text-sm">Auto-Approval</p>
                                    <p className="text-xs text-gray-400">Automatically approve verified volunteer requests</p>
                                </div>
                                <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">
                <div className="p-6 border-b border-gray-50">
                    <h2 className="text-xl font-bold text-text">Admin<span className="text-accent">Panel</span></h2>
                </div>

                <nav className="flex-grow p-4 space-y-2">
                    {[
                        { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
                        { id: 'requests', label: 'Fundraiser Requests', icon: <FileText size={20} /> },
                        { id: 'campaigns', label: 'Manage Campaigns', icon: <LayoutDashboard size={20} /> },
                        { id: 'donations', label: 'Donation History', icon: <DollarSign size={20} /> },
                        { id: 'assignments', label: 'Volunteer Plans', icon: <Users size={20} /> },
                        { id: 'payouts', label: 'Payout Records', icon: <CheckCircle size={20} /> },
                        { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.id
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-50">
                    <button onClick={() => navigate('/')} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 transition-all">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow overflow-y-auto p-10 relative">
                <header className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-text capitalize">{activeTab.replace('_', ' ')}</h1>
                        <p className="text-gray-400 mt-1">Hello Admin, Today is {new Date().toLocaleDateString()}</p>
                    </div>
                </header>

                <div className="w-full">
                    {renderContent()}
                </div>

                {/* Detailed Request Modal */}
                {isDetailModalOpen && selectedRequest && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-10 border-b border-gray-50 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-3xl font-bold text-text">{selectedRequest.name}</h3>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${selectedRequest.status === 'Approved' ? 'bg-green-50 text-success' : 'bg-orange-50 text-orange-500'}`}>{selectedRequest.status}</span>
                                    </div>
                                    <p className="text-gray-400 text-sm">Case ID: REQ-{selectedRequest.id?.toUpperCase()} • Requested {selectedRequest.date}</p>
                                </div>
                                <button onClick={() => setIsDetailModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <XCircle size={24} className="text-gray-400" />
                                </button>
                            </div>
                            <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Goal & Category</h4>
                                    <div className="flex items-baseline space-x-4">
                                        <p className="text-3xl font-black text-text">{selectedRequest.goal}</p>
                                        <p className="text-primary font-bold bg-primary/5 px-3 py-1 rounded-lg text-sm">{selectedRequest.category}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Fundraiser Title</h4>
                                    <p className="text-text font-bold text-xl leading-relaxed">{selectedRequest.title}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Reason / Description</h4>
                                    <p className="text-gray-500 leading-relaxed text-sm bg-gray-50 p-6 rounded-3xl border border-gray-100">{selectedRequest.description}</p>
                                </div>
                                {loadingDetails ? (
                                    <div className="flex justify-center py-24">
                                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : selectedFullRequest ? (
                                    <>
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Verification Documents</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                {[
                                                    { name: 'Aadhaar / PAN', url: selectedFullRequest.request.kyc_aadhaar_pan },
                                                    { name: 'Address Proof', url: selectedFullRequest.request.kyc_address_proof },
                                                    { name: 'Selfie', url: selectedFullRequest.request.kyc_selfie },
                                                    { name: 'Bank Passbook', url: selectedFullRequest.bank_details?.passbook_image }
                                                ].filter(doc => doc.url).map((doc, idx) => (
                                                    <div key={idx} className="p-4 bg-white rounded-2xl border border-gray-100 flex flex-col space-y-3 hover:border-primary/30 transition-all group">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="p-2 bg-primary/5 rounded-lg text-primary">
                                                                    <FileText size={18} />
                                                                </div>
                                                                <span className="text-xs font-bold text-text truncate max-w-[120px]">{doc.name}</span>
                                                            </div>
                                                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                                <ExternalLink size={14} className="text-gray-300 group-hover:text-primary transition-colors" />
                                                            </a>
                                                        </div>
                                                        <div className="h-32 bg-gray-50 rounded-xl overflow-hidden cursor-pointer" onClick={() => window.open(doc.url, '_blank')}>
                                                            <img src={doc.url} alt={doc.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {selectedFullRequest.images && selectedFullRequest.images.length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Descriptive Images</h4>
                                                <div className="grid grid-cols-3 gap-4">
                                                    {selectedFullRequest.images.map((img, idx) => (
                                                        <div key={idx} className="h-24 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 group">
                                                            <img
                                                                src={img}
                                                                alt={`Description ${idx + 1}`}
                                                                className="w-full h-full object-cover cursor-pointer group-hover:scale-110 transition-transform"
                                                                onClick={() => window.open(img, '_blank')}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="p-8 text-center text-gray-400">Failed to load details. Click "Dismiss" and try again.</div>
                                )}
                            </div>
                            <div className="p-10 bg-gray-50/50 border-t border-gray-50 flex justify-end space-x-4">
                                <button onClick={() => setIsDetailModalOpen(false)} className="px-8 py-3.5 rounded-2xl font-bold text-sm bg-white text-gray-500 border border-gray-200 hover:bg-gray-100 transition-all">Dismiss</button>
                                <button
                                    onClick={async () => {
                                        if (!window.confirm("Are you sure you want to reject this request?")) return;
                                        const token = localStorage.getItem('admin_token');
                                        await fetch(`${API_BASE_URL}/api/admin/requests/${selectedRequest.id}/status`, {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                            body: JSON.stringify({ status: 'rejected' })
                                        });
                                        alert("Request rejected.");
                                        window.location.reload();
                                    }}
                                    className="px-8 py-3.5 rounded-2xl font-bold text-sm bg-red-500 text-white shadow-lg shadow-red-500/20 hover:scale-105 transition-all">Reject</button>
                                <button
                                    onClick={async () => {
                                        if (!window.confirm("Approve this fundraiser and launch the live campaign?")) return;
                                        const token = localStorage.getItem('admin_token');
                                        await fetch(`${API_BASE_URL}/api/admin/approve/${selectedRequest.id}`, {
                                            method: 'POST',
                                            headers: { 'Authorization': `Bearer ${token}` }
                                        });
                                        alert("Campaign launched successfully!");
                                        window.location.reload();
                                    }}
                                    className="px-8 py-3.5 rounded-2xl font-bold text-sm bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 transition-all">Approve & Publish</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Assign Volunteer Modal */}
                {isAssignModalOpen && selectedRequest && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="p-10 border-b border-gray-50">
                                <h3 className="text-2xl font-bold text-text mb-2">Assign Verification</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">Choose a volunteer for offline verification of <strong>{selectedRequest.name}'s</strong> request.</p>
                            </div>
                            <div className="p-10 space-y-4 max-h-96 overflow-y-auto custom-scrollbar bg-gray-50/30">
                                {volunteers.map(v => (
                                    <div
                                        key={v.id}
                                        className={`p-5 rounded-3xl border transition-all cursor-pointer flex justify-between items-center group ${v.currentAssignment ? 'opacity-50 border-gray-100 bg-gray-100/50 cursor-not-allowed' : 'border-white bg-white hover:border-primary/30 hover:shadow-xl shadow-sm'}`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${v.verified ? 'bg-green-50 text-success' : 'bg-gray-100 text-gray-400'}`}>
                                                {v.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-text text-sm">{v.name}</p>
                                                <p className="text-[10px] text-gray-400">{v.verified ? '✓ Verified Volunteer' : 'Pending Verification'}</p>
                                                {v.currentAssignment && <p className="text-[9px] text-red-400 mt-1 font-bold italic">Busy: {v.currentAssignment}</p>}
                                            </div>
                                        </div>
                                        {!v.currentAssignment && (
                                            <button
                                                onClick={() => { console.log(`Assigned ${v.name}`); setIsAssignModalOpen(false); }}
                                                className="px-4 py-2 bg-primary text-white text-[10px] font-black rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                SELECT
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="p-10 border-t border-gray-50 bg-white flex justify-end">
                                <button onClick={() => setIsAssignModalOpen(false)} className="px-8 py-3.5 rounded-2xl font-bold text-sm bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all">Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
