import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BrainCircuit, Mail, Lock, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { auth, provider } from '../../../firebase';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const Login = () => {
    const { register, handleSubmit, formState: { errors }, getValues, trigger } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isResetMode, setIsResetMode] = useState(false);
    const [resetSuccessMsg, setResetSuccessMsg] = useState('');
    const [isUnverified, setIsUnverified] = useState(false); // New state for unverified users
    const [showPassword, setShowPassword] = useState(false);

    // Security States
    const [cooldown, setCooldown] = useState(0);
    const { executeRecaptcha } = useGoogleReCaptcha();

    const navigate = useNavigate();
    const location = useLocation();

    // 1. Lấy địa chỉ trang trước đó (nếu có), mặc định về Dashboard
    const from = location.state?.from || '/dashboard';

    // Timer cho Cooldown
    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cooldown]);

    // Xử lý đăng nhập bằng Email/Password
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setErrorMsg('');
        setIsUnverified(false);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);

            // Check Verification
            if (!userCredential.user.emailVerified) {
                setIsUnverified(true);
                setErrorMsg("Email chưa được kích hoạt. Vui lòng kiểm tra hộp thư.");
                // Note: We keeping user logged in locally to allow "Resend" but PublicRoute allows this now.
                return;
            }

            // 2. Điều hướng thông minh: Về trang đích, xóa lịch sử trang Login
            navigate(from, { replace: true });
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            // Xử lý thông báo lỗi thân thiện hơn
            let msg = "Đăng nhập thất bại.";
            if (error.code === 'auth/invalid-credential') msg = "Email hoặc mật khẩu không đúng.";
            if (error.code === 'auth/user-not-found') msg = "Tài khoản không tồn tại.";
            if (error.code === 'auth/wrong-password') msg = "Mật khẩu không đúng.";
            setErrorMsg(msg);
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý gửi lại email xác thực
    const handleResendVerification = async () => {
        if (cooldown > 0) return;
        setIsLoading(true);
        try {
            if (auth.currentUser && !auth.currentUser.emailVerified) {
                await sendEmailVerification(auth.currentUser);
                setResetSuccessMsg("Đã gửi lại email kích hoạt. Hãy kiểm tra hộp thư.");
                setCooldown(60);
                setIsUnverified(false); // Hide the specialized error UI, show success
            } else {
                setErrorMsg("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
            }
        } catch (error: any) {
            console.error(error);
            if (error.code === 'auth/too-many-requests') {
                setErrorMsg("Quá nhiều yêu cầu. Vui lòng thử lại sau.");
            } else {
                setErrorMsg("Gửi thất bại: " + error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý gửi email reset password
    const handleResetPassword = async () => {
        // 1. Kiểm tra Cooldown
        if (cooldown > 0) return;

        const email = getValues("email");
        const isValid = await trigger("email"); // Validate field email

        if (!isValid || !email) {
            setErrorMsg("Vui lòng nhập đúng định dạng email.");
            return;
        }

        setIsLoading(true);
        setErrorMsg('');
        setResetSuccessMsg('');

        try {
            // 2. Thực thi ReCAPTCHA
            if (!executeRecaptcha) {
                console.warn("ReCAPTCHA chưa sẵn sàng.");
                // Có thể return hoặc cho phép fallback tùy chính sách
            } else {
                const token = await executeRecaptcha('reset_password');
                if (!token) {
                    setErrorMsg("Xác thực bảo mật thất bại. Vui lòng thử lại.");
                    setIsLoading(false);
                    return;
                }
                // (Optional) Gửi token lên server để verify nếu có backend riêng
            }

            // 3. Gửi email
            await sendPasswordResetEmail(auth, email);
            setResetSuccessMsg(`Đã gửi liên kết khôi phục đến ${email}. Vui lòng kiểm tra hộp thư.`);

            // 4. Kích hoạt Cooldown (60s)
            setCooldown(60);

        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error(error);
            let msg = "Không thể gửi email khôi phục.";
            if (error.code === 'auth/user-not-found') msg = "Email này chưa được đăng ký.";
            if (error.code === 'auth/too-many-requests') msg = "Quá nhiều yêu cầu. Vui lòng thử lại sau.";
            setErrorMsg(msg);
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý đăng nhập Google
    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setErrorMsg('');

        try {
            await signInWithPopup(auth, provider);
            // 2. Điều hướng thông minh
            navigate(from, { replace: true });
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error(error);
            setErrorMsg('Đăng nhập Google thất bại. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-fuchsia-100 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[10%] left-[20%] w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-[20%] right-[20%] w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-[40%] w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            {/* Header Logo */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <Link to="/" className="flex justify-center mb-6 group">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-fuchsia-600 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
                        <div className="relative bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg ring-1 ring-black/5">
                            <BrainCircuit className="h-12 w-12 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600" color="url(#gradient)" />
                            {/* SVG Gradient definition for the icon */}
                            <svg width="0" height="0">
                                <linearGradient id="gradient" x1="100%" y1="100%" x2="0%" y2="0%">
                                    <stop stopColor="#7c3aed" offset="0%" />
                                    <stop stopColor="#c026d3" offset="100%" />
                                </linearGradient>
                            </svg>
                        </div>
                    </div>
                </Link>
                <h2 className="text-center text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600 drop-shadow-sm">
                    {isResetMode ? 'Khôi phục mật khẩu' : 'Chào mừng trở lại'}
                </h2>
                {!isResetMode && (
                    <div className="mt-2 text-center text-sm font-medium text-gray-600">
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 hover:underline transition-all">
                            Đăng ký miễn phí ngay
                        </Link>
                    </div>
                )}
            </div>

            {/* Form Card */}
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-white/70 backdrop-blur-xl py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)] sm:rounded-2xl sm:px-10 border border-white/50">

                    <form className="space-y-6" onSubmit={isResetMode ? (e) => e.preventDefault() : handleSubmit(onSubmit)}>
                        {/* Hiển thị lỗi */}
                        {errorMsg && (
                            <div className="bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm animate-shake">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
                                        {isUnverified && (
                                            <button
                                                type="button"
                                                onClick={handleResendVerification}
                                                disabled={isLoading || cooldown > 0}
                                                className="mt-2 text-xs font-bold text-red-600 hover:text-red-800 underline transition-colors"
                                            >
                                                {cooldown > 0 ? `Gửi lại sau(${cooldown}s)` : "Gửi lại email kích hoạt ngay"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Hiển thị thành công (Reset Mode) */}
                        {resetSuccessMsg && (
                            <div className="bg-green-50/80 backdrop-blur-sm border-l-4 border-green-500 p-4 rounded-r-xl shadow-sm animate-fade-in-up">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-green-700 font-medium">{resetSuccessMsg}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isResetMode && (
                            <p className="text-sm text-gray-600 text-center mb-4">
                                Nhập địa chỉ email của bạn, chúng tôi sẽ gửi một liên kết để bạn đặt lại mật khẩu.
                            </p>
                        )}

                        {/* Input Email */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Email</label>
                            <div className="relative rounded-xl shadow-sm group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    {...register("email", {
                                        required: "Email không được để trống",
                                        pattern: {
                                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                            message: "Email không hợp lệ (ví dụ: user@domain.com)"
                                        }
                                    })}
                                    className={`block w-full pl-10 pr-3 py-3 bg-white/50 border ${errors.email ? 'border-red-300 ring-red-200 focus:ring-red-300' : 'border-gray-200 focus:border-transparent focus:ring-fuchsia-500'} rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 sm:text-sm`}
                                    placeholder="name@example.com"
                                />
                            </div>
                            {errors.email && <p className="mt-1 ml-1 text-xs text-red-600 font-bold">{errors.email.message as string}</p>}
                        </div>

                        {/* Input Password (Hidden in Reset Mode) */}
                        {!isResetMode && (
                            <div className="animate-fade-in-up">
                                <div className="flex justify-between items-center mb-1 ml-1">
                                    <label className="block text-sm font-bold text-gray-700">Mật khẩu</label>
                                    <button
                                        type="button"
                                        onClick={() => { setIsResetMode(true); setErrorMsg(''); }}
                                        className="text-xs font-semibold text-indigo-600 hover:text-fuchsia-600 transition-colors"
                                    >
                                        Quên mật khẩu?
                                    </button>
                                </div>
                                <div className="relative rounded-xl shadow-sm group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        {...register("password", { required: "Vui lòng nhập mật khẩu" })}
                                        className={`block w-full pl-10 pr-10 py-3 bg-white/50 border ${errors.password ? 'border-red-300 ring-red-200 focus:ring-red-300' : 'border-gray-200 focus:border-transparent focus:ring-fuchsia-500'} rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 sm:text-sm`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-500 transition-colors focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {errors.password && <p className="mt-1 ml-1 text-xs text-red-600 font-bold">{errors.password.message as string}</p>}
                            </div>
                        )}

                        {/* Button Submit / Reset */}
                        {isResetMode ? (
                            <button
                                type="button"
                                onClick={handleResetPassword}
                                disabled={isLoading || cooldown > 0}
                                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-500/30 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-700 hover:to-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:scale-[0.98]"
                            >
                                {isLoading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
                                {isLoading ? 'Đang gửi...' : cooldown > 0 ? `Gửi lại sau(${cooldown}s)` : 'Gửi link khôi phục'}
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-500/30 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-700 hover:to-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:scale-[0.98]"
                            >
                                {isLoading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
                                {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                            </button>
                        )}

                        {/* Back button for Reset Mode */}
                        {isResetMode && (
                            <button
                                type="button"
                                onClick={() => { setIsResetMode(false); setErrorMsg(''); setResetSuccessMsg(''); }}
                                className="w-full flex justify-center items-center py-2 px-4 text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Quay lại đăng nhập
                            </button>
                        )}
                    </form>

                    {/* Divider & Google (Hidden in Reset Mode) */}
                    {!isResetMode && (
                        <>
                            <div className="mt-8">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-white/0 backdrop-blur-xl text-gray-500 font-medium bg-opacity-0">Hoặc tiếp tục với</span>
                                    </div>
                                </div>

                                {/* Google Button */}
                                <div className="mt-6">
                                    <button
                                        onClick={handleGoogleLogin}
                                        type="button"
                                        className="w-full flex justify-center items-center px-4 py-3 border border-gray-200 shadow-sm text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:shadow-md hover:-translate-y-0.5 transform active:scale-[0.98]"
                                    >
                                        {/* Bắt đầu Logo Google Chuẩn */}
                                        <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                                            <path
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                fill="#4285F4"
                                            />
                                            <path
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                fill="#34A853"
                                            />
                                            <path
                                                d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l2.66-2.84z"
                                                fill="#FBBC05"
                                            />
                                            <path
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                fill="#EA4335"
                                            />
                                        </svg>
                                        {/* Kết thúc Logo Google Chuẩn */}

                                        <span>Đăng nhập bằng Google</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Login;
