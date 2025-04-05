import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userId: string | null = null;
  quizzesData: any[] = [];
  progressPercentage: number = 0;
  totalModules: number = 10;
  selectedQuiz: any = null;
  expandedFeedbackQuizId: string | null = null;

  constructor(private route: ActivatedRoute, private firestore: Firestore) {}

  async ngOnInit() {
  this.userId = this.route.snapshot.paramMap.get('userId');
  console.log('User ID from route:', this.userId);

  if (!this.userId) {
    alert('User ID missing from route!');
    return;
  }

  const userDocRef = doc(this.firestore, 'registration', this.userId);
  const userSnap = await getDoc(userDocRef);

  if (userSnap.exists()) {
    const userData = userSnap.data() as any;
    const quizzes = userData.quizzes || {};

    // Filter out only attempted quizzes (where userAnswers is not empty)
    this.quizzesData = Object.entries(quizzes)
      .map(([videoId, quizData]: any) => {
        const quizList = quizData.quiz || [];
        const score = quizData.score || 0;
        const userAnswers = quizData.userAnswers || {};

        return {
          videoId,
          score,
          userAnswers,
          totalQuestions: quizList.length,
          percentage: quizList.length > 0 ? Math.round((score / quizList.length) * 100) : 0,
          fullQuiz: quizList // for analysis
        };
      })
      .filter((quiz) => Object.keys(quiz.userAnswers).length > 0); // only attempted quizzes

    const attemptedModules = this.quizzesData.length;
    this.progressPercentage = Math.round((attemptedModules / this.totalModules) * 100);
  } else {
    console.warn('User not found!');
  }
}

viewAnalysis(quiz: any) {
  // If same quiz is clicked again, deselect it (toggle)
  if (this.selectedQuiz && this.selectedQuiz.videoId === quiz.videoId) {
    this.selectedQuiz = null;
    return;
  }

  const fullQuiz = quiz.fullQuiz || [];
  const userAnswers = quiz.userAnswers || {};

  const analysis = fullQuiz.map((q: any, index: number) => {
    return {
      question: q.question,
      correct: q.answer,
      userAnswer: userAnswers[index],
      options: q.options || {}
    };
  });

  this.selectedQuiz = {
    videoId: quiz.videoId,
    analysis
  };
}

toggleFeedback(videoId: string) {
  if (this.expandedFeedbackQuizId === videoId) {
    this.expandedFeedbackQuizId = null;
  } else {
    this.expandedFeedbackQuizId = videoId;
  }
}

}







