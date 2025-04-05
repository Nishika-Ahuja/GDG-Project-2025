import { Component } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
 userId: string | null = null;

  constructor(private userService: UserService) {}
 
   ngOnInit() {
     this.userService.currentUserId$.subscribe(id => {
       this.userId = id;
     });
   }
}
