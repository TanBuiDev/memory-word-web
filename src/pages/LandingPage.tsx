import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import HeroSection from '../features/landing/components/Hero';
import AboutSection from '../features/landing/components/About';
import ContactSection from '../features/landing/components/Contact';
import ScrollToTopButton from '../components/ui/ScrollToTopButton';

const LandingPage = () => {
    return (
        <div className="min-h-screen flex flex-col transition-colors duration-300">
            {/* Header sẽ tự động adapt dark mode */}
            <Header />

            <main className="grow">
                {/* Hero với gradient đẹp cả light/dark mode */}
                <div className="bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
                    <HeroSection />
                </div>

                {/* About với subtle pattern */}
                <div className="relative bg-white dark:bg-gray-900">
                    {/* Grid pattern nhẹ */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-size-[4rem_4rem] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] opacity-10" />
                    <div className="relative">
                        <AboutSection />
                    </div>
                </div>

                {/* Contact với solid color */}
                <div className="bg-gray-50 dark:bg-gray-800">
                    <ContactSection />
                </div>
            </main>

            <Footer />
            <ScrollToTopButton />
        </div>
    );
};

export default LandingPage;