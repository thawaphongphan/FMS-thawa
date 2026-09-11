import { create } from "zustand";

export interface BrandInfo {
  nameTh?: string;
  nameEn?: string;
  logoUrl?: string | null;
}

interface BrandStoreState {
  preview: BrandInfo | null;
  setPreview: (preview: BrandInfo | null) => void;
  resetPreview: () => void;
}

export const useBrandStore = create<BrandStoreState>((set) => ({
  preview: null,
  setPreview: (preview) => {
    set({ preview });
    if (typeof window !== "undefined") {
      try {
        if (preview) {
          window.localStorage.setItem("fms_brand_preview", JSON.stringify(preview));
        } else {
          window.localStorage.removeItem("fms_brand_preview");
        }
      } catch {
        // ignore quota / private mode storage error
      }
    }
  },
  resetPreview: () => {
    set({ preview: null });
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem("fms_brand_preview");
      } catch {
        // ignore
      }
    }
  },
}));

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "fms_brand_preview") {
      try {
        const val = e.newValue ? (JSON.parse(e.newValue) as BrandInfo) : null;
        useBrandStore.setState({ preview: val });
      } catch {
        // ignore
      }
    }
  });
}
