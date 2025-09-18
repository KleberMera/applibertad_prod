import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { SkeletonComponent } from '@layout/skeleton/skeleton.component';

const routes: Routes = [
  {
    path:'',
    redirectTo:'/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => 
      import('@modules/auth/auth.module').then((m) => m.AuthModule)
    
  },
  {
    path:'panel',
    component:SkeletonComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      {
        path:'listaEstados',
        loadChildren: () =>
          import('@modules/estados/estados.module').then( (m) => m.EstadosModule),
        canActivate: [AuthGuard]
     },
     {
       path:'admin',
        loadChildren: () =>
          import('@modules/admin/admin.module').then( (m) => m.AdminModule), //Aqui se coloca el modulo Adminsitrador
        canActivate: [AuthGuard]
     },
     {
       path:'tthh',
        loadChildren: () =>
          import('@modules/tthh/tthh.module').then( (m) => m.TthhModule), //Aqui se coloca el modulo TTHH
        canActivate: [AuthGuard]
      },
     {
       path:'comisaria',
        loadChildren: () =>
          import('@modules/comisaria/comisaria.module').then( (m) => m.ComisariaModule), //Aqui se coloca el modulo TTHH
        canActivate: [AuthGuard]
     },
     {
       path:'financiero',
        loadChildren: () =>
          import('@modules/financiero/financiero.module').then( (m) => m.FinancieroModule), //Aqui se coloca el modulo TTHH
        canActivate: [AuthGuard]
     },
     {
      path:'componentes',
      loadChildren: () =>
        import('@modules/componentes/componentes.module').then( (m) => m.ComponentesModule),
      canActivate: [AuthGuard]
     },
     {
         path:'currency',
         loadChildren: () =>
           import('@modules/prueba/prueba.module').then( (m) => m.PruebaModule),
         canActivate: [AuthGuard]
      },
      // {
      //    path:'user',
      //    loadChildren: () =>
      //    import('@modules/user/user.module').then( (m) => m.UserModule)
      // },
      {
        path:'empleados',
        loadChildren: () =>
        import('@modules/empleados/empleados.module').then( (m) => m.EmpleadosModule),
        canActivate: [AuthGuard]
     },
     {
      path:'eventos',
      loadChildren: () =>
      import('@modules/eventos/eventos.module').then( (m) => m.EventosModule),
      canActivate: [AuthGuard]
     },
     {
      path:'departamentos',
      loadChildren: () =>
      import('@modules/departamentos/departamentos.module').then( (m) => m.DepartamentosModule),
      canActivate: [AuthGuard]
     },
     {
      path:'actas',
      loadChildren: () =>
      import('@modules/actas/actas.module').then( (m) => m.ActasModule),
      canActivate: [AuthGuard]
     },
     {
      path:'usuarios',
      loadChildren: () =>
      import('@modules/usuarios/usuarios.module').then( (m) => m.UsuariosModule),
      canActivate: [AuthGuard]
     },
     {
      path:'asistencia',
      loadChildren: () =>
      import('@modules/asistencias/asistencias.module').then( (m) => m.AsistenciasModule),
      canActivate: [AuthGuard]
     },
      {
        path:'welcome',
        loadChildren: () =>
        import('@modules/welcome/welcome.module').then( (m) => m.WelcomeModule),
        canActivate: [AuthGuard]
     },
      {
        path:'clientes',
        loadChildren: () =>
        import('@modules/clientes/clientes.module').then( (m) => m.ClientesModule),
        canActivate: [AuthGuard]
     },
      {
        path:'vehiculos',
        loadChildren: () =>
        import('@modules/vehiculos/vehiculos.module').then( (m) => m.VehiculosModule),
        canActivate: [AuthGuard]
     },
      {
        path:'pagos',
        loadChildren: () =>
        import('@modules/pagos/pagos.module').then( (m) => m.PagosModule),
        canActivate: [AuthGuard]
     },
     {
       path:'rentas',
       loadChildren: () =>
       import('@modules/rentas/rentas.module').then( (m) => m.RentasModule),
       canActivate: [AuthGuard]
    },
     {
       path:'sistemas',
       loadChildren: () =>
       import('@modules/sistemas/sistemas.module').then( (m) => m.SistemasModule),
       canActivate: [AuthGuard]
    },
     {
       path:'coordgeneral',
       loadChildren: () =>
       import('@modules/coordgeneral/coordgeneral.module').then( (m) => m.CoordgeneralModule),
       canActivate: [AuthGuard]
    },
     {
       path:'tramites',
       loadChildren: () =>
       import('@modules/flujo-tramites/flujo-tramites.module').then( (m) => m.FlujoTramitesModule),
       canActivate: [AuthGuard]
    },
     
    ]
  },
  {
    //Esto permite que cualquier ruta incorrecta que no exista me lleve a la ruta señalada
    path:'**',
      redirectTo:'/panel/welcome',
    //redirectTo:'/auth/login',
    pathMatch:'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash:true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
