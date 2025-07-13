"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { MotionTokens } from "@/lib/motion.tokens"
import Image from "next/image"

const testimonials = [
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
]

export function TestimonialCarousel() {
	const [current, setCurrent] = useState(0)
	const [autoplay, setAutoplay] = useState(true)

	useEffect(() => {
		if (!autoplay) return

		const interval = setInterval(() => {
			setCurrent((prev) => (prev + 1) % testimonials.length)
		}, 6000)

		return () => clearInterval(interval)
	}, [autoplay])

	const next = () => {
		setAutoplay(false)
		setCurrent((prev) => (prev + 1) % testimonials.length)
	}

	const prev = () => {
		setAutoplay(false)
		setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)
	}

	return (
		<div className="relative max-w-5xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
			<AnimatePresence mode="wait">
				<motion.div
					key={current}
					initial={{ opacity: 0, x: 100 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: -100 }}
					transition={{
						duration: MotionTokens.duration.medium,
						ease: MotionTokens.ease.subtle_easeInOut,
					}}
					className="w-full"
				>
					<DyraneCard className="overflow-hidden w-full">
						<CardContent className="p-6 sm:p-8 md:p-10 lg:p-12">
							<Quote className="h-10 w-10 md:h-12 md:w-12 text-primary/20 mb-4 md:mb-6" />
							<blockquote className="text-lg sm:text-xl md:text-2xl mb-6 italic leading-relaxed text-foreground break-words hyphens-auto">
								&quot;{testimonials[current].quote}&quot;
							</blockquote>
							<div className="flex items-start sm:items-center gap-4 flex-col sm:flex-row">
								<div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full overflow-hidden flex-shrink-0">
									<Image
										src={testimonials[current].image}
										alt={testimonials[current].name}
										width={80}
										height={80}
										className="h-full w-full object-cover"
									/>
								</div>
								<div className="min-w-0 flex-1 text-center sm:text-left">
									<div className="font-bold text-foreground break-words text-base md:text-lg">{testimonials[current].name}</div>
									<div className="text-muted-foreground text-sm md:text-base break-words leading-relaxed">{testimonials[current].role}</div>
								</div>
							</div>
						</CardContent>
					</DyraneCard>
				</motion.div>
			</AnimatePresence>

			<div className="flex justify-center mt-6 space-x-2">
				{testimonials.map((_, index) => (
					<button
						key={index}
						onClick={() => {
							setAutoplay(false)
							setCurrent(index)
						}}
						className={`h-2 w-2 rounded-full ${index === current ? "bg-primary" : "bg-primary/30"}`}
					/>
				))}
			</div>

			<div className="absolute top-1/2 -translate-y-1/2 -left-4 xl:-left-6 hidden lg:block z-10">
				<DyraneButton size="icon" variant="ghost" onClick={prev} className="bg-background/80 backdrop-blur-sm hover:bg-background/90 shadow-md">
					<ChevronLeft className="h-5 w-5" />
				</DyraneButton>
			</div>

			<div className="absolute top-1/2 -translate-y-1/2 -right-4 xl:-right-6 hidden lg:block z-10">
				<DyraneButton size="icon" variant="ghost" onClick={next} className="bg-background/80 backdrop-blur-sm hover:bg-background/90 shadow-md">
					<ChevronRight className="h-5 w-5" />
				</DyraneButton>
			</div>
		</div>
	)
}
