import { useState } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import { 
    Eye, 
    EyeOff, 
    Loader2, 
    Lock, 
    Mail, 
    MessageSquare, 
    User, 
    Phone,
    Sparkles,
    ArrowRight,
    CheckCircle
} from "lucide-react";
import toast from "react-hot-toast";

const SignUpPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        fullName: "",
        confirmPassword: ""
    });
    const [focusedField, setFocusedField] = useState("");
    const { signup, isSigningUp } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.fullName.trim()) {
            toast.error("Vui lòng nhập họ tên");
            return;
        }
        
        if (!formData.email.trim()) {
            toast.error("Vui lòng nhập email");
            return;
        }
        
        if (!formData.password) {
            toast.error("Vui lòng nhập mật khẩu");
            return;
        }
        
        if (formData.password.length < 6) {
            toast.error("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }
        
        if (formData.password !== formData.confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp");
            return;
        }

        try {
            await signup({
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                password: formData.password
            });
            navigate("/");
        } catch (error) {
            console.error("Signup error:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-primary"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse-secondary"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-accent"></div>
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-4xl">
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                        
                        {/* Left Side - Form */}
                        <div className="bg-base-100/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-base-300/50 p-8 lg:p-12 animate-fade-in-up">
                            <div className="space-y-8">
                                {/* Header */}
                                <div className="text-center space-y-4">
                                    <div className="flex justify-center">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg animate-pulse">
                                                <MessageSquare className="w-8 h-8 text-white" />
                                            </div>
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center animate-bounce">
                                                <Sparkles className="w-3 h-3 text-white" />
                                            </div>
                                        </div>
                            </div>
                                    <div className="space-y-2">
                                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-gradient-shift">
                                            Join Michat
                                        </h1>
                                        <p className="text-base-content/70">
                                            Create your account and start connecting
                                        </p>
                        </div>
                    </div>

                                {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="form-control animate-fade-in-up">
                            <label className="label">
                                <span className="label-text font-medium">Full Name</span>
                            </label>
                                        <div className={`relative transition-all duration-300 ${
                                            focusedField === 'fullName' ? 'scale-105' : 'scale-100'
                                        }`}>
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <User className={`h-5 w-5 transition-colors duration-300 ${
                                                    focusedField === 'fullName' ? 'text-primary' : 'text-base-content/40'
                                                }`} />
                                </div>
                                <input
                                    type="text"
                                                className={`input input-bordered w-full pl-12 transition-all duration-300 ${
                                                    focusedField === 'fullName' ? 'border-primary shadow-lg' : ''
                                                }`}
                                                placeholder="John Doe"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                onFocus={() => setFocusedField('fullName')}
                                                onBlur={() => setFocusedField('')}
                                />
                            </div>
                        </div>

                                    <div className="form-control animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                            <label className="label">
                                <span className="label-text font-medium">Email</span>
                            </label>
                                        <div className={`relative transition-all duration-300 ${
                                            focusedField === 'email' ? 'scale-105' : 'scale-100'
                                        }`}>
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Mail className={`h-5 w-5 transition-colors duration-300 ${
                                                    focusedField === 'email' ? 'text-primary' : 'text-base-content/40'
                                                }`} />
                                </div>
                                <input
                                    type="email"
                                                className={`input input-bordered w-full pl-12 transition-all duration-300 ${
                                                    focusedField === 'email' ? 'border-primary shadow-lg' : ''
                                                }`}
                                                placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                onFocus={() => setFocusedField('email')}
                                                onBlur={() => setFocusedField('')}
                                />
                            </div>
                        </div>

                                    <div className="form-control animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <label className="label">
                                <span className="label-text font-medium">Password</span>
                            </label>
                                        <div className={`relative transition-all duration-300 ${
                                            focusedField === 'password' ? 'scale-105' : 'scale-100'
                                        }`}>
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className={`h-5 w-5 transition-colors duration-300 ${
                                                    focusedField === 'password' ? 'text-primary' : 'text-base-content/40'
                                                }`} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                                className={`input input-bordered w-full pl-12 pr-12 transition-all duration-300 ${
                                                    focusedField === 'password' ? 'border-primary shadow-lg' : ''
                                                }`}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                onFocus={() => setFocusedField('password')}
                                                onBlur={() => setFocusedField('')}
                                />
                                <button
                                    type="button"
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-primary transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                                    <EyeOff className="h-5 w-5" />
                                                ) : (
                                                    <Eye className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="form-control animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                                        <label className="label">
                                            <span className="label-text font-medium">Confirm Password</span>
                                        </label>
                                        <div className={`relative transition-all duration-300 ${
                                            focusedField === 'confirmPassword' ? 'scale-105' : 'scale-100'
                                        }`}>
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className={`h-5 w-5 transition-colors duration-300 ${
                                                    focusedField === 'confirmPassword' ? 'text-primary' : 'text-base-content/40'
                                                }`} />
                                            </div>
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                className={`input input-bordered w-full pl-12 pr-12 transition-all duration-300 ${
                                                    focusedField === 'confirmPassword' ? 'border-primary shadow-lg' : ''
                                                }`}
                                                placeholder="••••••••"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                onFocus={() => setFocusedField('confirmPassword')}
                                                onBlur={() => setFocusedField('')}
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-primary transition-colors"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-5 w-5" />
                                                ) : (
                                                    <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                                    <button 
                                        type="submit" 
                                        className="btn btn-primary w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-fade-in-up" 
                                        style={{ animationDelay: '0.4s' }}
                                        disabled={isSigningUp}
                                    >
                            {isSigningUp ? (
                                <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Creating Account...
                                </>
                            ) : (
                                            <>
                                                Create Account
                                                <ArrowRight className="h-5 w-5 ml-2" />
                                            </>
                            )}
                        </button>
                    </form>

                                {/* Toggle Mode */}
                                <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                                    <p className="text-base-content/70">
                            Already have an account?{" "}
                                        <Link 
                                            to="/login"
                                            className="link link-primary font-semibold hover:scale-105 transition-transform"
                                        >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

                        {/* Right Side - Michat Animation */}
                        <div className="hidden lg:flex items-center justify-center">
                            <div className="relative w-96 h-96 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                                {/* Floating Messages Animation */}
                                <div className="absolute inset-0">
                                    {[...Array(6)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute bg-base-100/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-base-300/50 animate-float"
                                            style={{
                                                left: `${20 + i * 15}%`,
                                                top: `${10 + i * 20}%`,
                                                animationDelay: `${i * 0.5}s`,
                                                animationDuration: `${3 + i * 0.5}s`
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                                    <MessageSquare className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="h-2 bg-base-300 rounded w-16"></div>
                                                    <div className="h-2 bg-base-300 rounded w-24"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Central Michat Logo */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative">
                                        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-2xl animate-pulse">
                                            <MessageSquare className="w-16 h-16 text-white" />
                                        </div>
                                        <div className="absolute -top-4 -right-4 w-8 h-8 bg-accent rounded-full flex items-center justify-center animate-bounce">
                                            <Sparkles className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center animate-bounce delay-1000">
                                            <CheckCircle className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* Connection Lines */}
                                <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
                                    <defs>
                                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="hsl(var(--p))" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="hsl(var(--s))" stopOpacity="0.3" />
                                        </linearGradient>
                                    </defs>
                                    {[...Array(8)].map((_, i) => (
                                        <line
                                            key={i}
                                            x1="50%"
                                            y1="50%"
                                            x2={`${20 + i * 10}%`}
                                            y2={`${15 + i * 15}%`}
                                            stroke="url(#lineGradient)"
                                            strokeWidth="2"
                                            className="animate-pulse"
                                            style={{ animationDelay: `${i * 0.2}s` }}
                                        />
                                    ))}
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;
