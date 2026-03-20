import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { Evento } from '../models/modelEvent';

@Injectable({
  providedIn: 'root',
})
export class Xano {
  private http = inject(HttpClient);
  private apiUrl = environment.apiXano;

  getData(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.apiUrl+'/tb_kaleusystem');
  }

  addEvent(novoEvento: Partial<Evento>): Observable<Evento> {
  return this.http.post<Evento>(this.apiUrl+'/tb_kaleusystem', novoEvento);
}

  // xano.service.ts
  deleteEvent(id: string | number): Observable<any> {
    return this.http.delete(this.apiUrl+'/tb_kaleusystem/'+id);
  }
}
