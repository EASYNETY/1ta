"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardContent } from "@/components/ui/card"
import { MotionTokens } from "@/lib/motion.tokens"
import { Scan, CheckCircle, Clock } from "lucide-react"
import Image from "next/image"

export function BarcodeScannerSection() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: MotionTokens.ease.easeOut,
            },
        },
    }

    return (
        <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
            <motion.div variants={itemVariants} className="order-2 lg:order-1">
                <div className="relative h-[400px] w-full">
                    <Image
                        src="https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=1548&auto=format&fit=crop"
                        alt="Barcode scanning demonstration"
                        fill
                        className="object-contain"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="w-48 h-48 border-2 border-primary/50 rounded-lg"
                        >
                            <motion.div
                                animate={{
                                    y: [0, 150, 0],
                                    opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Number.POSITIVE_INFINITY,
                                    ease: "linear",
                                }}
                                className="h-0.5 w-full bg-primary"
                            />
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-6 order-1 lg:order-2">
                <h2 className="text-3xl font-bold">Barcode Verification System</h2>
                <p className="text-lg text-muted-foreground">
                    Our advanced barcode scanning technology streamlines attendance tracking and verification processes, ensuring
                    accurate and efficient record-keeping for educational institutions.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <DyraneCard>
                        <CardContent className="p-4 flex items-start space-x-4">
                            <div className="bg-primary/10 p-2 rounded-full">
                                <Scan className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-medium">Quick Scanning</h3>
                                <p className="text-sm text-muted-foreground">Instant verification in under 1 second</p>
                            </div>
                        </CardContent>
                    </DyraneCard>

                    <DyraneCard>
                        <CardContent className="p-4 flex items-start space-x-4">
                            <div className="bg-primary/10 p-2 rounded-full">
                                <CheckCircle className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-medium">99.9% Accuracy</h3>
                                <p className="text-sm text-muted-foreground">Reliable verification every time</p>
                            </div>
                        </CardContent>
                    </DyraneCard>

                    <DyraneCard>
                        <CardContent className="p-4 flex items-start space-x-4">
                            <div className="bg-primary/10 p-2 rounded-full">
                                <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-medium">Real-time Updates</h3>
                                <p className="text-sm text-muted-foreground">Instant attendance records</p>
                            </div>
                        </CardContent>
                    </DyraneCard>
                </div>
            </motion.div>
        </motion.div>
    )
}
