import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, Calendar, User, FileText, QrCode, Loader2 } from 'lucide-react';
import axios from 'axios';
import DonationModal from '../components/DonationModal';

const API_BASE_URL = 'http://localhost:8000';

const CampaignDetail = () => {
    const { id } = useParams();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [campaign, setCampaign] = useState(null);
    const [donations, setDonations] = useState([]);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);

    const fetchCampaign = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/campaigns/${id}`);
            setCampaign(response.data.campaign);
            setDonations(response.data.donations);
            setImages(response.data.images || []);
        } catch (error) {
            console.error("Error fetching campaign details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaign();
    }, [id]);

    // Handle real-time refresh after donation
    const handleDonationSuccess = () => {
        // Wait a small bit for webhook to process, then refresh
        setTimeout(() => {
            fetchCampaign();
        }, 2000);

        // Also refresh periodically for 10 seconds just in case
        const interval = setInterval(fetchCampaign, 3000);
        setTimeout(() => clearInterval(interval), 12000);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="max-w-7xl mx-auto py-24 px-6 text-center">
                <h2 className="text-3xl font-bold text-text">Campaign not found</h2>
                <p className="text-gray-500 mt-4">The campaign you are looking for might have been closed or moved.</p>
                <button
                    onClick={() => window.location.href = '/donate'}
                    className="mt-8 bg-primary text-white px-8 py-3 rounded-xl font-bold"
                >
                    Back to Campaigns
                </button>
            </div>
        );
    }

    const percentage = Math.min(Math.round((campaign.raised_amount / campaign.target_amount) * 100), 100);
    const galleryImages = images.length > 0 ? images : [campaign.image_url];

    return (
        <div className="max-w-7xl mx-auto py-12 px-6">
            <DonationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                campaignId={campaign.id}
                campaignTitle={campaign.title}
                targetAmount={campaign.target_amount}
                raisedAmount={campaign.raised_amount}
                onSuccess={handleDonationSuccess}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-3xl overflow-hidden soft-shadow border border-gray-100">
                        <div className="relative h-[450px] bg-gray-100 group">
                            <img
                                src={galleryImages[activeImage]}
                                alt={campaign.title}
                                className="w-full h-full object-cover transition-opacity duration-500"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://images.unsplash.com/photo-1532629345422-7515f3d16bb8?auto=format&fit=crop&q=80&w=800";
                                }}
                            />

                            {/* Image Navigation Dots */}
                            {galleryImages.length > 1 && (
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 bg-black/20 backdrop-blur-md p-2 rounded-full">
                                    {galleryImages.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(idx)}
                                            className={`w-2.5 h-2.5 rounded-full transition-all ${activeImage === idx ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'}`}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Thumbnails overlaid on image */}
                            {galleryImages.length > 1 && (
                                <div className="absolute bottom-6 right-6 flex space-x-2">
                                    {galleryImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(idx)}
                                            className={`w-12 h-12 rounded-xl border-2 overflow-hidden transition-all ${activeImage === idx ? 'border-primary scale-110 shadow-lg' : 'border-white/20 opacity-70 hover:opacity-100'}`}
                                        >
                                            <img src={img} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-8">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="flex items-center bg-success text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                                    <ShieldCheck size={16} className="mr-1.5" /> Verified Cause
                                </div>
                                <div className="flex items-center text-gray-400 text-sm">
                                    <Calendar size={16} className="mr-1.5" /> Created Feb 15, 2026
                                </div>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold text-text mb-6">{campaign.title}</h1>

                            <div className="prose prose-lavender max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                                {campaign.description}
                            </div>

                            <div className="mt-12 pt-8 border-t border-gray-100">
                                <h3 className="text-xl font-bold text-text mb-4 flex items-center">
                                    <FileText className="mr-2 text-primary" /> Verification Documents
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {['Medical Report.pdf', 'Cost Estimate.pdf', 'Hospital ID Card.pdf'].map((doc, idx) => (
                                        <div key={idx} className="flex items-center p-3 border border-gray-50 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group">
                                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mr-3">
                                                <FileText size={20} />
                                            </div>
                                            <span className="text-xs font-medium text-gray-500 group-hover:text-accent truncate">{doc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-8 soft-shadow border border-gray-100">
                        <h3 className="text-xl font-bold text-text mb-6">Supporters ({donations.length})</h3>
                        <div className="space-y-6">
                            {donations.length === 0 ? (
                                <p className="text-gray-400 text-sm italic">Be the first one to support this cause!</p>
                            ) : (
                                donations.map((donor, idx) => (
                                    <div key={idx} className="flex items-center justify-between pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-text text-sm">
                                                    {donor.is_anonymous ? 'Anonymous' : donor.donor_name}
                                                </p>
                                                <p className="text-[10px] text-gray-400">
                                                    {new Date(donor.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-text text-sm">₹{donor.amount.toLocaleString()}</p>
                                            <p className="text-[10px] text-success font-bold uppercase tracking-widest">Verified</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Sticky Donation Card */}
                <div className="lg:col-span-1">
                    <div className="sticky top-32 space-y-6">
                        <div className="bg-white rounded-[2rem] p-8 soft-shadow border border-gray-100 text-center">
                            <div className="relative w-32 h-32 mx-auto mb-6">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle className="text-gray-100" strokeWidth="8" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
                                    <circle className="text-success" strokeWidth="8" strokeDasharray={364} strokeDashoffset={364 - (364 * percentage) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-text">{percentage}%</span>
                                </div>
                            </div>

                            <div className="space-y-1 mb-8">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Raised</p>
                                <h2 className="text-3xl font-bold text-accent">₹{campaign.raised_amount.toLocaleString()}</h2>
                                <p className="text-sm text-gray-400">of ₹{campaign.target_amount.toLocaleString()}</p>
                            </div>

                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full bg-accent text-white py-5 rounded-2xl font-bold text-xl hover:shadow-xl hover:shadow-accent/20 transform hover:-translate-y-1 transition-all mb-4"
                            >
                                Donate now
                            </button>

                            <p className="text-[10px] text-gray-400 mb-6 font-medium uppercase tracking-wider">Cards, Netbanking, UPI</p>

                            <div className="border-t border-gray-100 pt-6">
                                <p className="text-[10px] font-bold text-gray-400 mb-4 flex items-center justify-center uppercase tracking-widest">
                                    <span className="h-[1px] w-6 bg-gray-100 mr-3"></span> Fast Checkout <span className="h-[1px] w-6 bg-gray-100 ml-3"></span>
                                </p>

                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center">
                                    <div className="w-40 h-40 bg-white shadow-inner rounded-xl border border-gray-100 flex flex-col items-center justify-center mb-6 group cursor-pointer hover:bg-white transition-all transform hover:scale-105" onClick={() => setIsModalOpen(true)}>
                                        <QrCode size={80} className="text-gray-200 group-hover:text-primary transition-colors" />
                                        <span className="text-[9px] font-bold text-primary uppercase mt-2 tracking-wider">Generate QR</span>
                                    </div>

                                    <div className="w-full flex flex-col items-center space-y-4">
                                        <p className="text-[10px] text-gray-500 font-medium">Scan & donate with any app</p>
                                        <div className="flex justify-center w-full">
                                            <img
                                                src="/assets/images/upi-payment.webp"
                                                alt="Scan & donate with any app"
                                                className="h-10 object-contain"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-success/5 p-4 rounded-2xl border border-success/10 flex items-center justify-center space-x-3 text-success font-bold text-xs">
                            <ShieldCheck size={18} />
                            <span>Verified & Tax Exempt</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignDetail;
