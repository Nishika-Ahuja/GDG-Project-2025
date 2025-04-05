import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private router: Router,
    private userService: UserService 
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onLogin() {
    const { email, password } = this.loginForm.value;

    try {
      const userRef = collection(this.firestore, 'registration');
      const q = query(userRef, where('email', '==', email), where('password', '==', password));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userId = userDoc.id;

        this.userService.setUserId(userId); 
      

        this.successMessage = 'Login successful!';
        this.errorMessage = '';

        // Navigate to profile with userId in URL
        this.router.navigate(['/home', userId]);
      } else {
        this.errorMessage = 'Invalid credentials';
        this.successMessage = '';
      }
    } catch (error) {
      console.error('Login error:', error);
      this.errorMessage = 'Something went wrong!';
      this.successMessage = '';
    }
  }
}

