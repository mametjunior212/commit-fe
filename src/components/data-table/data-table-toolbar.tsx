import { Input } from "@/components/ui/input";

interface Props {
    search: string;
    setSearch: (value: string) => void;
}

export function DataTableToolbar({
    search,
    setSearch,
}: Props) {
    return (
        <div className="mb-4">
            <Input
                placeholder="Cari perusahaan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
    );
}