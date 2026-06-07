import { useMemo, useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { usePerusahaan } from "@/hooks/use-perusahaan";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";

import { Perusahaan } from "@/types/perusahaan.type";
import { perusahaanColumns } from "../column/list-perusahaan.columns";
import { ModalTambahPerusahaan } from "./modal-add-perusahaan";
import { Button } from "../ui/button";

interface Props {
    open: boolean;
    onOpenChange: (value: boolean) => void;
    onSelect: (value: Perusahaan) => void;
}

export default function ModalPerusahaan({
    open,
    onOpenChange,
    onSelect,
}: Props) {
    const [page, setPage] = useState<number>(1);
    const [search, setSearch] = useState<string>("");
    const [openTambah, setOpenTambah] = useState(false);

    const limit = 10;

    const { data, isLoading } = usePerusahaan({
        page,
        limit,
        search,
    });

    const columns = useMemo(() => {
        return perusahaanColumns({
            onSelect: (value) => {
                onSelect(value);
                onOpenChange(false);
            },
        });
    }, [onOpenChange, onSelect]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-7xl">
                <DialogHeader>
                    <DialogTitle>Pilih Perusahaan</DialogTitle>
                </DialogHeader>
                <Button onClick={() => setOpenTambah(true)}>
                    Tambah Perusahaan
                </Button>
                <ModalTambahPerusahaan
                    open={openTambah}
                    onOpenChange={setOpenTambah}
                    oncomplete={() => onOpenChange(false)}
                />

                <DataTableToolbar
                    search={search}
                    setSearch={setSearch}
                />

                <DataTable
                    columns={columns}
                    data={data?.data || []}
                    loading={isLoading}
                />

                <DataTablePagination
                    page={page}
                    limit={limit}
                    total={data?.recordsFiltered || 0}
                    onPageChange={setPage}
                />
            </DialogContent>
        </Dialog>
    );
}