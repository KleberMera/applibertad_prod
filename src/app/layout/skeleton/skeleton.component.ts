import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '@data/services/api/auth.service';
import { HeaderComponent } from '@layout/header/header.component';

@Component({
  selector: 'app-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.scss'
})
export class SkeletonComponent implements OnInit, AfterViewInit{


  @ViewChild(HeaderComponent)
  headerComponent!: HeaderComponent;

  public showLeftNav = true;
  public $theme = 'blue-dark';
  public isLoading = true;

  constructor(private authService: AuthService) { }
  
  
  ngAfterViewInit(): void {
    //console.log('AVI - Skeleton');
    //esto se hacer para que demore en cargar 2 segudos y se pueda ver el loading...
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  }

  ngOnInit(): void {
    //this.authService.initListener(); // Iniciar el listener del servicio de autenticación
    this.onResize(null);
  }

  // toogleLeftNav(){
  //   this.showLeftNav =!this.showLeftNav;
  // }

  toogleLeftNav() {
    this.showLeftNav = !this.showLeftNav;
  }

  
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // Ocultar automáticamente el menú izquierdo si el ancho de la pantalla es igual o menor a 768px
    this.showLeftNav = window.innerWidth > 900;
    //this.headerComponent = 
  }

  
}
