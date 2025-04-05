import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Firestore, doc, onSnapshot, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-quizzes',
  templateUrl: './quizzes.component.html',
  styleUrls: ['./quizzes.component.css']
})
export class QuizzesComponent implements OnInit {
  videoId: string | null = null;
  userId: string | null = null;
  quiz: any[] = [];
  selectedAnswers: { [key: number]: string } = {};
  loading: boolean = true;
  submitted: boolean = false;
  score: number = 0;

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.videoId = this.route.snapshot.paramMap.get('videoId');
    this.userId = this.route.snapshot.queryParamMap.get('userId');

    if (!this.videoId || !this.userId) {
      alert('Missing videoId or userId');
      return;
    }

    const videoId = this.videoId;
    const userDocRef = doc(this.firestore, 'registration', this.userId);

    onSnapshot(userDocRef, (userSnap) => {
      if (userSnap.exists()) {
        const userData = userSnap.data() as any;
        const rawQuizData = userData?.quizzes?.[videoId];

        if (rawQuizData && Array.isArray(rawQuizData.quiz)) {
          this.quiz = rawQuizData.quiz.map((item: any) => ({
            question: item.question,
            answer: item.answer,
            options: item.options ? Object.entries(item.options) : []
          }));
        } else {
          console.warn('Quiz format not found!');
          this.quiz = [];
        }
      } else {
        console.warn('User not found!');
        this.quiz = [];
      }

      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  selectAnswer(questionIndex: number, optionKey: string) {
    this.selectedAnswers[questionIndex] = optionKey;
  }

  async submitQuiz() {
    this.submitted = true;
    let correct = 0;

    this.quiz.forEach((q, i) => {
      if (this.selectedAnswers[i] === q.answer) {
        correct++;
      }
    });

    this.score = correct;

  
    const userDocRef = doc(this.firestore, 'registration', this.userId!);
    await updateDoc(userDocRef, {
      [`quizzes.${this.videoId}.userAnswers`]: this.selectedAnswers,
      [`quizzes.${this.videoId}.score`]: this.score
    });

    console.log('User answers & score updated in Firebase');
  }

  isAllAnswered(): boolean {
  return this.quiz.every((_, index) => this.selectedAnswers.hasOwnProperty(index));
}

}
