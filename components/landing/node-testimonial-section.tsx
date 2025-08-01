// src/components/landing/NodeTestimonialSection.tsx (Example Path)
"use client";

import React, { useEffect, useRef, useState, useCallback, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { MotionTokens } from "@/lib/motion.tokens";

// --- Data Structures  ---
interface Testimonial { /* ... */ id: string; name: string; center?: boolean; role: string; company: string; quote: string; image: string; }
interface NodePosition { /* ... */ top: string; left: string; center?: boolean; }
interface Connection { /* ... */ id: string; x1: number; y1: number; x2: number; y2: number; connects: string; }
interface Globe { /* ... */ id: string; cx: number; cy: number; tx: number; ty: number; connects: string; delay: number; }
type ScreenSize = "desktop" | "tablet" | "mobile";

// --- Sample Data & Positions  ---
// Sample testimonials data
const testimonials: Testimonial[] = [
  {
    id: "smith-oshodin",
    name: "Smith Oshodin",
    role: "Techpreneur",
    company: "Lagos",
    quote: "1 Tech Academy focuses on the understanding of information and skill through theoretical and practical delivery. The academy will assist with opportunities for the application of delivery of knowledge acquired.",
    image: "/images/testimonials/Smith Oshodin.jpg"
  },
  {
    id: "adebukola-adebamipe",
    name: "Adebukola Adebamipe",
    role: "Social media manager",
    company: "Ogun",
    quote: "1TechAcademy is a serene tech hub with up-to-date facilities and a true focus on innovation. The team is both professional and sociable, creating the perfect environment for young tech innovators. Having international instructors who are deeply grounded in their fields truly feels like bringing Harvard to Nigeria, without any wasted time. Plus, the ample parking space for visitors is a welcome bonus.",
    image: "/images/testimonials/Adebukola Adebamipe.jpg"
  },
  {
    id: "adelaja-adelani",
    name: "Adelaja Adelani",
    role: "UI/UX Designer",
    company: "Abuja",
    quote: "1techacademy, in my experience, is one of the best out there, because they take mentorship very serious and also, the onsite learning is also very key to give learner access to the instructor and their fellow learners.",
    image: "/images/testimonials/Adelabu Adelaja.jpg"
  },
  {
    id: "henry-lawson",
    name: "Mr. Henry Lawson",
    role: "IT professional",
    company: "USA",
    quote: "The webinar, in my view, is exactly what people need right now, and I hope you guys can do more. It's not just about recognizing the importance of IT, it’s about understanding how to make it work and where to concentrate on. 1Tech Academy does an excellent job of clearly explaining everything. There’s a real gap in meeting the IT training needs of professionals, and this organization offers a solid solution. Great job to the entire team, I’m truly glad I was part of the experience.",
    image: "/images/testimonials/Henry Lawson.jpg"
  },
  {
    id: "israel-clement",
    name: "Israel Clement",
    role: "Graphics Designer",
    company: "Lagos",
    quote: "This is one of the Best Tech Schools in Lagos that I would recommend to anyone who is really serious about learning a globally recognized tech skill. I gained insights from one of their webinars and I understood that a globally recognized tech skill that is learnt and consistently worked on will take me places.",
    image: "/images/testimonials/Israel Clement.jpg"
  },
  {
    id: "teri-oke",
    name: "Teri Oke",
    role: "Digital Strategist",
    company: "Lagos",
    quote: "I finished my master’s only to realize that this isn't enough with how Tech is taking over globally. I joined the 1Tech Academy webinar and I got clarity on how I can transition with my current Tech skills without having to start from scratch. I love the community; they are passionate about helping people switch and start their tech journeys. The best part is that they take you from Training to globally certified. Enjoying the smooth ride.",
    image: "/images/testimonials/Teri Oke.jpg"
  },
  {
    id: "utibe-davies",
    name: "Utibe Davies",
    role: "Product Manager",
    company: "Port Harcourt",
    quote: "I highly recommend 1Tech Academy to anyone looking to break into the tech industry or sharpen their digital skills. It’s a launchpad for your future. One of the things that stood out the most is the community. You become part of a network of learners, mentors, and professionals who motivate you to grow and succeed.",
    image: "/images/testimonials/Utibe Davies.jpg"
  }
];
const nodePositions: Record<ScreenSize, NodePosition[]> = { /* ... your positions ... */
    desktop: [{ top: "5%", left: "60%" }, { top: "25%", left: "10%" }, { top: "50%", left: "75%" }, { top: "75%", left: "20%" }, { top: "15%", left: "80%" }, { top: "85%", left: "55%" }, { top: "50%", left: "50%", center: true },],
    tablet: [{ top: "10%", left: "15%" }, { top: "15%", left: "75%" }, { top: "40%", left: "65%" }, { top: "70%", left: "10%" }, { top: "85%", left: "55%" }, { top: "50%", left: "5%" }, { top: "50%", left: "50%", center: true },],
    mobile: [{ top: "5%", left: "20%" }, { top: "10%", left: "70%" }, { top: "35%", left: "60%" }, { top: "65%", left: "15%" }, { top: "80%", left: "65%" }, { top: "90%", left: "30%" }, { top: "50%", left: "50%", center: true },],
};

// --- Helper Function for Debouncing  ---
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) { /* ... */
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>): Promise<ReturnType<F>> => new Promise(resolve => { if (timeoutId) clearTimeout(timeoutId); timeoutId = setTimeout(() => resolve(func(...args)), waitFor); });
}

