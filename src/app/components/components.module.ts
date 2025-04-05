import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { RouterModule } from '@angular/router';
import { ModulesComponent } from './modules/modules.component';
import { QuizzesComponent } from './quizzes/quizzes.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { AiFeedbackComponent } from './ai-feedback/ai-feedback.component';



@NgModule({
  declarations: [
    HomeComponent,
    ModulesComponent,
    QuizzesComponent,
    DashboardComponent,
    ProfileComponent,
    AiFeedbackComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports:[
    HomeComponent
  ]
})
export class ComponentsModule { }
