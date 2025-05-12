// components/layout/footer.tsx
'use client'; // Needed for useTheme and useEffect/useState

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Building2, Github, Linkedin, MapPin, TwitterIcon } from 'lucide-react'; // Use Lucide icons

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button'; // Using base Button for simplicity, replace with DyraneButton if needed
import { FacebookLogo, InstagramLogo, TiktokLogo } from 'phosphor-react';
// Or import DyraneButton if you prefer its effects here:
// import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';

// --- Footer Link Constants (Example) ---
const footerLinks = {
    product: [
        { href: '#features', label: 'Features' },
        { href: '#', label: 'Pricing' }, // Replace # with actual link
        { href: '#courses', label: 'Courses' }, // Replace # with actual link
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
    { href: 'https://www.linkedin.com/company/1tech-academy/?viewAsMember=true', label: 'LinkedIn', icon: Linkedin },
    { href: 'https://www.instagram.com/1tech_academy?igsh=ZmptMDJyemtjZ2lm&utm_source=qr', label: 'Instagram', icon: InstagramLogo }, // Example
    { href: 'https://www.facebook.com/share/162ZNuWcgu/?mibextid=wwXIfr', label: 'Facebook', icon: FacebookLogo },
    { href: 'https://www.tiktok.com/@1tech.academy?_t=ZM-8vuaPPKBpLR&_r=1', label: 'Tiktok', icon: TiktokLogo },
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
        <footer className="border-t border-border/40 bg-background py-8 md:py-10"> {/* Reduced padding */}
            <div className=" px-4 md:px-6">
                {/* Top section: Logo, Description, Links Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-8">
                    {/* Column 1: Logo, Description, Address, Socials */}
                    <div className="col-span-2 lg:col-span-2">
                        {/* Logo & Address */}
                        <div className="flex flex-col items-start h-auto justify-between gap-4 mb-3">
                            <Link href="/" className="">
                                {mounted && currentTheme && (
                                    <Image
                                        src={currentTheme === "dark" ? "/logo_dark.png" : "/logo.png"}
                                        alt="1techacademy Logo"
                                        className="h-6 w-auto"
                                        priority
                                        width={80}
                                        height={14}
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


                        {/* Description */}
                        <p className={cn('text-sm mb-4', mutedTextColor)}>
                            Empowering institutions with smart, real-time, engaging education solutions. Beyond Limits, Beyond Today.
                        </p>

                        {/* Social Links */}
                        <div className="flex space-x-4">
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