import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  menuOpen = false;
  userId: string | null = null;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.currentUserId$.subscribe(id => {
      this.userId = id;
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
