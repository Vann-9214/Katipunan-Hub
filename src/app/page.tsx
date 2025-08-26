// app/page.tsx (or pages/index.tsx for older versions)
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-16 py-6 bg-white">
        <div className="flex items-center space-x-4">
          <Image src="/logo.png" alt="Katipunan Hub Logo" width={300} height={120} />
          <div className="flex flex-col">
          </div>
        </div>
        
        <div className="flex items-center space-x-8">
          <div className="flex space-x-8">
            <div className="relative">
              <button className="px-4 py-2 text-gray-700 font-medium hover:text-red-800 transition">
                Home
              </button>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-800"></div>
            </div>
            <button className="px-4 py-2 text-gray-700 font-medium hover:text-red-800 transition">
              Services
            </button>
            <button className="px-4 py-2 text-gray-700 font-medium hover:text-red-800 transition">
              About us
            </button>
          </div>
          
          <div className="flex space-x-3 ml-8">
            <button className="px-6 py-2 text-gray-700 border border-gray-300 rounded-full font-medium hover:border-red-800 hover:text-red-800 transition">
              Log in
            </button>
            <button className="px-6 py-2 bg-red-800 text-white rounded-full font-medium hover:bg-red-900 transition">
              Sign up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="relative flex flex-col md:flex-row items-center justify-between px-16 py-20 bg-cover bg-center min-h-[80vh]"
        style={{ backgroundImage: "url('/background.png')" }}
      >
        {/* Left Side - Illustration */}
        <div className="relative mt-10 md:mt-0 z-10 flex-shrink-0">
          <Image
            src="/landing-illustration.png"
            alt="Students Illustration"
            width={500}
            height={500}
            className="max-h-[500px] w-auto"
          />
        </div>

        {/* Right Side - Text */}
        <div className="relative max-w-2xl z-10 text-right ml-auto">
          <h1 className="text-6xl font-extrabold leading-tight">
            <span className="text-yellow-500">STAY </span>
            <span className="text-red-800">CONNECTED</span>
          </h1>
          <h1 className="text-6xl font-extrabold mt-2 leading-tight">
            <span className="text-red-800">STAY</span>
            <span className="text-yellow-500">UPDATED</span>
          </h1>
          <p className="mt-8 text-xl text-gray-600 leading-relaxed max-w-xl ml-auto">
            From school events to lost & found, Katipunan Hub keeps the whole CIT community in one place
          </p>
          <div className="mt-10">
            <button className="px-8 py-4 bg-yellow-400 text-black rounded-full text-lg font-bold hover:bg-yellow-500 transition shadow-lg">
              JOIN THE HUB!
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}