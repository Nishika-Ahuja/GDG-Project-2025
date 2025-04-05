import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userIdSource = new BehaviorSubject<string | null>(null);
  currentUserId$ = this.userIdSource.asObservable();

  setUserId(id: string) {
    this.userIdSource.next(id);
  }

  getUserId(): string | null {
    return this.userIdSource.getValue();
  }
  
}
