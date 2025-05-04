// app/(authenticated)/users/[id]/page.tsx
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthorizationGuard } from "@/components/auth/AuthenticationGuard";
import { DyraneCard, DyraneCardContent, DyraneCardHeader, DyraneCardTitle, DyraneCardDescription, DyraneCardFooter } from '@/components/dyrane-ui/dyrane-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserData } from '@/components/users/UserTableRow'; // Use shared type
import Link from 'next/link';
import { ArrowLeft, User, Mail, Calendar, CheckCircle, XCircle, Briefcase } from 'lucide-react'; // Icons for details

// --- Mock Data Fetching (Replace with API/Store) ---
const mockUsers: UserData[] = [ // Use UserData type
    { id: "user-1", name: "John Smith", email: "john.smith@example.com", role: "student", status: "active", joinDate: "2023-10-15" },
    { id: "user-2", name: "Sarah Johnson", email: "sarah.johnson@example.com", role: "teacher", status: "active", joinDate: "2023-09-05" },
    { id: "user-3", name: "Michael Chen", email: "michael.chen@example.com", role: "teacher", status: "active", joinDate: "2023-08-20" },
    { id: "user-4", name: "Emily Williams", email: "emily.williams@example.com", role: "student", status: "inactive", joinDate: "2023-11-10" },
    { id: "user-5", name: "David Brown", email: "david.brown@example.com", role: "student", status: "active", joinDate: "2023-10-25" },
    { id: "user-6", name: "Jennifer Moore", email: "jennifer.moore@example.com", role: "admin", status: "active", joinDate: "2023-07-15" },
];

const fetchMockUserById = async (id: string): Promise<UserData | null> => {
    console.log(`Fetching mock user ${id}`);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
    const user = mockUsers.find(u => u.id === id);
    return user || null;
};
// --- End Mock Data Fetching ---

// Helper to format date
const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try { return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }); }
    catch (e) { return "Invalid Date"; }
};

export default function ViewUserPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string; // Get ID from route params

    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (userId) {
            setIsLoading(true);
            setError(null);
            fetchMockUserById(userId) // Replace with actual fetch thunk later
                .then(data => {
                    if (data) {
                        setUser(data);
                    } else {
                        setError("User not found.");
                    }
                })
                .catch(err => {
                    console.error("Error fetching user:", err);
                    setError("Failed to load user data.");
                })
                .finally(() => setIsLoading(false));
        } else {
            setError("User ID is missing.");
            setIsLoading(false);
        }
    }, [userId]);

    if (isLoading) {
        return <div className="p-6 text-center">Loading user details...</div>; // Add Skeleton loader later
    }

    if (error) {
         return <div className="p-6 text-center text-red-600">{error}</div>;
    }

    if (!user) {
        // This case might be covered by the error state, but good to have
        return <div className="p-6 text-center">User data could not be loaded.</div>;
    }

    // Badge styling logic (can be extracted)
    const getRoleBadgeClass = (role: string) => { /* ... same as in UserTableRow ... */ };
    const getStatusBadgeClass = (status: string) => { /* ... same as in UserTableRow ... */ };


    return (
        <AuthorizationGuard allowedRoles={['admin']}>
            <div className="mx-auto">
                <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
                </Button>

                <DyraneCard>
                    <DyraneCardHeader>
                        <DyraneCardTitle className="flex items-center gap-3">
                            <User className="h-6 w-6" />
                            {user.name}
                        </DyraneCardTitle>
                         <DyraneCardDescription>
                           Viewing profile details for {user.name}.
                        </DyraneCardDescription>
                    </DyraneCardHeader>
                    <DyraneCardContent className="space-y-4">
                         <div className="flex items-center gap-3 border-b pb-3">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm">{user.email}</span>
                         </div>
                         <div className="flex items-center gap-3 border-b pb-3">
                            <Briefcase className="h-5 w-5 text-muted-foreground" />
                             <Badge variant="outline" className={`text-sm ${getRoleBadgeClass(user.role)}`}>
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Badge>
                         </div>
                         <div className="flex items-center gap-3 border-b pb-3">
                             {user.status === 'active' ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                             <Badge variant="outline" className={`text-sm ${getStatusBadgeClass(user.status)}`}>
                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                             </Badge>
                         </div>
                         <div className="flex items-center gap-3">
                             <Calendar className="h-5 w-5 text-muted-foreground" />
                             <span className="text-sm text-muted-foreground">Joined on {formatDate(user.joinDate)}</span>
                         </div>
                        {/* Add more details fields here */}
                    </DyraneCardContent>
                    <DyraneCardFooter className="flex justify-end">
                        <Button asChild>
                            <Link href={`/users/${userId}/edit`}>Edit User</Link>
                        </Button>
                    </DyraneCardFooter>
                </DyraneCard>
            </div>
        </AuthorizationGuard>
    );
}