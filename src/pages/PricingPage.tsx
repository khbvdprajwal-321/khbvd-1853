import { useState } from 'react';
import { ArrowRight, Check, CheckCircle, ChevronLeft, CreditCard, Crown, Landmark, Smartphone, Star, X } from 'lucide-react';
import { navigate } from '@/App';
import { AppHeader } from '@/components/AppHeader';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  { id: 'free', name: 'Free', price: '₹0', period: 'forever', description: 'Start learning at no cost.', features: ['Basic subject learning', 'Practice assignments', 'Limited exams', 'Progress tracking'] },
  { id: 'monthly', name: 'Monthly', price: '₹69', period: '1 month', description: 'A low-cost trial for focused preparation.', features: ['Everything in Free', 'Unlimited practice exams', 'Detailed exam review', 'Assistant guidance'] },
  { id: 'quarterly', name: '3 Months', price: '₹199', period: '3 months', description: 'A focused preparation cycle.', features: ['Everything in Monthly', 'Study routines', 'Career Map', 'Resume skill-gap analysis'], popular: true },
  { id: 'half-yearly', name: '6 Months', price: '₹399', period: '6 months', description: 'Build consistent long-term progress.', features: ['Everything in 3 Months', 'Unlimited assignments', 'Advanced progress tracking', 'Priority guidance'] },
  { id: 'yearly', name: '1 Year', price: '₹699', period: '12 months', description: 'Best value for a complete journey.', features: ['Everything in 6 Months', 'Full CET, NEET, JEE prep', 'Degree and company prep', 'Best value for students'] },
];

const methods = [
  { id: 'upi', label: 'UPI', detail: 'Demo UPI checkout', icon: Smartphone },
  { id: 'card', label: 'Card', detail: 'Demo card checkout', icon: CreditCard },
  { id: 'netbanking', label: 'Net Banking', detail: 'Demo bank checkout', icon: Landmark },
] as const;

type PaymentMethod = typeof methods[number]['id'];

export function PricingPage() {
  const { profile, refreshProfile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const completeDemoPayment = async () => {
    if (!selectedPlan || !profile) {
      navigate('/auth/register');
      return;
    }
    if (selectedPlan.id === 'free') {
      navigate('/dashboard');
      return;
    }
    setProcessing(true);
    setError('');
    const { error: updateError } = await supabase.from('profiles').update({ is_premium: true, subscription_tier: 'premium' }).eq('id', profile.id);
    if (updateError) {
      setError('The demo checkout could not update your account. Please try again.');
      setProcessing(false);
      return;
    }
    window.localStorage.setItem('khbvd_demo_subscription', JSON.stringify({ plan: selectedPlan.id, paidAt: new Date().toISOString() }));
    await refreshProfile();
    setProcessing(false);
    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-700 mb-6"><ChevronLeft className="w-4 h-4" /> Return to Home</button>
        <div className="text-center mb-10"><span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">Demo plans</span><h1 className="text-3xl sm:text-4xl font-heading font-bold mt-2 mb-3">Choose your learning plan</h1><p className="text-slate-600 max-w-2xl mx-auto">This is a demonstration checkout. No real money is charged. Select any plan to preview the full student subscription experience.</p></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {plans.map((plan) => <div key={plan.id} className={`card p-5 relative flex flex-col ${plan.popular ? 'ring-2 ring-teal-500 border-teal-300 shadow-lg' : ''}`}>
            {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-teal-600 text-white text-xs font-bold rounded-full flex items-center gap-1"><Star className="w-3 h-3 fill-white" /> Popular</div>}
            <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center mb-4"><Crown className="w-5 h-5 text-teal-600" /></div>
            <h2 className="font-heading font-bold text-lg">{plan.name}</h2><div className="flex items-baseline gap-1 mb-1"><span className="text-2xl font-heading font-bold text-slate-900">{plan.price}</span></div><p className="text-xs text-slate-400 mb-4">{plan.period}</p><p className="text-sm text-slate-600 mb-5 min-h-10">{plan.description}</p>
            <ul className="space-y-2.5 mb-6 flex-1">{plan.features.map((feature) => <li key={feature} className="flex items-start gap-2"><Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" /><span className="text-xs text-slate-700">{feature}</span></li>)}</ul>
            <button onClick={() => { setSuccess(false); setError(''); setSelectedPlan(plan); }} className={`w-full px-3 py-2.5 font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 text-sm ${plan.popular ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{plan.id === 'free' ? 'Choose Free' : 'Try Demo Checkout'} <ArrowRight className="w-4 h-4" /></button>
          </div>)}
        </div>

        {selectedPlan && <section className="max-w-2xl mx-auto mt-10 card p-6 border-teal-200 ring-1 ring-teal-100">
          <div className="flex items-start justify-between gap-4 mb-5"><div><p className="text-xs uppercase tracking-wider font-semibold text-teal-600">Demo checkout</p><h2 className="text-xl font-heading font-bold mt-1">{selectedPlan.name} · {selectedPlan.price}</h2><p className="text-sm text-slate-500 mt-1">Choose a pretend payment method to complete the demo.</p></div><button onClick={() => setSelectedPlan(null)} className="text-slate-400 hover:text-slate-700" aria-label="Close checkout"><X className="w-5 h-5" /></button></div>
          <div className="grid sm:grid-cols-3 gap-3 mb-5">{methods.map((method) => <button key={method.id} onClick={() => setPaymentMethod(method.id)} className={`p-4 rounded-xl border text-left ${paymentMethod === method.id ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-300' : 'border-slate-200 hover:border-slate-300'}`}><method.icon className={`w-5 h-5 mb-2 ${paymentMethod === method.id ? 'text-teal-600' : 'text-slate-500'}`} /><p className="font-semibold text-sm">{method.label}</p><p className="text-xs text-slate-500 mt-0.5">{method.detail}</p></button>)}</div>
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">Demo only: pressing the button below marks the selected plan as active in this learning account. No payment is sent.</div>
          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
          {success ? <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3"><CheckCircle className="w-6 h-6 text-emerald-600" /><div><p className="font-semibold text-emerald-800">Demo subscription activated</p><p className="text-sm text-emerald-700">{selectedPlan.name} is now active. You can continue learning.</p></div><button onClick={() => navigate('/dashboard')} className="ml-auto btn-primary text-sm">Dashboard</button></div> : <button onClick={completeDemoPayment} disabled={processing} className="btn-primary w-full mt-4 disabled:opacity-50">{processing ? 'Activating demo plan...' : `Complete Demo Payment with ${paymentMethod.toUpperCase()}`}</button>}
        </section>}
      </main>
    </div>
  );
}
