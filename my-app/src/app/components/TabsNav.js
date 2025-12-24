'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TabNav({ slug }) {
    const pathname = usePathname();


    const isUpdated = pathname.includes('/blog/updated/');
    const isTargeting = pathname.includes('/blog/targeting/');

    const isOriginal = !isUpdated && !isTargeting;


    const tabs = [
        {
            label: 'Original Article',
            href: `/blog/${slug}`,
            isActive: isOriginal,
        },
        {
            label: 'Updated Article',
            href: `/blog/updated/${slug}`,
            isActive: isUpdated,
        },
        {
            label: 'Keyword Targeting',
            href: `/blog/targeting/${slug}`,
            isActive: isTargeting,
        },
    ];

    return (
        <div className="fixed bottom-[20px] left-1/2 z-50 -translate-x-1/2 transform">
            <nav className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white/80 p-1.5 shadow-xl backdrop-blur-md transition-all dark:border-neutral-800 dark:bg-black/80">
                {tabs.map((tab) => (
                    <Link
                        key={tab.label}
                        href={tab.href}
                        className={`relative rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 ease-out ${tab.isActive
                            ? 'bg-black text-white shadow-md dark:bg-white dark:text-black'
                            : 'text-neutral-600 hover:bg-neutral-100 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white'
                            }`}
                    >
                        {tab.label}
                    </Link>
                ))}
            </nav>
        </div>
    );
}