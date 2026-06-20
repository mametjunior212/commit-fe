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
                const base = (import.meta as ImportMeta).env.VITE_FONT_END;
                const rawPath = row.original.logo_perusahaan;
                const fixedPath = rawPath.replace(/&amp;/g, "&");
                const url = base + fixedPath

                return (
                    <img
                        src={url}
                        alt="logo"
                        className="w-10 h-10 rounded-xl border object-cover"
                    />
                );
            },
        },
        {
            accessorKey: "nama_perusahaan",
            header: "Nama Perusahaan",
            cell: ({ row }) => {
                const rawPath = row.original.nama_perusahaan ?? "";
                const fixedPath = rawPath.replace(/&amp;/g, "&");
                const text = fixedPath
                return (<b>{text}</b>)
            }
        },
        {
            accessorKey: "alamat_perusahaan",
            header: "Alamat",
            cell: ({ row }) => {
                const rawPath = row.original.alamat_perusahaan ?? "";
                const fixedPath = rawPath.replace(/&amp;/g, "&");
                const text = fixedPath
                return (<b>{text}</b>)
            }
        },
        {
            accessorKey: "nomor_perusahaan",
            header: "Nomor",
        },
        {
            accessorKey: "kategori_bidang_usaha_perusahaan",
            header: "Kategori",
            cell: ({ row }) => {
                const rawPath = row.original.kategori_bidang_usaha_perusahaan ?? "";
                const fixedPath = rawPath.replace(/&amp;/g, "&");
                const text = fixedPath
                return (<b>{text}</b>)
            }
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