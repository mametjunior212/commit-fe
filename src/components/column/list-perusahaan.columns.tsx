import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

import { Perusahaan } from "@/types/perusahaan.type";

interface Props {
    onSelect: (value: Perusahaan) => void;
}

export const perusahaanColumns = ({
    onSelect,
}: Props): ColumnDef<Perusahaan>[] => [
        {
            accessorKey: "DT_RowIndex",
            header: "No",
        },
        {
            accessorKey: "logo_perusahaan",
            header: "Logo",
            cell: ({ row }) => {
                return (
                    <img
                        src={import.meta.env.VITE_FONT_END + row.original.logo_perusahaan}
                        alt="logo"
                        className="w-10 h-10 rounded-xl border object-cover"
                    />
                );
            },
        },
        {
            accessorKey: "nama_perusahaan",
            header: "Nama Perusahaan",
        },
        {
            accessorKey: "alamat_perusahaan",
            header: "Alamat",
        },
        {
            accessorKey: "nomor_perusahaan",
            header: "Nomor",
        },
        {
            accessorKey: "kategori_bidang_usaha_perusahaan",
            header: "Kategori",
        },
        {
            id: "action",
            header: "Action",
            cell: ({ row }) => {
                return (
                    <Button
                        size="sm"
                        onClick={() => onSelect(row.original)}
                    >
                        Pilih
                    </Button>
                );
            },
        },
    ];