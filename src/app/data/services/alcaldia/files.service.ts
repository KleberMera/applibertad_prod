import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilesService {
  private baseUrl = 'http://120.40.73.66:3000/api';

  constructor(private http: HttpClient) { }

  // Obtener archivos de una carpeta específica
  getFiles(path: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/files`, {
      params: { path: path }
    });
  }

  // Obtener archivos de Documents
  getDocuments(tramitePath: string): Observable<any> {
    const documentsPath = `${tramitePath}Documents`;
    return this.getFiles(documentsPath);
  }

  // Obtener archivos de Photos
  getPhotos(tramitePath: string): Observable<any> {
    const photosPath = `${tramitePath}Photos`;
    return this.getFiles(photosPath);
  }

  // Obtener todos los archivos de la carpeta principal
  getAllFiles(tramitePath: string): Observable<any> {
    return this.getFiles(tramitePath);
  }

  // Obtener subcarpetas (Documents y Photos)
  getSubfolders(tramitePath: string): Observable<any> {
    return this.getFiles(tramitePath);
  }
}