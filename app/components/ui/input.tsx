// Imports
import * as React from "react"
import { cn } from "./lib/utils"

// Define InputProps interface and extends HTML
export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {}

// Define the Input component
const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                // Set the input type
                type={type}
                // Combine default styles with any additional className
                className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
// Set display name for the Input component
Input.displayName = "Input"
// Export the Input component
export { Input }