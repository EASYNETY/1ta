// app/(authenticated)/settings/page.tsx
"use client";

import React, { useState, useMemo, useEffect } from 'react'; // Added useEffect
import { useAppSelector } from '@/store/hooks';
import { useRouter, useSearchParams, usePathname } from 'next/navigation'; // Added usePathname
import Link from 'next/link'; // Import Link
import { cn } from '@/lib/utils';
import { User, Lock, Bell, Palette, Link as LinkIcon, Settings as AdminSettingsIcon, BookOpen } from 'lucide-react'; // Added BookOpen

// Import Setting Section Components (Create these)
// import SettingsProfileForm from '@/features/settings/components/SettingsProfileForm'; // REMOVE THIS
import SettingsSecurity from '@/features/settings/components/SettingsSecurity'; // Keep/Create
import SettingsNotifications from '@/features/settings/components/SettingsNotifications'; // Keep/Create
import SettingsAppearance from '@/features/settings/components/SettingsAppearance'; // Keep/Create
import SettingsStudentExtras from '@/features/settings/components/SettingsStudentExtras'; // Keep/Create (Links to /subscription/manage)
import SettingsTeacherExtras from '@/features/settings/components/SettingsTeacherExtras'; // Keep/Create
import SettingsAdmin from '@/features/settings/components/SettingsAdmin'; // Keep/Create

interface SettingNavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    component?: React.FC; // Make component optional
    href?: string; // Add href for navigation links
    roles: Array<'admin' | 'teacher' | 'student'>;
}

// Define Setting Sections - Profile is now a link
const settingSections: SettingNavItem[] = [
    // Profile Link
    { id: 'profile', label: 'Profile', icon: User, href: '/profile', roles: ['admin', 'teacher', 'student'] },
    // Settings Components rendered within this page
    { id: 'security', label: 'Security', icon: Lock, component: SettingsSecurity, roles: ['admin', 'teacher', 'student'] },
    { id: 'notifications', label: 'Notifications', icon: Bell, component: SettingsNotifications, roles: ['admin', 'teacher', 'student'] },
    { id: 'appearance', label: 'Appearance', icon: Palette, component: SettingsAppearance, roles: ['admin', 'teacher', 'student'] },
    // Role Specific (Subscription link & placeholders)
    { id: 'subscription', label: 'Subscription', icon: LinkIcon, component: SettingsStudentExtras, roles: ['student'] },
    { id: 'teaching', label: 'Teaching', icon: BookOpen, component: SettingsTeacherExtras, roles: ['teacher'] },
    { id: 'system', label: 'System', icon: AdminSettingsIcon, component: SettingsAdmin, roles: ['admin'] },
];

export default function SettingsPage() {
    const { user } = useAppSelector(state => state.auth);
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname(); // Get current full path

    // Determine active tab from URL, default to 'security' if on /settings itself,
    // or 'profile' if somehow landing without a tab but that might be confusing.
    const initialTab = searchParams.get('tab') || 'security'; // Default to first *renderable* section
    const [activeTab, setActiveTab] = useState(initialTab);

    // Filter navigation items based on user role
    const navItems = useMemo(() => {
        if (!user) return [];
        return settingSections.filter(section => section.roles.includes(user.role as any));
    }, [user]);

    // Update state if URL changes externally (e.g., browser back/forward)
    useEffect(() => {
        const currentTab = searchParams.get('tab');
        if (currentTab && currentTab !== activeTab) {
            // Only update if the tab exists in our available sections for the user
            if (navItems.some(item => item.id === currentTab)) {
                setActiveTab(currentTab);
            } else if (navItems.length > 0) {
                // Fallback to the first available *renderable* section if URL tab is invalid
                const firstValidTab = navItems.find(item => item.component)?.id || 'security';
                setActiveTab(firstValidTab);
                router.replace(`/settings?tab=${firstValidTab}`, { scroll: false }); // Correct URL
            }
        }
        // Set initial active tab if needed after navItems are calculated
        else if (!currentTab && navItems.length > 0) {
            const firstValidTab = navItems.find(item => item.component)?.id || 'security';
            if (activeTab !== firstValidTab) { // Avoid unnecessary update
                setActiveTab(firstValidTab);
                // Optionally update URL to reflect default, or leave it clean
                // router.replace(`/settings?tab=${firstValidTab}`, { scroll: false });
            }
        }

    }, [searchParams, activeTab, router, navItems]); // Add navItems dependency


    const handleTabChange = (tabId: string, href?: string) => {
        if (href) {
            router.push(href); // Navigate to external page like /profile
        } else {
            setActiveTab(tabId);
            router.push(`/settings?tab=${tabId}`, { scroll: false }); // Update URL for internal tabs
        }
    };

    // Find the component to render for the active tab (only if it's not a link)
    const ActiveComponent = useMemo(() => {
        const activeItem = navItems.find(item => item.id === activeTab);
        return activeItem?.component || null; // Return null if it's a link or not found
    }, [activeTab, navItems]);


    if (!user) return <div className="p-6">Loading user data...</div>;

    // Handle case where the activeTab doesn't correspond to a renderable component
    // This might happen if the user manually enters a URL like /settings?tab=profile
    if (pathname === '/settings' && !ActiveComponent && activeTab === 'profile') {
        // Optionally redirect to /profile immediately, or show a message
        // useEffect(() => { router.replace('/profile'); }, [router]); // Example redirect
        return <div className="p-6">Redirecting to profile...</div>; // Or keep the layout and show message
    }

    return (
        <div className="flex h-full min-h-[calc(100vh_-_var(--header-height,4rem))] flex-col md:flex-row gap-6 p-4 md:p-6">
            {/* Settings Navigation Sidebar */}
            <aside className="w-full md:w-1/4 lg:w-1/5 flex-shrink-0">
                <h2 className="text-lg font-semibold mb-4 px-2">Settings</h2>
                <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
                    {navItems.map(item => (
                        // Use Link for items with href, button for others
                        item.href ? (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                                    "hover:bg-muted hover:text-foreground",
                                    // Highlight profile link if on /profile page
                                    (item.id === 'profile' && pathname === '/profile')
                                        ? "bg-primary/10 text-primary font-semibold"
                                        : "text-muted-foreground"
                                )}
                                aria-current={pathname === item.href ? "page" : undefined}
                            >
                                <item.icon className="h-4 w-4 flex-shrink-0" />
                                {item.label}
                            </Link>
                        ) : (
                            <button
                                key={item.id}
                                onClick={() => handleTabChange(item.id, item.href)}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap text-left w-full", // Ensure button takes width
                                    "hover:bg-muted hover:text-foreground",
                                    activeTab === item.id
                                        ? "bg-primary/10 text-primary font-semibold"
                                        : "text-muted-foreground"
                                )}
                                aria-current={activeTab === item.id ? "page" : undefined}
                            >
                                <item.icon className="h-4 w-4 flex-shrink-0" />
                                {item.label}
                            </button>
                        )
                    ))}
                </nav>
            </aside>

            {/* Settings Content Area */}
            <main className="flex-1">
                {/* Render the component only if one is defined for the active tab */}
                {ActiveComponent ? <ActiveComponent /> : (
                    <div className="p-6 text-muted-foreground">Select a setting category.</div> // Placeholder
                )}
            </main>
        </div>
    );
}