// components/layout/footer.tsx
'use client'; // Needed for useTheme and useEffect/useState

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Github, Linkedin, TwitterIcon } from 'lucide-react'; // Use Lucide icons

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button'; // Using base Button for simplicity, replace with DyraneButton if needed
// Or import DyraneButton if you prefer its effects here:
// import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';

// --- Footer Link Constants (Example) ---
const footerLinks = {
    product: [
        { href: '#features', label: 'Features' },
        { href: '#', label: 'Pricing' }, // Replace # with actual link
        { href: '#', label: 'Roadmap' }, // Replace # with actual link
    ],
    resources: [
        { href: '#', label: 'Documentation' },
        { href: '#', label: 'Guides' },
        { href: '#', label: 'Support' },
    ],
    company: [
        { href: '#', label: 'About' },
        { href: '#', label: 'Careers' },
        { href: '#', label: 'Contact' },
    ],
    legal: [
        { href: '#', label: 'Privacy Policy' },
        { href: '#', label: 'Terms of Service' },
        { href: '#', label: 'Cookie Policy' },
    ],
};

const socialLinks = [
    { href: '#', label: 'Twitter', icon: TwitterIcon },
    { href: '#', label: 'LinkedIn', icon: Linkedin },
    { href: '#', label: 'GitHub', icon: Github }, // Example
];

// --- Main Footer Component ---
export function Footer() {
    const { theme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    // Determine the current theme for logo selection
    const currentTheme = !mounted ? 'light' : theme === 'system' ? systemTheme : theme;

    // Consistent hover color from NavBar example
    const linkHoverColor = 'hover:text-primary';
    const mutedTextColor = 'text-muted-foreground';

    return (
        <footer className="border-t border-border/40 bg-muted/30 py-12 md:py-16"> {/* Subtle bg, adjusted padding */}
            <div className="container px-4 md:px-6">
                {/* Top section: Logo, Description, Links Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
                    {/* Column 1: Logo, Description, Socials */}
                    <div className="col-span-2 lg:col-span-2"> {/* Adjust colspan */}
                        {/* Logo - Copied logic from NavBar */}
                        <Link href="/" className="mb-4 inline-block">
                            {mounted && (
                                <Image
                                    src={currentTheme === 'dark' ? '/logo_dark.png' : '/logo.png'}
                                    alt="1techacademy Logo"
                                    className="h-6 w-auto" // Same as NavBar
                                    priority={false} // Priority usually for above-the-fold images
                                    width={80}
                                    height={24}
                                />
                            )}
                            {/* Skeleton Loader for Logo */}
                            {!mounted && <div className="h-6 w-[80px] bg-muted rounded animate-pulse"></div>}
                        </Link>
                        <p className={cn('text-sm mb-6', mutedTextColor)}>
                            Empowering institutions with smart, real-time, engaging education solutions.
                        </p>
                        {/* Social Links */}
                        <div className="flex space-x-4">
                            {socialLinks.map((social) => (
                                <Link
                                    key={social.label}
                                    href={social.href}
                                    className={cn('transition-colors', mutedTextColor, linkHoverColor)}
                                    target="_blank" // Open social links in new tab
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
                        <div key={key}>
                            <h3 className="text-sm font-semibold text-foreground mb-3 capitalize">{key}</h3>
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
                <div className="border-t border-border/40 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className={cn('text-xs', mutedTextColor)}> {/* Slightly smaller text */}
                        © {new Date().getFullYear()} 1techacademy by EASYNET TELSURVE CO. All rights reserved.
                    </p>
                    {/* Optional: Language switcher or other links */}
                    <div className="mt-4 md:mt-0">
                        <Button variant="ghost" size="sm" className={mutedTextColor}>
                            English (US)
                        </Button>
                    </div>
                </div>
            </div>
        </footer>
    );
}