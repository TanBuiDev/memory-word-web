import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, Mail, Lock, Loader2, Chrome } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../../../firebase';

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    // 1. Xử lý đăng nhập bằng Email/Password
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setErrorMsg('');

        try {
            // Gọi API Firebase
            const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
            // Firebase auth state sẽ tự động cập nhật qua onAuthStateChanged trong App.tsx
            // Không cần setUser thủ công vì App.tsx đã xử lý
            navigate('/');
        } catch (error: any) {
            setErrorMsg('Đăng nhập thất bại: ' + (error.message || 'Vui lòng thử lại'));
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Xử lý đăng nhập Google
    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setErrorMsg('');
        
        try {
            // Gọi API Firebase Google Sign-In
            await signInWithPopup(auth, provider);
            // Firebase auth state sẽ tự động cập nhật qua onAuthStateChanged trong App.tsx
            navigate('/');
        } catch (error: any) {
            setErrorMsg('Đăng nhập Google thất bại: ' + (error.message || 'Vui lòng thử lại'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            {/* Header Logo */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link to="/" className="flex justify-center mb-6">
                    <BrainCircuit className="h-12 w-12 text-indigo-600" />
                </Link>
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                    Đăng nhập vào MemoryWord
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Đăng ký miễn phí
                    </Link>
                </p>
            </div>

            {/* Form Card */}
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-100">

                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        {/* Hiển thị lỗi nếu có */}
                        {errorMsg && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                                <p className="text-sm text-red-700">{errorMsg}</p>
                            </div>
                        )}

                        {/* Input Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    {...register("email", {
                                        required: "Email không được để trống",
                                        pattern: { value: /^\S+@\S+$/i, message: "Email không hợp lệ" }
                                    })}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm outline-none transition-all"
                                    placeholder="name@example.com"
                                />
                            </div>
                            {errors.email && <p className="mt-1 text-xs text-red-600 font-medium">{errors.email.message as string}</p>}
                        </div>

                        {/* Input Password */}
                        <div>
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                                <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Quên mật khẩu?</a>
                            </div>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    {...register("password", { required: "Vui lòng nhập mật khẩu", minLength: { value: 6, message: "Tối thiểu 6 ký tự" } })}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-red-600 font-medium">{errors.password.message as string}</p>}
                        </div>

                        {/* Button Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
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
                                <span className="px-2 bg-white text-gray-500">Hoặc tiếp tục với</span>
                            </div>
                        </div>

                        {/* Google Button */}
                        <div className="mt-6">
                            <button
                                onClick={handleGoogleLogin}
                                className="w-full flex justify-center items-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all hover:shadow-md"
                            >
                                <Chrome className="h-5 w-5 text-blue-600 mr-2" />
                                Google
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;