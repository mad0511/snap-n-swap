import { Metadata } from "next";
import { MarketplaceView } from "@/components/marketplace/marketplace-view";

export const metadata: Metadata = {
  title: "Marketplace | Snap'n'Swap",
  description:
    "Browse thousands of pre-loved fashion items. Buy or swap vintage jackets, designer bags, sneakers, and more.",
};

export default function MarketplacePage() {
  return <MarketplaceView />;
}
