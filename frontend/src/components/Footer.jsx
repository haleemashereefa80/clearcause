import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100 mt-20 px-6 py-12">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-text">Clear<span className="text-accent">Cause</span></h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        The most trusted crowdfunding platform for medical and personal causes. Making transparency our priority.
                    </p>
                </div>

                <div>
                    <h4 className="font-bold text-text mb-6">Quick Links</h4>
                    <ul className="space-y-3 text-sm text-gray-600">
                        <li><a href="#" className="hover:text-accent">About Us</a></li>
                        <li><a href="#" className="hover:text-accent">How it works</a></li>
                        <li><a href="#" className="hover:text-accent">Trust & Transparency</a></li>
                        <li><a href="#" className="hover:text-accent">80G Information</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-text mb-6">Legal</h4>
                    <ul className="space-y-3 text-sm text-gray-600">
                        <li><a href="#" className="hover:text-accent">Terms of Use</a></li>
                        <li><a href="#" className="hover:text-accent">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-accent">Cookie Policy</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-text mb-6">Contact</h4>
                    <ul className="space-y-4 text-sm text-gray-600">
                        <li className="flex items-start space-x-3">
                            <Mail size={18} className="text-primary mt-0.5" />
                            <span>support@clearcause.com</span>
                        </li>
                        <li className="flex items-start space-x-3">
                            <Phone size={18} className="text-primary mt-0.5" />
                            <span>+91 12345 67890</span>
                        </li>
                        <li className="flex items-start space-x-3">
                            <MapPin size={18} className="text-primary mt-0.5" />
                            <span>123, Lavender Lane, Tech Park, India</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-50 flex flex-col md:row justify-between items-center text-xs text-gray-400">
                <p>© 2026 Clear Cause Crowdfunding. All rights reserved.</p>
                <p className="mt-2 md:mt-0 font-bold text-success bg-success/10 px-4 py-1.5 rounded-full border border-success/20">Secure SSL Encrypted Payments</p>
            </div>
        </footer>
    );
};

export default Footer;