// --- Brand Color Constants  ---
const BRAND_PRIMARY_OKLCH = "oklch(var(--primary-lightness, 0.646) var(--primary-chroma, 0.14) var(--primary-hue, 77.5))";
const INACTIVE_LINE_OPACITY = "0.15"; // Make inactive lines even more subtle
const ACTIVE_LINE_OPACITY = "0.7";   // Active lines slightly less opaque
const INACTIVE_GLOBE_OPACITY = "0.3"; // Subtle globes
const ACTIVE_GLOBE_OPACITY = "0.9";   // Clear active globes


// --- Main Component ---
export function NodeTestimonialSection() {
    const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [globes, setGlobes] = useState<Globe[]>([]);
    const [screenSize, setScreenSize] = useState<ScreenSize>("desktop");
    const [nodeRects, setNodeRects] = useState<Map<string, DOMRect>>(new Map());

    const nodesAreaRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const filterId = useId();

    // --- Calculate Node Rects  ---
    const calculateNodeRects = useCallback(() => { /* ... */
        if (!nodesAreaRef.current) return;
        const areaRect = nodesAreaRef.current.getBoundingClientRect();
        const newNodeRects = new Map<string, DOMRect>();
        const nodeElements = nodesAreaRef.current.querySelectorAll<HTMLDivElement>(".testimonial-node");
        nodeElements.forEach(node => {
            const id = node.getAttribute("data-node-id");
            if (id) newNodeRects.set(id, node.getBoundingClientRect());
        });
        setNodeRects(newNodeRects);
    }, []);

    // --- Calculate Connections and Globes ---
    // MODIFIED: Connect all pairs of nodes
    const calculateConnections = useCallback(() => {
        if (!nodesAreaRef.current || nodeRects.size < 2) { // Need at least 2 nodes
            setConnections([]);
            setGlobes([]);
            return;
        };

        const areaRect = nodesAreaRef.current.getBoundingClientRect();
        const newConnections: Connection[] = [];
        const newGlobes: Globe[] = [];
        const rectArray = Array.from(nodeRects.entries());

        // Iterate through all unique pairs of nodes
        for (let i = 0; i < rectArray.length; i++) {
            const [node1Id, node1Rect] = rectArray[i];
            const node1Pos = {
                x: node1Rect.left - areaRect.left + node1Rect.width / 2,
                y: node1Rect.top - areaRect.top + node1Rect.height / 2,
            };

            for (let j = i + 1; j < rectArray.length; j++) { // Start j from i + 1 to avoid duplicates/self-connections
                const [node2Id, node2Rect] = rectArray[j];
                const node2Pos = {
                    x: node2Rect.left - areaRect.left + node2Rect.width / 2,
                    y: node2Rect.top - areaRect.top + node2Rect.height / 2,
                };

                // --- Create Connection ---
                const connectionId = `connection-${node1Id}-${node2Id}`;
                // Include both node IDs in connects string for easy checking
                const connects = `node-${node1Id}-node-${node2Id}`;
                newConnections.push({
                    id: connectionId,
                    x1: node1Pos.x, y1: node1Pos.y,
                    x2: node2Pos.x, y2: node2Pos.y,
                    connects: connects,
                });

                // --- Create Globe (Optional Optimization: Create fewer globes?) ---
                // For now, create one globe per connection, animating halfway
                // Consider only creating globes for connections involving the CENTER node,
                // or only a random subset, if performance becomes an issue.
                const midX = (node1Pos.x + node2Pos.x) / 2;
                const midY = (node1Pos.y + node2Pos.y) / 2;
                newGlobes.push({
                    id: `globe-${node1Id}-${node2Id}`,
                    cx: node1Pos.x, cy: node1Pos.y,
                    tx: midX - node1Pos.x, // Animate halfway
                    ty: midY - node1Pos.y,
                    connects: connects,
                    delay: Math.random() * 1.5 + 0.3, // Slightly longer random delay base
                });
                // Optionally add a globe going the other direction
                newGlobes.push({ id: `globe-${node2Id}-${node1Id}`, cx: node2Pos.x, cy: node2Pos.y, tx: midX - node2Pos.x, ty: midY - node2Pos.y, connects: connects, delay: Math.random() * 1.5 + 0.8 });
            }
        }

        setConnections(newConnections);
        setGlobes(newGlobes);
    }, [nodeRects]); // Depends only on nodeRects

    // --- Handle Screen Resize  ---
    useEffect(() => { /* ... */
        const updateScreenSize = () => { const width = window.innerWidth; if (width < 768) setScreenSize("mobile"); else if (width < 1024) setScreenSize("tablet"); else setScreenSize("desktop"); };
        const debouncedRecalculate = debounce(() => { calculateNodeRects(); }, 250);
        const handleResize = () => { updateScreenSize(); debouncedRecalculate(); };
        updateScreenSize(); calculateNodeRects(); window.addEventListener("resize", handleResize); return () => window.removeEventListener("resize", handleResize);
    }, [calculateNodeRects]);

    // --- Effect to Recalculate Connections  ---
    useEffect(() => { requestAnimationFrame(calculateConnections); }, [nodeRects, calculateConnections]);

    // --- Animations  ---
    const globeAnimation = (globe: Globe) => ({ /* ... */
        opacity: [0, 0.9, 0.9, 0], x: [0, globe.tx, globe.tx, globe.tx], y: [0, globe.ty, globe.ty, globe.ty],
    });
    const globeTransition = (globe: Globe) => ({ /* ... */
        times: [0, 0.3, 0.7, 1], duration: 2.5, delay: globe.delay, repeat: Infinity, repeatDelay: 2.0, ease: "easeInOut",
    });

    return (
        <div className="w-full overflow-hidden bg-transparent backdrop-blur-xs relative z-10">
            <div className="relative min-h-[180vh] md:min-h-[150vh] py-16 md:py-20 px-4 md:px-6 flex flex-col lg:flex-row items-center gap-12">

                {/* Text Content Area */}
                <div className="relative z-10 w-full lg:w-1/2 xl:w-[45%] text-center lg:text-left">
                    {/* ... motion.span, motion.h2, motion.p ... */}
                    <motion.span className="block uppercase tracking-widest text-xs font-semibold text-primary mb-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.1 }}> Success Stories </motion.span>
                    <motion.h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-6 text-foreground" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}> Voices from the 1Tech Academy Community </motion.h2>
                    <motion.p className="text-base md:text-lg leading-relaxed text-muted-foreground max-w-lg mx-auto lg:mx-0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}> Discover how students and professionals leverage 1Tech Academy. Hover over the nodes to explore their journeys. </motion.p>
                </div>

                {/* Network Nodes Area */}
                <div ref={nodesAreaRef} className="relative z-0 w-full lg:w-1/2 xl:w-[55%] h-[400px] sm:h-[450px] md:h-[500px] px-4 py-4">
                    {/* SVG Layer for Connections and Globes */}
                    <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" aria-hidden="true">
                        <defs>
                            {/* Filter for Globes */}
                            <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                                <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor={BRAND_PRIMARY_OKLCH} floodOpacity="0.3" />
                            </filter>
                        </defs>

                        {/* Connection Lines */}
                        <g className="connections">
                            {connections.map((connection) => {
                                // Check if EITHER connected node is active
                                const nodeIds = connection.connects.split('-').filter(s => s !== 'node' && s !== ''); // Extract IDs
                                const isActive = activeNodeId && nodeIds.includes(activeNodeId); // Check if activeNodeId is one of the connected IDs
                                return (
                                    <motion.line
                                        key={connection.id}
                                        x1={connection.x1} y1={connection.y1}
                                        x2={connection.x2} y2={connection.y2}
                                        strokeWidth="1"
                                        data-connects={connection.connects}
                                        className="transition-opacity duration-300 ease-out" // Transition opacity
                                        // Animate stroke color and opacity
                                        animate={{
                                            stroke: BRAND_PRIMARY_OKLCH, // Always use primary color base
                                            opacity: isActive ? ACTIVE_LINE_OPACITY : INACTIVE_LINE_OPACITY, // Control visibility via opacity
                                            // strokeWidth: isActive ? 1.5 : 1, // Optional: thicken line
                                        }}
                                    // Add transition prop if animating strokeWidth
                                    // transition={{ duration: 0.2 }}
                                    />
                                );
                            })}
                        </g>

                        {/* Animated Globes */}
                        <g className="globes">
                            {globes.map((globe) => {
                                // Check if EITHER connected node is active
                                const nodeIds = globe.connects.split('-').filter(s => s !== 'node' && s !== '');
                                const isActive = activeNodeId && nodeIds.includes(activeNodeId);
                                return (
                                    <motion.circle
                                        key={globe.id}
                                        cx={globe.cx} cy={globe.cy}
                                        r={isActive ? 3.5 : 3}
                                        fill={BRAND_PRIMARY_OKLCH}
                                        filter={`url(#${filterId})`}
                                        data-connects={globe.connects}
                                        initial={{ opacity: 0, x: 0, y: 0 }}
                                        animate={{
                                            ...globeAnimation(globe),
                                            opacity: isActive ? [0, ACTIVE_GLOBE_OPACITY, ACTIVE_GLOBE_OPACITY, 0] : [0, INACTIVE_GLOBE_OPACITY, INACTIVE_GLOBE_OPACITY, 0],
                                        }}
                                        transition={globeTransition(globe)}
                                    />
                                );
                            })}
                        </g>
                    </svg>

                    {/* Testimonial Nodes (HTML Elements - Keep structure as is) */}
                    {testimonials.map((testimonial, index) => {
                        // ... node positioning logic ...
                        const position = nodePositions[screenSize]?.[index];
                        if (!position) return null;
                        const isCenter = !!position.center || !!testimonial.center;
                        const nodeSize = isCenter ? "size-[80px] md:size-[90px]" : "size-[65px] md:size-[75px]";
                        const scaleFactor = isCenter ? 1.05 : 1.0;

                        return (
                            <motion.button // Keep as button
                                key={testimonial.id}
                                className={cn( /* ... node courses ... */
                                    "testimonial-node absolute rounded-full cursor-pointer z-10",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                    nodeSize
                                )}
                                data-node-id={testimonial.id}
                                style={{ top: position.top, left: position.left, transform: isCenter ? `translate(-50%, -50%) scale(${scaleFactor})` : `scale(${scaleFactor})` }}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: scaleFactor }}
                                transition={{ duration: 0.6, delay: 0.2 + index * 0.05, ease: "easeOut" }}
                                whileHover={{ scale: scaleFactor * 1.1, zIndex: 50, transition: { duration: MotionTokens.duration.fast, ease: "easeOut" } }}
                                onFocus={() => setActiveNodeId(testimonial.id)}
                                onBlur={() => setActiveNodeId(null)}
                                onMouseEnter={() => setActiveNodeId(testimonial.id)}
                                onMouseLeave={() => setActiveNodeId(null)}
                            >
                                {/* Avatar Wrapper  */}
                                <div className="w-full h-full rounded-full relative shadow-md overflow-hidden border-2 border-background dark:border-slate-800/50">
                                    {/* ... Image and inner glow ... */}
                                    <Image src={testimonial.image || "/images/avatars/default.png"} alt={`${testimonial.name} - ${testimonial.role}`} fill sizes="(max-width: 768px) 75px, 90px" className={cn("object-cover transition-transform duration-300 ease-out", activeNodeId === testimonial.id ? "scale-105" : "")} />
                                    <div className={cn("absolute inset-0 rounded-full border-2 border-primary/50 transition-opacity duration-300 opacity-0", activeNodeId === testimonial.id ? "opacity-100 animate-pulse-border" : "")}></div>
                                </div>

                                {/* Testimonial Popup (Keep structure as is) */}
                                <AnimatePresence>
                                    {activeNodeId === testimonial.id && (
                                        <motion.div className={cn( /* ... popup courses ... */
                                            "absolute text-left",
                                            "min-w-[280px] max-w-[300px] sm:max-w-[320px]",
                                            "bg-background/80 dark:bg-slate-900/80 backdrop-blur-lg",
                                            "border border-border/50 rounded-lg p-4 shadow-xl z-[100]",
                                            // Adjust positioning based on position and screen edge proximity
                                            parseInt(position.top) > 50 ? "bottom-[calc(100%+15px)]" : "top-[calc(100%+15px)]",
                                            // Add overflow handling to prevent text clipping
                                            "overflow-visible",
                                            // Smart positioning based on left position to prevent cutoff
                                            parseInt(position.left.replace('%', '')) > 70 ? "right-0" :
                                            parseInt(position.left.replace('%', '')) < 30 ? "left-0" :
                                            "left-1/2 -translate-x-1/2"
                                        )}
                                            initial={{ opacity: 0, y: parseInt(position.top) > 50 ? 10 : -10, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: parseInt(position.top) > 50 ? 10 : -10, scale: 0.9 }}
                                            transition={{ duration: MotionTokens.duration.fast, ease: MotionTokens.ease.easeOut }} >
                                            <p className="text-sm font-normal leading-relaxed text-foreground/90 mb-3"> “{testimonial.quote}” </p>
                                            <span className="block font-semibold text-sm text-foreground"> {testimonial.name} </span>
                                            <span className="block text-xs text-muted-foreground"> {testimonial.role}, {testimonial.company} </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        )
                    })}
                </div>
            </div>

            {/* Embedded CSS animations  */}
            <style jsx global>{`/* ... @keyframes pulse-border ... */
                @keyframes pulse-border { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
                .animate-pulse-border { animation: pulse-border 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
             `}</style>
        </div>
    )
}