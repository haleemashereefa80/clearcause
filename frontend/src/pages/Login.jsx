import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        // Logic for JWT login will go here
        navigate('/admin');
    };

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-6">
            <div className="max-w-md w-full mx-auto space-y-8">
                <div className="text-center">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-primary/20 mb-6">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-text">Admin Login</h2>
                    <p className="text-gray-500 mt-2 text-sm italic">"Only for authorized personnel"</p>
                </div>

                <div className="bg-white p-8 rounded-3xl soft-shadow border border-gray-100">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="admin@clearcause.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full lavender-gradient text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center group">
                            Login to Dashboard <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-50 text-center">
                        <p className="text-xs text-gray-400">
                            Trouble logging in? Contact the system administrator.
                        </p>
                    </div>
                </div>

                <div className="text-center">
                    <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-accent font-medium">
                        ← Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
