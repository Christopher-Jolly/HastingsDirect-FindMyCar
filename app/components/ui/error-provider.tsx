'use client'
// Imports
import { createContext, useContext, useState, ReactNode } from 'react'
import { ErrorNotification } from './error-notification'
// Define the structure for a message
interface Message {
    id: number
    text: string
    type: 'error' | 'success'
}
// Define the shape of the context
interface ErrorContextType {
    showMessage: (text: string, type: 'error' | 'success') => void
    deleteMessage: (id: number) => void
}
// Create the context
const ErrorContext = createContext<ErrorContextType | undefined>(undefined)
// Custom hook to use the ErrorContext
export function useError() {
    const context = useContext(ErrorContext)
    if (!context) {
        throw new Error('useError must be used within an ErrorProvider')
    }
    return context
}
// ErrorProvider component
export function ErrorProvider({ children }: { children: ReactNode }) {
    // State to store messages
    const [messages, setMessages] = useState<Message[]>([])
    // State to keep track of the next message id
    const [nextId, setNextId] = useState(0)
    // Function to show a new message
    const showMessage = (text: string, type: 'error' | 'success') => {
        const id = nextId
        setMessages((prevMessages) => [...prevMessages, { id, text, type }])
        setNextId((prevId) => prevId + 1)

        // Set a timeout to remove the message after 10 seconds
        setTimeout(() => {
            deleteMessage(id)
        }, 10000)
    }
    // Function to delete a message
    const deleteMessage = (id: number) => {
        setMessages((prevMessages) => prevMessages.filter((message) => message.id !== id))
    }
    return (
        <ErrorContext.Provider value={{ showMessage, deleteMessage }}>
            {children}
            <div className="fixed bottom-4 right-4 space-y-2 z-50">
                {messages.map((message) => (
                    <ErrorNotification
                        key={message.id}
                        message={message.text}
                        type={message.type}
                        onDelete={() => deleteMessage(message.id)}
                    />
                ))}
            </div>
        </ErrorContext.Provider>
    )
}