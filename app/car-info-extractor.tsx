'use client'

//======================================================================================================================
// Imports
import React, { useState } from "react"
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "./components/ui/card"
import { Trash2, Info, HelpCircle } from "lucide-react"
import Image from 'next/image'
import logo from './components/logo.png'
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,} from "./components/ui/dialog"
import carInfo from './data/car-info.json'
import { ErrorProvider, useError } from './components/ui/error-provider'

//======================================================================================================================
// Define the structure for car attributes
type CarAttributes = {
    colour: string
    make: string
    model: string
    bodyType: string
    fuel: string
    regYear: string
    transmission: string
    engineSize: string
}
// Define the structure for car information
type CarInfo = {
    [make: string]: string[] | number;
};
// Array of possible car colours
const colours = [
    'red', 'blue', 'black', 'white', 'silver', 'gray', 'grey', 'green',
    'yellow', 'brown', 'orange', 'beige', 'gold', 'purple', 'pink', 'maroon', 'navy',
    'bronze', 'burgundy', 'turquoise', 'teal', 'lavender', 'charcoal', 'ivory'
]

//======================================================================================================================
// Main component for the Find My Car functionality
function FindMyCarComponent() {
    // Variables
    const [input, setInput] = useState('')
    const [attributes, setAttributes] = useState<CarAttributes | null>(null)
    const [savedCars, setSavedCars] = useState<CarAttributes[]>([])
    const [editingField, setEditingField] = useState<keyof CarAttributes | null>(null)
    const [aboutOpen, setAboutOpen] = useState(false)
    const [helpOpen, setHelpOpen] = useState(false)
    const carData: CarInfo = carInfo;
    const { showMessage } = useError()


    // Function deduces car attributes
    const deduceAttributes = (description: string): CarAttributes => {
        const words = description.toLowerCase().split(' ')
        const attributes: CarAttributes = {
            colour: 'Unknown',
            make: 'Unknown',
            model: 'Unknown',
            bodyType: 'Unknown',
            fuel: 'Unknown',
            regYear: 'Unknown',
            transmission: 'Unknown',
            engineSize: 'Unknown'
        }
        //==============================================================================================================
        let foundMake = '';
        let foundModel = '';
        for (const make in carData) {
            if (words.includes(make.toLowerCase())) {
                foundMake = make;
                attributes.make = make;

                if (Array.isArray(carData[make])) {
                    const models = carData[make] as string[];
                    foundModel = models.find((model: string) => words.includes(model.toLowerCase())) || '';
                }
                break;
            }
        }

        if (foundModel) {
            if (Array.isArray(carData[foundMake])) {
                const validModels = carData[foundMake] as string[];
                if (validModels.includes(foundModel)) {
                    attributes.model = foundModel.toUpperCase();
                } else {
                    attributes.model = 'Unknown';
                }
            }
        }

        const foundColour = words.find(word => colours.includes(word));
        if (foundColour) {
            attributes.colour = foundColour.charAt(0).toUpperCase() + foundColour.slice(1);
        }

        const bodyTypeMap: { [key: string]: string } = {
            'convertible': 'Convertible/Cabriolet',
            'cabriolet': 'Convertible/Cabriolet',
            'coupe': 'Coupe',
            'estate': 'Estate Car/Station Wagon',
            'wagon': 'Estate Car/Station Wagon',
            'hatchback': 'Hatchback',
            'saloon': 'Saloon',
            'sedan': 'Saloon',
            'suv': 'SUV',
            'mpv': 'MPV',
            'pickup': 'Pickup Truck',
            'truck': 'Pickup Truck'
        };
        const foundBodyType = words.find(word => Object.keys(bodyTypeMap).includes(word));
        if (foundBodyType) attributes.bodyType = bodyTypeMap[foundBodyType];

        const fuelTypes = ['diesel', 'electric', 'electricity', 'hybrid', 'petrol', 'hydrogen'];
        const foundFuelType = words.find(word => fuelTypes.includes(word));
        if (foundFuelType) {
            attributes.fuel = foundFuelType.charAt(0).toUpperCase() + foundFuelType.slice(1);
        }

        const yearMatch = description.match(/\b(19|20)\d{2}\b/);
        if (yearMatch) {
            attributes.regYear = yearMatch[0];
        }

        if (words.includes('automatic') || words.includes('auto')) {
            attributes.transmission = 'Automatic';
        } else if (words.includes('manual')) {
            attributes.transmission = 'Manual';
        }

        const engineSizeMatch = description.match(/(\d+(\.\d+)?)\s*(L|cc)/i);
        if (engineSizeMatch) {
            const [, size, , unit] = engineSizeMatch;
            if (unit.toLowerCase() === 'cc') {
                const ccValue = parseFloat(size);
                attributes.engineSize = ccValue >= 1000 ? `${(ccValue / 1000).toFixed(1)}L` : `${size}cc`;
            } else {
                attributes.engineSize = `${size}L`;
            }
        }

        return attributes;
    }

    //==================================================================================================================
    // Handler for form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (input.trim() === '') {
            showMessage('Please enter a valid car description.',  'error')
            setAttributes(null)
            return
        }
        const deducedAttributes = deduceAttributes(input)
        if (deducedAttributes.make === 'Unknown' && deducedAttributes.model === 'Unknown') {
            showMessage('Unable to identify the car make and model. Please provide more details.', 'error')
        } else if (deducedAttributes.make === 'Unknown') {
            showMessage('Unable to identify the car make. Please check your input.', 'error')
        } else if (deducedAttributes.model === 'Unknown') {
            showMessage('Unable to identify the car model. Please provide more details.', 'error')
        } else {
            showMessage('Car details deduced successfully!', 'success')
        }
        setAttributes(deducedAttributes)
    }
    // Handler to clear input and attributes
    const handleClear = () => {
        setInput('')
        setAttributes(null)
        setEditingField(null)
    }

    // Handler to add a car to saved cars
    const handleAdd = () => {
        if (attributes) {
            if (attributes.make === 'Unknown' || attributes.model === 'Unknown') {
                showMessage('Cannot add car with unknown make or model. Please provide valid information.', 'error')
                return
            }
            setSavedCars(prev => [...prev, attributes])
            handleClear()
            showMessage('Car added successfully!', 'success')//#0E838A
        } else {
            showMessage('No car details to add. Please submit car information first.', 'error')
        }
    }

    // Handler to start editing a field
    const handleEdit = (field: keyof CarAttributes) => {
        setEditingField(field)
    }
    // Handler to save an edited field
    const handleSave = (field: keyof CarAttributes, value: string) => {
        if (attributes) {
            if (field === 'make' || field === 'model') {
                if (value.trim() === '' || value === 'Unknown') {
                    showMessage(`${field.charAt(0).toUpperCase() + field.slice(1)} cannot be empty or unknown.`, 'error')
                    return
                }
            }
            setAttributes({ ...attributes, [field]: value })
        }
        setEditingField(null)
    }
    // Handler to delete a saved car
    const handleDelete = (index: number) => {
        setSavedCars(prev => prev.filter((_, i) => i !== index))
        showMessage('Car deleted successfully.', 'success')
    }
    // Helper function to format attribute names
    const formatAttributeName = (key: string): string => {
        return key.split(/(?=[A-Z])/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }

    //==================================================================================================================
    // JSX
    return (
        <div className="min-h-screen bg-[#011831] text-white">
            <div className="container mx-auto px-4 py-8">
                {/* Main card for car input and attributes display */}
                <Card className="w-full max-w-4xl mx-auto bg-[#F3F8FF] text-[#011831]">
                    <CardHeader>
                        <CardTitle className="text-header text-3xl">Find My Car</CardTitle>
                        <CardDescription>Please describe your car</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="form-container space-y-6">
                            <Input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Example: Blue Land Rover Discovery 2015."
                                className="w-full text-lg p-4 border-[#0069CC]"
                                aria-label="Car description input"
                            />
                            <Button type="submit" className="submit_button w-full text-lg bg-[#0069CC] hover:bg-[#0069CC]/90 text-white">
                                Submit
                            </Button>
                        </form>
                        {attributes && (
                            <div className="mt-6 space-y-4">
                                {Object.entries(attributes).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between text-lg">
                                        <strong>{formatAttributeName(key)}:</strong>
                                        {editingField === key ? (
                                            <Input
                                                type="text"
                                                value={value}
                                                onChange={(e) => handleSave(key as keyof CarAttributes, e.target.value)}
                                                onBlur={() => setEditingField(null)}
                                                className="w-1/2 border-[#0069CC]"
                                                autoFocus
                                            />
                                        ) : (
                                            <span
                                                onClick={() => handleEdit(key as keyof CarAttributes)}
                                                className="cursor-pointer hover:bg-[#0069CC]/10 p-2 rounded w-1/2 text-right"
                                            >
                                                {value}
                                            </span>
                                        )}
                                    </div>
                                ))}
                                <div className="flex space-x-4 mt-6">
                                    <Button onClick={handleClear} variant="outline" className="w-1/2 text-lg border-[#0069CC] text-[#0069CC] hover:bg-[#0069CC]/10">
                                        Clear
                                    </Button>
                                    <Button onClick={handleAdd} className="w-1/2 text-lg bg-[#0069CC] hover:bg-[#0069CC]/90 text-white">
                                        Add
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
                {/* Display saved cars */}
                {savedCars.length > 0 && (
                    <div className="w-full max-w-4xl mx-auto space-y-6 mt-8">
                        <h2 className="text-header font-bold text-white">Saved Cars</h2>
                        {savedCars.map((car, index) => (
                            <Card key={index} className="w-full bg-[#F3F8FF] text-[#011831]">
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.entries(car).map(([key, value]) => (
                                            <p key={key} className="text-lg">
                                                <strong>{formatAttributeName(key)}:</strong> {value}
                                            </p>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter className="card-footer bg-[#0069CC]/10 flex justify-end">
                                    <Button onClick={() => handleDelete(index)} variant="destructive" className="delete_button text-lg bg-[#A90D30] hover:bg-[#A90D30]/90 text-white">
                                        <Trash2 className="mr-2 h-5 w-5" /> Delete
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
            {/* About and Help dialogs */}
            <div className="fixed top-4 right-4 flex space-x-2 z-50">
                <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon" className="bg-white text-[#011831] hover:bg-[#F3F8FF]">
                            <Info className="h-4 w-4" />
                            <span className="sr-only">About</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#F3F8FF] text-[#011831]">
                        <DialogHeader>
                            <DialogTitle>About</DialogTitle>
                            <DialogDescription>
                                Created by: Christopher Jolly, James Waters, Lucas Theodorou.
                                <p>Made for Hastings Direct work experience.</p>
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
                {/* About and Help dialogs */}
                <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon" className="bg-white text-[#011831] hover:bg-[#F3F8FF]">
                            <HelpCircle className="h-4 w-4" />
                            <span className="sr-only">Help</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#F3F8FF] text-[#011831]">
                        <DialogHeader>
                            <DialogTitle>Help</DialogTitle>
                            <DialogDescription>
                                Here's how to use Find My Car:
                                <ul className="list-disc pl-5 mt-2">
                                    <li>Enter a description of your car (e.g., "Blue Land Rover Discovery 2015").</li>
                                    <li>Click "Submit" to see deduced attributes.</li>
                                    <li>Edit any incorrect information by clicking on the attribute value.</li>
                                    <li>Click "Add" to save the car to your list.</li>
                                    <li>View and manage your saved cars in the "Saved Cars" section.</li>
                                </ul>
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            </div>
            {/* Logo */}
            <div className="fixed top-4 left-4 z-50">
                <Image src={logo} alt="HastingsDirectLogo" width={300} height={300} className="object-contain" />
            </div>
        </div>
    );
}

export default function Component() {
    return (
        <ErrorProvider>
            <FindMyCarComponent />
        </ErrorProvider>
    )
}