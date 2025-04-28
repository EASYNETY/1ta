"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { updateUser } from "@/features/auth/store/auth-slice"
import { put } from "@/lib/api-client"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { User } from "lucide-react"

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfilePage() {
    const { user } = useAppSelector((state) => state.auth)
    const dispatch = useAppDispatch()
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || "",
        },
    })

    const onSubmit = async (data: ProfileFormValues) => {
        if (!user) return

        try {
            setIsSubmitting(true)

            // Make API request to update profile
            await put(`/users/${user.id}`, data)

            // Update local state
            dispatch(updateUser(data))

            toast({
                title: "Profile updated",
                description: "Your profile has been updated successfully",
            })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to update profile"

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!user) {
        return <div>Loading...</div>
    }

    return (
        <div className="mx-auto">
            <h1 className="text-3xl font-bold mb-6">My Profile</h1>

            <div className="grid gap-6">
                <DyraneCard>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <User className="h-12 w-12 text-primary" />
                            </div>
                            <h2 className="text-xl font-semibold">{user.name}</h2>
                            <p className="text-muted-foreground">{user.email}</p>
                            <div className="mt-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm capitalize">
                                {user.role}
                            </div>
                        </div>

                        <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" {...register("name")} aria-invalid={errors.name ? "true" : "false"} />
                                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={user.email} disabled className="bg-muted" />
                                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Input
                                    id="role"
                                    value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                    disabled
                                    className="bg-muted capitalize"
                                />
                                <p className="text-xs text-muted-foreground">Role cannot be changed</p>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter>
                        <DyraneButton type="submit" form="profile-form" disabled={isSubmitting || !isDirty} className="ml-auto">
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </DyraneButton>
                    </CardFooter>
                </DyraneCard>

                <DyraneCard>
                    <CardHeader>
                        <CardTitle>Account Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Additional account settings like password change and notification preferences will be available in future
                            updates.
                        </p>
                    </CardContent>
                </DyraneCard>
            </div>
        </div>
    )
}
