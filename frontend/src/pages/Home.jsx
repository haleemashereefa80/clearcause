import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Users, Trophy, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CampaignCard from '../components/CampaignCard';

import { API_BASE_URL } from '../api/config';

const Home = () => {
    const [featuredCampaigns, setFeaturedCampaigns] = useState([]);
    const [globalStats, setGlobalStats] = useState({
        total_raised: 0,
        total_donations: 0,
        active_campaigns: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [campaignsRes, statsRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/campaigns`),
                    axios.get(`${API_BASE_URL}/api/admin/dashboard`) // This stats endpoint is now public enough for read-only
                ]);

                setFeaturedCampaigns(campaignsRes.data.slice(0, 3));
                setGlobalStats(statsRes.data);
            } catch (error) {
                console.error("Error fetching home data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-20 pb-32 px-6">
                <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -mr-64 -mt-32"></div>
                <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl -ml-32 -mb-16"></div>

                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl font-bold text-text mb-6 tracking-tight leading-tight">
                        Crowdfunding with <span className="text-accent underline decoration-primary/30">Transparency</span>
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Clear Cause helps you raise funds for medical emergencies, personal causes, and community projects with 100% trust and verified donors.
                    </p>
                    <div className="flex flex-col sm:row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Link to="/donate" className="lavender-gradient text-white px-8 py-4 rounded-xl font-bold flex items-center group soft-shadow transform hover:scale-105 transition-all">
                            Explore Campaigns <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/start-fundraiser" className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-accent transition-all soft-shadow transform hover:scale-105">
                            Start a Fundraiser
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-white py-16 px-6 relative z-10 -mt-10 mx-6 rounded-3xl soft-shadow max-w-7xl lg:mx-auto border border-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    <div className="space-y-2">
                        <div className="w-12 h-12 bg-green-50 text-success rounded-xl flex items-center justify-center mx-auto mb-2">
                            <ShieldCheck size={28} />
                        </div>
                        <h2 className="text-4xl font-bold text-text">₹{globalStats.total_raised.toLocaleString()}+</h2>
                        <p className="text-gray-400 font-medium uppercase tracking-wider text-xs">Total Raised</p>
                    </div>
                    <div className="space-y-2">
                        <div className="w-12 h-12 bg-blue-50 text-blue-400 rounded-xl flex items-center justify-center mx-auto mb-2">
                            <Users size={28} />
                        </div>
                        <h2 className="text-4xl font-bold text-text">{globalStats.total_donations.toLocaleString()}+</h2>
                        <p className="text-gray-400 font-medium uppercase tracking-wider text-xs">Total Donors</p>
                    </div>
                    <div className="space-y-2">
                        <div className="w-12 h-12 bg-purple-50 text-primary rounded-xl flex items-center justify-center mx-auto mb-2">
                            <Trophy size={28} />
                        </div>
                        <h2 className="text-4xl font-bold text-text">{globalStats.active_campaigns}+</h2>
                        <p className="text-gray-400 font-medium uppercase tracking-wider text-xs">Active Campaigns</p>
                    </div>
                </div>
            </section>

            {/* Featured Campaigns Section */}
            <section className="max-w-7xl mx-auto py-24 px-6 w-full">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-text">Featured Campaigns</h2>
                        <p className="text-gray-500 mt-2">Verified causes that need your urgent support</p>
                    </div>
                    <Link to="/donate" className="text-accent font-bold hover:underline flex items-center">
                        View All <ArrowRight size={18} className="ml-1" />
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                ) : featuredCampaigns.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {featuredCampaigns.map((campaign) => (
                            <CampaignCard key={campaign.id} campaign={campaign} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl">
                        <p className="text-gray-400 font-medium">No campaigns found. Start the first one!</p>
                    </div>
                )}
            </section>

            {/* Trust Section */}
            <section className="bg-primary/5 py-24 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:row items-center justify-between gap-12">
                    <div className="max-w-xl">
                        <h2 className="text-4xl font-bold text-text mb-6">Trusted by Thousands</h2>
                        <p className="text-gray-600 leading-relaxed mb-8">
                            We understand that trust is the foundation of giving. That's why we verify every campaign with medical documents and volunteer visits before they go live.
                        </p>
                        <ul className="space-y-4">
                            {['100% Tax Benefit (80G)', '0% Platform Fee', 'Verified Fundraisers'].map((point) => (
                                <li key={point} className="flex items-center space-x-3 text-text font-medium">
                                    <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center text-white">
                                        <ShieldCheck size={14} fill="currentColor" />
                                    </div>
                                    <span>{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="w-full md:w-1/2 h-auto bg-white rounded-3xl soft-shadow overflow-hidden flex items-center justify-center border-4 border-white">
                        <img src="/assets/images/trust_illustration.png" alt="Trust and Community Illustration" className="w-full h-full object-contain" />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
