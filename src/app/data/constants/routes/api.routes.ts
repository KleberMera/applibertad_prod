import { environment as ENV } from "environments/environment";

//Aqui se manejan las apis externas

export const API_ROUTES = {
  AUTH : {
    // LOGIN : ENV.uri + 'auth/login'
    LOGIN :  `${ENV.uri}auth/login`
  },
  INSERT : {
    INSERT_EMPLOYEES :  `${ENV.uri}ws_eventos/ingresoEmpleados.php`,   //No se usa en inventario
    INSERT_EVENTS :  `${ENV.uri}ws_eventos/ingresoEventos.php`,        //No se usa en inventario
    INSERT_ASIST :  `${ENV.uri}ws_eventos/ingresoAsistencia.php`,       //No se usa en inventario
    INSERT_ESTADOS :  `${ENV.uri}v1/insertEstado`,
    INSERT_TIP_COMP :  `${ENV.uri}v1/insertTipComp`,
    INSERT_DEPART :  `${ENV.uri}v1/insertDepar`,
    INSERT_USUARIO :  `${ENV.uri}v1/insertUser`,
    INSERT_COMPONENTE :  `${ENV.uri}v1/insertComp`,
    INSERT_ACTAS :  `${ENV.uri}v1/insertActas`
  },
  CONSULT : {
    CONSULT_EVENTS :  `${ENV.uri}ws_eventos/listaEventos.php`,         //No se usa en inventario
    CONSULT_EMPOYEESBYCED :  `${ENV.uri}ws_eventos/datosEmpleado.php`, //No se usa en inventario
    CONSULT_ESTADOS :  `${ENV.uri}v1/estados`,
    CONSULT_ESTADOS_SHORT :  `${ENV.uri}v1/estadosShort`,
    CONSULT_TIP_COMP :  `${ENV.uri}v1/tipoComponentes`,
    CONSULT_DEPART :  `${ENV.uri}v1/departamentos`,
    CONSULT_USUARIOS :  `${ENV.uri}v1/usuarios`,
    CONSULT_DEPART_SHORT : `${ENV.uri}v1/departShort`,
    CONSULT_COMPONENTES : `${ENV.uri}v1/componentes`,
    CONSULT_USER_BYCED : `${ENV.uri}v1/userCed`,
    CONSULT_COMPO_COD : `${ENV.uri}v1/compCod`,
  },
  UPDATE :{
    UPDATE_ESTADO :   `${ENV.uri}v1/actualizaEstado`,
    UPDATE_TIP_COMP : `${ENV.uri}v1/actualizaTipComp`,
    UPDATE_DEPART : `${ENV.uri}v1/actualizaDepar`,
    UPDATE_USUARIO : `${ENV.uri}v1/actualizaUser`,
    UPDATE_COMPONENTE : `${ENV.uri}v1/actualizaComp`
  },
  ADMIN:{
    CONS_ROLES : `${ENV.uri}admin/obtenerRoles`,
    CONS_ROLES_SHORT : `${ENV.uri}admin/obtenerRolesShort`,
    CONS_DATA_USER : `${ENV.uri}admin/userData`,
    CONS_USERS : `${ENV.uri}admin/obtenerUsuarios`,
    CONS_USERS_ROLES : `${ENV.uri}admin/usuariosRol`,
    INSERT_USER : `${ENV.uri}admin/crearUsuario`,
    INSERT_ROL : `${ENV.uri}admin/crearRol`,
    UPDATE_ROL : `${ENV.uri}admin/editarRol`,
    CHANGE_PASSWORD : `${ENV.uri}admin/cambiarContrasena`
  },
  TTHH: {
    DATOS: `${ENV.uri}admin/userData`,
    CONS_REL_LAB_BYCED : `${ENV.uri}tthh/empleadoRelacionLaboral`,
    SISO : {
      CONS_PERMISOS : `${ENV.uri}siso/getPermisosAprobados`,
    },
    MARCACIONES: `${ENV.uri}tthh/getMarcacionesByCedulaFecha`,
    RESUMEN_MARCACIONES: `${ENV.uri}tthh/getResumenMarcaciones`,
    ROLES: `${ENV.uri}tthh/getRolDePagoIndividual`,
    ROLESCABECERA: `${ENV.uri}tthh/getRolDePagoIndividualCab`,
    ROLESDETALLE: `${ENV.uri}tthh/getRolDePagoIndividualDet`,
    ROLESCONCEPTOS: `${ENV.uri}tthh/getListaConceptos`,
    CARGARVALORES: `${ENV.uri}tthh/cargaMasivaConceptos`,
    GENERARNOVEDADES: `${ENV.uri}tthh/generarNovedades`, 
    VERFALTANTES: `${ENV.uri}tthh/getConceptosAplicadosByPeriodo`,
    TIPOEMPLEADO: `${ENV.uri}tthh/getListaTipoEmpleado`,
    VERNOVEDADES: `${ENV.uri}tthh/getNovedadesGeneradas`,
    EDITARROL: `${ENV.uri}tthh/actualizarNovedadesByEmpleado`,
    LISTA_EMPLEADOS_FILTRO: `${ENV.uri}tthh/getListaEmpleadosFiltro`,
  },
  COMISARIA: {
    REP_PATENTE : `${ENV.uri}comisaria/repPatente`,
    // CONS_REL_LAB_PERIOD : `${ENV.uri}tthh/empleadoContratoActivo`
  },
  FINANCIERO: {
    RECAUDACIONES_POR_DIA : `${ENV.uri}financiero/recaudacionesPorDia`,
    RECAUDACIONES_POR_FECHA : `${ENV.uri}financiero/recaudacionesPorFecha`,
    REPORT_RECAUD_POR_DIA : `${ENV.uri}financiero/genRepRecaudPorDia`,
    REPORT_RECAUD_POR_FECHA : `${ENV.uri}financiero/genRepRecaudPorFecha`,
    // CONS_REL_LAB_PERIOD : `${ENV.uri}tthh/empleadoContratoActivo`
  },
  COORDINACION: {
    TIPOS_CONTRATOS: `${ENV.uri}coordinacion/getTipos`,
    UBICACIONES_CONTRATOS: `${ENV.uri}coordinacion/getUbicaciones`,
    ESTADO_CONTRATOS: `${ENV.uri}coordinacion/getContratosFinalizadosAnulados`,
  },
  ALCALDIA: {
    GET_CONTRIBUYENTE: `${ENV.uri}alcaldia/getContribuyente`,
    GET_DEPARTAMENTOS: `${ENV.uri}alcaldia/getDepartamentos`,
    GET_NUMTRAMITE: `${ENV.uri}alcaldia/getNumeroTramite`,
    CREAR_TRAMITE: `${ENV.uri}alcaldia/crearTramiteExterno`,
    LISTAR_TRAMITES: `${ENV.uri}alcaldia/getListaTramiteExterno`,
    DETALLE_TRAMITES: `${ENV.uri}alcaldia/getDetalleTramiteExterno`,
    GUARDAR_TRAMITE_EXT: `${ENV.uri}alcaldia/enviarTramiteExterno`
  },
  RENTAS: {
    REPORTE_EXONERACIONES: `${ENV.uri}rentas/reporteExoneraciones`, 
  }
};