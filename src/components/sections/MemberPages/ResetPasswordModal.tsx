import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useState } from "react";
import { Modal } from "@/lib/modal";

export default function ResetPasswordModal({
  open,
  onClose,
  form,
  onSubmit,
}) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <Modal open={open} onClose={onClose} title="Reset Password">
      <form
        className="space-y-3"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {/* PASSWORD LAMA */}
        <div className="relative">
          <Input
            type={showCurrent ? "text" : "password"}
            placeholder="Password Lama Anda"
            {...form.register("current")}
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* PASSWORD BARU */}
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            {...form.register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* CONFIRM */}
        <div className="relative">
          <Input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm Password"
            {...form.register("confirm")}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {form.formState.errors.confirm && (
          <p className="text-sm text-red-500">
            {form.formState.errors.confirm.message}
          </p>
        )}

        <Button type="submit" className="w-full">
          Reset Password
        </Button>
      </form>
    </Modal>
  );
}