// interfaces.ts
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

// Interfaz para los enlaces de menú
export interface ILeftNavLink {
    icon: IconDefinition; // Icono del enlace
    name: string; // Nombre del enlace
    link?: string; // URL del enlace (opcional)
    method?: () => any; // Función a ejecutar en lugar de un enlace (opcional)
    roles?: string[]; // Roles que pueden acceder a este enlace (opcional)
    subLinks?: ILeftNavLink[]; // Sub-enlaces (opcional)
    external?: boolean;
}

// Interfaz para el menú principal
export interface ILeftNavMenu {
    title: string; // Título del menú
    roles?: string[]; // Roles que pueden ver este menú (opcional)
    links: ILeftNavLink[]; // Enlaces dentro del menú
}
