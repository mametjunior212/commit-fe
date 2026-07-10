import * as Select from "@radix-ui/react-select";
import { Loader2, Search } from "lucide-react";
import { PAGE_SIZES } from "../constants/attendance.constant";

type AttendanceControlsProps = {
    searchInput: string;
    onSearchChange: (value: string) => void;
    isFetching: boolean;
    onRefresh: () => void;
    perPage: number;
    onPerPageChange: (perPage: number) => void;
};

export default function AttendanceControls({
    searchInput,
    onSearchChange,
    isFetching,
    onRefresh,
    perPage,
    onPerPageChange,
}: AttendanceControlsProps) {
    return (
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xl">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                        value={searchInput}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Cari nama / nomor / alamat / email / perusahaan..."
                        className="w-full pl-9 pr-3 py-2 rounded-lg border
                            bg-white text-black border-gray-200
                            focus:outline-none focus:ring-2 focus:ring-indigo-500
                            dark:bg-[hsl(var(--background))] dark:text-white dark:border-[hsl(var(--input))]"
                    />
                </div>

                <button
                    onClick={onRefresh}
                    type="button"
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm
                        bg-gray-100 hover:bg-gray-200 dark:bg-[hsl(var(--secondary))] dark:hover:bg-[hsl(var(--accent))]"
                >
                    {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
                </button>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 w-full lg:w-auto">
                <label className="text-sm text-gray-500 dark:text-gray-400">Tampilkan</label>

                <Select.Root value={String(perPage)} onValueChange={(v) => onPerPageChange(Number(v))}>
                    <Select.Trigger
                        className="inline-flex items-center justify-between rounded-lg border px-3 py-2 min-w-[90px]
                            bg-white dark:bg-[hsl(var(--background))]
                            border-gray-200 dark:border-[hsl(var(--input))]"
                    >
                        <Select.Value />
                    </Select.Trigger>

                    <Select.Content className="rounded-lg border bg-white dark:bg-[hsl(var(--background))] shadow-lg">
                        <Select.Viewport className="p-1">
                            {PAGE_SIZES.map((size) => (
                                <Select.Item
                                    key={size}
                                    value={String(size)}
                                    className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-[hsl(var(--accent))] cursor-pointer"
                                >
                                    <Select.ItemText>{size}</Select.ItemText>
                                </Select.Item>
                            ))}
                        </Select.Viewport>
                    </Select.Content>
                </Select.Root>
            </div>
        </div>
    );
}
