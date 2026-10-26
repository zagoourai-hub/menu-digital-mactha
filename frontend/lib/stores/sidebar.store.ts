import { create } from "zustand"


type Sidebar = {
    isOpen: boolean
    open: () => void
    close: () => void
    toogle: () => void
}

export const SidebarStore = create<Sidebar>()((set) => ({
isOpen : false,
open : () => set({isOpen : true}),
close : () => set({isOpen : false}),
toogle : () => set((state) => ({isOpen: !state.isOpen})),  
}))