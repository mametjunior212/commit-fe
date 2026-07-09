import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { addPerusahaan } from "@/api/perusahaan.api";
import { PerusahaanForm, perusahaanSchema } from "../z/perusahaanSchema";
import { Textarea } from "../ui/textarea";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    oncomplete: (open: boolean) => void;
}

export function ModalTambahPerusahaan({
    open,
    onOpenChange,
    oncomplete
}: Props) {
    const queryClient = useQueryClient();
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<PerusahaanForm>({
        resolver: zodResolver(perusahaanSchema),
        defaultValues: {
            logo: null,
            nama: "",
            alamat: "",
            nomor: "",
            kategori_bidang_usaha: "",
        },
    });

    const onSubmit = async (values: PerusahaanForm) => {
        const formData = new FormData();

        if (values.logo) {
            formData.append("logo", values.logo);
        }

        formData.append(
            "nama",
            values.nama
        );
        formData.append("alamat", values.alamat);
        formData.append("nomor", values.nomor);
        formData.append("kategori_bidang_usaha", values.kategori_bidang_usaha);

        await addPerusahaan(formData);

        await queryClient.invalidateQueries({
            queryKey: ["DETAIL_USER"],
        });
        await queryClient.invalidateQueries({
            queryKey: ["Listperusahaan"],
        });

        reset();
        onOpenChange(false);
        oncomplete(false);
        reset();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>
                        Tambah Perusahaan
                    </DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    <div>
                        <label>Logo</label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setValue(
                                    "logo",
                                    e.target.files?.[0] ?? null,
                                    {
                                        shouldValidate: true,
                                    }
                                )
                            }
                        />
                        <p className="text-sm text-red-500">
                            {errors.logo?.message}
                        </p>
                    </div>

                    <div>
                        <label>Nama Perusahaan</label>
                        <Input
                            {...register("nama")}
                        />
                        <p className="text-sm text-red-500">
                            {errors.nama?.message}
                        </p>
                    </div>

                    <div>
                        <label>Alamat</label>
                        <Textarea {...register("alamat")} />
                        <p className="text-sm text-red-500">
                            {errors.alamat?.message}
                        </p>
                    </div>

                    <div>
                        <label>Nomor Telpon Perusahaan</label>
                        <Input {...register("nomor")} />
                        <p className="text-sm text-red-500">
                            {errors.nomor?.message}
                        </p>
                    </div>

                    <div>
                        <label>Kategori Bidang Usaha</label>
                        <Input {...register("kategori_bidang_usaha")} />
                        <p className="text-sm text-red-500">
                            {errors.kategori_bidang_usaha?.message}
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                onOpenChange(false)
                            }
                        >
                            Batal
                        </Button>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            Simpan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}