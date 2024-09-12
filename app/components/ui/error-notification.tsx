'use client'
// Imports
import { X } from 'lucide-react'
// Define the props interface for the ErrorNotification component
interface ErrorNotificationProps {
    message: string
    type: 'error' | 'success'
    onDelete: () => void
}
// Define the ErrorNotification component
export function ErrorNotification({ message, type, onDelete }: ErrorNotificationProps) {
    // Determine the background color based on the notification type
    const bgColor = type === 'error' ? 'bg-[#A90D30]' : 'bg-[#0E838A]'

    return (
        // Main container for the notification
        <div className={`${bgColor} text-white p-4 rounded-lg shadow-md flex justify-between items-center`} role="alert">
            <span>{message}</span>
            <button
                onClick={onDelete}
                className="ml-4 text-white hover:text-white/80"
                aria-label={`Delete ${type} message`}
            >
                <X size={16} />
            </button>
        </div>
    )
}