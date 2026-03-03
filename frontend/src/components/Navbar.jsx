import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, User } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 px-6 py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link to="/" className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                        <Heart size={24} fill="white" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-text">Clear<span className="text-accent">Cause</span></span>
                </Link>

                <div className="hidden md:flex items-center space-x-8 text-gray-600 font-medium">
                    <Link to="/" className="hover:text-accent transition-colors">Home</Link>
                    <Link to="/donate" className="hover:text-accent transition-colors">Donate</Link>
                    <Link to="/about" className="hover:text-accent transition-colors">About</Link>
                    <Link to="/start-fundraiser" className="bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-accent transition-all soft-shadow">
                        Start a Fundraiser
                    </Link>
                </div>

                {/* Mobile menu toggle would go here */}
            </div>
        </nav>
    );
};

export default Navbar;
