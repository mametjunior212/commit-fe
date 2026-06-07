import { Button } from "@/components/ui/button";

interface Props {
    page: number;
    total: number;
    limit: number;
    onPageChange: (page: number) => void;
}

export function DataTablePagination({
    page,
    total,
    limit,
    onPageChange,
}: Props) {
    const totalPages = Math.ceil(total / limit);

    return (
        <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
                Total Data: {total}
            </p>

            <div className="flex gap-2">
                <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    Previous
                </Button>

                <Button variant="outline">
                    {page} / {totalPages || 1}
                </Button>

                <Button
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}