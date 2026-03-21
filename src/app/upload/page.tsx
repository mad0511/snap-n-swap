import { UploadFlow } from "@/components/upload/upload-flow";
import { AuthGuard } from "@/components/auth-guard";

export const metadata = {
  title: "Snap & List — Snap'n'Swap",
  description: "Upload your item, let AI analyze it, and list it in seconds.",
};

export default function UploadPage() {
  return (
    <AuthGuard>
      <UploadFlow />
    </AuthGuard>
  );
}
