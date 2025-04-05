import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignupComponent } from './auth/signup/signup.component';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { ModulesComponent } from './components/modules/modules.component';
import { QuizzesComponent } from './components/quizzes/quizzes.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AuthGuard } from './services/auth.guard';
import { AiFeedbackComponent } from './components/ai-feedback/ai-feedback.component';


const routes: Routes = [
  {
    path:'signup',
    component: SignupComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path:'home/:id',
    component: HomeComponent
  },
  {
    path:'modules/:id',
    component: ModulesComponent,
    canActivate: [AuthGuard] 
  },
  {
    path: 'quizzes/:videoId',
    component: QuizzesComponent,
    
  },
  {
    path:'dashboard/:userId',
    component: DashboardComponent,
    // canActivate: [AuthGuard] 
    
  },
  {
    path: 'feedback',
    component: AiFeedbackComponent
  },
  {
    path: 'profile/:id',
    component: ProfileComponent,
    canActivate: [AuthGuard] 
   
  },
  {
    path:'',
    component: HomeComponent,
    
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
