import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="w-full px-2">
            <div className="mx-auto max-w-7xl w-full grid grid-cols-2 md:grid-cols-3 items-center py-8 px-2">

                <div className="flex justify-start">
                    <Link className="flex items-baseline gap-1.5 text-lg lg:text-xl" href="/">
                        <div className="w-2.5 h-2.5 bg-black/90 rounded-full"></div>
                        shubh
                    </Link>
                </div>

                <div className="hidden md:flex justify-center items-center gap-10">
                    <Link href="/">Blogs</Link>
                    <Link href="https://shubhz.vercel.app/" target="_blank">About</Link>
                </div>

                <div className="flex justify-end items-center gap-2 md:gap-4">
                    <Link className="btn-secondary " href="/dashboard">Dashboard</Link>
                    <Link className="btn-cta" href="https://wa.me/917498503089" target="_blank">Contact</Link>
                </div>

            </div>
        </nav>
    );
}