import ModalPerusahaan from "@/components/modal/modal-perusahaan";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ModalSetPerusahaan({
    user,
    onClick,
    open,
    onOpenChange,
    onSelect,
}) {
    return (
        <Card>
            <CardContent className="space-y-4 p-6">
                {user.nama_perusahaan && <>
                    <h2 className="text-lg font-semibold">
                        Perusahaan / Property
                    </h2>

                    <div className="flex items-center gap-4 border-b pb-4">
                        <img
                            src={(import.meta as ImportMeta).env.VITE_FONT_END + user.logo_perusahaan}
                            alt="logo"
                            className="h-16 w-16 rounded border object-contain"
                        />

                        <div>
                            <h3 className="text-xl font-bold">
                                {user.nama_perusahaan}
                            </h3>

                            <p className="text-sm text-muted-foreground">
                                {user.kategori_bidang_usaha_perusahaan}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>
                                Nama Perusahaan/Nama Property
                            </Label>

                            <Input
                                value={user.nama_perusahaan ?? ""}
                                disabled
                            />
                        </div>

                        <div>
                            <Label>Nomor</Label>

                            <Input
                                value={user.nomor_perusahaan ?? ""}
                                disabled
                            />
                        </div>

                        <div className="col-span-2">
                            <Label>Domisili</Label>
                            <Textarea
                                disabled
                                value={user.alamat_perusahaan ?? ""}
                            />
                        </div>

                        <div className="col-span-2">
                            <Label>Kategori</Label>

                            <Input
                                value={user.kategori_bidang_usaha_perusahaan ?? ""}
                                disabled
                            />
                        </div>
                    </div>
                </>
                }
                <div className="flex items-center justify-between">
                    {user.nama_perusahaan === null &&
                        < p className="text-muted-foreground">
                            Belum ada perusahaan
                        </p>
                    }

                    <Button
                        onClick={onClick}
                    >
                        Set Perusahaan
                    </Button>
                    <ModalPerusahaan
                        open={open}
                        onOpenChange={onOpenChange}
                        onSelect={(value) => onSelect(value)}
                    />
                </div>
            </CardContent>
        </Card>
    );
}