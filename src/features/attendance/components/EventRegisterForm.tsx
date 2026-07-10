import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import JobSelect from "@/components/sections/MemberPages/JobSelected";
import { JobItem } from "@/components/type/pekerjaanType";
import {
    EventRegisterInput,
    eventRegisterDefaultValues,
    eventRegisterSchema,
} from "../schemas/eventRegister.schema";

type EventRegisterFormProps = {
    jobs: JobItem[];
    jobsLoading?: boolean;
    jobsError?: boolean;
    isSubmitting?: boolean;
    onSubmit: (values: EventRegisterInput) => void;
};

export default function EventRegisterForm({
    jobs,
    jobsLoading,
    jobsError,
    isSubmitting,
    onSubmit,
}: EventRegisterFormProps) {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<EventRegisterInput>({
        resolver: zodResolver(eventRegisterSchema),
        defaultValues: eventRegisterDefaultValues,
    });

    const nomorField = register("nomor");

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6"
        >
            {/* Nama */}
            <div>
                <Label>Nama</Label>
                <Input {...register("nama")} placeholder="Nama lengkap" className="mt-1" />
                {errors.nama && (
                    <p className="mt-1 text-sm text-red-500">{errors.nama.message}</p>
                )}
            </div>

            {/* Nomor */}
            <div>
                <Label>Nomor</Label>
                <Input
                    {...nomorField}
                    inputMode="numeric"
                    placeholder="08xxxxxxxxxx"
                    className="mt-1"
                    onChange={(e) => {
                        // Sanitasi sebelum diteruskan ke react-hook-form agar state ikut bersih.
                        e.target.value = e.target.value.replace(/\D/g, "");
                        nomorField.onChange(e);
                    }}
                />
                {errors.nomor && (
                    <p className="mt-1 text-sm text-red-500">{errors.nomor.message}</p>
                )}
            </div>

            {/* Pekerjaan */}
            <div>
                <Label>Pekerjaan</Label>
                <Controller
                    name="pekerjaan_id"
                    control={control}
                    render={({ field }) => (
                        <JobSelect
                            jobs={jobs}
                            value={field.value}
                            onChange={field.onChange}
                            loading={jobsLoading}
                            error={jobsError}
                            disabled={isSubmitting}
                        />
                    )}
                />
                {errors.pekerjaan_id && (
                    <p className="mt-1 text-sm text-red-500">{errors.pekerjaan_id.message}</p>
                )}
            </div>

            {/* Email */}
            <div>
                <Label>Email</Label>
                <Input {...register("email")} placeholder="nama@email.com" className="mt-1" />
                {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
            </div>

            {/* Community */}
            <div>
                <Label>Community</Label>
                <Input {...register("community")} placeholder="Nama community" className="mt-1" />
                {errors.community && (
                    <p className="mt-1 text-sm text-red-500">{errors.community.message}</p>
                )}
            </div>

            {/* Perusahaan */}
            <div>
                <Label>Perusahaan</Label>
                <Input {...register("perusahaan")} placeholder="Nama perusahaan" className="mt-1" />
                {errors.perusahaan && (
                    <p className="mt-1 text-sm text-red-500">{errors.perusahaan.message}</p>
                )}
            </div>

            {/* Alamat */}
            <div className="md:col-span-2">
                <Label>Alamat</Label>
                <Textarea {...register("alamat")} placeholder="Alamat tempat tinggal" className="mt-1" />
                {errors.alamat && (
                    <p className="mt-1 text-sm text-red-500">{errors.alamat.message}</p>
                )}
            </div>

            {/* Alamat Kantor */}
            <div className="md:col-span-2">
                <Label>Alamat Kantor</Label>
                <Textarea {...register("alamat_kantor")} placeholder="Alamat kantor" className="mt-1" />
                {errors.alamat_kantor && (
                    <p className="mt-1 text-sm text-red-500">{errors.alamat_kantor.message}</p>
                )}
            </div>

            <div className="flex justify-end pt-2 md:col-span-2">
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                    {isSubmitting ? "Mengirim..." : "Daftar Event"}
                </Button>
            </div>
        </form>
    );
}
