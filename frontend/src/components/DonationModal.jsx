import React, { useState } from 'react';
import { X, IndianRupee, QrCode, CreditCard, ShieldCheck, ChevronLeft, ChevronDown, Loader2 } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL, UPI_ID } from '../api/config';



const DonationModal = ({ isOpen, onClose, campaignId, campaignTitle, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState(2500);
    const [tipPercent, setTipPercent] = useState(16);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const [errors, setErrors] = useState({});
    const [donorInfo, setDonorInfo] = useState({ name: '', contact: '' });

    const UPI_ID = import.meta.env.VITE_UPI_ID || 'haleemathazmiya313@okicici';

    const tipAmount = Math.round((amount * tipPercent) / 100);
    const totalAmount = amount + tipAmount;

    if (!isOpen) return null;

    const handlePayment = async () => {
        const newErrors = {};
        if (!donorInfo.name.trim()) newErrors.name = true;
        if (!donorInfo.contact.trim()) newErrors.contact = true;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            // 1. Create Order on Backend
            const orderResponse = await axios.post(`${API_BASE_URL}/api/donations/order`, {
                campaign_id: campaignId.toString(),
                donor_name: donorInfo.name,
                donor_email: donorInfo.contact.includes('@') ? donorInfo.contact : 'guest@clearcause.org',
                amount: totalAmount,
                is_anonymous: isAnonymous
            });

            const { order_id, key } = orderResponse.data;

            // 2. Configure Razorpay Options
            const options = {
                key: key,
                amount: totalAmount * 100,
                currency: "INR",
                name: "Clear Cause",
                description: `Donation for ${campaignTitle}`,
                order_id: order_id,
                handler: function (response) {
                    setStep(3); // Success Step
                    setLoading(false);
                    if (onSuccess) onSuccess(); // Notify parent
                },
                prefill: {
                    name: donorInfo.name,
                    email: donorInfo.contact.includes('@') ? donorInfo.contact : '',
                    contact: !donorInfo.contact.includes('@') ? donorInfo.contact : ''
                },
                theme: {
                    color: "#C8B6FF"
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error("Payment initiation failed:", error);
            setStatus({
                type: 'error',
                message: error.response?.data?.detail || "Failed to initiate payment. Please try again."
            });
            setLoading(false);
        }
    };

    const renderSuccess = () => (
        <div className="p-12 space-y-6 text-center animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={48} />
            </div>
            <h2 className="text-3xl font-bold text-text">Thank You!</h2>
            <p className="text-gray-500 leading-relaxed">
                Your donation of <strong>₹{totalAmount.toLocaleString()}</strong> towards <strong>{campaignTitle}</strong> has been received.
                A receipt has been sent to your contact details.
            </p>
            <div className="pt-8">
                <button
                    onClick={onClose}
                    className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-accent transition-all"
                >
                    Close Window
                </button>
            </div>
        </div>
    );

    const renderStep1 = () => (
        <div className="p-6 space-y-6 animate-in slide-in-from-right-4 duration-300">
            {/* Amount Section */}
            <div className="bg-primary/90 p-6 rounded-2xl text-white shadow-lg shadow-primary/20">
                <div className="flex gap-4">
                    <div className="flex-1 space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-widest opacity-70">Currency</label>
                        <div className="flex items-center text-lg font-bold border-b border-white/30 pb-1">
                            <IndianRupee size={16} className="mr-1" /> INR <ChevronDown size={14} className="ml-auto" />
                        </div>
                    </div>
                    <div className="flex-[2] space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-widest opacity-70">Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full bg-transparent text-2xl font-bold border-b border-white/30 outline-none focus:border-white transition-colors pb-1"
                        />
                    </div>
                </div>
            </div>

            {/* Tip Message */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <p className="text-xs text-gray-500 leading-relaxed mb-4">
                    Clear Cause charges NO fees. We rely on donors like you to cover for our expenses. Kindly consider a tip. Thank you 🙏
                </p>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Include a tip of</span>
                    <select
                        value={tipPercent}
                        onChange={(e) => setTipPercent(Number(e.target.value))}
                        className="bg-transparent font-bold text-text outline-none cursor-pointer border-b-2 border-primary/10 hover:border-primary transition-colors pb-1"
                    >
                        <option value={0}>0% (₹0)</option>
                        <option value={10}>10% (₹{(amount * 0.1).toFixed(0)})</option>
                        <option value={12}>12% (₹{(amount * 0.12).toFixed(0)})</option>
                        <option value={16}>16% (₹{(amount * 0.16).toFixed(0)})</option>
                        <option value={20}>20% (₹{(amount * 0.2).toFixed(0)})</option>
                    </select>
                </div>
            </div>

            {/* Status Message */}
            {status.message && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-medium border border-red-100 flex items-center">
                    <X size={14} className="mr-2" /> {status.message}
                </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4 pt-2">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={donorInfo.name}
                        onChange={(e) => {
                            setDonorInfo({ ...donorInfo, name: e.target.value });
                            if (errors.name) setErrors({ ...errors, name: false });
                        }}
                        className={`w-full border-b py-3 outline-none transition-colors placeholder:text-gray-300 font-medium ${errors.name ? 'border-red-400' : 'border-gray-100 focus:border-primary'}`}
                    />
                    {errors.name && <span className="text-[10px] text-red-500 absolute -bottom-4 left-0">Name is required</span>}
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Mobile number or Email ID"
                        value={donorInfo.contact}
                        onChange={(e) => {
                            setDonorInfo({ ...donorInfo, contact: e.target.value });
                            if (errors.contact) setErrors({ ...errors, contact: false });
                        }}
                        className={`w-full border-b py-3 outline-none transition-colors placeholder:text-gray-300 font-medium ${errors.contact ? 'border-red-400' : 'border-gray-100 focus:border-primary'}`}
                    />
                    {errors.contact && <span className="text-[10px] text-red-500 absolute -bottom-4 left-0">Contact info is required</span>}
                </div>

                <div className="flex items-center justify-between py-2 pt-2">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500">Keep my details private</span>
                        <div className="flex items-center text-[10px] text-gray-400 mt-1">
                            <ShieldCheck size={12} className="mr-1" />
                            We'll use your details only to send receipts.
                        </div>
                    </div>
                    <button
                        onClick={() => setIsAnonymous(!isAnonymous)}
                        className={`w-11 h-6 rounded-full transition-all relative ${isAnonymous ? 'bg-primary' : 'bg-gray-200'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isAnonymous ? 'left-6' : 'left-1'}`}></div>
                    </button>
                </div>
            </div>

            <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-full font-bold text-lg shadow-lg shadow-primary/20 hover:bg-opacity-90 transition-all active:scale-[0.98] flex items-center justify-center disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                {loading ? 'Processing...' : `Donate ₹${totalAmount.toLocaleString()}`}
            </button>
        </div>
    );

    const renderStep2QR = () => (
        <div className="p-8 space-y-8 animate-in zoom-in-95 duration-300 flex flex-col items-center">
            <div className="flex w-full items-center mb-2">
                <button onClick={() => setStep(1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2">
                    <ChevronLeft size={24} className="text-gray-600" />
                </button>
                <h3 className="text-lg font-bold text-text">Scan and pay using QR code</h3>
            </div>

            <div className="p-4 bg-white border border-gray-100 rounded-[2rem] shadow-xl relative group">
                <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(campaignTitle)}&am=${totalAmount}&cu=INR`)}`}
                    alt="UPI QR Code"
                    className="w-56 h-56 rounded-2xl"
                />
            </div>

            <div className="text-center space-y-4">
                <p className="text-xs text-gray-500 font-medium">
                    Scan & donate with any app
                </p>
                <div className="flex justify-center">
                    <img
                        src="/assets/images/upi-payment.webp"
                        alt="Scan & donate with any app"
                        className="h-12 object-contain hover:scale-105 transition-transform cursor-pointer"
                    />
                </div>
            </div>

            <div className="w-full bg-primary text-white py-4 rounded-xl text-center font-bold text-lg">
                You are paying ₹{totalAmount.toLocaleString()}
            </div>
        </div>
    );

    const renderStep2Card = () => (
        <div className="flex min-h-[500px] animate-in slide-in-from-right-4 duration-300">
            {/* Sidebar */}
            <div className="w-1/3 bg-gray-50 border-r border-gray-100 flex flex-col">
                {['debit', 'credit', 'netbanking'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setPaymentTab(tab)}
                        className={`w-full p-6 flex items-center justify-between transition-all border-b border-gray-100 last:border-0 ${paymentTab === tab ? 'bg-white border-l-4 border-l-primary' : 'hover:bg-gray-100'}`}
                    >
                        <div className="flex items-center gap-3">
                            <CreditCard size={18} className={paymentTab === tab ? 'text-primary' : 'text-gray-400'} />
                            <span className={`font-bold text-xs uppercase tracking-tight ${paymentTab === tab ? 'text-primary' : 'text-gray-500'}`}>
                                {tab === 'debit' ? 'Debit Card' : tab === 'credit' ? 'Credit Card' : 'Netbanking'}
                            </span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Form Area */}
            <div className="flex-1 p-8 space-y-8 flex flex-col">
                <div className="space-y-6 flex-grow">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name on card</label>
                        <input
                            type="text"
                            placeholder="As seen on card"
                            className="w-full border-b border-gray-100 py-3 outline-none focus:border-primary transition-colors font-medium"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Card number</label>
                        <input
                            type="text"
                            placeholder="1234 1234 1234 1234"
                            className="w-full border-b border-gray-100 py-3 outline-none focus:border-primary transition-colors font-medium tracking-widest"
                        />
                    </div>
                    <div className="flex gap-8">
                        <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expiry date</label>
                            <input
                                type="text"
                                placeholder="MM / YY"
                                className="w-full border-b border-gray-100 py-3 outline-none focus:border-primary transition-colors font-medium"
                            />
                        </div>
                        <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CVV</label>
                            <input
                                type="password"
                                placeholder="CVV"
                                className="w-full border-b border-gray-100 py-3 outline-none focus:border-primary transition-colors font-medium"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-8 space-y-4">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">You are paying</span>
                        <span className="font-bold text-text">₹ (INR) {totalAmount.toLocaleString()}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-full bg-primary text-white py-4 rounded-full font-bold text-lg shadow-lg shadow-primary/20"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-y-auto">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

            <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden relative z-10 animate-in zoom-in-95 duration-200 shadow-2xl">
                {/* Header */}
                <div className="px-6 py-5 flex justify-between items-center border-b border-gray-50 bg-white">
                    <h2 className="text-lg font-bold text-text">Make a secure donation</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="max-h-[85vh] overflow-y-auto custom-scrollbar">
                    {step === 3 ? renderSuccess() : renderStep1()}
                </div>
            </div>
        </div>
    );
};

export default DonationModal;
