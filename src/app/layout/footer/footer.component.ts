import { Component, OnInit } from '@angular/core';
import { faFacebook, faTwitter, faYoutube } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit{

  public faYoutube = faYoutube;
  public faTwitter = faTwitter;
  public faFacebook = faFacebook;
  
  constructor() { }

  ngOnInit(): void {
    
  }

  currentYear: number = new Date().getFullYear();
}

