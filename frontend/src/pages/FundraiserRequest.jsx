import React, { useState } from 'react';
import { Upload, IndianRupee, Landmark, ShieldCheck, Mail, Phone, Info, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

import { API_BASE_URL } from '../api/config';

const FundraiserRequest = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [showAccountNumber, setShowAccountNumber] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState({
        main: '',
        aadhaar: '',
        address: '',
        selfie: '',
        passbook: '',
        descriptive_1: '',
        descriptive_2: '',
        descriptive_3: ''
    });
    const fileInputRef = React.useRef(null);
    const aadhaarInputRef = React.useRef(null);
    const addressInputRef = React.useRef(null);
    const selfieInputRef = React.useRef(null);
    const passbookInputRef = React.useRef(null);
    const descriptiveImagesRef = [React.useRef(null), React.useRef(null), React.useRef(null)];

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        category: 'Medical Emergency',
        title: '',
        description: '',
        target_amount: '',
        aadhaar_number: '',
        pan_number: '',
        kyc_aadhaar_pan: '',
        kyc_address_proof: '',
        kyc_selfie: '',
        account_holder: '',
        account_number: '',
        confirm_account_number: '',
        ifsc: '',
        bank_name: '',
        passbook_image: '',
        descriptive_images: []
    });

    const [accountError, setAccountError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'confirm_account_number' || name === 'account_number') {
            const otherField = name === 'confirm_account_number' ? formData.account_number : formData.confirm_account_number;
            if (value && otherField && value !== otherField) {
                setAccountError('Account numbers do not match');
            } else {
                setAccountError('');
            }
        }
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            setUploadedFiles(prev => ({ ...prev, [type]: file.name }));
            const formField = type === 'main' ? 'supporting_documents' :
                type === 'aadhaar' ? 'kyc_aadhaar_pan' :
                    type === 'address' ? 'kyc_address_proof' :
                        type === 'passbook' ? 'passbook_image' : 'kyc_selfie';

            setFormData(prev => ({ ...prev, [formField]: file.name }));
        }
    };

    const handleDescriptiveFileChange = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            const key = `descriptive_${index + 1}`;
            setUploadedFiles(prev => ({ ...prev, [key]: file.name }));

            setFormData(prev => {
                const newImages = [...prev.descriptive_images];
                newImages[index] = file.name;
                return { ...prev, descriptive_images: newImages };
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.account_number !== formData.confirm_account_number) {
            setStatus({ type: 'error', message: 'Account numbers do not match!' });
            return;
        }

        if (!uploadedFiles.passbook) {
            setStatus({ type: 'error', message: 'Please upload the first page of your bank passbook.' });
            return;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await axios.post(`${API_BASE_URL}/api/campaigns/request`, {
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone,
                title: formData.title,
                description: formData.description,
                target_amount: parseFloat(formData.target_amount),
                category: formData.category,
                aadhaar_number: formData.aadhaar_number,
                pan_number: formData.pan_number,
                kyc_aadhaar_pan: formData.kyc_aadhaar_pan,
                kyc_address_proof: formData.kyc_address_proof,
                kyc_selfie: formData.kyc_selfie,
                supporting_documents: formData.supporting_documents,
                account_holder: formData.account_holder,
                account_number: formData.account_number,
                ifsc: formData.ifsc,
                bank_name: formData.bank_name,
                passbook_image: formData.passbook_image,
                descriptive_images: formData.descriptive_images.filter(img => img !== '')
            });

            setStatus({ type: 'success', message: response.data.message });
            setStep(4); // Direct to success state
        } catch (error) {
            console.error('Submission error:', error);
            setStatus({
                type: 'error',
                message: error.response?.data?.detail || 'Failed to submit request. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    if (step === 4) {
        return (
            <div className="max-w-4xl mx-auto py-24 px-6 text-center">
                <div className="bg-white rounded-3xl p-12 soft-shadow border border-gray-100 space-y-6">
                    <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-3xl font-bold text-text">Application Submitted!</h2>
                    <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                        Thank you for reaching out to Clear Cause. Our team will manually verify your documents and get back to you at <strong>{formData.email}</strong> within 24-48 hours.
                    </p>
                    <div className="pt-8">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-accent transition-all"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <div className="bg-white rounded-3xl soft-shadow border border-gray-100 overflow-hidden">
                {/* Progress Bar */}
                <div className="h-2 w-full bg-gray-50">
                    <div className="h-full lavender-gradient transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
                </div>

                <div className="p-8 md:p-12">
                    <div className="mb-10 text-center">
                        <h1 className="text-3xl font-bold text-text">Start a Fundraiser</h1>
                        <p className="text-gray-500 mt-2">Fill in the details below to start raising funds for your cause.</p>
                    </div>

                    {status.message && (
                        <div className={`mb-8 p-4 rounded-xl flex items-center space-x-3 ${status.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                            {status.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                            <span className="text-sm font-medium">{status.message}</span>
                        </div>
                    )}

                    <form className="space-y-8" onSubmit={handleSubmit}>
                        {step === 1 ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h3 className="text-xl font-bold text-text border-b border-gray-50 pb-2">Campaign Details</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                                        <input
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleInputChange}
                                            type="text"
                                            placeholder="Your Name"
                                            className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Cause Category</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        >
                                            <option>Medical Emergency</option>
                                            <option>Education</option>
                                            <option>Community</option>
                                            <option>Environment</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                                        <input
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            type="email"
                                            placeholder="you@example.com"
                                            className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Phone Number</label>
                                        <input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            type="tel"
                                            placeholder="+91 98765 43210"
                                            className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Campaign Title</label>
                                    <input
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        type="text"
                                        placeholder="e.g. Help Rahul with Cancer Treatment"
                                        className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Campaign Story</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={5}
                                        placeholder="Describe your cause, who it helps, and why you need funds..."
                                        className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                        required
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Target Amount (₹)</label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                name="target_amount"
                                                value={formData.target_amount}
                                                onChange={handleInputChange}
                                                type="number"
                                                placeholder="500000"
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Upload Documents</label>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            onChange={(e) => handleFileChange(e, 'main')}
                                        />
                                        <div
                                            onClick={() => fileInputRef.current.click()}
                                            className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex items-center justify-center hover:bg-gray-50 cursor-pointer transition-all text-gray-400"
                                        >
                                            <Upload size={20} className="mr-2" />
                                            <span className="text-sm">{uploadedFiles.main || 'Upload Documents / Proofs'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center">
                                        Campaign Gallery (Add up to 3 images)
                                        <Info size={12} className="ml-2 text-primary" />
                                    </label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[0, 1, 2].map((idx) => (
                                            <div key={idx} className="space-y-2">
                                                <input
                                                    type="file"
                                                    ref={descriptiveImagesRef[idx]}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => handleDescriptiveFileChange(e, idx)}
                                                />
                                                <div
                                                    onClick={() => descriptiveImagesRef[idx].current.click()}
                                                    className={`aspect-square border-2 border-dashed ${uploadedFiles[`descriptive_${idx + 1}`] ? 'border-primary bg-primary/5' : 'border-gray-100 hover:bg-gray-50'} rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all`}
                                                >
                                                    {uploadedFiles[`descriptive_${idx + 1}`] ? (
                                                        <div className="text-center p-2">
                                                            <CheckCircle2 size={24} className="text-primary mx-auto mb-1" />
                                                            <p className="text-[8px] text-text font-bold truncate w-full">{uploadedFiles[`descriptive_${idx + 1}`]}</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Upload size={20} className="text-gray-300" />
                                                            <span className="text-[10px] text-gray-400 mt-1 font-bold">Image {idx + 1}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-gray-400 italic">These images will appear in a gallery on your campaign page to help donors understand your cause.</p>
                                </div>

                                <div className="pt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const requiredFields = ['full_name', 'email', 'phone', 'title', 'description', 'target_amount'];
                                            const missingField = requiredFields.find(field => !formData[field]);

                                            if (missingField) {
                                                const fieldName = missingField.replace('_', ' ');
                                                setStatus({ type: 'error', message: `Please fill in the ${fieldName} field.` });
                                                return;
                                            }

                                            if (!uploadedFiles.main) {
                                                setStatus({ type: 'error', message: 'Please upload the supporting documents / proofs first.' });
                                                return;
                                            }

                                            setStatus({ type: '', message: '' });
                                            setStep(2);
                                        }}
                                        className="w-full lavender-gradient text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all"
                                    >
                                        Next: KYC Verification
                                    </button>
                                </div>
                            </div>
                        ) : step === 2 ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <h3 className="text-xl font-bold text-text border-b border-gray-50 pb-2">KYC Verification</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Aadhaar Card Number</label>
                                        <input
                                            name="aadhaar_number"
                                            value={formData.aadhaar_number}
                                            onChange={handleInputChange}
                                            type="text"
                                            maxLength="12"
                                            placeholder="1234 5678 9012"
                                            className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">PAN Card Number</label>
                                        <input
                                            name="pan_number"
                                            value={formData.pan_number}
                                            onChange={handleInputChange}
                                            type="text"
                                            maxLength="10"
                                            placeholder="ABCDE1234F"
                                            className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Aadhaar / PAN */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Identity Proof (Aadhaar / PAN Upload)</label>
                                        <input type="file" ref={aadhaarInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'aadhaar')} />
                                        <div onClick={() => aadhaarInputRef.current.click()} className="border-2 border-dashed border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer transition-all">
                                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-3">
                                                <Upload size={24} />
                                            </div>
                                            <span className="text-sm font-medium text-text">{uploadedFiles.aadhaar || 'Click to upload Aadhaar or PAN Card'}</span>
                                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">PDF, JPG, or PNG (Max 5MB)</p>
                                        </div>
                                    </div>

                                    {/* Address Proof */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Address Proof</label>
                                        <input type="file" ref={addressInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'address')} />
                                        <div onClick={() => addressInputRef.current.click()} className="border-2 border-dashed border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer transition-all">
                                            <div className="w-12 h-12 bg-blue-50 text-blue-400 rounded-xl flex items-center justify-center mb-3">
                                                <Upload size={24} />
                                            </div>
                                            <span className="text-sm font-medium text-text">{uploadedFiles.address || 'Electricity Bill, Rent Agreement, etc.'}</span>
                                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">PDF, JPG, or PNG (Max 5MB)</p>
                                        </div>
                                    </div>

                                    {/* Selfie */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Selfie Verification</label>
                                        <input type="file" ref={selfieInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'selfie')} />
                                        <div onClick={() => selfieInputRef.current.click()} className="border-2 border-dashed border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer transition-all">
                                            <div className="w-12 h-12 bg-success/10 text-success rounded-xl flex items-center justify-center mb-3">
                                                <Upload size={24} />
                                            </div>
                                            <span className="text-sm font-medium text-text">{uploadedFiles.selfie || 'Take a selfie for verification'}</span>
                                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">Image files only</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!formData.aadhaar_number || !formData.pan_number) {
                                                setStatus({ type: 'error', message: 'Please enter your Aadhaar and PAN card numbers.' });
                                                return;
                                            }
                                            if (!uploadedFiles.aadhaar || !uploadedFiles.address || !uploadedFiles.selfie) {
                                                setStatus({ type: 'error', message: 'Please upload all required KYC documents.' });
                                                return;
                                            }
                                            setStatus({ type: '', message: '' });
                                            setStep(3);
                                        }}
                                        className="flex-[2] lavender-gradient text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all"
                                    >
                                        Next: Bank Details
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="bg-blue-50 p-6 rounded-2xl flex items-start space-x-4 border border-blue-100">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-400 shrink-0 shadow-sm">
                                        <Landmark size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-blue-900 text-sm">Secure Payout Setup</h4>
                                        <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                                            We use AES-256 encryption to protect your sensitive banking details. These will only be used to transfer the raised funds directly to the beneficiary's or hospital's account.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-text border-b border-gray-50 pb-2">Beneficiary Bank Details</h3>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Account Holder Name</label>
                                        <input
                                            name="account_holder"
                                            value={formData.account_holder}
                                            onChange={handleInputChange}
                                            type="text"
                                            placeholder="As per bank passbook"
                                            className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            required
                                            autoComplete="off"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Account Number</label>
                                            <div className="relative">
                                                <input
                                                    name="account_number"
                                                    value={formData.account_number}
                                                    onChange={handleInputChange}
                                                    type={showAccountNumber ? 'text' : 'password'}
                                                    placeholder="••••••••••••"
                                                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                    required
                                                    autoComplete="new-password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAccountNumber(!showAccountNumber)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                                                >
                                                    {showAccountNumber ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Confirm Account Number</label>
                                            <input
                                                name="confirm_account_number"
                                                value={formData.confirm_account_number}
                                                onChange={handleInputChange}
                                                type="text"
                                                placeholder="Re-enter to verify"
                                                className={`w-full px-4 py-4 bg-gray-50 border rounded-xl focus:ring-2 outline-none transition-all ${accountError ? 'border-red-400 focus:ring-red-200' : 'border-gray-100 focus:ring-primary/20'}`}
                                                required
                                            />
                                            {accountError && (
                                                <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider px-1 mt-1 flex items-center">
                                                    <AlertCircle size={10} className="mr-1" /> {accountError}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">IFSC Code</label>
                                            <input
                                                name="ifsc"
                                                value={formData.ifsc}
                                                onChange={handleInputChange}
                                                type="text"
                                                placeholder="SBIN0001234"
                                                className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase"
                                                required
                                                autoComplete="off"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">First Page of Passbook</label>
                                            <input type="file" ref={passbookInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'passbook')} />
                                            <div
                                                onClick={() => passbookInputRef.current.click()}
                                                className={`w-full px-4 py-4 bg-gray-50 border border-dashed rounded-xl focus:ring-2 outline-none transition-all flex items-center justify-center cursor-pointer ${uploadedFiles.passbook ? 'border-success/50 bg-success/5' : 'border-gray-200'}`}
                                            >
                                                <Upload size={18} className={`mr-2 ${uploadedFiles.passbook ? 'text-success' : 'text-gray-400'}`} />
                                                <span className={`text-sm ${uploadedFiles.passbook ? 'text-success font-medium' : 'text-gray-400'}`}>
                                                    {uploadedFiles.passbook || 'Upload Passbook Image'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Bank Name</label>
                                        <input
                                            name="bank_name"
                                            value={formData.bank_name}
                                            onChange={handleInputChange}
                                            type="text"
                                            placeholder="State Bank of India"
                                            className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex space-x-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-[2] lavender-gradient text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <ShieldCheck size={20} className="mr-2" /> Submit Application
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { icon: <ShieldCheck className="text-success" />, title: 'Verification', desc: 'Every fundraiser is manually verified by our team.' },
                    { icon: <Mail className="text-blue-400" />, title: 'Updates', desc: 'Donors receive regular updates on fund usage.' },
                    { icon: <Phone className="text-primary" />, title: 'Support', desc: 'Dedicated campaign manager for every approved fundraiser.' },
                ].map((item, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl soft-shadow border border-gray-50 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4">
                            {item.icon}
                        </div>
                        <h4 className="font-bold text-text text-sm mb-1">{item.title}</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div >
    );
};

export default FundraiserRequest;
