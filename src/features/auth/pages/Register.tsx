import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, Mail, Lock, Loader2, User, Eye, EyeOff } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '../../../firebase';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const Register = () => {
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // ReCAPTCHA
    const { executeRecaptcha } = useGoogleReCaptcha();

    const navigate = useNavigate();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            // 1. Verify ReCAPTCHA
            if (!executeRecaptcha) {
                console.warn("ReCAPTCHA not ready");
                // Fallback or return depending on strictness
            } else {
                const token = await executeRecaptcha('register');
                if (!token) {
                    setErrorMsg("Xác thực bảo mật thất bại. Vui lòng thử lại.");
                    setIsLoading(false);
                    return;
                }
            }

            // 2. Gọi API Firebase Đăng ký
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);

            // 3. Gửi email xác thực
            await sendEmailVerification(userCredential.user);

            // Cập nhật display name nếu có
            if (data.fullName && userCredential.user) {
                await updateProfile(userCredential.user, {
                    displayName: data.fullName
                });
            }

            // 4. Đăng xuất ngay lập tức để yêu cầu đăng nhập lại sau khi verify
            await signOut(auth);

            // Thông báo thành công
            setSuccessMsg('Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản trước khi đăng nhập.');
            setTimeout(() => {
                navigate('/login');
            }, 5000);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            setErrorMsg('Đăng ký thất bại: ' + (error.message || 'Vui lòng thử lại'));
        } finally {
            setIsLoading(false);
        }
    };

    const password = watch("password");

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-fuchsia-100 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[10%] left-[20%] w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-[20%] right-[20%] w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-[40%] w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

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
                    Tạo tài khoản mới
                </h2>
                <div className="mt-2 text-center text-sm font-medium text-gray-600">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 hover:underline transition-all">
                        Đăng nhập ngay
                    </Link>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-white/70 backdrop-blur-xl py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)] sm:rounded-2xl sm:px-10 border border-white/50">

                    {successMsg ? (
                        <div className="text-center p-6 bg-green-50/80 backdrop-blur-sm rounded-xl border border-green-200 shadow-sm animate-fade-in-up">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">Đăng ký thành công!</h3>
                            <p className="text-sm text-gray-500 mb-6">{successMsg}</p>
                            <Link to="/login" className="block w-full text-center bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                                Đến trang Đăng nhập
                            </Link>
                        </div>
                    ) : (
                        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
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
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 ml-1 mb-1">Họ và tên</label>
                                <div className="relative rounded-xl shadow-sm group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        {...register("fullName", { required: "Vui lòng nhập họ tên" })}
                                        className={`block w-full pl-10 pr-3 py-3 bg-white/50 border ${errors.fullName ? 'border-red-300 ring-red-200 focus:ring-red-300' : 'border-gray-200 focus:border-transparent focus:ring-fuchsia-500'} rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 sm:text-sm`}
                                        placeholder="Nguyễn Văn A"
                                    />
                                </div>
                                {errors.fullName && <p className="mt-1 ml-1 text-xs text-red-600 font-bold">{errors.fullName.message as string}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 ml-1 mb-1">Email</label>
                                <div className="relative rounded-xl shadow-sm group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        {...register("email", {
                                            required: "Vui lòng nhập email",
                                            pattern: {
                                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                                message: "Email không hợp lệ (ví dụ: user@domain.com)"
                                            }
                                        })}
                                        className={`block w-full pl-10 pr-3 py-3 bg-white/50 border ${errors.email ? 'border-red-300 ring-red-200 focus:ring-red-300' : 'border-gray-200 focus:border-transparent focus:ring-fuchsia-500'} rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 sm:text-sm`}
                                        placeholder="you@example.com"
                                    />
                                </div>
                                {errors.email && <p className="mt-1 ml-1 text-xs text-red-600 font-bold">{errors.email.message as string}</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 ml-1 mb-1">Mật khẩu</label>
                                <div className="relative rounded-xl shadow-sm group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        {...register("password", { required: "Vui lòng nhập mật khẩu", minLength: { value: 6, message: "Tối thiểu 6 ký tự" } })}
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

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 ml-1 mb-1">Nhập lại mật khẩu</label>
                                <div className="relative rounded-xl shadow-sm group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        {...register("confirmPassword", {
                                            required: "Vui lòng nhập lại mật khẩu",
                                            validate: value => value === password || "Mật khẩu không khớp"
                                        })}
                                        className={`block w-full pl-10 pr-10 py-3 bg-white/50 border ${errors.confirmPassword ? 'border-red-300 ring-red-200 focus:ring-red-300' : 'border-gray-200 focus:border-transparent focus:ring-fuchsia-500'} rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 sm:text-sm`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-500 transition-colors focus:outline-none"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="mt-1 ml-1 text-xs text-red-600 font-bold">{errors.confirmPassword.message as string}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-500/30 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-700 hover:to-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:scale-[0.98]"
                            >
                                {isLoading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
                                {isLoading ? 'Đang đăng ký...' : 'Đăng ký tài khoản'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Register;