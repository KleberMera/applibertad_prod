import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { API_ROUTES } from '@data/constants/routes';
import { AuthService } from '@data/services/api/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  cedula = '';  // Puede ser variable o venir de algún input/servicio
  userData: any = null;   // Aquí guardaremos los datos recibidos

  constructor(private http: HttpClient, private authService: AuthService) {
    const userDataString = sessionStorage.getItem('currentUserGADMLL');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.cedula = userData.CEDULA;
    }
  }

  ngOnInit(): void {
    this.obtenerDatosUsuario();
  }

  obtenerDatosUsuario() {
    Swal.fire({
      title: 'Consultando datos...',
      text: 'Por favor, espere un momento.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    if (!this.cedula) return;

    
    const url = API_ROUTES.TTHH.DATOS;
    const body = new HttpParams().set('cedula', this.cedula);
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    
    this.http.post<any>(url, body.toString(), { headers }).subscribe({
      next: res => {
        Swal.close();
        if (!res.error && res.data?.length > 0) {
          this.userData = res.data[0];
        } else {
          this.userData = null;
          console.error('No se encontraron datos o hubo un error');
        }
      },
      error: err => {
        this.userData = null;
        console.error('Error en la petición:', err);
      }
    });
  }

  obtenerNombres(nombreCompleto: string): string {
    const partes = nombreCompleto.trim().split(' ');
    return partes.slice(0, 2).join(' ');
  }
  
  obtenerApellidos(nombreCompleto: string): string {
    const partes = nombreCompleto.trim().split(' ');
    return partes.slice(2).join(' ');
  }
  
}
