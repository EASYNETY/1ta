// components/layout/footer.tsx
'use client'; // Needed for useTheme and useEffect/useState

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Building2, MapPin } from 'lucide-react'; // Use Lucide icons

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button'; // Using base Button for simplicity, replace with DyraneButton if needed
import { FacebookLogo, InstagramLogo, TiktokLogo } from 'phosphor-react';
// Or import DyraneButton if you prefer its effects here:
// import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';

// --- Footer Link Constants ---
const footerLinks = {
    services: [
        { href: '/#courses', label: 'Training Courses' },
        { href: '/corporate-training', label: 'Corporate Training' },
        { href: '/certification-programs', label: 'Certification Programs' },
    ],
    resources: [
        { href: '/help-support', label: 'Support' },
        { href: '/contact', label: 'Contact' },
    ],
    legal: [
        { href: '/privacy-policy', label: 'Privacy Policy' },
        { href: '/terms-conditions', label: 'Terms & Conditions' },
        { href: '/cookies-policy', label: 'Cookies Policy' },
        { href: '/data-protection-policy', label: 'Data Protection Policy' },
        { href: '/student-code-of-conduct', label: 'Student Code of Conduct' },
        { href: '/refund-policy', label: 'Refund Policy' },
    ],
};

const socialLinks = [
    {
        href: 'https://www.linkedin.com/company/1tech-academy/?viewAsMember=true',
        label: 'LinkedIn',
        icon: ({ className, ...props }: React.HTMLAttributes<SVGElement>) => (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
            </svg>
        )
    },
    { href: 'https://www.instagram.com/1tech_academy?igsh=ZmptMDJyemtjZ2lm&utm_source=qr', label: 'Instagram', icon: InstagramLogo },
    { href: 'https://www.facebook.com/share/162ZNuWcgu/?mibextid=wwXIfr', label: 'Facebook', icon: FacebookLogo },
    { href: 'https://www.tiktok.com/@1tech.academy?_t=ZM-8vuaPPKBpLR&_r=1', label: 'Tiktok', icon: TiktokLogo },
    {
        href: 'https://www.youtube.com/@1techAcademy', label: 'YouTube', icon: ({ className, ...props }: React.HTMLAttributes<SVGElement>) => (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
            </svg>
        )
    },
];

// --- Main Footer Component ---
export function Footer() {
    const { theme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    // Determine the current theme for logo selection
    const currentTheme = mounted ? (theme === "system" ? systemTheme : theme) : undefined

    // Consistent hover color from NavBar example
    const linkHoverColor = 'hover:text-primary';
    const mutedTextColor = 'text-muted-foreground';

    return (
        <footer className="border-t border-border/40 bg-background py-6 md:py-8"> {/* More compact padding */}
            <div className="container mx-auto px-4 md:px-6">
                {/* Top section: Logo, Description, Links Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-6">
                    {/* Column 1: Logo, Description, Address, Socials */}
                    <div className="col-span-1 lg:col-span-1">
                        {/* Logo & Address */}
                        <div className="flex flex-col items-start gap-3 mb-4">
                            <Link href="/" className="">
                                {mounted && currentTheme && (
                                    <Image
                                        src={currentTheme === "dark" ? "/logo_md.jpg" : "/logo_mw.jpg"}
                                        alt="1techacademy Logo"
                                        className="h-6 w-auto"
                                        priority
                                        width={150}
                                        height={50}
                                    />
                                )}
                                {(!mounted || !currentTheme) && <div className="h-6 w-[80px] bg-muted rounded animate-pulse"></div>}
                            </Link>

                            {/* Company Address with Icons */}
                            <address className={cn('not-italic text-sm space-y-1', mutedTextColor)}>
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <span>1Tech Academy</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>17 Aje Street, Sabo Yaba Lagos.</span>
                                </div>
                            </address>
                        </div>

                        {/* Social Links */}
                        <div className="flex space-x-3">
                            {socialLinks.map((social) => (
                                <Link
                                    key={social.label}
                                    href={social.href}
                                    className={cn('transition-colors', mutedTextColor, linkHoverColor)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <span className="sr-only">{social.label}</span>
                                    <social.icon className="h-5 w-5" aria-hidden="true" />
                                </Link>
                            ))}
                        </div>
                    </div>


                    {/* Link Columns */}
                    {Object.entries(footerLinks).map(([key, links]) => (
                        <div key={key} className="space-y-3">
                            <h3 className="text-sm font-semibold text-foreground capitalize">{key}</h3>
                            <ul className="space-y-2">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className={cn('text-sm transition-colors', mutedTextColor, linkHoverColor)}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                </div>

                {/* Bottom section: Copyright, Language */}
                <div className="border-t border-border/40 pt-4 flex flex-col md:flex-row justify-between items-center gap-3">
                    <p className={cn('text-xs', mutedTextColor)}>
                        &copy; 2025 1Tech Academy. All rights reserved.
                    </p>
                    {/* Optional: Language switcher or other links */}
                    <div className="mt-2 md:mt-0">
                        <Button variant="ghost" size="sm" className={cn('text-xs', mutedTextColor)}>
                            English (US)
                        </Button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
