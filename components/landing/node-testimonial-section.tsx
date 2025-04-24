"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { MotionTokens } from "@/lib/motion.tokens"

// Define testimonial data structure
interface Testimonial {
    id: string
    name: string
    role: string
    company: string
    quote: string
    image: string
}

// Sample testimonials data
const testimonials: Testimonial[] = [
    {
        id: "1",
        name: "Adeola Bello",
        role: "Fashion Entrepreneur",
        company: "Lagos",
        quote: "Managing inventory and payments used to be a hassle. 1TechAcademy's integrated system streamlined everything for my boutique. Truly a game-changer!",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2076&q=80",
    },
    {
        id: "2",
        name: "Chukwudi Eze",
        role: "Freelance Designer",
        company: "Abuja",
        quote: "As a graphic designer, receiving international payments was always complex. 1TechAcademy made it seamless. Now I focus more on creativity, less on admin.",
        image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    },
    {
        id: "3",
        name: "Fatima Aliyu",
        role: "Student & Online Retailer",
        company: "Kano",
        quote: "The courses at 1TechAcademy gave me the digital skills I needed. Now I use their platform to manage my online store effectively. Great ecosystem!",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1998&q=80",
    },
    {
        id: "4",
        name: "Emeka Nwosu",
        role: "E-commerce Store Owner",
        company: "Ibadan",
        quote: "The reliability of 1TechAcademy's logistics service helped my e-commerce business grow. Customers in Ibadan get their orders faster than ever.",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    },
    {
        id: "5",
        name: "Zainab Ibrahim",
        role: "Software Developer",
        company: "Port Harcourt",
        quote: "We integrated 1TechAcademy's payment gateway into our app. The API was developer-friendly, and their support team was very responsive.",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2076&q=80",
    },
    {
        id: "6",
        name: "Oluwatobi Ayodele",
        role: "Startup Founder",
        company: "Abeokuta",
        quote: "Accessing business tools without breaking the bank was crucial for my startup. 1TechAcademy provided affordable and powerful solutions.",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80",
    },
    {
        id: "7",
        name: "Ngozi Okonkwo",
        role: "Restaurant Chain Owner",
        company: "Enugu",
        quote: "From POS solutions for my restaurant chain to managing payroll, 1TechAcademy is the backbone of our operations across Nigeria. Highly dependable.",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80",
    },
]

// Node positions for different screen sizes
const nodePositions = {
    desktop: [
        { top: "0%", left: "55%" },
        { top: "20%", left: "15%" },
        { top: "45%", left: "80%" },
        { top: "70%", left: "25%" },
        { top: "10%", left: "95%" },
        { top: "80%", left: "50%" },
        { top: "50%", left: "50%", center: true },
    ],
    tablet: [
        { top: "5%", left: "5%" },
        { top: "10%", left: "80%" },
        { top: "35%", left: "50%" },
        { top: "65%", left: "10%" },
        { top: "80%", left: "75%" },
        { top: "40%", left: "90%" },
        { top: "50%", left: "50%", center: true },
    ],
    mobile: [
        { top: "2%", left: "10%" },
        { top: "5%", left: "70%" },
        { top: "35%", left: "40%" },
        { top: "65%", left: "80%" },
        { top: "75%", left: "10%" },
        { top: "50%", left: "85%" },
        { top: "50%", left: "50%", center: true },
    ],
}

// Connection line interface
interface Connection {
    id: string
    x1: number
    y1: number
    x2: number
    y2: number
    connects: string
}

// Globe interface
interface Globe {
    id: string
    cx: number
    cy: number
    tx: number
    ty: number
    connects: string
    delay: number
}

