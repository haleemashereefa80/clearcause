import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const CampaignCard = ({ campaign }) => {
    const { id, title, short_description, target_amount, raised_amount, image_url, fundraiser_name } = campaign;
    const percentage = Math.min(Math.round((raised_amount / target_amount) * 100), 100);

    return (
        <Link to={`/campaign/${id}`} className="bg-white rounded-3xl overflow-hidden soft-shadow border border-gray-100 group transition-all hover:-translate-y-2 flex flex-col h-full relative">
            <div className="h-56 bg-gray-100 relative overflow-hidden">
                <img
                    src={(image_url && image_url !== 'None') ? image_url : `https://images.unsplash.com/photo-1532629345422-7515f3d16bb8?auto=format&fit=crop&q=80&w=800`}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1532629345422-7515f3d16bb8?auto=format&fit=crop&q=80&w=800";
                    }}
                />
                <div className="absolute top-4 left-4 bg-emerald-900/40 backdrop-blur-md text-white text-[9px] font-bold px-3 py-1.5 rounded-full uppercase flex items-center border border-white/20">
                    <ShieldCheck size={12} className="mr-1.5 text-emerald-400" /> Verified
                </div>
            </div>

            <div className="p-7 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-text line-clamp-2 leading-tight min-h-[3.5rem] group-hover:text-accent transition-colors">
                    {title}
                </h3>
                <p className="text-gray-400 text-sm mt-3 line-clamp-2 leading-relaxed">
                    {short_description}
                </p>

                <div className="mt-auto pt-8 space-y-5">
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-accent transition-all duration-1000 ease-out"
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>

                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Raised</p>
                            <p className="text-lg font-black text-text">₹{Number(raised_amount).toLocaleString()}</p>
                        </div>
                        <div className="text-right space-y-1">
                            <p className="text-[10px] text-gray-400">Target: ₹{Number(target_amount).toLocaleString()}</p>
                            <p className="text-lg font-black text-accent">{percentage}%</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <span className="text-[11px] font-bold text-gray-400">By {fundraiser_name || 'Anonymous'}</span>
                        <div className="bg-primary/10 text-primary px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                            Donate
                        </div>
                    </div>
                </div>
            </div>

            {percentage >= 100 && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                    <div className="bg-white px-6 py-3 rounded-full font-black text-accent shadow-xl border border-primary/20 scale-110">
                        Goal Achieved 🎉
                    </div>
                </div>
            )}
        </Link>
    );
};

export default CampaignCard;
