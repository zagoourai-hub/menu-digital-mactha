import { useQuery } from "@tanstack/react-query";

interface Produk {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  imgUrl?: string
  desk?:string
}

interface Category {
  id: number;
  name: string;
} 

interface MenuResponse {
    category : Category[]
    produk : Produk[]
}



async function FecthMenu(): Promise<MenuResponse> {
    const res = await fetch("/api/menus")
    if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
            error?: string
        } | null
        throw new Error(body?.error ?? `Request failed: ${res.status}`);
    }
    return (await res.json()) as MenuResponse;
}


export function useMenu() {
   return useQuery({
    queryKey: ['menu'],
    queryFn: FecthMenu,
   })
} 
    
