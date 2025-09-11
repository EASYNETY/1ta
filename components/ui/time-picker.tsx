import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

// This is a basic example using selects, could be made more advanced
interface TimePickerProps {
    hours: number;
    minutes: number;
    onHoursChange: (hours: number) => void;
    onMinutesChange: (minutes: number) => void;
}
import { format, setHours, setMinutes } from "date-fns";


export function TimePicker({ hours, minutes, onHoursChange, onMinutesChange }: TimePickerProps) {
    const hourOptions = Array.from({ length: 24 }, (_, i) => ({ value: i, label: format(setHours(new Date(), i), 'HH') }));
    // Use 5-minute increments for more precise scheduling
    const minuteOptions = Array.from({ length: 12 }, (_, i) => ({ value: i * 5, label: format(setMinutes(new Date(), i * 5), 'mm') }));

    return (
        <div className="flex items-center gap-2 w-full">
            <Select value={String(hours)} onValueChange={(val) => onHoursChange(parseInt(val, 10))}>
                <SelectTrigger className="w-[90px] h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                    {hourOptions.map(h => (
                        <SelectItem key={h.value} value={String(h.value)}>{h.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <span className="text-lg font-medium">:</span>
            <Select value={String(minutes)} onValueChange={(val) => onMinutesChange(parseInt(val, 10))}>
                <SelectTrigger className="w-[90px] h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                    {minuteOptions.map(m => (
                        <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
