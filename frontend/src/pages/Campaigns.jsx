import React, { useState, useEffect } from 'react';
import CampaignCard from '../components/CampaignCard';
import { Search, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const Campaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/campaigns`);
                setCampaigns(response.data);
            } catch (error) {
                console.error("Error fetching campaigns:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCampaigns();
    }, []);

    const filteredCampaigns = campaigns.filter(campaign =>
        campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.short_description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto py-12 px-6">
            <div className="flex flex-col md:row md:items-center justify-between mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-text">Active campaigns</h1>
                    <p className="text-gray-500 mt-2">Every contribution, no matter how small, makes a difference.</p>
                </div>

                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search campaigns..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl w-full md:w-80 soft-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
            ) : filteredCampaigns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredCampaigns.map(campaign => (
                        <CampaignCard key={campaign.id} campaign={campaign} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-3xl soft-shadow border border-gray-50">
                    <p className="text-gray-400 text-lg">No active campaigns found matching your search.</p>
                </div>
            )}
        </div>
    );
};

export default Campaigns;
