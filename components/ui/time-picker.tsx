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
    // Example: 15 minute increments
    const minuteOptions = Array.from({ length: 4 }, (_, i) => ({ value: i * 15, label: format(setMinutes(new Date(), i * 15), 'mm') }));

    return (
        <div className="flex items-center gap-2">
            <Select value={String(hours)} onValueChange={(val) => onHoursChange(parseInt(val, 10))}>
                <SelectTrigger className="w-[65px]"><SelectValue /></SelectTrigger>
                <SelectContent>{hourOptions.map(h => <SelectItem key={h.value} value={String(h.value)}>{h.label}</SelectItem>)}</SelectContent>
            </Select>
            <span>:</span>
            <Select value={String(minutes)} onValueChange={(val) => onMinutesChange(parseInt(val, 10))}>
                <SelectTrigger className="w-[65px]"><SelectValue /></SelectTrigger>
                <SelectContent>{minuteOptions.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}</SelectContent>
            </Select>
        </div>
    );
}