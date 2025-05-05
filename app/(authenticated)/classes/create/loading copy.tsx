export default function LoadingState() {
    return (
        <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
    )
}
