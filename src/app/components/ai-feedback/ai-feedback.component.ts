import { Component, Input, OnChanges } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-ai-feedback',
  templateUrl: './ai-feedback.component.html',
  styleUrls: ['./ai-feedback.component.css']
})
export class AiFeedbackComponent implements OnChanges {
  @Input() quizzesData: any[] = [];
  @Input() userId: string = '';
  @Input() videoId: string = '';

  aiFeedback: string = '';
  loading: boolean = false;

  constructor(private http: HttpClient, private firestore: Firestore) {}

  ngOnChanges() {
    if (this.quizzesData.length > 0 && this.userId && this.videoId) {
      this.checkOrGenerateFeedback();
    }
  }

  async checkOrGenerateFeedback() {
    this.loading = true;
    const userDocRef = doc(this.firestore, 'registration', this.userId);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const savedFeedback = userData?.['quizzes']?.[this.videoId]?.['aiFeedback'];

      if (savedFeedback) {
        this.aiFeedback = savedFeedback;
        this.loading = false;
        return;
      } else {
        this.generateAIbasedFeedback(userDocRef);
      }
    } else {
      this.aiFeedback = 'User not found!';
      this.loading = false;
    }
  }

  generateAIbasedFeedback(userDocRef: any) {
    const apiKey = 'AIzaSyD7Fq3CRa1tOAgOgEaKczD9_7d3OCinNGk'; 
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    let inputSummary = 'Give personalized feedback based on the quiz performance below:\n\n';

    this.quizzesData.forEach((quiz, idx) => {
      inputSummary += `Quiz ${idx + 1}:\n`;
      quiz.fullQuiz.forEach((q: any, i: number) => {
        const topic = q.topic || 'General';
        const userAns = quiz.userAnswers[i];
        const correctAns = q.answer;
        inputSummary += `Q: ${q.question}\nTopic: ${topic}\nUser's Answer: ${userAns}\nCorrect Answer: ${correctAns}\n\n`;
      });
    });

    const body = {
      contents: [{
        role: 'user',
        parts: [{
          text: `${inputSummary}
Return a well-structured HTML string that contains feedback on weak topics, strong areas, and suggestions for improvement. Use emojis and bold where suitable. Keep it short and student-friendly.`
        }]
      }]
    };

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.post<any>(url, body, { headers }).subscribe({
      next: async (res) => {
        const feedbackText = res?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        this.aiFeedback = feedbackText?.replace(/<\/?[^>]+(>|$)/g, '') || 'No feedback received from Gemini.';
        this.loading = false;

        // Save to Firebase
        await updateDoc(userDocRef, {
          [`quizzes.${this.videoId}.aiFeedback`]: this.aiFeedback
        });

        console.log('AI feedback saved in Firebase ✅');
      },
      error: (err) => {
        console.error('Gemini Feedback Error:', err);
        this.aiFeedback = '⚠️ Feedback generation failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
