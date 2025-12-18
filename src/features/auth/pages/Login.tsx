import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BrainCircuit, Mail, Lock, Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../../../firebase';

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const navigate = useNavigate();
    const location = useLocation();

    // 1. Lấy địa chỉ trang trước đó (nếu có), mặc định về Dashboard
    // Lưu ý: location.state?.from có thể là object hoặc string tùy cách gửi
    const from = location.state?.from || '/dashboard';

    // Xử lý đăng nhập bằng Email/Password
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setErrorMsg('');

        try {
            await signInWithEmailAndPassword(auth, data.email, data.password);
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
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
            {/* Header Logo */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link to="/" className="flex justify-center mb-6 group">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
                        <div className="relative bg-white rounded-full p-2">
                            <BrainCircuit className="h-10 w-10 text-indigo-600" />
                        </div>
                    </div>
                </Link>
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                    Chào mừng trở lại!
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline transition-all">
                        Đăng ký miễn phí ngay
                    </Link>
                </p>
            </div>

            {/* Form Card */}
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-xl sm:px-10 border border-gray-100">

                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        {/* Hiển thị lỗi */}
                        {errorMsg && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md animate-pulse">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">{errorMsg}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Input Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    {...register("email", {
                                        required: "Email không được để trống",
                                        pattern: { value: /^\S+@\S+$/i, message: "Email không hợp lệ" }
                                    })}
                                    className={`block w-full pl-10 pr-3 py-2.5 border ${errors.email ? 'border-red-300 ring-red-200' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm transition-all`}
                                    placeholder="name@example.com"
                                />
                            </div>
                            {errors.email && <p className="mt-1 text-xs text-red-600 font-medium">{errors.email.message as string}</p>}
                        </div>

                        {/* Input Password */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                                <a href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-500 hover:underline">Quên mật khẩu?</a>
                            </div>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    {...register("password", { required: "Vui lòng nhập mật khẩu" })}
                                    className={`block w-full pl-10 pr-3 py-2.5 border ${errors.password ? 'border-red-300 ring-red-200' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm transition-all`}
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-red-600 font-medium">{errors.password.message as string}</p>}
                        </div>

                        {/* Button Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
                        >
                            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Đăng nhập'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Hoặc đăng nhập với</span>
                            </div>
                        </div>

                        {/* Google Button */}
                        <div className="mt-6">
                            <button
                                onClick={handleGoogleLogin}
                                type="button"
                                className="w-full flex justify-center items-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:shadow-md"
                            >
                                {/* Bắt đầu Logo Google Chuẩn */}
                                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
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

                                <span>Tiếp tục với Google</span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;