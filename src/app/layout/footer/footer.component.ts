import { Component } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
 userId: string | null = null;

  constructor(private userService: UserService) {}
 
   ngOnInit() {
     this.userService.currentUserId$.subscribe(id => {
       this.userId = id;
     });
   }

}
