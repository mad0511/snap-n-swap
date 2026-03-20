import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UploadFlow } from "@/components/upload/upload-flow";

export const metadata = {
  title: "Snap & List — Snap'n'Swap",
  description: "Upload your item, let AI analyze it, and list it in seconds.",
};

export default async function UploadPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <UploadFlow />;
}
