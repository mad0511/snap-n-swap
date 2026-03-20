import { UploadFlow } from "@/components/upload/upload-flow";

export const metadata = {
  title: "Snap & List — Snap'n'Swap",
  description: "Upload your item, let AI analyze it, and list it in seconds.",
};

export default function UploadPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 grid-bg">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <UploadFlow />
      </div>
    </div>
  );
}