export function NodeTestimonialSection() {
    const [activeNode, setActiveNode] = useState<string | null>(null)
    const [connections, setConnections] = useState<Connection[]>([])
    const [globes, setGlobes] = useState<Globe[]>([])
    const [screenSize, setScreenSize] = useState<"desktop" | "tablet" | "mobile">("desktop")

    const nodesAreaRef = useRef<HTMLDivElement>(null)
    const svgRef = useRef<SVGSVGElement>(null)

    // Determine screen size
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth
            if (width < 768) {
                setScreenSize("mobile")
            } else if (width < 992) {
                setScreenSize("tablet")
            } else {
                setScreenSize("desktop")
            }
        }

        handleResize() // Initial check
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    // Draw connections between nodes
    useEffect(() => {
        const drawConnections = () => {
            if (!nodesAreaRef.current || !svgRef.current) return

            const areaRect = nodesAreaRef.current.getBoundingClientRect()
            const newConnections: Connection[] = []
            const newGlobes: Globe[] = []

            // Get all node elements
            const nodeElements = nodesAreaRef.current.querySelectorAll(".testimonial-node")
            const nodeRects = Array.from(nodeElements).map(node => {
                const rect = node.getBoundingClientRect()
                return {
                    id: node.getAttribute("data-node-id") || "",
                    x: rect.left - areaRect.left + rect.width / 2,
                    y: rect.top - areaRect.top + rect.height / 2,
                    width: rect.width,
                    height: rect.height
                }
            })

            // Create connections between each pair of nodes
            for (let i = 0; i < nodeRects.length; i++) {
                const node1 = nodeRects[i]

                for (let j = i + 1; j < nodeRects.length; j++) {
                    const node2 = nodeRects[j]

                    // Create connection line
                    const connectionId = `connection-${node1.id}-${node2.id}`
                    newConnections.push({
                        id: connectionId,
                        x1: node1.x,
                        y1: node1.y,
                        x2: node2.x,
                        y2: node2.y,
                        connects: `node-${node1.id}-node-${node2.id}`
                    })

                    // Create globe
                    const midX = (node1.x + node2.x) / 2
                    const midY = (node1.y + node2.y) / 2

                    newGlobes.push({
                        id: `globe-${node1.id}-${node2.id}`,
                        cx: node1.x,
                        cy: node1.y,
                        tx: midX - node1.x,
                        ty: midY - node1.y,
                        connects: `node-${node1.id}-node-${node2.id}`,
                        delay: Math.random() * 1.5
                    })
                }
            }

            setConnections(newConnections)
            setGlobes(newGlobes)
        }

        // Use requestAnimationFrame for smoother initial drawing
        const timeoutId = setTimeout(() => {
            requestAnimationFrame(drawConnections)
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [screenSize])

    // Redraw connections on window resize
    useEffect(() => {
        const handleResize = () => {
            // Use requestAnimationFrame for smoother drawing
            requestAnimationFrame(() => {
                setConnections([])
                setGlobes([])

                setTimeout(() => {
                    if (!nodesAreaRef.current || !svgRef.current) return

                    const areaRect = nodesAreaRef.current.getBoundingClientRect()
                    const newConnections: Connection[] = []
                    const newGlobes: Globe[] = []

                    // Get all node elements
                    const nodeElements = nodesAreaRef.current.querySelectorAll(".testimonial-node")
                    const nodeRects = Array.from(nodeElements).map(node => {
                        const rect = node.getBoundingClientRect()
                        return {
                            id: node.getAttribute("data-node-id") || "",
                            x: rect.left - areaRect.left + rect.width / 2,
                            y: rect.top - areaRect.top + rect.height / 2,
                            width: rect.width,
                            height: rect.height
                        }
                    })

                    // Create connections between each pair of nodes
                    for (let i = 0; i < nodeRects.length; i++) {
                        const node1 = nodeRects[i]

                        for (let j = i + 1; j < nodeRects.length; j++) {
                            const node2 = nodeRects[j]

                            // Create connection line
                            const connectionId = `connection-${node1.id}-${node2.id}`
                            newConnections.push({
                                id: connectionId,
                                x1: node1.x,
                                y1: node1.y,
                                x2: node2.x,
                                y2: node2.y,
                                connects: `node-${node1.id}-node-${node2.id}`
                            })

                            // Create globe
                            const midX = (node1.x + node2.x) / 2
                            const midY = (node1.y + node2.y) / 2

                            newGlobes.push({
                                id: `globe-${node1.id}-${node2.id}`,
                                cx: node1.x,
                                cy: node1.y,
                                tx: midX - node1.x,
                                ty: midY - node1.y,
                                connects: `node-${node1.id}-node-${node2.id}`,
                                delay: Math.random() * 1.5
                            })
                        }
                    }

                    setConnections(newConnections)
                    setGlobes(newGlobes)
                }, 100)
            })
        }

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    return (
        <div className="w-full">
            <div className="relative w-full min-h-[65vh] bg-none py-20 px-5 md:px-[10%] md:py-20 overflow-hidden flex flex-col md:flex-row items-center">

                {/* Central content area */}
                <div className="relative z-10 flex-basis-full md:flex-basis-[55%] md:pr-[6%] text-left mb-12 md:mb-0 text-center md:text-left">
                    <motion.span
                        className="block text-[#d1c0c0] uppercase tracking-[4px] mb-[18px] text-[0.9rem] font-bold opacity-80 relative"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.8 }}
                        transition={{ duration: 1 }}
                    >
                        Student Testimonials
                        <span className="absolute bottom-[-10px] left-0 md:left-0 md:transform-none w-[70px] h-[2px] bg-gradient-to-r from-[#6a2a2a] to-transparent opacity-70 blur-[1px]"></span>
                    </motion.span>

                    <motion.h2
                        className="text-[#f8f0f0] text-[2.5rem] md:text-[3rem] font-bold leading-[1.15] mb-[35px] text-shadow-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                    >
                        Voices from Our Community
                    </motion.h2>

                    <motion.p
                        className="text-[#d1c0c0] text-[1rem] md:text-[1.1rem] leading-[1.75] max-w-[550px] opacity-90 mx-auto md:mx-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.9 }}
                        transition={{ duration: 1, delay: 0.4 }}
                    >
                        Our students drive innovation. Hover over the nodes representing our community members to explore their stories and see how 1TechAcademy empowers their journey.
                    </motion.p>
                </div>

                {/* Network nodes area */}
                <div
                    ref={nodesAreaRef}
                    className="relative z-5 flex-basis-full md:flex-basis-[45%] h-[450px] md:h-[450px] min-w-[300px] w-full"
                >
                    {/* SVG for connections */}
                    <svg ref={svgRef} className="absolute inset-0 w-full h-full z-[5] pointer-events-none overflow-visible">
                        <defs>
                            <filter id="globe-shadow" x="-50%" y="-50%" width="200%" height="200%">
                                <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.5" />
                            </filter>
                        </defs>

                        {/* Connection lines */}
                        {connections.map((connection) => (
                            <motion.line
                                key={connection.id}
                                x1={connection.x1}
                                y1={connection.y1}
                                x2={connection.x2}
                                y2={connection.y2}
                                stroke="rgba(210, 190, 190, 0.35)"
                                strokeWidth="1.5"
                                data-connects={connection.connects}
                                className={cn(
                                    "transition-all duration-300",
                                    activeNode && connection.connects.includes(`node-${activeNode}`) ? "stroke-[rgba(235,218,218,0.7)] stroke-[2px]" : ""
                                )}
                            />
                        ))}

                        {/* Animated globes */}
                        {globes.map((globe) => (
                            <motion.circle
                                key={globe.id}
                                cx={globe.cx}
                                cy={globe.cy}
                                r={3.5}
                                fill="rgba(248, 240, 240, 0.8)"
                                filter="url(#globe-shadow)"
                                data-connects={globe.connects}
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: 0.9,
                                    x: globe.tx,
                                    y: globe.ty
                                }}
                                transition={{
                                    opacity: { duration: 0.5, delay: globe.delay },
                                    x: { duration: 1.5, delay: globe.delay, ease: [0.25, 0.1, 0.25, 1] },
                                    y: { duration: 1.5, delay: globe.delay, ease: [0.25, 0.1, 0.25, 1] }
                                }}
                                className={cn(
                                    "transition-all duration-300",
                                    activeNode && globe.connects.includes(`node-${activeNode}`) ? "fill-[rgba(255,255,255,0.95)]" : ""
                                )}
                            />
                        ))}
                    </svg>

                    {/* Testimonial nodes */}
                    {testimonials.map((testimonial, index) => {
                        const position = nodePositions[screenSize][index]

                        return (
                            <motion.div
                                key={testimonial.id}
                                className={cn(
                                    "testimonial-node absolute w-[75px] h-[75px] cursor-pointer z-[6]",
                                    position.center ? "center-node" : ""
                                )}
                                data-node-id={testimonial.id}
                                style={{
                                    top: position.top,
                                    left: position.left,
                                    ...(position.center ? {
                                        transform: "translate(-50%, -50%) scale(1.1)",
                                        width: "90px",
                                        height: "90px",
                                        zIndex: 7
                                    } : {})
                                }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                                whileHover={{
                                    scale: position.center ? 1.15 : 1.15,
                                    zIndex: 100,
                                    transition: { duration: 0.4 }
                                }}
                                onMouseEnter={() => setActiveNode(testimonial.id)}
                                onMouseLeave={() => setActiveNode(null)}
                            >
                                {/* Avatar wrapper */}
                                <div
                                    className="w-full h-full rounded-full relative shadow-lg overflow-hidden"
                                    style={{
                                        animation: `pulseNode 3.5s infinite alternate ease-in-out ${index % 2 === 0 ? '-1.5s' : '-0.8s'}`
                                    }}
                                >
                                    {/* Spinning glow effect */}
                                    <div
                                        className={cn(
                                            "absolute -inset-[5px] rounded-full opacity-0 transition-opacity duration-400 z-[-1]",
                                            activeNode === testimonial.id ? "opacity-100" : ""
                                        )}
                                        style={{
                                            background: "conic-gradient(rgba(235, 218, 218, 0.5), transparent 40%, rgba(235, 218, 218, 0.5))",
                                            animation: activeNode === testimonial.id ? "spinGlowNode 3s linear infinite" : "none"
                                        }}
                                    />

                                    {/* Avatar image */}
                                    <Image
                                        src={testimonial.image || "/placeholder.svg"}
                                        alt={testimonial.name}
                                        fill
                                        className={cn(
                                            "object-cover border-[3px] border-white/70 transition-all duration-300",
                                            activeNode === testimonial.id ? "border-white" : ""
                                        )}
                                    />
                                </div>

                                {/* Testimonial popup */}
                                <AnimatePresence>
                                    {activeNode === testimonial.id && (
                                        <motion.div
                                            className="absolute bottom-[-35px] left-1/2 min-w-[280px] max-w-[320px] bg-black/85 backdrop-blur-[15px] border border-white/15 rounded-xl p-6 shadow-xl z-[99] text-center text-white"
                                            initial={{ opacity: 0, y: 10, scale: 0.85 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.85 }}
                                            transition={{ duration: 0.4 }}
                                            style={{ transform: "translateX(-50%)" }}
                                        >
                                            <p className="font-normal text-[0.9rem] leading-[1.6] text-[#f8f0f0] mb-4 opacity-95">
                                                "{testimonial.quote}"
                                            </p>
                                            <span className="block font-bold text-[0.9rem] text-[#f8f0f0] mb-[2px]">
                                                {testimonial.name}
                                            </span>
                                            <span className="block text-[0.75rem] text-[#d1c0c0] font-normal">
                                                {testimonial.role}, {testimonial.company}
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            {/* CSS animations */}
            <style jsx global>{`
        @keyframes pulseNode {
          0% {
            transform: scale(1);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          }
          100% {
            transform: scale(1.05);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
          }
        }
        
        @keyframes spinGlowNode {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .center-node:not(:hover) {
          transform: translate(-50%, -50%) scale(1.1);
        }
        
        .center-node:hover {
          transform: translate(-50%, -50%) scale(1.15);
        }
      `}</style>
        </div>
    )
}
