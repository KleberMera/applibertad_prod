// left-nav-menu.ts
import {
        faHome, 
        faUserTie, 
        faFileInvoice, 
        faThList,
        faCircleChevronRight,
        faFileLines,
        faBuildingShield,
        faClock,
        faEnvelope,
        faHouseMedicalCircleXmark,
        faPen,
        faPenAlt,
        faPenClip,
        faPenFancy,
        faUserEdit,
        faUserTag,
        faUserGraduate,
        faPencilSquare,
        faEyeDropper,
        faEye,
        faEyeSlash,
        faEyeDropperEmpty,
        faEyeLowVision,
        faUpDown,
        faUpload,
        faCancel,
        faBackward
     } from "@fortawesome/free-solid-svg-icons";
import { INTERNAL_ROUTES } from "./routes";
import { ILeftNavMenu } from "@data/interfaces";

/**
 * Los roles a utilizar depederan de los almacenados en la base de datos
 * Deberan colocarse en cada menu necesario respetando mayusculas y minusculas como en la base de datos
 */

export const LEFT_NAV_MENU: ILeftNavMenu[] = [
    {
        title: "Administración",
        roles: [
            "Admin",
        ],
        // roles: [
        //     "Admin", 
        //     "JefeTTHH",
        //     "FinAsist",
        //     "AsistTTHH",
        //     "ContAsist",
        //     "SISO",
        //     "JefComis",
        //     "AsistComis"
        // ],
        links: [
            // {
            //     icon: faHome,
            //     name: "Inicio",
            //     link: INTERNAL_ROUTES.PANEL_WELCOME,
            //     roles: [
            //         "Admin",
            //         "JefeTTHH",
            //         "FinAsist",
            //         "ContAsist",
            //         "AsistTTHH",
            //         "SISO",
            //         "JefComis",
            //         "AsistComis"    
            //     ]
            // },
            {
                icon: faUserTie,
                name: "Usuarios",
                link: INTERNAL_ROUTES.PANEL_ADMIN_USERS,
                roles: ["Admin"]
            },
            {
                icon: faThList,
                name: "Roles",
                link: INTERNAL_ROUTES.PANEL_ADMIN_ROLES,
                roles: ["Admin"]
            }
        ]
    },
    {
        title: "Actas",
        roles: ["User"],
        links: [
            {
                icon: faFileInvoice,
                name: "Ingresar Actas",
                link: INTERNAL_ROUTES.PANEL_ACTAS,
                roles: ["User"]
            }
        ]
    },
    /**
     * MENU PARA TALENTO HUMANO - 02/08/2024
     */
    {
        title: "Talento Humano",
        roles: [
            "Admin", 
            "JefeTTHH", 
            "AsistTTHH",
            "rolTthhConceptosMensuales",
            "SISO",
            "rolTthhConsultaMarcaciones",
            "rolTthhConsultaRolesPago"
        ],
        links: [
            {
                icon: faFileInvoice,
                name: "Historial Relaciones Laborales",
                link: INTERNAL_ROUTES.PANEL_TTHH_HISTORIA,
                //link: INTERNAL_ROUTES.PANEL_WELCOME,
                roles: [
                    "Admin", 
                    "JefeTTHH", 
                    "AsistTTHH"
                ]
            },
            {
                icon: faBuildingShield,
                name: "SISO",
                roles: [
                    "Admin", 
                    "JefeTTHH", 
                    "AsistTTHH",
                    "SISO"
                ],
                subLinks: [
                    {
                        icon: faFileLines,
                        name: "Permisos Aprobados",
                        link: INTERNAL_ROUTES.PANEL_TTHH_SISO_PERMISOS_APROBADOS,
                        roles: [
                            "Admin", 
                            "JefeTTHH", 
                            "AsistTTHH",
                            "SISO"
                        ],
                    }
                ]
            },
            {
                icon: faClock,
                name: "Marcaciones",
                link: INTERNAL_ROUTES.PANEL_TTHH_MARCACIONES,
                roles: [
                    "Admin", 
                    "rolTthhConsultaMarcaciones"
                    // "JefeTTHH", 
                    // "AsistTTHH",
                    // "MarcaTTHH"
                ]
            },
            /*{
                icon: faClock,
                name: "Marcaciones",
                roles: [
                    "Admin", 
                    "rolTthhConsultaMarcaciones"
                ],
                subLinks: [
                    {
                        icon: faClock,
                        name: "Marcaciones",
                        link: INTERNAL_ROUTES.PANEL_TTHH_MARCACIONES,
                        roles: ["Admin", "rolTthhConsultaMarcaciones"]
                    },
                    {
                        icon: faUserTie,
                        name: "Marcaciones por Obrero",
                        link: INTERNAL_ROUTES.PANEL_TTHH_MARCACIONES_OBREROS,
                        roles: ["Admin", "rolTthhConsultaMarcaciones"]
                    }
                ]
            },*/
            {
                icon: faBuildingShield,
                name: "Roles de Pago",
                roles: [
                    "Admin",
                     "JefeTTHH", 
                    "AsistTTHH",
                    "rolTthhConceptosMensuales", 
                    "rolTthhConsultaRolesPago"
                ],
                subLinks: [
                    {
                        icon: faFileLines,
                        name: "Consultar Roles de Pago",
                        link: INTERNAL_ROUTES.PANEL_TTHH_ROLESTTHH,
                        roles: [
                            "Admin", 
                            "rolTthhConsultaRolesPago",
                        ],
                    },
                    {
                        icon: faUpload,
                        name: "Novedades Rol",
                        link: INTERNAL_ROUTES.PANEL_TTHH_NOVEDADES_ROL,
                        roles: [
                            "Admin",
                            "JefeTTHH", 
                            "AsistTTHH",
                            "rolTthhConceptosMensuales",
                        ]
                    },
                    {
                        icon: faEye,
                        name: "Ver Novedades Rol",
                        link: INTERNAL_ROUTES.PANEL_TTHH_VER_NOVEDADES,
                        roles: [
                            "Admin", 
                        ]
                    },
                    // {
                    //     icon: faBackward,
                    //     name: "Reversar Novedades Rol",
                    //     link: INTERNAL_ROUTES.PANEL_TTHH_VER_NOVEDADES,
                    //     roles: [
                    //         "Admin", 
                    //     ]
                    // }
                ]
            },
            // {
            //     icon: faUserTie,
            //     name: "Ficha de Empleado",
            //     roles: [
            //         "Admin", 
            //         "JefeTTHH", 
            //         "AsistTTHH",
            //         "MarcaTTHH"
            //     ],
            //     subLinks: [
            //         {
            //             icon: faUserEdit,
            //             name: "Datos Personales",
            //             link: INTERNAL_ROUTES.PANEL_TTHH_FICHA_EMPLEADO,
            //             roles: [
            //                 "Admin", 
            //                 "JefeTTHH", 
            //                 "AsistTTHH",
            //                 "SISO"
            //             ],
            //         },
            //         {
            //             icon: faUserGraduate,
            //             name: "Ficha Académica",
            //             link: INTERNAL_ROUTES.PANEL_TTHH_EMPLEADO_ACADEMICO,
            //             roles: [
            //                 "Admin", 
            //                 "JefeTTHH", 
            //                 "AsistTTHH",
            //                 "SISO"
            //             ],
            //         },
            //         {
            //             icon: faEnvelope,
            //             name: "Correos",
            //             link: INTERNAL_ROUTES.PANEL_TTHH_EMPLEADO_CORREOS,
            //             roles: [
            //                 "Admin", 
            //                 "JefeTTHH", 
            //                 "AsistTTHH",
            //                 "SISO"
            //             ],
            //         },
            //     ]
            // },
        ]
    },
    /**
     * MENU PARA COMISARIA - 03/10/2024
     */
    {
        title: "Comisaria",
        roles: [
            "Admin",
            "JefComis",
            "AsistComis"
            ],
        links: [
            {
                icon: faFileLines,
                name: "Reporte Patentes",
                link: INTERNAL_ROUTES.PANEL_COMISARIA_INFORME_REPPATENTE,
                //link: INTERNAL_ROUTES.PANEL_WELCOME,
                roles:  [
                    "Admin",
                    "JefComis",
                    "AsistComis"
                    ]
            }
        ]
    },
    /**
     * MENU PARA DPTO. FINANCIERO - 27/08/2024
     */
    {
        title: "Financiero",
        roles: [
            "Admin",
            "FinAsist",
            "ContAsist"
        ],
        links: [
            {
                icon: faCircleChevronRight,
                name: "Informes",
                roles: [
                    "Admin",
                    "FinAsist",
                    "ContAsist"
                    ],
                subLinks: [
                            {
                                icon: faFileLines,
                                name: "Recaudaciones Diarias CM",
                                link: INTERNAL_ROUTES.PANEL_FINANCIERO_INFORME_REPORTEDIARIO,
                                roles: [
                                    "Admin", 
                                    "FinAsist",
                                    "ContAsist"
                                ],
                            },
                            {
                                icon: faFileLines,
                                name: "Recaudaciones/Fecha CM",
                                link: INTERNAL_ROUTES.PANEL_FINANCIERO_INFORME_REPORTEDIARIOFECHA,
                                roles: [
                                    "Admin", 
                                    "FinAsist",
                                    "ContAsist"
                                ],
                            }
                        ]
            }
        ]
    },
    /**
     * MENU PARA RENTAS - 3/04/2025
     */
    {
        title: "Rentas",
        roles: [
            "Admin",
            "rolJefeRentas",
            "rolRentasInspectores",
            "rolLiquidadoresRentas",
        ],
        links: [
            {
                icon: faCircleChevronRight,
                name: "Informes",
                roles: [
                    "Admin",
                    "rolJefeRentas",
                    "rolRentasInspectores"
                    ],
                subLinks: [
                    {
                        icon: faFileLines,
                        name: "Solicitud de Recorrido",
                        link: INTERNAL_ROUTES.PANEL_RENTAS_REPORTE_INSPECCION,
                        roles: [
                            "Admin",
                            "rolJefeRentas",
                            "rolRentasInspectores"
                        ],
                    },
                    {
                        icon: faFileLines,
                        name: "Solicitud de Inspección",
                        link: INTERNAL_ROUTES.PANEL_RENTAS_REPORTE_SOL_INSPECCIONES,
                        roles: [
                            "Admin",
                            // "rolRentasInspectores"
                        ],
                    },
                ]
            },
            {
                icon: faCircleChevronRight,
                name: "Exoneraciones",
                roles: [
                    "Admin",
                    "rolJefeRentas",
                    "rolLiquidadoresRentas",
                    ],
                subLinks: [
                    {
                        icon: faFileLines,
                        name: "Exoneraciones Generadas",
                        link: INTERNAL_ROUTES.PANEL_RENTAS_REPORTE_DE_EXONERACIONES,
                        roles: [
                            "Admin",
                            "rolJefeRentas",
                        ],
                    },
                    {
                        icon: faFileLines,
                        name: "Exoneraciones Liquidadores",
                        link: INTERNAL_ROUTES.PANEL_RENTAS_REPORTE_DE_EXONERACIONES_LIQUIDADORES,
                        roles: [
                            "Admin",
                            "rolLiquidadoresRentas",
                        ],
                    }
                ]
            },
        ]
    },
    /**
     * MENU PARA SISTEMAS - 15/04/2025
     */
    {
        title: "Sistemas",
        roles: [
            "Admin",
            "JefeSistemas",
            "rolCorreos"
            ],
        links: [
            {
                icon: faEnvelope,
                name: "Actualización de Correos",
                link: INTERNAL_ROUTES.PANEL_SISTEMAS_CORREOS,
                //link: INTERNAL_ROUTES.PANEL_WELCOME,
                roles:  [
                    "Admin",
                    "JefeSistemas",
                    "rolCorreos"
                    ]
            },
            {
                icon: faHouseMedicalCircleXmark,
                name: "Mesa de ayuda",
                link: 'http://120.40.69.180:8080/#login',
                //link: INTERNAL_ROUTES.PANEL_WELCOME,
                roles:  [
                    "Admin",
                    "JefeSistemas"
                ],
                external: true
            }
        ]
    },
    /**
     * MENU PARA COORDINACIÓN GENERAL - 15/04/2025
     */
    {
        title: "Coordinación General",
        roles: [
            "Admin",
            "rolContratosCoordinacion"
            ],
        links: [
            {
                icon: faPenFancy,
                name: "Contratos",
                //link: INTERNAL_ROUTES.PANEL_WELCOME,
                roles:  [
                    "Admin",
                    "rolContratosCoordinacion"
                    ],
                subLinks: [
                    {
                        icon: faFileLines,
                        name: "Reporte de Contratos",
                        link: INTERNAL_ROUTES.PANEL_COORDINACION_CONTRATOS,
                        roles: [
                            "Admin", 
                            "rolContratosCoordinacion"
                        ],
                    }
                ]
            },
        ]
    },
    /**
     * MENU PARA SISO - 14/05/2025
     */
    // {
    //     title: "S&SO",
    //     roles: [
    //         "Admin",
    //         "SISO"
    //         ],
    //     links: [
    //         {
    //             icon: faFileLines,
    //             name: "Permisos Aprobados",
    //             link: INTERNAL_ROUTES.PANEL_TTHH_SISO_PERMISOS_APROBADOS,
    //             roles: [
    //                 "Admin", 
    //                 "JefeTTHH", 
    //                 "AsistTTHH",
    //                 "SISO"
    //             ],
    //         },
    //     ]
    // },
    /**
     * MENU PARA TRÁMITES - 29/05/2025
     */
    {
        title: "Gestión Documental",
        roles: [
            "Admin"
            ],
        links: [
            {
                icon: faFileLines,
                name: "Documentos Externos",
                link: INTERNAL_ROUTES.PANEL_FLUJO_TRAMITES_INGRESO_RECEPCION,
                roles:  [
                    "Admin"
                ],             
            },
            {
                icon: faFileLines,
                name: "Documentos Internos",
                link: INTERNAL_ROUTES.PANEL_FLUJO_TRAMITES_TRAMITE_INTERNO,
                roles:  [
                    "Admin"
                ],             
            },
        ]
    },
];
